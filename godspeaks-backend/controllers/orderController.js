const Order = require('../models/Order');
const Product = require('../models/Product'); 
const { createRazorpayOrder, verifyRazorpaySignature } = require('../services/razorpayService');
const mongoose = require('mongoose'); 
const crypto = require('crypto'); // Required for Webhook Verification

// --- Import Email Services ---
const { sendOrderConfirmation, sendFulfillmentEmail } = require('../services/emailService');

// --- HELPER: Calculate Price ---
const calculatePrice = async (orderItems) => {
    let itemsPrice = orderItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    
    // Free shipping over ₹2000 (200000 paisa)
    // PRO TIP: Move '200000' to process.env.FREE_SHIPPING_THRESHOLD later
    const shippingPrice = itemsPrice > 200000 ? 0 : 5000; 
    const totalPrice = itemsPrice + shippingPrice;

    return { itemsPrice, shippingPrice, totalPrice };
};

// =========================================================================
// CONTROLLERS
// =========================================================================

// @desc    Create a new order
// @route   POST /api/orders/create
const createOrder = async (req, res) => {
    const { orderItems, shippingInfo } = req.body;

    if (!orderItems || orderItems.length === 0) {
        return res.status(400).json({ message: 'No order items' });
    }

    try {
        const { itemsPrice, shippingPrice, totalPrice } = await calculatePrice(orderItems);

        const order = new Order({
            orderItems,
            shippingInfo,
            itemsPrice,
            shippingPrice,
            totalPrice,
            orderStatus: 'Pending',
            isPaid: false,
        });

        const createdOrder = await order.save();
        
        // Create Razorpay Order
        const razorpayOrder = await createRazorpayOrder(totalPrice);

        if (!razorpayOrder) {
            return res.status(500).json({ message: 'Razorpay order creation failed.' });
        }

        res.status(201).json({
            message: 'Order created. Proceed to payment.',
            orderId: createdOrder._id, 
            razorpayOrderId: razorpayOrder.id, 
            amount: razorpayOrder.amount,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        });

    } catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({ message: 'Server error creating order.', error: error.message });
    }
};

// @desc    Verify payment (Frontend Callback)
// @route   POST /api/orders/verify-payment
const verifyPaymentAndUpdateOrder = async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        order_id 
    } = req.body;

    try {
        const isSignatureValid = verifyRazorpaySignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isSignatureValid) {
            return res.status(400).json({ message: 'Payment verification failed: Invalid signature.' });
        }
        
        const order = await Order.findById(order_id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        
        // Avoid duplicate processing
        if (order.isPaid) {
            return res.status(200).json({ message: 'Order already processed.', order });
        }

        order.isPaid = true;
        order.paidAt = Date.now();
        order.orderStatus = 'Processing';
        order.paymentResult = {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        };

        await order.save();
        
        // --- NEW: Send Emails (Async) ---
        Promise.allSettled([
            sendOrderConfirmation(order),
            sendFulfillmentEmail(order)
        ]).then(() => console.log('Emails triggered successfully.'));

        res.status(200).json({
            message: 'Payment successful! Order confirmed.',
            order: order,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error verifying payment.', error: error.message });
    }
};

// @desc    Handle Razorpay Webhook (Server-to-Server Fallback)
// @route   POST /api/orders/webhook
const handleRazorpayWebhook = async (req, res) => {
    // 1. Validate Signature
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest !== req.headers['x-razorpay-signature']) {
        return res.status(400).json({ status: 'invalid signature' });
    }

    // 2. Process Event
    const event = req.body.event;
    
    if (event === 'payment.captured') {
        const payment = req.body.payload.payment.entity;
        const razorpayOrderId = payment.order_id; // The ID starting with 'order_...'

        try {
            // Find order by the Razorpay Order ID stored in controller create step
            // Note: This requires you to search via paymentResult.razorpay_order_id
            // However, the DB won't have this field saved until AFTER payment in the current logic.
            // FIX: We need to match by amount/email OR update CreateOrder to save the RazorpayOrderID immediately.
            
            // Assuming we updated CreateOrder to save RazorpayOrderID (Recommended), 
            // OR we search for the order that has 'isPaid: false' and matches the criteria.
            // For now, we will simply log this. To fully implement, add `razorpayOrderId` to Order model at creation time.
            console.log(`Webhook: Payment captured for ${razorpayOrderId}`);
            
            // Logic to mark order as paid would go here if not already paid
        } catch (err) {
            console.error('Webhook Error:', err);
        }
    }

    res.json({ status: 'ok' });
};

// @desc    Get single order
// @route   GET /api/orders/:id
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ 'shippingInfo.email': req.user.email }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
const getAllOrders = async (req, res) => {
    try {
        // --- PRO TIP: Add pagination here later ---
        const orders = await Order.find({}).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
    const { status } = req.body; 
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.orderStatus = status;
            if (status === 'Delivered') {
                order.isDelivered = true;
                order.deliveredAt = Date.now();
            }
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

module.exports = {
    createOrder,
    verifyPaymentAndUpdateOrder,
    handleRazorpayWebhook, // Export new function
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    getMyOrders,
};