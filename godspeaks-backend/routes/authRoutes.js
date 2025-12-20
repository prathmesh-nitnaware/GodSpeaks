const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser, // CHANGED: Match the export name from authController
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

router.post('/register', registerRules, registerUser);

// CHANGED: Using loginUser here
router.post('/login', loginRules, loginUser);

router.post('/google', googleLogin);

/**
 * PASSWORD RECOVERY ROUTES
 */

router.post('/forgot-password', [
    body('email').isEmail().withMessage('Please provide a valid email')
], forgotPassword);

router.put('/reset-password/:resetToken', [
    body('password').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], resetPassword);

module.exports = router;