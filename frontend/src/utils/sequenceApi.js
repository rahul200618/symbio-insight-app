/**
 * Comprehensive Sequence API Service
 * All API endpoints for the Symbio-NLM application
 * Version: 2.0
 */

// Resolve API base with safe local fallback
function resolveApiBase() {
    const envUrl = import.meta.env?.VITE_API_URL;
    if (envUrl && /^https?:\/\//.test(envUrl)) return envUrl.replace(/\/$/, '');
    // Prefer explicit localhost in development
    return 'http://localhost:3002/api';
}

let API_BASE_URL = resolveApiBase();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get stored authentication token
 */
const getToken = () => localStorage.getItem('symbio_nlm_auth_token');

/**
 * Make authenticated API call
 */
async function apiCall(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        // Special handling for PDF and blob responses
        if (options.isBlob) {
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`API Error: ${response.status} - ${text}`);
            }
            return response.blob();
        }

        const contentType = response.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || data.message || `API Error: ${response.status}`);
            }
            return data;
        } else {
            const text = await response.text();
            // Common dev pitfall: hitting the frontend (index.html) instead of the backend
            if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
                // Attempt one automatic fallback to local backend
                if (API_BASE_URL !== 'http://localhost:3002/api') {
                    API_BASE_URL = 'http://localhost:3002/api';
                    const retry = await apiCall(endpoint, { ...options, headers });
                    return retry;
                }
                throw new Error('Received HTML instead of JSON. Check API base URL and route.');
            }
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} - ${text}`);
            }
            // If server returned non-JSON OK response, surface raw text
            return { message: text };
        }
    } catch (error) {
        if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
            throw new Error('Cannot connect to server. Please check if the backend is running.');
        }
        throw error;
    }
}

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

/**
 * User signup
 * @param {Object} data - User registration data
 * @param {string} data.name - User's name
 * @param {string} data.email - User's email
 * @param {string} data.password - User's password
 * @returns {Promise<Object>} User data with auth token
 */
export async function signup({ name, email, password }) {
    const data = await apiCall('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
    });
    if (data.token) {
        localStorage.setItem('symbio_nlm_auth_token', data.token);
        localStorage.setItem('symbio_nlm_user', JSON.stringify(data));
    }
    return data;
}

/**
 * User login
 * @param {Object} data - Login credentials
 * @param {string} data.email - User's email
 * @param {string} data.password - User's password
 * @returns {Promise<Object>} User data with auth token
 */
export async function login({ email, password }) {
    const data = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    if (data.token) {
        localStorage.setItem('symbio_nlm_auth_token', data.token);
        localStorage.setItem('symbio_nlm_user', JSON.stringify(data));
    }
    return data;
}

/**
 * Get current user profile
 * @returns {Promise<Object>} Current user data
 */
export async function getCurrentUser() {
    return apiCall('/auth/me', { method: 'GET' });
}

/**
 * Logout user
 */
export function logout() {
    localStorage.removeItem('symbio_nlm_auth_token');
    localStorage.removeItem('symbio_nlm_user');
}

// ============================================================================
// SEQUENCE ENDPOINTS - READ OPERATIONS
// ============================================================================

/**
 * Get all sequences with pagination and filtering
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 20)
 * @param {string} params.sort - Sort field (default: '-createdAt')
 * @param {string} params.search - Search query
 * @returns {Promise<Object>} Paginated sequences and metadata
 */
export async function getSequences({ page = 1, limit = 20, sort = '-createdAt', search = '' } = {}) {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort,
        ...(search && { search })
    });

    return apiCall(`/sequences?${params.toString()}`, { method: 'GET' });
}

/**
 * Get sequence by ID with full details
 * @param {number|string} id - Sequence ID
 * @returns {Promise<Object>} Complete sequence data
 */
export async function getSequenceById(id) {
    return apiCall(`/sequences/${id}`, { method: 'GET' });
}

/**
 * Get sequence metadata only (lightweight)
 * @param {number|string} id - Sequence ID
 * @returns {Promise<Object>} Sequence metadata
 */
export async function getSequenceMetadata(id) {
    return apiCall(`/sequences/${id}/metadata`, { method: 'GET' });
}

/**
 * Get sequence report (AI analysis)
 * @param {number|string} id - Sequence ID
 * @returns {Promise<Object>} AI-generated analysis
 */
export async function getSequenceReport(id) {
    return apiCall(`/sequences/${id}/report`, { method: 'GET' });
}

/**
 * Get aggregate statistics for all sequences
 * @returns {Promise<Object>} Overall statistics
 */
export async function getAggregateStats() {
    return apiCall('/sequences/stats/aggregate', { method: 'GET' });
}

/**
 * Search sequences by text
 * @param {string} query - Search query
 * @param {number} limit - Maximum results (default: 20)
 * @returns {Promise<Object>} Search results
 */
export async function searchSequences(query, limit = 20) {
    const params = new URLSearchParams({
        q: query,
        limit: limit.toString()
    });

    return apiCall(`/sequences/search/text?${params.toString()}`, { method: 'GET' });
}

// ============================================================================
// SEQUENCE ENDPOINTS - CREATE OPERATIONS
// ============================================================================

/**
 * Create sequence from FASTA text
 * @param {Object} data - Sequence data
 * @param {string} data.fasta - FASTA formatted text
 * @param {string} data.name - Optional custom name
 * @param {string} data.description - Optional description
 * @returns {Promise<Object>} Created sequence
 */
export async function createSequence({ fasta, name, description }) {
    return apiCall('/sequences', {
        method: 'POST',
        body: JSON.stringify({ fasta, name, description })
    });
}

/**
 * Upload FASTA file
 * @param {File} file - FASTA file to upload
 * @returns {Promise<Object>} Created sequence from file
 */
export async function uploadSequenceFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const token = getToken();
    const headers = {
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };

    try {
        const response = await fetch(`${API_BASE_URL}/sequences/upload`, {
            method: 'POST',
            headers,
            body: formData
        });

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || data.message || 'Upload failed');
            }
            return data;
        } else {
            const text = await response.text();
            if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
                if (API_BASE_URL !== 'http://localhost:3002/api') {
                    API_BASE_URL = 'http://localhost:3002/api';
                    // Retry once against local backend
                    const retryResponse = await fetch(`${API_BASE_URL}/sequences/upload`, {
                        method: 'POST',
                        headers,
                        body: formData
                    });
                    const retryType = retryResponse.headers.get('content-type') || '';
                    if (retryType.includes('application/json')) {
                        const retryData = await retryResponse.json();
                        if (!retryResponse.ok) {
                            throw new Error(retryData.error || retryData.message || 'Upload failed');
                        }
                        return retryData;
                    }
                }
                throw new Error('Upload failed: backend returned HTML. Verify API URL points to the backend.');
            }
            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status} - ${text}`);
            }
            return { message: text };
        }
    } catch (error) {
        if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
            throw new Error('Cannot connect to server. Please check if the backend is running.');
        }
        throw error;
    }
}

// ============================================================================
// SEQUENCE ENDPOINTS - UPDATE OPERATIONS
// ============================================================================

/**
 * Update sequence metadata
 * @param {number|string} id - Sequence ID
 * @param {Object} data - Fields to update
 * @param {string} data.filename - Optional new filename
 * @param {string} data.header - Optional new header
 * @param {string} data.name - Optional new name
 * @param {string} data.description - Optional new description
 * @param {Object} data.metadata - Optional metadata object
 * @returns {Promise<Object>} Updated sequence
 */
export async function updateSequence(id, data) {
    return apiCall(`/sequences/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

/**
 * Generate AI report for a sequence
 * @param {number|string} id - Sequence ID
 * @param {Object} options - Report generation options
 * @param {number} options.length_threshold - Minimum length for detailed analysis
 * @returns {Promise<Object>} Generated report with analysis
 */
export async function generateReport(id, options = {}) {
    return apiCall(`/sequences/${id}/generate-report`, {
        method: 'POST',
        body: JSON.stringify({ options })
    });
}

// ============================================================================
// SEQUENCE ENDPOINTS - DELETE OPERATIONS
// ============================================================================

/**
 * Delete a single sequence
 * @param {number|string} id - Sequence ID
 * @returns {Promise<Object>} Delete confirmation
 */
export async function deleteSequence(id) {
    return apiCall(`/sequences/${id}`, { method: 'DELETE' });
}

/**
 * Bulk delete multiple sequences
 * @param {Array<number|string>} ids - Array of sequence IDs
 * @returns {Promise<Object>} Delete confirmation with count
 */
export async function bulkDeleteSequences(ids) {
    return apiCall('/sequences/bulk/delete', {
        method: 'POST',
        body: JSON.stringify({ ids })
    });
}

// ============================================================================
// REPORT ENDPOINTS
// ============================================================================

/**
 * Generate and download PDF report
 * @param {Array<number|string>} sequenceIds - Sequence IDs to include (empty = all)
 * @param {string} title - Report title
 * @returns {Promise<Blob>} PDF blob
 */
export async function generatePDFReport(sequenceIds = [], title = 'Symbio-NLM Sequence Analysis Report') {
    try {
        const blob = await apiCall('/sequences/generate-pdf', {
            method: 'POST',
            body: JSON.stringify({
                sequenceIds,
                title
            }),
            isBlob: true
        });

        // Auto-download the PDF
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `symbio-nlm-report-${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return blob;
    } catch (error) {
        throw new Error(`Failed to generate PDF: ${error.message}`);
    }
}

// ============================================================================
// HEALTH & UTILITY ENDPOINTS
// ============================================================================

/**
 * Check API health and connectivity
 * @returns {Promise<Object>} Health status
 */
export async function checkHealth() {
    try {
        return await apiCall('/health', { method: 'GET' });
    } catch (error) {
        return { status: 'error', message: error.message };
    }
}

/**
 * Get API info
 * @returns {Promise<Object>} API information
 */
export async function getApiInfo() {
    return apiCall('/', { method: 'GET' });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Parse response error message
 * @param {Error} error - Error object
 * @returns {string} Formatted error message
 */
export function parseError(error) {
    if (error.message.includes('Cannot connect to server')) {
        return 'Server connection failed. Make sure the backend is running on port 3002.';
    }
    return error.message || 'An unknown error occurred';
}

/**
 * Clear all stored data
 */
export function clearStorage() {
    localStorage.removeItem('symbio_nlm_auth_token');
    localStorage.removeItem('symbio_nlm_user');
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has valid token
 */
export function isAuthenticated() {
    return !!getToken();
}

/**
 * Get stored user data
 * @returns {Object|null} User data or null
 */
export function getStoredUser() {
    const user = localStorage.getItem('symbio_nlm_user');
    return user ? JSON.parse(user) : null;
}

// ============================================================================
// STORAGE ENDPOINTS (MongoDB Local/Atlas)
// ============================================================================

/**
 * Get storage connection status
 * @returns {Promise<Object>} Connection status
 */
export async function getStorageStatus() {
    return apiCall('/storage/status', { method: 'GET' });
}

/**
 * Connect to MongoDB storage
 * @param {string} type - 'local' or 'atlas'
 * @returns {Promise<Object>} Connection result
 */
export async function connectStorage(type = 'local') {
    return apiCall('/storage/connect', {
        method: 'POST',
        body: JSON.stringify({ type })
    });
}

/**
 * Disconnect from MongoDB storage
 * @returns {Promise<Object>} Disconnect result
 */
export async function disconnectStorage() {
    return apiCall('/storage/disconnect', { method: 'POST' });
}

/**
 * Save sequences to MongoDB
 * @param {Array} sequences - Array of sequence objects
 * @param {string} storageType - 'local' or 'atlas'
 * @returns {Promise<Object>} Save result
 */
export async function saveSequencesToStorage(sequences, storageType = 'local') {
    return apiCall('/storage/save', {
        method: 'POST',
        body: JSON.stringify({ sequences, storageType })
    });
}

/**
 * Get sequences from MongoDB
 * @param {Object} options - Query options
 * @param {string} options.storageType - 'local' or 'atlas'
 * @param {number} options.limit - Max results
 * @param {number} options.skip - Skip count
 * @returns {Promise<Object>} Sequences list
 */
export async function getSequencesFromStorage(options = {}) {
    const { storageType = 'local', limit = 50, skip = 0 } = options;
    return apiCall(`/storage/sequences?storageType=${storageType}&limit=${limit}&skip=${skip}`, {
        method: 'GET'
    });
}

/**
 * Delete sequence from MongoDB
 * @param {string} id - Sequence ID
 * @returns {Promise<Object>} Delete result
 */
export async function deleteSequenceFromStorage(id) {
    return apiCall(`/storage/sequences/${id}`, { method: 'DELETE' });
}
