const mongoose = require('mongoose');

// --- SUB-SCHEMA: ORDERED ITEM ---
const OrderItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    size: { type: String, required: true },
    image: { type: String, required: true }, // The product image OR custom artwork
    price: { type: Number, required: true }, 
    // Link to product is optional for Custom Prints
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: false, 
        ref: 'Product',
    },
    // New field for custom design
    isCustom: { type: Boolean, default: false },
    customPrintUrl: { type: String }, 
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
}, {
    timestamps: true 
});

const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;