const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

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

// @desc    Upload an offer image
// @route   POST /api/upload/offer-image
// @access  Admin
router.post('/offer-image', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file provided' });
        }

        // Ensure offers directory exists
        const offersDir = path.join(__dirname, '../uploads/offers');
        if (!fs.existsSync(offersDir)) {
            fs.mkdirSync(offersDir, { recursive: true });
        }

        // Move file from products/ to offers/
        const oldPath = req.file.path;
        const newFilename = req.file.filename.replace('product-', 'offer-');
        const newPath = path.join(offersDir, newFilename);
        fs.renameSync(oldPath, newPath);

        const filePath = `uploads/offers/${newFilename}`;
        res.status(200).json({
            success: true,
            data: {
                path: filePath,
                filename: newFilename,
                originalName: req.file.originalname,
                size: req.file.size
            }
        });
    } catch (error) {
        console.error('Offer image upload error:', error);
        res.status(500).json({ success: false, message: 'Offer image upload failed' });
    }
});

module.exports = router;
