const express = require('express');
const router = express.Router();

// Dynamically load models based on storage mode
const STORAGE_MODE = process.env.STORAGE_MODE || 'sqlite';
const User = STORAGE_MODE === 'atlas' 
  ? require('../models/UserMongo') 
  : require('../models/User');
const Sequence = STORAGE_MODE === 'atlas'
  ? require('../models/SequenceMongo')
  : require('../models/Sequence');

// @route   GET /api/admin/database-info
// @desc    Get database information (users and sequences count)
// @access  Public (should be protected in production)
router.get('/database-info', async (req, res) => {
  try {
    let usersCount, sequencesCount, users, sequences;

    if (STORAGE_MODE === 'atlas') {
      // MongoDB queries
      usersCount = await User.countDocuments();
      sequencesCount = await Sequence.countDocuments();
      
      // Get users without password
      users = await User.find({})
        .select('-password')
        .limit(50)
        .lean();
      
      // Get sequences
      sequences = await Sequence.find({})
        .limit(50)
        .lean();
    } else {
      // SQLite queries
      usersCount = await User.count();
      sequencesCount = await Sequence.count();
      
      users = await User.findAll({
        attributes: { exclude: ['password'] },
        limit: 50
      });
      
      sequences = await Sequence.findAll({
        limit: 50
      });
    }

    res.json({
      storageMode: STORAGE_MODE,
      timestamp: new Date().toISOString(),
      users: {
        count: usersCount,
        data: users
      },
      sequences: {
        count: sequencesCount,
        data: sequences
      }
    });
  } catch (error) {
    console.error('Database info error:', error);
    res.status(500).json({ 
      message: 'Error fetching database information',
      error: error.message 
    });
  }
});

// @route   GET /api/admin/health
// @desc    Health check endpoint
// @access  Public
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    storageMode: STORAGE_MODE,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
