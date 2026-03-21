const express = require('express');
const router = express.Router();
const { sendBulkOrder } = require('../controllers/emailController');

// @route   POST /api/email/bulk-order
// @desc    Send bulk order email to admin
// @access  Public
router.post('/bulk-order', sendBulkOrder);

module.exports = router;
