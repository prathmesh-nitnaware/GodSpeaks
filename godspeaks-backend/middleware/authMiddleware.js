const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Customer = require('../models/Customer');

// ===============================
// PROTECT ROUTES (JWT REQUIRED)
// ===============================
const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Try Admin first
            let user = await Admin.findById(decoded.id).select('-password');

            // Else Customer
            if (!user) {
                user = await Customer.findById(decoded.id).select('-password');
            }

            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Token invalid' });
        }
    } else {
        return res.status(401).json({ message: 'No token provided' });
    }
};

// ===============================
// ADMIN / SUPERADMIN ONLY
// ===============================
const admin = (req, res, next) => {
    if (
        req.user &&
        (req.user.role === 'superadmin' ||
            req.user.role === 'admin' ||
            req.user.isAdmin === true)
    ) {
        next();
    } else {
        return res
            .status(403)
            .json({ message: 'Admin or Superadmin access required' });
    }
};

module.exports = { protect, admin };
