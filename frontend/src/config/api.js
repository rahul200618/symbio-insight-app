/**
 * API Configuration
 * Centralized API URL configuration for the application
 */

// Production backend URL on Render
const PRODUCTION_API_URL = 'https://symbio-insight-app.onrender.com/api';

// Development backend URL
const DEVELOPMENT_API_URL = 'http://localhost:3002/api';

/**
 * Get the API base URL
 * Priority: VITE_API_URL env var > auto-detect based on hostname
 */
export function getApiUrl() {
    // Check for environment variable first
    const envUrl = import.meta.env?.VITE_API_URL;
    if (envUrl && /^https?:\/\//.test(envUrl)) {
        return envUrl.replace(/\/$/, '');
    }
    
    // Auto-detect based on current hostname
    const hostname = window.location.hostname;
    
    // If running locally, use development URL
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return DEVELOPMENT_API_URL;
    }
    
    // Otherwise use production URL
    return PRODUCTION_API_URL;
}

// Export the resolved API URL
export const API_URL = getApiUrl();
export const API_AUTH_URL = `${API_URL}/auth`;
export const API_AI_URL = `${API_URL}/ai`;

// Debug log - remove after fixing
console.log('[API Config] API_URL:', API_URL);
console.log('[API Config] API_AUTH_URL:', API_AUTH_URL);

export default API_URL;
