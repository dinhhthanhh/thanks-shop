import Product from '../models/Product.js';

// @desc    Get all products with search and filter
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
    try {
        const { search, category, minPrice, maxPrice, stockStatus, sortBy, page = 1, limit = 12 } = req.query;

        // Build query
        let query = {};

        // Search by name or description
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by category
        if (category) {
            query.category = category;
        }

        // Filter by stock status
        if (stockStatus === 'low') {
            query.stock = { $gt: 0, $lt: 10 };
        } else if (stockStatus === 'out') {
            query.stock = 0;
        } else if (stockStatus === 'available') {
            query.stock = { $gt: 0 };
        }

        // Filter by price range
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Sort logic
        let sortOptions = { createdAt: -1 };
        if (sortBy === 'sales') {
            sortOptions = { soldCount: -1 };
        } else if (sortBy === 'rating') {
            sortOptions = { averageRating: -1 };
        } else if (sortBy === 'price-asc') {
            sortOptions = { price: 1 };
        } else if (sortBy === 'price-desc') {
            sortOptions = { price: -1 };
        }

        // Execute query with pagination
        const products = await Product.find(query)
            .populate('category', 'name')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(sortOptions);

        // Get total count
        const count = await Product.countDocuments(query);

        res.json({
            products,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id).populate('category', 'name');

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res, next) => {
    try {
        const { name, description, price, category, images, stock } = req.body;

        const product = await Product.create({
            name,
            description,
            price,
            category,
            images: images || [],
            image: images && images.length > 0 ? images[0] : (images || [])[0],
            stock
        });

        res.status(201).json(product);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res, next) => {
    try {
        const { name, description, price, category, images, stock } = req.body;

        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = name !== undefined ? name : product.name;
            product.description = description !== undefined ? description : product.description;
            product.price = price !== undefined ? price : product.price;
            product.category = category !== undefined ? category : product.category;
            product.images = images !== undefined ? images : product.images;
            product.image = product.images && product.images.length > 0 ? product.images[0] : undefined;
            product.stock = stock !== undefined ? stock : product.stock;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            await product.deleteOne();
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        next(error);
    }
};
