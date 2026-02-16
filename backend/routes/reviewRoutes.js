const express = require('express');
const { createReview, getReviews, getAllReviews, deleteReview, approveReview, getProductReviewStats } = require('../controllers/reviewController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .post(createReview)
    .get(getReviews);

// Public stats route
router.get('/stats/:productId', getProductReviewStats);

// Admin routes
router.get('/all', protect, adminOnly, getAllReviews);
router.delete('/:id', protect, adminOnly, deleteReview);
router.put('/:id/approve', protect, adminOnly, approveReview);

module.exports = router;
