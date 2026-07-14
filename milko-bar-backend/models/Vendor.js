const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const vendorSchema = new mongoose.Schema({
  // Basic Info
  dairyName: {
    type: String,
    required: [true, 'Dairy name is required'],
    trim: true
  },
  ownerName: {
    type: String,
    required: [true, 'Owner name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  whatsapp: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },

  // Location
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  area: {
    type: String,
    required: [true, 'Area is required'],
    trim: true
  },
  city: {
    type: String,
    default: 'Neemrana',
    trim: true
  },
  pincode: {
    type: String,
    trim: true
  },
  deliveryRadius: {
    type: Number,
    default: 5 // km
  },

  // Business Info
  description: {
    type: String,
    trim: true
  },
  openTime: {
    type: String,
    default: '06:00'
  },
  closeTime: {
    type: String,
    default: '20:00'
  },

  // Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  isActive: {
    type: Boolean,
    default: true
  },

  // Commission
  commissionRate: {
    type: Number,
    default: 10 // 10% commission
  },

  // Stats
  totalOrders: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  totalCommissionPaid: {
    type: Number,
    default: 0
  },

  // Role
  role: {
    type: String,
    default: 'vendor'
  }
}, {
  timestamps: true
});

// Password hash karo save se pehle
vendorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password compare method
vendorSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Vendor', vendorSchema);