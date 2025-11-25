const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin'); // We assume this model exists from previous steps
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const importData = async () => {
    try {
        // 1. Clear old admins to avoid duplicates
        await Admin.deleteMany();

        // 2. Create the new Admin User
        const adminUser = {
            email: 'admin@godspeaks.com',
            password: 'Admin@123', // This will be encrypted by your Admin model
            role: 'superadmin'
        };

        await Admin.create(adminUser);

        console.log('SUCCESS: Admin user created!');
        console.log('Email: admin@godspeaks.com');
        console.log('Password: Admin@123');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

importData();