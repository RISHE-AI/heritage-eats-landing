const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Review = require('../models/Review');
const Product = require('../models/Product');

// @desc    Admin login
// @route   POST /api/admin/login
const adminLogin = async (req, res, next) => {
    try {
        const { password } = req.body;
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin@123';

        if (password !== adminPassword) {
            res.status(401);
            throw new Error('Invalid admin password');
        }

        const token = jwt.sign(
            { id: 'admin', isAdmin: true },
            process.env.JWT_SECRET || 'homemade_delights_secret_2024',
            { expiresIn: '24h' }
        );

        res.status(200).json({
            success: true,
            token,
            message: 'Admin login successful'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
const getStats = async (req, res, next) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalCustomers = await Customer.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalReviews = await Review.countDocuments();

        // Time boundaries
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // Today stats
        const todayOrders = await Order.countDocuments({ createdAt: { $gte: todayStart } });
        const todayRevResult = await Order.aggregate([
            { $match: { createdAt: { $gte: todayStart } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const todayRevenue = todayRevResult.length > 0 ? todayRevResult[0].total : 0;

        // This month stats
        const monthOrders = await Order.countDocuments({ createdAt: { $gte: monthStart } });
        const monthRevResult = await Order.aggregate([
            { $match: { createdAt: { $gte: monthStart } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const monthRevenue = monthRevResult.length > 0 ? monthRevResult[0].total : 0;

        // Overall revenue
        const revenueResult = await Order.aggregate([
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Average rating
        const ratingResult = await Review.aggregate([
            { $match: { approved: true } },
            { $group: { _id: null, avg: { $avg: '$rating' } } }
        ]);
        const avgRating = ratingResult.length > 0 ? ratingResult[0].avg.toFixed(1) : '0.0';

        // Monthly chart data (last 6 months)
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthTemplate = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            monthTemplate.push({
                month: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
                year: d.getFullYear(),
                monthNum: d.getMonth() + 1,
                orders: 0,
                revenue: 0
            });
        }

        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        const monthlyData = await Order.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                    orders: { $sum: 1 },
                    revenue: { $sum: '$totalAmount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const monthlyOrders = monthTemplate.map(tmpl => {
            const actual = monthlyData.find(d => d._id.year === tmpl.year && d._id.month === tmpl.monthNum);
            return {
                month: tmpl.month,
                orders: actual ? actual.orders : 0,
                revenue: actual ? actual.revenue : 0
            };
        });

        // Recent orders
        const recentOrders = await Order.find()
            .populate('customer', 'name phone')
            .sort({ createdAt: -1 })
            .limit(5);

        // Top selling products
        const topProducts = await Order.aggregate([
            { $unwind: '$items' },
            { $group: { _id: '$items.productId', totalSold: { $sum: '$items.quantity' }, name: { $first: '$items.name' } } },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);

        // Most reviewed products
        const mostReviewed = await Review.aggregate([
            { $match: { productId: { $ne: '' } } },
            { $group: { _id: '$productId', count: { $sum: 1 }, avgRating: { $avg: '$rating' }, name: { $first: '$productName' } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalOrders,
                totalRevenue,
                totalCustomers,
                totalProducts,
                totalReviews,
                avgRating,
                todayOrders,
                todayRevenue,
                monthOrders,
                monthRevenue,
                monthlyOrders,
                recentOrders,
                topProducts,
                mostReviewed
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get review summary (total, avg, rating breakdown)
// @route   GET /api/admin/reviews/summary
const getReviewSummary = async (req, res, next) => {
    try {
        const totalReviews = await Review.countDocuments();
        const approvedReviews = await Review.countDocuments({ approved: true });

        const ratingResult = await Review.aggregate([
            { $group: { _id: null, avg: { $avg: '$rating' } } }
        ]);
        const avgRating = ratingResult.length > 0 ? ratingResult[0].avg.toFixed(1) : '0.0';

        // Rating breakdown
        const ratingBreakdown = await Review.aggregate([
            { $group: { _id: '$rating', count: { $sum: 1 } } },
            { $sort: { _id: -1 } }
        ]);

        const breakdown = {};
        for (let i = 5; i >= 1; i--) {
            const found = ratingBreakdown.find(r => r._id === i);
            breakdown[i] = found ? found.count : 0;
        }

        res.status(200).json({
            success: true,
            data: {
                totalReviews,
                approvedReviews,
                avgRating,
                ratingBreakdown: breakdown
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get reviews grouped by product and category
// @route   GET /api/admin/reviews/grouped
const getReviewsGrouped = async (req, res, next) => {
    try {
        // Group by product
        const byProduct = await Review.aggregate([
            {
                $group: {
                    _id: '$productId',
                    productName: { $first: '$productName' },
                    category: { $first: '$category' },
                    reviewCount: { $sum: 1 },
                    avgRating: { $avg: '$rating' },
                    reviews: {
                        $push: {
                            _id: '$_id',
                            customerName: '$customerName',
                            rating: '$rating',
                            comment: '$comment',
                            approved: '$approved',
                            createdAt: '$createdAt'
                        }
                    }
                }
            },
            { $sort: { reviewCount: -1 } }
        ]);

        // Group by category
        const byCategory = await Review.aggregate([
            { $match: { category: { $ne: '' } } },
            {
                $group: {
                    _id: '$category',
                    reviewCount: { $sum: 1 },
                    avgRating: { $avg: '$rating' }
                }
            },
            { $sort: { reviewCount: -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                byProduct,
                byCategory
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    adminLogin,
    getStats,
    getReviewSummary,
    getReviewsGrouped
};
