const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator');

// Validation rules
const loginRules = [
    body('email').isEmail().normalizeEmail().withMessage('Enter a valid email address'),
    body('password').exists().withMessage('Password is required')
];

const registerRules = [
    body('email').isEmail().normalizeEmail().withMessage('Enter a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

// @route   POST /api/admin/login
router.post('/login', loginRules, authController.adminLogin);

// @route   POST /api/admin/register
router.post('/register', registerRules, authController.registerAdmin);

module.exports = router;