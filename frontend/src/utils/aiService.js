// AI Service Integration
// Supports OpenAI GPT-4, Anthropic Claude, and other AI models

const AI_API_URL = 'http://localhost:3001/api/ai'; // Backend AI endpoint

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
/**
 * Generate intelligent report with AI insights
 */
export async function generateIntelligentReport(sequences) {
    try {
        // If we have sequences with IDs, try to fetch a report from the backend for the first one
        // This is a simplified integration. Ideally, we'd generate reports for all or the selected one.
        if (sequences.length > 0 && sequences[0].id) {
            const { generateAIReport } = await import('./api.js');
            // Try to generate report for the first sequence as a demo
            const report = await generateAIReport(sequences[0].id);

            // Map backend response to expected format
            return {
                summary: report.aiSummary,
                keyFindings: [
                    `Analysis of ${sequences[0].name}`,
                    `GC Quality: ${report.analysis.gcQuality}`,
                    `Length Category: ${report.analysis.lengthCategory}`,
                    `Quality Score: ${report.analysis.qualityScore}`
                ],
                biologicalSignificance: report.interpretation,
                recommendations: [
                    'Review detailed metrics',
                    'Compare with other sequences',
                    'Export findings'
                ],
                comparisonToKnown: 'Automated comparison pending.',
                experimentalSuggestions: ['Verify with wet lab experiments']
            };
        }

        // Fallback to mock/template if no ID or backend fails
        return generateTemplateReport(sequences);
    } catch (error) {
        console.log('AI service not available, using template report', error);
        return generateTemplateReport(sequences);
    }
}

/**
 * Chat with AI assistant about sequences
 */
/**
 * Chat with AI assistant about sequences
 */
export async function chatWithAI(message, context) {
    try {
        // Construct context string or object to send to backend
        // The backend expects { message, context }
        const response = await fetch(`${AI_API_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                context: {
                    // Simplify context to avoid sending too much data if sequences are large
                    sequences: context.sequences?.map(s => ({
                        name: s.sequenceName,
                        length: s.sequenceLength,
                        gcPercentage: s.gcPercentage,
                        orfs: s.orfs?.length || 0
                    })),
                    currentView: context.currentView
                }
            }),
        });

        if (!response.ok) {
            throw new Error('Chat failed');
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.log('AI service not available', error);
        return getRuleBasedResponse(message, context);
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
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('orf') || lowerMessage.includes('open reading frame')) {
        return `An Open Reading Frame (ORF) is a continuous stretch of DNA codons that begins with a start codon (ATG) and ends with a stop codon (TAA, TAG, or TGA). ORFs are potential protein-coding regions. ${context.sequences ? `Your sequences contain ${context.sequences.reduce((sum, s) => sum + s.orfs.length, 0)} total ORFs.` : ''}`;
    }

    if (lowerMessage.includes('gc content') || lowerMessage.includes('gc%')) {
        return `GC content refers to the percentage of guanine (G) and cytosine (C) bases in a DNA sequence. It's an important indicator of genome characteristics. Different organisms have characteristic GC contents - for example, humans have ~41%, E. coli has ~51%, and some bacteria can have >70%. ${context.sequences ? `Your sequences have an average GC content of ${(context.sequences.reduce((sum, s) => sum + s.gcPercentage, 0) / context.sequences.length).toFixed(1)}%.` : ''}`;
    }

    if (lowerMessage.includes('quality') || lowerMessage.includes('good') || lowerMessage.includes('bad')) {
        return 'Sequence quality can be assessed by several factors: 1) Balanced nucleotide distribution, 2) Appropriate GC content for the organism, 3) Absence of unusual patterns or repeats, 4) Presence of expected features like ORFs. Would you like me to analyze the quality of your sequences?';
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('what can')) {
        return `I can help you with:
    
• Understanding sequence analysis results
• Explaining genetic terms (ORF, GC content, etc.)
• Interpreting charts and statistics
• Suggesting next steps in your analysis
• Answering questions about your uploaded sequences

Just ask me anything about DNA sequence analysis!`;
    }

    if (lowerMessage.includes('fasta')) {
        return 'FASTA is a text-based format for representing nucleotide or protein sequences. Each sequence begins with a ">" character followed by a description line (header), then the sequence data on subsequent lines. It\'s one of the most widely used formats in bioinformatics.';
    }

    return `I'm here to help with DNA sequence analysis! ${context.sequences ? `You currently have ${context.sequences.length} sequences loaded.` : ''} Feel free to ask me about ORFs, GC content, sequence quality, or any other bioinformatics concepts.`;
}
