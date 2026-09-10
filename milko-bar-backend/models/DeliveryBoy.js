const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const deliveryBoySchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: [true, 'Name is required'],
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
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },

  // Vehicle Info
  vehicleType: {
    type: String,
    enum: ['Bike', 'Scooter', 'Bicycle', 'Cycle', 'Other'],
    default: 'Bike'
  },
  vehicleNumber: {
    type: String,
    trim: true
  },

  // Location
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
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude] - last known live location
      default: [0, 0]
    }
  },
  serviceRadius: {
    type: Number,
    default: 8 // km - how far this delivery boy is willing to accept orders from
  },

  // Availability - toggled by the delivery boy themself ("Go Online"/"Go Offline")
  isOnline: {
    type: Boolean,
    default: false
  },

  // Status - controlled by Admin (like Vendor approval flow)
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  isActive: {
    type: Boolean,
    default: true
  },

  // Stats
  totalDeliveries: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  perDeliveryEarning: {
    type: Number,
    default: 25 // flat ₹25 per delivery, adjustable by admin later
  },

  // Role
  role: {
    type: String,
    default: 'delivery'
  }
}, {
  timestamps: true
});

// Password hash karo save se pehle
deliveryBoySchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Geospatial index for "find nearby delivery boys" / "find nearby orders" queries
deliveryBoySchema.index({ location: '2dsphere' });

// Password compare method
deliveryBoySchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('DeliveryBoy', deliveryBoySchema);