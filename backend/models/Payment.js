const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: [true, 'Order ID is required']
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    razorpayOrderId: {
        type: String,
        trim: true,
        default: ''
    },
    razorpayPaymentId: {
        type: String,
        trim: true,
        default: ''
    },
    razorpaySignature: {
        type: String,
        trim: true,
        default: ''
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: 0
    },
    paymentMethod: {
        type: String,
        enum: ['razorpay'],
        default: 'razorpay'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'success', 'failed', 'refunded'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
