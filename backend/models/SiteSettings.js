const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    emoji: { type: String, default: '🎉' },
    title: { type: String, required: true },
    titleTa: { type: String, default: '' },
    description: { type: String, default: '' },
    discount: { type: String, default: '' },
    discountPercent: { type: Number, default: 0 }, // Numeric discount percentage
    originalPrice: { type: Number, default: 0 }, // Original price before discount
    discountedPrice: { type: Number, default: 0 }, // Price after discount
    color: { type: String, default: 'from-amber-500/20 to-orange-500/20' },
    image: { type: String, default: '' },
    productId: { type: String, default: '' }, // Link to product
    active: { type: Boolean, default: true },
    // Individual countdown timer for each offer
    offerStartTime: { type: Date, default: null },
    offerEndTime: { type: Date, default: null }
}, { _id: true });

const statSchema = new mongoose.Schema({
    icon: { type: String, default: '📊' },
    value: { type: Number, default: 0 },
    suffix: { type: String, default: '+' },
    labelEn: { type: String, required: true },
    labelTa: { type: String, default: '' }
}, { _id: false });

const galleryImageSchema = new mongoose.Schema({
    src: { type: String, required: true },
    alt: { type: String, default: '' },
    caption: { type: String, default: '' },
    captionTa: { type: String, default: '' },
    span: { type: String, default: '' }
}, { _id: false });

const siteSettingsSchema = new mongoose.Schema({
    // Special Offers
    offersVisible: { type: Boolean, default: true },
    offers: { type: [offerSchema], default: [] },

    // Stats Counter
    statsVisible: { type: Boolean, default: true },
    statsAutoCompute: { type: Boolean, default: false },
    stats: { type: [statSchema], default: [] },

    // Gallery
    galleryVisible: { type: Boolean, default: true },
    gallery: { type: [galleryImageSchema], default: [] },

    // ─── Countdown Timer (Persistent) ───
    countdownEnabled: { type: Boolean, default: false },
    countdownOfferEndDate: { type: Date, default: null },
    countdownOfferTitle: { type: String, default: 'Special Offer!' },
    countdownOfferTitleTa: { type: String, default: 'சிறப்பு சலுகை!' },
    countdownOfferDescription: { type: String, default: '' },
    countdownCreatedAt: { type: Date, default: null },

    // ─── Theme Settings (Admin-controlled) ───
    defaultTheme: { type: String, default: 'classic-red' },
    enabledThemes: {
        type: [String],
        default: [
            'classic-red', 'royal-purple', 'emerald-green', 'royal-blue',
            'sunset-orange', 'chocolate-brown', 'luxury-black-gold', 'soft-pastel'
        ]
    }
}, {
    timestamps: true
});

// Ensure only one document exists (singleton)
siteSettingsSchema.statics.getSettings = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({
            offersVisible: true,
            offers: [
                { emoji: '🍬', title: 'Festive Sweet Box', titleTa: 'பண்டிகை இனிப்பு பெட்டி', description: 'Assorted premium sweets combo pack — perfect for celebrations!', discount: '20% OFF', color: 'from-amber-500/20 to-orange-500/20', active: true },
                { emoji: '🌶️', title: 'Pickle Combo Deal', titleTa: 'ஊறுகாய் சிறப்பு ஆஃபர்', description: 'Buy any 3 pickle varieties and get special bundle pricing!', discount: 'Buy 3 Save ₹150', color: 'from-red-500/20 to-rose-500/20', active: true },
                { emoji: '🎉', title: 'New Customer Offer', titleTa: 'புதிய வாடிக்கையாளர் ஆஃபர்', description: 'First order? Get a special welcome discount on your entire order!', discount: '15% OFF', color: 'from-emerald-500/20 to-teal-500/20', active: true }
            ],
            statsVisible: true,
            statsAutoCompute: false,
            stats: [
                { icon: '😊', value: 1000, suffix: '+', labelEn: 'Happy Customers', labelTa: 'மகிழ்ச்சியான வாடிக்கையாளர்கள்' },
                { icon: '🍬', value: 50, suffix: '+', labelEn: 'Products', labelTa: 'தயாரிப்புகள்' },
                { icon: '📦', value: 10000, suffix: '+', labelEn: 'Orders Delivered', labelTa: 'ஆர்டர்கள் வழங்கப்பட்டன' },
                { icon: '🕰️', value: 25, suffix: '+', labelEn: 'Years of Tradition', labelTa: 'ஆண்டுகள் பாரம்பரியம்' }
            ],
            galleryVisible: true,
            gallery: [
                { src: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80', alt: 'Traditional Indian Sweets', caption: 'Traditional Sweets', captionTa: 'பாரம்பரிய இனிப்புகள்', span: 'md:row-span-2' },
                { src: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&q=80', alt: 'Spicy Pickles', caption: 'Homemade Pickles', captionTa: 'வீட்டு ஊறுகாய்', span: '' },
                { src: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=600&q=80', alt: 'Indian Snacks', caption: 'Crunchy Snacks', captionTa: 'மொறுமொறு தின்பண்டங்கள்', span: '' },
                { src: 'https://images.unsplash.com/photo-1606471191009-63994c53433b?w=600&q=80', alt: 'Fresh Ingredients', caption: 'Fresh Ingredients', captionTa: 'புதிய பொருட்கள்', span: '' },
                { src: 'https://images.unsplash.com/photo-1590080875852-ba44f302c8ba?w=600&q=80', alt: 'Traditional Cooking', caption: 'Traditional Cooking', captionTa: 'பாரம்பரிய சமையல்', span: 'md:col-span-2' },
                { src: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=600&q=80', alt: 'Festive Box', caption: 'Gift Boxes', captionTa: 'பரிசு பெட்டிகள்', span: '' }
            ]
        });
    }
    return settings;
};

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
