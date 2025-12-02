const express = require('express');
const router = express.Router();
const Sequence = require('../models/Sequence');
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Simple FASTA parser
function parseFastaToMetadata(fasta) {
  const lines = fasta.split(/\r?\n/).filter(Boolean);
  let header = '';
  let name = 'Sequence';
  let seq = '';
  
  for (const line of lines) {
    if (line.startsWith('>')) {
      header = line.replace(/^>\s*/, '').trim();
      name = header.split(/\s+/)[0];
    } else {
      seq += line.trim();
    }
  }
  
  const length = seq.length;
  const a = seq.replace(/[^Aa]/g, '').length;
  const t = seq.replace(/[^Tt]/g, '').length;
  const g = seq.replace(/[^Gg]/g, '').length;
  const c = seq.replace(/[^Cc]/g, '').length;
  const gc = g + c;
  const gcContent = length ? Math.round((gc / length) * 100 * 10) / 10 : 0;
  const orfDetected = detectORF(seq);
  
  return {
    name,
    header,
    sequence: seq,
    length,
    gcContent,
    orfDetected,
    nucleotideCounts: { A: a, T: t, G: g, C: c },
    filename: `${name}.fasta`,
    metrics: {
      length,
      gcContent,
      orfDetected
    }
  };
}

// Simple ORF detection
function detectORF(seq) {
  const startCodon = 'ATG';
  const stopCodons = ['TAA', 'TAG', 'TGA'];
  const seqUpper = seq.toUpperCase();
  
  if (!seqUpper.includes(startCodon)) return false;
  
  for (let i = 0; i < seqUpper.length - 2; i += 3) {
    if (seqUpper.substring(i, i + 3) === startCodon) {
      for (let j = i + 3; j < seqUpper.length - 2; j += 3) {
        if (stopCodons.includes(seqUpper.substring(j, j + 3))) {
          return true;
        }
      }
    }
  }
  return false;
}

// GET all sequences with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const sort = req.query.sort || '-createdAt';
    
    const skip = (page - 1) * limit;
    const list = await Sequence.find().sort(sort).skip(skip).limit(limit);
    const total = await Sequence.countDocuments();
    
    res.json({
      data: list.map((d) => ({
        id: d._id.toString(),
        filename: d.filename,
        header: d.header,
        length: d.length,
        gcPercent: d.gcContent,
        orfDetected: d.orfDetected,
        nucleotideCounts: d.nucleotideCounts,
        createdAt: d.createdAt
      })),
      meta: {
        page,
        limit,
        total
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new sequence via JSON body
router.post('/', async (req, res) => {
  try {
    const { fasta } = req.body || {};
    if (!fasta || typeof fasta !== 'string') {
      return res.status(400).json({ error: 'fasta string required' });
    }
    const meta = parseFastaToMetadata(fasta);
    const doc = await Sequence.create(meta);
    res.status(201).json([
      {
        id: doc._id.toString(),
        filename: doc.filename,
        header: doc.header,
        length: doc.length,
        gcPercent: doc.gcContent,
        orfDetected: doc.orfDetected,
        nucleotideCounts: doc.nucleotideCounts,
        createdAt: doc.createdAt
      }
    ]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST upload FASTA file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const fileContent = req.file.buffer.toString('utf-8');
    const meta = parseFastaToMetadata(fileContent);
    meta.filename = req.file.originalname;
    
    const doc = await Sequence.create(meta);
    
    res.status(201).json({
      id: doc._id.toString(),
      filename: doc.filename,
      header: doc.header,
      length: doc.length,
      gcPercent: doc.gcContent,
      orfDetected: doc.orfDetected,
      nucleotideCounts: doc.nucleotideCounts,
      createdAt: doc.createdAt
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET sequence by ID
router.get('/:id', async (req, res) => {
  try {
    const doc = await Sequence.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Sequence not found' });
    }
    res.json({
      id: doc._id.toString(),
      title: doc.title || doc.name,
      metrics: doc.metrics || {
        length: doc.length,
        gcContent: doc.gcContent,
        orfDetected: doc.orfDetected
      },
      sequence: doc.sequence,
      interpretation: doc.interpretation,
      aiSummary: doc.aiSummary,
      nucleotideCounts: doc.nucleotideCounts,
      createdAt: doc.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET sequence report by ID
router.get('/:id/report', async (req, res) => {
  try {
    const doc = await Sequence.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Sequence not found' });
    }
    
    res.json({
      id: doc._id.toString(),
      aiSummary: doc.aiSummary || 'Generated human-readable summary',
      interpretation: doc.interpretation || 'Short textual interpretation'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST generate AI report
router.post('/:id/generate-report', async (req, res) => {
  try {
    const { options } = req.body || {};
    const lengthThreshold = options?.length_threshold || 1000;
    
    const doc = await Sequence.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Sequence not found' });
    }
    
    // Generate a simple report (in production, integrate with AI service)
    const aiSummary = `Generated human-readable summary for sequence ${doc.name}`;
    
    doc.aiSummary = aiSummary;
    doc.cached = false;
    await doc.save();
    
    res.status(202).json({
      message: 'Report generation initiated',
      id: doc._id.toString(),
      aiSummary
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE sequence
router.delete('/:id', async (req, res) => {
  try {
    const doc = await Sequence.findByIdAndDelete(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Sequence not found' });
    }
    res.json({ message: 'Deleted', id: doc._id.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update sequence metadata
router.put('/:id', async (req, res) => {
  try {
    const { filename, header, metadata } = req.body || {};
    
    const doc = await Sequence.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Sequence not found' });
    }
    
    if (filename) doc.filename = filename;
    if (header) doc.header = header;
    if (metadata) {
      doc.name = metadata['user_note'] || doc.name;
    }
    
    doc.updatedAt = new Date();
    await doc.save();
    
    res.json({
      id: doc._id.toString(),
      filename: doc.filename,
      header: doc.header,
      updatedAt: doc.updatedAt
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET metadata only
router.get('/:id/metadata', async (req, res) => {
  try {
    const doc = await Sequence.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Sequence not found' });
    }
    
    res.json({
      status: 'ok',
      time: new Date().toISOString(),
      id: doc._id.toString()
    });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

module.exports = router;