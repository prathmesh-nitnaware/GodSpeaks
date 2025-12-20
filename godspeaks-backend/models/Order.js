const mongoose = require('mongoose');

// --- SUB-SCHEMA: ORDERED ITEM ---
const OrderItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    size: { type: String, required: true },
    color: { type: String }, // NEW: Store the selected fabric color
    image: { type: String, required: true }, // Web-optimized thumbnail
    price: { type: Number, required: true }, 
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: false, 
        ref: 'Product',
    },
    isCustom: { type: Boolean, default: false },
    // --- UPDATED: Assets for the Printer ---
    printFileUrl: { type: String },      // High-Res Front Design
    secondaryPrintUrl: { type: String }, // High-Res Back Design
    message: { type: String },           // NEW: Special instructions from customer
});

// --- MAIN ORDER SCHEMA ---
const OrderSchema = new mongoose.Schema({
    shippingInfo: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String, required: true },
    },
    
    orderItems: [OrderItemSchema],

    // --- NEW: Critical for Webhook matching ---
    razorpayOrderId: { 
        type: String, 
        required: false, 
        index: true // Indexed for fast lookup by the webhook
    },

    paymentResult: {
        razorpay_order_id: { type: String },
        razorpay_payment_id: { type: String },
        razorpay_signature: { type: String },
    },
    
    orderStatus: {
        type: String,
        required: true,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending',
    },

    itemsPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },

    isPaid: {
        type: Boolean,
        required: true,
        default: false,
    },
    paidAt: {
        type: Date,
    },
    
    isDelivered: {
        type: Boolean,
        required: true,
        default: false,
    },
    deliveredAt: {
        type: Date,
    },
    // NEW: Tracking Information
    trackingId: { type: String },
    carrier: { type: String, default: 'Standard Courier' }
}, {
    timestamps: true 
});

const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;