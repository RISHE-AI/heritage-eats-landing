const mongoose = require('mongoose');

const stockRequestSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        default: ''
    },
    userName: {
        type: String,
        default: ''
    },
    userPhone: {
        type: String,
        default: ''
    },
    requestedQty: {
        type: Number,
        required: true
    },
    availableQty: {
        type: Number,
        default: 0
    },
    selectedWeight: {
        type: String,
        default: ''
    },
    preference: {
        type: String,
        enum: ['buy_available', 'buy_later', 'bulk'],
        required: true
    },
    notified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('StockRequest', stockRequestSchema);
