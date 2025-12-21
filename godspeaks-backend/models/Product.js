const mongoose = require("mongoose");

// --- SUB-SCHEMA: REVIEWS ---
const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    image: { type: String },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Customer",
    },
  },
  { timestamps: true }
);

// --- MAIN PRODUCT SCHEMA ---
const ProductSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    description: { 
      type: String, 
      required: false, // Optional as requested
      default: "", 
      maxlength: 1000 
    },
    price: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    images: {
      type: [String], 
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'At least one product image is required'
      }
    },
    color: { 
      type: String, 
      required: true, 
      default: "Black" 
    },
    sizes: [
      {
        size: { 
          type: String, 
          enum: ["S", "M", "L", "XL", "XXL", "3XL"],
          required: true 
        },
        available: { type: Boolean, default: true }
      },
    ],
    reviews: [reviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    isAvailable: { type: Boolean, default: true },
    podId: { type: String, default: null },
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Admin", // Should match your authMiddleware's search collection
      required: true 
    }
  },
  { timestamps: true }
);

// CRITICAL: Text index allows optimized keyword search
ProductSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;