const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// --------------------
// CLOUDINARY CONFIG
// --------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --------------------
// STORAGE CONFIG
// --------------------
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: 'godspeaks/products',
      format: file.mimetype.split('/')[1], // jpg, png, webp
      public_id: `product-${Date.now()}`,
    };
  },
});

// --------------------
// FILE FILTER (SECURITY)
// --------------------
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/webp'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, png, webp)'), false);
  }
};

// --------------------
// MULTER INSTANCE
// --------------------
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

module.exports = upload;
