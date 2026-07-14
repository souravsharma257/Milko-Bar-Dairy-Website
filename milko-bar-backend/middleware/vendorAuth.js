const jwt = require('jsonwebtoken');
const Vendor = require('../models/Vendor');

// Protect vendor routes
const protectVendor = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.vendor = await Vendor.findById(decoded.id).select('-password');

      if (!req.vendor) {
        return res.status(401).json({ message: 'Not authorized, vendor not found' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protectVendor };