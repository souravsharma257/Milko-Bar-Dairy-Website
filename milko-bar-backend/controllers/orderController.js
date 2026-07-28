const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendOrderConfirmation, sendOrderStatusUpdate } = require('../config/emailService');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { items, total, paymentMethod, userName, userPhone, userAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Verify stock availability
    for (let item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.name} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }
    }

    // Create order with initial status history
    const order = await Order.create({
      user: req.user._id,
      userName,
      userPhone,
      userAddress,
      items,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === 'Online' ? 'Pending' : 'Pending',
      status: 'Pending',
      statusHistory: [{
        status: 'Pending',
        timestamp: new Date(),
        note: 'Order placed successfully'
      }]
    });

    // Update product stock
    for (let item of items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Send order confirmation email
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
      console.error('Email sending failed, but order created:', emailError);
    }

    res.status(201).json({
      success: true,
      data: order,
      message: 'Order placed successfully! Check your email for confirmation.'
    });
  } catch (error) {
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
        order.estimatedDelivery = new Date(now.getTime() + (2 * 60 * 60 * 1000)); // 2 hours
      } else if (status === 'Processing') {
        const now = new Date();
        order.estimatedDelivery = new Date(now.getTime() + (90 * 60 * 1000)); // 90 minutes
      } else if (status === 'In Transit') {
        const now = new Date();
        order.estimatedDelivery = new Date(now.getTime() + (30 * 60 * 1000)); // 30 minutes
      }
      
      const updatedOrder = await order.save();

      // Send status update email (if email service enabled)
      /* Uncomment when email is setup
      try {
        await sendOrderStatusUpdate({
          userName: `${order.user.firstName} ${order.user.lastName}`,
          email: order.user.email,
          orderId: order._id.toString().slice(-6),
          status: status
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }
      */

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