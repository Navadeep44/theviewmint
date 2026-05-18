require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

// ─── Import Routes ────────────────────────────────────────────────────────────
const authRoutes         = require('./routes/auth');
const campaignRoutes     = require('./routes/campaign');
const submissionRoutes   = require('./routes/submission');
const userRoutes         = require('./routes/user');
const notificationRoutes = require('./routes/notification');
const brandRoutes        = require('./routes/brand');
const adminRoutes        = require('./routes/admin');

// ─── Import Models (for stats endpoint — fix original bug) ───────────────────
const User       = require('./models/User');
const Campaign   = require('./models/Campaign');
const Submission = require('./models/Submission');
const Brand      = require('./models/Brand');

const { errorHandler } = require('./middleware/errorHandler');

// ─── App Setup ────────────────────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);

// ─── Socket.io Setup ─────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://theviewmint.in',
      'https://www.theviewmint.in',
      'https://theviewmint.onrender.com',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Make io accessible in routes via req.app.get('io')
app.set('io', io);

// ─── Socket.io Connection Handler ────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);

  // Creator joins their private room for targeted notifications
  socket.on('join_user_room', (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`[Socket] User ${userId} joined their room`);
    }
  });

  // Admin joins admin room for live monitoring
  socket.on('join_admin_room', () => {
    socket.join('admin_room');
    console.log(`[Socket] Admin joined admin_room`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Disconnected: ${socket.id}`);
  });
});

// ─── Security Middleware ──────────────────────────────────────────────────────

// Helmet: Sets various HTTP headers for security
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false, // Managed by frontend
}));

// CORS
const allowedOrigins = [
  'http://localhost:5173',
  'https://theviewmint.in',
  'https://www.theviewmint.in',
  'https://theviewmint.onrender.com',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB injection sanitization
// app.use(mongoSanitize());

// Global API rate limit (generous — specific routes have stricter limits)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', globalLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────

// Standard API routes
app.use('/api/auth',          authRoutes);
app.use('/api/campaigns',     campaignRoutes);
app.use('/api/submissions',   submissionRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/brands',        brandRoutes);
app.use('/api/admin',         adminRoutes);

// Fallback routes (handles incorrect VITE_API_URL missing /api prefix on Render)
app.use('/auth',          authRoutes);
app.use('/campaigns',     campaignRoutes);
app.use('/submissions',   submissionRoutes);
app.use('/users',         userRoutes);
app.use('/notifications', notificationRoutes);
app.use('/brands',        brandRoutes);
app.use('/admin',         adminRoutes);

// ─── Platform Stats Endpoint (fixed: Submission model now properly imported) ──
const buildStatsResponse = async () => {
  const [creatorCount, campaignCount, brandCount, submissionResult, paidOutResult] = await Promise.all([
    User.countDocuments({ role: 'creator' }),
    Campaign.countDocuments({ status: 'active', isPublished: true }),
    Brand.countDocuments({ verificationStatus: 'approved' }),
    Submission.countDocuments(),
    Submission.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$earnings' } } }
    ]),
  ]);

  return {
    creators: creatorCount,
    campaigns: campaignCount,
    brands: brandCount,
    submissions: submissionResult,
    paidOut: paidOutResult.length > 0 ? paidOutResult[0].total : 0,
  };
};

app.get('/api/stats', async (req, res) => {
  try {
    res.json(await buildStatsResponse());
  } catch (error) {
    console.error('[Stats Error]', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Fallback
app.get('/stats', async (req, res) => {
  try {
    res.json(await buildStatsResponse());
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.url}` });
});

// ─── Global Error Handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

// ─── Database & Server Start ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
}).then(() => {
  console.log('[MongoDB] Connected successfully');
  server.listen(PORT, () => {
    console.log(`[Server] Running on port ${PORT}`);
    console.log(`[Socket.io] Real-time server active`);
  });
}).catch(err => {
  console.error('[MongoDB] Connection error:', err);
  process.exit(1);
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received. Closing gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('[Server] Process terminated.');
      process.exit(0);
    });
  });
});
