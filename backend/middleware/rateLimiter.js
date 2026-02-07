/**
 * Rate Limiting Middleware
 * 
 * Protects API endpoints from abuse by limiting request rates.
 * Different limits for different endpoint types.
 */

const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 * Applies to all /api routes
 */
const generalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute window
    max: 100, // 100 requests per minute
    message: {
        error: 'Too many requests',
        message: 'You have exceeded the rate limit. Please try again in a minute.',
        retryAfter: 60
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    handler: (req, res, next, options) => {
        res.status(429).json(options.message);
    }
});

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute-force attacks on login/signup
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per 15 minutes
    message: {
        error: 'Too many authentication attempts',
        message: 'Too many login attempts. Please try again after 15 minutes.',
        retryAfter: 900
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful logins
    handler: (req, res, next, options) => {
        res.status(429).json(options.message);
    }
});

/**
 * AI endpoint rate limiter
 * Protects expensive AI API calls
 */
const aiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 AI requests per minute
    message: {
        error: 'AI rate limit exceeded',
        message: 'You have made too many AI requests. Please wait a moment.',
        retryAfter: 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        res.status(429).json(options.message);
    }
});

/**
 * Upload rate limiter
 * Limits file uploads to prevent abuse
 */
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 uploads per hour
    message: {
        error: 'Upload limit exceeded',
        message: 'You have uploaded too many files. Please try again later.',
        retryAfter: 3600
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        res.status(429).json(options.message);
    }
});

/**
 * Report generation rate limiter
 * Limits PDF/HTML report generation
 */
const reportLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 reports per minute
    message: {
        error: 'Report generation limit exceeded',
        message: 'Too many report requests. Please wait a moment.',
        retryAfter: 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        res.status(429).json(options.message);
    }
});

module.exports = {
    generalLimiter,
    authLimiter,
    aiLimiter,
    uploadLimiter,
    reportLimiter
};
