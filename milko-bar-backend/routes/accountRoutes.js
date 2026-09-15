const express = require('express');

const router = express.Router();

const {
  getCustomerAccount
} = require('../controllers/accountController');

const { protect } = require('../middleware/auth');

// =========================
// CUSTOMER ACCOUNT
// =========================

// Login required
router.get('/', protect, getCustomerAccount);

module.exports = router;