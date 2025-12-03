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
    // --- CHANGED: Replaced Category with Color ---
    color: {
      type: String,
      required: true,
      default: "Black", // Default base color
    },
    // --- CHANGED: Sizes is just a list of available options (No stock counts) ---
    sizes: [
      {
        type: String,
        enum: ["S", "M", "L", "XL", "XXL", "3XL"],
        required: true,
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

