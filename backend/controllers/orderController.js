import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

// @desc    Create new order from cart
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Get user's cart
        const cart = await Cart.findOne({ user: req.user._id })
            .populate('items.product')
            .session(session);

        if (!cart || cart.items.length === 0) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Prepare order items and validate stock
        const orderItems = [];
        let totalPrice = 0;

        for (const item of cart.items) {
            const product = await Product.findById(item.product._id).session(session);

            if (!product) {
                await session.abortTransaction();
                return res.status(404).json({
                    message: `Product ${item.product.name} not found`
                });
            }

            if (product.stock < item.quantity) {
                await session.abortTransaction();
                return res.status(400).json({
                    message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
                });
            }

            // Reduce stock
            product.stock -= item.quantity;
            await product.save({ session });

            // Add to order items
            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity
            });

            totalPrice += product.price * item.quantity;
        }

        // Create order
        const order = await Order.create([{
            user: req.user._id,
            items: orderItems,
            totalPrice
        }], { session });

        // Clear cart
        cart.items = [];
        await cart.save({ session });

        await session.commitTransaction();

        // Create notification for the user
        try {
            const Notification = (await import('../models/Notification.js')).default;
            const notification = await Notification.create({
                user: req.user._id,
                type: 'order_update',
                title: 'Order Placed Successfully',
                message: `Your order #${order[0].orderNumber || order[0]._id} has been placed.`,
                relatedOrder: order[0]._id
            });

            // Emit socket event
            const io = req.app.get('socketio');
            if (io) {
                io.to(`user_${req.user._id}`).emit('new_notification', notification);
            }
        } catch (error) {
            console.error('Failed to create order notification:', error);
        }

        res.status(201).json(order[0]);
    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
};

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
export const getUserOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('items.product', 'name image')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        next(error);
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.product', 'name image');

        if (order) {
            // Make sure user owns this order (or is admin)
            if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized' });
            }
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        next(error);
    }
};
