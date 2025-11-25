const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with your credentials
// IMPORTANT: Ensure your .env file has CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // <-- REPLACE IN .ENV
    api_key: process.env.CLOUDINARY_API_KEY,       // <-- REPLACE IN .ENV
    api_secret: process.env.CLOUDINARY_API_SECRET, // <-- REPLACE IN .ENV
    secure: true, // Use HTTPS
});

module.exports = cloudinary;