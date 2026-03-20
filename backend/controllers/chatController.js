const fetch = require('node-fetch');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Customer = require('../models/Customer');
const Wishlist = require('../models/Wishlist');
const { matchKnowledge, getKnowledgeText } = require('../config/chatbotKnowledge');

// ==================== CHAT MEMORY SYSTEM ====================

const chatSessions = new Map();
const adminSessions = new Map();
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const ADMIN_TIMEOUT = 10 * 60 * 1000; // 10 minutes

function getSession(sessionId) {
    let session = chatSessions.get(sessionId);
    if (session && (Date.now() - session.lastActiveAt > SESSION_TIMEOUT)) {
        chatSessions.delete(sessionId);
        session = null;
    }
    if (!session) {
        session = { lastProduct: null, lastAction: null, conversationHistory: [], lastActiveAt: Date.now() };
        chatSessions.set(sessionId, session);
    }
    session.lastActiveAt = Date.now();
    return session;
}

function getAdminSession(sessionId) {
    const session = adminSessions.get(sessionId);
    if (session && (Date.now() - session.lastActiveAt > ADMIN_TIMEOUT)) {
        adminSessions.delete(sessionId);
        return null;
    }
    if (session) session.lastActiveAt = Date.now();
    return session;
}

// Periodic cleanup of expired sessions
setInterval(() => {
    const now = Date.now();
    for (const [id, s] of chatSessions) { if (now - s.lastActiveAt > SESSION_TIMEOUT) chatSessions.delete(id); }
    for (const [id, s] of adminSessions) { if (now - s.lastActiveAt > ADMIN_TIMEOUT) adminSessions.delete(id); }
}, 5 * 60 * 1000);

// ==================== INTENT DETECTION ====================

const INTENTS = {
    ADMIN_TRIGGER: /^iamtheadmin123$/i,
    ADMIN_EXIT: /^(exit\s*admin|logout\s*admin|admin\s*logout|leave\s*admin)$/i,
    ADD_TO_WISHLIST: /\b(add|save|put)\b.*\b(wishlist|wish\s*list|favorites?)\b/i,
    REMOVE_FROM_WISHLIST: /\b(remove|delete)\b.*\b(wishlist|wish\s*list|favorites?)\b/i,
    SHOW_WISHLIST: /\b(show|view|my)\b.*\b(wishlist|wish\s*list|favorites?)\b/i,
    BUY_NOW: /\b(buy\s*now|checkout|place\s*order|proceed\s*to\s*(pay|checkout|order))\b/i,
    ADD_TO_CART: /\b(add|put|place)\b.*\b(cart|basket)\b|\bcart\s*add\b|\badd\b.*\bto\s*(my\s*)?(cart|basket)\b/i,
    REMOVE_FROM_CART: /\b(remove|delete|take\s*out)\b.*\b(cart|basket)\b|\bremove\b.*\bfrom\s*(my\s*)?(cart|basket)\b/i,
    SHOW_CART: /\b(show|view|what'?s?\s*in|display|see)\b.*\b(cart|basket)\b|\bmy\s*cart\b|\bcart\s*items?\b/i,
    CLEAR_CART: /\b(clear|empty|reset)\b.*\b(cart|basket)\b/i,
    RECOMMENDATION: /\b(recommend|suggest|what\s*should\s*i\s*(buy|order|get)|for\s*me|you\s*suggest)\b/i,
    PRICE_CALCULATION: /\b(how\s*much|price|cost|total)\b.*\b(\d+)\s*(kg|g|gram|kilo)\b/i,
    ORDER_STATUS: /\b(where|status|track)\b.*\b(order|delivery|package)\b|\btrack\s*order\b|\border\s*status\b/i,
    MY_ORDERS: /\b(my|past|previous|order)\s*(orders|history)\b|\border\s*history\b|\bshow\s*(my\s*)?orders?\b/i,
    DELIVERY_INFO: /\b(delivery|shipping)\s*(charge|cost|fee|info|detail)\b|\bhow\s*much.*delivery\b|\bdelivery\b/i,
    BEST_SELLERS: /\b(best\s*sell|popular|top\s*sell|trending|most\s*sold|hot\s*products?)\b/i,
    NEW_ARRIVALS: /\b(new|latest|recent)\s*(arrival|product|added|item)\b|\bnew\s*products?\b/i,
    CATEGORY_BROWSE: /\b(show|list|browse|display)\b.*\b(sweets?|snacks?|pickles?|malts?|podi)\b|\b(sweets?|snacks?|pickles?|malts?|podi)\s*(category|products?|items?|list)?\s*$/i,
    PRODUCT_LIST: /\b(show|list|all|what)\b.*\b(products?|items?|menu|sell|offer)\b|\bmenu\b|\bwhat\s*do\s*you\s*(have|sell|offer)\b/i,
    KNOWLEDGE: /\b(owner|founded|founder|who\s*(runs?|owns?|started|behind|made))\b|\b(about)\s*(the\s*)?(store|shop|company|heritage|you|us|business)\b|\b(contact|phone|call|email|whatsapp|reach\s*us|instagram)\b|\b(return|refund|exchange|cancel)\s*(policy)?\b|\b(payment|pay)\s*(method|option|mode)s?\b|\b(business|store|shop)\s*(hour|timing|open|close)\b|\b(quality|preservative|natural|pure|fresh|hygien)\s*(assurance|check)?\b|\b(bulk\s*order|vegetarian|veg\s*only)\b|\b(where\s*(are|is)\s*(you|the\s*store|located))\b|\baddress\b/i,
    PRODUCT_QUERY: /\b(price|cost|how\s*much|ingredients?|benefits?|shelf\s*life|expir|storage|weight|available|stock|details?|about|tell\s*me)\b/i,
    COMPARE: /\b(compare|difference|vs|versus)\b/i,
    HELP: /\b(help|what\s*can\s*you\s*do|commands?|features?)\b/i,
    GREETING: /^(hi|hello|hey|vanakkam|நல்வரவு|வணக்கம்|good\s*(morning|afternoon|evening)|namaste)\b/i,
};

function detectIntent(message) {
    const msg = message.trim();
    for (const [intent, pattern] of Object.entries(INTENTS)) {
        if (pattern.test(msg)) {
            return intent;
        }
    }
    return 'GENERAL';
}

// ==================== PRODUCT MATCHING ====================

// Helper: normalize weight string — strips unit if already embedded
function normalizeWeight(weight, unit) {
    const w = String(weight || '').trim();
    const u = String(unit || 'g').trim();
    // If weight already ends with a unit like "250g" or "1kg", return as-is
    if (/\d+\s*(g|kg|ml|l)\s*$/i.test(w)) {
        return w;
    }
    return `${w}${u}`;
}

async function findProductByName(query) {
    const cleanQuery = query.replace(/\b(price|cost|of|the|for|what|is|are|how|much|show|me|tell|about|get|add|remove|to|from|cart|my|kg|g|gram|grams|kilo|kilos|\d+)\b/gi, '').trim();
    if (!cleanQuery) return null;

    // Try exact match first
    let product = await Product.findOne({
        $or: [
            { name_en: { $regex: new RegExp(cleanQuery, 'i') } },
            { name_ta: { $regex: new RegExp(cleanQuery, 'i') } },
            { id: { $regex: new RegExp(cleanQuery, 'i') } }
        ],
        available: true
    });

    if (!product) {
        // Try partial match with each word (longest first)
        const words = cleanQuery.split(/\s+/).filter(w => w.length > 2).sort((a, b) => b.length - a.length);
        for (const word of words) {
            product = await Product.findOne({
                $or: [
                    { name_en: { $regex: new RegExp(word, 'i') } },
                    { name_ta: { $regex: new RegExp(word, 'i') } }
                ],
                available: true
            });
            if (product) break;
        }
    }

    return product;
}

async function findMultipleProducts(query) {
    const cleanQuery = query.replace(/\b(compare|difference|vs|versus|and|between|with)\b/gi, '').trim();
    const words = cleanQuery.split(/\s+/).filter(w => w.length > 2);
    const products = [];

    for (const word of words) {
        const product = await Product.findOne({
            $or: [
                { name_en: { $regex: new RegExp(word, 'i') } },
                { name_ta: { $regex: new RegExp(word, 'i') } }
            ],
            available: true
        });
        if (product && !products.find(p => p._id.toString() === product._id.toString())) {
            products.push(product);
        }
        if (products.length >= 2) break;
    }
    return products;
}

// Parse weight from message like "1kg", "500g", "250g"
function parseWeight(message) {
    const kgMatch = message.match(/(\d+)\s*kg/i);
    if (kgMatch) return `${kgMatch[1]}kg`;

    const gMatch = message.match(/(\d+)\s*g(?:ram)?s?/i);
    if (gMatch) return `${gMatch[1]}g`;

    return null;
}

// Parse quantity from message
function parseQuantity(message) {
    const qtyMatch = message.match(/(\d+)\s*(pack|piece|item|qty|quantity|nos?|number)/i);
    if (qtyMatch) return parseInt(qtyMatch[1]);

    const leadMatch = message.match(/^(\d+)\s+\w/i);
    if (leadMatch && parseInt(leadMatch[1]) <= 20) return parseInt(leadMatch[1]);

    return 1;
}

// ==================== PRODUCT FORMATTING ====================

function formatWeight(w) {
    return normalizeWeight(w.weight, w.unit);
}

function formatProduct(p) {
    const weights = p.weightOptions && p.weightOptions.length > 0
        ? p.weightOptions.map(w => `${formatWeight(w)} - ₹${w.price}`).join(', ')
        : `₹${p.basePrice}`;

    let info = `🍽️ **${p.name_en}**`;
    if (p.name_ta) info += ` (${p.name_ta})`;
    info += `\n💰 Price: ${weights}`;
    info += `\n📂 Category: ${p.category}`;
    if (p.badge) info += `\n🏷️ ${p.badge.replace(/-/g, ' ').toUpperCase()}`;
    if (p.shelfLife) info += `\n📅 Shelf Life: ${p.shelfLife}`;
    if (!p.available || p.temporarilyUnavailable) info += `\n❌ Currently Unavailable`;
    else info += `\n✅ In Stock`;
    if (p.totalSold) info += `\n📊 ${p.totalSold} sold`;

    return info;
}

function formatProductDetailed(p) {
    let info = formatProduct(p);
    if (p.description_en) {
        info += `\n\n📝 ${p.description_en}`;
    }
    if (p.ingredients_en && p.ingredients_en.length > 0) {
        info += `\n\n🧾 Ingredients: ${p.ingredients_en.join(', ')}`;
    }
    if (p.benefits_en && p.benefits_en.length > 0) {
        info += `\n\n💚 Health Benefits:\n${p.benefits_en.map(b => `  • ${b}`).join('\n')}`;
    }
    if (p.storage_en) {
        info += `\n\n📦 Storage: ${p.storage_en}`;
    }
    return info;
}

// ==================== INTENT HANDLERS ====================

async function handleProductQuery(message) {
    const product = await findProductByName(message);
    if (!product) {
        // Try to suggest similar products
        const allProducts = await Product.find({ available: true }).select('name_en').limit(20).lean();
        const names = allProducts.map(p => p.name_en).join(', ');
        return { reply: `Sorry, I couldn't find that product. Here are some products we have:\n${names}\n\nTry asking about a specific one!\n\nமன்னிக்கவும், அந்த பொருளை கண்டுபிடிக்க முடியவில்லை.` };
    }

    const msg = message.toLowerCase();

    // Specific attribute queries
    if (msg.includes('price') || msg.includes('cost') || msg.includes('how much')) {
        const weights = product.weightOptions && product.weightOptions.length > 0
            ? product.weightOptions.map(w => `  ${formatWeight(w)} → ₹${w.price}`).join('\n')
            : `  ₹${product.basePrice}`;
        return { reply: `💰 **${product.name_en}** Pricing:\n${weights}` };
    }
    if (msg.includes('ingredient')) {
        const ingEn = product.ingredients_en?.length > 0 ? product.ingredients_en.join(', ') : 'Not specified';
        const ingTa = product.ingredients_ta?.length > 0 ? `\n\n🧾 பொருட்கள்: ${product.ingredients_ta.join(', ')}` : '';
        return { reply: `🧾 **${product.name_en}** Ingredients:\n${ingEn}${ingTa}` };
    }
    if (msg.includes('benefit') || msg.includes('health')) {
        const benEn = product.benefits_en?.length > 0 ? product.benefits_en.map(b => `  • ${b}`).join('\n') : 'Not specified';
        const benTa = product.benefits_ta?.length > 0 ? `\n\n💚 நன்மைகள்:\n${product.benefits_ta.map(b => `  • ${b}`).join('\n')}` : '';
        return { reply: `💚 **${product.name_en}** Health Benefits:\n${benEn}${benTa}` };
    }
    if (msg.includes('shelf life') || msg.includes('expir')) {
        return { reply: `📅 **${product.name_en}** Shelf Life: ${product.shelfLife || 'Not specified'}` };
    }
    if (msg.includes('storage') || msg.includes('store')) {
        const stEn = product.storage_en || 'Not specified';
        const stTa = product.storage_ta ? `\n📦 சேமிப்பு: ${product.storage_ta}` : '';
        return { reply: `📦 **${product.name_en}** Storage: ${stEn}${stTa}` };
    }
    if (msg.includes('weight')) {
        const weights = product.weightOptions?.length > 0
            ? product.weightOptions.map(w => `  ${formatWeight(w)} - ₹${w.price}`).join('\n')
            : '  Standard weight only';
        return { reply: `⚖️ **${product.name_en}** Weight Options:\n${weights}` };
    }
    if (msg.includes('available') || msg.includes('stock')) {
        const status = (!product.available || product.temporarilyUnavailable)
            ? '❌ Currently Unavailable'
            : '✅ In Stock & Ready to Order!';
        return { reply: `**${product.name_en}**: ${status}` };
    }

    // Default: show full details
    return { reply: formatProductDetailed(product) };
}

async function handleProductList() {
    const products = await Product.find({ available: true }).sort({ totalSold: -1 }).limit(15);
    if (products.length === 0) {
        return { reply: "No products are currently available." };
    }

    // Group by category
    const categories = {};
    products.forEach(p => {
        if (!categories[p.category]) categories[p.category] = [];
        categories[p.category].push(p);
    });

    let reply = "🛒 **Our Products:**\n";
    for (const [cat, prods] of Object.entries(categories)) {
        reply += `\n**${cat.charAt(0).toUpperCase() + cat.slice(1)}:**\n`;
        prods.forEach(p => {
            const price = p.weightOptions?.length > 0
                ? `from ₹${Math.min(...p.weightOptions.map(w => w.price))}`
                : `₹${p.basePrice}`;
            reply += `  • **${p.name_en}** - ${price}`;
            if (p.badge) reply += ` 🏷️${p.badge}`;
            reply += '\n';
        });
    }
    reply += "\nAsk me about any product for details! E.g., *\"Tell me about Murukku\"*";
    return { reply, action: 'products_listed' };
}

async function handleBestSellers() {
    const products = await Product.find({ available: true }).sort({ totalSold: -1 }).limit(5);
    if (products.length === 0) {
        return { reply: "No products found." };
    }
    let reply = "🔥 **Best Sellers:**\n\n";
    products.forEach((p, i) => {
        const price = p.weightOptions?.length > 0
            ? `from ₹${Math.min(...p.weightOptions.map(w => w.price))}`
            : `₹${p.basePrice}`;
        reply += `${i + 1}. **${p.name_en}**`;
        if (p.name_ta) reply += ` (${p.name_ta})`;
        reply += ` - ${price}`;
        if (p.totalSold) reply += ` • ${p.totalSold} sold`;
        if (p.badge) reply += ` 🏷️${p.badge}`;
        reply += '\n';
    });
    reply += "\nSay *\"Tell me about [product name]\"* for more details!";
    return { reply };
}

async function handleNewArrivals() {
    const products = await Product.find({ available: true }).sort({ createdAt: -1 }).limit(5);
    if (products.length === 0) {
        return { reply: "No new products at the moment." };
    }
    let reply = "🆕 **Recently Added Products:**\n\n";
    products.forEach((p, i) => {
        const price = p.weightOptions?.length > 0
            ? `from ₹${Math.min(...p.weightOptions.map(w => w.price))}`
            : `₹${p.basePrice}`;
        reply += `${i + 1}. **${p.name_en}** - ${price}`;
        if (p.badge) reply += ` 🏷️${p.badge}`;
        reply += '\n';
    });
    return { reply };
}

async function handleCategoryBrowse(message) {
    const categories = ['sweets', 'snacks', 'pickles', 'malts', 'podi'];
    const category = categories.find(c => message.toLowerCase().includes(c));
    if (!category) {
        return { reply: `We have these categories:\n🍬 Sweets\n🍘 Snacks\n🥒 Pickles\n🥤 Malts\n🌶️ Podi\n\nWhich one would you like to explore?` };
    }

    const catEmoji = { sweets: '🍬', snacks: '🍘', pickles: '🥒', malts: '🥤', podi: '🌶️' };
    const products = await Product.find({ category, available: true }).sort({ totalSold: -1 });
    if (products.length === 0) {
        return { reply: `No ${category} products are currently available.` };
    }

    let reply = `${catEmoji[category] || '🍽️'} **${category.charAt(0).toUpperCase() + category.slice(1)}** (${products.length} products):\n\n`;
    products.forEach((p, i) => {
        const price = p.weightOptions?.length > 0
            ? `from ₹${Math.min(...p.weightOptions.map(w => w.price))}`
            : `₹${p.basePrice}`;
        reply += `${i + 1}. **${p.name_en}** - ${price}`;
        if (p.badge) reply += ` 🏷️${p.badge}`;
        reply += '\n';
    });
    reply += `\nAsk me about any ${category} product for details!`;
    return { reply };
}

async function handleCompare(message) {
    const products = await findMultipleProducts(message);
    if (products.length < 2) {
        return { reply: "Please mention two products to compare. E.g., *\"Compare Murukku and Mysore Pak\"*" };
    }

    const [p1, p2] = products;
    const getPrice = (p) => p.weightOptions?.length > 0
        ? `from ₹${Math.min(...p.weightOptions.map(w => w.price))}`
        : `₹${p.basePrice}`;

    let reply = `📊 **Comparison:**\n\n`;
    reply += `| Feature | **${p1.name_en}** | **${p2.name_en}** |\n`;
    reply += `|---------|---------|----------|\n`;
    reply += `| Category | ${p1.category} | ${p2.category} |\n`;
    reply += `| Price | ${getPrice(p1)} | ${getPrice(p2)} |\n`;
    reply += `| Shelf Life | ${p1.shelfLife || 'N/A'} | ${p2.shelfLife || 'N/A'} |\n`;
    reply += `| Total Sold | ${p1.totalSold || 0} | ${p2.totalSold || 0} |\n`;
    reply += `| Available | ${p1.available ? '✅' : '❌'} | ${p2.available ? '✅' : '❌'} |\n`;

    return { reply };
}

// ==================== CART HANDLERS ====================

async function handleAddToCart(message, customer) {
    if (!customer) {
        return { reply: "🔐 Please log in to add items to your cart.\n\nகார்ட்டில் சேர்க்க முதலில் உள்நுழையவும்." };
    }

    const product = await findProductByName(message);
    if (!product) {
        return { reply: "Sorry, I couldn't find that product. Please try a specific product name.\n\nType *\"Show products\"* to see our full menu.\n\nமன்னிக்கவும், அந்த பொருளை கண்டுபிடிக்க முடியவில்லை." };
    }

    if (!product.available || product.temporarilyUnavailable) {
        return { reply: `❌ Sorry, **${product.name_en}** is currently unavailable.` };
    }

    const requestedWeight = parseWeight(message);
    const quantity = parseQuantity(message);

    let selectedWeight;
    let unitPrice = product.basePrice;

    if (product.weightOptions && product.weightOptions.length > 0) {
        if (requestedWeight) {
            // Match against normalized weight options
            const match = product.weightOptions.find(w => {
                const normalized = normalizeWeight(w.weight, w.unit).toLowerCase();
                return normalized === requestedWeight.toLowerCase();
            });
            if (match) {
                selectedWeight = normalizeWeight(match.weight, match.unit);
                unitPrice = match.price;
            } else {
                // Requested weight not available — show options
                const available = product.weightOptions.map(w => `${normalizeWeight(w.weight, w.unit)} (₹${w.price})`).join(', ');
                return {
                    reply: `⚠️ **${product.name_en}** doesn't have a ${requestedWeight} option.\n\nAvailable weights: ${available}\n\nTry again with one of these!`
                };
            }
        } else {
            // Default to first weight option
            const def = product.weightOptions[0];
            selectedWeight = normalizeWeight(def.weight, def.unit);
            unitPrice = def.price;
        }
    } else {
        selectedWeight = requestedWeight || '250g';
    }

    // Add to cart in DB
    let cart = await Cart.findOne({ userId: customer._id });
    if (!cart) {
        cart = await Cart.create({ userId: customer._id, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
        item => item.productId === (product.id || product._id.toString()) && item.weight === selectedWeight
    );

    if (existingItemIndex >= 0) {
        cart.items[existingItemIndex].quantity += quantity;
    } else {
        cart.items.push({
            productId: product.id || product._id.toString(),
            name: product.name_en,
            nameTa: product.name_ta || '',
            image: product.images?.[0] || '',
            weight: selectedWeight,
            quantity: quantity,
            unitPrice: unitPrice
        });
    }

    await cart.save();

    const totalCartItems = cart.items.reduce((s, i) => s + i.quantity, 0);
    return {
        reply: `✅ Added to cart!\n\n🛍️ **${product.name_en}** (${selectedWeight}) × ${quantity} — ₹${unitPrice * quantity}\n\n🛒 Cart now has ${totalCartItems} item(s).\n\nType *\"Show my cart\"* to see your cart or *\"Proceed to checkout\"* to order!\n\nகார்ட்டில் சேர்க்கப்பட்டது!`,
        action: 'cart_updated'
    };
}

async function handleRemoveFromCart(message, customer) {
    if (!customer) {
        return { reply: "🔐 Please log in to manage your cart.\n\nகார்ட்டை நிர்வகிக்க உள்நுழையவும்.", buttons: ["Login"] };
    }

    const cart = await Cart.findOne({ userId: customer._id });
    if (!cart || cart.items.length === 0) {
        return { reply: "🛒 Your cart is empty! Nothing to remove.\n\nஉங்கள் கார்ட் காலியாக உள்ளது!", buttons: ["Show Products", "Best Sellers"] };
    }

    const requestedWeight = parseWeight(message);
    const requestedQty = parseQuantity(message);

    // Helper: convert weight string to grams
    function toGrams(w) {
        const m = String(w).match(/(\d+)\s*(kg|g)/i);
        if (!m) return 0;
        return m[2].toLowerCase() === 'kg' ? parseInt(m[1]) * 1000 : parseInt(m[1]);
    }

    // Helper: format grams back to display string
    function gramsToDisplay(g) {
        return g >= 1000 ? `${g / 1000}kg` : `${g}g`;
    }

    async function partialRemove(cartItem, itemIndex) {
        if (requestedWeight) {
            const cartGrams = toGrams(cartItem.weight);
            const removeGrams = toGrams(requestedWeight);

            if (cartGrams > 0 && removeGrams > 0 && removeGrams < cartGrams) {
                const newGrams = cartGrams - removeGrams;
                const newWeight = gramsToDisplay(newGrams);
                // Recalculate price proportionally
                const pricePerGram = cartItem.unitPrice / cartGrams;
                const newPrice = Math.round(pricePerGram * newGrams);
                cart.items[itemIndex].weight = newWeight;
                cart.items[itemIndex].unitPrice = newPrice;
                await cart.save();
                return {
                    reply: `✅ **${cartItem.name}** — Quantity Updated\n\n• Removed: ${requestedWeight}\n• Remaining: ${newWeight} — ₹${newPrice}\n\n🛒 Cart updated.`,
                    action: 'cart_updated',
                    buttons: ["Show My Cart", "Continue Shopping"]
                };
            }
        }

        if (requestedQty > 0 && cartItem.quantity > requestedQty) {
            cart.items[itemIndex].quantity -= requestedQty;
            await cart.save();
            const remaining = cart.items[itemIndex].quantity;
            return {
                reply: `✅ **${cartItem.name}** — Quantity Updated\n\n• Removed: ${requestedQty} item(s)\n• Remaining: ${remaining} × ₹${cartItem.unitPrice}\n\n🛒 Cart updated.`,
                action: 'cart_updated',
                buttons: ["Show My Cart", "Continue Shopping"]
            };
        }

        // Remove entirely
        cart.items.splice(itemIndex, 1);
        await cart.save();
        return {
            reply: `🗑️ Removed **${cartItem.name}** from your cart.\n\n🛒 ${cart.items.length} item(s) remaining.`,
            action: 'cart_updated',
            buttons: ["Show My Cart", "Continue Shopping"]
        };
    }

    const product = await findProductByName(message);
    if (product) {
        const productId = product.id || product._id.toString();
        const itemIndex = cart.items.findIndex(item => item.productId === productId);
        if (itemIndex === -1) {
            return { reply: `**${product.name_en}** is not in your cart.`, buttons: ["Show My Cart"] };
        }
        return await partialRemove(cart.items[itemIndex], itemIndex);
    }

    // Try matching by name directly in cart
    const cleanQuery = message.replace(/\b(remove|delete|take|out|from|cart|the|my|\d+\s*(g|kg|gram|kilo))\b/gi, '').trim();
    if (cleanQuery) {
        const itemIndex = cart.items.findIndex(item =>
            item.name.toLowerCase().includes(cleanQuery.toLowerCase())
        );
        if (itemIndex >= 0) {
            return await partialRemove(cart.items[itemIndex], itemIndex);
        }
    }

    return { reply: "I couldn't find that item in your cart.\n\nType *\"Show my cart\"* to see your cart items.", buttons: ["Show My Cart"] };
}

async function handleShowCart(customer) {
    if (!customer) {
        return { reply: "🔐 Please log in to view your cart.\n\nகார்ட்டைப் பார்க்க உள்நுழையவும்." };
    }

    const cart = await Cart.findOne({ userId: customer._id });
    if (!cart || cart.items.length === 0) {
        return { reply: "🛒 Your cart is empty!\n\nBrowse our products by typing *\"Show products\"* or *\"Best sellers\"*.\n\nஉங்கள் கார்ட் காலியாக உள்ளது!" };
    }

    let reply = "🛒 **Your Cart:**\n\n";
    let total = 0;
    let totalWeightKg = 0;

    cart.items.forEach((item, i) => {
        const itemTotal = item.unitPrice * item.quantity;
        total += itemTotal;
        reply += `${i + 1}. **${item.name}** (${item.weight}) × ${item.quantity} — ₹${itemTotal}\n`;

        const weightMatch = item.weight.match(/(\d+)/);
        const weightValue = weightMatch ? parseInt(weightMatch[1]) : 250;
        const weightInKg = item.weight.toLowerCase().includes('kg') ? weightValue : weightValue / 1000;
        totalWeightKg += weightInKg * item.quantity;
    });

    const deliveryCharge = Math.round(totalWeightKg * 60);
    reply += `\n━━━━━━━━━━━━━━━━━━`;
    reply += `\n💰 Subtotal: ₹${total}`;
    reply += `\n🚚 Delivery (₹60/kg): ₹${deliveryCharge}`;
    reply += `\n**🧾 Grand Total: ₹${total + deliveryCharge}**`;
    reply += `\n\n💡 To modify: *\"Remove [product]\"* or *\"Clear my cart\"*`;

    return { reply, cartItems: cart.items };
}

async function handleClearCart(customer) {
    if (!customer) {
        return { reply: "🔐 Please log in to manage your cart.\n\nகார்ட்டை நிர்வகிக்க உள்நுழையவும்." };
    }

    const cart = await Cart.findOne({ userId: customer._id });
    if (!cart || cart.items.length === 0) {
        return { reply: "🛒 Your cart is already empty!" };
    }

    const itemCount = cart.items.length;
    await Cart.findOneAndUpdate({ userId: customer._id }, { items: [] });
    return {
        reply: `🗑️ Cart cleared! ${itemCount} item(s) removed.\n\nஉங்கள் கார்ட் காலியாக்கப்பட்டது!`,
        action: 'cart_updated'
    };
}

// ==================== ORDER HANDLERS ====================

async function handleOrderStatus(customer) {
    if (!customer) {
        return { reply: "🔐 Please log in to track your orders.\n\nஆர்டர்களை கண்காணிக்க உள்நுழையவும்." };
    }

    const latestOrder = await Order.findOne({ customer: customer._id }).sort({ createdAt: -1 });
    if (!latestOrder) {
        return { reply: "📦 You don't have any orders yet.\n\nStart shopping by typing *\"Show products\"*!\n\nஉங்களிடம் இன்னும் ஆர்டர்கள் இல்லை." };
    }

    const statusEmoji = {
        pending: '⏳', confirmed: '✅', preparing: '👨‍🍳',
        out_for_delivery: '🚚', delivered: '📦', cancelled: '❌'
    };
    const statusText = {
        pending: 'Pending', confirmed: 'Confirmed', preparing: 'Being Prepared',
        out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled'
    };

    const emoji = statusEmoji[latestOrder.orderStatus] || '📋';
    const status = statusText[latestOrder.orderStatus] || latestOrder.orderStatus;

    let reply = `📋 **Latest Order: ${latestOrder.orderId}**\n\n`;
    reply += `${emoji} Status: **${status}**\n`;
    reply += `💳 Payment: ${latestOrder.paymentStatus}\n`;
    reply += `💰 Total: ₹${latestOrder.totalAmount}\n`;
    if (latestOrder.deliveryCharge) reply += `🚚 Delivery Charge: ₹${latestOrder.deliveryCharge}\n`;
    reply += `📅 Ordered: ${new Date(latestOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;

    if (latestOrder.items && latestOrder.items.length > 0) {
        reply += `\n\n📦 Items:\n`;
        latestOrder.items.forEach(item => {
            reply += `  • ${item.name} (${item.weight || 'standard'}) × ${item.quantity} — ₹${item.price * item.quantity}\n`;
        });
    }

    return { reply };
}

async function handleMyOrders(customer) {
    if (!customer) {
        return { reply: "🔐 Please log in to view your orders.\n\nஆர்டர்களைப் பார்க்க உள்நுழையவும்." };
    }

    const orders = await Order.find({ customer: customer._id }).sort({ createdAt: -1 }).limit(5);
    if (orders.length === 0) {
        return { reply: "📦 You don't have any orders yet.\n\nஉங்களிடம் இன்னும் ஆர்டர்கள் இல்லை." };
    }

    const statusEmoji = {
        pending: '⏳', confirmed: '✅', preparing: '👨‍🍳',
        out_for_delivery: '🚚', delivered: '📦', cancelled: '❌'
    };

    let reply = `📋 **Your Recent Orders:**\n\n`;
    orders.forEach((order, i) => {
        const emoji = statusEmoji[order.orderStatus] || '📋';
        const date = new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        reply += `${i + 1}. **${order.orderId}** — ${emoji} ${order.orderStatus.replace(/_/g, ' ')} — ₹${order.totalAmount} (${date})\n`;
    });

    reply += `\nType *\"Track my order\"* to see details of your latest order.`;
    return { reply };
}

async function handleDeliveryInfo() {
    return {
        reply: `🚚 **Delivery Information:**\n\n` +
            `We calculate delivery based on weight:\n` +
            `📏 **₹60 per kg**\n\n` +
            `Examples:\n` +
            `  • 250g → ₹15\n` +
            `  • 500g → ₹30\n` +
            `  • 1kg → ₹60\n` +
            `  • 2kg → ₹120\n\n` +
            `The delivery charge is automatically calculated at checkout.\n\n` +
            `🚚 **டெலிவரி கட்டணம்:** கிலோவுக்கு ₹60`
    };
}

// ==================== HELP HANDLER ====================

function handleHelp() {
    return {
        reply: `🤖 **Heritage Eats Assistant — Commands:**\n\n` +
            `🛒 **Products:**\n` +
            `  • "Show products" — Full menu\n` +
            `  • "Show sweets/snacks/pickles" — By category\n` +
            `  • "Best sellers" / "New arrivals"\n` +
            `  • "Price of Murukku" — Check price\n` +
            `  • "How much does 10kg mixture cost?"\n` +
            `  • "Compare Murukku and Mysore Pak"\n\n` +
            `🛍️ **Cart:**\n` +
            `  • "Add 1kg Murukku to cart"\n` +
            `  • "Remove 500g Murukku from cart"\n` +
            `  • "Show my cart" / "Clear my cart"\n` +
            `  • "Buy now" / "Checkout"\n\n` +
            `❤️ **Wishlist:**\n` +
            `  • "Add Murukku to wishlist"\n` +
            `  • "Show my wishlist"\n\n` +
            `📦 **Orders:**\n` +
            `  • "Track my order" / "My orders"\n` +
            `  • "Delivery charges?"\n\n` +
            `🌟 "Recommend something" — Get suggestions\n\n` +
            `💬 Or just chat naturally — I understand!`,
        buttons: ["Show Products", "Best Sellers", "Show My Cart", "Recommend"]
    };
}

// ==================== GREETING HANDLER ====================

function handleGreeting() {
    const greetings = [
        `👋 Hello! Welcome to Heritage Eats!\n\n` +
        `I'm your smart assistant. I can help you with:\n` +
        `🛒 Browse products & check prices\n` +
        `🛍️ Add/remove items from cart\n` +
        `📦 Track your orders\n` +
        `🔥 Find best sellers\n` +
        `💚 Check ingredients & benefits\n\n` +
        `Type *\"help\"* to see all commands!\n\n` +
        `வணக்கம்! நான் உங்களுக்கு எப்படி உதவ முடியும்?`,
    ];
    return { reply: greetings[0] };
}

// ==================== WISHLIST HANDLERS ====================

async function handleAddToWishlist(message, customer) {
    if (!customer) {
        return { reply: "🔐 Please log in to manage your wishlist.", buttons: ["Login"] };
    }
    const product = await findProductByName(message);
    if (!product) {
        return { reply: "Sorry, I couldn't find that product. Try *\"Show products\"* to browse.", buttons: ["Show Products"] };
    }
    const productId = product.id || product._id.toString();
    await Wishlist.findOneAndUpdate(
        { userId: customer._id },
        { $addToSet: { productIds: productId } },
        { upsert: true, new: true }
    );
    return {
        reply: `❤️ **Added to Wishlist**\n\n✔ **${product.name_en}** saved to your wishlist.\n\nYou can view it in:\nMy Account → Wishlist`,
        buttons: ["Show My Wishlist", "Continue Shopping"],
        action: 'wishlist_updated'
    };
}

async function handleRemoveFromWishlist(message, customer) {
    if (!customer) {
        return { reply: "🔐 Please log in to manage your wishlist.", buttons: ["Login"] };
    }
    const product = await findProductByName(message);
    if (!product) {
        return { reply: "Sorry, I couldn't find that product.", buttons: ["Show My Wishlist"] };
    }
    const productId = product.id || product._id.toString();
    await Wishlist.findOneAndUpdate(
        { userId: customer._id },
        { $pull: { productIds: productId } },
        { new: true }
    );
    return {
        reply: `🗑️ **Removed from Wishlist**\n\n**${product.name_en}** has been removed from your wishlist.`,
        buttons: ["Show My Wishlist", "Continue Shopping"],
        action: 'wishlist_updated'
    };
}

async function handleShowWishlist(customer) {
    if (!customer) {
        return { reply: "🔐 Please log in to view your wishlist.", buttons: ["Login"] };
    }
    const wishlist = await Wishlist.findOne({ userId: customer._id });
    if (!wishlist || !wishlist.productIds.length) {
        return { reply: "❤️ Your wishlist is empty!\n\nBrowse products and say *\"Add [product] to wishlist\"*.", buttons: ["Show Products", "Best Sellers"] };
    }
    const products = await Product.find({ id: { $in: wishlist.productIds } });
    if (products.length === 0) {
        return { reply: "❤️ Your wishlist is empty!", buttons: ["Show Products"] };
    }
    let reply = "❤️ **Your Wishlist:**\n\n";
    products.forEach((p, i) => {
        const price = p.weightOptions?.length > 0
            ? `from ₹${Math.min(...p.weightOptions.map(w => w.price))}`
            : `₹${p.basePrice}`;
        reply += `${i + 1}. **${p.name_en}** — ${price}`;
        if (!p.available) reply += ' ❌ Unavailable';
        reply += '\n';
    });
    reply += `\nSay *"Add [product] to cart"* to purchase!`;
    return { reply, buttons: ["Show Products", "Show My Cart"] };
}

// ==================== RECOMMENDATION HANDLER ====================

async function handleRecommendation(customer) {
    if (!customer) {
        const bestSellers = await Product.find({ available: true }).sort({ totalSold: -1 }).limit(5).lean();
        let reply = "🌟 **Recommended for You:**\n\n";
        bestSellers.forEach((p, i) => {
            const price = p.weightOptions?.length > 0 ? `from ₹${Math.min(...p.weightOptions.map(w => w.price))}` : `₹${p.basePrice}`;
            reply += `${i + 1}. **${p.name_en}** — ${price}\n`;
        });
        reply += "\nLog in for personalized recommendations!";
        return { reply, buttons: ["Show Products", "Best Sellers"] };
    }

    // Fetch user's order history
    const orders = await Order.find({ customer: customer._id }).sort({ createdAt: -1 }).limit(10).lean();
    const cart = await Cart.findOne({ userId: customer._id }).lean();
    const wishlist = await Wishlist.findOne({ userId: customer._id }).lean();

    // Build preference profile
    const orderedProductNames = [];
    const orderedCategories = {};
    orders.forEach(o => {
        (o.items || []).forEach(item => {
            orderedProductNames.push(item.name);
        });
    });

    // Find products from ordered names to get categories
    if (orderedProductNames.length > 0) {
        const orderedProducts = await Product.find({
            name_en: { $in: orderedProductNames.map(n => new RegExp(n, 'i')) }
        }).lean();
        orderedProducts.forEach(p => {
            orderedCategories[p.category] = (orderedCategories[p.category] || 0) + 1;
        });
    }

    let reply = "🌟 **Personalized Recommendations**\n\n";

    if (orderedProductNames.length > 0) {
        reply += "Based on your previous orders:\n";
        const uniqueNames = [...new Set(orderedProductNames)].slice(0, 3);
        uniqueNames.forEach(n => { reply += `• ${n}\n`; });
        reply += "\n";
    }

    // Suggest from preferred categories or top sellers
    const preferredCats = Object.entries(orderedCategories).sort((a, b) => b[1] - a[1]).map(e => e[0]);
    const alreadyOrdered = orderedProductNames.map(n => n.toLowerCase());
    const cartIds = (cart?.items || []).map(i => i.productId);
    const wishlistIds = wishlist?.productIds || [];

    let suggestions;
    if (preferredCats.length > 0) {
        suggestions = await Product.find({
            category: { $in: preferredCats },
            available: true,
            id: { $nin: [...cartIds, ...wishlistIds] }
        }).sort({ totalSold: -1 }).limit(5).lean();
        suggestions = suggestions.filter(p => !alreadyOrdered.includes(p.name_en.toLowerCase()));
    }

    if (!suggestions || suggestions.length === 0) {
        suggestions = await Product.find({ available: true }).sort({ totalSold: -1 }).limit(5).lean();
    }

    reply += "**Recommended Products:**\n\n";
    suggestions.slice(0, 5).forEach((p, i) => {
        const price = p.weightOptions?.length > 0 ? `from ₹${Math.min(...p.weightOptions.map(w => w.price))}` : `₹${p.basePrice}`;
        reply += `${i + 1}. **${p.name_en}** — ${price}\n`;
    });

    return { reply, buttons: ["Show Products", "Show My Cart"] };
}

// ==================== PRICE CALCULATION HANDLER ====================

async function handlePriceCalculation(message) {
    const qtyMatch = message.match(/(\d+)\s*(kg|g|gram|kilo)/i);
    if (!qtyMatch) {
        return { reply: "Please specify a quantity, e.g., *\"How much does 100kg mixture cost?\"*" };
    }

    const rawQty = parseInt(qtyMatch[1]);
    const unit = qtyMatch[2].toLowerCase();
    const qtyInKg = (unit === 'g' || unit === 'gram') ? rawQty / 1000 : rawQty;
    const displayQty = `${rawQty}${unit === 'gram' ? 'g' : unit === 'kilo' ? 'kg' : unit}`;

    const product = await findProductByName(message);
    if (!product) {
        return { reply: "Sorry, I couldn't find that product. Try *\"Show products\"* to browse.", buttons: ["Show Products"] };
    }

    // Find per-kg price
    let pricePerKg = product.basePrice;
    if (product.weightOptions?.length > 0) {
        const kgOption = product.weightOptions.find(w => {
            const nw = normalizeWeight(w.weight, w.unit).toLowerCase();
            return nw === '1kg' || nw === '1000g';
        });
        if (kgOption) {
            pricePerKg = kgOption.price;
        } else {
            // Calculate from first available option
            const first = product.weightOptions[0];
            const fw = normalizeWeight(first.weight, first.unit).toLowerCase();
            const fgMatch = fw.match(/(\d+)(kg|g)/);
            if (fgMatch) {
                const fgrams = fgMatch[2] === 'kg' ? parseInt(fgMatch[1]) * 1000 : parseInt(fgMatch[1]);
                pricePerKg = Math.round((first.price / fgrams) * 1000);
            }
        }
    }

    const totalPrice = Math.round(pricePerKg * qtyInKg);
    const formattedTotal = totalPrice.toLocaleString('en-IN');

    return {
        reply: `💰 **Price Calculation**\n\n` +
            `• Product: **${product.name_en}**\n` +
            `• Price per kg: ₹${pricePerKg}\n` +
            `• Requested quantity: ${displayQty}\n\n` +
            `**🧾 Total Price: ₹${formattedTotal}**\n\n` +
            `Note: For bulk orders (10kg+), contact us for special pricing!`,
        buttons: [`Add ${displayQty} ${product.name_en} to cart`, "Contact Us"]
    };
}

// ==================== BUY NOW HANDLER ====================

async function handleBuyNow(customer) {
    if (!customer) {
        return { reply: "🔐 Please log in to proceed with checkout.\n\nஉள்நுழையவும்.", buttons: ["Login"] };
    }

    const cart = await Cart.findOne({ userId: customer._id });
    if (!cart || cart.items.length === 0) {
        return { reply: "🛒 Your cart is empty! Add items first.\n\nBrowse our products by typing *\"Show products\"*.", buttons: ["Show Products", "Best Sellers"] };
    }

    // Calculate totals
    let subtotal = 0;
    let totalWeightKg = 0;
    let itemsSummary = '';
    cart.items.forEach((item, i) => {
        const itemTotal = item.unitPrice * item.quantity;
        subtotal += itemTotal;
        itemsSummary += `${i + 1}. ${item.name} (${item.weight}) × ${item.quantity} — ₹${itemTotal}\n`;
        const wMatch = item.weight.match(/(\d+)/);
        const wVal = wMatch ? parseInt(wMatch[1]) : 250;
        const wKg = item.weight.toLowerCase().includes('kg') ? wVal : wVal / 1000;
        totalWeightKg += wKg * item.quantity;
    });
    const delivery = Math.round(totalWeightKg * 60);
    const grandTotal = subtotal + delivery;

    return {
        reply: `🛒 **Checkout Summary**\n\n` +
            `${itemsSummary}\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `💰 Subtotal: ₹${subtotal}\n` +
            `🚚 Delivery: ₹${delivery}\n` +
            `**🧾 Grand Total: ₹${grandTotal}**\n\n` +
            `**Please confirm your details:**\n` +
            `• Name: ${customer.name}\n` +
            `• Phone: ${customer.phone || 'Not set'}\n` +
            `• Address: ${customer.address || 'Not set'}\n\n` +
            `Ready to proceed?`,
        buttons: ["Confirm & Continue", "Edit Details", "Show My Cart"],
        action: 'checkout_ready'
    };
}

// ==================== LLM FALLBACK ====================

async function handleWithLLM(message, session) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === 'your_groq_api_key') {
        return {
            reply: `I'm Heritage Eats assistant! Try these commands:\n\n` +
                `• *"Show products"* — Browse our menu\n` +
                `• *"Price of Murukku"* — Check prices\n` +
                `• *"Add Mysore Pak to cart"* — Add to cart\n` +
                `• *"Track my order"* — Order status\n` +
                `• *"help"* — All commands\n\n` +
                `நான் ஹெரிடேஜ் ஈட்ஸ் உதவியாளர்!`,
            buttons: ["Show Products", "Help"]
        };
    }

    // Fetch product data to inject into context
    const topProducts = await Product.find({ available: true }).sort({ totalSold: -1 }).limit(15).lean();
    const productContext = topProducts.map(p => {
        const price = p.weightOptions?.length > 0
            ? `from ₹${Math.min(...p.weightOptions.map(w => w.price))}`
            : `₹${p.basePrice}`;
        return `${p.name_en} (${p.category}) - ${price}`;
    }).join('; ');

    const knowledgeText = getKnowledgeText();

    const systemPrompt = `You are a professional AI assistant for Heritage Eats, an online homemade traditional food store from Tamil Nadu, India.

${knowledgeText}

Current products: ${productContext}

Rules:
- Be short, friendly, and helpful (max 3-4 sentences).
- Use the store information and product data above to answer questions.
- Respond in Tamil if user types Tamil. Respond in English otherwise.
- Do not invent product data or prices.
- Suggest relevant products when appropriate.
- Do not mention you are an AI model.
- For specific product details, suggest commands like "price of Murukku" or "ingredients of Mysore Pak".
- For cart operations, suggest "add Murukku to cart" or "show my cart".
- Categories: sweets, snacks, pickles, malts, podi.`;

    // Build messages with conversation history
    const messages = [{ role: 'system', content: systemPrompt }];
    if (session && session.conversationHistory.length > 0) {
        const recentHistory = session.conversationHistory.slice(-5);
        recentHistory.forEach(h => { messages.push({ role: h.role, content: h.content }); });
    } else {
        messages.push({ role: 'user', content: message });
    }

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: messages,
                max_tokens: 500,
                temperature: 0.7
            })
        });

        if (!response.ok) throw new Error('AI service unavailable');

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not process that request.';
        return { reply };
    } catch (error) {
        console.error('LLM error:', error);
        return {
            reply: `I can help you with:\n\n` +
                `🛒 *"Show products"* — Browse our menu\n` +
                `💰 *"Price of [product]"* — Check prices\n` +
                `🛍️ *"Add [product] to cart"* — Add items\n` +
                `📦 *"Track my order"* — Order status\n` +
                `\nType *"help"* for all commands!`,
            buttons: ["Show Products", "Help"]
        };
    }
}

// ==================== ADMIN COMMAND HANDLER ====================

async function handleAdminCommand(message) {
    const msg = message.toLowerCase().trim();

    // Show all users
    if (msg.includes('show') && msg.includes('user')) {
        const customers = await Customer.find().select('name phone email totalOrders totalSpent createdAt').sort({ createdAt: -1 }).limit(20).lean();
        if (customers.length === 0) return { reply: "No users found." };
        let reply = "👥 **All Users:**\n\n";
        customers.forEach((c, i) => {
            reply += `${i + 1}. **${c.name}** — ${c.phone || 'N/A'} — ${c.totalOrders || 0} orders — ₹${c.totalSpent || 0} spent\n`;
        });
        return { reply };
    }

    // Show all orders
    if (msg.includes('show') && msg.includes('order')) {
        const orders = await Order.find().populate('customer', 'name phone').sort({ createdAt: -1 }).limit(15).lean();
        if (orders.length === 0) return { reply: "No orders found." };
        let reply = "📋 **Recent Orders:**\n\n";
        orders.forEach((o, i) => {
            const cust = o.customer ? o.customer.name : 'Unknown';
            reply += `${i + 1}. **${o.orderId}** — ${cust} — ${o.orderStatus} — ₹${o.totalAmount}\n`;
        });
        return { reply };
    }

    // Show all products
    if (msg.includes('show') && msg.includes('product')) {
        const products = await Product.find().sort({ totalSold: -1 }).limit(20).lean();
        let reply = "🍽️ **All Products:**\n\n";
        products.forEach((p, i) => {
            const price = p.weightOptions?.length > 0 ? `from ₹${Math.min(...p.weightOptions.map(w => w.price))}` : `₹${p.basePrice}`;
            reply += `${i + 1}. **${p.name_en}** (${p.category}) — ${price} — ${p.totalSold || 0} sold — ${p.available ? '✅' : '❌'}\n`;
        });
        return { reply };
    }

    // Show reviews
    if (msg.includes('show') && msg.includes('review')) {
        const reviews = await Review.find().sort({ createdAt: -1 }).limit(10).lean();
        if (reviews.length === 0) return { reply: "No reviews found." };
        let reply = "⭐ **Recent Reviews:**\n\n";
        reviews.forEach((r, i) => {
            reply += `${i + 1}. **${r.customerName}** — ${'⭐'.repeat(r.rating)} — ${r.productName || 'General'}\n   "${r.comment}"\n`;
        });
        return { reply };
    }

    // Show analytics
    if (msg.includes('analytics') || msg.includes('stats') || msg.includes('dashboard')) {
        const totalOrders = await Order.countDocuments();
        const totalCustomers = await Customer.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalReviews = await Review.countDocuments();
        const revResult = await Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]);
        const totalRevenue = revResult.length > 0 ? revResult[0].total : 0;
        return {
            reply: `📊 **Analytics Dashboard**\n\n` +
                `• Total Orders: ${totalOrders}\n` +
                `• Total Revenue: ₹${totalRevenue.toLocaleString('en-IN')}\n` +
                `• Total Customers: ${totalCustomers}\n` +
                `• Total Products: ${totalProducts}\n` +
                `• Total Reviews: ${totalReviews}`
        };
    }

    // Change product price
    const priceChange = msg.match(/change\s*price\s*(?:of\s*)?(.+?)\s*to\s*(?:₹|rs\.?\s*)?(\d+)/i);
    if (priceChange) {
        const productName = priceChange[1].trim();
        const newPrice = parseInt(priceChange[2]);
        const product = await findProductByName(productName);
        if (!product) return { reply: `Product "${productName}" not found.` };
        product.basePrice = newPrice;
        if (product.weightOptions?.length > 0) {
            product.weightOptions[0].price = newPrice;
        }
        await product.save();
        return { reply: `✅ **Price Updated**\n\n**${product.name_en}** base price changed to ₹${newPrice}.` };
    }

    // Update product description
    const descChange = msg.match(/update\s*description\s*(?:of\s*)?(.+?)\s*to\s*(.+)/i);
    if (descChange) {
        const productName = descChange[1].trim();
        const newDesc = descChange[2].trim();
        const product = await findProductByName(productName);
        if (!product) return { reply: `Product "${productName}" not found.` };
        product.description_en = newDesc;
        await product.save();
        return { reply: `✅ **Description Updated**\n\n**${product.name_en}** description updated.` };
    }

    // Delete product
    const deleteMatch = msg.match(/delete\s*product\s*(.+)/i);
    if (deleteMatch) {
        const productName = deleteMatch[1].trim();
        const product = await findProductByName(productName);
        if (!product) return { reply: `Product "${productName}" not found.` };
        await Product.findByIdAndDelete(product._id);
        return { reply: `🗑️ **Product Deleted**\n\n**${product.name_en}** has been removed from the catalog.` };
    }

    return {
        reply: `🔧 **Admin Commands:**\n\n` +
            `• "Show all users"\n` +
            `• "Show all orders"\n` +
            `• "Show all products"\n` +
            `• "Show reviews"\n` +
            `• "Show analytics"\n` +
            `• "Change price of [product] to [price]"\n` +
            `• "Update description of [product] to [text]"\n` +
            `• "Delete product [name]"\n` +
            `• "Exit admin"`,
        buttons: ["Show All Users", "Show All Orders", "Show Analytics", "Exit Admin"]
    };
}

// ==================== MAIN HANDLER ====================

// @desc    Chat with intelligent assistant
// @route   POST /api/chat
const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        // Sanitize input
        const sanitizedMessage = message.trim().replace(/<[^>]*>/g, '').substring(0, 500);
        const customer = req.customer || null;
        const sessionId = customer ? customer._id.toString() : (req.ip || 'guest');
        const session = getSession(sessionId);

        // Track conversation in session
        session.conversationHistory.push({ role: 'user', content: sanitizedMessage });
        if (session.conversationHistory.length > 10) session.conversationHistory = session.conversationHistory.slice(-10);

        // ========== ADMIN MODE HANDLING ==========
        const adminSession = getAdminSession(sessionId);

        // Check if we're awaiting admin password
        if (adminSession && adminSession.awaitingPassword) {
            const adminPassword = process.env.ADMIN_PASSWORD || 'admin@123';
            if (sanitizedMessage === adminPassword) {
                adminSession.authenticated = true;
                adminSession.awaitingPassword = false;
                const result = { reply: "🔓 **Admin Mode Activated**\n\nYou now have admin privileges.\n\nType any admin command or say *\"exit admin\"* to leave.\n\nAdmin commands:\n• Show all users\n• Show all orders\n• Show all products\n• Show reviews\n• Show analytics\n• Change price of [product] to [price]\n• Delete product [name]", buttons: ["Show All Users", "Show All Orders", "Show Analytics", "Exit Admin"] };
                session.conversationHistory.push({ role: 'assistant', content: result.reply });
                return res.status(200).json({ success: true, data: { reply: result.reply, action: null, buttons: result.buttons, intent: 'ADMIN_AUTH' } });
            } else {
                adminSessions.delete(sessionId);
                const result = { reply: "❌ Incorrect password. Admin access denied." };
                session.conversationHistory.push({ role: 'assistant', content: result.reply });
                return res.status(200).json({ success: true, data: { reply: result.reply, action: null, intent: 'ADMIN_AUTH_FAIL' } });
            }
        }

        // If admin is authenticated, handle admin commands
        if (adminSession && adminSession.authenticated) {
            if (/^(exit\s*admin|logout\s*admin|admin\s*logout|leave\s*admin)$/i.test(sanitizedMessage)) {
                adminSessions.delete(sessionId);
                const result = { reply: "🔒 **Admin Mode Deactivated**\n\nYou are now in normal user mode." };
                session.conversationHistory.push({ role: 'assistant', content: result.reply });
                return res.status(200).json({ success: true, data: { reply: result.reply, action: null, intent: 'ADMIN_EXIT' } });
            }
            const result = await handleAdminCommand(sanitizedMessage);
            session.conversationHistory.push({ role: 'assistant', content: result.reply });
            return res.status(200).json({ success: true, data: { reply: result.reply, action: null, buttons: result.buttons || null, intent: 'ADMIN_CMD' } });
        }

        // Check for admin trigger
        if (/^iamtheadmin123$/i.test(sanitizedMessage)) {
            adminSessions.set(sessionId, { awaitingPassword: true, authenticated: false, lastActiveAt: Date.now() });
            const result = { reply: "🔐 **Admin Access**\n\nPlease enter the admin password:" };
            session.conversationHistory.push({ role: 'assistant', content: result.reply });
            return res.status(200).json({ success: true, data: { reply: result.reply, action: null, intent: 'ADMIN_TRIGGER' } });
        }

        // ========== NORMAL INTENT HANDLING ==========
        const intent = detectIntent(sanitizedMessage);
        let result;

        switch (intent) {
            case 'ADD_TO_WISHLIST':
                result = await handleAddToWishlist(sanitizedMessage, customer);
                break;
            case 'REMOVE_FROM_WISHLIST':
                result = await handleRemoveFromWishlist(sanitizedMessage, customer);
                break;
            case 'SHOW_WISHLIST':
                result = await handleShowWishlist(customer);
                break;
            case 'BUY_NOW':
                result = await handleBuyNow(customer);
                break;
            case 'ADD_TO_CART':
                result = await handleAddToCart(sanitizedMessage, customer);
                if (result.action === 'cart_updated') {
                    const product = await findProductByName(sanitizedMessage);
                    if (product) session.lastProduct = product.name_en;
                    session.lastAction = 'add_to_cart';
                }
                break;
            case 'REMOVE_FROM_CART':
                result = await handleRemoveFromCart(sanitizedMessage, customer);
                break;
            case 'SHOW_CART':
                result = await handleShowCart(customer);
                break;
            case 'CLEAR_CART':
                result = await handleClearCart(customer);
                break;
            case 'RECOMMENDATION':
                result = await handleRecommendation(customer);
                break;
            case 'PRICE_CALCULATION':
                result = await handlePriceCalculation(sanitizedMessage);
                break;
            case 'PRODUCT_QUERY':
                result = await handleProductQuery(sanitizedMessage);
                break;
            case 'PRODUCT_LIST':
                result = await handleProductList();
                break;
            case 'BEST_SELLERS':
                result = await handleBestSellers();
                break;
            case 'NEW_ARRIVALS':
                result = await handleNewArrivals();
                break;
            case 'CATEGORY_BROWSE':
                result = await handleCategoryBrowse(sanitizedMessage);
                break;
            case 'COMPARE':
                result = await handleCompare(sanitizedMessage);
                break;
            case 'ORDER_STATUS':
                result = await handleOrderStatus(customer);
                break;
            case 'MY_ORDERS':
                result = await handleMyOrders(customer);
                break;
            case 'DELIVERY_INFO':
                result = await handleDeliveryInfo();
                break;
            case 'HELP':
                result = handleHelp();
                break;
            case 'KNOWLEDGE': {
                const directAnswer = matchKnowledge(sanitizedMessage);
                if (directAnswer) {
                    result = { reply: directAnswer };
                } else {
                    result = await handleWithLLM(sanitizedMessage, session);
                }
                break;
            }
            case 'GREETING':
                result = handleGreeting();
                break;
            default: {
                const knowledgeAnswer = matchKnowledge(sanitizedMessage);
                if (knowledgeAnswer) {
                    result = { reply: knowledgeAnswer };
                } else {
                    result = await handleWithLLM(sanitizedMessage, session);
                }
                break;
            }
        }

        // Track bot response in session
        session.conversationHistory.push({ role: 'assistant', content: result.reply });

        res.status(200).json({
            success: true,
            data: {
                reply: result.reply,
                action: result.action || null,
                buttons: result.buttons || null,
                products: result.products || null,
                cartItems: result.cartItems || null,
                intent: intent
            }
        });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            success: false,
            message: 'Chat service is temporarily unavailable. Please try again later.'
        });
    }
};

module.exports = { sendMessage };

