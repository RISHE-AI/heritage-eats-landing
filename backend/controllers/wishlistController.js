const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// Helper to get full products from wishlist
const getWishlistProducts = async (userId) => {
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist || !wishlist.productIds.length) return [];

    // Fetch full product details for IDs in wishlist
    const products = await Product.find({ id: { $in: wishlist.productIds } });
    return products;
};

// @desc    Get user's wishlist
// @route   GET /api/wishlist
const getWishlist = async (req, res, next) => {
    try {
        const products = await getWishlistProducts(req.customer._id);
        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist
const addToWishlist = async (req, res, next) => {
    try {
        const { productId } = req.body;
        if (!productId) {
            return res.status(400).json({ success: false, message: 'productId is required' });
        }

        await Wishlist.findOneAndUpdate(
            { userId: req.customer._id },
            { $addToSet: { productIds: productId } },
            { upsert: true, new: true }
        );

        const products = await getWishlistProducts(req.customer._id);
        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
const removeFromWishlist = async (req, res, next) => {
    try {
        const { productId } = req.params;

        await Wishlist.findOneAndUpdate(
            { userId: req.customer._id },
            { $pull: { productIds: productId } },
            { new: true }
        );

        const products = await getWishlistProducts(req.customer._id);
        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Sync full wishlist (replace)
// @route   PUT /api/wishlist
const syncWishlist = async (req, res, next) => {
    try {
        const { productIds } = req.body;

        await Wishlist.findOneAndUpdate(
            { userId: req.customer._id },
            { userId: req.customer._id, productIds: productIds || [] },
            { upsert: true, new: true }
        );

        const products = await getWishlistProducts(req.customer._id);
        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist, syncWishlist };
