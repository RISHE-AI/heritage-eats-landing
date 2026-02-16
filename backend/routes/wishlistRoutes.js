const express = require('express');
const { getWishlist, addToWishlist, removeFromWishlist, syncWishlist } = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getWishlist);
router.post('/', protect, addToWishlist);
router.put('/', protect, syncWishlist);
router.delete('/:productId', protect, removeFromWishlist);

module.exports = router;
