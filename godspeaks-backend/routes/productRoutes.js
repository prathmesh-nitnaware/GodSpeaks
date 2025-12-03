const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  getRelatedProducts, // Import new controller
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  joinWaitlist,
} = require("../controllers/productController");
const { protect, admin } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// Public Routes
router.route("/").get(getProducts);
router.route("/:id").get(getProductById);
router.route("/:id/related").get(getRelatedProducts); // New Route
router.route("/:id/waitlist").post(joinWaitlist);

// Protected Routes (Reviews)
router
  .route("/:id/reviews")
  .post(protect, upload.single("image"), createProductReview);

// Admin Routes
router
  .route("/")
  .post(protect, admin, upload.array("images", 5), createProduct);

router
  .route("/:id")
  .put(protect, admin, upload.array("images", 5), updateProduct)
  .delete(protect, admin, deleteProduct);

module.exports = router;
