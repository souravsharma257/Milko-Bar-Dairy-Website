const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 LOGIN REQUEST RECEIVED');
    console.log('📧 Email:', email);

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password required'
      });
    }

    const user = await User.findOne({ email });

    console.log('👤 User found:', !!user);

    if (user) {
      console.log('👤 User email:', user.email);
      console.log('👑 User role:', user.role);
    }

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const isMatch = await user.matchPassword(password);

    console.log('🔑 Password match:', isMatch);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    console.log('✅ LOGIN SUCCESS');

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      token: generateToken(user._id)
    });

  } catch (error) {
    console.error('❌ LOGIN ERROR:', error);
    res.status(500).json({
      message: error.message
    });
  }
};