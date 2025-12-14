const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Fetch data from RCSB PDB API for protein/structure information
 * @param {string} query - Search query or PDB ID
 * @returns {Promise<Object|null>} RCSB data or null
 */
async function fetchRCSBData(query) {
    try {
        // Check if it's a PDB ID (4 characters, alphanumeric)
        const pdbIdMatch = query.match(/\b([0-9][A-Za-z0-9]{3})\b/);
        
        if (pdbIdMatch) {
            // Direct PDB ID lookup
            const pdbId = pdbIdMatch[1].toUpperCase();
            const response = await fetch(`https://data.rcsb.org/rest/v1/core/entry/${pdbId}`);
            
            if (response.ok) {
                const data = await response.json();
                return {
                    type: 'entry',
                    pdbId: pdbId,
                    title: data.struct?.title,
                    organism: data.rcsb_entry_info?.polymer_entity_count_protein ? 'Protein structure' : 'Structure',
                    method: data.exptl?.[0]?.method,
                    resolution: data.rcsb_entry_info?.resolution_combined?.[0],
                    releaseDate: data.rcsb_accession_info?.initial_release_date,
                    url: `https://www.rcsb.org/structure/${pdbId}`
                };
            }
        }
        
        // Text search for proteins/structures
        const searchQuery = encodeURIComponent(query);
        const searchResponse = await fetch(`https://search.rcsb.org/rcsbsearch/v2/query?json=${JSON.stringify({
            query: {
                type: "terminal",
                service: "full_text",
                parameters: { value: query }
            },
            return_type: "entry",
            request_options: { results_content_type: ["experimental"], paginate: { start: 0, rows: 3 } }
        })}`);
        
        if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            if (searchData.result_set && searchData.result_set.length > 0) {
                const results = searchData.result_set.slice(0, 3).map(r => ({
                    pdbId: r.identifier,
                    score: r.score,
                    url: `https://www.rcsb.org/structure/${r.identifier}`
                }));
                return { type: 'search', results, totalCount: searchData.total_count };
            }
        }
        
        return null;
    } catch (error) {
        console.error('RCSB API Error:', error.message);
        return null;
    }
}

/**
 * Generate AI-powered sequence analysis summary
 * @param {Object} sequenceData - Sequence statistics and information
 * @returns {Promise<Object>} AI-generated analysis
 */
async function generateSequenceAnalysisSummary(sequenceData) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY not configured');
        }

        console.log('Initializing Gemini 2.5 Flash Lite model...');
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

        const prompt = `You are a bioinformatics expert analyzing DNA/RNA sequence data. Provide a professional analysis based on these statistics:

**Sequence Information:**
- Total Sequences: ${sequenceData.totalSequences}
- Average Length: ${sequenceData.avgLength} bp
- GC Content: ${sequenceData.gcContent}%
- Total ORFs: ${sequenceData.totalORFs}

Provide your analysis in exactly this JSON format (no markdown, just JSON):
{
  "qualityAssessment": "2-3 sentence evaluation of sequence quality",
  "compositionAnalysis": "2-3 sentence interpretation of GC content and nucleotide distribution",
  "orfAnalysis": "2-3 sentence analysis of the ORF findings",
  "recommendations": "2-3 sentence suggestions for next steps"
}`;

        console.log('Sending request to Gemini API...');
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('Gemini response received, length:', text.length);
        console.log('First 200 chars:', text.substring(0, 200));

        // Clean and parse JSON
        let jsonText = text.trim();
        // Remove markdown code blocks
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/```\s*$/, '');
        jsonText = jsonText.replace(/^```\s*/, '').replace(/```\s*$/, '');

        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            console.log('✅ Successfully parsed Gemini response');
            return parsed;
        }

        // Fallback
        console.warn('⚠️ Could not parse JSON, using fallback');
        return {
            qualityAssessment: text.substring(0, 250),
            compositionAnalysis: 'Analysis available in quality assessment.',
            orfAnalysis: 'ORF information available in quality assessment.',
            recommendations: 'Perform BLAST searches and functional annotation.'
        };

    } catch (error) {
        console.error('❌ Gemini API Error:', error.message);
        console.error('Error details:', error);
        throw error;
    }
}

/**
 * Generate chatbot response using Gemini AI
 * @param {string} userMessage - User's message
 * @param {Object} context - Conversation context with sequence data
 * @returns {Promise<string>} AI-generated response
 */
async function generateChatbotResponse(userMessage, context = {}) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY not configured');
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

        // Check if user is asking about proteins, structures, or PDB
        const lowerMessage = userMessage.toLowerCase();
        const needsRCSB = lowerMessage.includes('protein') || 
                          lowerMessage.includes('structure') || 
                          lowerMessage.includes('pdb') ||
                          lowerMessage.includes('3d') ||
                          lowerMessage.includes('fold') ||
                          lowerMessage.includes('crystal') ||
                          lowerMessage.match(/\b[0-9][a-z0-9]{3}\b/i); // PDB ID pattern
        
        let rcsbInfo = '';
        if (needsRCSB) {
            console.log('Fetching RCSB data for query:', userMessage);
            const rcsbData = await fetchRCSBData(userMessage);
            
            if (rcsbData) {
                if (rcsbData.type === 'entry') {
                    rcsbInfo = `\n\n**RCSB PDB Data Found:**
- PDB ID: ${rcsbData.pdbId}
- Title: ${rcsbData.title}
- Method: ${rcsbData.method}
${rcsbData.resolution ? `- Resolution: ${rcsbData.resolution} Å` : ''}
- URL: ${rcsbData.url}`;
                } else if (rcsbData.type === 'search' && rcsbData.results.length > 0) {
                    const resultsList = rcsbData.results.map(r => `  - ${r.pdbId}: ${r.url}`).join('\n');
                    rcsbInfo = `\n\n**RCSB PDB Search Results (${rcsbData.totalCount} total):**
${resultsList}`;
                }
            }
        }

        let contextInfo = '';
        
        if (context.hasSequences && context.sequences) {
            const seqSummary = context.sequences.map((s, i) => 
                `  ${i+1}. ${s.name || 'Sequence'}: ${s.length}bp, GC: ${s.gcContent?.toFixed(1)}%, ORFs: ${s.orfs || 0}`
            ).join('\n');
            
            contextInfo = `\n\n**User's Current Data:**
- ${context.sequenceCount} sequence(s) uploaded
- Current View: ${context.currentView}
${seqSummary}
${context.avgStats ? `
- Average Length: ${context.avgStats.avgLength.toFixed(0)} bp
- Average GC: ${context.avgStats.avgGC.toFixed(1)}%
- Total ORFs: ${context.avgStats.totalORFs}` : ''}`;
        }

        const prompt = `You are an expert bioinformatics assistant specializing in DNA/RNA sequence analysis and protein structures. You help users understand their genetic data, identify species, determine sequence types, and guide them through analysis workflows.

**Species Identification Guide (based on GC content):**
- <30% GC: Plasmodium (malaria), Mycoplasma, AT-rich parasites
- 30-40% GC: Bacillus subtilis, Staphylococcus, mammalian mitochondria
- 40-50% GC: E. coli, Saccharomyces cerevisiae (yeast), human genomic DNA
- 50-60% GC: Pseudomonas, Drosophila, plant chloroplast
- 60-70% GC: Streptomyces, Actinobacteria (high-GC Gram-positive)
- >70% GC: Thermus thermophilus, thermophiles

**Instructions:**
- Provide clear, concise responses (2-5 sentences)
- When asked about species or "what organism", analyze GC content and suggest likely species with confidence level
- Include genome type classification (prokaryotic, eukaryotic, viral, organelle)
- When asked about sequence type (DNA/RNA/protein), analyze nucleotide composition
- When discussing proteins or structures, reference RCSB PDB data if available
- Include relevant RCSB PDB links when discussing protein structures
- Provide actionable next steps when appropriate
- Be friendly and educational
${rcsbInfo}

**User Question:** ${userMessage}
${contextInfo}

**Your Response:**`;

        console.log('Chatbot request to Gemini...');
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('✅ Chatbot response received');
        return text;

    } catch (error) {
        console.error('❌ Gemini Chatbot Error:', error.message);
        throw error;
    }
}

module.exports = {
    generateSequenceAnalysisSummary,
    generateChatbotResponse
};
