// API Client for Backend Communication
const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Login user
 */
export async function login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error((await response.json()).message || 'Login failed');
    return await response.json();
}

/**
 * Register user
 */
export async function register(name, email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    });
    if (!response.ok) throw new Error((await response.json()).message || 'Registration failed');
    return await response.json();
}

/**
 * Upload FASTA content to backend
 */
export async function uploadSequences(fastaContent, fileName) {
    const response = await fetch(`${API_BASE_URL}/sequences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            fasta: fastaContent,
            name: fileName
        }),
    });
    if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);
    return await response.json();
}

/**
 * Get all sequences (with pagination/search)
 */
export async function getAllSequences(limit = 20, offset = 0, search = '') {
    const params = new URLSearchParams({
        limit: limit.toString(),
        page: (Math.floor(offset / limit) + 1).toString(), // Convert offset to page
        search
    });

    const response = await fetch(`${API_BASE_URL}/sequences?${params.toString()}`);
    if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
    return await response.json();
}

/**
 * Get single sequence by ID
 */
export async function getSequenceById(id) {
    const response = await fetch(`${API_BASE_URL}/sequences/${id}`);
    if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
    const data = await response.json();
    return data; // Backend returns the full object, usually data.sequence or just data
}

/**
 * Update sequence
 */
export async function updateSequence(id, data) {
    const response = await fetch(`${API_BASE_URL}/sequences/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Update failed: ${response.statusText}`);
    return await response.json();
}

/**
 * Delete sequence by ID
 */
export async function deleteSequence(id) {
    const response = await fetch(`${API_BASE_URL}/sequences/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error(`Delete failed: ${response.statusText}`);
    return await response.json();
}

/**
 * Bulk delete sequences
 */
export async function bulkDeleteSequences(ids) {
    const response = await fetch(`${API_BASE_URL}/sequences/bulk/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
    });
    if (!response.ok) throw new Error(`Bulk delete failed: ${response.statusText}`);
    return await response.json();
}

/**
 * Search sequences (Specialized text search)
 */
export async function searchSequences(query) {
    const response = await fetch(`${API_BASE_URL}/sequences/search/text?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error(`Search failed: ${response.statusText}`);
    return await response.json();
}

/**
 * Get aggregate statistics
 */
export async function getStatistics() {
    const response = await fetch(`${API_BASE_URL}/sequences/stats/aggregate`);
    if (!response.ok) throw new Error(`Stats fetch failed: ${response.statusText}`);
    return await response.json();
}

/**
 * Generate AI Report for a sequence
 */
export async function generateAIReport(id, options = {}) {
    const response = await fetch(`${API_BASE_URL}/sequences/${id}/generate-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ options }),
    });
    if (!response.ok) throw new Error(`Report generation failed: ${response.statusText}`);
    return await response.json();
}

/**
 * Check backend connection
 */
export async function checkBackendConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        return response.ok;
    } catch (error) {
        return false;
    }
}
