const Product = require('../models/Product');

// @desc    Fetch all products with pagination & Optimized Text Search
// @route   GET /api/products
const getProducts = async (req, res) => {
  try {
    const pageSize = 12;
    const page = Number(req.query.pageNumber) || 1;

    /**
     * OPTIMIZATION: Indexing Gaps Fix
     * Switched from $regex (Full Collection Scan) to $text (Indexed Search).
     * This is significantly faster for large inventories.
     */
    const keyword = req.query.keyword
      ? { $text: { $search: req.query.keyword } }
      : {};

    const count = await Product.countDocuments({ ...keyword });
    const products = await Product.find({ ...keyword })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({ products, page, pages: Math.ceil(count / pageSize) });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('reviews.user', 'name email');
    if (product) res.json(product);
    else res.status(404).json({ message: 'Product not found' });
  } catch (error) {
    res.status(404).json({ message: 'Product not found' });
  }
};

// @desc    Fetch Related Products
// @route   GET /api/products/:id/related
const getRelatedProducts = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const related = await Product.find({
            _id: { $ne: product._id },
            color: product.color
        }).limit(4);

        res.json(related);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a product (Admin)
// @route   POST /api/products
const createProduct = async (req, res) => {
  try {
    const { name, price, description, color, sizes } = req.body;
    
    // 1. Image Handling
    let imageLinks = [];
    if (req.files && req.files.length > 0) {
       imageLinks = req.files.map(file => file.path || file.url); 
    } else {
        imageLinks = ['https://via.placeholder.com/500'];
    }

    // 2. POD Size Schema Formatting
    let formattedSizes = [];
    if (sizes) {
        const sizeArray = Array.isArray(sizes) ? sizes : sizes.split(',');
        formattedSizes = sizeArray.map(s => ({
            size: s.trim(),
            available: true 
        }));
    }

    const product = new Product({
      name,
      price,
      description,
      color: color || 'Black', // Support for the unlimited color picker
      sizes: formattedSizes,
      images: imageLinks,
      user: req.user._id,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Product creation failed', error: error.message });
  }
};

// @desc    Update a product (Admin)
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const { name, price, description, color, sizes, isAvailable } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.price = price || product.price;
      product.description = description || product.description;
      product.color = color || product.color; 
      product.isAvailable = isAvailable !== undefined ? isAvailable : product.isAvailable;

      if (sizes) {
        const sizeArray = Array.isArray(sizes) ? sizes : sizes.split(',');
        product.sizes = sizeArray.map(s => {
            const trimmedS = s.trim();
            const existing = product.sizes.find(ps => ps.size === trimmedS);
            return {
                size: trimmedS,
                available: existing ? existing.available : true
            };
        });
      }

      if (req.files && req.files.length > 0) {
          product.images = req.files.map(file => file.path || file.url);
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
      res.status(500).json({ message: 'Update failed' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
const createProductReview = async (req, res) => {
  try {
      const { rating, comment } = req.body;
      const product = await Product.findById(req.params.id);

      if (product) {
        const alreadyReviewed = product.reviews.find(
          (r) => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) return res.status(400).json({ message: 'Product already reviewed' });

        const review = {
          name: req.user.name || req.user.email.split('@')[0],
          rating: Number(rating),
          comment,
          user: req.user._id,
        };

        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

        await product.save();
        res.status(201).json({ message: 'Review added' });
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
  } catch (error) {
      res.status(500).json({ message: 'Review failed' });
  }
};

const joinWaitlist = async (req, res) => {
    res.status(200).json({ message: 'Joined waitlist' });
};

module.exports = {
  getProducts,
  getProductById,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  joinWaitlist
};