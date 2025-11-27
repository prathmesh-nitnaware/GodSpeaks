const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const { protect } = require('../middleware/authMiddleware');

// Sync Cart (Called when user updates cart on frontend)
router.post('/sync', protect, async (req, res) => {
    const { items } = req.body;
    try {
        let cart = await Cart.findOne({ user: req.user._id });
        
        if (cart) {
            cart.items = items;
            cart.isAbandoned = false; // Reset if they are active
            cart.emailSent = false;
            cart.updatedAt = Date.now(); // Explicitly update time
            await cart.save();
        } else {
            cart = await Cart.create({
                user: req.user._id,
                items: items
            });
        }
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: "Cart sync failed" });
    }
});

module.exports = router;