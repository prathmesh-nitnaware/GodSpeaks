const Admin = require('../models/Admin');
const Customer = require('../models/Customer');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Built-in Node.js module
const { validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const { sendTestEmail } = require('../services/emailService');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new Customer
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
    const { email, password, name } = req.body;
    try {
        const adminExists = await Admin.findOne({ email });
        const customerExists = await Customer.findOne({ email });

        if (adminExists || customerExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const customer = await Customer.create({
            name,
            email,
            password,
            role: 'customer' // FIXED: Should default to customer, not admin
        });

        res.status(201).json({
            _id: customer._id,
            email: customer.email,
            role: customer.role,
            token: generateToken(customer._id),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Forgot Password - Generate Token & Email
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        // Check both collections
        const user = await Customer.findOne({ email }) || await Admin.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "No user found with this email" });
        }

        // 1. Create a reset token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // 2. Hash token and set to expire in 10 minutes
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; 

        await user.save({ validateBeforeSave: false });

        // 3. Send Email
        const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
        const message = `
            <h1>Password Reset Request</h1>
            <p>You requested a password reset for your GodSpeaks account. Please click the link below:</p>
            <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
            <p>This link expires in 10 minutes.</p>
        `;

        await sendTestEmail(user.email, "GodSpeaks Password Reset", message);
        res.status(200).json({ message: "Reset email sent successfully" });

    } catch (error) {
        res.status(500).json({ message: "Email could not be sent", error: error.message });
    }
};

// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:resetToken
const resetPassword = async (req, res) => {
    // Hash the token from URL to match database
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

    try {
        const user = await Customer.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        }) || await Admin.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        // Set new password (Model middleware will hash it)
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ message: "Password updated successfully! You can now login." });
    } catch (error) {
        res.status(500).json({ message: "Reset failed", error: error.message });
    }
};

// ... keep loginUser and googleLogin as they were ...

module.exports = { 
    registerUser, 
    adminLogin: loginUser,
    googleLogin,
    forgotPassword,
    resetPassword
};