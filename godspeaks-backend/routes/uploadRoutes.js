const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload'); // Your existing multer config
const cloudinary = require('../config/cloudinary');

// @route   POST /api/upload
// @desc    Upload an image (Public/Customer use)
// @access  Public
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to Cloudinary folder 'godspeaks-custom-prints'
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'godspeaks-custom-prints' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      // Pipe the buffer from multer to Cloudinary
      const bufferStream = require('stream').Readable.from(req.file.buffer);
      bufferStream.pipe(uploadStream);
    });

    res.json({ url: result.secure_url });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: 'Image upload failed' });
  }
});

module.exports = router;