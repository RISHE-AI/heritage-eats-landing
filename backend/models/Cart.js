const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    name: { type: String, required: true },
    nameTa: { type: String, default: '' },
    image: { type: String, default: '' },
    weight: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    customMessage: { type: String, default: '' }
}, { _id: false });

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
        unique: true
    },
    items: [cartItemSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('Cart', cartSchema);
