const express = require('express');
const router = express.Router();
const { 
    createOrder, 
    verifyPaymentAndUpdateOrder, 
    handleRazorpayWebhook, // Import the webhook controller
    getMyOrders, 
    getOrderById,
    getAllOrders,       
    updateOrderStatus   
} = require('../controllers/orderController');

// Middleware
const { protect, admin } = require('../middleware/authMiddleware');

// --- WEBHOOK ROUTE (MUST BE PUBLIC) ---
// This handles server-to-server updates from Razorpay
router.post('/webhook', handleRazorpayWebhook);

// --- CUSTOMER ROUTES ---
router.post('/create', protect, createOrder);
router.post('/verify-payment', protect, verifyPaymentAndUpdateOrder);
router.get('/myorders', protect, getMyOrders);

// --- ADMIN ROUTES ---
router.route('/')
    .get(protect, admin, getAllOrders);

router.route('/:id/status')
    .put(protect, admin, updateOrderStatus);

// --- SHARED ROUTES ---
router.route('/:id')
    .get(protect, getOrderById);

module.exports = router;