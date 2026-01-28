import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Notification from '../models/Notification.js';

// @desc    Get all orders (admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({})
            .populate('user', 'name email')
            .populate('items.product', 'name')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        next(error);
    }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id
// @access  Private/Admin
export const updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const oldStatus = order.status;
        order.status = status;
        const updatedOrder = await order.save();

        // Create notification for user if status changed
        if (oldStatus !== status) {
            try {
                const notification = await Notification.create({
                    user: order.user,
                    type: 'order_update',
                    title: 'Order Status Updated',
                    message: `Your order #${order.orderNumber || order._id} status is now: ${status}`,
                    relatedOrder: order._id
                });

                // Emit socket event
                const io = req.app.get('socketio');
                if (io) {
                    io.to(`user_${order.user}`).emit('new_notification', notification);
                }
            } catch (err) {
                console.error('Failed to send status update notification:', err);
            }
        }

        res.json(updatedOrder);
    } catch (error) {
        next(error);
    }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res, next) => {
    try {
        // Total revenue
        const revenueResult = await Order.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Total orders
        const totalOrders = await Order.countDocuments();

        // Total products
        const totalProducts = await Product.countDocuments();

        // Orders by status
        const ordersByStatus = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Low stock products (stock < 10)
        const lowStockProducts = await Product.countDocuments({ stock: { $lt: 10 } });

        res.json({
            totalRevenue,
            totalOrders,
            totalProducts,
            ordersByStatus,
            lowStockProducts
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get revenue data
// @route   GET /api/admin/revenue
// @access  Private/Admin
export const getRevenueData = async (req, res, next) => {
    try {
        const { period = 'month' } = req.query;

        let groupBy;
        if (period === 'day') {
            groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        } else if (period === 'week') {
            groupBy = { $week: '$createdAt' };
        } else {
            groupBy = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        }

        const revenueData = await Order.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            {
                $group: {
                    _id: groupBy,
                    revenue: { $sum: '$totalPrice' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            { $limit: 12 }
        ]);

        // Best selling products
        const bestSellers = await Order.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    totalQuantity: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: '$productInfo' },
            {
                $project: {
                    name: '$productInfo.name',
                    totalQuantity: 1,
                    totalRevenue: 1
                }
            }
        ]);

        res.json({
            revenueData,
            bestSellers
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get inventory status
// @route   GET /api/admin/inventory
// @access  Private/Admin
export const getInventoryStatus = async (req, res, next) => {
    try {
        const products = await Product.find({})
            .populate('category', 'name')
            .sort({ stock: 1 });

        const totalStock = await Product.aggregate([
            { $group: { _id: null, total: { $sum: '$stock' } } }
        ]);

        const stockValue = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: { $multiply: ['$stock', '$price'] } }
                }
            }
        ]);

        res.json({
            products,
            totalStock: totalStock.length > 0 ? totalStock[0].total : 0,
            stockValue: stockValue.length > 0 ? stockValue[0].total : 0
        });
    } catch (error) {
        next(error);
    }
};
