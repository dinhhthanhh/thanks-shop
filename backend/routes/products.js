import express from 'express';
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/productController.js';
import { protect } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';
import Product from '../models/Product.js';
import { uploadProductImages } from '../middleware/upload.js';

const router = express.Router();

// @desc    Upload product images
// @route   POST /api/products/upload-images
// @access  Private/Admin
router.post('/upload-images', protect, admin, uploadProductImages.array('images', 10), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        // Return array of image URLs
        const imageUrls = req.files.map(file => `/uploads/products/${file.filename}`);
        res.json({ images: imageUrls });
    } catch (error) {
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
});

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.json([]);
        }

        const searchRegex = new RegExp(q, 'i');
        const products = await Product.find({
            $or: [
                { name: searchRegex },
                { description: searchRegex }
            ]
        }).populate('category');

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

export default router;
