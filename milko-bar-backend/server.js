const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db');
const { testEmailConnection } = require('./config/emailService');
// const { testWhatsAppConnection } = require('./config/whatsappService');
const reviewRoutes = require('./routes/reviewRoutes'); 
// const authRoutes = require('./routes/authRoutes');

// Load environment variables with explicit path
dotenv.config({ path: path.join(__dirname, '.env') });

// Debug - Check if env variables are loaded
console.log('📧 Email User:', process.env.EMAIL_USER ? '✅ Loaded' : '❌ Missing');
console.log('🔑 Email Pass:', process.env.EMAIL_PASS ? '✅ Loaded' : '❌ Missing');

// Connect to database
connectDB();

// Test email connection after a small delay to ensure all modules are loaded
setTimeout(() => {
  testEmailConnection();
  // testSMSConnection();
}, 1000);

// Initialize express app
const app = express();

// Middleware
app.use(cors()); // Allow React to connect
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files (uploaded images)
app.use('/uploads', express.static('uploads'));


// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes); 

// Root route
app.get('/', (req, res) => {
  res.json({
    message: '🥛 Welcome to Milko Bar Dairy API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});