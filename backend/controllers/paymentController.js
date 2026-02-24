const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Order = require('../models/Order');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
const createRazorpayOrder = async (req, res, next) => {
    try {
        const { amount } = req.body;

        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid amount is required'
            });
        }

        const amountInPaise = Math.round(Number(amount) * 100);

        const options = {
            amount: amountInPaise,
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            notes: {
                platform: 'Heritage Eats'
            }
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                key: process.env.RAZORPAY_KEY_ID
            }
        });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment order. Please try again.'
        });
    }
};

// @desc    Verify Razorpay payment and store records
// @route   POST /api/payment/verify
const verifyPayment = async (req, res, next) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderData
        } = req.body;

        // Verify signature
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed. Invalid signature.'
            });
        }

        // Signature is valid — create the order
        const orderId = `ORD${Date.now().toString(36).toUpperCase()}`;

        let order;
        let customerInfo = null;
        if (orderData) {
            order = await Order.create({
                orderId,
                customer: orderData.customerId || undefined,
                items: orderData.items || [],
                deliveryCharge: orderData.deliveryCharge || 0,
                totalAmount: orderData.totalAmount || orderData.grandTotal,
                paymentMethod: 'razorpay',
                paymentStatus: 'paid',
                orderStatus: 'confirmed'
            });

            // Update product totalSold
            const Product = require('../models/Product');
            for (const item of (orderData.items || [])) {
                if (item.productId) {
                    await Product.findOneAndUpdate(
                        { id: item.productId },
                        { $inc: { totalSold: item.quantity } }
                    );
                }
            }

            // Update customer stats
            if (orderData.customerId) {
                const Customer = require('../models/Customer');
                customerInfo = await Customer.findById(orderData.customerId).select('name phone email address');
                await Customer.findByIdAndUpdate(orderData.customerId, {
                    $inc: {
                        totalOrders: 1,
                        totalSpent: orderData.totalAmount || orderData.grandTotal
                    }
                });
            }


            // Send email notification to admin (non-blocking)
            try {
                const fs = require('fs');
                const path = require('path');
                const { sendOrderEmail } = require('../utils/emailService');
                const emailData = {
                    orderId,
                    customerName: customerInfo?.name || orderData.customerName || '',
                    customerPhone: customerInfo?.phone || orderData.customerPhone || '',
                    customerEmail: customerInfo?.email || orderData.customerEmail || '',
                    customerAddress: customerInfo?.address || orderData.customerAddress || '',
                    items: orderData.items || [],
                    deliveryCharge: orderData.deliveryCharge || 0,
                    totalAmount: orderData.totalAmount || orderData.grandTotal,
                    paymentStatus: 'paid',
                    createdAt: new Date()
                };

                const logMessage = `\n[${new Date().toISOString()}] DEBUG: Attempting to send order email\nPayload: ${JSON.stringify(emailData, null, 2)}\n`;
                fs.appendFileSync(path.join(__dirname, '../debug_email.log'), logMessage);

                console.log('---------------------------------------------------');
                console.log('DEBUG: Attempting to send order email');
                console.log('DEBUG: Email Data Payload:', JSON.stringify(emailData, null, 2));

                sendOrderEmail(emailData);
                console.log('DEBUG: sendOrderEmail function called');
                console.log('---------------------------------------------------');
            } catch (emailError) {
                console.error('DEBUG: Critical error in email sending block:', emailError);
                const fs = require('fs');
                const path = require('path');
                fs.appendFileSync(path.join(__dirname, '../debug_email.log'), `\n[${new Date().toISOString()}] ERROR: ${emailError.message}\n`);
            }

            // Send Telegram notification to admin (non-blocking)
            try {
                const { sendOrderNotification } = require('../services/telegramBot');
                sendOrderNotification({
                    orderId,
                    customerName: customerInfo?.name || orderData.customerName || '',
                    customerPhone: customerInfo?.phone || orderData.customerPhone || '',
                    customerEmail: customerInfo?.email || orderData.customerEmail || '',
                    customerAddress: customerInfo?.address || orderData.customerAddress || '',
                    items: orderData.items || [],
                    deliveryCharge: orderData.deliveryCharge || 0,
                    totalAmount: orderData.totalAmount || orderData.grandTotal,
                    paymentStatus: 'paid'
                });
            } catch (telegramError) {
                console.error('Telegram notification error:', telegramError);
            }

            // Clear user's cart after successful order
            const Cart = require('../models/Cart');
            if (orderData.customerId) {
                await Cart.findOneAndDelete({ userId: orderData.customerId });
            }
        }

        // Create payment record
        const payment = await Payment.create({
            orderId,
            customerId: orderData?.customerId || undefined,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            amount: orderData?.totalAmount || orderData?.grandTotal || 0,
            paymentMethod: 'razorpay',
            paymentStatus: 'success'
        });

        res.status(200).json({
            success: true,
            message: 'Payment verified successfully',
            data: {
                orderId,
                paymentId: payment._id,
                razorpayPaymentId: razorpay_payment_id
            }
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({
            success: false,
            message: 'Payment verification failed. Please contact support.'
        });
    }
};

// @desc    Get all payments (admin)
// @route   GET /api/payments
const getPayments = async (req, res, next) => {
    try {
        const payments = await Payment.find()
            .populate('customerId', 'name phone')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: payments.length,
            data: payments
        });
    } catch (error) {
        console.error('Error fetching payments:', error);
        next(error);
    }
};

module.exports = {
    createRazorpayOrder,
    verifyPayment,
    getPayments
};
