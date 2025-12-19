require('dotenv').config();
const express = require('express');
const cors = require('cors');
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

// 1. Connect to Database
connectDB(); 

const app = express();

// --- FIXED: Dynamic CORS Origin ---
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

app.use(cors({
    origin: [clientUrl], 
    credentials: true
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// 3. Mount Routes
app.use('/api/auth', authRoutes); 
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/cart', cartRoutes); 

app.get('/', (req, res) => {
    res.send('GodSpeaks API is Running...');
});

// --- 4. ABANDONED CART RECOVERY CRON JOB ---
// Runs every hour at minute 0 (0 * * * *)
cron.schedule('0 * * * *', async () => {
    console.log('[Cron] Checking for abandoned carts...');
    
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    try {
        const abandonedCarts = await Cart.find({
            updatedAt: { $lt: twentyFourHoursAgo },
            items: { $not: { $size: 0 } }, 
            emailSent: false,
            isAbandoned: false 
        }).populate('user'); 

        if (abandonedCarts.length === 0) {
            console.log('[Cron] No abandoned carts found.');
            return;
        }

        console.log(`[Cron] Found ${abandonedCarts.length} abandoned carts. Sending emails...`);

        for (const cart of abandonedCarts) {
            // --- FIXED: Check if user exists before accessing email (Guest Cart Protection) ---
            if (cart.user && cart.user.email) {
                
                const emailSubject = "You left something behind! 🛒";
                // --- FIXED: Use Dynamic CLIENT_URL for the link ---
                const emailBody = `
                    <div style="font-family: sans-serif;">
                        <h2>Hi ${cart.user.name || 'Friend'},</h2>
                        <p>We noticed you left some great items in your cart at GodSpeaks.</p>
                        <p>They are selling out fast! Click below to complete your order:</p>
                        <a href="${clientUrl}/cart" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Return to Cart</a>
                        <br/><br/>
                        <p>Blessings,<br/>The GodSpeaks Team</p>
                    </div>
                `;

                await sendTestEmail(cart.user.email, emailSubject, emailBody); 
                
                cart.emailSent = true;
                cart.isAbandoned = true;
                await cart.save();
                
                console.log(`[Cron] Email sent to ${cart.user.email}`);
            } else {
                // If it's a guest cart with no user attached, we can't email them. 
                // Mark as processed so we don't check it again.
                cart.emailSent = true; 
                await cart.save();
            }
        }
    } catch (error) {
        console.error('[Cron] Error in Abandoned Cart Job:', error);
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});