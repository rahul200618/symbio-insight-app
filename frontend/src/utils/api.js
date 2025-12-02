// API Client for Backend Communication
// 
// ⚠️ CONFIGURE YOUR BACKEND URL HERE:
// Change this to your deployed backend URL in production
// Example: 'https://your-backend.herokuapp.com/api'
//
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';















/**
 * Create sequence from FASTA string
 */
export async function createSequence(fastaString, name?, description?) {
  try {
    const response = await fetch(`${API_BASE_URL}/sequences`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        fasta: fastaString,
        name,
        description,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Upload FASTA file
 */
export async function uploadFastaFile(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/sequences/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Get all sequences with pagination and search
 */
export async function getAllSequences(
  page = 1,
  limit = 20,
  sort = '-createdAt',
  search?
) {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    params.append('sort', sort);
    if (search) params.append('search', search);

    const response = await fetch(`${API_BASE_URL}/sequences?${params.toString()}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Get single sequence by ID with full details
 */
export async function getSequenceById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/sequences/${id}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Update sequence metadata
 */
export async function updateSequence(
  id,
  updates
) {
  try {
    const response = await fetch(`${API_BASE_URL}/sequences/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
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
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Bulk delete sequences
 */
export async function bulkDeleteSequences(ids[]) {
  try {
    const response = await fetch(`${API_BASE_URL}/sequences/bulk/delete`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Search sequences with full-text query
 */
export async function searchSequences(
  query,
  options?
) {
  try {
    const params = new URLSearchParams({
      query,
      limit: (options?.limit || 10).toString(),
    });

    const response = await fetch(`${API_BASE_URL}/sequences/search/text?${params}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Get aggregate statistics across all sequences
 */
export async function getStatistics() {
  try {
    const response = await fetch(`${API_BASE_URL}/sequences/stats/aggregate`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Get existing report for a sequence
 */
export async function getSequenceReport(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/sequences/${id}/report`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Generate AI report for a sequence
 */
export async function generateReport(
  id,
  options?
) {
  try {
    const response = await fetch(`${API_BASE_URL}/sequences/${id}/generate-report`, {
      method: 'POST',
      headers,
      body: JSON.stringify(options || {}),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Get sequence metadata
 */
export async function getSequenceMetadata(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/sequences/${id}/metadata`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

/**
 * Check if backend is connected
 */
export async function checkBackendConnection() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}


