const Admin = require('../models/Admin');
const Customer = require('../models/Customer'); // <-- Import new model
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new Customer
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // 1. Check if email exists in EITHER collection
        const adminExists = await Admin.findOne({ email });
        const customerExists = await Customer.findOne({ email });

        if (adminExists || customerExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 2. Create new CUSTOMER (Admins cannot be created via API)
        const customer = await Customer.create({
            email,
            password,
            role: 'customer'
        });

        if (customer) {
            res.status(201).json({
                _id: customer._id,
                email: customer.email,
                role: customer.role,
                token: generateToken(customer._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Login (Admin or Customer)
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // --- 1. Check Admin Collection First ---
        const admin = await Admin.findOne({ email });

        if (admin && (await admin.matchPassword(password))) {
            return res.json({
                _id: admin._id,
                email: admin.email,
                role: admin.role, // 'superadmin' or 'admin'
                token: generateToken(admin._id),
            });
        }

        // --- 2. If not Admin, Check Customer Collection ---
        const customer = await Customer.findOne({ email });

        if (customer && (await customer.matchPassword(password))) {
            return res.json({
                _id: customer._id,
                email: customer.email,
                role: customer.role, // 'customer'
                token: generateToken(customer._id),
            });
        }

        // --- 3. If neither found ---
        res.status(401).json({ message: 'Invalid Credentials' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { registerAdmin: registerUser, adminLogin: loginUser };