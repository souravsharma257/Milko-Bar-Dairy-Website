const User = require('../models/User');
const Order = require('../models/Order');
const Review = require('../models/Review');

// @desc    Get complete customer account data
// @route   GET /api/account
// @access  Private
const getCustomerAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    const [user, orders, reviews] = await Promise.all([
      User.findById(userId).select('-password'),

      Order.find({ user: userId })
        .populate('vendor', 'dairyName phone whatsapp area city')
        .populate(
          'deliveryBoy',
          'name phone email vehicleType vehicleNumber'
        )
        .sort({ createdAt: -1 }),

      Review.find({ user: userId })
        .populate('product', 'name image price unit category')
        .sort({ createdAt: -1 })
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Customer account not found'
      });
    }

    // Delivered orders
    const deliveredOrders = orders.filter(
      order => order.status === 'Delivered'
    ).length;

    // Active orders
    const activeOrders = orders.filter(
      order =>
        !['Delivered', 'Cancelled'].includes(order.status)
    ).length;

    // Total amount spent
    const totalSpent = orders
      .filter(order => order.status !== 'Cancelled')
      .reduce(
        (sum, order) => sum + Number(order.total || 0),
        0
      );

    res.json({
      success: true,

      data: {
        // =========================
        // CUSTOMER PROFILE
        // =========================
        profile: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: `${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: user.phone,
          address: user.address,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },

        // =========================
        // ACCOUNT STATS
        // =========================
        stats: {
          totalOrders: orders.length,
          activeOrders,
          deliveredOrders,
          totalReviews: reviews.length,
          totalSpent
        },

        // =========================
        // ORDER HISTORY
        // =========================
        orders,

        // =========================
        // MY REVIEWS
        // =========================
        reviews
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getCustomerAccount
};