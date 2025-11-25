const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing

const AdminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    // You can add more fields if needed, like name or role
    role: {
        type: String,
        default: 'superadmin', // Set a default role
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// --- ENCRYPT PASSWORD BEFORE SAVING (Middleware) ---
// This pre-save hook runs before the model is saved to the DB
AdminSchema.pre('save', async function(next) {
    // Only run if the password field has been modified (e.g., on creation or update)
    if (!this.isModified('password')) {
        return next();
    }
    
    // Hash the password with a salt
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// --- CUSTOM METHOD: Compare Password ---
// Used to check if the entered password matches the hashed password in the DB
AdminSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};


const Admin = mongoose.model('Admin', AdminSchema);
module.exports = Admin;