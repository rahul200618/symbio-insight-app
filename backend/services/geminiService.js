const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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
 * @param {Object} context -Conversation context
 * @returns {Promise<string>} AI-generated response
 */
async function generateChatbotResponse(userMessage, context = {}) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY not configured');
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

        let contextInfo = '';
        if (context.sequences && context.sequences.length > 0) {
            contextInfo = `\n\n**User has ${context.sequences.length} sequence(s) uploaded.**`;
        }

        const prompt = `You are a helpful DNA/RNA sequence analysis assistant. Answer concisely (2-4 sentences).

**User Question:** ${userMessage}
${contextInfo}`;

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
