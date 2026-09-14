const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const resetAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const newPassword = 'Admin@12345';

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const admin = await User.findOne({
      email: 'admin@milko.com'
    });

    if (!admin) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }

    admin.password = hashedPassword;
    admin.role = 'admin';

    await admin.save();

    console.log('✅ Admin password reset successfully');
    console.log('Email: admin@milko.com');
    console.log('Password: Admin@12345');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

resetAdminPassword();