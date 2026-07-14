const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id, type: 'vendor' }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register new vendor
// @route   POST /api/vendors/register
// @access  Public
const registerVendor = async (req, res) => {
  try {
    const { dairyName, ownerName, email, phone, whatsapp, password, address, area, city, pincode } = req.body;

    const vendorExists = await Vendor.findOne({ email });
    if (vendorExists) {
      return res.status(400).json({ message: 'Vendor already exists with this email' });
    }

    const vendor = await Vendor.create({
      dairyName,
      ownerName,
      email,
      phone,
      whatsapp: whatsapp || phone,
      password,
      address,
      area,
      city: city || 'Neemrana',
      pincode,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Waiting for admin approval.',
      data: {
        _id: vendor._id,
        dairyName: vendor.dairyName,
        ownerName: vendor.ownerName,
        email: vendor.email,
        status: vendor.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login vendor
// @route   POST /api/vendors/login
// @access  Public
const loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const vendor = await Vendor.findOne({ email });

    if (!vendor) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (vendor.status === 'pending') {
      return res.status(403).json({ message: 'Your account is pending approval. Please wait for admin approval.' });
    }

    if (vendor.status === 'rejected') {
      return res.status(403).json({ message: 'Your registration was rejected. Contact admin for details.' });
    }

    if (vendor.status === 'suspended') {
      return res.status(403).json({ message: 'Your account has been suspended. Contact admin.' });
    }

    const isMatch = await vendor.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: vendor._id,
      dairyName: vendor.dairyName,
      ownerName: vendor.ownerName,
      email: vendor.email,
      phone: vendor.phone,
      area: vendor.area,
      status: vendor.status,
      role: 'vendor',
      token: generateToken(vendor._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get vendor profile
// @route   GET /api/vendors/profile
// @access  Private/Vendor
const getVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendor._id).select('-password');
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get vendor's own products
// @route   GET /api/vendors/products
// @access  Private/Vendor
const getVendorProducts = async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.vendor._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create product (by vendor)
// @route   POST /api/vendors/products
// @access  Private/Vendor
const createVendorProduct = async (req, res) => {
  try {
    const { name, category, price, unit, image, stock } = req.body;

    const product = await Product.create({
      vendor: req.vendor._id,
      name,
      category,
      price,
      unit,
      image: image || '🥛',
      stock: stock || 0
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update vendor's own product
// @route   PUT /api/vendors/products/:id
// @access  Private/Vendor
const updateVendorProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, vendor: req.vendor._id });

    if (!product) {
      return res.status(404).json({ message: 'Product not found or not yours' });
    }

    product.name = req.body.name || product.name;
    product.category = req.body.category || product.category;
    product.price = req.body.price !== undefined ? req.body.price : product.price;
    product.unit = req.body.unit || product.unit;
    product.image = req.body.image || product.image;
    product.stock = req.body.stock !== undefined ? req.body.stock : product.stock;

    const updated = await product.save();
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete vendor's own product
// @route   DELETE /api/vendors/products/:id
// @access  Private/Vendor
const deleteVendorProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, vendor: req.vendor._id });

    if (!product) {
      return res.status(404).json({ message: 'Product not found or not yours' });
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get vendor's orders
// @route   GET /api/vendors/orders
// @access  Private/Vendor
const getVendorOrders = async (req, res) => {
  try {
    const orders = await Order.find({ vendor: req.vendor._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status (by vendor)
// @route   PUT /api/vendors/orders/:id/status
// @access  Private/Vendor
const updateVendorOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findOne({ _id: req.params.id, vendor: req.vendor._id });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or not yours' });
    }

    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: `Updated by vendor to ${status}`
    });

    const updated = await order.save();
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get vendor earnings summary
// @route   GET /api/vendors/earnings
// @access  Private/Vendor
const getVendorEarnings = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendor._id);
    const orders = await Order.find({ vendor: req.vendor._id, status: 'Delivered' });

    const totalEarning = orders.reduce((sum, o) => sum + (o.vendorEarning || 0), 0);

    res.json({
      success: true,
      data: {
        totalOrders: orders.length,
        totalEarning,
        commissionRate: vendor.commissionRate
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ ADMIN CONTROLLERS ============

// @desc    Get all vendors (Admin)
// @route   GET /api/vendors
// @access  Private/Admin
const getAllVendors = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const vendors = await Vendor.find(filter).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: vendors.length, data: vendors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve/reject vendor (Admin)
// @route   PUT /api/vendors/:id/status
// @access  Private/Admin
const updateVendorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    vendor.status = status;
    await vendor.save();

    res.json({ success: true, message: `Vendor ${status} successfully`, data: vendor });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
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
};