// AI Service Integration
// Supports OpenAI GPT-4, Anthropic Claude, and other AI models

import pdbService from './pdbService.js';

const AI_API_URL = 'http://localhost:3002/api/ai'; // Backend AI endpoint

/**
 * Generate AI-powered sequence annotation
 */
export async function generateAIAnnotation(sequence) {
    try {
        const response = await fetch(`${AI_API_URL}/annotate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sequenceName: sequence.sequenceName,
                sequence: sequence.rawSequence,
                length: sequence.sequenceLength,
                gcContent: sequence.gcPercentage,
                orfs: sequence.orfs.length,
            }),
        });

        if (!response.ok) {
            throw new Error('AI annotation failed');
        }

        return await response.json();
    } catch (error) {
        console.log('AI service not available, using mock data');
        return generateMockAnnotation(sequence);
    }
}

/**
 * Predict sequence quality using AI
 */
export async function predictSequenceQuality(sequence) {
    try {
        const response = await fetch(`${AI_API_URL}/quality`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sequence: sequence.rawSequence,
                nucleotideCounts: sequence.nucleotideCounts,
                gcContent: sequence.gcPercentage,
                length: sequence.sequenceLength,
            }),
        });

        if (!response.ok) {
            throw new Error('Quality prediction failed');
        }

        return await response.json();
    } catch (error) {
        console.log('AI service not available, using rule-based quality check');
        return generateRuleBasedQuality(sequence);
    }
}

/**
 * Generate intelligent report with AI insights
 */
export async function generateIntelligentReport(sequences) {
    try {
        const response = await fetch(`${AI_API_URL}/report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sequences }),
        });

        if (!response.ok) {
            throw new Error('Report generation failed');
        }

        return await response.json();
    } catch (error) {
        console.log('AI service not available, using template report');
        return generateTemplateReport(sequences);
    }
}

/**
 * Lookup a PDB structure by ID
 * @param {string} pdbId - 4-character PDB ID
 * @returns {Promise<string>} Formatted PDB information
 */
export async function lookupPDBStructure(pdbId) {
    try {
        const entry = await pdbService.getPDBEntry(pdbId);
        return pdbService.formatPDBForChat(entry);
    } catch (error) {
        return `❌ Could not find PDB structure "${pdbId}". Please check the ID and try again. Valid PDB IDs are 4 characters starting with a number (e.g., 1HHO, 4HHB, 6LU7).`;
    }
}

/**
 * Search PDB for structures by name
 * @param {string} query - Search term (e.g., "hemoglobin", "insulin")
 * @returns {Promise<string>} Formatted search results
 */
export async function searchPDBStructures(query) {
    try {
        const results = await pdbService.searchPDB(query, 5);
        return pdbService.formatSearchResultsForChat(results, query);
    } catch (error) {
        return `❌ Error searching PDB: ${error.message}. Please try again with a different search term.`;
    }
}

/**
 * Process chat response - handles async PDB operations
 * @param {string|object} response - Response from getRuleBasedResponse
 * @returns {Promise<string>} Final response text
 */
export async function processChatResponse(response) {
    // If it's a string, return as-is
    if (typeof response === 'string') {
        return response;
    }
    
    // Handle PDB lookup
    if (response.type === 'pdb_lookup') {
        return await lookupPDBStructure(response.pdbId);
    }
    
    // Handle PDB search
    if (response.type === 'pdb_search') {
        return await searchPDBStructures(response.query);
    }
    
    // Unknown type, return message or stringify
    return response.message || JSON.stringify(response);
}

/**
 * Chat with AI assistant about sequences
 */
export async function chatWithAI(message, context = {}) {
    try {
        // Prepare detailed context
        const sequences = context.sequences || [];
        const detailedContext = {
            hasSequences: sequences.length > 0,
            sequenceCount: sequences.length,
            currentView: context.currentView || 'unknown',
            sequences: sequences.slice(0, 3).map(seq => ({ // Send first 3 sequences
                name: seq.sequenceName || seq.name,
                length: seq.sequenceLength || seq.length,
                gcContent: seq.gcPercentage || seq.gcContent,
                orfs: seq.orfs?.length || 0,
                nucleotides: seq.nucleotideCounts
            })),
            avgStats: sequences.length > 0 ? {
                avgLength: sequences.reduce((sum, s) => sum + (s.sequenceLength || s.length || 0), 0) / sequences.length,
                avgGC: sequences.reduce((sum, s) => sum + (s.gcPercentage || s.gcContent || 0), 0) / sequences.length,
                totalORFs: sequences.reduce((sum, s) => sum + (s.orfs?.length || 0), 0)
            } : null
        };
        
        const response = await fetch(`${AI_API_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                context: detailedContext
            }),
        });

        if (!response.ok) {
            throw new Error('Chat failed');
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.log('AI service not available, using rule-based response');
        const ruleResponse = getRuleBasedResponse(message, context);
        // Process async PDB operations if needed
        return await processChatResponse(ruleResponse);
    }
}

/**
 * Generate AI-powered sequence analysis summary
 */
export async function generateSequenceAnalysis(sequenceStats) {
    try {
        const response = await fetch(`${AI_API_URL}/analyze-sequence`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                totalSequences: sequenceStats.totalSequences,
                avgLength: sequenceStats.avgLength,
                longestSequence: sequenceStats.longestSequence,
                shortestSequence: sequenceStats.shortestSequence,
                totalLength: sequenceStats.totalLength,
                gcContent: sequenceStats.avgGC,
                atContent: 100 - sequenceStats.avgGC,
                nucleotides: {
                    A: sequenceStats.nucleotideDistribution.A,
                    T: sequenceStats.nucleotideDistribution.T,
                    G: sequenceStats.nucleotideDistribution.G,
                    C: sequenceStats.nucleotideDistribution.C
                },
                totalORFs: sequenceStats.totalORFs
            }),
        });

        if (!response.ok) {
            const data = await response.json();
            if (data.fallback) {
                // AI service not configured, use fallback
                return null;
            }
            throw new Error('Sequence analysis failed');
        }

        const data = await response.json();
        return data.summary;
    } catch (error) {
        console.log('AI analysis not available, using static content');
        return null; // Return null to use static/fallback content
    }
}


// ============================================================================
// MOCK/FALLBACK FUNCTIONS (used when AI backend is not available)
// ============================================================================

function generateMockAnnotation(sequence) {
    const gcContent = sequence.gcPercentage;
    const hasORFs = sequence.orfs.length > 0;

    let predictedFunction = 'Unknown function';
    let proteinFamily = 'Unclassified';

    if (gcContent > 55 && hasORFs) {
        predictedFunction = 'Potential protein-coding gene';
        proteinFamily = 'Hypothetical protein family';
    } else if (gcContent < 40) {
        predictedFunction = 'Possible regulatory region';
        proteinFamily = 'Non-coding RNA candidate';
    }

    return {
        sequenceName: sequence.sequenceName,
        predictedFunction,
        confidence: 0.65,
        proteinFamily,
        domains: hasORFs ? ['DNA-binding domain (predicted)'] : [],
        goTerms: ['GO:0003677 (DNA binding)', 'GO:0005634 (nucleus)'],
        similarSequences: [
            {
                name: 'Hypothetical protein XYZ',
                similarity: 0.78,
                organism: 'Escherichia coli',
            },
        ],
        literature: [
            {
                title: 'Functional characterization of novel DNA sequences',
                authors: 'Smith et al.',
                year: 2023,
                doi: '10.1234/example.2023',
            },
        ],
    };
}

function generateRuleBasedQuality(sequence) {
    const issues = [];
    let score = 100;

    // Check AT content
    const atContent = sequence.nucleotideCounts.A + sequence.nucleotideCounts.T;
    const total = sequence.sequenceLength;
    const atPercent = (atContent / total) * 100;

    if (atPercent > 70) {
        score -= 15;
        issues.push({
            type: 'high_at_content',
            severity: 'medium',
            location: { start: 0, end: sequence.sequenceLength },
            description: `High AT content detected (${atPercent.toFixed(1)}%)`,
            suggestion: 'Verify organism identity. May indicate AT-rich genome or potential contamination.',
        });
    }

    // Check GC content extremes
    if (sequence.gcPercentage > 70 || sequence.gcPercentage < 25) {
        score -= 10;
        issues.push({
            type: 'contamination',
            severity: 'low',
            location: { start: 0, end: sequence.sequenceLength },
            description: `Unusual GC content (${sequence.gcPercentage}%)`,
            suggestion: 'Consider checking for contamination from high/low GC organisms.',
        });
    }

    // Check sequence length
    if (sequence.sequenceLength < 100) {
        score -= 20;
        issues.push({
            type: 'sequencing_error',
            severity: 'high',
            location: { start: 0, end: sequence.sequenceLength },
            description: 'Very short sequence detected',
            suggestion: 'Short sequences may be artifacts. Verify sequencing quality.',
        });
    }

    return {
        overallScore: Math.max(0, score),
        issues,
        recommendations: [
            'Sequence appears to be of good quality',
            issues.length > 0 ? 'Review flagged issues before downstream analysis' : '',
            'Consider running BLAST for homology search',
        ].filter(Boolean),
    };
}

function generateTemplateReport(sequences) {
    const totalLength = sequences.reduce((sum, s) => sum + s.sequenceLength, 0);
    const avgGC = sequences.reduce((sum, s) => sum + s.gcPercentage, 0) / sequences.length;
    const totalORFs = sequences.reduce((sum, s) => sum + s.orfs.length, 0);

    return {
        summary: `Analysis of ${sequences.length} DNA sequences reveals a total of ${totalLength.toLocaleString()} base pairs with an average GC content of ${avgGC.toFixed(1)}%. The sequences contain ${totalORFs} predicted open reading frames, suggesting potential protein-coding capacity.`,

        keyFindings: [
            `${sequences.length} sequences analyzed with varying lengths`,
            `Average GC content: ${avgGC.toFixed(1)}%`,
            `${totalORFs} potential ORFs detected`,
            'Balanced nucleotide distribution observed',
        ],

        biologicalSignificance: `The GC content of ${avgGC.toFixed(1)}% is consistent with typical genomic DNA from prokaryotic or eukaryotic sources. The presence of ${totalORFs} ORFs suggests these sequences may contain functional genes. Further analysis with homology searches and functional annotation is recommended to determine biological roles.`,

        recommendations: [
            'Perform BLAST search against NCBI databases',
            'Conduct multiple sequence alignment if related sequences',
            'Annotate ORFs using protein prediction tools',
            'Validate interesting regions with experimental methods',
        ],

        comparisonToKnown: 'For detailed comparison with known sequences, consider uploading to NCBI BLAST or using specialized genomic databases relevant to your organism of interest.',

        experimentalSuggestions: [
            'Clone and express predicted ORFs to verify protein products',
            'Perform RT-PCR to confirm transcription',
            'Use CRISPR/Cas9 to study gene function',
            'Conduct proteomics to identify translated proteins',
        ],
    };
}

function getRuleBasedResponse(message, context) {
    const msg = message.toLowerCase();
    const sequences = context.sequences || [];
    
    // Species identification
    if (msg.includes('species') || msg.includes('organism') || msg.includes('what is this')) {
        if (sequences.length === 0) {
            return 'Upload a sequence first, and I can help identify the potential species based on GC content, sequence characteristics, and ORF patterns.';
        }
        
        const avgGC = sequences.reduce((sum, s) => sum + (s.gcPercentage || s.gcContent || 0), 0) / sequences.length;
        const avgLength = sequences.reduce((sum, s) => sum + (s.sequenceLength || s.length || 0), 0) / sequences.length;
        
        let prediction = '';
        if (avgGC < 35) {
            prediction = 'Based on the low GC content (~' + avgGC.toFixed(1) + '%), this might be from AT-rich organisms like Plasmodium (malaria parasite) or certain fungi. ';
        } else if (avgGC > 65) {
            prediction = 'The high GC content (~' + avgGC.toFixed(1) + '%) suggests this could be from bacteria like Streptomyces or Mycobacterium. ';
        } else if (avgGC >= 40 && avgGC <= 45) {
            prediction = 'The GC content (~' + avgGC.toFixed(1) + '%) is typical of mammals including humans, mice, or other vertebrates. ';
        } else {
            prediction = 'The GC content (~' + avgGC.toFixed(1) + '%) suggests a bacterial or plant origin. ';
        }
        
        prediction += 'For definitive identification, I recommend running a BLAST search against NCBI databases.';
        return prediction;
    }
    
    // DNA/RNA/Protein detection
    if (msg.includes('dna') || msg.includes('rna') || msg.includes('protein') || msg.includes('type')) {
        if (sequences.length === 0) {
            return 'Upload a sequence to determine if it\'s DNA, RNA, or protein. I\'ll analyze the nucleotide composition and presence of uracil (U) to identify the type.';
        }
        
        const firstSeq = sequences[0];
        const counts = firstSeq.nucleotideCounts || {};
        
        if (counts.U || counts.u) {
            return 'This appears to be RNA based on the presence of Uracil (U). RNA sequences contain U instead of Thymine (T) found in DNA.';
        } else if (counts.A && counts.T && counts.G && counts.C) {
            const hasORFs = sequences.some(s => s.orfs && s.orfs.length > 0);
            return `This is DNA (deoxyribonucleic acid). ${hasORFs ? 'ORFs detected suggest this is coding DNA that may produce proteins.' : 'This appears to be genomic DNA.'} DNA contains Adenine, Thymine, Guanine, and Cytosine.`;
        } else {
            return 'Unable to determine sequence type. Standard DNA contains A, T, G, C, while RNA contains A, U, G, C. Protein sequences use amino acid codes.';
        }
    }
    
    // Context-aware responses
    if (msg.includes('orf') || msg.includes('open reading frame')) {
        const totalORFs = sequences.reduce((sum, s) => sum + (s.orfs?.length || 0), 0);
        let response = 'An Open Reading Frame (ORF) is a continuous stretch of DNA codons that begins with a start codon (ATG) and ends with a stop codon (TAA, TAG, or TGA). ORFs are potential protein-coding regions. ';
        if (totalORFs > 0) {
            response += `Your sequences contain ${totalORFs} ORF${totalORFs > 1 ? 's' : ''}, suggesting potential protein-coding capability.`;
        }
        return response;
    }
    
    if (msg.includes('gc content') || msg.includes('gc%')) {
        const avgGC = sequences.length > 0 ? sequences.reduce((sum, s) => sum + (s.gcPercentage || s.gcContent || 0), 0) / sequences.length : 0;
        let response = 'GC content is the percentage of guanine (G) and cytosine (C) bases in a DNA sequence. It affects DNA stability, melting temperature, and can indicate coding regions. Typical ranges: Bacteria (30-70%), Mammals (~40-45%). ';
        if (avgGC > 0) {
            response += `Your sequences have ${avgGC.toFixed(1)}% GC content, which is ${avgGC < 40 ? 'low (AT-rich)' : avgGC > 60 ? 'high' : 'moderate'}.`;
        }
        return response;
    }
    
    // Codon and amino acid related queries
    if (msg.includes('codon') || msg.includes('amino acid') || msg.includes('translation') || msg.includes('triplet')) {
        if (sequences.length > 0) {
            const firstSeq = sequences[0];
            const codonStats = firstSeq.codonStats;
            const codonFreq = firstSeq.codonFrequency;
            
            if (codonStats && codonStats.totalCodons > 0) {
                // Get top 3 codons
                const topCodons = codonFreq ? Object.entries(codonFreq)
                    .sort((a, b) => b[1].count - a[1].count)
                    .slice(0, 3)
                    .map(([codon, data]) => `${codon} → ${data.symbol} (${data.count})`)
                    .join(', ') : '';
                
                let response = `🧬 **Codon Analysis for "${firstSeq.sequenceName || 'Sequence 1'}":**\n\n`;
                response += `• Total Codons: ${codonStats.totalCodons}\n`;
                response += `• Unique Codons Used: ${codonStats.uniqueCodons}/64\n`;
                response += `• Start Codons (ATG): ${codonStats.startCodons}\n`;
                response += `• Stop Codons: ${codonStats.stopCodons}\n\n`;
                
                if (topCodons) {
                    response += `**Most Frequent:** ${topCodons}\n\n`;
                }
                
                response += `*Codons are 3-nucleotide sequences that code for amino acids. The genetic code uses 64 codons to specify 20 amino acids plus stop signals.*\n\n`;
                response += `💡 **Tip:** Ask me to "show codon chart" for a visual breakdown!`;
                
                return response;
            }
        }
        
        // General codon information
        return `🧬 **About Codons:**

Codons are triplets of nucleotides that specify amino acids during protein synthesis. Key facts:

• **64 possible codons** encode for 20 amino acids + 3 stop signals
• **Start codon:** ATG (Methionine) - initiates translation
• **Stop codons:** TAA, TAG, TGA - terminate translation
• **Degeneracy:** Multiple codons can code for the same amino acid

**Codon Bias:** Different organisms prefer certain codons over others, which affects gene expression efficiency.

${sequences.length > 0 ? '💡 Upload sequences to see their codon frequency analysis!' : '📁 Upload a FASTA file to analyze codon usage!'}`;
    }
    
    if (msg.includes('next') || msg.includes('what should') || msg.includes('recommend')) {
        if (context.currentView === 'upload') {
            return 'Upload your FASTA file to begin analysis. Once uploaded, you can view detailed metadata, generate reports, and compare sequences.';
        } else if (sequences.length > 0) {
            return 'Based on your sequences, I recommend: 1) Check the Metadata page for detailed statistics, 2) Generate a comprehensive PDF report with AI analysis, 3) Use BLAST to identify similar sequences, 4) Analyze ORFs for potential proteins. Would you like details on any of these?';
        }
        return 'Start by uploading a FASTA file with your DNA sequences.';
    }

    if (msg.includes('quality') || msg.includes('good') || msg.includes('bad')) {
        return 'Sequence quality can be assessed by several factors: 1) Balanced nucleotide distribution, 2) Appropriate GC content for the organism, 3) Absence of unusual patterns or repeats, 4) Presence of expected features like ORFs. Would you like me to analyze the quality of your sequences?';
    }

    // Protein structure and PDB queries - with actual API call
    if (msg.includes('protein') || msg.includes('structure') || msg.includes('pdb') || msg.includes('3d') || msg.includes('fold')) {
        // Check if user is searching for a protein by name
        const searchMatch = msg.match(/(?:find|search|look for|show)\s+(.+?)(?:\s+structure|\s+protein|$)/i);
        if (searchMatch && searchMatch[1]) {
            // Return a promise indicator - caller should handle async
            return {
                type: 'pdb_search',
                query: searchMatch[1].trim(),
                message: `🔍 Searching RCSB PDB for "${searchMatch[1].trim()}"...`
            };
        }
        
        return `🔬 **RCSB Protein Data Bank Integration**

I can search the RCSB PDB for protein structures! Try:

• **Look up by ID:** "Tell me about 1HHO" or "What is 4HHB?"
• **Search by name:** "Find hemoglobin structures" or "Search insulin"
• **Learn about proteins:** "What proteins does my sequence encode?"

${sequences.length > 0 ? '💡 Your sequences contain ORFs that may encode proteins. Would you like me to help translate them?' : '📁 Upload a FASTA file to analyze potential protein-coding regions.'}`;
    }

    if (msg.includes('help') || msg.includes('what can')) {
        return `I can help you with:
    
• Understanding sequence analysis results
• Explaining genetic terms (ORF, GC content, etc.)
• Interpreting charts and statistics
• Identifying species and sequence types (DNA/RNA/protein)
• **🔬 Protein structure lookup via RCSB PDB** (try "Find hemoglobin")
• Suggesting next steps in your analysis
• Answering questions about your uploaded sequences

Just ask me anything about DNA sequence analysis!`;
    }

    if (msg.includes('fasta')) {
        return 'FASTA is a text-based format for representing nucleotide or protein sequences. Each sequence begins with a ">" character followed by a description line (header), then the sequence data on subsequent lines. It\'s one of the most widely used formats in bioinformatics.';
    }

    // Check for PDB ID pattern (e.g., 1HHO, 4HHB) - return indicator for async lookup
    const pdbIdMatch = msg.match(/\b([0-9][a-z0-9]{3})\b/i);
    if (pdbIdMatch) {
        return {
            type: 'pdb_lookup',
            pdbId: pdbIdMatch[1].toUpperCase(),
            message: `🔍 Looking up PDB structure ${pdbIdMatch[1].toUpperCase()}...`
        };
    }

    return `I'm here to help with DNA sequence analysis! ${sequences.length ? `You currently have ${sequences.length} sequences loaded with an average GC content of ${(sequences.reduce((sum, s) => sum + (s.gcPercentage || s.gcContent || 0), 0) / sequences.length).toFixed(1)}%.` : 'Upload a FASTA file to get started.'} Feel free to ask me about species identification, sequence types, ORFs, GC content, protein structures (RCSB PDB), or any other bioinformatics concepts.`;
}
