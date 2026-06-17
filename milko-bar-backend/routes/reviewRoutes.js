const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createReview,
  getProductReviews,
  getMyReviews,      // ← getUserReviews se change kiya
  updateReview,
  deleteReview,
  voteReview,        // ← Add kiya
  canReviewProduct   // ← Add kiya
} = require('../controllers/reviewController');

// Public routes
router.get('/product/:productId', getProductReviews);

// Protected routes
router.post('/', protect, createReview);
router.get('/myreviews', protect, getMyReviews);        // ← Fix kiya
router.get('/can-review/:productId', protect, canReviewProduct); // ← Add kiya
router.put('/:id', protect, updateReview);
router.put('/:id/vote', protect, voteReview);           // ← Add kiya
router.delete('/:id', protect, deleteReview);

module.exports = router;