require('dotenv').config();
const { sendOrderEmail } = require('./utils/emailService');

console.log('Testing email service...');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL);
console.log('EMAIL_API_URL:', process.env.EMAIL_API_URL);

const mockOrderData = {
    orderId: 'TEST_ORDER_123',
    customerName: 'Test User',
    customerPhone: '1234567890',
    customerAddress: '123 Test St, Test City',
    items: [
        { name: 'Test Product', weight: '500g', quantity: 1, price: 100 }
    ],
    deliveryCharge: 50,
    totalAmount: 150,
    createdAt: new Date()
};

sendOrderEmail(mockOrderData)
    .then(() => console.log('Test completed via function call'))
    .catch(err => console.error('Test failed:', err));
