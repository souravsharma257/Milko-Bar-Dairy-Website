const express = require('express');
const router = express.Router();
const {
  getProducts,        // ← Ye sahi naam hai
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductPrice
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', getProducts);              // ← Ye sahi hai
router.get('/:id', getProductById);

// Admin only routes
router.post('/', protect, admin, upload.single('productImage'), createProduct);
router.put('/:id', protect, admin, upload.single('productImage'), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.patch('/:id/price', protect, admin, updateProductPrice);

module.exports = router;