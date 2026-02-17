const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// ===============================
// GET ALL PRODUCTS
// ===============================
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 12;
  const page = Number(req.query.pageNumber) || 1;

  const query = {};

  if (req.query.keyword) {
    query.$or = [
      { name: { $regex: req.query.keyword, $options: 'i' } },
      { description: { $regex: req.query.keyword, $options: 'i' } },
    ];
  }

  if (req.query.category) {
    query.category = req.query.category;
  }

  const count = await Product.countDocuments(query);

  const products = await Product.find(query)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

// ===============================
// GET SINGLE PRODUCT
// ===============================
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json(product);
});

// ===============================
// GET RELATED PRODUCTS
// ===============================
const getRelatedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const related = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
  }).limit(4);

  res.json(related);
});

// ===============================
// DELETE PRODUCT (ADMIN)
// ===============================
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  await product.deleteOne();
  res.json({ message: 'Product removed' });
});

// ===============================
// CREATE PRODUCT (ADMIN, POD)
// ===============================
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    description,
    category,
    color,
    sizes,
    availableColors,
    images,
    isAvailable,
  } = req.body;

  if (!images || images.length === 0) {
    res.status(400);
    throw new Error('At least one image is required');
  }

  const product = new Product({
    user: req.user._id,
    name,
    price,
    description,
    category,
    color,
    sizes,            // ✅ already array
    availableColors,  // ✅ already array
    images,           // ✅ array of Cloudinary URLs
    isAvailable,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// ===============================
// UPDATE PRODUCT (ADMIN, POD)
// ===============================
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const {
    name,
    price,
    description,
    category,
    color,
    sizes,
    availableColors,
    images,
    isAvailable,
  } = req.body;

  product.name = name ?? product.name;
  product.price = price ?? product.price;
  product.description = description ?? product.description;
  product.category = category ?? product.category;
  product.color = color ?? product.color;
  product.sizes = sizes ?? product.sizes;
  product.availableColors = availableColors ?? product.availableColors;
  product.images = images ?? product.images;
  product.isAvailable = isAvailable ?? product.isAvailable;

  const updatedProduct = await product.save();
  res.json(updatedProduct);
});

// ===============================
// CREATE REVIEW
// ===============================
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment, name } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const alreadyReviewed = product.reviews.find(
    r => r.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    res.status(400);
    throw new Error('Product already reviewed');
  }

  const review = {
    name: name || req.user.name,
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
});

// ===============================
// WAITLIST (OPTIONAL)
// ===============================
const joinWaitlist = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.status(200).json({
    message: `You have joined the waitlist for ${product.name}`,
  });
});

module.exports = {
  getProducts,
  getProductById,
  getRelatedProducts,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  joinWaitlist,
};
