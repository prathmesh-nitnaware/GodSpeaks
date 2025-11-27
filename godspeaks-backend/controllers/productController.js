const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const mongoose = require("mongoose");

// Helper function to extract stock data from JSON string
const parseStock = (stockJson) => {
  try {
    const stockArray = JSON.parse(stockJson);
    if (Array.isArray(stockArray)) {
      return stockArray;
    }
    return [];
  } catch (e) {
    console.error("Error parsing stock JSON:", e);
    return [];
  }
};

// =========================================================================
// PUBLIC CONTROLLERS
// =========================================================================

// @desc    Fetch all products with Advanced Filtering & Sorting
// @route   GET /api/products?keyword=...&category=...&minPrice=...&maxPrice=...&sort=...&size=...
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { keyword, category, minPrice, maxPrice, size, sort } = req.query;

    // --- 1. Build Search Query ---
    let query = {};

    // Keyword Search (Name)
    if (keyword) {
      query.name = { $regex: keyword, $options: "i" };
    }

    // Category Filter (allows multiple: ?category=Faith,Scripture)
    if (category) {
      const categories = category.split(",");
      query.category = { $in: categories };
    }

    // Price Filter (Frontend sends Rupees, DB stores Paisa)
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice) * 100;
      if (maxPrice) query.price.$lte = Number(maxPrice) * 100;
    }

    // Size Availability Filter
    // Finds products where the specified size exists AND has count > 0
    if (size) {
      const sizes = size.split(",");
      query.stock = {
        $elemMatch: {
          size: { $in: sizes },
          count: { $gt: 0 },
        },
      };
    }

    // --- 2. Build Sort Option ---
    let sortOption = { createdAt: -1 }; // Default: Newest first

    if (sort === "price-asc") sortOption = { price: 1 };
    if (sort === "price-desc") sortOption = { price: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };

    // --- 3. Execute Query ---
    const products = await Product.find(query).sort(sortOption);

    res.json({ products, count: products.length });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Server error fetching products.",
        error: error.message,
      });
  }
};

// @desc    Fetch a single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Server error fetching product.",
        error: error.message,
      });
  }
};

// =========================================================================
// ADMIN PROTECTED CONTROLLERS
// =========================================================================

// @desc    Admin: Create a new product (handles file upload)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  const files = req.files;
  const { name, description, price, category, stock: stockJson } = req.body;

  const stock = parseStock(stockJson);

  if (!files || files.length === 0) {
    return res
      .status(400)
      .json({ message: "Product must include at least one image." });
  }

  if (stock.length === 0 || stock.some((item) => item.count < 0)) {
    return res
      .status(400)
      .json({ message: "Stock information is missing or invalid." });
  }

  try {
    // Upload images to Cloudinary
    const uploadPromises = files.map((file) => {
      return cloudinary.uploader.upload(
        file.path ||
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        {
          folder: "godspeaks-products",
        }
      );
    });

    const uploadResults = await Promise.all(uploadPromises);
    const imageURLs = uploadResults.map((result) => result.secure_url);

    const newProduct = new Product({
      name,
      description,
      price: price * 100, // Convert INR to Paisa
      images: imageURLs,
      category,
      stock,
    });

    const createdProduct = await newProduct.save();

    res.status(201).json({
      message: "Product created successfully",
      product: createdProduct,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message:
          "Error creating product: Could not upload images or save data.",
        error: error.message,
      });
  }
};

// @desc    Admin: Update an existing product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  const productId = req.params.id;
  const { name, description, price, category, stock: stockJson } = req.body;
  const files = req.files;

  try {
    const product = await Product.findById(productId);

    if (product) {
      let newImageURLs = product.images;

      // If new files are uploaded, process them
      if (files && files.length > 0) {
        const uploadPromises = files.map((file) =>
          cloudinary.uploader.upload(
            file.path ||
              `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
            { folder: "godspeaks-products" }
          )
        );
        const uploadResults = await Promise.all(uploadPromises);
        // Append new images or replace? Here we replace for simplicity.
        // To append: newImageURLs = [...product.images, ...uploadResults.map(r => r.secure_url)];
        newImageURLs = uploadResults.map((result) => result.secure_url);
      }

      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price ? price * 100 : product.price;
      product.category = category || product.category;
      product.images = newImageURLs;

      if (stockJson) {
        const stock = parseStock(stockJson);
        if (stock.length > 0) {
          product.stock = stock;
        }
      }

      const updatedProduct = await product.save();

      res.json({
        message: "Product updated successfully",
        product: updatedProduct,
      });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating product.", error: error.message });
  }
};

// @desc    Admin: Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId);

    if (product) {
      await Product.deleteOne({ _id: productId });
      res.json({ message: "Product removed successfully" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Server error deleting product.",
        error: error.message,
      });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
