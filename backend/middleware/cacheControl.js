/**
 * Cache Control Middleware
 * 
 * Provides caching headers for static assets and API responses
 */

/**
 * Static asset caching middleware
 * Applies long cache times for static assets
 */
const staticCacheControl = (req, res, next) => {
  // Cache static assets for 1 year
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  next();
};

/**
 * API response caching middleware
 * Provides configurable caching for API endpoints
 */
const apiCacheControl = (duration = 0, options = {}) => {
  return (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      res.set('Cache-Control', 'no-store');
      return next();
    }

    const { private: isPrivate = true, staleWhileRevalidate = 0 } = options;

    if (duration === 0) {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else {
      let cacheHeader = isPrivate ? 'private' : 'public';
      cacheHeader += `, max-age=${duration}`;
      
      if (staleWhileRevalidate > 0) {
        cacheHeader += `, stale-while-revalidate=${staleWhileRevalidate}`;
      }
      
      res.set('Cache-Control', cacheHeader);
    }
    
    next();
  };
};

/**
 * ETag middleware for conditional requests
 * Enables 304 responses for unchanged resources
 */
const conditionalGet = (req, res, next) => {
  // Enable weak ETags
  res.set('ETag', 'W/"' + Date.now().toString(36) + '"');
  next();
};

/**
 * Security headers middleware
 * Adds security-related headers for better protection
 */
const securityHeaders = (req, res, next) => {
  // Prevent MIME type sniffing
  res.set('X-Content-Type-Options', 'nosniff');
  
  // XSS Protection
  res.set('X-XSS-Protection', '1; mode=block');
  
  // Prevent clickjacking
  res.set('X-Frame-Options', 'DENY');
  
  // Referrer policy
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy
  res.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  next();
};

/**
 * Response time tracking header
 * Adds X-Response-Time header for monitoring
 */
const responseTime = (req, res, next) => {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const time = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    // Log response time for monitoring
    if (process.env.NODE_ENV !== 'test') {
      console.log(`${req.method} ${req.url} - ${time}ms`);
    }
  });
  
  const onHeaders = require('on-headers');
  if (typeof onHeaders === 'function') {
    onHeaders(res, () => {
      const diff = process.hrtime(start);
      const time = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
      res.setHeader('X-Response-Time', `${time}ms`);
    });
  }
  
  next();
};

module.exports = {
  staticCacheControl,
  apiCacheControl,
  conditionalGet,
  securityHeaders,
  responseTime,
};
