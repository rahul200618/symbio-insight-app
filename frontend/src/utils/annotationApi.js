/**
 * Annotation API Service
 * 
 * Client-side API calls for sequence annotations
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

/**
 * Get auth headers
 */
function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

/**
 * Fetch annotations for a sequence
 * @param {string} sequenceId - The sequence ID
 * @returns {Promise<Array>} - Array of annotations
 */
export async function getAnnotations(sequenceId) {
  const response = await fetch(`${API_BASE}/annotations/sequence/${sequenceId}`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch annotations');
  }

  const data = await response.json();
  return data.data || [];
}

/**
 * Create a new annotation
 * @param {Object} annotation - Annotation data
 * @returns {Promise<Object>} - Created annotation
 */
export async function createAnnotation(annotation) {
  const response = await fetch(`${API_BASE}/annotations`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(annotation),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to create annotation');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Update an annotation
 * @param {string} annotationId - The annotation ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} - Updated annotation
 */
export async function updateAnnotation(annotationId, updates) {
  const response = await fetch(`${API_BASE}/annotations/${annotationId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to update annotation');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Delete an annotation
 * @param {string} annotationId - The annotation ID
 * @returns {Promise<void>}
 */
export async function deleteAnnotation(annotationId) {
  const response = await fetch(`${API_BASE}/annotations/${annotationId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to delete annotation');
  }
}

/**
 * Create multiple annotations at once
 * @param {string} sequenceId - The sequence ID
 * @param {Array} annotations - Array of annotation objects
 * @returns {Promise<Array>} - Created annotations
 */
export async function createBulkAnnotations(sequenceId, annotations) {
  const response = await fetch(`${API_BASE}/annotations/bulk`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ sequenceId, annotations }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to create annotations');
  }

  const data = await response.json();
  return data.data || [];
}

/**
 * Delete all annotations for a sequence
 * @param {string} sequenceId - The sequence ID
 * @returns {Promise<number>} - Number of deleted annotations
 */
export async function deleteAllAnnotations(sequenceId) {
  const response = await fetch(`${API_BASE}/annotations/sequence/${sequenceId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to delete annotations');
  }

  const data = await response.json();
  return data.deletedCount || 0;
}

/**
 * Export annotations as GFF3
 * @param {string} sequenceId - The sequence ID
 * @returns {Promise<string>} - GFF3 content
 */
export async function exportAnnotationsGFF3(sequenceId) {
  const response = await fetch(`${API_BASE}/annotations/export/${sequenceId}?format=gff3`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to export annotations');
  }

  return await response.text();
}

// Annotation type colors
export const ANNOTATION_COLORS = {
  gene: '#22c55e',       // Green
  promoter: '#f59e0b',   // Amber
  exon: '#3b82f6',       // Blue
  intron: '#94a3b8',     // Gray
  motif: '#8b5cf6',      // Purple
  regulatory: '#ec4899', // Pink
  coding: '#14b8a6',     // Teal
  'non-coding': '#78716c', // Stone
  custom: '#6366f1',     // Indigo
};

// Annotation type labels
export const ANNOTATION_TYPES = [
  { value: 'gene', label: 'Gene' },
  { value: 'promoter', label: 'Promoter' },
  { value: 'exon', label: 'Exon' },
  { value: 'intron', label: 'Intron' },
  { value: 'motif', label: 'Motif' },
  { value: 'regulatory', label: 'Regulatory Element' },
  { value: 'coding', label: 'Coding Region' },
  { value: 'non-coding', label: 'Non-Coding Region' },
  { value: 'custom', label: 'Custom' },
];

export default {
  getAnnotations,
  createAnnotation,
  updateAnnotation,
  deleteAnnotation,
  createBulkAnnotations,
  deleteAllAnnotations,
  exportAnnotationsGFF3,
  ANNOTATION_COLORS,
  ANNOTATION_TYPES,
};
