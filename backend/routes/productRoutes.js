const express = require('express');
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct, updateStock } = require('../controllers/productController');

const router = express.Router();

router.route('/')
    .get(getProducts)
    .post(createProduct);

router.route('/:id')
    .get(getProductById)
    .put(updateProduct)
    .delete(deleteProduct);

router.patch('/:id/stock', updateStock);

module.exports = router;

