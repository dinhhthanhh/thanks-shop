import express from 'express';
import {
    getAllOrders,
    updateOrderStatus,
    getDashboardStats,
    getRevenueData,
    getInventoryStatus
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, admin);

router.get('/orders', getAllOrders);
router.put('/orders/:id', updateOrderStatus);
router.get('/stats', getDashboardStats);
router.get('/revenue', getRevenueData);
router.get('/inventory', getInventoryStatus);

export default router;
