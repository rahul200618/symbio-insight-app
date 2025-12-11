const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const compression = require('compression');
const { connectDB } = require('./config/database');

dotenv.config();
const app = express();

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
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

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

// Connect to SQLite database
connectDB();

const sequencesRouter = require('./routes/sequences');
const authRouter = require('./routes/auth');
const aiRouter = require('./routes/ai');

app.use('/api/sequences', sequencesRouter);
app.use('/api/auth', authRouter);
app.use('/api/ai', aiRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Symbio-NLM Backend API',
    version: '1.0.0',
    database: 'SQLite',
    endpoints: {
      health: '/api/health',
      sequences: '/api/sequences',
      auth: '/api/auth',
      ai: '/api/ai'
    }
  });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const { sequelize } = require('./config/database');
  let dbStatus = 'disconnected';
  try {
    await sequelize.authenticate();
    dbStatus = 'connected';
  } catch (error) {
    dbStatus = 'disconnected';
  }

  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    database: dbStatus,
    databaseType: 'SQLite',
    version: '1.0.0',
    uptime: process.uptime()
  });
});

const port = process.env.PORT || 3002;
app.listen(port, () => console.log(`🚀 Backend server running on port ${port}`));