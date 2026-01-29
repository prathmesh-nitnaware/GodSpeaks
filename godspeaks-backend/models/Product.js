const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Customer' },
}, {
    timestamps: true,
});

const productSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Admin',
    },
    name: {
        type: String,
        required: true,
    },
    images: [{ // Array of image URLs
        type: String,
        required: true,
    }],
    description: {
        type: String,
        required: false, 
        default: ""
    },
    brand: {
        type: String,
        required: false, 
        default: "GodSpeaks"
    },
    category: {
        type: String,
        required: false, 
        default: "Apparel"
    },
    // Primary Display Color (for Cards/Shop Page)
    color: { 
        type: String, 
        required: true, 
        default: 'Black'
    },
    // NEW: Available Color Variants (for Product Detail Page)
    availableColors: [{
        name: { type: String, required: true },
        hex: { type: String, required: true }
    }],
    price: {
        type: Number,
        required: true,
        default: 0,
    },
    countInStock: {
        type: Number,
        required: true,
        default: 0,
    },
    sizes: [{
        size: { type: String, enum: ['S', 'M', 'L', 'XL', 'XXL', '3XL'] },
        available: { type: Boolean, default: true }
    }],
    reviews: [reviewSchema],
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
        default: true
    },
    stockStatus: {
        type: String,
        enum: ['in-stock', 'out-of-stock', 'pre-order'],
        default: 'in-stock'
    },
    preOrderReleaseDate: {
        type: Date
    }
}, {
    timestamps: true,
});

// Create Text Index for Search
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;