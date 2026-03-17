require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

mongoose.connect(process.env.MONGO_URI);

async function reset() {
  const admin = await Admin.findOne({ email: 'admin@godspeaks.com' });

  if (!admin) {
    console.log('Admin not found');
    process.exit(1);
  }

  admin.password = 'admin123'; // NEW PASSWORD
  await admin.save(); // 🔐 hashing happens here

  console.log('✅ Admin password reset successfully');
  process.exit();
}

reset();
