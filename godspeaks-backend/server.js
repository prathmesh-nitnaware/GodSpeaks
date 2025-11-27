require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const cron = require('node-cron'); // Import node-cron
const Cart = require('./models/Cart'); // Ensure this model exists (from feature steps)
const { sendTestEmail } = require('./services/emailService'); // Reusing existing mailer

// Route Imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const cartRoutes = require('./routes/cartRoutes'); // Import new Cart routes

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
app.use('/api/auth', authRoutes); 
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/cart', cartRoutes); // Mount Cart Sync route

app.get('/', (req, res) => {
    res.send('GodSpeaks API is Running...');
});

// --- 4. ABANDONED CART RECOVERY CRON JOB ---
// Runs every hour at minute 0 (0 * * * *)
cron.schedule('0 * * * *', async () => {
    console.log('[Cron] Checking for abandoned carts...');
    
    // Logic: Find carts updated > 24 hours ago, have items, and email hasn't been sent yet
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    try {
        const abandonedCarts = await Cart.find({
            updatedAt: { $lt: twentyFourHoursAgo },
            items: { $not: { $size: 0 } }, // Ensure cart is not empty
            emailSent: false
        }).populate('user'); // Populate user to get email address

        if (abandonedCarts.length === 0) {
            console.log('[Cron] No abandoned carts found.');
            return;
        }

        console.log(`[Cron] Found ${abandonedCarts.length} abandoned carts. Sending emails...`);

        for (const cart of abandonedCarts) {
            if (cart.user && cart.user.email) {
                // Construct a simple reminder email
                const emailSubject = "You left something behind! 🛒";
                const emailBody = `
                    <div style="font-family: sans-serif;">
                        <h2>Hi ${cart.user.name || 'Friend'},</h2>
                        <p>We noticed you left some great items in your cart at GodSpeaks.</p>
                        <p>They are selling out fast! Click below to complete your order:</p>
                        <a href="http://localhost:3000/cart" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Return to Cart</a>
                        <br/><br/>
                        <p>Blessings,<br/>The GodSpeaks Team</p>
                    </div>
                `;

                // Use existing email service to send
                // Note: sendTestEmail is used here for simplicity. 
                // Ideally, create a dedicated sendAbandonedCartEmail function in emailService.js
                await sendTestEmail(cart.user.email, emailSubject, emailBody); // Passing HTML to existing function logic needs check or update
                
                // Update cart status so we don't spam them
                cart.emailSent = true;
                cart.isAbandoned = true;
                await cart.save();
                
                console.log(`[Cron] Email sent to ${cart.user.email}`);
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