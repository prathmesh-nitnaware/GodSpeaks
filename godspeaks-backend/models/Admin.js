const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 

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
    role: {
        type: String,
        default: 'superadmin', 
    },
    // --- NEW: Password Reset Fields ---
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, {
    timestamps: true 
});

// --- ENCRYPT PASSWORD BEFORE SAVING ---
AdminSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// --- CUSTOM METHOD: Compare Password ---
AdminSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Admin = mongoose.model('Admin', AdminSchema);
module.exports = Admin;