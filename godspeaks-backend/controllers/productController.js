const Product = require('../models/Product');
const asyncHandler = require('express-async-handler'); // Ensure you have this or use try-catch

// @desc    Fetch all products
// @route   GET /api/products
const getProducts = async (req, res) => {
  try {
    const pageSize = 12;
    const page = Number(req.query.pageNumber) || 1;

    // Search & Filter Logic
    const keyword = req.query.keyword
      ? { name: { $regex: req.query.keyword, $options: 'i' } }
      : {};

    // Filter by Category (if used) or Color
    const categoryFilter = req.query.category 
      ? { category: req.query.category } 
      : {};

    const count = await Product.countDocuments({ ...keyword, ...categoryFilter });
    const products = await Product.find({ ...keyword, ...categoryFilter })
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
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(404).json({ message: 'Product not found' });
  }
};

// @desc    Fetch Related Products (Same Color/Category)
// @route   GET /api/products/:id/related
const getRelatedProducts = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Find products with similar tags or keywords in name
        // Simple logic: Find other products that share the first word of the name
        const firstWord = product.name.split(' ')[0]; 
        
        const related = await Product.find({
            _id: { $ne: product._id }, // Exclude current product
            name: { $regex: firstWord, $options: 'i' }
        }).limit(4);

        res.json(related);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}

// @desc    Create a product (Admin)
// @route   POST /api/products
const createProduct = async (req, res) => {
  try {
    const { name, price, description, color, sizes } = req.body;
    
    // --- 1. HANDLE IMAGES ---
    // If using Cloudinary middleware, req.files will contain the uploaded files
    let imageLinks = [];
    if (req.files && req.files.length > 0) {
       // Assuming your upload middleware (multer-storage-cloudinary) puts the url in 'path'
       imageLinks = req.files.map(file => file.path); 
    } else {
        // Fallback placeholder
        imageLinks = ['https://via.placeholder.com/500'];
    }

    // --- 2. HANDLE SIZES TRANSFORMATION (Critical for POD) ---
    // Frontend sends "S,M,L" (string) -> Backend needs [{size:'S', available:true}, ...]
    let formattedSizes = [];
    if (sizes) {
        const sizeArray = Array.isArray(sizes) ? sizes : sizes.split(',');
        formattedSizes = sizeArray.map(s => ({
            size: s.trim(),
            available: true // Default to true on creation
        }));
    }

    const product = new Product({
      name,
      price,
      description,
      color: color || 'Black',
      sizes: formattedSizes, // Save the object array
      images: imageLinks,
      user: req.user._id,
      numReviews: 0,
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

      // Handle Sizes Update
      if (sizes) {
        // If sending simple string "S,M", reset availability to true
        // If you build a complex admin UI later, you can send objects directly
        const sizeArray = Array.isArray(sizes) ? sizes : sizes.split(',');
        
        // Advanced: Try to preserve availability of existing sizes if possible
        product.sizes = sizeArray.map(s => {
            const trimmedS = s.trim();
            const existing = product.sizes.find(ps => ps.size === trimmedS);
            return {
                size: trimmedS,
                available: existing ? existing.available : true
            };
        });
      }

      // Handle Images Update (Only if new images uploaded)
      if (req.files && req.files.length > 0) {
          const imageLinks = req.files.map(file => file.path);
          product.images = imageLinks;
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
      console.error(error);
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
  const { rating, comment, name } = req.body; // Added 'name' in case it's passed

  try {
      const product = await Product.findById(req.params.id);

      if (product) {
        // Check if user already reviewed
        const alreadyReviewed = product.reviews.find(
          (r) => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
          return res.status(400).json({ message: 'Product already reviewed' });
        }

        const review = {
          name: name || req.user.name || 'Customer', // Fallback name
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
        res.status(404).json({ message: 'Product not found' });
      }
  } catch (error) {
      res.status(500).json({ message: 'Review failed' });
  }
};

// @desc    Join Waitlist
// @route   POST /api/products/:id/waitlist
const joinWaitlist = async (req, res) => {
    // Basic implementation: Log it or save to a Waitlist collection
    // For now, just send success
    console.log(`Email ${req.body.email} joined waitlist for Product ${req.params.id}`);
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