require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

console.log("Testing Credentials...");
console.log("User:", process.env.EMAIL_USER);
// Do not log the real password, just length
console.log("Pass Length:", process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : "Undefined"); 

transporter.verify(function (error, success) {
    if (error) {
        console.log("❌ ERROR:", error);
    } else {
        console.log("✅ SUCCESS! Server is ready to take our messages");
    }
});