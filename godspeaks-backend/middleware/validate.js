const { validationResult } = require('express-validator');

// Middleware function to check for validation errors
const validationMiddleware = (req, res, next) => {
    // Collect errors from the previous validation checks (in the routes file)
    const errors = validationResult(req);
    
    // If there are no errors, proceed to the next middleware/controller
    if (errors.isEmpty()) {
        return next();
    }

    // If there ARE errors, format them and return a 400 Bad Request
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));

    return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: extractedErrors,
    });
};

module.exports = validationMiddleware;