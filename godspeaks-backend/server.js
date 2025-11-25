require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

// 1. Connect to Database
connectDB(); 

const app = express();

// 2. Enable CORS
app.use(cors({
    origin: ['http://localhost:3000'], 
    credentials: true
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// 3. Mount Routes
// CHANGED: /api/admin -> /api/auth
app.use('/api/auth', authRoutes); 
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => {
    res.send('GodSpeaks API is Running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});