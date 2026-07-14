const express = require('express');
const router = express.Router();
const {
  registerVendor,
  loginVendor,
  getVendorProfile,
  getVendorProducts,
  createVendorProduct,
  updateVendorProduct,
  deleteVendorProduct,
  getVendorOrders,
  updateVendorOrderStatus,
  getVendorEarnings,
  getAllVendors,
  updateVendorStatus
} = require('../controllers/vendorController');
const { protectVendor } = require('../middleware/vendorAuth');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.post('/register', registerVendor);
router.post('/login', loginVendor);

// Vendor protected routes
router.get('/profile', protectVendor, getVendorProfile);
router.get('/products', protectVendor, getVendorProducts);
router.post('/products', protectVendor, createVendorProduct);
router.put('/products/:id', protectVendor, updateVendorProduct);
router.delete('/products/:id', protectVendor, deleteVendorProduct);
router.get('/orders', protectVendor, getVendorOrders);
router.put('/orders/:id/status', protectVendor, updateVendorOrderStatus);
router.get('/earnings', protectVendor, getVendorEarnings);

// Admin routes (manage vendors)
router.get('/', protect, admin, getAllVendors);
router.put('/:id/status', protect, admin, updateVendorStatus);

module.exports = router;