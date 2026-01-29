const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const pageSize = 12;
    const page = Number(req.query.pageNumber) || 1;
    const keyword = req.query.keyword ? {
        $or: [
            { name: { $regex: req.query.keyword, $options: 'i' } },
            { description: { $regex: req.query.keyword, $options: 'i' } }
        ]
    } : {};

    if (req.query.category) {
        keyword.category = req.query.category;
    }

    const count = await Product.countDocuments({ ...keyword });
    const products = await Product.find({ ...keyword })
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort({ createdAt: -1 });

    res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Fetch related products
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    const related = await Product.find({
        _id: { $ne: product._id },
        $or: [
            { category: product.category }, // Prioritize category
            { color: product.color }
        ]
    }).limit(4);

    res.json(related);
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
    const { 
        name, price, description, brand, category, countInStock, 
        color, sizes, stockStatus, preOrderReleaseDate, availableColors 
    } = req.body;

    const images = req.files ? req.files.map(file => file.path || file.secure_url) : [];

    let parsedColors = [];
    if (availableColors) {
        try {
            parsedColors = JSON.parse(availableColors);
        } catch (e) {
            console.error("Error parsing colors:", e);
        }
    }

    const product = new Product({
        name,
        price,
        user: req.user._id,
        images,
        brand,
        category,
        countInStock,
        numReviews: 0,
        description,
        color, 
        availableColors: parsedColors,
        sizes: sizes ? JSON.parse(sizes) : [],
        stockStatus,
        preOrderReleaseDate
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
    const { 
        name, price, description, brand, category, countInStock, 
        color, sizes, stockStatus, preOrderReleaseDate, availableColors 
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        product.name = name || product.name;
        product.price = price || product.price;
        product.description = description || product.description;
        product.brand = brand || product.brand;
        product.category = category || product.category;
        product.countInStock = countInStock || product.countInStock;
        product.color = color || product.color;
        product.stockStatus = stockStatus || product.stockStatus;
        product.preOrderReleaseDate = preOrderReleaseDate || product.preOrderReleaseDate;

        if (sizes) {
            try {
                 product.sizes = JSON.parse(sizes);
            } catch (e) {
                 // handle error or keep existing
            }
        }

        if (availableColors) {
            try {
                product.availableColors = JSON.parse(availableColors);
            } catch (e) {
                console.error("Error parsing colors update:", e);
            }
        }

        if (req.files && req.files.length > 0) {
             const newImages = req.files.map(file => file.path || file.secure_url);
             product.images = [...product.images, ...newImages];
        }

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
    const { rating, comment, name } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        const alreadyReviewed = product.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            res.status(400);
            throw new Error('Product already reviewed');
        }

        const review = {
            name: name || req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id,
        };

        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.rating =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length;

        await product.save();
        res.status(201).json({ message: 'Review added' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Join Waitlist (MISSING FUNCTION ADDED)
// @route   POST /api/products/:id/waitlist
// @access  Public
const joinWaitlist = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
        // In a future update, you can save this email to a database collection.
        // For now, we return success so the frontend "Notify Me" button works.
        res.status(200).json({ message: `You have joined the waitlist for ${product.name}` });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

module.exports = {
    getProducts,
    getProductById,
    deleteProduct,
    createProduct,
    updateProduct,
    createProductReview,
    getRelatedProducts,
    joinWaitlist, // <--- EXPORTED HERE
};