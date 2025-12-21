const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Customer = require('../models/Customer'); 

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 1. Search for the ID in both collections
            let user = await Admin.findById(decoded.id).select('-password');
            if (!user) {
                user = await Customer.findById(decoded.id).select('-password');
            }

            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            req.user = user; // This attaches the user object to the request
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Token failed' });
        }
    } else {
        res.status(401).json({ message: 'No token found' });
    }
};

const admin = (req, res, next) => {
  if (req.user && (
      req.user.role === 'admin' || 
      req.user.role === 'superadmin' || // ADDED: Matches your specific DB role
      req.user.isAdmin === true
  )) {
    next();
  } else {
    // This is where the 401 error was being generated
    res.status(401).json({ message: 'Not authorized as an admin or superadmin' });
  }
};

module.exports = { protect, admin };