import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import connectDB from '../config/db.js';

dotenv.config();

const clearData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await Category.deleteMany();
        await Product.deleteMany();
        await Order.deleteMany();
        await Cart.deleteMany();

        // Delete all users EXCEPT admin
        await User.deleteMany({ role: { $ne: 'admin' } });

        console.log('All test data (Products, Categories, Orders, Carts, Users) has been cleared!');
        console.log('Admin users were preserved for management.');

        process.exit(0);
    } catch (error) {
        console.error('Error clearing data:', error);
        process.exit(1);
    }
};

clearData();
