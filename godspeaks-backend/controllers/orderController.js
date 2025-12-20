const Order = require('../models/Order');
const Product = require('../models/Product'); 
const { createRazorpayOrder, verifyRazorpaySignature } = require('../services/razorpayService');
const mongoose = require('mongoose'); 
const crypto = require('crypto');

// --- Import Email Services ---
const { sendOrderConfirmation, sendFulfillmentEmail } = require('../services/emailService');

// --- HELPER: Calculate Price ---
const calculatePrice = async (orderItems) => {
    // FIXED: Double-Sided Surcharge (₹200 = 20000 paisa)
    const DOUBLE_SIDE_SURCHARGE = 20000; 

    let itemsPrice = orderItems.reduce((acc, item) => {
        let basePrice = item.price * item.qty;
        
        // Logic: If custom and both high-res URLs exist, apply surcharge per item
        if (item.isCustom && item.printFileUrl && item.secondaryPrintUrl) {
            basePrice += (DOUBLE_SIDE_SURCHARGE * item.qty);
        }
        
        return acc + basePrice;
    }, 0);
    
    // Uses environment variables for dynamic shipping costs
    const shippingThreshold = Number(process.env.FREE_SHIPPING_THRESHOLD) || 200000;
    const shippingFee = Number(process.env.SHIPPING_FEE) || 5000;

    const shippingPrice = itemsPrice > shippingThreshold ? 0 : shippingFee; 
    const totalPrice = itemsPrice + shippingPrice;

    return { itemsPrice, shippingPrice, totalPrice };
};

// @desc    Create a new order
// @route   POST /api/orders/create
const createOrder = async (req, res) => {
    const { orderItems, shippingInfo } = req.body;

    if (!orderItems || orderItems.length === 0) {
        return res.status(400).json({ message: 'No order items' });
    }

    try {
        const { itemsPrice, shippingPrice, totalPrice } = await calculatePrice(orderItems);

        // 1. Pre-generate Razorpay Order
        const razorpayOrder = await createRazorpayOrder(totalPrice);

        if (!razorpayOrder) {
            return res.status(500).json({ message: 'Payment gateway initialization failed.' });
        }

        // 2. Save Order with Razorpay ID immediately for Webhook resilience
        const order = new Order({
            user: req.user._id, // Tied to logged-in user for persistence
            orderItems,
            shippingInfo,
            itemsPrice,
            shippingPrice,
            totalPrice,
            orderStatus: 'Pending',
            isPaid: false,
            razorpayOrderId: razorpayOrder.id 
        });

        const createdOrder = await order.save();
        
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
            return res.status(400).json({ message: 'Invalid payment signature.' });
        }
        
        const order = await Order.findById(order_id);

        if (!order) {
            return res.status(404).json({ message: 'Order record not found.' });
        }
        
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
        
        // --- TRIGGER FULFILLMENT EMAILS ---
        Promise.allSettled([
            sendOrderConfirmation(order),
            sendFulfillmentEmail(order) 
        ]).catch(err => console.error('Email Dispatch Error:', err));

        res.status(200).json({
            message: 'Payment verified successfully!',
            order: order,
        });

    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ message: 'Error verifying payment.' });
    }
};

// @desc    Handle Razorpay Webhook (Critical Fallback)
// @route   POST /api/orders/webhook
const handleRazorpayWebhook = async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest !== signature) {
        return res.status(400).json({ status: 'invalid signature' });
    }

    const event = req.body.event;
    
    if (event === 'payment.captured') {
        const payment = req.body.payload.payment.entity;
        const razorpayOrderId = payment.order_id; 

        try {
            const order = await Order.findOne({ razorpayOrderId: razorpayOrderId });

            if (order && !order.isPaid) {
                order.isPaid = true;
                order.paidAt = Date.now();
                order.orderStatus = 'Processing';
                order.paymentResult = {
                    razorpay_order_id: razorpayOrderId,
                    razorpay_payment_id: payment.id,
                };
                await order.save();

                Promise.allSettled([
                    sendOrderConfirmation(order),
                    sendFulfillmentEmail(order)
                ]);
            }
        } catch (err) {
            console.error('[Webhook Error] Processing failed:', err);
        }
    }

    res.json({ status: 'ok' });
};

// @desc    Get order status for tracking (Public)
// @route   GET /api/orders/track/:id
const getOrderTracking = async (req, res) => {
    try {
        // Find by ID but only select necessary fields for public viewing
        const order = await Order.findById(req.params.id)
            .select('orderStatus updatedAt shippingInfo.name');
        
        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid Order ID format' });
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) res.json(order);
        else res.status(404).json({ message: 'Order not found' });
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const pageSize = 10;
        const page = Number(req.query.pageNumber) || 1;

        const count = await Order.countDocuments({});
        const orders = await Order.find({})
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort({ createdAt: -1 });

        res.json({ orders, page, pages: Math.ceil(count / pageSize), totalOrders: count });
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

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
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = {
    createOrder,
    verifyPaymentAndUpdateOrder,
    handleRazorpayWebhook, 
    getOrderById,
    getOrderTracking, // NEW
    getAllOrders,
    updateOrderStatus,
    getMyOrders,
};