const Review = require('../models/Review');

// @desc    Create a new review
// @route   POST /api/reviews
const createReview = async (req, res, next) => {
    try {
        const review = await Review.create(req.body);
        res.status(201).json({
            success: true,
            data: review
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get approved reviews (public, with optional productId filter)
// @route   GET /api/reviews
const getReviews = async (req, res, next) => {
    try {
        const filter = { approved: true };
        if (req.query.productId) {
            filter.productId = req.query.productId;
        }

        const reviews = await Review.find(filter).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get ALL reviews (admin)
// @route   GET /api/reviews/all
const getAllReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
const deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) {
            res.status(404);
            throw new Error('Review not found');
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle review approval
// @route   PUT /api/reviews/:id/approve
const approveReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            res.status(404);
            throw new Error('Review not found');
        }

        review.approved = !review.approved;
        await review.save();

        res.status(200).json({
            success: true,
            data: review
        });
    } catch (error) {
        next(error);
    }
};
// @desc    Get review stats for a product
// @route   GET /api/reviews/stats/:productId
const getProductReviewStats = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const reviews = await Review.find({ productId, approved: true });
        const reviewCount = reviews.length;
        const averageRating = reviewCount > 0
            ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
            : 0;

        res.status(200).json({
            success: true,
            data: { reviewCount, averageRating }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createReview,
    getReviews,
    getAllReviews,
    deleteReview,
    approveReview,
    getProductReviewStats
};
