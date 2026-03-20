/**
 * ═══════════════════════════════════════════════════════════
 *  HERITAGE EATS — CHATBOT CUSTOM KNOWLEDGE
 * ═══════════════════════════════════════════════════════════
 * 
 *  Edit this file to add/update business information that
 *  the chatbot will use to answer customer questions.
 * 
 *  The chatbot will use this data when customers ask about:
 *   - Store/owner details
 *   - Contact information
 *   - Business hours
 *   - Return/refund policies
 *   - Shipping policies
 *   - Any custom FAQ
 * 
 *  Just update the fields below and restart the server.
 * ═══════════════════════════════════════════════════════════
 */

const BUSINESS_INFO = {
    // ──── Store Details ────
    storeName: "Maghizam Homemade Delights",
    storeNameTamil: "மகிழம் இல்லத்தில் செய்த உணவுகள்",
    tagline: "Authentic Tamil Nadu Homemade Traditional Foods",
    taglineTamil: "உண்மையான தமிழ்நாடு வீட்டு பாரம்பரிய உணவுகள்",

    // ──── Owner / About ────
    ownerName: "Mythily & Kalarani",
    aboutUs: "Maghizam Homemade Delights is a homemade traditional food store specializing in authentic Tamil Nadu sweets, snacks, pickles, health malts, and traditional podi. All our products are handmade with love using traditional recipes passed down through generations. We use only pure, natural ingredients with no preservatives or artificial additives.",
    aboutUsTamil: "மகிழம் இல்லத்தில் செய்த உணவுகள் என்பது தமிழ்நாட்டின் பாரம்பரிய இனிப்புகள், தின்பண்டங்கள், ஊறுகாய், ஆரோக்கிய மால்ட் மற்றும் பாரம்பரிய பொடி ஆகியவற்றில் நிபுணத்துவம் பெற்ற வீட்டு தயாரிப்பு கடையாகும்.",

    // ──── Contact Information ────
    phone: "Mythily - 9751188414, Kalarani - 82220557761",
    email: "contact.tdhms@gmail.com",
    whatsapp: "+91 9751188414",
    instagram: "@maghizamdelights",

    // ──── Location ────
    location: "Namakkal, Tamil Nadu, India",
    address: "1/215,Ganapathy nagar,vaiyappamalai post,tiruchengode taluk, namakkal Dt - 637410",

    // ──── Business Hours ────
    businessHours: "Monday to Saturday: 9:00 AM - 8:00 PM, Sunday: 10:00 AM - 6:00 PM",
    businessHoursTamil: "திங்கள் முதல் சனி: காலை 9:00 - இரவு 8:00, ஞாயிறு: காலை 10:00 - மாலை 6:00",

    // ──── Shipping Policy ────
    shippingPolicy: "We deliver EXCLUSIVELY within Tamil Nadu. We do not ship to other states or internationally to ensure the freshness of our traditional foods. Delivery charges are calculated based on weight at ₹60 per kg. Orders are typically dispatched within 1-2 business days. Delivery takes 2-4 days depending on your location in Tamil Nadu.",
    shippingPolicyTamil: "நாங்கள் தமிழ்நாடு முழுவதும் மட்டுமே டெலிவரி செய்கிறோம். உணவின் புத்துணர்ச்சியை உறுதி செய்வதற்காக பிற மாநிலங்களுக்கு அனுப்புவதில்லை. கிலோவுக்கு ₹60 என டெலிவரி கட்டணம்.",

    // ──── Return & Refund ────
    returnPolicy: "Due to the perishable nature of our products, we do not accept returns. However, if you receive a damaged or incorrect product, please contact us within 24 hours with photos, and we will arrange a replacement or refund.",
    returnPolicyTamil: "உணவுப் பொருட்கள் என்பதால் திருப்பி அனுப்ப இயலாது. ஆனால் சேதமடைந்த பொருள் வந்தால் 24 மணி நேரத்திற்குள் எங்களை தொடர்பு கொள்ளுங்கள்.",

    // ──── Payment Methods ────
    paymentMethods: "We accept Razorpay (Credit Card, Debit Card, UPI, Net Banking, Wallets).",

    // ──── Quality Assurance ────
    qualityInfo: "All products are freshly prepared to order. We use 100% pure ingredients with no preservatives, artificial colors, or flavoring. Each product is hygienically packed and quality checked before dispatch.",
    qualityInfoTamil: "அனைத்து பொருட்களும் ஆர்டருக்கு பிறகு புதிதாக தயாரிக்கப்படுகின்றன. 100% தூய பொருட்கள், செயற்கை நிறங்கள் இல்லை.",

    // ──── Custom FAQs ────
    // Add any additional Q&A pairs here
    customFAQs: [
        {
            question: "Are your products vegetarian?",
            answer: "Yes! All our products are 100% pure vegetarian. We are a completely vegetarian store.",
            questionTamil: "உங்கள் பொருட்கள் சைவமா?",
            answerTamil: "ஆம்! எங்கள் அனைத்து பொருட்களும் 100% சைவம்."
        },
        {
            question: "Do you use preservatives?",
            answer: "No, we do not use any preservatives or artificial additives. All our products are made with natural ingredients only.",
            answerTamil: "இல்லை, நாங்கள் எந்த பதப்படுத்திகளையும் பயன்படுத்துவதில்லை."
        },
        {
            question: "Can I place bulk orders?",
            answer: "Yes! We accept bulk orders for events, weddings, and corporate gifts. Please contact us directly for bulk pricing and customization options.",
            answerTamil: "ஆம்! நிகழ்வுகள் மற்றும் திருமணங்களுக்கு மொத்த ஆர்டர்கள் ஏற்றுக்கொள்கிறோம்."
        },
        {
            question: "How long do your products last?",
            answer: "Shelf life varies by product — typically 15-30 days for sweets, 30-60 days for snacks and podi, and 3-6 months for pickles. Each product page lists its specific shelf life.",
            answerTamil: "இனிப்புகள் 15-30 நாட்கள், தின்பண்டங்கள் 30-60 நாட்கள், ஊறுகாய் 3-6 மாதங்கள்."
        }
    ]
};

// ──── Owner + Contact combined block (shown in all relevant responses) ────
function getOwnerContactBlock() {
    return `\n\n━━━━━━━━━━━━━━━━━━\n👤 Owner: **${BUSINESS_INFO.ownerName}**\n📱 Phone: ${BUSINESS_INFO.phone}\n📧 Email: ${BUSINESS_INFO.email}\n💬 WhatsApp: ${BUSINESS_INFO.whatsapp}\n📸 Instagram: ${BUSINESS_INFO.instagram}\n📍 Location: ${BUSINESS_INFO.location}\n🕐 Hours: ${BUSINESS_INFO.businessHours}`;
}

// ──── Format the knowledge into a text block for the LLM ────
function getKnowledgeText() {
    let text = `STORE INFORMATION:\n`;
    text += `Store: ${BUSINESS_INFO.storeName} (${BUSINESS_INFO.storeNameTamil})\n`;
    text += `Tagline: ${BUSINESS_INFO.tagline}\n`;
    text += `Owner: ${BUSINESS_INFO.ownerName}\n`;
    text += `About: ${BUSINESS_INFO.aboutUs}\n`;
    text += `Phone: ${BUSINESS_INFO.phone}\n`;
    text += `Email: ${BUSINESS_INFO.email}\n`;
    text += `WhatsApp: ${BUSINESS_INFO.whatsapp}\n`;
    text += `Instagram: ${BUSINESS_INFO.instagram}\n`;
    text += `Location: ${BUSINESS_INFO.location}\n`;
    text += `Hours: ${BUSINESS_INFO.businessHours}\n`;
    text += `Shipping: ${BUSINESS_INFO.shippingPolicy}\n`;
    text += `Returns: ${BUSINESS_INFO.returnPolicy}\n`;
    text += `Payment: ${BUSINESS_INFO.paymentMethods}\n`;
    text += `Quality: ${BUSINESS_INFO.qualityInfo}\n`;

    if (BUSINESS_INFO.customFAQs.length > 0) {
        text += `\nFAQs:\n`;
        BUSINESS_INFO.customFAQs.forEach(faq => {
            text += `Q: ${faq.question}\nA: ${faq.answer}\n`;
        });
    }

    return text;
}

// ──── Match user message against knowledge base for direct answers ────
function matchKnowledge(message) {
    const msg = message.toLowerCase();
    const contactBlock = getOwnerContactBlock();

    // Owner / About
    if (msg.includes('owner') || (msg.includes('who') && (msg.includes('run') || msg.includes('own') || msg.includes('behind') || msg.includes('founded') || msg.includes('started')))) {
        return `🏪 **About ${BUSINESS_INFO.storeName}:**\n\n${BUSINESS_INFO.aboutUs}${contactBlock}`;
    }

    if (msg.includes('about') && (msg.includes('store') || msg.includes('shop') || msg.includes('you') || msg.includes('company') || msg.includes('heritage'))) {
        return `🏪 **${BUSINESS_INFO.storeName}** — ${BUSINESS_INFO.tagline}\n\n${BUSINESS_INFO.aboutUs}${contactBlock}`;
    }

    // Contact
    if (msg.includes('contact') || msg.includes('phone') || msg.includes('call') || msg.includes('email') || msg.includes('reach') || msg.includes('whatsapp') || msg.includes('instagram')) {
        return `📞 **Contact ${BUSINESS_INFO.storeName}:**${contactBlock}`;
    }

    // Hours
    if (msg.includes('hour') || msg.includes('timing') || msg.includes('open') || msg.includes('close')) {
        return `🕐 **Business Hours:**\n\n${BUSINESS_INFO.businessHours}\n\n${BUSINESS_INFO.businessHoursTamil}${contactBlock}`;
    }

    // Location
    if (msg.includes('location') || msg.includes('address') || (msg.includes('where') && (msg.includes('located') || msg.includes('store') || msg.includes('shop')))) {
        return `📍 **Location:**\n\n${BUSINESS_INFO.address}${contactBlock}`;
    }

    // Shipping
    if (msg.includes('shipping') || msg.includes('dispatch') || (msg.includes('how long') && msg.includes('deliver'))) {
        return `🚚 **Shipping Policy:**\n\n${BUSINESS_INFO.shippingPolicy}${contactBlock}`;
    }

    // Return/Refund
    if (msg.includes('return') || msg.includes('refund') || msg.includes('exchange') || msg.includes('damaged') || msg.includes('wrong')) {
        return `🔄 **Return & Refund Policy:**\n\n${BUSINESS_INFO.returnPolicy}${contactBlock}`;
    }

    // Payment
    if (msg.includes('payment') || (msg.includes('pay') && (msg.includes('method') || msg.includes('option') || msg.includes('how')))) {
        return `💳 **Payment Methods:**\n\n${BUSINESS_INFO.paymentMethods}${contactBlock}`;
    }

    // Quality
    if (msg.includes('quality') || msg.includes('preservative') || msg.includes('natural') || msg.includes('pure') || msg.includes('hygien')) {
        return `✨ **Quality Assurance:**\n\n${BUSINESS_INFO.qualityInfo}${contactBlock}`;
    }

    // Check custom FAQs
    for (const faq of BUSINESS_INFO.customFAQs) {
        const keywords = faq.question.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const matchCount = keywords.filter(kw => msg.includes(kw)).length;
        if (matchCount >= 2 || (keywords.length <= 3 && matchCount >= 1)) {
            const isTamil = /[\u0B80-\u0BFF]/.test(message);
            if (isTamil && faq.answerTamil) {
                return faq.answerTamil + contactBlock;
            }
            return faq.answer + contactBlock;
        }
    }

    return null;
}

module.exports = { BUSINESS_INFO, getKnowledgeText, matchKnowledge };
