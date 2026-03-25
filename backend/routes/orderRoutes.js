const express = require('express');
const { createOrder, getOrders, getOrderById, getCustomerOrders, updateOrderStatus, markAsPaid, getCodStats } = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .post(createOrder)
    .get(protect, adminOnly, getOrders);

// Customer's own orders (must be before /:id to avoid conflict)
router.get('/my-orders', protect, getCustomerOrders);

// COD stats (must be before /:id to avoid conflict)
router.get('/cod-stats', protect, adminOnly, getCodStats);

router.route('/:id')
    .get(getOrderById);

router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.put('/:id/mark-paid', protect, adminOnly, markAsPaid);

module.exports = router;
