const express = require('express');
const { createRazorpayOrder, verifyPayment, getPayments } = require('../controllers/paymentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes (called from checkout)
router.post('/create-order', createRazorpayOrder);
router.post('/verify', verifyPayment);

// Admin routes
router.get('/', protect, adminOnly, getPayments);

module.exports = router;
