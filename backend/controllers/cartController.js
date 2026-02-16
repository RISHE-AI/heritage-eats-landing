const Cart = require('../models/Cart');

// @desc    Get user's cart
// @route   GET /api/cart
const getCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ userId: req.customer._id });
        res.status(200).json({
            success: true,
            data: cart ? cart.items : []
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Sync (replace) user's cart
// @route   POST /api/cart
const syncCart = async (req, res, next) => {
    try {
        const { items } = req.body;

        const cart = await Cart.findOneAndUpdate(
            { userId: req.customer._id },
            { userId: req.customer._id, items: items || [] },
            { upsert: true, new: true }
        );

        res.status(200).json({
            success: true,
            data: cart.items
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Clear user's cart
// @route   DELETE /api/cart
const clearCart = async (req, res, next) => {
    try {
        await Cart.findOneAndUpdate(
            { userId: req.customer._id },
            { items: [] }
        );
        res.status(200).json({ success: true, message: 'Cart cleared' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getCart, syncCart, clearCart };
