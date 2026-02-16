const express = require('express');
const { signup, login, getProfile, updateProfile, getCustomers, createCustomer } = require('../controllers/customerController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes (logged-in customer)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Admin routes
router.route('/')
    .get(protect, adminOnly, getCustomers)
    .post(createCustomer);

module.exports = router;
