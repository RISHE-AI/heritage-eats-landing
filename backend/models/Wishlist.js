const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
        unique: true
    },
    productIds: [{
        type: String
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Wishlist', wishlistSchema);
