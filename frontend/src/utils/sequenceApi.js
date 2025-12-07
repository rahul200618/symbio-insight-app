/**
 * Sequence API Service
 * Centralized API service for all sequence-related operations
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

// Helper to get auth token
const getToken = () => localStorage.getItem('symbio_nlm_auth_token');

// Helper for API calls
async function apiCall(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
            throw new Error('Cannot connect to server. Please check if the backend is running.');
        }
        throw error;
    }
}

/**
 * Get all sequences with pagination and filtering
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 20)
 * @param {string} params.sort - Sort field (e.g., '-createdAt' for DESC)
 * @param {string} params.search - Search query
 * @returns {Promise<Object>} Response with data and meta
 */
export async function getSequences({ page = 1, limit = 20, sort = '-createdAt', search = '' } = {}) {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort,
        ...(search && { search })
    });

    return apiCall(`/sequences?${params.toString()}`, {
        method: 'GET'
    });
}

/**
 * Create a new sequence from FASTA text
 * @param {Object} data - Sequence data
 * @param {string} data.fasta - FASTA formatted text
 * @param {string} data.name - Optional custom name
 * @param {string} data.description - Optional description
 * @returns {Promise<Object>} Created sequence data
 */
export async function createSequence({ fasta, name, description }) {
    return apiCall('/sequences', {
        method: 'POST',
        body: JSON.stringify({ fasta, name, description })
    });
}

/**
 * Upload a FASTA file
 * @param {File} file - FASTA file to upload
 * @returns {Promise<Object>} Created sequence data
 */
export async function uploadSequenceFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const token = getToken();
    const headers = {
        ...(token && { 'Authorization': `Bearer ${token}` })
    };

    try {
        const response = await fetch(`${API_BASE_URL}/sequences/upload`, {
            method: 'POST',
            headers,
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || data.message || 'Upload failed');
        }

        return data;
    } catch (error) {
        if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
            throw new Error('Cannot connect to server. Please check if the backend is running.');
        }
        throw error;
    }
}

/**
 * Get sequence by ID
 * @param {number|string} id - Sequence ID
 * @returns {Promise<Object>} Sequence details
 */
export async function getSequenceById(id) {
    return apiCall(`/sequences/${id}`, {
        method: 'GET'
    });
}

/**
 * Update sequence metadata
 * @param {number|string} id - Sequence ID
 * @param {Object} data - Fields to update
 * @returns {Promise<Object>} Updated sequence
 */
export async function updateSequence(id, data) {
    return apiCall(`/sequences/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

/**
 * Delete a sequence
 * @param {number|string} id - Sequence ID
 * @returns {Promise<Object>} Delete confirmation
 */
export async function deleteSequence(id) {
    return apiCall(`/sequences/${id}`, {
        method: 'DELETE'
    });
}

/**
 * Generate AI report for a sequence
 * @param {number|string} id - Sequence ID
 * @param {Object} options - Report generation options
 * @returns {Promise<Object>} Generated report data
 */
export async function generateReport(id, options = {}) {
    return apiCall(`/sequences/${id}/generate-report`, {
        method: 'POST',
        body: JSON.stringify({ options })
    });
}

/**
 * Get sequence report
 * @param {number|string} id - Sequence ID
 * @returns {Promise<Object>} Report data
 */
export async function getSequenceReport(id) {
    return apiCall(`/sequences/${id}/report`, {
        method: 'GET'
    });
}

/**
 * Get sequence metadata only
 * @param {number|string} id - Sequence ID
 * @returns {Promise<Object>} Metadata
 */
export async function getSequenceMetadata(id) {
    return apiCall(`/sequences/${id}/metadata`, {
        method: 'GET'
    });
}

/**
 * Get aggregate statistics for all sequences
 * @returns {Promise<Object>} Statistics
 */
export async function getAggregateStats() {
    return apiCall('/sequences/stats/aggregate', {
        method: 'GET'
    });
}

/**
 * Bulk delete sequences
 * @param {Array<number|string>} ids - Array of sequence IDs
 * @returns {Promise<Object>} Delete confirmation with count
 */
export async function bulkDeleteSequences(ids) {
    return apiCall('/sequences/bulk/delete', {
        method: 'POST',
        body: JSON.stringify({ ids })
    });
}

/**
 * Search sequences by text
 * @param {string} query - Search query
 * @param {number} limit - Maximum results
 * @returns {Promise<Object>} Search results
 */
export async function searchSequences(query, limit = 20) {
    const params = new URLSearchParams({
        q: query,
        limit: limit.toString()
    });

    return apiCall(`/sequences/search/text?${params.toString()}`, {
        method: 'GET'
    });
}

/**
 * Check API health
 * @returns {Promise<Object>} Health status
 */
export async function checkHealth() {
    return apiCall('/health', {
        method: 'GET'
    });
}

/**
 * Generate and download PDF report
 * @param {Array} sequenceIds - Array of sequence IDs to include (optional)
 * @param {string} title - Report title
 * @returns {Promise<Blob>} PDF blob
 */
export async function generatePDFReport(sequenceIds = [], title = 'Symbio-NLM Sequence Analysis Report') {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };

    try {
        const response = await fetch(`${API_BASE_URL}/sequences/generate-pdf`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                sequenceIds,
                title
            })
        });

        if (!response.ok) {
            throw new Error(`PDF generation failed: ${response.statusText}`);
        }

        const blob = await response.blob();
        
        // Create download link
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
