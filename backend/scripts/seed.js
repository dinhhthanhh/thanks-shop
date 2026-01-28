import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Coupon from '../models/Coupon.js';
import Settings from '../models/Settings.js';
import connectDB from '../config/db.js';

dotenv.config();

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await User.deleteMany();
        await Category.deleteMany();
        await Product.deleteMany();
        await Order.deleteMany();
        await Cart.deleteMany();
        await Coupon.deleteMany();
        await Settings.deleteMany();

        console.log('Data cleared!');

        // Create default settings
        await Settings.create({ activeTheme: 'default' });

        // Create users
        const users = await User.create([
            {
                name: 'Admin User',
                email: process.env.ADMIN_EMAIL || 'admin@thanksshop.com',
                password: process.env.ADMIN_PASSWORD || 'admin123',
                role: 'admin'
            },
            {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
                role: 'user'
            }
        ]);

        console.log('Users created!');

        // Create categories
        const categories = await Category.create([
            { name: 'Laundry Care', description: 'Detergents, softeners and stain removers' },
            { name: 'Kitchen Hygiene', description: 'Dish soaps, surface cleaners and degreasers' },
            { name: 'Bathroom Solutions', description: 'Toilet cleaners, descalers and sanitizers' },
            { name: 'Floor & Surface', description: 'Multi-purpose cleaners for all floor types' },
            { name: 'Eco-Friendly', description: 'Natural and sustainable cleaning products' }
        ]);

        console.log('Categories created!');

        // Create products
        const productsData = [
            {
                name: 'Tide Ultra Oxi Laundry Pods',
                description: 'Tide Power + Ultra OXI Liquid Laundry Detergent. The #1 stain removal power pods.',
                price: 19.99,
                category: categories[0]._id,
                image: 'https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=800&auto=format&fit=crop',
                stock: 100
            },
            {
                name: 'Mrs. Meyer\'s Clean Day Dish Soap',
                description: 'Cruelty-free formula is not tested on animals. Biodegradable dish soap.',
                price: 5.49,
                category: categories[1]._id,
                image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=800&auto=format&fit=crop',
                stock: 150
            },
            {
                name: 'Clorox Toilet Bowl Cleaner Gel',
                description: 'Kills 99.9% of bacteria and destroys tough stains with a fresh scent.',
                price: 4.29,
                category: categories[2]._id,
                image: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=800&auto=format&fit=crop',
                stock: 80
            },
            {
                name: 'Method All-Purpose Surface Cleaner',
                description: 'Natural, biodegradable surface cleaner with pink grapefruit scent.',
                price: 6.99,
                category: categories[3]._id,
                image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&auto=format&fit=crop',
                stock: 120
            },
            {
                name: 'Seventh Generation Free & Clear',
                description: 'Hypoallergenic laundry detergent designed for sensitive skin.',
                price: 14.99,
                category: categories[4]._id,
                image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=800&auto=format&fit=crop',
                stock: 60
            },
            {
                name: 'Fabuloso Multi-Purpose Cleaner',
                description: 'Lavender scent multi-purpose cleaner for a long-lasting freshness.',
                price: 7.99,
                category: categories[3]._id,
                image: 'https://images.unsplash.com/photo-1558522195-e1201b090344?w=800&auto=format&fit=crop',
                stock: 200
            },
            {
                name: 'Finish Quantum Dishwasher Tabs',
                description: 'Ultimate clean and shine with active oxygen technology.',
                price: 22.99,
                category: categories[1]._id,
                image: 'https://images.unsplash.com/photo-1585421514284-cd95a94fbf76?w=800&auto=format&fit=crop',
                stock: 45
            },
            {
                name: 'Pine-Sol Multi-Surface Cleaner',
                description: 'Original pine scent that deodorizes and cuts through grease.',
                price: 8.49,
                category: categories[3]._id,
                image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&auto=format&fit=crop',
                stock: 90
            },
            {
                name: 'Dawn Ultra Dishwashing Liquid',
                description: '50% less scrubbing with the power of Dawn grease-fighters.',
                price: 3.99,
                category: categories[1]._id,
                image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=800&auto=format&fit=crop',
                stock: 300
            }
        ];

        const products = await Product.create(productsData);
        console.log('Products created!');

        // Create coupons
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);

        await Coupon.create([
            {
                code: 'WELCOME10',
                discountType: 'percentage',
                value: 10,
                minPurchase: 0,
                expiryDate,
                usageLimit: 100
            },
            {
                code: 'SAVEMORE',
                discountType: 'fixed',
                value: 5,
                minPurchase: 30,
                expiryDate,
                usageLimit: 50
            },
            {
                code: 'CLEAN2026',
                discountType: 'percentage',
                value: 20,
                minPurchase: 50,
                expiryDate,
                usageLimit: 20
            }
        ]);

        console.log('Coupons created!');

        console.log('\n✅ Rich seed data successfully created!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();

