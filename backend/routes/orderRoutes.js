const express = require('express');
const { createOrder, getOrders, getOrderById, getCustomerOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .post(createOrder)
    .get(protect, adminOnly, getOrders);

// Customer's own orders (must be before /:id to avoid conflict)
router.get('/my-orders', protect, getCustomerOrders);

router.route('/:id')
    .get(getOrderById);

router.put('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;
