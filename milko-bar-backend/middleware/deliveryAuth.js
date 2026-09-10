const jwt = require('jsonwebtoken');
const DeliveryBoy = require('../models/DeliveryBoy');

// Protect delivery boy routes - verifies JWT and attaches req.deliveryBoy
const protectDelivery = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.type !== 'delivery') {
        return res.status(401).json({ message: 'Not authorized as a delivery partner' });
      }

      const deliveryBoy = await DeliveryBoy.findById(decoded.id).select('-password');

      if (!deliveryBoy) {
        return res.status(401).json({ message: 'Delivery partner not found' });
      }

      req.deliveryBoy = deliveryBoy;
      next();
    } catch (error) {
      console.error('Delivery auth error:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protectDelivery };