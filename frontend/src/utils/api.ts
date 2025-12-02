// API Client for Backend Communication
// 
// ⚠️ CONFIGURE YOUR BACKEND URL HERE:
// Change this to your deployed backend URL in production
// Example: 'https://your-backend.herokuapp.com/api'
//
const API_BASE_URL = 'http://localhost:3001/api';

export interface SequenceData {
  id?: string;
  name: string;
  length: number;
  gcContent: number;
  sequence: string;
  nucleotideCounts: { A: number; T: number; G: number; C: number };
  orfs: Array<{ start: number; end: number; length: number; sequence: string }>;
  createdAt: string;
  fileName?: string;
  fileSize?: number;
  userId?: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  count: number;
  sequences: SequenceData[];
}

export interface SequencesResponse {
  success: boolean;
  sequences: SequenceData[];
  total: number;
}

/**
 * Upload parsed sequences to backend
 */
export async function uploadSequences(
  sequences: SequenceData[],
  fileName: string,
  fileSize: number
): Promise<UploadResponse> {
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
export async function getAllSequences(limit?: number, offset?: number): Promise<SequencesResponse> {
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
export async function getSequenceById(id: string): Promise<SequenceData> {
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
export async function deleteSequence(id: string): Promise<{ success: boolean; message: string }> {
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
export async function searchSequences(query: string): Promise<SequencesResponse> {
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
export async function getStatistics(): Promise<any> {
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
export async function checkBackendConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}
