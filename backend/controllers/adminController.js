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
// @route   GET /api/admin/stats?startDate=...&endDate=...
const getStats = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const now = new Date();

        // Build date filter when query params exist
        let dateFilter = {};
        let isFiltered = false;
        let filterStart, filterEnd;

        if (startDate) {
            filterStart = new Date(startDate);
            filterStart.setHours(0, 0, 0, 0);
            filterEnd = endDate ? new Date(endDate) : new Date();
            filterEnd.setHours(23, 59, 59, 999);
            dateFilter = { createdAt: { $gte: filterStart, $lte: filterEnd } };
            isFiltered = true;
        }

        // --- Counts (filtered or all-time) ---
        const totalOrders = await Order.countDocuments(isFiltered ? dateFilter : {});
        const totalCustomers = await Customer.countDocuments(isFiltered ? dateFilter : {});
        const totalProducts = await Product.countDocuments(); // products aren't time-filtered
        const totalReviews = await Review.countDocuments(isFiltered ? dateFilter : {});

        // --- Revenue (filtered or all-time) — only count paid orders ---
        const revMatchFilter = isFiltered
            ? { paymentStatus: 'paid', ...dateFilter }
            : { paymentStatus: 'paid' };
        const revenueResult = await Order.aggregate([
            { $match: revMatchFilter },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // --- Today / Month stats (only when NOT custom-filtered) ---
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        let todayOrders = 0, todayRevenue = 0, monthOrders = 0, monthRevenue = 0;

        if (!isFiltered) {
            todayOrders = await Order.countDocuments({ createdAt: { $gte: todayStart } });
            const todayRevResult = await Order.aggregate([
                { $match: { createdAt: { $gte: todayStart }, paymentStatus: 'paid' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]);
            todayRevenue = todayRevResult.length > 0 ? todayRevResult[0].total : 0;

            monthOrders = await Order.countDocuments({ createdAt: { $gte: monthStart } });
            const monthRevResult = await Order.aggregate([
                { $match: { createdAt: { $gte: monthStart }, paymentStatus: 'paid' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]);
            monthRevenue = monthRevResult.length > 0 ? monthRevResult[0].total : 0;
        }

        // --- Average rating (filtered or all approved) ---
        const ratingMatch = isFiltered
            ? { $match: { approved: true, ...dateFilter } }
            : { $match: { approved: true } };
        const ratingResult = await Review.aggregate([
            ratingMatch,
            { $group: { _id: null, avg: { $avg: '$rating' } } }
        ]);
        const avgRating = ratingResult.length > 0 ? ratingResult[0].avg.toFixed(1) : '0.0';

        // --- Monthly chart data ---
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        let monthlyOrders;
        if (isFiltered) {
            // Build chart buckets spanning the selected range
            const chartStart = new Date(filterStart.getFullYear(), filterStart.getMonth(), 1);
            const chartEnd = new Date(filterEnd.getFullYear(), filterEnd.getMonth() + 1, 0);
            const template = [];
            const cur = new Date(chartStart);
            while (cur <= chartEnd) {
                template.push({
                    month: `${monthNames[cur.getMonth()]} ${cur.getFullYear()}`,
                    year: cur.getFullYear(),
                    monthNum: cur.getMonth() + 1,
                    orders: 0,
                    revenue: 0
                });
                cur.setMonth(cur.getMonth() + 1);
            }
            const chartData = await Order.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                        orders: { $sum: 1 },
                        revenue: { $sum: '$totalAmount' }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]);
            monthlyOrders = template.map(tmpl => {
                const actual = chartData.find(d => d._id.year === tmpl.year && d._id.month === tmpl.monthNum);
                return { month: tmpl.month, orders: actual ? actual.orders : 0, revenue: actual ? actual.revenue : 0 };
            });
        } else {
            // Default: last 6 months
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
            monthlyOrders = monthTemplate.map(tmpl => {
                const actual = monthlyData.find(d => d._id.year === tmpl.year && d._id.month === tmpl.monthNum);
                return { month: tmpl.month, orders: actual ? actual.orders : 0, revenue: actual ? actual.revenue : 0 };
            });
        }

        // --- Recent orders (filtered or all) ---
        const recentOrders = await Order.find(isFiltered ? dateFilter : {})
            .populate('customer', 'name phone')
            .sort({ createdAt: -1 })
            .limit(5);

        // --- Top selling products (filtered or all) ---
        const topPipeline = isFiltered
            ? [{ $match: dateFilter }, { $unwind: '$items' }]
            : [{ $unwind: '$items' }];
        topPipeline.push(
            { $group: { _id: '$items.productId', totalSold: { $sum: '$items.quantity' }, name: { $first: '$items.name' } } },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        );
        const topProducts = await Order.aggregate(topPipeline);

        // --- Most reviewed products (filtered or all) ---
        const reviewMatch = isFiltered
            ? { $match: { productId: { $ne: '' }, ...dateFilter } }
            : { $match: { productId: { $ne: '' } } };
        const mostReviewed = await Review.aggregate([
            reviewMatch,
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
                mostReviewed,
                isFiltered,
                filterRange: isFiltered ? { start: filterStart, end: filterEnd } : null
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
