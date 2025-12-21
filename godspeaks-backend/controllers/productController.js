const Product = require("../models/Product");

// @desc    Fetch all products with pagination & Optimized Search
const getProducts = async (req, res) => {
  try {
    const pageSize = 12;
    const page = Number(req.query.pageNumber) || 1;
    const keyword = req.query.keyword ? { $text: { $search: req.query.keyword } } : {};

    const count = await Product.countDocuments({ ...keyword });
    const products = await Product.find({ ...keyword })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({ products, page, pages: Math.ceil(count / pageSize) });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Fetch single product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("reviews.user", "name email");
    if (product) res.json(product);
    else res.status(404).json({ message: "Product not found" });
  } catch (error) {
    res.status(404).json({ message: "Invalid ID format" });
  }
};

// @desc    Create a product (Admin/Superadmin)
const createProduct = async (req, res) => {
  try {
    const { name, price, description, color, sizes } = req.body;

    // 1. ROBUST IMAGE EXTRACTION
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one product image is required." });
    }

    const imageLinks = req.files.map((file) => {
      // Debug log: Check this in your terminal to see the real path
      console.log("Multer File Object:", file); 
      
      // Fallback chain for different Multer-Cloudinary versions
      return file.path || file.secure_url || file.url;
    });

    // Check if any links came back as undefined
    if (imageLinks.some(link => !link)) {
        return res.status(400).json({ 
            message: "Cloudinary URL extraction failed. Check terminal logs.",
            debug: req.files 
        });
    }

    // 2. POD Size Formatting
    const sizeArray = Array.isArray(sizes) ? sizes : (sizes ? sizes.split(",") : []);
    const formattedSizes = sizeArray.map((s) => ({
      size: s.trim(),
      available: true,
    }));

    // 3. Save Product
    const product = new Product({
      name,
      price: Number(price),
      description: description || "", 
      color: color || "Black",
      sizes: formattedSizes,
      images: imageLinks,
      user: req.user._id,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error("Creation Error:", error);
    res.status(400).json({ message: "Validation failed", error: error.message });
  }
};

// @desc    Update a product (Admin)
const updateProduct = async (req, res) => {
  try {
    const { name, price, description, color, sizes, isAvailable } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.price = price ? Number(price) : product.price;
      product.description = description !== undefined ? description : product.description;
      product.color = color || product.color;
      product.isAvailable = isAvailable !== undefined ? isAvailable : product.isAvailable;

      if (sizes) {
        const sizeArray = Array.isArray(sizes) ? sizes : sizes.split(",");
        product.sizes = sizeArray.map((s) => ({ size: s.trim(), available: true }));
      }

      if (req.files && req.files.length > 0) {
        const newImages = req.files.map((file) => file.path || file.secure_url || file.url);
        product.images = [...product.images, ...newImages];
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

// @desc    Delete a product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: "Product removed" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Placeholders for additional logic
const getRelatedProducts = async (req, res) => {
    const product = await Product.findById(req.params.id);
    const related = await Product.find({ color: product.color, _id: { $ne: product._id } }).limit(4);
    res.json(related);
};

module.exports = {
  getProducts,
  getProductById,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview: async (req, res) => res.json({ message: "Review logic here" }),
  joinWaitlist: async (req, res) => res.status(200).json({ message: "Joined" }),
};