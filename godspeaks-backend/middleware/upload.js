const multer = require('multer');

// Configure storage: We use memory storage so the file is stored in a Buffer
// It's crucial for piping directly to Cloudinary without saving to disk first.
const storage = multer.memoryStorage();

// File filter: Only allow image files
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        // Pass an error if the file type is not an image
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Multer middleware setup
const upload = multer({
    storage: storage,
    limits: {
        // Limit file size to 5MB
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

// We export the configured multer instance, ready to use in routes
module.exports = upload;