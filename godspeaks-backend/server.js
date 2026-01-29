require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const cron = require('node-cron');
const Cart = require('./models/Cart');
const { sendTestEmail } = require('./services/emailService');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const cartRoutes = require('./routes/cartRoutes');

// 1. Initialize App and Connect Database
connectDB(); 
const app = express();

app.set('trust proxy', 1);

// --- 2. SECURITY & RATE LIMITING ---

// Global Rate Limiter: 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter Limiter for Auth & Payments: 10 attempts per hour
const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, 
    max: 100, 
    message: { message: 'Too many attempts detected. Please try again in an hour.' },
});

// Apply Security headers
app.use(helmet({
    crossOriginResourcePolicy: false, 
}));

// Apply general limiter to all routes
app.use('/api/', generalLimiter);

// --- 3. HARDENED CORS (UPDATED) ---
// We allow both Localhost (for testing) and the Live URL (for production)
const allowedOrigins = [
    'http://localhost:3000', 
    'https://godspeaks.netlify.app',
    process.env.CLIENT_URL // Fallback if set in .env
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || !process.env.NODE_ENV) {
            callback(null, true);
        } else {
            console.log("Blocked by CORS:", origin); 
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// --- 4. API ROUTES ---

// Apply strict limiter to sensitive endpoints
app.use('/api/auth/login', strictLimiter);
app.use('/api/orders/create', strictLimiter);

app.use('/api/auth', authRoutes); 
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/cart', cartRoutes); 

app.get('/', (req, res) => {
    res.send('GodSpeaks API is Running...');
});

// --- 5. ABANDONED CART RECOVERY CRON JOB ---
cron.schedule('0 * * * *', async () => {
    const timestamp = new Date().toLocaleString();
    console.log(`[Cron Log ${timestamp}] Checking for abandoned carts...`);
    
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    try {
        const abandonedCarts = await Cart.find({
            updatedAt: { $lt: twentyFourHoursAgo },
            items: { $not: { $size: 0 } }, 
            emailSent: false,
            isAbandoned: false 
        }).populate('user'); 

        if (abandonedCarts.length === 0) return;

        for (const cart of abandonedCarts) {
            if (cart.user && cart.user.email) {
                const emailSubject = "You left some faith behind! 🛒";
                const emailBody = `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 40px;">
                        <h1 style="text-align: center;">GodSpeaks.</h1>
                        <h2>Hi ${cart.user.name || 'Friend'},</h2>
                        <p>We noticed you left some inspired designs in your cart.</p>
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/cart" style="background: #000; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px;">Return to My Cart</a>
                        </div>
                        <p>Blessings,<br/>The GodSpeaks Team</p>
                    </div>`;

                await sendTestEmail(cart.user.email, emailSubject, emailBody); 
                cart.emailSent = true;
                cart.isAbandoned = true;
                await cart.save();
            } else {
                cart.emailSent = true; 
                await cart.save();
            }
        }
    } catch (error) {
        console.error(`[Cron Log] Error in Job:`, error);
    }
});

// --- 6. GLOBAL ERROR HANDLING ---
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? '🛡️' : err.stack,
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[Server] Running on port: ${PORT}`);
});