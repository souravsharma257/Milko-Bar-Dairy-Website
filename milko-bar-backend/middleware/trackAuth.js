const jwt = require('jsonwebtoken');
const User = require('../models/User');
const DeliveryBoy = require('../models/DeliveryBoy');

// Allows EITHER a logged-in customer OR a delivery boy to pass through.
// Sets req.user (customer) or req.deliveryBoy depending on the token type.
// Used for shared routes like live order tracking, where both sides need access.
const protectCustomerOrDelivery = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.type === 'delivery') {
        const deliveryBoy = await DeliveryBoy.findById(decoded.id).select('-password');
        if (!deliveryBoy) {
          return res.status(401).json({ message: 'Delivery partner not found' });
        }
        req.deliveryBoy = deliveryBoy;
        return next();
      }

      // Default: treat as a customer token (matches existing `protect` middleware behavior)
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      req.user = user;
      next();
    } catch (error) {
      console.error('Track auth error:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protectCustomerOrDelivery };