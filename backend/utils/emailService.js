const nodemailer = require('nodemailer');

const createTransporter = () => {
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
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

const buildEmailHtml = (orderData, isCustomer = false) => {
    const itemsHtml = (orderData.items || []).map(item => `
        <tr>
            <td style="padding: 10px 12px; border-bottom: 1px solid #f0e6d3; font-size: 14px;">${item.name || item.productId}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #f0e6d3; font-size: 14px; text-align: center;">${item.weight || '-'}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #f0e6d3; font-size: 14px; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #f0e6d3; font-size: 14px; text-align: right; font-weight: 600;">₹${item.price || item.unitPrice || 0}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #f0e6d3; font-size: 13px; color: #888; font-style: italic;">${item.customMessage || '-'}</td>
        </tr>
    `).join('');

    const orderDate = orderData.createdAt
        ? new Date(orderData.createdAt).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })
        : new Date().toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' });

    const headerTitle = isCustomer
        ? '🎉 Your Order is Confirmed!'
        : '🛒 New Order Received!';
    const headerSubtitle = isCustomer
        ? 'Thank you for your purchase from Maghizam Homemade Delights'
        : 'Maghizam Homemade Delights — Admin Notification';

    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin: 0; padding: 0; background-color: #f9f5f0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 620px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

            <!-- Header -->
            <div style="background: linear-gradient(135deg, #7B2D00, #C0392B, #E67E22); padding: 32px 24px; text-align: center;">
                <div style="font-size: 36px; margin-bottom: 8px;">🏺</div>
                <h1 style="color: #ffffff; margin: 0 0 6px; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">${headerTitle}</h1>
                <p style="color: #FFD9B3; margin: 0; font-size: 14px;">${headerSubtitle}</p>
            </div>

            <!-- Order Summary Bar -->
            <div style="background: #FFF8F0; padding: 16px 24px; border-bottom: 1px solid #f0e6d3; display: flex; justify-content: space-between;">
                <div style="text-align: center; flex: 1;">
                    <div style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Order ID</div>
                    <div style="font-size: 15px; font-weight: 700; color: #7B2D00;">#${orderData.orderId || '-'}</div>
                </div>
                <div style="width: 1px; background: #f0e6d3; margin: 0 8px;"></div>
                <div style="text-align: center; flex: 1;">
                    <div style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Date</div>
                    <div style="font-size: 13px; font-weight: 600; color: #333;">${orderDate}</div>
                </div>
                <div style="width: 1px; background: #f0e6d3; margin: 0 8px;"></div>
                <div style="text-align: center; flex: 1;">
                    <div style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Status</div>
                    <div style="font-size: 13px; font-weight: 700; color: #27ae60;">✓ ${orderData.paymentStatus || 'Paid'}</div>
                </div>
            </div>

            <!-- Customer Details -->
            <div style="padding: 24px 24px 0;">
                <h3 style="margin: 0 0 14px; font-size: 15px; color: #7B2D00; border-left: 3px solid #E67E22; padding-left: 10px;">Customer Details</h3>
                <table style="width: 100%; border-collapse: collapse; background: #fafafa; border-radius: 8px; overflow: hidden;">
                    <tr>
                        <td style="padding: 9px 14px; font-size: 13px; color: #666; width: 120px; border-bottom: 1px solid #f0e6d3;">👤 Name</td>
                        <td style="padding: 9px 14px; font-size: 13px; font-weight: 600; color: #333; border-bottom: 1px solid #f0e6d3;">${orderData.customerName || '-'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 9px 14px; font-size: 13px; color: #666; border-bottom: 1px solid #f0e6d3;">📱 Phone</td>
                        <td style="padding: 9px 14px; font-size: 13px; font-weight: 600; color: #333; border-bottom: 1px solid #f0e6d3;">${orderData.customerPhone || '-'}</td>
                    </tr>
                    ${orderData.customerEmail ? `
                    <tr>
                        <td style="padding: 9px 14px; font-size: 13px; color: #666; border-bottom: 1px solid #f0e6d3;">✉️ Email</td>
                        <td style="padding: 9px 14px; font-size: 13px; font-weight: 600; color: #333; border-bottom: 1px solid #f0e6d3;">${orderData.customerEmail}</td>
                    </tr>` : ''}
                    <tr>
                        <td style="padding: 9px 14px; font-size: 13px; color: #666;">📍 Address</td>
                        <td style="padding: 9px 14px; font-size: 13px; font-weight: 600; color: #333;">${orderData.customerAddress || '-'}</td>
                    </tr>
                </table>
            </div>

            <!-- Order Items -->
            <div style="padding: 24px 24px 0;">
                <h3 style="margin: 0 0 14px; font-size: 15px; color: #7B2D00; border-left: 3px solid #E67E22; padding-left: 10px;">Order Items</h3>
                <div style="border-radius: 8px; overflow: hidden; border: 1px solid #f0e6d3;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: linear-gradient(135deg, #7B2D00, #C0392B);">
                                <th style="padding: 10px 12px; text-align: left; color: #fff; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Product</th>
                                <th style="padding: 10px 12px; text-align: center; color: #fff; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Weight</th>
                                <th style="padding: 10px 12px; text-align: center; color: #fff; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Qty</th>
                                <th style="padding: 10px 12px; text-align: right; color: #fff; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Price</th>
                                <th style="padding: 10px 12px; text-align: left; color: #fff; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Note</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Total -->
            <div style="padding: 20px 24px;">
                <div style="background: #FFF8F0; border-radius: 10px; padding: 16px 20px; border: 1px solid #f0e6d3;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 5px 0; font-size: 14px; color: #666;">Delivery Charge</td>
                            <td style="padding: 5px 0; font-size: 14px; color: #666; text-align: right;">₹${orderData.deliveryCharge || 0}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0 0; font-size: 18px; font-weight: 700; color: #7B2D00; border-top: 2px solid #E67E22;">Total Amount</td>
                            <td style="padding: 10px 0 0; font-size: 20px; font-weight: 700; color: #7B2D00; text-align: right; border-top: 2px solid #E67E22;">₹${orderData.totalAmount || 0}</td>
                        </tr>
                    </table>
                </div>
            </div>

            <!-- Thank You Message -->
            ${isCustomer ? `
            <div style="padding: 0 24px 20px;">
                <div style="background: linear-gradient(135deg, #e8f5e9, #f1f8e9); border-radius: 10px; padding: 16px 20px; border-left: 4px solid #27ae60; text-align: center;">
                    <p style="margin: 0 0 6px; font-size: 15px; font-weight: 600; color: #1a6b2a;">🙏 Thank you for your order!</p>
                    <p style="margin: 0; font-size: 13px; color: #555;">We'll prepare your items with love and care. You'll receive updates soon.</p>
                </div>
            </div>` : ''}

            <!-- Footer -->
            <div style="background: linear-gradient(135deg, #7B2D00, #C0392B); padding: 20px 24px; text-align: center;">
                <p style="color: #FFD9B3; margin: 0 0 6px; font-size: 14px; font-weight: 600;">Maghizam Homemade Delights</p>
                <p style="color: #FFB380; margin: 0 0 8px; font-size: 12px;">Traditional Recipes, Made with Love 🏺</p>
                <p style="color: #FF8C5A; margin: 0; font-size: 11px;">Thank you for supporting our homemade business</p>
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.15);">
                    <p style="color: #FFD9B3; margin: 0; font-size: 11px;">📧 emailtdhms@gmail.com &nbsp;|&nbsp; 📱 Contact us for any queries</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};

const sendOrderEmail = async (orderData) => {
    try {
        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASS;
        const adminEmail = process.env.ADMIN_EMAIL;
        const apiUrl = process.env.EMAIL_API_URL;
        const customerEmail = orderData.customerEmail;

        // Build recipient list: always include admin, add customer if they have email
        const recipients = adminEmail ? adminEmail.split(',').map(e => e.trim()) : [];
        if (customerEmail && customerEmail.trim() && !recipients.includes(customerEmail.trim())) {
            recipients.push(customerEmail.trim());
        }

        if (recipients.length === 0) {
            console.log('No email recipients configured — skipping notification');
            return;
        }

        const subject = `🛒 Order Confirmed #${orderData.orderId || ''} — ₹${orderData.totalAmount || 0} | Maghizam Homemade Delights`;

        // Option 1: HTTP API Relay (Bypasses SMTP ports)
        if (apiUrl) {
            console.log('📧 Sending email via HTTP API Relay...');
            try {
                const fetch = global.fetch || require('node-fetch');

                // Send to admin (with admin-style header)
                const adminHtml = buildEmailHtml(orderData, false);
                const adminRecipients = adminEmail ? adminEmail.split(',').map(e => e.trim()) : [];

                if (adminRecipients.length > 0) {
                    const adminResponse = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            to: adminRecipients.join(','),
                            subject,
                            htmlBody: adminHtml
                        })
                    });
                    const adminResult = await adminResponse.json();
                    if (adminResult.status === 'success' || adminResponse.ok) {
                        console.log(`✅ Admin order email sent via API Relay to ${adminRecipients.join(', ')}`);
                    } else {
                        console.error('❌ API Relay Error (admin):', adminResult);
                    }
                }

                // Send to customer (with customer-style header)
                if (customerEmail && customerEmail.trim()) {
                    const customerHtml = buildEmailHtml(orderData, true);
                    const customerResponse = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            to: customerEmail.trim(),
                            subject: `🎉 Your Order is Confirmed! #${orderData.orderId || ''} — Maghizam Homemade Delights`,
                            htmlBody: customerHtml
                        })
                    });
                    const customerResult = await customerResponse.json();
                    if (customerResult.status === 'success' || customerResponse.ok) {
                        console.log(`✅ Customer order email sent via API Relay to ${customerEmail}`);
                    } else {
                        console.error('❌ API Relay Error (customer):', customerResult);
                    }
                }
                return;
            } catch (apiError) {
                console.error('❌ API Relay Request Failed:', apiError.message);
                // Fallback to SMTP
            }
        }

        // Option 2: SMTP (Fallback)
        if (!emailUser || !emailPass || emailUser === 'your_gmail@gmail.com') {
            console.log('Email not configured — skipping notification');
            return;
        }

        console.log('📧 Attempting to send via SMTP...');
        const transporter = createTransporter();

        // Send admin email
        const adminRecipients = adminEmail ? adminEmail.split(',').map(e => e.trim()) : [];
        if (adminRecipients.length > 0) {
            await transporter.sendMail({
                from: `"Maghizam Homemade Delights" <${emailUser}>`,
                to: adminRecipients.join(', '),
                subject,
                html: buildEmailHtml(orderData, false)
            });
            console.log(`✅ Admin order email sent to ${adminRecipients.join(', ')}`);
        }

        // Send customer email
        if (customerEmail && customerEmail.trim()) {
            await transporter.sendMail({
                from: `"Maghizam Homemade Delights" <${emailUser}>`,
                to: customerEmail.trim(),
                subject: `🎉 Your Order is Confirmed! #${orderData.orderId || ''} — Maghizam Homemade Delights`,
                html: buildEmailHtml(orderData, true)
            });
            console.log(`✅ Customer order email sent to ${customerEmail}`);
        }

    } catch (error) {
        console.error('❌ Failed to send order email:', error.message);
        if (error.code === 'ETIMEDOUT') {
            console.error('👉 TIP: Your network may be blocking SMTP ports (465/587). Try using the Google Apps Script Relay method.');
        }
        // Do NOT re-throw — order flow must continue
    }
};

module.exports = { sendOrderEmail };
