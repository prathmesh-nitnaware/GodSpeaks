const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   POST /api/upload
// @desc    Upload product image to Cloudinary (Admin only)
// @access  Private/Admin
router.post(
  '/',
  protect,
  admin,
  upload.single('image'),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Cloudinary URL is already available here
      res.status(201).json({
        url: req.file.path,
      });
    } catch (error) {
      console.error('Upload Error:', error);
      res.status(500).json({ message: 'Image upload failed' });
    }
  }
);

module.exports = router;
