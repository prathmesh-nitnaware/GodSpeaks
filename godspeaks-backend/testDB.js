require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log("Testing MongoDB Connection...");
        console.log("URI:", process.env.MONGO_URI ? "Found (Hidden)" : "Missing!");
        
        await mongoose.connect(process.env.MONGO_URI);
        
        console.log("✅ SUCCESS! Connected to MongoDB.");
        process.exit(0);
    } catch (error) {
        console.error("❌ MONGODB ERROR:", error.message);
        process.exit(1);
    }
};

connectDB();