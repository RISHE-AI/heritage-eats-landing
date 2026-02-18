const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const path = require('path');

// @desc    Upload a product image
// @route   POST /api/upload/product-image
// @access  Admin
router.post('/product-image', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file provided' });
        }
        // Return the relative path that will be stored in MongoDB
        const filePath = `uploads/products/${req.file.filename}`;
        res.status(200).json({
            success: true,
            data: {
                path: filePath,
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ success: false, message: 'Image upload failed' });
    }
});

module.exports = router;
