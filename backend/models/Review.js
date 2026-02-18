const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    productId: {
        type: String,
        trim: true,
        default: ''
    },
    productName: {
        type: String,
        trim: true,
        default: ''
    },
    category: {
        type: String,
        trim: true,
        default: ''
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    customerName: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['product', 'overall'],
        default: 'product'
    },
    reviewImage: {
        type: String,
        default: ''
    },
    approved: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Prevent duplicate reviews: one review per user per product
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Review', reviewSchema);
