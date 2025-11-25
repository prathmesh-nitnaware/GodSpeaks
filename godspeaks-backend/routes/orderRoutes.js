const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
// --- FIX: Import both 'protect' and 'admin' from the NEW middleware file ---
const { protect, admin } = require('../middleware/authMiddleware'); 
const validationMiddleware = require('../middleware/validate');
const { body } = require('express-validator');

// --- VALIDATION RULES FOR NEW ORDER ---
const orderValidationRules = [
    body('shippingInfo.name').trim().notEmpty().withMessage('Name is required.'),
    body('shippingInfo.email').isEmail().normalizeEmail().withMessage('A valid email is required.'),
    body('shippingInfo.phone').isMobilePhone('en-IN').withMessage('A valid 10-digit phone number is required.'),
    body('shippingInfo.address').trim().notEmpty().withMessage('Address is required.'),
    body('shippingInfo.city').trim().notEmpty().withMessage('City is required.'),
    body('shippingInfo.postalCode').isPostalCode('IN').withMessage('A valid postal code is required.'),
    body('orderItems').isArray({ min: 1 }).withMessage('Cart cannot be empty.'),
    body('orderItems.*.qty').isInt({ gt: 0 }).withMessage('Item quantity must be at least 1.'),
    body('orderItems.*.price').isInt({ gt: 0 }).withMessage('Item price is invalid.'),
    // body('orderItems.*.size').notEmpty().withMessage('Item size is required.'), // Optional based on your product
];


// =========================================================================
// CUSTOMER & PAYMENT ROUTES
// =========================================================================

// @route   POST /api/orders/create
// @desc    Create a new order
router.post(
    '/create',
    // Optional: Add 'protect' here if you want ONLY logged-in users to buy
    // protect, 
    orderValidationRules,
    validationMiddleware,
    orderController.createOrder
);

// @route   POST /api/orders/verify-payment
// @desc    Verify payment signature
router.post(
    '/verify-payment',
    [
        body('razorpay_order_id').notEmpty(),
        body('razorpay_payment_id').notEmpty(),
        body('razorpay_signature').notEmpty(),
        body('order_id').isMongoId(),
    ],
    validationMiddleware,
    orderController.verifyPaymentAndUpdateOrder
);

// @route   GET /api/orders/myorders
// @desc    Get logged in user orders (Customer Dashboard)
router.get('/myorders', protect, orderController.getMyOrders);

// @route   GET /api/orders/my-orders/:email
// @desc    Guest order tracking (Public)
router.get('/my-orders/:email', orderController.getGuestOrders);

// @route   GET /api/orders/:id
// @desc    Get single order
router.get('/:id', orderController.getOrderById);


// =========================================================================
// ADMIN PROTECTED ROUTES
// =========================================================================

// @route   GET /api/orders
// @desc    Admin: Get all orders
router.get('/', protect, admin, orderController.getAllOrders);

// @route   PUT /api/orders/:id/status
// @desc    Admin: Update order status
router.put(
    '/:id/status',
    protect,
    admin,
    [
        body('status').isIn(['Processing', 'Shipped', 'Delivered', 'Cancelled']).withMessage('Invalid status.')
    ],
    validationMiddleware,
    orderController.updateOrderStatus
);

module.exports = router;