const Admin = require('../models/Admin');
const Customer = require('../models/Customer');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const { sendTestEmail } = require('../services/emailService');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new Customer
const registerUser = async (req, res) => {
    const { email, password, name } = req.body;
    try {
        const adminExists = await Admin.findOne({ email });
        const customerExists = await Customer.findOne({ email });

        if (adminExists || customerExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const customer = await Customer.create({ name, email, password, role: 'customer' });

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

// @desc    Login (Admin or Customer)
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check Admin first
        const admin = await Admin.findOne({ email });
        if (admin && (await admin.matchPassword(password))) {
            return res.json({
                _id: admin._id,
                email: admin.email,
                role: admin.role,
                token: generateToken(admin._id),
            });
        }

        // Check Customer
        const customer = await Customer.findOne({ email });
        if (customer && (await customer.matchPassword(password))) {
            return res.json({
                _id: customer._id,
                email: customer.email,
                role: customer.role,
                token: generateToken(customer._id),
            });
        }

        res.status(401).json({ message: 'Invalid Credentials' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Google Social Login
const googleLogin = async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { email, name, sub } = ticket.getPayload();

        let user = await Customer.findOne({ email });
        if (!user) {
            user = await Customer.create({
                name,
                email,
                password: sub + process.env.JWT_SECRET,
                role: 'customer'
            });
        }

        res.json({
            _id: user._id,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(400).json({ message: "Google Login Failed" });
    }
};

// @desc    Forgot Password
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await Customer.findOne({ email }) || await Admin.findOne({ email });
        if (!user) return res.status(404).json({ message: "No user found" });

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await user.save({ validateBeforeSave: false });

        const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
        await sendTestEmail(user.email, "Password Reset", `Reset link: ${resetUrl}`);
        res.status(200).json({ message: "Reset email sent" });
    } catch (error) {
        res.status(500).json({ message: "Email error" });
    }
};

// @desc    Reset Password
const resetPassword = async (req, res) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');
    try {
        const user = await Customer.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } }) 
                   || await Admin.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });

        if (!user) return res.status(400).json({ message: "Invalid or expired token" });

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        res.status(200).json({ message: "Password updated" });
    } catch (error) {
        res.status(500).json({ message: "Reset failed" });
    }
};

module.exports = { 
    registerUser, 
    loginUser, 
    googleLogin, 
    forgotPassword, 
    resetPassword 
};