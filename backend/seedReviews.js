const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Review = require('./models/Review');
const connectDB = require('./config/db');

dotenv.config();

const reviews = [
    {
        customerName: "Priya S.",
        rating: 5,
        comment: "The Mysore Pak melts in your mouth! Tastes just like my grandmother used to make. Highly recommended!",
        productId: "mysore-pak",
        approved: true,
        createdAt: new Date("2024-01-15")
    },
    {
        customerName: "Rajesh K.",
        rating: 5,
        comment: "Best murukku I've ever had. Perfectly crunchy and the spice level is just right. Will order again!",
        productId: "murukku",
        approved: true,
        createdAt: new Date("2024-01-20")
    },
    {
        customerName: "Lakshmi M.",
        rating: 4,
        comment: "The peanut ladoos are amazing. Natural sweetness from jaggery. Great for kids!",
        productId: "peanut-ladoo",
        approved: true,
        createdAt: new Date("2024-02-01")
    },
    {
        customerName: "Suresh R.",
        rating: 5,
        comment: "Pirandai thokku is excellent! Helps with digestion and tastes authentic. Good packaging too.",
        productId: "pirandai-thokku",
        approved: true,
        createdAt: new Date("2024-02-10")
    },
    {
        customerName: "Meena V.",
        rating: 5,
        comment: "Ordered for Diwali. Everyone loved the sweets! Fresh and homemade taste. Thank you!",
        productId: "",
        approved: true,
        createdAt: new Date("2024-02-15")
    },
    {
        customerName: "Kumar A.",
        rating: 4,
        comment: "Black sesame ladoo is so healthy and tasty. My whole family enjoyed it. Great quality!",
        productId: "black-sesame-ladoo",
        approved: true,
        createdAt: new Date("2024-02-20")
    },
    {
        customerName: "Anitha P.",
        rating: 5,
        comment: "The mixture is addictive! Perfect crunch and spice. Goes great with evening tea.",
        productId: "mixture",
        approved: true,
        createdAt: new Date("2024-03-01")
    },
    {
        customerName: "Venkat S.",
        rating: 5,
        comment: "Tomato thokku is so flavorful! Reminds me of home cooking. Will definitely reorder.",
        productId: "tomato-thokku",
        approved: true,
        createdAt: new Date("2024-03-05")
    }
];

const seedReviews = async () => {
    try {
        await connectDB();

        const existing = await Review.countDocuments();
        if (existing > 0) {
            console.log(`Reviews collection already has ${existing} documents. Clearing and re-seeding...`);
            await Review.deleteMany({});
        }

        const inserted = await Review.insertMany(reviews);
        console.log(`✅ Successfully seeded ${inserted.length} reviews into MongoDB!`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding reviews:', error.message);
        process.exit(1);
    }
};

seedReviews();
