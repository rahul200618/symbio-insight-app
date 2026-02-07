const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { protect } = require('../middleware/authMiddleware');

// Dynamically load the correct User model based on storage mode
const STORAGE_MODE = process.env.STORAGE_MODE || 'sqlite';
const User = STORAGE_MODE === 'atlas' 
  ? require('../models/UserMongo') 
  : require('../models/User');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key-change-in-production';
const JWT_EXPIRE = '7d'; // Token expires in 7 days

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

// @route   POST /api/auth/signup
// @desc    Register new user
// @access  Public
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, institution } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check if user already exists (works for both Sequelize and Mongoose)
        const query = STORAGE_MODE === 'atlas' 
            ? { email } 
            : { where: { email } };
        const userExists = await User.findOne(query);
        
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            institution: institution || ''
        });

        // Generate token - use _id for MongoDB, id for SQLite
        const userId = user._id || user.id;
        const token = generateToken(userId);

        // Return user data and token
        res.status(201).json({
            id: userId,
            name: user.name,
            email: user.email,
            role: user.role,
            token,
            user: {
                id: userId,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: error.message || 'Server error during signup' });
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Find user - different query for MongoDB vs SQLite
        let user;
        if (STORAGE_MODE === 'atlas') {
            // For MongoDB, we need to explicitly select password field
            user = await User.findOne({ email }).select('+password');
        } else {
            // For SQLite
            user = await User.findOne({ where: { email } });
        }

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate token - use _id for MongoDB, id for SQLite
        const userId = user._id || user.id;
        const token = generateToken(userId);

        // Return user data and token
        res.json({
            id: userId,
            name: user.name,
            email: user.email,
            role: user.role,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message || 'Server error during login' });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        res.json({
            id: req.user._id || req.user.id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            createdAt: req.user.createdAt
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const { name, role, institution } = req.body;
        
        let user;
        if (STORAGE_MODE === 'atlas') {
            user = await User.findById(req.user._id || req.user.id);
        } else {
            user = await User.findByPk(req.user.id);
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields
        if (name) user.name = name;
        if (role) user.role = role;
        if (institution !== undefined) user.institution = institution;

        await user.save();

        res.json({
            id: user._id || user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            institution: user.institution,
            createdAt: user.createdAt
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }

        // Get user with password
        let user;
        if (STORAGE_MODE === 'atlas') {
            user = await User.findById(req.user._id || req.user.id).select('+password');
        } else {
            user = await User.findByPk(req.user.id);
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Update password (will be hashed by the model hook / pre-save)
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: error.message || 'Server error during password change' });
    }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset - generates token and logs reset URL
// @access  Public
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Check if user exists
        let user;
        if (STORAGE_MODE === 'atlas') {
            user = await User.findOne({ email }).select('+passwordResetToken +passwordResetExpires');
        } else {
            user = await User.findOne({ where: { email } });
        }
        
        // Always return success to prevent email enumeration
        if (user) {
            // Generate reset token
            let resetToken;
            
            if (STORAGE_MODE === 'atlas') {
                // Use the method defined in the model
                resetToken = user.createPasswordResetToken();
                await user.save({ validateBeforeSave: false });
            } else {
                // For SQLite, handle token generation here
                resetToken = crypto.randomBytes(32).toString('hex');
                const hashedToken = crypto
                    .createHash('sha256')
                    .update(resetToken)
                    .digest('hex');
                
                user.passwordResetToken = hashedToken;
                user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
                await user.save();
            }

            // Build reset URL (frontend would handle this route)
            const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
            
            // Log the reset URL for development
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🔐 PASSWORD RESET REQUESTED');
            console.log(`Email: ${email}`);
            console.log(`Reset Token: ${resetToken}`);
            console.log(`Reset URL: ${resetUrl}`);
            console.log(`Expires: ${new Date(Date.now() + 60 * 60 * 1000).toLocaleString()}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            // TODO: In production, send email using nodemailer or SendGrid
            // await sendEmail({
            //     to: email,
            //     subject: 'Password Reset Request - SymbioInsight',
            //     html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.</p>`
            // });
        }

        // Simulate email sending delay
        await new Promise(resolve => setTimeout(resolve, 500));

        res.json({ 
            message: 'If an account exists with this email, you will receive password reset instructions shortly.',
            // In development, also return the token (remove in production!)
            ...(process.env.NODE_ENV !== 'production' && user ? { 
                resetToken: 'Check server console for reset URL',
                expiresIn: '1 hour'
            } : {})
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password using token
// @access  Public
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'New password is required' });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }

        // Hash the token to compare with stored hash
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with valid reset token
        let user;
        if (STORAGE_MODE === 'atlas') {
            user = await User.findOne({
                passwordResetToken: hashedToken,
                passwordResetExpires: { $gt: Date.now() }
            }).select('+password +passwordResetToken +passwordResetExpires');
        } else {
            const { Op } = require('sequelize');
            user = await User.findOne({
                where: {
                    passwordResetToken: hashedToken,
                    passwordResetExpires: { [Op.gt]: new Date() }
                }
            });
        }

        if (!user) {
            return res.status(400).json({ 
                message: 'Password reset token is invalid or has expired' 
            });
        }

        // Update password and clear reset token
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        // Generate new auth token
        const userId = user._id || user.id;
        const authToken = generateToken(userId);

        console.log(`✅ Password reset successful for: ${user.email}`);

        res.json({
            message: 'Password reset successful',
            token: authToken,
            user: {
                id: userId,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// @route   GET /api/auth/verify-reset-token/:token
// @desc    Verify if a reset token is valid
// @access  Public
router.get('/verify-reset-token/:token', async (req, res) => {
    try {
        const { token } = req.params;

        // Hash the token to compare with stored hash
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with valid reset token
        let user;
        if (STORAGE_MODE === 'atlas') {
            user = await User.findOne({
                passwordResetToken: hashedToken,
                passwordResetExpires: { $gt: Date.now() }
            });
        } else {
            const { Op } = require('sequelize');
            user = await User.findOne({
                where: {
                    passwordResetToken: hashedToken,
                    passwordResetExpires: { [Op.gt]: new Date() }
                }
            });
        }

        if (!user) {
            return res.status(400).json({ 
                valid: false,
                message: 'Password reset token is invalid or has expired' 
            });
        }

        res.json({ 
            valid: true,
            email: user.email.substring(0, 3) + '***@' + user.email.split('@')[1]
        });
    } catch (error) {
        console.error('Verify reset token error:', error);
        res.status(500).json({ valid: false, message: error.message || 'Server error' });
    }
});

// @route   DELETE /api/auth/account
// @desc    Delete user account with password confirmation
// @access  Private
router.delete('/account', protect, async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'Password is required to delete account' });
        }

        // Get user with password
        let user;
        if (STORAGE_MODE === 'atlas') {
            user = await User.findById(req.user._id || req.user.id).select('+password');
        } else {
            user = await User.findByPk(req.user.id);
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        // Delete user
        if (STORAGE_MODE === 'atlas') {
            await user.deleteOne();
        } else {
            await user.destroy();
        }

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ message: error.message || 'Server error during account deletion' });
    }
});

// ============================================================================
// OAUTH ROUTES - Google & GitHub Social Login
// ============================================================================

/**
 * Handle Google OAuth authentication
 * POST /api/auth/oauth/google
 * @access Public
 */
router.post('/oauth/google', async (req, res) => {
    try {
        const { email, name, photoURL, uid } = req.body;

        if (!email || !uid) {
            return res.status(400).json({ message: 'Email and UID are required' });
        }

        // Check if user exists
        let user;
        let isNewUser = false;

        if (STORAGE_MODE === 'atlas') {
            user = await User.findOne({ email });
        } else {
            user = await User.findOne({ where: { email } });
        }

        if (!user) {
            // Create new user with OAuth
            isNewUser = true;
            const randomPassword = crypto.randomBytes(32).toString('hex');
            
            user = await User.create({
                name: name || email.split('@')[0],
                email,
                password: randomPassword, // Random password for OAuth users
                institution: '',
                oauthProvider: 'google',
                oauthId: uid,
                profileImage: photoURL || ''
            });
        } else {
            // Update OAuth info if needed
            if (STORAGE_MODE === 'atlas') {
                if (!user.oauthProvider) {
                    user.oauthProvider = 'google';
                    user.oauthId = uid;
                    if (photoURL) user.profileImage = photoURL;
                    await user.save();
                }
            }
        }

        const userId = user._id || user.id;
        const token = generateToken(userId);

        res.json({
            message: isNewUser ? 'Account created successfully' : 'Login successful',
            isNewUser,
            token,
            user: {
                id: userId,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage || photoURL
            }
        });
    } catch (error) {
        console.error('Google OAuth error:', error);
        res.status(500).json({ message: error.message || 'OAuth authentication failed' });
    }
});

/**
 * Handle GitHub OAuth authentication
 * POST /api/auth/oauth/github
 * @access Public
 */
router.post('/oauth/github', async (req, res) => {
    try {
        const { email, name, photoURL, uid } = req.body;

        if (!uid) {
            return res.status(400).json({ message: 'UID is required' });
        }

        // GitHub may not provide email, use uid as fallback
        const userEmail = email || `${uid}@github.oauth`;

        // Check if user exists
        let user;
        let isNewUser = false;

        if (STORAGE_MODE === 'atlas') {
            user = await User.findOne({ 
                $or: [{ email: userEmail }, { oauthId: uid, oauthProvider: 'github' }]
            });
        } else {
            user = await User.findOne({ where: { email: userEmail } });
        }

        if (!user) {
            // Create new user with OAuth
            isNewUser = true;
            const randomPassword = crypto.randomBytes(32).toString('hex');
            
            user = await User.create({
                name: name || userEmail.split('@')[0],
                email: userEmail,
                password: randomPassword,
                institution: '',
                oauthProvider: 'github',
                oauthId: uid,
                profileImage: photoURL || ''
            });
        } else {
            // Update OAuth info if needed
            if (STORAGE_MODE === 'atlas') {
                if (!user.oauthProvider) {
                    user.oauthProvider = 'github';
                    user.oauthId = uid;
                    if (photoURL) user.profileImage = photoURL;
                    await user.save();
                }
            }
        }

        const userId = user._id || user.id;
        const token = generateToken(userId);

        res.json({
            message: isNewUser ? 'Account created successfully' : 'Login successful',
            isNewUser,
            token,
            user: {
                id: userId,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage || photoURL
            }
        });
    } catch (error) {
        console.error('GitHub OAuth error:', error);
        res.status(500).json({ message: error.message || 'OAuth authentication failed' });
    }
});

module.exports = router;
