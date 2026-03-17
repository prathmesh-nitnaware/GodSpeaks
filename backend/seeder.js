const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Product = require('./models/Product');
const Admin = require('./models/Admin');
const Customer = require('./models/Customer');

dotenv.config();
connectDB();

const importData = async () => {
  try {
    // 1. WIPE OLD DATA
    await Product.deleteMany();
    await Admin.deleteMany();
    await Customer.deleteMany();

    console.log('Data Destroyed...');

    // 2. CREATE ADMIN
    const createdAdmin = await Admin.create({
      name: 'Admin User',
      email: 'admin@godspeaks.com',
      password: 'password123', // hashed via pre-save hook
      role: 'superadmin',
      isAdmin: true,
    });

    // 3. CREATE CUSTOMER
    await Customer.create({
      name: 'John Doe',
      email: 'user@example.com',
      password: 'password123',
      role: 'customer',
    });

    console.log('Users Created...');

    // 4. CREATE PRODUCTS
    const products = [
      {
        user: createdAdmin._id,
        name: 'Lion of Judah Tee',
        images: [
          'https://res.cloudinary.com/dkqtb4wmq/image/upload/v1/godspeaks-assets/lion-tee.png',
        ],
        description:
          'Premium cotton t-shirt featuring the Lion of Judah design. Bold and faithful.',
        color: 'Black',
        price: 79900,
        sizes: [
          { size: 'S', available: true },
          { size: 'M', available: true },
          { size: 'L', available: true },
          { size: 'XL', available: false },
          { size: 'XXL', available: true },
        ],
        rating: 0,
        numReviews: 0,
        isAvailable: true,
      },
      {
        user: createdAdmin._id,
        name: 'Chosen & Loved Hoodie',
        images: [
          'https://res.cloudinary.com/dkqtb4wmq/image/upload/v1/godspeaks-assets/hoodie-beige.png',
        ],
        description: 'Cozy beige hoodie with minimalist scripture print.',
        color: 'Beige',
        price: 149900,
        sizes: [
          { size: 'M', available: true },
          { size: 'L', available: true },
          { size: 'XL', available: true },
        ],
        rating: 0,
        numReviews: 0,
        isAvailable: true,
      },
      {
        user: createdAdmin._id,
        name: 'Faith Over Fear Cap',
        images: [
          'https://res.cloudinary.com/dkqtb4wmq/image/upload/v1/godspeaks-assets/cap-navy.png',
        ],
        description: 'Adjustable navy blue cap with embroidered text.',
        color: 'Navy',
        price: 49900,
        sizes: [
          { size: 'ONE_SIZE', available: true }, // ✅ FIXED
        ],
        rating: 0,
        numReviews: 0,
        isAvailable: true,
      },
    ];

    await Product.insertMany(products);

    console.log('Products Imported!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Product.deleteMany();
    await Admin.deleteMany();
    await Customer.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
