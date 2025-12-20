const express = require('express');
const router = express.Router();
const { 
    createOrder, 
    verifyPaymentAndUpdateOrder, 
    handleRazorpayWebhook, 
    getOrderTracking, // NEW: Public tracking controller
    getMyOrders, 
    getOrderById,
    getAllOrders,       
    updateOrderStatus   
} = require('../controllers/orderController');

// Middleware
const { protect, admin } = require('../middleware/authMiddleware');

// --- 1. WEBHOOK ROUTE (PUBLIC) ---
/**
 * Razorpay Webhook handles server-to-server payments.
 * Resilience: Even if the user closes the tab, this route marks orders as PAID.
 */
router.post('/webhook', handleRazorpayWebhook);

// --- 2. PUBLIC TRACKING ROUTE ---
/**
 * Public endpoint for users to track order progress without logging in.
 * Security: Uses .select() in controller to hide private customer data.
 */
router.get('/track/:id', getOrderTracking);

// --- 3. CUSTOMER ROUTES (PROTECTED) ---
/**
 * Requirement: Order should only be placed once logged in.
 * Benefit: Prevents orphaned Cloudinary designs and ensures cart persistence.
 */
router.post('/create', protect, createOrder);
router.post('/verify-payment', protect, verifyPaymentAndUpdateOrder);
router.get('/myorders', protect, getMyOrders);

// --- 4. ADMIN ROUTES (RESTRICTED) ---
router.route('/')
    .get(protect, admin, getAllOrders);

router.route('/:id/status')
    .put(protect, admin, updateOrderStatus);

// --- 5. SHARED ROUTES (AUTHENTICATED) ---
router.route('/:id')
    .get(protect, getOrderById);

module.exports = router;