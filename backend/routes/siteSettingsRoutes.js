const express = require('express');
const SiteSettings = require('../models/SiteSettings');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/site-settings — public, returns homepage config
router.get('/', async (req, res) => {
    try {
        const settings = await SiteSettings.getSettings();
        res.json({ success: true, data: settings });
    } catch (error) {
        console.error('Error fetching site settings:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch site settings' });
    }
});

// PUT /api/site-settings — admin only, update settings
router.put('/', protect, adminOnly, async (req, res) => {
    try {
        const settings = await SiteSettings.getSettings();

        const allowed = [
            'offersVisible', 'offers',
            'statsVisible', 'statsAutoCompute', 'stats',
            'galleryVisible', 'gallery'
        ];

        allowed.forEach(key => {
            if (req.body[key] !== undefined) {
                settings[key] = req.body[key];
            }
        });

        await settings.save();
        res.json({ success: true, data: settings });
    } catch (error) {
        console.error('Error updating site settings:', error);
        res.status(500).json({ success: false, message: 'Failed to update site settings' });
    }
});

// GET /api/site-settings/computed-stats — admin only, real DB counts
router.get('/computed-stats', protect, adminOnly, async (req, res) => {
    try {
        const [customerCount, productCount, orderCount] = await Promise.all([
            Customer.countDocuments(),
            Product.countDocuments({ available: true }),
            Order.countDocuments()
        ]);

        // Calculate total items sold
        const salesAgg = await Order.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            { $unwind: '$items' },
            { $group: { _id: null, totalSold: { $sum: '$items.quantity' } } }
        ]);
        const totalSold = salesAgg.length > 0 ? salesAgg[0].totalSold : 0;

        res.json({
            success: true,
            data: {
                customers: customerCount,
                products: productCount,
                orders: orderCount,
                totalSold
            }
        });
    } catch (error) {
        console.error('Error computing stats:', error);
        res.status(500).json({ success: false, message: 'Failed to compute stats' });
    }
});

module.exports = router;
