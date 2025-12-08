const express = require('express');
const router = express.Router();
const { generateSequenceAnalysisSummary, generateChatbotResponse } = require('../services/geminiService');

/**
 * POST /api/ai/analyze-sequence
 * Generate AI-powered sequence analysis summary
 */
router.post('/analyze-sequence', async (req, res) => {
    try {
        const sequenceData = req.body;

        // Validate input
        if (!sequenceData || !sequenceData.totalSequences) {
            return res.status(400).json({
                error: 'Invalid sequence data. Required fields: totalSequences, avgLength, gcContent, etc.'
            });
        }

        // Generate AI summary
        const aiSummary = await generateSequenceAnalysisSummary(sequenceData);

        res.json({
            success: true,
            summary: aiSummary,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('AI Analysis Error:', error);

        // Handle missing API key gracefully
        if (error.message.includes('GEMINI_API_KEY')) {
            return res.status(503).json({
                error: 'AI service not configured. Please add GEMINI_API_KEY to environment variables.',
                fallback: true
            });
        }

        res.status(500).json({
            error: 'Failed to generate AI analysis',
            message: error.message,
            fallback: true
        });
    }
});

/**
 * POST /api/ai/chat
 * Generate chatbot response using Gemini AI
 */
router.post('/chat', async (req, res) => {
    try {
        const { message, context } = req.body;

        // Validate input
        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                error: 'Message is required and must be a string'
            });
        }

        // Generate AI response
        const aiResponse = await generateChatbotResponse(message, context || {});

        res.json({
            success: true,
            response: aiResponse,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('AI Chat Error:', error);

        // Handle missing API key gracefully
        if (error.message.includes('GEMINI_API_KEY')) {
            return res.status(503).json({
                error: 'AI chatbot not configured. Please add GEMINI_API_KEY to environment variables.',
                fallback: true
            });
        }

        res.status(500).json({
            error: 'Failed to generate chatbot response',
            message: error.message,
            fallback: true
        });
    }
});

/**
 * GET /api/ai/health
 * Check if AI service is available
 */
router.get('/health', (req, res) => {
    const isConfigured = !!process.env.GEMINI_API_KEY;

    res.json({
        configured: isConfigured,
        status: isConfigured ? 'ready' : 'not_configured',
        message: isConfigured
            ? 'Gemini AI service is configured and ready'
            : 'GEMINI_API_KEY not found in environment variables'
    });
});

module.exports = router;
