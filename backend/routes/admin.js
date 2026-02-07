const express = require('express');
const router = express.Router();
const { connectMongoDB } = require('../config/mongodb');

// Dynamically load models based on storage mode
const STORAGE_MODE = process.env.STORAGE_MODE || 'sqlite';
const User = STORAGE_MODE === 'atlas' 
  ? require('../models/UserMongo') 
  : require('../models/User');
const Sequence = STORAGE_MODE === 'atlas'
  ? require('../models/SequenceMongo')
  : require('../models/Sequence');

// Helper to normalize count result from mongoose
const getModifiedCount = (result) => result?.modifiedCount ?? result?.nModified ?? result?.matchedCount ?? 0;

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

// @route   POST /api/admin/force-storage-atlas
// @desc    Force all sequences storageType to 'atlas' (Mongo only)
// @access  Public (should be protected in production)
router.post('/force-storage-atlas', async (req, res) => {
  if (STORAGE_MODE !== 'atlas') {
    return res.status(400).json({ message: 'STORAGE_MODE must be atlas to enforce atlas storage type.' });
  }

  try {
    await connectMongoDB('atlas');
    const result = await Sequence.updateMany({}, { $set: { storageType: 'atlas' } });
    res.json({
      success: true,
      message: 'All sequences storageType set to atlas',
      modified: getModifiedCount(result)
    });
  } catch (error) {
    console.error('force-storage-atlas error:', error);
    res.status(500).json({ message: 'Failed to enforce storageType atlas', error: error.message });
  }
});

// ============================================================================
// ANALYTICS & DASHBOARD ROUTES
// ============================================================================

/**
 * Get comprehensive dashboard stats
 * GET /api/admin/stats
 */
router.get('/stats', async (req, res) => {
    try {
        let stats = {};

        if (STORAGE_MODE === 'atlas') {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

            const [
                totalUsers,
                totalSequences,
                newUsersThisWeek,
                newSequencesThisWeek,
                recentUsers,
                recentSequences,
                signupsByDay,
                uploadsByDay,
                avgStats
            ] = await Promise.all([
                User.countDocuments(),
                Sequence.countDocuments(),
                User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
                Sequence.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
                User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt oauthProvider'),
                Sequence.find().sort({ createdAt: -1 }).limit(5).select('name length gcContent createdAt userId'),
                User.aggregate([
                    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
                    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
                    { $sort: { _id: 1 } }
                ]),
                Sequence.aggregate([
                    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
                    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
                    { $sort: { _id: 1 } }
                ]),
                Sequence.aggregate([
                    { $group: { _id: null, avgLength: { $avg: '$length' }, avgGc: { $avg: '$gcContent' }, totalBp: { $sum: '$length' } } }
                ])
            ]);

            stats = {
                overview: {
                    totalUsers,
                    totalSequences,
                    newUsersThisWeek,
                    newSequencesThisWeek,
                    avgSequenceLength: Math.round(avgStats[0]?.avgLength || 0),
                    avgGcContent: (avgStats[0]?.avgGc || 0).toFixed(2),
                    totalBasePairs: avgStats[0]?.totalBp || 0
                },
                charts: {
                    signupsByDay,
                    uploadsByDay
                },
                recent: {
                    users: recentUsers,
                    sequences: recentSequences
                }
            };
        } else {
            const totalUsers = await User.count();
            const totalSequences = await Sequence.count();

            stats = {
                overview: { totalUsers, totalSequences, newUsersThisWeek: 0, newSequencesThisWeek: 0 },
                charts: { signupsByDay: [], uploadsByDay: [] },
                recent: { users: [], sequences: [] }
            };
        }

        res.json(stats);
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

/**
 * Get all users (paginated)
 * GET /api/admin/users?page=1&limit=20&search=
 */
router.get('/users', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;

        let users, total;

        if (STORAGE_MODE === 'atlas') {
            const query = search ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            } : {};

            [users, total] = await Promise.all([
                User.find(query)
                    .select('name email role institution createdAt oauthProvider profileImage')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit),
                User.countDocuments(query)
            ]);
        } else {
            const { Op } = require('sequelize');
            const where = search ? {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } }
                ]
            } : {};

            const result = await User.findAndCountAll({
                where,
                attributes: ['id', 'name', 'email', 'role', 'institution', 'createdAt'],
                order: [['createdAt', 'DESC']],
                offset: skip,
                limit
            });

            users = result.rows;
            total = result.count;
        }

        res.json({
            users,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

/**
 * Update user role
 * PUT /api/admin/users/:id/role
 */
router.put('/users/:id/role', async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        let user;
        if (STORAGE_MODE === 'atlas') {
            user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('name email role');
        } else {
            user = await User.findByPk(id);
            if (user) {
                user.role = role;
                await user.save();
            }
        }

        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'Role updated', user });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ error: 'Failed to update role' });
    }
});

/**
 * Delete user
 * DELETE /api/admin/users/:id
 */
router.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let result;

        if (STORAGE_MODE === 'atlas') {
            result = await User.findByIdAndDelete(id);
        } else {
            const user = await User.findByPk(id);
            if (user) {
                await user.destroy();
                result = user;
            }
        }

        if (!result) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

/**
 * Get sequence analytics
 * GET /api/admin/sequences/analytics
 */
router.get('/sequences/analytics', async (req, res) => {
    try {
        if (STORAGE_MODE !== 'atlas') {
            return res.json({ gcDistribution: [], lengthDistribution: [], topUploaders: [] });
        }

        const [gcDistribution, lengthDistribution, orfStats] = await Promise.all([
            Sequence.aggregate([
                { $bucket: { groupBy: '$gcContent', boundaries: [0, 20, 40, 60, 80, 100], default: 'Unknown', output: { count: { $sum: 1 } } } }
            ]),
            Sequence.aggregate([
                { $bucket: { groupBy: '$length', boundaries: [0, 100, 1000, 10000, 100000, 1000000], default: 'Large', output: { count: { $sum: 1 } } } }
            ]),
            Sequence.aggregate([
                { $group: { _id: '$orfDetected', count: { $sum: 1 }, avgOrfCount: { $avg: '$orfCount' } } }
            ])
        ]);

        res.json({ gcDistribution, lengthDistribution, orfStats });
    } catch (error) {
        console.error('Sequence analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

module.exports = router;
