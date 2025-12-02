// API Client for Backend Communication
// 
// ⚠️ CONFIGURE YOUR BACKEND URL HERE:
// Change this to your deployed backend URL in production
// Example: 'https://your-backend.herokuapp.com/api'
//
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface SequenceData {
  id?: string;
  name: string;
  header?: string;
  filename?: string;
  length: number;
  gcContent: number;
  gcPercent?: number;
  sequence: string;
  nucleotideCounts: { A: number; T: number; G: number; C: number };
  orfs: Array<{ start: number; end: number; length: number; sequence: string; frame?: number }>;
  orfDetected?: boolean;
  orfCount?: number;
  createdAt: string;
  updatedAt?: string;
  description?: string;
  title?: string;
  interpretation?: string;
  aiSummary?: string;
  metrics?: {
    length: number;
    gcContent: number;
    orfDetected: boolean;
    orfCount?: number;
  };
}

export interface UploadResponse {
  id: string;
  filename: string;
  header: string;
  name: string;
  length: number;
  gcPercent: number;
  orfDetected: boolean;
  orfCount?: number;
  nucleotideCounts: { A: number; T: number; G: number; C: number };
  createdAt: string;
}

export interface SequencesListResponse {
  data: Array<{
    id: string;
    filename: string;
    header: string;
    name: string;
    length: number;
    gcPercent: number;
    orfDetected: boolean;
    orfCount: number;
    nucleotideCounts: { A: number; T: number; G: number; C: number };
    createdAt: string;
    updatedAt?: string;
  }>;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface StatisticsResponse {
  total: number;
  avgLength: number;
  avgGC: number;
  totalORFs: number;
  totalBases: number;
  longestSequence: number;
  shortestSequence: number;
}

export interface SearchResponse {
  query: string;
  count: number;
  results: Array<{
    id: string;
    name: string;
    filename: string;
    length: number;
    gcContent: number;
    createdAt: string;
  }>;
}

export interface ReportResponse {
  id: string;
  aiSummary: string;
  interpretation: string;
}

export interface GenerateReportResponse {
  message: string;
  id: string;
  aiSummary: string;
  interpretation: string;
  analysis: {
    gcQuality: string;
    lengthCategory: string;
    orfCount: number;
    qualityScore: string;
  };
}

/**
 * Create sequence from FASTA string
 */
export async function createSequence(fastaString: string, name?: string, description?: string): Promise<UploadResponse[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/sequences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
export async function uploadFastaFile(file: File): Promise<UploadResponse> {
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
  page: number = 1,
  limit: number = 20,
  sort: string = '-createdAt',
  search?: string
): Promise<SequencesListResponse> {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    params.append('sort', sort);
    if (search) params.append('search', search);

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
    throw error;
  }
}

/**
 * Get single sequence by ID with full details
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
  id: string,
  updates: {
    filename?: string;
    header?: string;
    name?: string;
    description?: string;
    metadata?: Record<string, any>;
  }
): Promise<{ id: string; filename: string; header: string; name: string; description?: string; updatedAt: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/sequences/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
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
export async function deleteSequence(id: string): Promise<{ message: string; id: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/sequences/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
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
export async function bulkDeleteSequences(ids: string[]): Promise<{ message: string; deletedCount: number }> {
  try {
    const response = await fetch(`${API_BASE_URL}/sequences/bulk/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
  query: string,
  options?: { limit?: number }
): Promise<SearchResponse> {
  try {
    const params = new URLSearchParams({
      query,
      limit: (options?.limit || 10).toString(),
    });

    const response = await fetch(`${API_BASE_URL}/sequences/search/text?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
export async function getStatistics(): Promise<StatisticsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/sequences/stats/aggregate`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
export async function getSequenceReport(id: string): Promise<ReportResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/sequences/${id}/report`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
  id: string,
  options?: { includeVisuals?: boolean; detailLevel?: 'basic' | 'detailed' | 'comprehensive' }
): Promise<GenerateReportResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/sequences/${id}/generate-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
export async function getSequenceMetadata(id: string): Promise<{
  status: string;
  processingTime: string;
  id: string;
  name: string;
  length: number;
  gcContent: number;
  orfCount: number;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/sequences/${id}/metadata`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
export async function checkBackendConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}
