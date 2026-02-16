const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    weight: {
        type: String
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    },
    customMessage: {
        type: String,
        trim: true,
        default: ''
    }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: [true, 'Customer reference is required']
    },
    items: {
        type: [orderItemSchema],
        required: [true, 'Order items are required'],
        validate: {
            validator: function (v) {
                return v && v.length > 0;
            },
            message: 'Order must have at least one item'
        }
    },
    deliveryCharge: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required']
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['razorpay'],
        default: 'razorpay'
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
