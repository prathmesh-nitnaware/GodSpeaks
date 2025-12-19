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
  {
    timestamps: true,
  }
);

// --- MAIN PRODUCT SCHEMA ---
const ProductSchema = new mongoose.Schema(
  {
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
    images: [
      {
        type: String,
        required: true,
      },
    ],
    color: {
      type: String,
      required: true,
      default: "Black", 
    },
    // --- POD SPECIFIC CHANGE ---
    // We don't track numbers (0, 10, 20). 
    // We only track IF we can print it (True/False).
    sizes: [
      {
        size: { 
            type: String, 
            enum: ["S", "M", "L", "XL", "XXL", "3XL"],
            required: true 
        },
        available: { 
            type: Boolean, 
            default: true // Defaults to "Yes, we can print this"
        }
      },
    ],
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
      default: true,
    },
    podId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product; 