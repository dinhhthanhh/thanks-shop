import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a product name'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide a product description'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Please provide a price'],
        min: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Please provide a category']
    },
    images: {
        type: [String],
        default: ['https://placehold.co/400x400?text=Product+Image']
    },
    image: {
        type: String,
        default: 'https://placehold.co/400x400?text=Product+Image'
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    soldCount: {
        type: Number,
        default: 0,
        min: 0
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviewCount: {
        type: Number,
        default: 0,
        min: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add index for search
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

export default Product;
