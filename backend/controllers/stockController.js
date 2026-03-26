const StockRequest = require('../models/StockRequest');
const Product = require('../models/Product');
const { sendStockRequestEmail } = require('../utils/emailService');

// @desc    Create a stock request (user preference when out of stock)
// @route   POST /api/stock/request
const createStockRequest = async (req, res, next) => {
    try {
        const { productId, productName, userEmail, userName, userPhone, requestedQty, availableQty, selectedWeight, preference } = req.body;

        if (!productId || !preference || !requestedQty) {
            return res.status(400).json({ success: false, message: 'productId, preference, and requestedQty are required' });
        }

        // Save stock request
        const stockRequest = await StockRequest.create({
            productId,
            productName: productName || '',
            userEmail: userEmail || '',
            userName: userName || '',
            userPhone: userPhone || '',
            requestedQty,
            availableQty: availableQty || 0,
            selectedWeight: selectedWeight || '',
            preference
        });

        // If buy_available, reduce stock by availableQty
        if (preference === 'buy_available' && availableQty > 0) {
            const mongoose = require('mongoose');
            const query = mongoose.Types.ObjectId.isValid(productId) 
                ? { $or: [{ id: productId }, { _id: productId }] }
                : { id: productId };
                
            const productToUpdate = await Product.findOne(query);
            if (productToUpdate) {
                productToUpdate.stock = (productToUpdate.stock || 0) - availableQty;
                await productToUpdate.save();
            }
        }

        // Send notification email (non-blocking)
        try {
            await sendStockRequestEmail({
                productName: productName || productId,
                userName: userName || 'Customer',
                userEmail: userEmail || '',
                userPhone: userPhone || '',
                requestedQty,
                availableQty: availableQty || 0,
                selectedWeight: selectedWeight || '',
                preference
            });
        } catch (emailErr) {
            console.error('Stock request email failed (non-blocking):', emailErr.message);
        }

        res.status(201).json({
            success: true,
            data: stockRequest
        });
    } catch (error) {
        console.error('Error creating stock request:', error);
        next(error);
    }
};

// @desc    Check stock for a product
// @route   GET /api/stock/check/:productId
const checkStock = async (req, res, next) => {
    try {
        let product = await Product.findOne({ id: req.params.productId });
        if (!product) {
            const mongoose = require('mongoose');
            if (mongoose.Types.ObjectId.isValid(req.params.productId)) {
                product = await Product.findById(req.params.productId);
            }
        }

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({
            success: true,
            data: {
                productId: product.id || product._id,
                stock: product.stock || 0,
                available: product.available !== false
            }
        });
    } catch (error) {
        console.error('Error checking stock:', error);
        next(error);
    }
};

module.exports = { createStockRequest, checkStock };
