import express from 'express';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';

const router = express.Router();

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const notifications = await Notification.find({
            $or: [
                { user: req.user._id },
                { user: null } // Global announcements
            ]
        })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('relatedOrder', 'orderNumber status');

        const unreadCount = await Notification.countDocuments({
            $or: [
                { user: req.user._id },
                { user: null }
            ],
            isRead: false
        });

        res.json({ notifications, unreadCount });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
router.patch('/:id/read', protect, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Check if user owns this notification or it's a global one
        if (notification.user && notification.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        notification.isRead = true;
        await notification.save();

        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @desc    Create notification (Admin)
// @route   POST /api/admin/notifications
// @access  Admin
router.post('/admin', protect, admin, async (req, res) => {
    try {
        const { user, type, title, message, relatedOrder } = req.body;

        const notification = await Notification.create({
            user: user || null,
            type,
            title,
            message,
            relatedOrder
        });

        // Emit real-time event
        const io = req.app.get('socketio');
        if (user) {
            io.to(`user_${user}`).emit('new_notification', notification);
        } else {
            io.emit('new_notification', notification); // Global
        }

        res.status(201).json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @desc    Get all notifications (Admin)
// @route   GET /api/admin/notifications
// @access  Admin
router.get('/admin', protect, admin, async (req, res) => {
    try {
        const notifications = await Notification.find()
            .sort({ createdAt: -1 })
            .populate('user', 'name email')
            .populate('relatedOrder', 'orderNumber');

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
