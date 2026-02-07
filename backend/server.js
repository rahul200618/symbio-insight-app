const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const compression = require('compression');
const { generalLimiter, authLimiter, aiLimiter, uploadLimiter } = require('./middleware/rateLimiter');
const { securityHeaders, apiCacheControl } = require('./middleware/cacheControl');

dotenv.config();
const app = express();

// Storage mode: 'sqlite' (local) or 'atlas' (cloud MongoDB)
const STORAGE_MODE = process.env.STORAGE_MODE || 'sqlite';
console.log(`📦 Storage Mode: ${STORAGE_MODE.toUpperCase()}`);

// Allow configuring frontend origin via env for dev (support both common ports)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

// Regex patterns for allowed origins
const allowedOriginPatterns = [
  /\.vercel\.app$/, // Allow all Vercel deployments (production and preview)
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl requests, or file:// protocol)
    // file:// protocol sends origin as null
    if (!origin || origin === 'null') return callback(null, true);

    // Allow file:// protocol for local HTML viewers (some browsers)
    if (origin && origin.startsWith('file://')) {
      return callback(null, true);
    }

    // Check exact match origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Check pattern match origins
    if (allowedOriginPatterns.some(pattern => pattern.test(origin))) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Compression middleware - compress all responses
app.use(compression());

// Security headers middleware
app.use(securityHeaders);

// Apply general rate limiting to all API routes
app.use('/api', generalLimiter);

// Connect to database based on STORAGE_MODE
const initializeDatabase = async () => {
  console.log('🔄 Initializing database...');
  try {
    if (STORAGE_MODE === 'atlas') {
      // Use MongoDB Atlas
      const { connectMongoDB } = require('./config/mongodb');
      const connected = await connectMongoDB('atlas');
      if (!connected) {
        console.error('❌ Failed to connect to MongoDB Atlas. Falling back to SQLite...');
        const { connectDB } = require('./config/database');
        await connectDB();
      }
    } else {
      // Use SQLite (default)
      const { connectDB } = require('./config/database');
      await connectDB();
    }
    console.log('✅ Database initialization complete');
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    throw error;
  }
};

console.log('📦 Loading routes...');
const sequencesRouter = require('./routes/sequences');
const authRouter = require('./routes/auth');
const aiRouter = require('./routes/ai');
const storageRouter = require('./routes/storage');
const fastaRouter = require('./routes/fasta');
const adminRouter = require('./routes/admin');
const annotationsRouter = require('./routes/annotations');
const healthRouter = require('./routes/health');
console.log('✅ Routes loaded');

app.use('/api/sequences', sequencesRouter);
app.use('/api/auth', authLimiter, authRouter); // Stricter limits for auth
app.use('/api/ai', aiLimiter, aiRouter); // AI-specific limits
app.use('/api/storage', storageRouter);
app.use('/api/fasta', fastaRouter);
app.use('/api/admin', adminRouter);
app.use('/api/annotations', annotationsRouter);
app.use('/api/health', healthRouter);

// API v1 routes (versioned)
app.use('/api/v1/sequences', sequencesRouter);
app.use('/api/v1/auth', authLimiter, authRouter);
app.use('/api/v1/ai', aiLimiter, aiRouter);
app.use('/api/v1/storage', storageRouter);
app.use('/api/v1/fasta', fastaRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/annotations', annotationsRouter);

// Serve the database viewer HTML
app.get('/db-viewer', (req, res) => {
  res.sendFile(__dirname + '/db-viewer.html');
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Symbio-NLM Backend API',
    version: '1.0.0',
    storageMode: STORAGE_MODE,
    apiVersions: ['v1'],
    endpoints: {
      health: '/api/health',
      sequences: '/api/sequences (or /api/v1/sequences)',
      auth: '/api/auth (or /api/v1/auth)',
      ai: '/api/ai (or /api/v1/ai)',
      storage: '/api/storage',
      export: '/api/sequences/export/:id'
    },
    rateLimits: {
      general: '100 requests/minute',
      auth: '10 attempts/15 minutes',
      ai: '20 requests/minute',
      upload: '50 files/hour'
    }
  });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  
  try {
    if (STORAGE_MODE === 'atlas') {
      const { getConnectionStatus } = require('./config/mongodb');
      dbStatus = getConnectionStatus().isConnected ? 'connected' : 'disconnected';
    } else {
      const { sequelize } = require('./config/database');
      await sequelize.authenticate();
      dbStatus = 'connected';
    }
  } catch (error) {
    dbStatus = 'disconnected';
  }

  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    database: dbStatus,
    storageMode: STORAGE_MODE,
    version: '1.0.0',
    uptime: process.uptime()
  });
});

const port = process.env.PORT || 3002;

// On Vercel, export the Express app instead of starting a listener
if (process.env.VERCEL) {
  module.exports = app;
} else {
  // Wait for database initialization before starting server
  initializeDatabase()
    .then(() => {
      const server = app.listen(port, () => {
        console.log(`🚀 Backend server running on port ${port}`);
      });

      server.on('error', (error) => {
        console.error('❌ Server error:', error.message);
        if (error.code === 'EADDRINUSE') {
          console.error(`❌ Port ${port} is already in use`);
        }
        process.exit(1);
      });

      // Handle uncaught exceptions
      process.on('uncaughtException', (error) => {
        console.error('❌ Uncaught Exception:', error);
        process.exit(1);
      });

      process.on('unhandledRejection', (reason, promise) => {
        console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      });
    })
    .catch(err => {
      console.error('❌ Fatal database error:', err);
      process.exit(1);
    });
}