const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userPhone: {
    type: String,
    required: true
  },
  userAddress: {
    type: String,
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    image: String
  }],
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['COD', 'Online']
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'In Transit', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Processing', 'In Transit', 'Delivered', 'Cancelled'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      default: ''
    }
  }],
  estimatedDelivery: {
    type: Date,
    default: function() {
      // Default: 2 hours from now
      const now = new Date();
      return new Date(now.getTime() + (2 * 60 * 60 * 1000));
    }
  },
  orderDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
orderSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Order', orderSchema);