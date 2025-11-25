const mongoose = require('mongoose');

// --- SUB-SCHEMA: ORDERED ITEM ---
// Defines the structure of a single item within an order
const OrderItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    size: { type: String, required: true },
    image: { type: String, required: true }, // Store the primary image URL
    price: { type: Number, required: true }, // Price *in paisa* at time of purchase
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product', // Links this item back to the Product collection
    },
});

// --- MAIN ORDER SCHEMA ---
const OrderSchema = new mongoose.Schema({
    // We are not using a User model for guest checkout
    // Instead, we store shipping details directly on the order
    shippingInfo: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String, required: true },
    },
    
    // Array of items purchased
    orderItems: [OrderItemSchema],

    // Payment Details
    paymentResult: {
        razorpay_order_id: { type: String },
        razorpay_payment_id: { type: String },
        razorpay_signature: { type: String },
    },
    
    // Order Status
    orderStatus: {
        type: String,
        required: true,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending',
    },

    // Price Details (Stored in Paisa)
    itemsPrice: { type: Number, required: true, default: 0.0 }, // Subtotal
    shippingPrice: { type: Number, required: true, default: 0.0 }, // Shipping cost
    totalPrice: { type: Number, required: true, default: 0.0 }, // itemsPrice + shippingPrice

    // Payment Status
    isPaid: {
        type: Boolean,
        required: true,
        default: false,
    },
    paidAt: {
        type: Date,
    },
    
    // Delivery Status
    isDelivered: {
        type: Boolean,
        required: true,
        default: false,
    },
    deliveredAt: {
        type: Date,
    },
}, {
    timestamps: true // Adds createdAt and updatedAt
});

const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;