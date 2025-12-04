const express = require('express');
const router = express.Router();

// Mock AI Service for demo purposes
// In a real app, this would call OpenAI/Anthropic APIs

router.post('/chat', async (req, res) => {
    try {
        const { message, context } = req.body;

        // Simple rule-based responses for the demo
        let response = "I'm analyzing your request...";
        const lowerMsg = message.toLowerCase();

        if (lowerMsg.includes('orf')) {
            response = "Open Reading Frames (ORFs) are sequences of DNA that can potentially be translated into proteins. They start with a start codon (ATG) and end with a stop codon.";
            if (context?.sequences) {
                const totalORFs = context.sequences.reduce((sum, s) => sum + (s.orfs?.length || 0), 0);
                response += ` I found ${totalORFs} ORFs in your current sequences.`;
            }
        } else if (lowerMsg.includes('gc') || lowerMsg.includes('content')) {
            response = "GC content is the percentage of nitrogenous bases in a DNA or RNA molecule that are either guanine or cytosine. High GC content can indicate stability at high temperatures.";
            if (context?.sequences) {
                const avgGC = context.sequences.reduce((sum, s) => sum + (s.gcPercentage || s.gcContent || 0), 0) / context.sequences.length;
                response += ` Your sequences have an average GC content of ${avgGC.toFixed(1)}%.`;
            }
        } else if (lowerMsg.includes('quality')) {
            response = "Sequence quality is assessed by looking at read length, ambiguity codes, and coverage. Your uploaded sequences appear to be high-quality FASTA reads with clear base calls.";
        } else {
            response = "That's an interesting question about DNA analysis. Based on the sequences you've uploaded, I can help you identify potential genes, analyze composition, or compare sequences. Try asking about 'ORFs', 'GC content', or 'sequence length'.";
        }

        // Simulate network delay
        setTimeout(() => {
            res.json({ response });
        }, 1000);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/annotate', async (req, res) => {
    try {
        const { sequence } = req.body;
        // Mock annotation
        res.json({
            sequenceName: req.body.sequenceName,
            predictedFunction: 'Putative DNA-binding protein',
            confidence: 0.85,
            proteinFamily: 'Helix-turn-helix',
            domains: ['HTH_1', 'DNA_bind'],
            goTerms: ['GO:0003677', 'GO:0006355']
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/quality', async (req, res) => {
    try {
        // Mock quality check
        res.json({
            overallScore: 92,
            issues: [],
            recommendations: ['Sequence quality is good for downstream analysis']
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/report', async (req, res) => {
    try {
        const { sequences } = req.body;
        // Mock report generation
        res.json({
            summary: `Analysis of ${sequences.length} sequences completed successfully.`,
            keyFindings: [
                'High GC content observed in 2 sequences',
                'Multiple ORFs detected',
                'No significant contamination found'
            ],
            biologicalSignificance: 'The sequences show characteristics typical of prokaryotic coding regions.',
            recommendations: ['Proceed with BLAST alignment', 'Verify ORFs experimentally']
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
