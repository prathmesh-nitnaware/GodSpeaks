const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const mongoose = require('mongoose'); // Import mongoose

// Helper function to extract stock data from JSON string
const parseStock = (stockJson) => {
    try {
        const stockArray = JSON.parse(stockJson);
        // Ensure the parsed data is an array before returning
        if (Array.isArray(stockArray)) {
            return stockArray;
        }
        return [];
    } catch (e) {
        console.error("Error parsing stock JSON:", e);
        return [];
    }
};

// =========================================================================
// PUBLIC CONTROLLERS
// =========================================================================

// @desc    Fetch all products (with optional filtering/search)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    // NOTE: This logic needs the DB connection to be active.
    
    const keyword = req.query.keyword 
        ? {
            name: {
                $regex: req.query.keyword, // Case-insensitive search
                $options: 'i',
            },
        }
        : {};
    
    try {
        // const products = await Product.find({ ...keyword });
        
        // --- TEMPORARY MOCK DATA (REMOVE LATER) ---
        const mockProducts = [{
            _id: "60c72b2f9f1b2c001c8e4d22",
            name: "Faith Over Fear Tee",
            description: "Inspiring scriptural verse T-shirt.",
            price: 79900,
            images: ["https://res.cloudinary.com/demo/image/upload/v1/sample"],
            category: "Scripture",
            stock: [{ size: "M", count: 10 }, { size: "L", count: 5 }],
            isAvailable: true,
        }];
        const products = mockProducts; 
        // ------------------------------------------

        res.json({ products: products, count: products.length });

    } catch (error) {
        res.status(500).json({ message: 'Server error fetching products.', error: error.message });
    }
};

// @desc    Fetch a single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    // NOTE: This logic needs the DB connection to be active.
    
    try {
        // const product = await Product.findById(req.params.id);
        
        // --- TEMPORARY MOCK DATA (REMOVE LATER) ---
        const mockProduct = {
            _id: req.params.id,
            name: "The Cross Uplifted",
            description: "A bold, minimalist design.",
            price: 89900,
            images: ["https://res.cloudinary.com/demo/image/upload/v1/sample"],
            category: "Minimalist",
            stock: [{ size: "S", count: 20 }, { size: "XL", count: 8 }],
            isAvailable: true,
        };
        const product = mockProduct;
        // ------------------------------------------
        
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }

    } catch (error) {
        res.status(500).json({ message: 'Server error fetching product.', error: error.message });
    }
};


// =========================================================================
// ADMIN PROTECTED CONTROLLERS
// =========================================================================

// @desc    Admin: Create a new product (handles file upload)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    const files = req.files;
    const { name, description, price, category, stock: stockJson } = req.body;
    
    const stock = parseStock(stockJson);
    
    if (!files || files.length === 0) {
        return res.status(400).json({ message: 'Product must include at least one image.' });
    }
    
    if (stock.length === 0 || stock.some(item => item.count < 0)) {
        return res.status(400).json({ message: 'Stock information is missing or invalid.' });
    }

    try {
        const uploadPromises = files.map(file => {
            return cloudinary.uploader.upload(file.path || `data:${file.mimetype};base64,${file.buffer.toString('base64')}`, {
                folder: 'godspeaks-products', 
            });
        });

        const uploadResults = await Promise.all(uploadPromises);
        const imageURLs = uploadResults.map(result => result.secure_url);

        const newProduct = new Product({
            name,
            description,
            price: price * 100, // Convert INR to Paisa
            images: imageURLs,
            category,
            stock,
        });

        // const createdProduct = await newProduct.save();
        
        // --- TEMPORARY SUCCESS RESPONSE (REMOVE LATER) ---
        res.status(201).json({ 
            message: 'Product created successfully (DB save skipped).',
            product: { ...newProduct._doc, images: imageURLs }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating product: Could not upload images or save data.', error: error.message });
    }
};

// @desc    Admin: Update an existing product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    const productId = req.params.id;
    const { name, description, price, category, stock: stockJson } = req.body;
    const files = req.files;

    try {
        // const product = await Product.findById(productId);
        
        // --- TEMPORARY MOCK FIND (REMOVE LATER) ---
        const product = { _id: productId, images: ["old_url_1"], stock: [], save: () => console.log("Mock save") }; 
        // ------------------------------------------

        if (product) {
            let newImageURLs = product.images; 
            if (files && files.length > 0) {
                const uploadPromises = files.map(file => 
                    cloudinary.uploader.upload(file.path || `data:${file.mimetype};base64,${file.buffer.toString('base64')}`, { folder: 'godspeaks-products' })
                );
                const uploadResults = await Promise.all(uploadPromises);
                newImageURLs = uploadResults.map(result => result.secure_url);
            }
            
            product.name = name || product.name;
            product.description = description || product.description;
            product.price = price ? price * 100 : product.price;
            product.category = category || product.category;
            product.images = newImageURLs;

            if (stockJson) {
                const stock = parseStock(stockJson);
                if (stock.length > 0) {
                    product.stock = stock;
                }
            }

            // const updatedProduct = await product.save();

            res.json({ 
                message: 'Product updated successfully (DB save skipped).', 
                product: product 
            });
            
        } else {
            res.status(404).json({ message: 'Product not found' });
        }

    } catch (error) {
        res.status(500).json({ message: 'Error updating product.', error: error.message });
    }
};

// @desc    Admin: Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    const productId = req.params.id;
    
    try {
        // const product = await Product.findById(productId);
        // --- TEMPORARY MOCK FIND (REMOVE LATER) ---
        const product = { _id: productId, name: "Deleted Item", remove: () => console.log("Mock remove") };
        // ------------------------------------------

        if (product) {
            // await product.remove(); 
            
            res.json({ message: 'Product removed successfully (DB delete skipped)' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }

    } catch (error) {
        res.status(500).json({ message: 'Server error deleting product.', error: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};