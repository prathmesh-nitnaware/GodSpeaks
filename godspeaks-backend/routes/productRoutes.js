const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  joinWaitlist,
} = require("../controllers/productController");
const { protect, admin } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// --- PUBLIC ROUTES ---
router.route("/").get(getProducts);
router.route("/:id").get(getProductById);
router.route("/:id/related").get(getRelatedProducts);
router.route("/:id/waitlist").post(joinWaitlist);

// --- PROTECTED ROUTES (Customer) ---
router
  .route("/:id/reviews")
  .post(protect, upload.single("image"), createProductReview);

// --- ADMIN ROUTES (Admin/Superadmin) ---
router
  .route("/")
  .post(protect, admin, upload.array("images", 5), createProduct);

router
  .route("/:id")
  .put(protect, admin, upload.array("images", 5), updateProduct)
  .delete(protect, admin, deleteProduct);

module.exports = router;