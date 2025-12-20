const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    adminLogin, 
    googleLogin, 
    forgotPassword, 
    resetPassword 
} = require('../controllers/authController');
const { body } = require('express-validator');

/**
 * Validation Rules
 */
const loginRules = [
    body('email').isEmail().normalizeEmail().withMessage('Enter a valid email address'),
    body('password').exists().withMessage('Password is required')
];

const registerRules = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Enter a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

/**
 * AUTH ROUTES
 */

// @route   POST /api/auth/register
// Registers a new customer
router.post('/register', registerRules, registerUser);

// @route   POST /api/auth/login
// Supports both Admin and Customer login
router.post('/login', loginRules, adminLogin);

// @route   POST /api/auth/google
// Handles social authentication
router.post('/google', googleLogin);

/**
 * PASSWORD RECOVERY ROUTES
 */

// @route   POST /api/auth/forgot-password
// Generates a secure token and emails it to the user
router.post('/forgot-password', [
    body('email').isEmail().withMessage('Please provide a valid email')
], forgotPassword);

// @route   PUT /api/auth/reset-password/:resetToken
// Verifies the token and updates the user's password
router.put('/reset-password/:resetToken', [
    body('password').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], resetPassword);

module.exports = router;