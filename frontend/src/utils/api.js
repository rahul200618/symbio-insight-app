// API Client for Backend Communication
// 
// ⚠️ CONFIGURE YOUR BACKEND URL HERE:
// Change this to your deployed backend URL in production
// Example: 'https://your-backend.herokuapp.com/api'
//
const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Upload parsed sequences to backend
 */
export async function uploadSequences(sequences, fileName, fileSize) {
    try {
        const response = await fetch(`${API_BASE_URL}/sequences/upload`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sequences,
                fileName,
                fileSize,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        // Silently fail - app works offline with local storage
        throw error;
    }
}

/**
 * Get all sequences from backend
 */
export async function getAllSequences(limit, offset) {
    try {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());
        if (offset) params.append('offset', offset.toString());

        const response = await fetch(`${API_BASE_URL}/sequences?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        // Silently fail - app works offline with mock data
        throw error;
    }
}

/**
 * Get single sequence by ID
 */
export async function getSequenceById(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/sequences/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.sequence;
    } catch (error) {
        // Silently fail - app works offline
        throw error;
    }
}

/**
 * Delete sequence by ID
 */
export async function deleteSequence(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/sequences/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        // Silently fail - app works offline
        throw error;
    }
}

/**
 * Search sequences
 */
export async function searchSequences(query) {
    try {
        const response = await fetch(`${API_BASE_URL}/sequences/search?q=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        // Silently fail - app works offline
        throw error;
    }
}

/**
 * Get aggregate statistics
 */
export async function getStatistics() {
    try {
        const response = await fetch(`${API_BASE_URL}/sequences/statistics`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        // Silently fail - app works offline
        throw error;
    }
}

/**
 * Check if backend is connected
 */
export async function checkBackendConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
        });
        return response.ok;
    } catch (error) {
        return false;
    }
}
