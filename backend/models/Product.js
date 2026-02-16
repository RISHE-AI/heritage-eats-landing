const mongoose = require('mongoose');

const weightOptionSchema = new mongoose.Schema({
    weight: { type: String, required: true },
    price: { type: Number, required: true },
    unit: { type: String, default: 'g' }
}, { _id: false });

const productSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        trim: true
    },
    name_en: {
        type: String,
        required: [true, 'English name is required'],
        trim: true
    },
    name_ta: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
        enum: ['sweets', 'snacks', 'pickles', 'malts', 'podi']
    },
    description_en: {
        type: String,
        trim: true,
        default: ''
    },
    description_ta: {
        type: String,
        trim: true,
        default: ''
    },
    basePrice: {
        type: Number,
        required: [true, 'Base price is required'],
        min: 0
    },
    weightOptions: {
        type: [weightOptionSchema],
        default: []
    },
    images: {
        type: [String],
        default: ['/placeholder.svg']
    },
    ingredients_en: {
        type: [String],
        default: []
    },
    ingredients_ta: {
        type: [String],
        default: []
    },
    benefits_en: {
        type: [String],
        default: []
    },
    benefits_ta: {
        type: [String],
        default: []
    },
    storage_en: {
        type: String,
        trim: true,
        default: ''
    },
    storage_ta: {
        type: String,
        trim: true,
        default: ''
    },
    shelfLife: {
        type: String,
        trim: true,
        default: ''
    },
    available: {
        type: Boolean,
        default: true
    },
    temporarilyUnavailable: {
        type: Boolean,
        default: false
    },
    badge: {
        type: String,
        enum: [null, 'new', 'hot', 'top-seller', 'limited', 'custom'],
        default: null
    },
    totalSold: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
