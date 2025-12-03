const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Customer = require('../models/Customer'); 

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // CHECK: If token string is "undefined" or "null" (common frontend bugs)
      if (!token || token === 'undefined' || token === 'null') {
          return res.status(401).json({ message: 'Not authorized, invalid token' });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if user is Admin
      let user = await Admin.findById(decoded.id).select('-password');
      
      // If not Admin, check if Customer
      if (!user) {
          user = await Customer.findById(decoded.id).select('-password');
      }

      if (!user) {
          return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error.message);
      // Specific handling for malformed JWT to avoid server crash
      if (error.name === 'JsonWebTokenError') {
          return res.status(401).json({ message: 'Not authorized, token failed' });
      }
      if (error.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Not authorized, token expired' });
      }
      res.status(401).json({ message: 'Not authorized' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };