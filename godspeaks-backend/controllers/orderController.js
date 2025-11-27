const Order = require('../models/Order');
const Product = require('../models/Product'); 
const { createRazorpayOrder, verifyRazorpaySignature } = require('../services/razorpayService');
const mongoose = require('mongoose'); 

// --- HELPER: Calculate Price ---
const calculatePrice = async (orderItems) => {
    // Calculate simple total
    let itemsPrice = orderItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    
    // Free shipping over ₹2000 (200000 paisa)
    const shippingPrice = itemsPrice > 200000 ? 0 : 5000; 
    const totalPrice = itemsPrice + shippingPrice;

    return { itemsPrice, shippingPrice, totalPrice };
};

// --- HELPER: Update Stock ---
const updateStock = async (orderItems) => {
    // We only update stock for standard products, not custom prints
    for (const item of orderItems) {
        if (!item.isCustom) {
            const product = await Product.findById(item.product);
            if (product) {
                // In a true POD system, we might not track stock at all,
                // but if you have hybrid (some stock, some POD), we keep this.
                // However, since we switched to "Sizes Only" in the previous step,
                // we technically don't have counts to decrement.
                // We will leave this blank or log it for now.
                console.log(`POD Item: ${item.name} sold. No stock decrement needed.`);
            }
        }
    }
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

// @desc    Verify payment
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
        
        order.isPaid = true;
        order.paidAt = Date.now();
        order.orderStatus = 'Processing';
        order.paymentResult = {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        };

        await order.save();
        
        // Optional: Update stock if you were tracking it
        // await updateStock(order.orderItems);

        res.status(200).json({
            message: 'Payment successful! Order confirmed.',
            order: order,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error verifying payment.', error: error.message });
    }
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
        // Find orders by the email saved in Shipping Info (since we treat users as "guests" sometimes)
        // OR if you are strictly using req.user._id, change this query.
        // Here we stick to email for flexibility.
        const orders = await Order.find({ 'shippingInfo.email': req.user.email }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// =========================================================================
// ADMIN CONTROLLERS
// =========================================================================

// @desc    Get all orders
// @route   GET /api/orders
const getAllOrders = async (req, res) => {
    try {
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
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    getMyOrders,
};