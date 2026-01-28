import express from 'express';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { protect } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';
import Settings from '../models/Settings.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// @desc    Get or create conversation
// @route   GET /api/chat/conversation
// @access  Private
router.get('/conversation', protect, async (req, res) => {
    try {
        let conversation = await Conversation.findOne({ user: req.user._id });

        if (!conversation) {
            conversation = await Conversation.create({
                user: req.user._id
            });
        }

        res.json(conversation);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @desc    Get conversation messages
// @route   GET /api/chat/:conversationId/messages
// @access  Private
router.get('/:conversationId/messages', protect, async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.conversationId);

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // Check authorization
        if (conversation.user.toString() !== req.user._id.toString() && !req.user.role.includes('admin')) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const messages = await Message.find({ conversation: req.params.conversationId })
            .sort({ createdAt: 1 })
            .populate('sender', 'name');

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @desc    Send message
// @route   POST /api/chat/:conversationId/messages
// @access  Private
router.post('/:conversationId/messages', protect, async (req, res) => {
    try {
        const { message, attachments } = req.body;
        const conversation = await Conversation.findById(req.params.conversationId);

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // Check authorization
        const isAdmin = req.user.role && req.user.role.includes('admin');
        const isOwner = conversation.user.toString() === req.user._id.toString();

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const newMessage = await Message.create({
            conversation: req.params.conversationId,
            sender: req.user._id,
            senderType: isAdmin ? 'admin' : 'user',
            message,
            status: 'delivered',
            attachments: attachments || []
        });

        // Update conversation
        conversation.lastMessage = message;
        conversation.lastMessageAt = new Date();
        if (!isAdmin) {
            conversation.unreadCount += 1;
        }
        await conversation.save();

        await newMessage.populate('sender', 'name');

        // Emit real-time event
        const io = req.app.get('socketio');
        io.to(req.params.conversationId).emit('new_message', newMessage);

        // Notify Admin specifically if user is sending
        if (!isAdmin) {
            io.emit('new_admin_message', {
                conversationId: req.params.conversationId,
                message: newMessage,
                userName: req.user.name
            });

            // Send auto-reply if this is the first user message and admin hasn't replied yet
            if (!conversation.hasAutoReplied) {
                const settings = await Settings.findOne();
                if (settings && settings.autoReplyEnabled) {
                    const autoReplyMsg = await Message.create({
                        conversation: req.params.conversationId,
                        sender: req.user._id, // Use a system user or admin if available
                        senderType: 'admin',
                        message: settings.autoReplyMessage,
                        isAutoReply: true,
                        status: 'delivered'
                    });

                    await autoReplyMsg.populate('sender', 'name');
                    conversation.hasAutoReplied = true;
                    conversation.lastMessage = settings.autoReplyMessage;
                    await conversation.save();

                    // Emit auto-reply
                    setTimeout(() => {
                        io.to(req.params.conversationId).emit('new_message', autoReplyMsg);
                    }, 1000);
                }
            }
        } else {
            // Admin replied, reset hasAutoReplied flag
            conversation.hasAutoReplied = true;
            await conversation.save();
        }

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @desc    Get all conversations (Admin)
// @route   GET /api/chat/admin/conversations
// @access  Admin
router.get('/admin/conversations', protect, admin, async (req, res) => {
    try {
        const conversations = await Conversation.find()
            .sort({ lastMessageAt: -1 })
            .populate('user', 'name email');

        res.json(conversations);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// @desc    Update message status
// @route   PATCH /api/chat/messages/:messageId/status
// @access  Private
router.patch('/messages/:messageId/status', protect, async (req, res) => {
    try {
        const { status } = req.body;
        const message = await Message.findByIdAndUpdate(
            req.params.messageId,
            { status },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        res.json(message);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @desc    Search conversations
// @route   GET /api/chat/admin/conversations/search
// @access  Admin
router.get('/admin/conversations/search', protect, admin, async (req, res) => {
    try {
        const { q } = req.query;
        const conversations = await Conversation.find()
            .populate('user', 'name email')
            .sort({ lastMessageAt: -1 });

        let filtered = conversations;
        if (q) {
            filtered = conversations.filter(conv =>
                conv.user?.name?.toLowerCase().includes(q.toLowerCase()) ||
                conv.user?.email?.toLowerCase().includes(q.toLowerCase())
            );
        }

        res.json(filtered);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @desc    Search messages in conversation
// @route   GET /api/chat/:conversationId/messages/search
// @access  Private
router.get('/:conversationId/messages/search', protect, async (req, res) => {
    try {
        const { q } = req.query;
        const conversation = await Conversation.findById(req.params.conversationId);

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // Check authorization
        if (conversation.user.toString() !== req.user._id.toString() && !req.user.role.includes('admin')) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const messages = await Message.find({
            conversation: req.params.conversationId,
            message: { $regex: q, $options: 'i' }
        })
            .sort({ createdAt: 1 })
            .populate('sender', 'name');

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @desc    Get total unread count for admin
// @route   GET /api/chat/admin/unread-count
// @access  Admin  
router.get('/admin/unread-count', protect, admin, async (req, res) => {
    try {
        const conversations = await Conversation.find();
        const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
        res.json({ unreadCount: totalUnread });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @desc    Upload file attachment
// @route   POST /api/chat/upload
// @access  Private
router.post('/upload', protect, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const fileUrl = `/uploads/chat-attachments/${req.file.filename}`;

        res.json({
            filename: req.file.originalname,
            url: fileUrl,
            mimetype: req.file.mimetype,
            size: req.file.size
        });
    } catch (error) {
        res.status(500).json({ message: 'File upload failed', error: error.message });
    }
});

// @desc    Mark messages as read
// @route   PATCH /api/chat/:conversationId/read
// @access  Private
router.patch('/:conversationId/read', protect, async (req, res) => {
    try {
        console.log('📖 Mark as read called for conversation:', req.params.conversationId);
        const conversation = await Conversation.findById(req.params.conversationId);

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // Check authorization
        const isAdmin = req.user.role && req.user.role.includes('admin');
        const isOwner = conversation.user.toString() === req.user._id.toString();

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // If admin is reading, reset unreadCount
        if (isAdmin) {
            conversation.unreadCount = 0;
            await conversation.save();
        }

        // Update all unread messages in this conversation sent by the other party
        const updateResult = await Message.updateMany(
            {
                conversation: req.params.conversationId,
                status: { $ne: 'read' },
                sender: { $ne: req.user._id } // Don't mark own messages as read
            },
            {
                $set: {
                    status: 'read',
                    isRead: true
                }
            }
        );

        console.log('✅ Updated messages count:', updateResult.modifiedCount);

        // Emit socket event to notify about read status
        const io = req.app.get('socketio') || req.app.get('io');

        if (io && updateResult.modifiedCount > 0) {
            console.log('🔔 Emitting messages_read event to room:', req.params.conversationId);
            io.to(req.params.conversationId).emit('messages_read', {
                conversationId: req.params.conversationId,
                readBy: req.user._id.toString(),
                readerType: isAdmin ? 'admin' : 'user'
            });
        }

        res.json({
            message: 'Messages marked as read',
            count: updateResult.modifiedCount,
            unreadCount: conversation.unreadCount
        });
    } catch (error) {
        console.error('❌ Error in markAsRead route:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
