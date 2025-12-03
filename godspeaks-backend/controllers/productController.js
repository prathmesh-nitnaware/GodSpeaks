const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

// =========================================================================
// PUBLIC CONTROLLERS
// =========================================================================

// @desc    Fetch all products
// @route   GET /api/products
const getProducts = async (req, res) => {
  try {
    const { keyword, color, minPrice, maxPrice, size, sort } = req.query;

    let query = { isAvailable: true };

    if (keyword) {
      query.name = { $regex: keyword, $options: "i" };
    }

    // Filter by Color instead of Category
    if (color) {
      query.color = { $in: color.split(",") };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice) * 100;
      if (maxPrice) query.price.$lte = Number(maxPrice) * 100;
    }

    if (size) {
      query.sizes = { $in: size.split(",") };
    }

    let sortOption = { createdAt: -1 };
    if (sort === "price-asc") sortOption = { price: 1 };
    if (sort === "price-desc") sortOption = { price: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };

    const products = await Product.find(query).sort(sortOption);

    res.json({ products, count: products.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching products." });
  }
};

// @desc    Fetch a single product
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

// @desc    Fetch Related Products (Same Color/Style)
// @route   GET /api/products/:id/related
const getRelatedProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find products with same color (or category logic if you prefer), exclude current
    const related = await Product.find({
      color: product.color,
      _id: { $ne: product._id }, // Not Equal
      isAvailable: true,
    }).limit(4);

    // If no related by color, just fetch 4 random latest
    if (related.length === 0) {
      const fallback = await Product.find({
        _id: { $ne: product._id },
        isAvailable: true,
      })
        .limit(4)
        .sort({ createdAt: -1 });
      return res.json(fallback);
    }

    res.json(related);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching related products" });
  }
};

// @desc    Join Waitlist for Out-of-Stock Item
// @route   POST /api/products/:id/waitlist
const joinWaitlist = async (req, res) => {
  const { email } = req.body;
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Ensure waitlist array exists (legacy data support)
    if (!product.waitlist) product.waitlist = [];

    const exists = product.waitlist.find((entry) => entry.email === email);
    if (exists) {
      return res
        .status(400)
        .json({ message: "You are already on the notification list!" });
    }

    product.waitlist.push({ email });
    await product.save();

    res.status(200).json({ message: "You have been added to the waitlist!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error adding to waitlist." });
  }
};

// =========================================================================
// ADMIN CONTROLLERS
// =========================================================================

// @desc    Admin: Create a new product
// @route   POST /api/products
const createProduct = async (req, res) => {
  const files = req.files;
  const { name, description, price, color, sizes } = req.body;

  if (!files || files.length === 0) {
    return res.status(400).json({ message: "Product must include images." });
  }

  let sizeArray = [];
  if (typeof sizes === "string") {
    sizeArray = sizes.split(",").filter((s) => s.trim() !== "");
  } else if (Array.isArray(sizes)) {
    sizeArray = sizes;
  }

  if (sizeArray.length === 0) {
    return res
      .status(400)
      .json({ message: "Please select at least one size." });
  }

  try {
    const uploadPromises = files.map((file) => {
      return cloudinary.uploader.upload(
        file.path ||
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        { folder: "godspeaks-products" }
      );
    });

    const uploadResults = await Promise.all(uploadPromises);
    const imageURLs = uploadResults.map((result) => result.secure_url);

    const newProduct = new Product({
      name,
      description,
      price: price * 100,
      images: imageURLs,
      color: color || "Black",
      sizes: sizeArray,
      isAvailable: true,
    });

    const createdProduct = await newProduct.save();
    res
      .status(201)
      .json({ message: "Product created", product: createdProduct });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error creating product.", error: error.message });
  }
};

// @desc    Admin: Update an existing product
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
  const productId = req.params.id;
  const { name, description, price, color, sizes, isAvailable } = req.body;
  const files = req.files;

  try {
    const product = await Product.findById(productId);

    if (product) {
      let newImageURLs = product.images;

      if (files && files.length > 0) {
        const uploadPromises = files.map((file) =>
          cloudinary.uploader.upload(
            file.path ||
              `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
            { folder: "godspeaks-products" }
          )
        );
        const uploadResults = await Promise.all(uploadPromises);
        newImageURLs = uploadResults.map((result) => result.secure_url);
      }

      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price ? price * 100 : product.price;
      product.color = color || product.color;
      product.images = newImageURLs;

      if (isAvailable !== undefined) {
        product.isAvailable = isAvailable === "true" || isAvailable === true;
      }

      if (sizes) {
        if (typeof sizes === "string") {
          product.sizes = sizes.split(",").filter((s) => s.trim() !== "");
        } else if (Array.isArray(sizes)) {
          product.sizes = sizes;
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
const deleteProduct = async (req, res) => {
  try {
    await Product.deleteOne({ _id: req.params.id });
    res.json({ message: "Product removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product." });
  }
};

// @desc    Create new review
const createProductReview = async (req, res) => {
  const { rating, comment, name } = req.body;
  const file = req.file;

  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );
      if (alreadyReviewed) {
        return res.status(400).json({ message: "Product already reviewed" });
      }

      let imageUrl = null;
      if (file) {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "godspeaks-reviews" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          const bufferStream = require("stream").Readable.from(file.buffer);
          bufferStream.pipe(uploadStream);
        });
        imageUrl = result.secure_url;
      }

      const review = {
        name: name || req.user.name || "Customer",
        rating: Number(rating),
        comment,
        image: imageUrl,
        user: req.user._id,
      };

      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: "Review added" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error adding review" });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getRelatedProducts, // Ensure this is exported
  joinWaitlist, // Ensure this is exported
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
};
