const express = require('express');
const router = express.Router();
const multer = require('multer');
const bioPythonParser = require('../services/bioPythonParser');
const Sequence = require('../models/Sequence');
const { validateFasta } = require('../middleware/validation');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Helper function to retry database operations on SQLITE_BUSY
const withRetry = async (operation, maxRetries = 5, delay = 500) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (error.message && error.message.includes('SQLITE_BUSY') && attempt < maxRetries) {
        console.log(`Database busy, retrying (attempt ${attempt}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
        continue;
      }
      throw error;
    }
  }
};

/**
 * Check BioPython installation status
 */
router.get('/check', async (req, res) => {
  try {
    const status = await bioPythonParser.checkDependencies();
    res.json(status);
  } catch (error) {
    res.status(500).json({
      installed: false,
      message: 'Failed to check BioPython status',
      error: error.message
    });
  }
});

/**
 * Parse FASTA file using BioPython
 * POST /api/biopython/parse
 */
router.post('/parse', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileContent = req.file.buffer.toString('utf8');
    
    // Parse using BioPython
    const sequences = await bioPythonParser.parseFastaContent(fileContent);
    
    res.json({
      success: true,
      sequences,
      count: Array.isArray(sequences) ? sequences.length : 0,
      parser: 'BioPython'
    });

  } catch (error) {
    console.error('BioPython parsing error:', error);
    res.status(500).json({
      error: 'Failed to parse FASTA file with BioPython',
      message: error.message,
      suggestion: 'Make sure BioPython is installed: pip install -r requirements.txt'
    });
  }
});

/**
 * Upload and save FASTA file using BioPython parser
 * POST /api/biopython/upload
 */
router.post('/upload', upload.single('file'), validateFasta, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileContent = req.file.buffer.toString('utf8');
    const filename = req.file.originalname;
    
    // Parse using BioPython
    const sequences = await bioPythonParser.parseFastaContent(fileContent);
    
    if (!Array.isArray(sequences) || sequences.length === 0) {
      return res.status(400).json({
        error: 'No valid sequences found in FASTA file'
      });
    }

    // Save each sequence to database
    const savedSequences = [];
    
    for (const seqData of sequences) {
      const sequenceRecord = {
        name: seqData.sequenceName || seqData.id,
        header: seqData.description || seqData.sequenceName,
        sequence: seqData.rawSequence.substring(0, 50000), // Limit stored sequence
        length: seqData.sequenceLength,
        gcContent: seqData.gcPercentage,
        orfDetected: seqData.orfs && seqData.orfs.length > 0,
        orfCount: seqData.orfs ? seqData.orfs.length : 0,
        orfs: seqData.orfs || [],
        nucleotideCounts: seqData.nucleotideCounts,
        filename: filename,
        metrics: {
          length: seqData.sequenceLength,
          gcContent: seqData.gcPercentage,
          orfDetected: seqData.orfs && seqData.orfs.length > 0,
          orfCount: seqData.orfs ? seqData.orfs.length : 0,
          molecularWeight: seqData.molecularWeight,
          sequenceType: seqData.sequenceType
        },
        codonFrequency: seqData.codonFrequency,
        codonStats: seqData.codonStats,
        parsedWith: 'BioPython'
      };

      const savedSeq = await withRetry(() => Sequence.create(sequenceRecord));
      savedSequences.push(savedSeq);
    }

    res.status(201).json({
      success: true,
      message: `Successfully uploaded and parsed ${savedSequences.length} sequence(s) using BioPython`,
      sequences: savedSequences,
      count: savedSequences.length,
      parser: 'BioPython'
    });

  } catch (error) {
    console.error('BioPython upload error:', error);
    res.status(500).json({
      error: 'Failed to process FASTA file with BioPython',
      message: error.message,
      suggestion: 'Make sure BioPython is installed: pip install -r requirements.txt'
    });
  }
});

/**
 * Parse FASTA content from text
 * POST /api/biopython/parse-text
 */
router.post('/parse-text', async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'FASTA content is required' });
    }

    // Parse using BioPython
    const sequences = await bioPythonParser.parseFastaContent(content);
    
    res.json({
      success: true,
      sequences,
      count: Array.isArray(sequences) ? sequences.length : 0,
      parser: 'BioPython'
    });

  } catch (error) {
    console.error('BioPython text parsing error:', error);
    res.status(500).json({
      error: 'Failed to parse FASTA content with BioPython',
      message: error.message
    });
  }
});

module.exports = router;
