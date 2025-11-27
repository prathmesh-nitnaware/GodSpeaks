const express = require('express');
const router = express.Router();
const { 
    createOrder, 
    verifyPaymentAndUpdateOrder, 
    getMyOrders, 
    getOrderById,
    getAllOrders,       // Admin
    updateOrderStatus   // Admin
} = require('../controllers/orderController');

// Middleware
const { protect, admin } = require('../middleware/authMiddleware');

// --- CUSTOMER ROUTES ---
router.post('/create', protect, createOrder);
router.post('/verify-payment', protect, verifyPaymentAndUpdateOrder);
router.get('/myorders', protect, getMyOrders);

// --- ADMIN ROUTES ---
// This was likely causing the crash if getAllOrders wasn't imported correctly
router.route('/')
    .get(protect, admin, getAllOrders);

router.route('/:id/status')
    .put(protect, admin, updateOrderStatus);

// --- SHARED ROUTES ---
// Put this last so it doesn't trap other routes like 'myorders'
router.route('/:id')
    .get(protect, getOrderById);

module.exports = router;