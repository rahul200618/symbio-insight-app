const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();
const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/symbio';
mongoose
  .connect(uri)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((e) => console.error('❌ MongoDB connection error:', e));

const sequencesRouter = require('./routes/sequences');
app.use('/api/sequences', sequencesRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    version: '1.0.0',
    uptime: '24h 15m'
  });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`🚀 Backend server running on port ${port}`));