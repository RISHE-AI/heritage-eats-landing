const nodemailer = require('nodemailer');

const createTransporter = () => {
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,       // use STARTTLS on port 587
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000
    });
};

const sendOrderEmail = async (orderData) => {
    try {
        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASS;
        const adminEmail = process.env.ADMIN_EMAIL;
        const apiUrl = process.env.EMAIL_API_URL;

        // Construct HTML email content
        const itemsHtml = (orderData.items || []).map(item => `
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name || item.productId}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.weight || '-'}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price || item.unitPrice || 0}</td>
                ${item.customMessage ? `<td style="padding: 8px; border-bottom: 1px solid #eee; font-style: italic; color: #666;">${item.customMessage}</td>` : '<td style="padding: 8px; border-bottom: 1px solid #eee;">-</td>'}
            </tr>
        `).join('');

        const orderDate = orderData.createdAt
            ? new Date(orderData.createdAt).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })
            : new Date().toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' });

        const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #8B4513, #D2691E); padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">🛒 New Order Received!</h1>
                <p style="color: #FFE4C4; margin: 5px 0 0;">Heritage Eats - Homemade Delights</p>
            </div>

            <div style="background: #fff; padding: 20px; border: 1px solid #eee; border-top: none;">
                <table style="width: 100%; margin-bottom: 15px;">
                    <tr>
                        <td style="padding: 5px 0;"><strong>Order ID:</strong></td>
                        <td style="padding: 5px 0;">${orderData.orderId || '-'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0;"><strong>Customer:</strong></td>
                        <td style="padding: 5px 0;">${orderData.customerName || '-'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0;"><strong>Phone:</strong></td>
                        <td style="padding: 5px 0;">${orderData.customerPhone || '-'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0;"><strong>Address:</strong></td>
                        <td style="padding: 5px 0;">${orderData.customerAddress || '-'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0;"><strong>Date:</strong></td>
                        <td style="padding: 5px 0;">${orderDate}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0;"><strong>Payment:</strong></td>
                        <td style="padding: 5px 0; color: green; font-weight: bold;">${orderData.paymentStatus || 'paid'}</td>
                    </tr>
                </table>

                <h3 style="border-bottom: 2px solid #8B4513; padding-bottom: 5px; color: #8B4513;">Order Items</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #FFF8F0;">
                            <th style="padding: 8px; text-align: left;">Product</th>
                            <th style="padding: 8px; text-align: left;">Weight</th>
                            <th style="padding: 8px; text-align: center;">Qty</th>
                            <th style="padding: 8px; text-align: right;">Price</th>
                            <th style="padding: 8px; text-align: left;">Note</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <div style="margin-top: 15px; padding: 15px; background: #FFF8F0; border-radius: 8px;">
                    <table style="width: 100%;">
                        <tr>
                            <td style="padding: 4px 0;">Delivery Charge:</td>
                            <td style="padding: 4px 0; text-align: right;">₹${orderData.deliveryCharge || 0}</td>
                        </tr>
                        <tr style="font-size: 18px; font-weight: bold; color: #8B4513;">
                            <td style="padding: 8px 0; border-top: 2px solid #8B4513;">Total Amount:</td>
                            <td style="padding: 8px 0; border-top: 2px solid #8B4513; text-align: right;">₹${orderData.totalAmount || 0}</td>
                        </tr>
                    </table>
                </div>
            </div>

            <div style="background: #8B4513; padding: 10px; border-radius: 0 0 12px 12px; text-align: center;">
                <p style="color: #FFE4C4; margin: 0; font-size: 12px;">This is an automated notification from Heritage Eats</p>
            </div>
        </div>
        `;

        // Option 1: HTTP API Relay (Bypasses SMTP ports)
        if (apiUrl) {
            console.log('📧 Sending email via HTTP API Relay...');
            try {
                // Use built-in fetch if available (Node 18+)
                const fetch = global.fetch || require('node-fetch');
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: adminEmail,
                        subject: `🛒 New Order #${orderData.orderId || ''} — ₹${orderData.totalAmount || 0}`,
                        htmlBody: html
                    })
                });

                const result = await response.json();
                if (result.status === 'success' || response.ok) {
                    console.log(`✅ Order email sent via API Relay to ${adminEmail}`);
                    return;
                } else {
                    console.error('❌ API Relay Error:', result);
                    // Fallback to SMTP if API fails
                }
            } catch (apiError) {
                console.error('❌ API Relay Request Failed:', apiError.message);
                // Fallback to SMTP
            }
        }

        // Option 2: SMTP (Fallback)
        if (!emailUser || !emailPass || !adminEmail || emailUser === 'your_gmail@gmail.com') {
            console.log('Email not configured — skipping notification');
            return;
        }

        console.log('📧 Attempting to send via SMTP...');
        const transporter = createTransporter();
        await transporter.sendMail({
            from: `"Heritage Eats" <${emailUser}>`,
            to: adminEmail,
            subject: `🛒 New Order #${orderData.orderId || ''} — ₹${orderData.totalAmount || 0}`,
            html
        });

        console.log(`✅ Order email sent to ${adminEmail} for order ${orderData.orderId}`);
    } catch (error) {
        console.error('❌ Failed to send order email:', error.message);
        if (error.code === 'ETIMEDOUT') {
            console.error('👉 TIP: Your network may be blocking SMTP ports (465/587). Try using the Google Apps Script Relay method.');
        }
    }
};

module.exports = { sendOrderEmail };
