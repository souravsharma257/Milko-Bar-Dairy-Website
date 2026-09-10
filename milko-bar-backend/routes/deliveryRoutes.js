const express = require('express');
const router = express.Router();
const {
  registerDeliveryBoy,
  loginDeliveryBoy,
  getDeliveryProfile,
  toggleAvailability,
  updateMyLocation,
  getAvailableOrders,
  acceptOrder,
  getMyDeliveries,
  updateDeliveryStatus,
  trackOrder,
  getDeliveryEarnings,
  getAllDeliveryBoys,
  updateDeliveryBoyStatus
} = require('../controllers/deliveryController');
const { protectDelivery } = require('../middleware/deliveryAuth');
const { protectCustomerOrDelivery } = require('../middleware/trackAuth');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.post('/register', registerDeliveryBoy);
router.post('/login', loginDeliveryBoy);

// Delivery boy protected routes
router.get('/profile', protectDelivery, getDeliveryProfile);
router.put('/toggle-online', protectDelivery, toggleAvailability);
router.put('/location', protectDelivery, updateMyLocation);
router.get('/available-orders', protectDelivery, getAvailableOrders);
router.put('/orders/:id/accept', protectDelivery, acceptOrder);
router.get('/my-deliveries', protectDelivery, getMyDeliveries);
router.put('/orders/:id/status', protectDelivery, updateDeliveryStatus);
router.get('/earnings', protectDelivery, getDeliveryEarnings);

// Shared route - accessible by either the customer who placed the order
// OR the delivery boy assigned to it (used for the live tracking map)
router.get('/track/:orderId', protectCustomerOrDelivery, trackOrder);

// Admin routes (manage delivery boys)
router.get('/', protect, admin, getAllDeliveryBoys);
router.put('/:id/status', protect, admin, updateDeliveryBoyStatus);

module.exports = router;