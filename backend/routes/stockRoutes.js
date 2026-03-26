const express = require('express');
const router = express.Router();
const { createStockRequest, checkStock } = require('../controllers/stockController');

// POST /api/stock/request — create stock request
router.post('/request', createStockRequest);

// GET /api/stock/check/:productId — check product stock
router.get('/check/:productId', checkStock);

module.exports = router;
