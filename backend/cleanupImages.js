/**
 * One-time script to clean up all product images in MongoDB.
 * Removes empty strings, placeholder.svg entries, and whitespace-only entries.
 * 
 * Usage: node cleanupImages.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const products = await Product.find({});
        console.log(`Found ${products.length} products to check\n`);

        let updatedCount = 0;

        for (const product of products) {
            const original = product.images || [];
            // Keep only real, non-empty, non-placeholder image paths
            const cleaned = original.filter(
                img => img && typeof img === 'string' && img.trim() !== '' && img.trim() !== '/placeholder.svg'
            );

            const removed = original.length - cleaned.length;
            if (removed > 0) {
                product.images = cleaned;
                await product.save();
                updatedCount++;
                console.log(`✓ ${product.name_en || product.id}: removed ${removed} bad entries (${original.length} → ${cleaned.length})`);
                if (original.length > 0) {
                    console.log(`  Before: ${JSON.stringify(original)}`);
                    console.log(`  After:  ${JSON.stringify(cleaned)}`);
                }
            } else {
                console.log(`  ${product.name_en || product.id}: OK (${original.length} images)`);
            }
        }

        console.log(`\nDone! Updated ${updatedCount} out of ${products.length} products.`);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

cleanup();
