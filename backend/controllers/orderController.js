const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

// @desc    Create a new order
// @route   POST /api/orders
const createOrder = async (req, res, next) => {
    try {
        const { customer, items, deliveryCharge, totalAmount, paymentMethod, paymentStatus } = req.body;

        // Generate human-readable order ID
        const orderId = `ORD${Date.now().toString(36).toUpperCase()}`;

        const order = await Order.create({
            orderId,
            customer,
            items,
            deliveryCharge: deliveryCharge || 0,
            totalAmount,
            paymentMethod: paymentMethod || 'upi',
            paymentStatus: paymentStatus || 'pending'
        });

        // Update product totalSold
        for (const item of items) {
            if (item.productId) {
                await Product.findOneAndUpdate(
                    { id: item.productId },
                    { $inc: { totalSold: item.quantity } }
                );
            }
        }

        // Update customer totalOrders and totalSpent
        if (customer) {
            await Customer.findByIdAndUpdate(customer, {
                $inc: {
                    totalOrders: 1,
                    totalSpent: totalAmount
                }
            });
        }

        // Populate customer info and return
        const populatedOrder = await Order.findById(order._id).populate('customer', 'name phone email address');

        res.status(201).json({
            success: true,
            data: populatedOrder
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
const getOrders = async (req, res, next) => {
    try {
        const { status, paymentStatus } = req.query;
        const filter = {};

        if (status) filter.orderStatus = status;
        if (paymentStatus) filter.paymentStatus = paymentStatus;

        const orders = await Order.find(filter)
            .populate('customer', 'name phone address email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
const getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findOne({ orderId: req.params.id })
            .populate('customer', 'name phone email address')
            || await Order.findById(req.params.id)
                .populate('customer', 'name phone email address');

        if (!order) {
            res.status(404);
            throw new Error('Order not found');
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get orders for logged-in customer
// @route   GET /api/orders/my-orders
const getCustomerOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ customer: req.customer._id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
const updateOrderStatus = async (req, res, next) => {
    try {
        const { orderStatus, paymentStatus } = req.body;

        let order = await Order.findOne({ orderId: req.params.id });
        if (!order) {
            order = await Order.findById(req.params.id);
        }

        if (!order) {
            res.status(404);
            throw new Error('Order not found');
        }

        if (orderStatus) order.orderStatus = orderStatus;
        if (paymentStatus) order.paymentStatus = paymentStatus;

        await order.save();

        const updated = await Order.findById(order._id).populate('customer', 'name phone address email');

        res.status(200).json({
            success: true,
            data: updated
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    getCustomerOrders,
    updateOrderStatus
};
