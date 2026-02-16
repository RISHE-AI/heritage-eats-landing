const express = require('express');
const { getCart, syncCart, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getCart);
router.post('/', protect, syncCart);
router.delete('/', protect, clearCart);

module.exports = router;
