const Coupon = require('../models/Coupon');

// User: Validate coupon at checkout
exports.validateCoupon = async (req, res) => {
  const { code } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon || new Date(coupon.expiryDate) < new Date()) {
    return res.status(400).json({ message: "Invalid or expired coupon" });
  }
  res.json({ discount: coupon.discount });
};

// Admin: Manage coupons
exports.getCoupons = async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json(coupons);
};

exports.createCoupon = async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json(coupon);
};

exports.deleteCoupon = async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ message: "Coupon deleted" });
};