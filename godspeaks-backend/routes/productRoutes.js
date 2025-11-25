const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth'); // Auth middleware
const upload = require('../middleware/upload'); // Multer upload middleware
const validationMiddleware = require('../middleware/validate'); // Error handler middleware
const { body } = require('express-validator'); // For defining validation rules


// --- VALIDATION RULES FOR PRODUCT CREATION/UPDATE ---
const productValidationRules = [
    body('name').trim().isLength({ min: 3, max: 100 }).withMessage('Name must be 3-100 characters.'),
    body('description').trim().isLength({ min: 10, max: 500 }).withMessage('Description must be 10-500 characters.'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number.'),
    body('category').isIn(['Faith', 'Scripture', 'Minimalist', 'Inspirational']).withMessage('Invalid category.'), // <-- MATCH YOUR ENUM
    // Stock is complex and best validated within the controller logic or a custom validator
];


// =========================================================================
// PUBLIC ROUTES
// =========================================================================

// @route   GET /api/products
// @desc    Fetch all products (with optional filtering/search)
// @access  Public
router.get('/', productController.getProducts);

// @route   GET /api/products/:id
// @desc    Fetch a single product
// @access  Public
router.get('/:id', productController.getProductById);


// =========================================================================
// ADMIN PROTECTED ROUTES (Requires JWT + Admin Role)
// =========================================================================

// @route   POST /api/products
// @desc    Admin: Create a new product (handles file upload)
// @access  Private/Admin
router.post(
    '/',
    protect, // Check if user is logged in
    admin,   // Check if user is an admin
    upload.array('images', 5), // Use multer to handle up to 5 image files (field name 'images')
    productValidationRules, // Apply validation rules
    validationMiddleware,   // Catch validation errors
    productController.createProduct
);

// @route   PUT /api/products/:id
// @desc    Admin: Update an existing product
// @access  Private/Admin
// NOTE: For simplicity, update uses the same validation rules and expects data/images similar to creation
router.put(
    '/:id',
    protect,
    admin,
    upload.array('images', 5), // Re-uploading images is common during product update
    productValidationRules,
    validationMiddleware,
    productController.updateProduct
);

// @route   DELETE /api/products/:id
// @desc    Admin: Delete a product
// @access  Private/Admin
router.delete('/:id', protect, admin, productController.deleteProduct);


module.exports = router;