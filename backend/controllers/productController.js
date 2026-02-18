const Product = require('../models/Product');

// @desc    Get all products (with optional filters)
// @route   GET /api/products
const getProducts = async (req, res, next) => {
    try {
        const { category, search, available } = req.query;
        const filter = {};

        if (category && category !== 'all') {
            filter.category = category;
        }
        if (available !== undefined) {
            filter.available = available === 'true';
        }
        if (search) {
            filter.$or = [
                { name_en: { $regex: search, $options: 'i' } },
                { name_ta: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }

        const products = await Product.find(filter).sort({ category: 1, createdAt: -1 });
        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        next(error);
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findOne({ id: req.params.id }) || await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        next(error);
    }
};

// @desc    Create a new product
// @route   POST /api/products
const createProduct = async (req, res, next) => {
    try {
        const { name_en, category, basePrice } = req.body;

        // Validate required fields
        const errors = [];
        if (!name_en || !name_en.trim()) errors.push('English name (name_en) is required');
        if (!category || !category.trim()) errors.push('Category is required');
        if (basePrice === undefined || basePrice === null || isNaN(Number(basePrice))) {
            errors.push('Base price must be a valid number');
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: errors.join(', '),
                errors
            });
        }

        // Ensure basePrice is a number
        req.body.basePrice = Number(req.body.basePrice);

        // Auto-generate id if not provided
        if (!req.body.id) {
            req.body.id = (req.body.name_en || 'product')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
        }

        // Sanitize images: remove placeholder.svg entries, keep real URLs and upload paths
        if (req.body.images !== undefined) {
            req.body.images = (req.body.images || []).filter(
                img => img && img.trim() !== '' && img !== '/placeholder.svg'
            );
        }

        const product = await Product.create(req.body);
        res.status(201).json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Error creating product:', error);

        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', '),
                errors: messages
            });
        }

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'A product with this ID already exists'
            });
        }

        next(error);
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
const updateProduct = async (req, res, next) => {
    try {
        let product = await Product.findOne({ id: req.params.id });
        if (!product) {
            product = await Product.findById(req.params.id);
        }

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Ensure basePrice is a number if provided
        if (req.body.basePrice !== undefined) {
            req.body.basePrice = Number(req.body.basePrice);
        }

        // Sanitize images: remove placeholder.svg entries, keep real URLs and upload paths
        if (req.body.images !== undefined) {
            req.body.images = (req.body.images || []).filter(
                img => img && img.trim() !== '' && img !== '/placeholder.svg'
            );
        }

        const updated = await Product.findByIdAndUpdate(
            product._id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: updated
        });
    } catch (error) {
        console.error('Error updating product:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', '),
                errors: messages
            });
        }

        next(error);
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
    try {
        let product = await Product.findOne({ id: req.params.id });
        if (!product) {
            product = await Product.findById(req.params.id);
        }

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        await Product.findByIdAndDelete(product._id);

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        next(error);
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
