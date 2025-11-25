const Order = require('../models/Order');
const Product = require('../models/Product'); 
const { createRazorpayOrder, verifyRazorpaySignature } = require('../services/razorpayService');
const mongoose = require('mongoose'); 

// --- HELPER FUNCTION: Calculate Total Price ---
const calculatePrice = async (orderItems) => {
    let itemsPrice = 0;
    // --- MOCK CALCULATION ---
    itemsPrice = orderItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    
    const shippingPrice = itemsPrice > 200000 ? 0 : 5000; 
    const totalPrice = itemsPrice + shippingPrice;

    return { itemsPrice, shippingPrice, totalPrice };
};

// --- HELPER FUNCTION: Update Stock ---
const updateStock = async (orderItems) => {
    console.log("Stock update skipped (DB inactive). Items:", orderItems.map(i => `${i.name} (Size: ${i.size}, Qty: ${i.qty})`));
};


// =========================================================================
// CONTROLLERS
// =========================================================================

// @desc    Create a new order
// @route   POST /api/orders/create
const createOrder = async (req, res) => {
    const { orderItems, shippingInfo } = req.body;

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

        // --- TEMPORARY MOCK ID (Replace with order.save() later) ---
        const createdOrder = { ...order._doc, _id: new mongoose.Types.ObjectId() };
        
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
        
        // --- TEMPORARY MOCK ORDER ---
        const order = { 
            _id: order_id, 
            isPaid: false, 
            orderStatus: 'Pending', 
            orderItems: [{ name: "Mock Tee", size: "L", qty: 1 }],
            save: () => console.log("Mock order save called."), 
        };

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

        await updateStock(order.orderItems);

        const updatedOrder = order; 

        res.status(200).json({
            message: 'Payment successful! Order confirmed.',
            order: updatedOrder,
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error verifying payment.', error: error.message });
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
const getOrderById = async (req, res) => {
    try {
        // --- MOCK DATA ---
        const order = { 
            _id: req.params.id, 
            shippingInfo: { name: "Test User" }, 
            orderItems: [{ name: "Mock Tee", size: "L", qty: 1 }],
            totalPrice: 99900,
            isPaid: true,
            orderStatus: 'Processing'
        };
        
        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

// @desc    Get guest orders
// @route   GET /api/orders/my-orders/:email
const getGuestOrders = async (req, res) => {
    try {
        // --- MOCK DATA ---
        const orders = [{ 
            _id: "60c72b2f9f1b2c001c8e4d22", 
            shippingInfo: { email: req.params.email },
            orderItems: [{ name: "Guest Order Tee", size: "M", qty: 2 }],
            totalPrice: 199800,
            orderStatus: 'Shipped',
            createdAt: new Date()
        }];
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

// --- THIS WAS MISSING ---
// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
const getMyOrders = async (req, res) => {
    try {
        // Find orders where shipping email matches the logged-in user's email
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
        // --- MOCK DATA ---
        const orders = [{ 
            _id: "60c72b2f9f1b2c001c8e4d22", 
            shippingInfo: { name: "Test User 1" },
            totalPrice: 199800,
            orderStatus: 'Shipped',
            isPaid: true
        }, {
            _id: "60c72b2f9f1b2c001c8e4d23", 
            shippingInfo: { name: "Test User 2" },
            totalPrice: 89900,
            orderStatus: 'Processing',
            isPaid: true
        }];
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
        // --- MOCK DATA ---
        const order = {
            _id: req.params.id,
            orderStatus: 'Processing',
            isDelivered: false,
            save: () => console.log("Mock order save called."),
        };
        
        if (order) {
            order.orderStatus = status;
            if (status === 'Delivered') {
                order.isDelivered = true;
                order.deliveredAt = Date.now();
            }
            const updatedOrder = order;
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
    getGuestOrders,
    getAllOrders,
    updateOrderStatus,
    getMyOrders, // <--- Now this will work because the function is defined above
};