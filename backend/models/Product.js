const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Customer',
    },
  },
  { timestamps: true }
);

const productSchema = mongoose.Schema(
  {
    // Admin who created the design
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Admin',
    },

    // Design name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Cloudinary image URLs
    images: [
      {
        type: String,
        required: true,
      },
    ],

    description: {
      type: String,
      default: '',
    },

    brand: {
      type: String,
      default: 'GodSpeaks',
    },

    // Used for Shop.jsx filtering
    category: {
      type: String,
      enum: ['Apparel', 'Hoodies', 'Caps', 'Accessories'],
      default: 'Apparel',
    },

    // Primary display color (cards, hero image)
    color: {
      type: String,
      default: 'Black',
    },

    // Color variants (for swatches & filters)
    availableColors: [
      {
        name: { type: String, required: true }, // e.g. "Black"
        hex: { type: String, required: true },  // e.g. "#000000"
      },
    ],

    // POD price (fixed per design)
    price: {
      type: Number,
      required: true,
    },

    // POD SIZE AVAILABILITY (CORE LOGIC)
    sizes: [
      {
        size: {
          type: String,
          enum: ['S', 'M', 'L', 'XL', 'XXL', '3XL', 'ONE_SIZE'],
          required: true,
        },
        available: {
          type: Boolean,
          default: true,
        },
      },
    ],

    // Design live / paused
    isAvailable: {
      type: Boolean,
      default: true,
    },

    // Reviews (optional, future)
    reviews: [reviewSchema],

    rating: {
      type: Number,
      default: 0,
    },

    numReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Text search for Shop
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
