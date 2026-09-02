const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize express app
const app = express();

// =========================
// CORS CONFIGURATION
// =========================
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://milko-bar-dairy.netlify.app',
  'https://milko-bar-dairy-website-git-main-milko-dairy.vercel.app',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin
      // (Postman, mobile apps, server-to-server requests, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Allow exact origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow all Vercel preview/deployment URLs
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      // Allow all Netlify preview/deployment URLs
      if (origin.endsWith('.netlify.app')) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// =========================
// MIDDLEWARE
// =========================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================
// STATIC FILES
// =========================
app.use('/uploads', express.static('uploads'));

// =========================
// IMPORT ROUTES
// =========================
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const vendorRoutes = require('./routes/vendorRoutes');

// =========================
// API ROUTES
// =========================
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/vendors', vendorRoutes);

// =========================
// ROOT ROUTE
// =========================
app.get('/', (req, res) => {
  res.json({
    message: '🥛 Welcome to Milko Bar Dairy API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      reviews: '/api/reviews',
      vendors: '/api/vendors',
    },
  });
});

// =========================
// 404 HANDLER
// =========================
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

// =========================
// ERROR HANDLER
// =========================
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);

  res.status(500).json({
    message: 'Something went wrong!',
    error: err.message,
  });
});

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}`);
  console.log(
    `🌍 Environment: ${process.env.NODE_ENV || 'development'}`
  );
});