const DeliveryBoy = require('../models/DeliveryBoy');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');
const { sendOrderDeliveredEmail } = require('../utils/emailService');
const { sendOrderDeliveredWhatsApp } = require('../utils/whatsappService');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id, type: 'delivery' }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register new delivery boy
// @route   POST /api/delivery/register
// @access  Public
const registerDeliveryBoy = async (req, res) => {
  try {
    const { name, email, phone, password, vehicleType, vehicleNumber, area, city, latitude, longitude } = req.body;

    const exists = await DeliveryBoy.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'A delivery partner already exists with this email' });
    }

    const deliveryData = {
      name,
      email,
      phone,
      password,
      vehicleType: vehicleType || 'Bike',
      vehicleNumber,
      area,
      city: city || 'Neemrana',
      status: 'pending'
    };

    if (latitude && longitude) {
      deliveryData.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      };
    }

    const deliveryBoy = await DeliveryBoy.create(deliveryData);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Waiting for admin approval.',
      data: {
        _id: deliveryBoy._id,
        name: deliveryBoy.name,
        email: deliveryBoy.email,
        status: deliveryBoy.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login delivery boy
// @route   POST /api/delivery/login
// @access  Public
const loginDeliveryBoy = async (req, res) => {
  try {
    const { email, password } = req.body;

    const deliveryBoy = await DeliveryBoy.findOne({ email });

    if (!deliveryBoy) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (deliveryBoy.status === 'pending') {
      return res.status(403).json({ message: 'Your account is pending approval. Please wait for admin approval.' });
    }

    if (deliveryBoy.status === 'rejected') {
      return res.status(403).json({ message: 'Your registration was rejected. Contact admin for details.' });
    }

    if (deliveryBoy.status === 'suspended') {
      return res.status(403).json({ message: 'Your account has been suspended. Contact admin.' });
    }

    const isMatch = await deliveryBoy.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: deliveryBoy._id,
      name: deliveryBoy.name,
      email: deliveryBoy.email,
      phone: deliveryBoy.phone,
      area: deliveryBoy.area,
      vehicleType: deliveryBoy.vehicleType,
      isOnline: deliveryBoy.isOnline,
      status: deliveryBoy.status,
      role: 'delivery',
      token: generateToken(deliveryBoy._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get delivery boy profile
// @route   GET /api/delivery/profile
// @access  Private/Delivery
const getDeliveryProfile = async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findById(req.deliveryBoy._id).select('-password');
    res.json(deliveryBoy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle online/offline availability ("Go Online" / "Go Offline")
// @route   PUT /api/delivery/toggle-online
// @access  Private/Delivery
const toggleAvailability = async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findById(req.deliveryBoy._id);
    deliveryBoy.isOnline = !deliveryBoy.isOnline;
    await deliveryBoy.save();

    res.json({
      success: true,
      isOnline: deliveryBoy.isOnline,
      message: deliveryBoy.isOnline ? "You're now Online and can receive orders" : "You're now Offline"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update delivery boy's live location (called periodically from the app)
// @route   PUT /api/delivery/location
// @access  Private/Delivery
const updateMyLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'latitude and longitude are required' });
    }

    const deliveryBoy = await DeliveryBoy.findById(req.deliveryBoy._id);
    deliveryBoy.location = {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)]
    };
    await deliveryBoy.save();

    res.json({ success: true, message: 'Location updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get orders available to accept (unassigned, nearby, online delivery boys only)
// @route   GET /api/delivery/available-orders
// @access  Private/Delivery
const getAvailableOrders = async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findById(req.deliveryBoy._id);

    if (!deliveryBoy.isOnline) {
      return res.json({ success: true, count: 0, data: [], message: 'Go online to see available orders' });
    }

    // Only orders that are placed but not yet picked up by anyone, not
    // delivered/cancelled, AND placed within the last 24 hours - so old
    // stale/leftover orders never clutter the available-orders list
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const unassignedOrders = await Order.find({
      deliveryBoy: null,
      status: { $in: ['Pending', 'Confirmed', 'Processing'] },
      orderDate: { $gte: twentyFourHoursAgo }
    })
      .populate('vendor', 'dairyName phone area city location')
      .populate('user', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    const [myLng, myLat] = deliveryBoy.location.coordinates;
    const hasMyLocation = myLat !== 0 || myLng !== 0;

    let ordersWithDistance = unassignedOrders.map(order => {
      const orderObj = order.toObject();

      const [orderLng, orderLat] = order.deliveryLocation?.coordinates || [0, 0];
      const hasOrderLocation = orderLat !== 0 || orderLng !== 0;

      if (hasMyLocation && hasOrderLocation) {
        const distance = calculateDistance(myLat, myLng, orderLat, orderLng);
        orderObj.distanceFromMe = Math.round(distance * 10) / 10;
      } else {
        orderObj.distanceFromMe = null;
      }

      return orderObj;
    });

    // Show ALL unassigned recent orders — never hide any, just sort
    // nearest-first. (A hard radius cutoff was removed: in small-town/
    // village coverage areas, delivery partners and customers can
    // legitimately be tens of km apart, and hiding those orders made
    // them silently disappear instead of letting the partner decide.)
    ordersWithDistance.sort((a, b) => {
      if (a.distanceFromMe === null) return 1;
      if (b.distanceFromMe === null) return -1;
      return a.distanceFromMe - b.distanceFromMe;
    });

    res.json({ success: true, count: ordersWithDistance.length, data: ordersWithDistance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept an order (first delivery boy to accept gets it - race-safe)
// @route   PUT /api/delivery/orders/:id/accept
// @access  Private/Delivery
const acceptOrder = async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findById(req.deliveryBoy._id);

    if (!deliveryBoy.isOnline) {
      return res.status(400).json({ message: 'You must be online to accept orders' });
    }

    // Atomic update: only succeeds if no one else has claimed it yet.
    // This is what prevents two delivery boys from accepting the same order.
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, deliveryBoy: null },
      {
        deliveryBoy: deliveryBoy._id,
        deliveryBoyAcceptedAt: new Date()
      },
      { new: true }
    );

    if (!order) {
      return res.status(409).json({ message: 'Sorry, this order was already accepted by another delivery partner' });
    }

    order.statusHistory.push({
      status: order.status,
      timestamp: new Date(),
      note: `Accepted by delivery partner ${deliveryBoy.name}`
    });
    await order.save();

    res.json({ success: true, data: order, message: 'Order accepted! Head to the vendor to pick it up.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get orders assigned to this delivery boy
// @route   GET /api/delivery/my-deliveries
// @access  Private/Delivery
const getMyDeliveries = async (req, res) => {
  try {
    const orders = await Order.find({ deliveryBoy: req.deliveryBoy._id })
      .populate('vendor', 'dairyName phone area city')
      .populate('user', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update delivery status for an assigned order (Picked Up -> In Transit -> Delivered)
// @route   PUT /api/delivery/orders/:id/status
// @access  Private/Delivery
const updateDeliveryStatus = async (req, res) => {
  try {
    const { status } = req.body; // expected: 'In Transit' or 'Delivered'

    const order = await Order.findOne({ _id: req.params.id, deliveryBoy: req.deliveryBoy._id })
      .populate('user', 'email firstName lastName');

    if (!order) {
      return res.status(404).json({ message: 'Order not found or not assigned to you' });
    }

    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: `Updated by delivery partner to ${status}`
    });

    if (status === 'Delivered') {
      const deliveryBoy = await DeliveryBoy.findById(req.deliveryBoy._id);
      order.deliveryEarning = deliveryBoy.perDeliveryEarning;

      deliveryBoy.totalDeliveries += 1;
      deliveryBoy.totalEarnings += deliveryBoy.perDeliveryEarning;
      await deliveryBoy.save();
    }

    const updated = await order.save();

    // Send delivered email + WhatsApp (fire-and-forget - never blocks or fails the request)
    if (status === 'Delivered' && order.user?.email) {
      sendOrderDeliveredEmail(order.user.email, updated);
    }
    if (status === 'Delivered' && updated.userPhone) {
      sendOrderDeliveredWhatsApp(updated.userPhone, updated);
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get live tracking data for an order (pickup point, drop point,
//          and delivery boy's current live location) - used to draw the
//          moving route on a map, both by the delivery boy and the customer
// @route   GET /api/delivery/track/:orderId
// @access  Private (customer who owns the order, or the assigned delivery boy)
const trackOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('vendor', 'dairyName location address area city')
      .populate('deliveryBoy', 'name phone vehicleType vehicleNumber location isOnline');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Authorization: only the customer who placed it, or the assigned
    // delivery boy, can pull live tracking for this order
    const isOwningCustomer = req.user && order.user.toString() === req.user._id.toString();
    const isAssignedDelivery = req.deliveryBoy && order.deliveryBoy && order.deliveryBoy._id.toString() === req.deliveryBoy._id.toString();

    if (!isOwningCustomer && !isAssignedDelivery) {
      return res.status(403).json({ message: 'Not authorized to track this order' });
    }

    const pickup = order.vendor && order.vendor.location
      ? { lat: order.vendor.location.coordinates[1], lng: order.vendor.location.coordinates[0], name: order.vendor.dairyName }
      : null;

    const drop = order.deliveryLocation
      ? { lat: order.deliveryLocation.coordinates[1], lng: order.deliveryLocation.coordinates[0], name: order.userAddress }
      : null;

    const deliveryBoyLive = order.deliveryBoy && order.deliveryBoy.location
      ? {
          lat: order.deliveryBoy.location.coordinates[1],
          lng: order.deliveryBoy.location.coordinates[0],
          name: order.deliveryBoy.name,
          phone: order.deliveryBoy.phone,
          vehicleType: order.deliveryBoy.vehicleType,
          vehicleNumber: order.deliveryBoy.vehicleNumber
        }
      : null;

    res.json({
      success: true,
      data: {
        orderStatus: order.status,
        pickup,
        drop,
        deliveryBoy: deliveryBoyLive
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get delivery boy earnings summary
// @route   GET /api/delivery/earnings
// @access  Private/Delivery
const getDeliveryEarnings = async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findById(req.deliveryBoy._id);
    res.json({
      success: true,
      data: {
        totalDeliveries: deliveryBoy.totalDeliveries,
        totalEarnings: deliveryBoy.totalEarnings,
        perDeliveryEarning: deliveryBoy.perDeliveryEarning
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ ADMIN CONTROLLERS ============

// @desc    Get all delivery boys (Admin)
// @route   GET /api/delivery
// @access  Private/Admin
const getAllDeliveryBoys = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const deliveryBoys = await DeliveryBoy.find(filter).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: deliveryBoys.length, data: deliveryBoys });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve/reject/suspend delivery boy (Admin)
// @route   PUT /api/delivery/:id/status
// @access  Private/Admin
const updateDeliveryBoyStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const deliveryBoy = await DeliveryBoy.findById(req.params.id);

    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery partner not found' });
    }

    deliveryBoy.status = status;
    await deliveryBoy.save();

    res.json({ success: true, message: `Delivery partner ${status} successfully`, data: deliveryBoy });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Haversine formula - calculate distance between two GPS coordinates in KM
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

module.exports = {
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
};