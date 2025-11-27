const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer', // Links to the logged-in user
        required: true,
        unique: true // One active cart per user
    },
    items: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            name: String,
            image: String,
            price: Number,
            qty: Number,
            size: String
        }
    ],
    isAbandoned: {
        type: Boolean,
        default: false
    },
    emailSent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // crucial for tracking 'last updated'
});

module.exports = mongoose.model('Cart', CartSchema);