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

        const resolvedPaymentMethod = paymentMethod || 'cod';
        const resolvedPaymentStatus = paymentStatus || (resolvedPaymentMethod === 'cod' ? 'pending' : 'paid');

        const order = await Order.create({
            orderId,
            customer,
            items,
            deliveryCharge: deliveryCharge || 0,
            totalAmount,
            paymentMethod: resolvedPaymentMethod,
            paymentStatus: resolvedPaymentStatus,
            paidAt: resolvedPaymentStatus === 'paid' ? new Date() : null
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
        const { status, paymentStatus, paymentFilter } = req.query;
        const filter = {};

        if (status) filter.orderStatus = status;
        if (paymentStatus) filter.paymentStatus = paymentStatus;

        // COD-specific filters
        if (paymentFilter === 'cod_pending') {
            filter.paymentMethod = 'cod';
            filter.paymentStatus = 'pending';
        } else if (paymentFilter === 'cod_paid') {
            filter.paymentMethod = 'cod';
            filter.paymentStatus = 'paid';
        }

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

// @desc    Mark COD order as paid (admin only)
// @route   PUT /api/orders/:id/mark-paid
const markAsPaid = async (req, res, next) => {
    try {
        let order = await Order.findOne({ orderId: req.params.id });
        if (!order) {
            order = await Order.findById(req.params.id);
        }

        if (!order) {
            res.status(404);
            throw new Error('Order not found');
        }

        if (order.paymentMethod !== 'cod') {
            res.status(400);
            throw new Error('Only COD orders can be marked as paid');
        }

        if (order.paymentStatus === 'paid') {
            res.status(400);
            throw new Error('Order is already marked as paid');
        }

        order.paymentStatus = 'paid';
        order.paidAt = new Date();
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

// @desc    Get COD statistics (admin only)
// @route   GET /api/orders/cod-stats
const getCodStats = async (req, res, next) => {
    try {
        const pendingResult = await Order.aggregate([
            { $match: { paymentMethod: 'cod', paymentStatus: 'pending' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
        ]);

        const collectedResult = await Order.aggregate([
            { $match: { paymentMethod: 'cod', paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                pending: {
                    amount: pendingResult.length > 0 ? pendingResult[0].total : 0,
                    count: pendingResult.length > 0 ? pendingResult[0].count : 0
                },
                collected: {
                    amount: collectedResult.length > 0 ? collectedResult[0].total : 0,
                    count: collectedResult.length > 0 ? collectedResult[0].count : 0
                }
            }
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
    updateOrderStatus,
    markAsPaid,
    getCodStats
};
