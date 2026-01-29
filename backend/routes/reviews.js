import express from 'express';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get all reviews for a product
router.get('/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const reviews = await Review.find({ product: productId })
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Review.countDocuments({ product: productId });

        res.json({
            reviews,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalReviews: total
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Check if user can review a product (has purchased it)
router.get('/:productId/can-review', protect, async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;

        // Check if user has already reviewed
        const existingReview = await Review.findOne({
            user: userId,
            product: productId
        });

        if (existingReview) {
            return res.json({
                canReview: false,
                reason: 'already_reviewed',
                review: existingReview
            });
        }

        // Check if user has purchased this product
        const hasPurchased = await Order.findOne({
            user: userId,
            'items.product': productId,
            status: 'completed'
        });

        if (!hasPurchased) {
            return res.json({
                canReview: false,
                reason: 'not_purchased'
            });
        }

        res.json({ canReview: true });
    } catch (error) {
        console.error('Error checking review eligibility:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a review
router.post('/:productId', protect, async (req, res) => {
    try {
        const { productId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user._id;

        // Validate input
        if (!rating || !comment) {
            return res.status(400).json({ message: 'Rating and comment are required' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if user has already reviewed
        const existingReview = await Review.findOne({
            user: userId,
            product: productId
        });

        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this product' });
        }

        // Check if user has purchased this product
        const hasPurchased = await Order.findOne({
            user: userId,
            'items.product': productId,
            status: 'completed'
        });

        if (!hasPurchased) {
            return res.status(403).json({ message: 'You must purchase this product before reviewing' });
        }

        // Create review
        const review = await Review.create({
            user: userId,
            product: productId,
            rating,
            comment
        });

        // Update product rating statistics
        await updateProductRating(productId);

        const populatedReview = await Review.findById(review._id).populate('user', 'name');

        // Send notification to all admins
        try {
            const admins = await User.find({ role: 'admin' });
            const notificationPromises = admins.map(admin =>
                Notification.create({
                    user: admin._id,
                    type: 'review',
                    title: 'New Product Review',
                    message: `${req.user.name} reviewed "${product.name}" with ${rating} stars`
                })
            );
            await Promise.all(notificationPromises);

            // Emit socket event to all admins
            const io = req.app.get('socketio');
            if (io) {
                admins.forEach(admin => {
                    io.to(`user_${admin._id}`).emit('new_notification', {
                        type: 'review',
                        title: 'New Product Review',
                        message: `${req.user.name} reviewed "${product.name}" with ${rating} stars`
                    });
                });
            }
        } catch (notifError) {
            console.error('Failed to send admin notification:', notifError);
        }

        res.status(201).json(populatedReview);
    } catch (error) {
        console.error('Error creating review:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already reviewed this product' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a review
router.put('/:reviewId', protect, async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user._id;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user owns this review
        if (review.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this review' });
        }

        // Update review
        if (rating) review.rating = rating;
        if (comment) review.comment = comment;

        await review.save();

        // Update product rating statistics
        await updateProductRating(review.product);

        const updatedReview = await Review.findById(reviewId).populate('user', 'name');

        res.json(updatedReview);
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a review
router.delete('/:reviewId', protect, async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user._id;
        const isAdmin = req.user.role === 'admin';

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user owns this review OR is an admin
        if (review.user.toString() !== userId.toString() && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }

        const productId = review.product;

        await Review.findByIdAndDelete(reviewId);

        // Update product rating statistics
        await updateProductRating(productId);

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Helper function to update product rating statistics
async function updateProductRating(productId) {
    const reviews = await Review.find({ product: productId });

    const reviewCount = reviews.length;
    const averageRating = reviewCount > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
        : 0;

    await Product.findByIdAndUpdate(productId, {
        reviewCount,
        averageRating: Math.round(averageRating * 10) / 10 // Round to 1 decimal
    });
}

export default router;
