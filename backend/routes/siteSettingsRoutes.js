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
            'galleryVisible', 'gallery',
            'defaultTheme', 'enabledThemes'
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

// ─── COUNTDOWN TIMER ENDPOINTS ───

// GET /api/site-settings/countdown — public, returns countdown data
router.get('/countdown', async (req, res) => {
    try {
        const settings = await SiteSettings.getSettings();
        const now = new Date();
        const endDate = settings.countdownOfferEndDate;
        const isExpired = !endDate || new Date(endDate) <= now;

        res.json({
            success: true,
            data: {
                enabled: settings.countdownEnabled && !isExpired,
                offerEndDate: settings.countdownOfferEndDate,
                offerTitle: settings.countdownOfferTitle,
                offerTitleTa: settings.countdownOfferTitleTa,
                offerDescription: settings.countdownOfferDescription,
                isExpired,
                createdAt: settings.countdownCreatedAt
            }
        });
    } catch (error) {
        console.error('Error fetching countdown:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch countdown' });
    }
});

// POST /api/site-settings/countdown — admin only, set countdown
router.post('/countdown', protect, adminOnly, async (req, res) => {
    try {
        const { days, title, titleTa, description } = req.body;

        if (!days || days <= 0 || days > 365) {
            return res.status(400).json({
                success: false,
                message: 'Duration must be between 1 and 365 days'
            });
        }

        const settings = await SiteSettings.getSettings();
        const now = new Date();
        const endDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));

        settings.countdownEnabled = true;
        settings.countdownOfferEndDate = endDate;
        settings.countdownCreatedAt = now;

        if (title !== undefined) settings.countdownOfferTitle = title;
        if (titleTa !== undefined) settings.countdownOfferTitleTa = titleTa;
        if (description !== undefined) settings.countdownOfferDescription = description;

        await settings.save();

        res.json({
            success: true,
            data: {
                enabled: true,
                offerEndDate: endDate,
                offerTitle: settings.countdownOfferTitle,
                offerTitleTa: settings.countdownOfferTitleTa,
                offerDescription: settings.countdownOfferDescription,
                createdAt: now
            },
            message: `Countdown set for ${days} days. Ends on ${endDate.toISOString()}`
        });
    } catch (error) {
        console.error('Error setting countdown:', error);
        res.status(500).json({ success: false, message: 'Failed to set countdown' });
    }
});

// DELETE /api/site-settings/countdown — admin only, disable countdown
router.delete('/countdown', protect, adminOnly, async (req, res) => {
    try {
        const settings = await SiteSettings.getSettings();
        settings.countdownEnabled = false;
        settings.countdownOfferEndDate = null;
        settings.countdownCreatedAt = null;
        await settings.save();

        res.json({ success: true, message: 'Countdown disabled' });
    } catch (error) {
        console.error('Error disabling countdown:', error);
        res.status(500).json({ success: false, message: 'Failed to disable countdown' });
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
