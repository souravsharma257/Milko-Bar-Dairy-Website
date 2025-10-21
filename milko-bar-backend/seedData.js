const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');

// Load env variables
dotenv.config();

// Initial Products Data
const products = [
  // Milk Category
  { name: 'Full Cream Milk', category: 'Milk', price: 65, unit: '1L', image: '🥛', stock: 100 },
  { name: 'Toned Milk', category: 'Milk', price: 55, unit: '1L', image: '🥛', stock: 100 },
  { name: 'Double Toned Milk', category: 'Milk', price: 50, unit: '1L', image: '🥛', stock: 100 },
  { name: 'Full Cream Milk', category: 'Milk', price: 35, unit: '500ml', image: '🥛', stock: 100 },
  
  // Dahi/Curd Category
  { name: 'Plain Dahi', category: 'Dahi', price: 40, unit: '400g', image: '🥣', stock: 50 },
  { name: 'Mishti Doi', category: 'Dahi', price: 60, unit: '400g', image: '🥣', stock: 50 },
  { name: 'Plain Dahi', category: 'Dahi', price: 90, unit: '1kg', image: '🥣', stock: 50 },
  
  // Paneer Category
  { name: 'Fresh Paneer', category: 'Paneer', price: 90, unit: '250g', image: '🧈', stock: 40 },
  { name: 'Fresh Paneer', category: 'Paneer', price: 170, unit: '500g', image: '🧈', stock: 40 },
  { name: 'Fresh Paneer', category: 'Paneer', price: 320, unit: '1kg', image: '🧈', stock: 40 },
  
  // Butter/Ghee Category
  { name: 'White Butter', category: 'Butter', price: 80, unit: '250g', image: '🧈', stock: 60 },
  { name: 'Pure Ghee', category: 'Ghee', price: 550, unit: '500g', image: '🫙', stock: 30 },
  { name: 'Pure Ghee', category: 'Ghee', price: 1050, unit: '1kg', image: '🫙', stock: 30 },
  
  // Lassi/Buttermilk Category
  { name: 'Sweet Lassi', category: 'Lassi', price: 30, unit: '200ml', image: '🥤', stock: 70 },
  { name: 'Salted Lassi', category: 'Lassi', price: 30, unit: '200ml', image: '🥤', stock: 70 },
  { name: 'Chaas', category: 'Buttermilk', price: 25, unit: '200ml', image: '🥤', stock: 70 },
  
  // Ice Cream Category
  { name: 'Vanilla Ice Cream', category: 'Ice Cream', price: 40, unit: '100ml', image: '🍨', stock: 80 },
  { name: 'Chocolate Ice Cream', category: 'Ice Cream', price: 45, unit: '100ml', image: '🍨', stock: 80 },
  { name: 'Mango Ice Cream', category: 'Ice Cream', price: 280, unit: '1L', image: '🍨', stock: 40 },
];

// Admin User
const adminUser = {
  firstName: 'Admin',
  lastName: 'Milko',
  email: 'admin@milko.com',
  phone: '9358634955',
  address: 'Shahjahanpur, Rajasthan',
  password: 'admin123',
  role: 'admin'
};

// Import Data
const importData = async () => {
  try {
    // Connect to database using existing function
    await connectDB();

    console.log('\n🔄 Starting data import...\n');

    // Clear existing data
    await Product.deleteMany();
    await User.deleteMany();
    console.log('🗑️  Old data cleared');

    // Insert products
    const createdProducts = await Product.insertMany(products);
    console.log(`✅ ${createdProducts.length} Products imported`);

    // Insert admin user
    const admin = await User.create(adminUser);
    console.log('✅ Admin user created');
    
    console.log('\n📋 Admin Credentials:');
    console.log('📧 Email: admin@milko.com');
    console.log('🔑 Password: admin123');
    console.log('\n🎉 Data import completed successfully!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Destroy Data
const destroyData = async () => {
  try {
    await connectDB();

    await Product.deleteMany();
    await User.deleteMany();

    console.log('🗑️  All data destroyed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Check command line arguments
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}