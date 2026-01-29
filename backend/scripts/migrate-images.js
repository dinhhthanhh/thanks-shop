import mongoose from 'mongoose';
import Product from '../models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

const migrateProductImages = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('📦 Connected to MongoDB');

        // Find all products with old 'image' field (string) instead of 'images' array
        const products = await Product.find({});
        console.log(`Found ${products.length} products to check`);

        let migratedCount = 0;
        let skippedCount = 0;

        for (const product of products) {
            // Check if product has old image field and no images array
            if (product.image && (!product.images || product.images.length === 0)) {
                console.log(`Migrating product: ${product.name}`);

                // Convert single image to array
                product.images = [product.image];

                // Remove old image field
                product.image = undefined;

                await product.save();
                migratedCount++;
            } else if (product.images && product.images.length > 0) {
                // Already migrated
                skippedCount++;
            } else {
                console.log(`⚠️  Product ${product.name} has no image`);
            }
        }

        console.log(`\n✅ Migration complete!`);
        console.log(`   Migrated: ${migratedCount} products`);
        console.log(`   Skipped: ${skippedCount} products (already migrated)`);
        console.log(`   Total: ${products.length} products`);

        await mongoose.disconnect();
        console.log('📦 Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

migrateProductImages();
