const express = require('express');
const router = express.Router();

const { 
    createOrder, 
    verifyPaymentAndUpdateOrder, 
    handleRazorpayWebhook, 
    getOrderTracking,
    getMyOrders, 
    getOrderById,
    getAllOrders,       
    updateOrderStatus,
    reorder              // ✅ NEW
} = require('../controllers/orderController');

// Middleware
const { protect, admin } = require('../middleware/authMiddleware');

// --- 1. WEBHOOK ROUTE (PUBLIC) ---
/**
 * Razorpay Webhook handles server-to-server payments.
 * Even if user closes the tab, order is marked PAID.
 */
router.post('/webhook', handleRazorpayWebhook);

// --- 2. PUBLIC TRACKING ROUTE ---
/**
 * Public order tracking (no login required)
 */
router.get('/track/:id', getOrderTracking);

// --- 3. CUSTOMER ROUTES (PROTECTED) ---
/**
 * Only logged-in users can place & view orders
 */
router.post('/create', protect, createOrder);
router.post('/verify-payment', protect, verifyPaymentAndUpdateOrder);
router.get('/myorders', protect, getMyOrders);

// 🔁 RE-ORDER (ONE CLICK REPEAT PURCHASE)
router.post('/reorder/:orderId', protect, reorder);

// --- 4. ADMIN ROUTES (RESTRICTED) ---
router.route('/')
    .get(protect, admin, getAllOrders);

router.route('/:id/status')
    .put(protect, admin, updateOrderStatus);

// --- 5. SHARED ROUTES (AUTHENTICATED) ---
router.route('/:id')
    .get(protect, getOrderById);

module.exports = router;
