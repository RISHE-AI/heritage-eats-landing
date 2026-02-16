const express = require('express');
const { adminLogin, getStats, getReviewSummary, getReviewsGrouped } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', adminLogin);
router.get('/stats', protect, adminOnly, getStats);
router.get('/reviews/summary', protect, adminOnly, getReviewSummary);
router.get('/reviews/grouped', protect, adminOnly, getReviewsGrouped);

module.exports = router;
