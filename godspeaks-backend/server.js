require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');

const connectDB = require('./config/db');
const Cart = require('./models/Cart');
const { sendAbandonedCartEmail } = require('./services/emailService');

// Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const cartRoutes = require('./routes/cartRoutes');

// --------------------
// INIT
// --------------------
connectDB();
const app = express();
app.set('trust proxy', 1);

// --------------------
// SECURITY
// --------------------
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
});

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use('/api', generalLimiter);

// --------------------
// CORS
// --------------------
const allowedOrigins = [
  'http://localhost:3000',
  'https://godspeaks.netlify.app',
  process.env.CLIENT_URL,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------
// ROUTES
// --------------------
app.use('/api/auth/login', strictLimiter);
app.use('/api/orders/create', strictLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/cart', cartRoutes);

// --------------------
// KEEP-ALIVE (RENDER)
// --------------------
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/', (req, res) => {
  res.send('GodSpeaks API is running');
});

// --------------------
// ABANDONED CART CRON
// --------------------
cron.schedule('0 * * * *', async () => {
  const now = new Date().toISOString();
  console.log(`[CRON ${now}] Abandoned cart check started`);

  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const abandonedCarts = await Cart.find({
      updatedAt: { $lte: cutoff },
      emailSent: false,
      items: { $exists: true, $ne: [] },
    }).populate('user');

    console.log(`[CRON] Found ${abandonedCarts.length} carts`);

    for (const cart of abandonedCarts) {
      if (!cart.user || !cart.user.email) {
        cart.emailSent = true;
        await cart.save();
        continue;
      }

      await sendAbandonedCartEmail(cart.user.email, cart);

      cart.emailSent = true;
      await cart.save();
    }
  } catch (err) {
    console.error('[CRON] Abandoned cart job failed:', err.message);
  }
});

// --------------------
// ERROR HANDLER
// --------------------
app.use((err, req, res, next) => {
  const code = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(code).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🛡️' : err.stack,
  });
});

// --------------------
// START SERVER
// --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[Server] Running on port ${PORT}`);
});
