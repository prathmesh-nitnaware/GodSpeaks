const mongoose = require('mongoose');

// --- SUB-SCHEMA: REVIEWS ---
const reviewSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    // New Field for Review Image
    image: { type: String }, 
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Customer', // Links to Customer model
    },
}, {
    timestamps: true
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
        maxlength: 1000,
    },
    price: {
        type: Number,
        required: true,
        min: 0, 
    },
    images: [{
        type: String, 
        required: true,
    }],
    category: {
        type: String,
        required: true,
        enum: ['Faith', 'Scripture', 'Minimalist', 'Inspirational'],
    },
    sizes: [{
        type: String,
        enum: ['S', 'M', 'L', 'XL', 'XXL', '3XL'], 
        required: true,
    }],
    reviews: [reviewSchema], // Embed reviews
    rating: {
        type: Number,
        required: true,
        default: 0,
    },
    numReviews: {
        type: Number,
        required: true,
        default: 0,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    podId: {
        type: String,
        default: null
    }
}, {
    timestamps: true 
});

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;