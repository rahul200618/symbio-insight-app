/**
 * RCSB PDB (Protein Data Bank) Service
 * 
 * This service provides integration with the RCSB PDB API
 * for fetching protein structure information.
 * 
 * API Documentation: https://data.rcsb.org/
 */

const PDB_API_BASE = 'https://data.rcsb.org/rest/v1';
const PDB_SEARCH_API = 'https://search.rcsb.org/rcsbsearch/v2/query';

/**
 * Fetch detailed information about a specific PDB entry
 * @param {string} pdbId - 4-character PDB ID (e.g., "1HHO")
 * @returns {Promise<object>} PDB entry data
 */
export async function getPDBEntry(pdbId) {
    try {
        const normalizedId = pdbId.toUpperCase().trim();
        
        // Validate PDB ID format (4 characters, starts with number)
        if (!/^[0-9][A-Z0-9]{3}$/.test(normalizedId)) {
            throw new Error('Invalid PDB ID format. Must be 4 characters starting with a number (e.g., 1HHO)');
        }

        const response = await fetch(`${PDB_API_BASE}/core/entry/${normalizedId}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`PDB entry ${normalizedId} not found`);
            }
            throw new Error(`Failed to fetch PDB entry: ${response.statusText}`);
        }

        const data = await response.json();
        return formatPDBEntry(data);
    } catch (error) {
        console.error('Error fetching PDB entry:', error);
        throw error;
    }
}

/**
 * Get polymer (protein/nucleic acid) entities for a PDB entry
 * @param {string} pdbId - 4-character PDB ID
 * @returns {Promise<Array>} List of polymer entities
 */
export async function getPDBPolymers(pdbId) {
    try {
        const normalizedId = pdbId.toUpperCase().trim();
        const response = await fetch(`${PDB_API_BASE}/core/polymer_entity/${normalizedId}`);
        
        if (!response.ok) {
            return [];
        }

        const data = await response.json();
        return Array.isArray(data) ? data : [data];
    } catch (error) {
        console.error('Error fetching PDB polymers:', error);
        return [];
    }
}

/**
 * Search PDB by protein/molecule name
 * @param {string} query - Search query (e.g., "hemoglobin", "insulin")
 * @param {number} limit - Maximum number of results (default: 10)
 * @returns {Promise<Array>} Search results
 */
export async function searchPDB(query, limit = 10) {
    try {
        const searchQuery = {
            query: {
                type: 'terminal',
                service: 'full_text',
                parameters: {
                    value: query
                }
            },
            return_type: 'entry',
            request_options: {
                results_content_type: ['experimental'],
                sort: [
                    {
                        sort_by: 'score',
                        direction: 'desc'
                    }
                ],
                paginate: {
                    start: 0,
                    rows: limit
                }
            }
        };

        const response = await fetch(PDB_SEARCH_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(searchQuery)
        });

        if (!response.ok) {
            throw new Error(`PDB search failed: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.result_set || data.result_set.length === 0) {
            return [];
        }

        // Fetch details for each result
        const results = await Promise.all(
            data.result_set.slice(0, limit).map(async (result) => {
                try {
                    const entry = await getPDBEntry(result.identifier);
                    return entry;
                } catch {
                    return {
                        pdbId: result.identifier,
                        score: result.score
                    };
                }
            })
        );

        return results.filter(r => r !== null);
    } catch (error) {
        console.error('Error searching PDB:', error);
        throw error;
    }
}

/**
 * Search PDB by sequence (BLAST-like search)
 * @param {string} sequence - Amino acid or nucleotide sequence
 * @param {string} sequenceType - 'protein' or 'dna' or 'rna'
 * @param {number} limit - Maximum results
 * @returns {Promise<Array>} Similar structures
 */
export async function searchPDBBySequence(sequence, sequenceType = 'protein', limit = 10) {
    try {
        // Clean sequence
        const cleanSequence = sequence.replace(/[^A-Za-z]/g, '').toUpperCase();
        
        if (cleanSequence.length < 20) {
            throw new Error('Sequence must be at least 20 characters for structure search');
        }

        const searchQuery = {
            query: {
                type: 'terminal',
                service: 'sequence',
                parameters: {
                    evalue_cutoff: 0.1,
                    identity_cutoff: 0.5,
                    sequence_type: sequenceType,
                    value: cleanSequence
                }
            },
            return_type: 'polymer_entity',
            request_options: {
                sort: [
                    {
                        sort_by: 'score',
                        direction: 'desc'
                    }
                ],
                paginate: {
                    start: 0,
                    rows: limit
                }
            }
        };

        const response = await fetch(PDB_SEARCH_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(searchQuery)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Sequence search failed: ${errorText}`);
        }

        const data = await response.json();
        
        if (!data.result_set || data.result_set.length === 0) {
            return [];
        }

        return data.result_set.map(result => ({
            entityId: result.identifier,
            pdbId: result.identifier.split('_')[0],
            score: result.score,
            services: result.services
        }));
    } catch (error) {
        console.error('Error in sequence search:', error);
        throw error;
    }
}

/**
 * Get experimental method and resolution for a structure
 * @param {string} pdbId - PDB ID
 * @returns {Promise<object>} Experimental data
 */
export async function getPDBExperimentalData(pdbId) {
    try {
        const normalizedId = pdbId.toUpperCase().trim();
        const response = await fetch(`${PDB_API_BASE}/core/entry/${normalizedId}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch experimental data');
        }

        const data = await response.json();
        
        return {
            experimentalMethod: data.exptl?.[0]?.method || 'Unknown',
            resolution: data.rcsb_entry_info?.resolution_combined?.[0] || null,
            releaseDate: data.rcsb_accession_info?.initial_release_date,
            depositionDate: data.rcsb_accession_info?.deposit_date,
            revisionDate: data.rcsb_accession_info?.revision_date
        };
    } catch (error) {
        console.error('Error fetching experimental data:', error);
        throw error;
    }
}

/**
 * Get ligands/small molecules bound to a structure
 * @param {string} pdbId - PDB ID
 * @returns {Promise<Array>} List of ligands
 */
export async function getPDBLigands(pdbId) {
    try {
        const normalizedId = pdbId.toUpperCase().trim();
        const response = await fetch(`${PDB_API_BASE}/core/nonpolymer_entity/${normalizedId}`);
        
        if (!response.ok) {
            return [];
        }

        const data = await response.json();
        const entities = Array.isArray(data) ? data : [data];
        
        return entities.map(entity => ({
            id: entity.pdbx_entity_nonpoly?.comp_id,
            name: entity.pdbx_entity_nonpoly?.name,
            formula: entity.rcsb_nonpolymer_entity?.formula_weight
        })).filter(l => l.id);
    } catch (error) {
        console.error('Error fetching ligands:', error);
        return [];
    }
}

/**
 * Format PDB entry data for display
 * @param {object} data - Raw PDB API response
 * @returns {object} Formatted entry
 */
function formatPDBEntry(data) {
    const entry = {
        pdbId: data.rcsb_id,
        title: data.struct?.title || 'No title',
        description: data.struct?.pdbx_descriptor || '',
        
        // Organism and source
        organism: data.rcsb_entry_container_identifiers?.polymer_entity_ids
            ? 'See polymer entities'
            : 'Unknown',
        
        // Experimental details
        experimentalMethod: data.exptl?.[0]?.method || 'Unknown',
        resolution: data.rcsb_entry_info?.resolution_combined?.[0] || null,
        
        // Dates
        releaseDate: data.rcsb_accession_info?.initial_release_date,
        depositionDate: data.rcsb_accession_info?.deposit_date,
        
        // Structure info
        molecularWeight: data.rcsb_entry_info?.molecular_weight,
        polymerEntityCount: data.rcsb_entry_info?.polymer_entity_count || 0,
        nonPolymerEntityCount: data.rcsb_entry_info?.nonpolymer_entity_count || 0,
        
        // Classification
        structureKeywords: data.struct_keywords?.pdbx_keywords || '',
        
        // Authors
        authors: data.audit_author?.map(a => a.name) || [],
        
        // Citation
        citation: data.citation?.[0] ? {
            title: data.citation[0].title,
            journal: data.citation[0].journal_abbrev,
            year: data.citation[0].year,
            doi: data.citation[0].pdbx_database_id_DOI
        } : null,
        
        // URLs
        urls: {
            structure: `https://www.rcsb.org/structure/${data.rcsb_id}`,
            viewer3D: `https://www.rcsb.org/3d-view/${data.rcsb_id}`,
            download: `https://files.rcsb.org/download/${data.rcsb_id}.pdb`
        }
    };

    return entry;
}

/**
 * Format PDB entry as readable text for chatbot
 * @param {object} entry - Formatted PDB entry
 * @returns {string} Human-readable description
 */
export function formatPDBForChat(entry) {
    const lines = [
        `🔬 **PDB Structure: ${entry.pdbId}**`,
        '',
        `**Title:** ${entry.title}`,
        ''
    ];

    if (entry.description) {
        lines.push(`**Description:** ${entry.description}`, '');
    }

    lines.push(`**Experimental Method:** ${entry.experimentalMethod}`);
    
    if (entry.resolution) {
        lines.push(`**Resolution:** ${entry.resolution.toFixed(2)} Å`);
    }

    lines.push(
        '',
        `**Release Date:** ${entry.releaseDate || 'Unknown'}`,
        `**Polymer Entities:** ${entry.polymerEntityCount}`,
        `**Non-Polymer Entities (Ligands):** ${entry.nonPolymerEntityCount}`
    );

    if (entry.molecularWeight) {
        lines.push(`**Molecular Weight:** ${(entry.molecularWeight / 1000).toFixed(1)} kDa`);
    }

    if (entry.structureKeywords) {
        lines.push('', `**Keywords:** ${entry.structureKeywords}`);
    }

    if (entry.authors && entry.authors.length > 0) {
        lines.push('', `**Authors:** ${entry.authors.slice(0, 3).join(', ')}${entry.authors.length > 3 ? ' et al.' : ''}`);
    }

    if (entry.citation) {
        lines.push('', `**Citation:** ${entry.citation.journal || ''} (${entry.citation.year || 'N/A'})`);
        if (entry.citation.doi) {
            lines.push(`**DOI:** ${entry.citation.doi}`);
        }
    }

    lines.push(
        '',
        '**Links:**',
        `• [View Structure](${entry.urls.structure})`,
        `• [3D Viewer](${entry.urls.viewer3D})`,
        `• [Download PDB](${entry.urls.download})`
    );

    return lines.join('\n');
}

/**
 * Format search results for chatbot
 * @param {Array} results - Search results
 * @param {string} query - Original search query
 * @returns {string} Formatted results
 */
export function formatSearchResultsForChat(results, query) {
    if (!results || results.length === 0) {
        return `No PDB structures found for "${query}". Try a different search term or check the spelling.`;
    }

    const lines = [
        `🔍 **Found ${results.length} PDB structures for "${query}":**`,
        ''
    ];

    results.forEach((result, index) => {
        lines.push(
            `**${index + 1}. ${result.pdbId}** - ${result.title || 'No title'}`,
            `   Method: ${result.experimentalMethod || 'Unknown'}${result.resolution ? ` | Resolution: ${result.resolution.toFixed(2)} Å` : ''}`,
            `   [View](https://www.rcsb.org/structure/${result.pdbId})`,
            ''
        );
    });

    lines.push('Ask me about any specific PDB ID for more details!');

    return lines.join('\n');
}

export default {
    getPDBEntry,
    getPDBPolymers,
    searchPDB,
    searchPDBBySequence,
    getPDBExperimentalData,
    getPDBLigands,
    formatPDBForChat,
    formatSearchResultsForChat
};
