const TelegramBot = require('node-telegram-bot-api');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Review = require('../models/Review');
const fs = require('fs');
const path = require('path');

const token = process.env.TELEGRAM_BOT_TOKEN;
let bot = null;
let pollingErrors = 0;

// Helper to escape Markdown special characters
const escapeMarkdown = (text) => {
    if (!text) return '';
    return String(text).replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
};

// ─── Initialize Bot ─────────────────────────────────────────────────────────
function initBot() {
    if (!token) {
        console.log('⚠️  TELEGRAM_BOT_TOKEN not set. Telegram bot disabled.');
        return;
    }

    const requestOptions = {
        // Force IPv4 to avoid some IPv6 timeout issues on certain networks
        family: 4,
        // Keep logs clean
        polling: true
    };

    // If you have a proxy, you can set it here or via env
    // if (process.env.HTTPS_PROXY) {
    //     const Agent = require('https-proxy-agent');
    //     requestOptions.agent = new Agent(process.env.HTTPS_PROXY);
    // }

    bot = new TelegramBot(token, {
        polling: {
            interval: 1000,
            autoStart: true,
            params: {
                timeout: 10
            }
        },
        request: requestOptions
    });

    const logPath = path.join(__dirname, '../bot_debug.log');
    const log = (msg) => {
        const timestamp = new Date().toISOString();
        try {
            fs.appendFileSync(logPath, `[${timestamp}] ${msg}\n`);
        } catch (e) { console.error('Error writing to bot log:', e); }
    };

    log('Bot initialized, starting polling...');
    console.log('🤖 Telegram bot started...');

    bot.on('polling_error', (error) => {
        pollingErrors++;
        const errorCode = error.code || 'UNKNOWN';
        const errorMessage = error.message || 'No message';

        console.error(`⚠️ Telegram Polling Error (${pollingErrors}): ${errorCode} - ${errorMessage}`);
        log(`POLLING ERROR: ${errorCode} - ${errorMessage}`);

        // If we hit a lot of errors, we don't just stop. We rely on the library to retry,
        // but we log it. We might want to restart polling if it stops completely,
        // but node-telegram-bot-api usually handles retries.
        // However, if we get 'EFATAL', it might kill the polling loop.

        if (error.code === 'EFATAL' || pollingErrors > 100) {
            console.log('🔄 excessive errors or fatal error. Restarting polling in 5 seconds...');
            bot.stopPolling().then(() => {
                setTimeout(() => {
                    console.log('🔄 Restarting Telegram polling...');
                    pollingErrors = 0;
                    bot.startPolling();
                }, 5000);
            });
        }
    });

    bot.on('message', (msg) => {
        log(`RECEIVED MESSAGE: ${JSON.stringify(msg)}`);
        pollingErrors = 0; // Reset error count on successful message
    });

    // Register command handlers

    // Register command handlers
    bot.onText(/\/start/, handleStart);
    bot.onText(/\/help/, handleHelp);
    bot.onText(/\/stats/, handleStats);
    bot.onText(/\/recent/, handleRecent);
    bot.onText(/\/order (.+)/, handleOrderDetail);
    bot.onText(/\/status (.+) (.+)/, handleUpdateStatus);
    bot.onText(/\/products/, handleProducts);
}

// ─── /start ─────────────────────────────────────────────────────────────────
async function handleStart(msg) {
    const chatId = msg.chat.id;
    const name = escapeMarkdown(msg.from.first_name || 'there');

    const text = `👋 *Welcome to Heritage Eats Bot, ${name}!*

Your Chat ID is: \`${chatId}\`

_Copy this Chat ID and paste it into your backend .env file as TELEGRAM\\_ADMIN\\_CHAT\\_ID to receive order notifications\\._

Type /help to see all commands.`;

    bot.sendMessage(chatId, text, { parse_mode: 'MarkdownV2' });
}

// ─── /help ──────────────────────────────────────────────────────────────────
async function handleHelp(msg) {
    const text = `🍽️ *Heritage Eats Bot — Commands*

📊 /stats — Dashboard stats \\(orders, revenue, customers\\)
📋 /recent — Last 5 orders
🔍 /order \\<orderId\\> — View order details
✏️ /status \\<orderId\\> \\<status\\> — Update order status
🛍️ /products — List all products
❓ /help — Show this help message

*Order Status Values:*
\`confirmed\` \\· \`preparing\` \\· \`out_for_delivery\` \\· \`delivered\` \\· \`cancelled\``;

    bot.sendMessage(msg.chat.id, text, { parse_mode: 'MarkdownV2' });
}

// ─── /stats ─────────────────────────────────────────────────────────────────
async function handleStats(msg) {
    try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const totalOrders = await Order.countDocuments();
        const totalCustomers = await Customer.countDocuments();
        const totalProducts = await Product.countDocuments();

        const todayOrders = await Order.countDocuments({ createdAt: { $gte: todayStart } });
        const monthOrders = await Order.countDocuments({ createdAt: { $gte: monthStart } });

        const todayRevResult = await Order.aggregate([
            { $match: { createdAt: { $gte: todayStart }, paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const todayRevenue = todayRevResult.length > 0 ? todayRevResult[0].total : 0;

        const monthRevResult = await Order.aggregate([
            { $match: { createdAt: { $gte: monthStart }, paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const monthRevenue = monthRevResult.length > 0 ? monthRevResult[0].total : 0;

        const totalRevResult = await Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = totalRevResult.length > 0 ? totalRevResult[0].total : 0;

        const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
        const preparingOrders = await Order.countDocuments({ orderStatus: 'preparing' });

        const text = `📊 *Heritage Eats — Dashboard*

━━━━━━━━━━━━━━━━━━━━
📅 *Today*
   Orders: *${todayOrders}*
   Revenue: *₹${escapeMarkdown(todayRevenue.toLocaleString('en-IN'))}*

📆 *This Month*
   Orders: *${monthOrders}*
   Revenue: *₹${escapeMarkdown(monthRevenue.toLocaleString('en-IN'))}*

━━━━━━━━━━━━━━━━━━━━
📈 *Overall*
   Total Orders: *${totalOrders}*
   Total Revenue: *₹${escapeMarkdown(totalRevenue.toLocaleString('en-IN'))}*
   Total Customers: *${totalCustomers}*
   Total Products: *${totalProducts}*

⏳ *Active*
   Pending: *${pendingOrders}*
   Preparing: *${preparingOrders}*`;

        bot.sendMessage(msg.chat.id, text, { parse_mode: 'MarkdownV2' });
    } catch (err) {
        console.error('Telegram /stats error:', err);
        bot.sendMessage(msg.chat.id, '❌ Error fetching stats. Check server logs.');
    }
}

// ─── /recent ────────────────────────────────────────────────────────────────
async function handleRecent(msg) {
    try {
        const orders = await Order.find()
            .populate('customer', 'name phone')
            .sort({ createdAt: -1 })
            .limit(5);

        if (orders.length === 0) {
            return bot.sendMessage(msg.chat.id, '📭 No orders found.');
        }

        let text = `📋 *Last 5 Orders*\n━━━━━━━━━━━━━━━━━━━━\n`;

        orders.forEach((order, i) => {
            const customerName = escapeMarkdown(order.customer?.name || 'Guest');
            const phone = escapeMarkdown(order.customer?.phone || 'N/A');
            const date = escapeMarkdown(new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            }));
            const orderId = escapeMarkdown(order.orderId);
            const amount = escapeMarkdown(order.totalAmount.toLocaleString('en-IN'));
            const status = escapeMarkdown(order.orderStatus);

            const statusEmoji = {
                pending: '🟡', confirmed: '🟢', preparing: '🔵',
                out_for_delivery: '🚚', delivered: '✅', cancelled: '🔴'
            };

            text += `\n${i + 1}\\. *${orderId}*\n`;
            text += `   👤 ${customerName} \\· 📞 ${phone}\n`;
            text += `   💰 ₹${amount} \\· ${statusEmoji[order.orderStatus] || '⚪'} ${status}\n`;
            text += `   🕐 ${date}\n`;
        });

        bot.sendMessage(msg.chat.id, text, { parse_mode: 'MarkdownV2' });
    } catch (err) {
        console.error('Telegram /recent error:', err);
        bot.sendMessage(msg.chat.id, '❌ Error fetching recent orders.');
    }
}

// ─── /order <orderId> ───────────────────────────────────────────────────────
async function handleOrderDetail(msg, match) {
    try {
        const rawOrderId = match[1].trim();

        let order = await Order.findOne({ orderId: rawOrderId })
            .populate('customer', 'name phone email address');

        if (!order) {
            order = await Order.findById(rawOrderId)
                .populate('customer', 'name phone email address');
        }

        if (!order) {
            return bot.sendMessage(msg.chat.id, `❌ Order \`${escapeMarkdown(rawOrderId)}\` not found\\.`, { parse_mode: 'MarkdownV2' });
        }

        const date = escapeMarkdown(new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }));

        let itemsText = order.items.map((item, i) => {
            const iName = escapeMarkdown(item.name);
            const iWeight = item.weight ? `\\(${escapeMarkdown(item.weight)}\\)` : '';
            const iPrice = escapeMarkdown((item.price * item.quantity).toString());
            return `   ${i + 1}\\. ${iName} ${iWeight} × ${item.quantity} — ₹${iPrice}`;
        }).join('\n');

        const subtotal = escapeMarkdown((order.totalAmount - (order.deliveryCharge || 0)).toLocaleString('en-IN'));
        const delivery = escapeMarkdown((order.deliveryCharge || 0).toLocaleString('en-IN'));
        const total = escapeMarkdown(order.totalAmount.toLocaleString('en-IN'));

        const text = `🔍 *Order Detail — ${escapeMarkdown(order.orderId)}*
━━━━━━━━━━━━━━━━━━━━

👤 *Customer*
   Name: ${escapeMarkdown(order.customer?.name || 'Guest')}
   Phone: ${escapeMarkdown(order.customer?.phone || 'N/A')}
   Email: ${escapeMarkdown(order.customer?.email || 'N/A')}
   Address: ${escapeMarkdown(order.customer?.address || 'N/A')}

🛒 *Items*
${itemsText}

💰 Subtotal: ₹${subtotal}
🚚 Delivery: ₹${delivery}
💵 *Total: ₹${total}*

📦 Order Status: *${escapeMarkdown(order.orderStatus)}*
💳 Payment: *${escapeMarkdown(order.paymentStatus)}*
🕐 Placed: ${date}`;

        bot.sendMessage(msg.chat.id, text, { parse_mode: 'MarkdownV2' });
    } catch (err) {
        console.error('Telegram /order error:', err);
        bot.sendMessage(msg.chat.id, '❌ Error fetching order details.');
    }
}

// ─── /status <orderId> <status> ─────────────────────────────────────────────
async function handleUpdateStatus(msg, match) {
    try {
        const rawOrderId = match[1].trim();
        const newStatus = match[2].trim().toLowerCase();

        const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
        if (!validStatuses.includes(newStatus)) {
            const validList = validStatuses.map(s => `\`${s}\``).join(' \\· ');
            return bot.sendMessage(msg.chat.id,
                `❌ Invalid status\\. Valid options:\n${validList}`,
                { parse_mode: 'MarkdownV2' }
            );
        }

        let order = await Order.findOne({ orderId: rawOrderId });
        if (!order) {
            order = await Order.findById(rawOrderId);
        }

        if (!order) {
            return bot.sendMessage(msg.chat.id, `❌ Order \`${escapeMarkdown(rawOrderId)}\` not found\\.`, { parse_mode: 'MarkdownV2' });
        }

        const oldStatus = order.orderStatus;
        order.orderStatus = newStatus;
        await order.save();

        const statusEmoji = {
            pending: '🟡', confirmed: '🟢', preparing: '🔵',
            out_for_delivery: '🚚', delivered: '✅', cancelled: '🔴'
        };

        const text = `✏️ *Order Status Updated*
━━━━━━━━━━━━━━━━━━━━
📦 Order: \`${escapeMarkdown(order.orderId)}\`
${statusEmoji[oldStatus] || '⚪'} ${escapeMarkdown(oldStatus)} → ${statusEmoji[newStatus] || '⚪'} *${escapeMarkdown(newStatus)}*`;

        bot.sendMessage(msg.chat.id, text, { parse_mode: 'MarkdownV2' });
    } catch (err) {
        console.error('Telegram /status error:', err);
        bot.sendMessage(msg.chat.id, '❌ Error updating order status.');
    }
}

// ─── /products ──────────────────────────────────────────────────────────────
async function handleProducts(msg) {
    try {
        const products = await Product.find().sort({ category: 1, name_en: 1 });

        if (products.length === 0) {
            return bot.sendMessage(msg.chat.id, '📭 No products found.');
        }

        // Group by category
        const grouped = {};
        products.forEach(p => {
            if (!grouped[p.category]) grouped[p.category] = [];
            grouped[p.category].push(p);
        });

        const categoryEmoji = {
            sweets: '🍬', snacks: '🍿', pickles: '🫙', malts: '🥤', podi: '🌶️'
        };

        let text = `🛍️ *Heritage Eats — Products*\n`;

        for (const [category, items] of Object.entries(grouped)) {
            const emoji = categoryEmoji[category] || '📦';
            text += `\n${emoji} *${category.charAt(0).toUpperCase() + category.slice(1)}*\n`;

            items.forEach(p => {
                const status = p.temporarilyUnavailable ? '🔴' : (p.available ? '🟢' : '🔴');
                const badge = p.badge ? ` \\[${escapeMarkdown(p.badge)}\\]` : '';
                text += `   ${status} ${escapeMarkdown(p.name_en)}${badge} — ₹${p.basePrice}\n`;
            });
        }

        // If message is too long for Telegram (max 4096 chars), split it
        if (text.length > 4000) {
            const chunks = [];
            let current = '';
            const lines = text.split('\n');
            for (const line of lines) {
                if ((current + line + '\n').length > 4000) {
                    chunks.push(current);
                    current = '';
                }
                current += line + '\n';
            }
            if (current) chunks.push(current);

            for (const chunk of chunks) {
                await bot.sendMessage(msg.chat.id, chunk, { parse_mode: 'MarkdownV2' });
            }
        } else {
            bot.sendMessage(msg.chat.id, text, { parse_mode: 'MarkdownV2' });
        }
    } catch (err) {
        console.error('Telegram /products error:', err);
        bot.sendMessage(msg.chat.id, '❌ Error fetching products.');
    }
}

// ─── Order Notification (called from paymentController) ─────────────────────
function sendOrderNotification(orderData) {
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
    if (!bot || !adminChatId) return;

    try {
        const items = (orderData.items || []).map((item, i) => {
            const iName = escapeMarkdown(item.name);
            const iWeight = item.weight ? `\\(${escapeMarkdown(item.weight)}\\)` : '';
            const iPrice = escapeMarkdown((item.price * item.quantity).toString());
            return `   ${i + 1}\\. ${iName} ${iWeight} × ${item.quantity} — ₹${iPrice}`;
        }).join('\n');

        const delivery = escapeMarkdown((orderData.deliveryCharge || 0).toLocaleString('en-IN'));
        const total = escapeMarkdown((orderData.totalAmount || 0).toLocaleString('en-IN'));
        const pStatus = escapeMarkdown(orderData.paymentStatus || 'paid');
        const cName = escapeMarkdown(orderData.customerName || 'Guest');
        const cPhone = escapeMarkdown(orderData.customerPhone || 'N/A');
        const cEmail = escapeMarkdown(orderData.customerEmail || 'N/A');
        const cAddress = escapeMarkdown(orderData.customerAddress || 'N/A');
        const oid = escapeMarkdown(orderData.orderId);

        const text = `🔔 *NEW ORDER RECEIVED!*
━━━━━━━━━━━━━━━━━━━━
📦 Order ID: \`${oid}\`
👤 Customer: *${cName}*
📞 Phone: ${cPhone}
📧 Email: ${cEmail}
📍 Address: ${cAddress}

🛒 *Items*
${items}

🚚 Delivery: ₹${delivery}
💵 *Total: ₹${total}*
💳 Payment: *${pStatus}*

_Use /order ${oid} to view full details_
_Use /status ${oid} confirmed to update status_`;

        bot.sendMessage(adminChatId, text, { parse_mode: 'MarkdownV2' });
    } catch (err) {
        console.error('Telegram notification error:', err);
    }
}

module.exports = { initBot, sendOrderNotification };
