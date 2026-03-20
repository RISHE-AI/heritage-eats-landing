const express = require('express');
const rateLimit = require('express-rate-limit');
const { sendMessage } = require('../controllers/chatController');
const { optionalProtect } = require('../middleware/authMiddleware');

const router = express.Router();

// Rate limit: 30 requests per minute per IP
const chatLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    message: { success: false, message: 'Too many requests. Please wait a moment.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/', chatLimiter, optionalProtect, sendMessage);

module.exports = router;
