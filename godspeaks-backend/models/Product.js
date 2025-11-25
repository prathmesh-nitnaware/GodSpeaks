const mongoose = require('mongoose');

// --- SUB-SCHEMA: STOCK PER SIZE ---
// This schema defines how stock for a specific size (e.g., 'M') is tracked.
const StockSchema = new mongoose.Schema({
    size: {
        type: String,
        enum: ['S', 'M', 'L', 'XL', 'XXL'], // Allowed T-shirt sizes
        required: true,
    },
    count: {
        type: Number,
        required: true,
        default: 0,
        min: 0, // Stock count cannot be negative
    }
});

// --- MAIN PRODUCT SCHEMA ---
const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        maxlength: 500,
    },
    // The price is stored in the lowest common denomination (Paisa) 
    // to avoid floating-point errors, but we store it as an integer here.
    price: {
        type: Number,
        required: true,
        min: 0, // Price must be non-negative
    },
    // Array of image URLs from Cloudinary
    images: [{
        type: String, // Storing the secure URL provided by Cloudinary
        required: true,
    }],
    category: {
        type: String,
        required: true,
        enum: ['Faith', 'Scripture', 'Minimalist', 'Inspirational'], // <-- CUSTOMIZE YOUR CATEGORIES
    },
    // Embedding the stock schema to track stock per size
    stock: {
        type: [StockSchema],
        required: true,
        validate: {
            validator: function(v) {
                // Ensure there is at least one size entry
                return v.length > 0; 
            },
            message: 'Product must have at least one size defined.'
        }
    },
    // Calculated field for overall availability
    isAvailable: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// --- VIRTUAL PROPERTY: TOTAL STOCK ---
// A virtual field that calculates the total stock across all sizes
ProductSchema.virtual('totalStock').get(function() {
    return this.stock.reduce((total, item) => total + item.count, 0);
});

// Pre-save hook to update isAvailable status
ProductSchema.pre('save', function(next) {
    this.isAvailable = this.stock.reduce((total, item) => total + item.count, 0) > 0;
    next();
});

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;