const express = require('express');
const router = express.Router();
const { 
    getProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct,
    createProductReview
} = require('../controllers/productController');

// Middleware
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload'); // Multer config for file uploads

// --- PUBLIC ROUTES ---
router.route('/')
    .get(getProducts);

router.route('/:id')
    .get(getProductById);

// --- PROTECTED ROUTE (Customer Review) ---
// Note: We use upload.single('image') because reviews only have 1 optional photo
router.route('/:id/reviews')
    .post(protect, upload.single('image'), createProductReview);

// --- ADMIN ROUTES ---
// Note: We use upload.array('images') because products can have multiple photos
router.route('/')
    .post(protect, admin, upload.array('images'), createProduct);

router.route('/:id')
    .put(protect, admin, upload.array('images'), updateProduct)
    .delete(protect, admin, deleteProduct);

module.exports = router;