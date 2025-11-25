const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Middleware to protect routes (ensure user is logged in)
const protect = async (req, res, next) => {
    let token;

    // Check if the authorization header is present and starts with 'Bearer'
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header (it looks like: "Bearer <token>")
            token = req.headers.authorization.split(' ')[1];

            // Verify token using the secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find the admin user based on the decoded ID and attach it to the request object
            // NOTE: We exclude the password when fetching the user
            req.admin = await Admin.findById(decoded.id).select('-password');

            if (!req.admin) {
                // If user doesn't exist (e.g., user was deleted)
                res.status(401).json({ message: 'Not authorized, user not found' });
                return;
            }

            // Move on to the next middleware/controller function
            next();
            
        } catch (error) {
            // Handle common JWT errors (e.g., expired token, invalid signature)
            res.status(401).json({ message: 'Not authorized, token failed or expired' });
            return;
        }
    }

    // If no token is provided in the header
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

// Middleware to check if the user has admin rights (optional, but good practice)
const admin = (req, res, next) => {
    // We check the 'role' field attached during the 'protect' middleware
    if (req.admin && req.admin.role === 'superadmin') {
        next(); // User is an admin, proceed
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };