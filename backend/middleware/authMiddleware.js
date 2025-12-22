







const jwt = require('jsonwebtoken');

// Dynamically load the correct User model
const STORAGE_MODE = process.env.STORAGE_MODE || 'sqlite';
const User = STORAGE_MODE === 'atlas' 
  ? require('../models/UserMongo') 
  : require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key-change-in-production';

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (format: "Bearer TOKEN")
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, JWT_SECRET);

            // Get user from token - different query for MongoDB vs SQLite
            if (STORAGE_MODE === 'atlas') {
                req.user = await User.findById(decoded.id).select('-password');
            } else {
                req.user = await User.findByPk(decoded.id);
            }

            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }

            next();
        } catch (error) {
            console.error('Auth middleware error:', error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
