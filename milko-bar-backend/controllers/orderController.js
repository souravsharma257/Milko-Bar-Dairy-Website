const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendOrderConfirmation, sendOrderStatusUpdate } = require('../config/emailService');
const { sendOrderConfirmationSMS, sendOrderStatusUpdateSMS } = require('../config/smsService');



/// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { items, total, paymentMethod, userName, userPhone, userAddress } = req.body;

    console.log('Creating order with data:', { items, total, paymentMethod, userName });

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Create order
    const order = await Order.create({
      user: req.user._id,
      userName,
      userPhone,
      userAddress,
      items,
      total,
      paymentMethod,
      paymentStatus: 'Pending',
      status: 'Pending'
    });

    console.log('Order created successfully:', order._id);

    // Send email
    try {
      await sendOrderConfirmation({
        userName: userName,
        email: req.user.email,
        orderId: order._id.toString().slice(-6),
        items: items,
        total: total,
        paymentMethod: paymentMethod,
        userAddress: userAddress,
        userPhone: userPhone
      });
    } catch (emailError) {
      console.error('Email error:', emailError);
    }

    res.status(201).json({
      success: true,
      data: order,
      message: 'Order placed successfully!'
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email phone');

    if (order) {
      // Check if user owns this order or is admin
      if (order.user._id.toString() === req.user._id.toString() || req.user.role === 'admin') {
        res.json(order);
      } else {
        res.status(403).json({ message: 'Not authorized to view this order' });
      }
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    const order = await Order.findById(req.params.id).populate('user', 'email firstName lastName');

    if (order) {
      // Add to status history
      order.statusHistory.push({
        status: status,
        timestamp: new Date(),
        note: note || `Order status updated to ${status}`
      });
      
      order.status = status;
      
      // Update estimated delivery if status changes
      if (status === 'Confirmed') {
        const now = new Date();
        order.estimatedDelivery = new Date(now.getTime() + (2 * 60 * 60 * 1000));
      } else if (status === 'Processing') {
        const now = new Date();
        order.estimatedDelivery = new Date(now.getTime() + (90 * 60 * 1000));
      } else if (status === 'In Transit') {
        const now = new Date();
        order.estimatedDelivery = new Date(now.getTime() + (30 * 60 * 1000));
      }
      
      const updatedOrder = await order.save();

      const orderId = order._id.toString().slice(-6);
      const userName = `${order.user.firstName} ${order.user.lastName}`;

      // Send notifications - Don't block response
      if (typeof sendOrderStatusUpdate === 'function') {
        sendOrderStatusUpdate({
          userName: userName,
          email: order.user.email,
          orderId: orderId,
          status: status
        }).catch(err => console.error('Email failed:', err.message));
      }

      if (typeof sendOrderStatusUpdateSMS === 'function') {
        sendOrderStatusUpdateSMS({
          userPhone: order.userPhone,
          userName: order.userName,
          orderId: orderId,
          status: status
        }).catch(err => console.error('SMS failed:', err.message));
      }

      if (typeof sendOrderStatusUpdateWhatsApp === 'function') {
        sendOrderStatusUpdateWhatsApp({
          userPhone: order.userPhone,
          userName: order.userName,
          orderId: orderId,
          status: status
        }).catch(err => console.error('WhatsApp failed:', err.message));
      }

      res.json({
        success: true,
        data: updatedOrder,
        message: 'Order status updated!'
      });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update payment status
// @route   PUT /api/orders/:id/payment
// @access  Private/Admin
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (order) {
      order.paymentStatus = paymentStatus;
      const updatedOrder = await order.save();

      res.json({
        success: true,
        data: updatedOrder
      });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      await order.deleteOne();
      res.json({ message: 'Order deleted successfully' });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder
};