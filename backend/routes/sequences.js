const express = require('express');
const { spawnSync } = require('child_process');
const path = require('path');
require('dotenv').config();
const router = express.Router();
const STORAGE_MODE = process.env.STORAGE_MODE || 'sqlite';
const Sequence = STORAGE_MODE === 'atlas' ? null : require('../models/Sequence');
const SequenceMongo = STORAGE_MODE === 'atlas' ? require('../models/SequenceMongo') : null;
const mongoose = STORAGE_MODE === 'atlas' ? require('mongoose') : undefined;
const { Op } = require('sequelize');
const multer = require('multer');
const { generatePDFReport } = require('../utils/pdfGenerator');
const {
  validateFasta,
  validatePagination,
  validateMongoId,
  validateBulkDelete
} = require('../middleware/validation');

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

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Parser selection logic
const FASTA_PARSER = process.env.FASTA_PARSER || 'js';

function parseFastaToMetadata(fasta) {
  if (FASTA_PARSER === 'biopython') {
    // Write FASTA to temp file
    const fs = require('fs');
    const os = require('os');
    const tmpPath = path.join(os.tmpdir(), `fasta_${Date.now()}.fasta`);
    fs.writeFileSync(tmpPath, fasta, 'utf-8');
    // Call Python script
    const pyPath = path.join(__dirname, '../utils/biopython_fasta_parser.py');
    const result = spawnSync('python', [pyPath, tmpPath], { encoding: 'utf-8' });
    fs.unlinkSync(tmpPath);
    if (result.error) throw new Error('Biopython parser failed: ' + result.error.message);
    if (result.status !== 0) throw new Error('Biopython parser error: ' + result.stderr);
    try {
      const parsed = JSON.parse(result.stdout);
      // Return in compatible format (minimal, for now)
      if (!parsed.length) return {
        name: 'Empty', header: '', sequence: '', length: 0, gcContent: 0, orfDetected: false, orfCount: 0, orfs: [], nucleotideCounts: { A: 0, T: 0, G: 0, C: 0 }, filename: 'empty.fasta', metrics: { length: 0, gcContent: 0, orfDetected: false, orfCount: 0 }, sequences: [], sequenceCount: 0
      };
      // Only basic fields from Biopython, rest can be extended
      const seqs = parsed.map(s => ({
        name: s.id,
        header: s.description,
        sequence: s.sequence,
        length: s.sequence.length,
        gcContent: 0,
        orfDetected: false,
        orfCount: 0,
        orfs: [],
        nucleotideCounts: { A: 0, T: 0, G: 0, C: 0 }
      }));
      const totalLength = seqs.reduce((sum, s) => sum + s.length, 0);
      return {
        name: seqs[0].name,
        header: seqs[0].header,
        sequence: seqs.map(s => s.sequence).join(''),
        length: totalLength,
        gcContent: 0,
        orfDetected: false,
        orfCount: 0,
        orfs: [],
        nucleotideCounts: { A: 0, T: 0, G: 0, C: 0 },
        filename: `${seqs[0].name}.fasta`,
        metrics: { length: totalLength, gcContent: 0, orfDetected: false, orfCount: 0 },
        sequences: seqs,
        sequenceCount: seqs.length
      };
    } catch (e) {
      throw new Error('Failed to parse Biopython output: ' + e.message);
    }
  } else {
    // ...existing code...
    const lines = fasta.split(/\r?\n/);
    const sequences = [];
    let currentHeader = '';
    let currentSeq = '';
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('>')) {
        if (currentHeader && currentSeq) {
          sequences.push(createSequenceMetadata(currentHeader, currentSeq));
        }
        currentHeader = trimmedLine.replace(/^>\s*/, '').trim();
        currentSeq = '';
      } else if (trimmedLine.length > 0) {
        currentSeq += trimmedLine.toUpperCase();
      }
    }
    if (currentHeader && currentSeq) {
      sequences.push(createSequenceMetadata(currentHeader, currentSeq));
    }
    if (sequences.length === 0) {
      return {
        name: 'Empty', header: '', sequence: '', length: 0, gcContent: 0, orfDetected: false, orfCount: 0, orfs: [], nucleotideCounts: { A: 0, T: 0, G: 0, C: 0 }, filename: 'empty.fasta', metrics: { length: 0, gcContent: 0, orfDetected: false, orfCount: 0 }, sequences: [], sequenceCount: 0
      };
    }
    const totalLength = sequences.reduce((sum, s) => sum + s.length, 0);
    const totalA = sequences.reduce((sum, s) => sum + s.nucleotideCounts.A, 0);
    const totalT = sequences.reduce((sum, s) => sum + s.nucleotideCounts.T, 0);
    const totalG = sequences.reduce((sum, s) => sum + s.nucleotideCounts.G, 0);
    const totalC = sequences.reduce((sum, s) => sum + s.nucleotideCounts.C, 0);
    const totalOrfs = sequences.reduce((sum, s) => sum + s.orfCount, 0);
    const avgGC = sequences.length > 0 ? sequences.reduce((sum, s) => sum + s.gcContent, 0) / sequences.length : 0;
    const maxStoredLength = 500000;
    let combinedSequence = sequences.map(s => s.sequence).join('');
    if (combinedSequence.length > maxStoredLength) {
      combinedSequence = combinedSequence.substring(0, maxStoredLength) + '...[truncated]';
    }
    const truncatedSequences = sequences.map(s => ({
      ...s,
      sequence: s.sequence.length > 50000 ? s.sequence.substring(0, 50000) + '...[truncated]' : s.sequence
    }));
    return {
      name: sequences[0].name,
      header: sequences[0].header,
      sequence: combinedSequence,
      length: totalLength,
      gcContent: Math.round(avgGC * 10) / 10,
      orfDetected: totalOrfs > 0,
      orfCount: totalOrfs,
      orfs: sequences.flatMap(s => s.orfs).slice(0, 100),
      nucleotideCounts: { A: totalA, T: totalT, G: totalG, C: totalC },
      filename: `${sequences[0].name}.fasta`,
      metrics: {
        length: totalLength,
        gcContent: Math.round(avgGC * 10) / 10,
        orfDetected: totalOrfs > 0,
        orfCount: totalOrfs
      },
      sequences: truncatedSequences,
      sequenceCount: sequences.length
    };
  }
}

// Helper function to create metadata for a single sequence
function createSequenceMetadata(header, seq) {
  const name = header.split(/\s+/)[0] || 'Sequence';
  const length = seq.length;
  const a = seq.replace(/[^A]/g, '').length;
  const t = seq.replace(/[^T]/g, '').length;
  const g = seq.replace(/[^G]/g, '').length;
  const c = seq.replace(/[^C]/g, '').length;
  const gc = g + c;
  const gcContent = length ? Math.round((gc / length) * 100 * 10) / 10 : 0;
  const orfList = detectAllORFs(seq);

  return {
    name,
    header,
    sequence: seq,
    length,
    gcContent,
    orfDetected: orfList.length > 0,
    orfCount: orfList.length,
    orfs: orfList,
    nucleotideCounts: { A: a, T: t, G: g, C: c }
  };
}

// Enhanced ORF detection - finds all ORFs (optimized for speed)
function detectAllORFs(seq) {
  const startCodon = 'ATG';
  const stopCodons = ['TAA', 'TAG', 'TGA'];
  const seqUpper = seq.toUpperCase();
  const orfs = [];
  
  // Limit detection for very large sequences (>100KB) for performance
  const maxLength = Math.min(seqUpper.length, 100000);
  const maxOrfs = 50; // Limit number of ORFs to find

  // Check all three reading frames
  for (let frame = 0; frame < 3; frame++) {
    for (let i = frame; i < maxLength - 5; i += 3) {
      if (orfs.length >= maxOrfs) break;
      if (seqUpper.substring(i, i + 3) === startCodon) {
        for (let j = i + 3; j < maxLength - 2; j += 3) {
          const codon = seqUpper.substring(j, j + 3);
          if (stopCodons.includes(codon)) {
            const orfSeq = seqUpper.substring(i, j + 3);
            orfs.push({
              start: i,
              end: j + 3,
              length: orfSeq.length,
              sequence: orfSeq.substring(0, 100) + (orfSeq.length > 100 ? '...' : ''), // Truncate for storage
              frame: frame
            });
            break;
          }
        }
      }
    }
  }

  return orfs;
}

// Simple ORF detection (backward compatibility)
function detectORF(seq) {
  return detectAllORFs(seq).length > 0;
}

// GET all sequences with pagination and filtering
router.get('/', validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const sort = req.query.sort || '-createdAt';
    const search = req.query.search || '';

    const offset = (page - 1) * limit;

    if (STORAGE_MODE === 'atlas') {
      // MongoDB branch
      const query = search
        ? { $or: [
            { name: { $regex: search, $options: 'i' } },
            { header: { $regex: search, $options: 'i' } },
            { filename: { $regex: search, $options: 'i' } }
          ] }
        : {};

      const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
      const sortDir = sort.startsWith('-') ? -1 : 1;

      const [count, rows] = await Promise.all([
        SequenceMongo.countDocuments(query),
        SequenceMongo.find(query)
          .sort({ [sortField]: sortDir })
          .skip(offset)
          .limit(limit)
          .lean()
      ]);

      res.json({
        data: rows.map((d) => ({
          id: d._id,
          filename: d.filename,
          header: d.header,
          name: d.name,
          length: d.length,
          gcPercent: d.gcContent,
          orfDetected: d.orfDetected,
          orfCount: d.orfCount || 0,
          nucleotideCounts: d.nucleotideCounts,
          sequences: d.sequences || [],
          sequenceCount: d.sequenceCount || 1,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt
        })),
        meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) }
      });
    } else {
      // SQLite branch
      // Build query with search
      const whereClause = search
        ? {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { header: { [Op.like]: `%${search}%` } },
            { filename: { [Op.like]: `%${search}%` } }
          ]
        }
        : {};

      // Parse sort parameter (e.g., '-createdAt' for DESC, 'createdAt' for ASC)
      const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
      const sortOrder = sort.startsWith('-') ? 'DESC' : 'ASC';

      const { count, rows } = await Sequence.findAndCountAll({
        where: whereClause,
        order: [[sortField, sortOrder]],
        limit: limit,
        offset: offset
      });

      res.json({
        data: rows.map((d) => ({
          id: d.id,
          filename: d.filename,
          header: d.header,
          name: d.name,
          length: d.length,
          gcPercent: d.gcContent,
          orfDetected: d.orfDetected,
          orfCount: d.orfCount || 0,
          nucleotideCounts: d.nucleotideCounts,
          sequences: d.sequences || [],
          sequenceCount: d.sequenceCount || 1,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt
        })),
        meta: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new sequence via JSON body
router.post('/', validateFasta, async (req, res) => {
  try {
    const { fasta, name, description } = req.body || {};
    if (!fasta || typeof fasta !== 'string') {
      return res.status(400).json({ error: 'fasta string required' });
    }

    // Allow parser override via header
    const parserHeader = req.headers['x-fasta-parser'];
    let meta;
    if (parserHeader && ['js', 'biopython'].includes(parserHeader)) {
      // Temporarily override process.env for this call
      const prev = process.env.FASTA_PARSER;
      process.env.FASTA_PARSER = parserHeader;
      meta = parseFastaToMetadata(fasta);
      process.env.FASTA_PARSER = prev;
    } else {
      meta = parseFastaToMetadata(fasta);
    }

    // Override with custom values if provided
    if (name) meta.name = name;
    if (description) meta.description = description;

    if (STORAGE_MODE === 'atlas') {
      meta.storageType = 'atlas';
      const doc = await SequenceMongo.create(meta);
      res.status(201).json([
        {
          id: doc._id,
          filename: doc.filename,
          header: doc.header,
          name: doc.name,
          length: doc.length,
          gcPercent: doc.gcContent,
          orfDetected: doc.orfDetected,
          orfCount: doc.orfCount || 0,
          nucleotideCounts: doc.nucleotideCounts,
          createdAt: doc.createdAt
        }
      ]);
    } else {
      const doc = await Sequence.create(meta);
      res.status(201).json([
        {
          id: doc.id,
          filename: doc.filename,
          header: doc.header,
          name: doc.name,
          length: doc.length,
          gcPercent: doc.gcContent,
          orfDetected: doc.orfDetected,
          orfCount: doc.orfCount || 0,
          nucleotideCounts: doc.nucleotideCounts,
          createdAt: doc.createdAt
        }
      ]);
    }
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
    // Allow parser override via header
    const parserHeader = req.headers['x-fasta-parser'];
    let meta;
    if (parserHeader && ['js', 'biopython'].includes(parserHeader)) {
      const prev = process.env.FASTA_PARSER;
      process.env.FASTA_PARSER = parserHeader;
      meta = parseFastaToMetadata(fileContent);
      process.env.FASTA_PARSER = prev;
    } else {
      meta = parseFastaToMetadata(fileContent);
    }
    meta.filename = req.file.originalname;

    if (STORAGE_MODE === 'atlas') {
      meta.storageType = 'atlas';
      const doc = await SequenceMongo.create(meta);
      res.status(201).json({
        id: doc._id,
        filename: doc.filename,
        header: doc.header,
        length: doc.length,
        gcPercent: doc.gcContent,
        orfDetected: doc.orfDetected,
        nucleotideCounts: doc.nucleotideCounts,
        sequences: doc.sequences || [],
        sequenceCount: doc.sequenceCount || 1,
        createdAt: doc.createdAt
      });
    } else {
      // Direct database create
      const doc = await Sequence.create(meta);
      res.status(201).json({
        id: doc.id,
        filename: doc.filename,
        header: doc.header,
        length: doc.length,
        gcPercent: doc.gcContent,
        orfDetected: doc.orfDetected,
        nucleotideCounts: doc.nucleotideCounts,
        sequences: doc.sequences || [],
        sequenceCount: doc.sequenceCount || 1,
        createdAt: doc.createdAt
      });
    }
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// GET sequence by ID with full details
router.get('/:id', async (req, res) => {
  try {
    if (STORAGE_MODE === 'atlas') {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).json({ error: 'Invalid ID' });
      }
      const doc = await SequenceMongo.findById(req.params.id).lean();
      if (!doc) return res.status(404).json({ error: 'Sequence not found' });
      return res.json({
        id: doc._id,
        name: doc.name,
        title: doc.title || doc.name,
        header: doc.header,
        filename: doc.filename,
        metrics: doc.metrics || {
          length: doc.length,
          gcContent: doc.gcContent,
          orfDetected: doc.orfDetected,
          orfCount: doc.orfCount || 0
        },
        sequence: doc.sequence,
        length: doc.length,
        gcContent: doc.gcContent,
        orfDetected: doc.orfDetected,
        orfCount: doc.orfCount || 0,
        orfs: doc.orfs || [],
        nucleotideCounts: doc.nucleotideCounts,
        sequences: doc.sequences || [],
        sequenceCount: doc.sequenceCount || 1,
        interpretation: doc.interpretation,
        aiSummary: doc.aiSummary,
        description: doc.description,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
      });
    }
    const doc = await Sequence.findByPk(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Sequence not found' });
    }
    res.json({
      id: doc.id,
      name: doc.name,
      title: doc.title || doc.name,
      header: doc.header,
      filename: doc.filename,
      metrics: doc.metrics || {
        length: doc.length,
        gcContent: doc.gcContent,
        orfDetected: doc.orfDetected,
        orfCount: doc.orfCount || 0
      },
      sequence: doc.sequence,
      length: doc.length,
      gcContent: doc.gcContent,
      orfDetected: doc.orfDetected,
      orfCount: doc.orfCount || 0,
      orfs: doc.orfs || [],
      nucleotideCounts: doc.nucleotideCounts,
      sequences: doc.sequences || [],
      sequenceCount: doc.sequenceCount || 1,
      interpretation: doc.interpretation,
      aiSummary: doc.aiSummary,
      description: doc.description,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET sequence report by ID
router.get('/:id/report', async (req, res) => {
  try {
    const doc = await Sequence.findByPk(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Sequence not found' });
    }

    res.json({
      id: doc.id,
      aiSummary: doc.aiSummary || 'Generated human-readable summary',
      interpretation: doc.interpretation || 'Short textual interpretation'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST generate AI report with enhanced analysis
router.post('/:id/generate-report', async (req, res) => {
  try {
    const { options } = req.body || {};
    const lengthThreshold = options?.length_threshold || 1000;

    const doc = await Sequence.findByPk(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Sequence not found' });
    }

    // Generate enhanced analysis report
    const gcQuality = doc.gcContent >= 40 && doc.gcContent <= 60 ? 'optimal' :
      doc.gcContent >= 30 && doc.gcContent <= 70 ? 'acceptable' : 'unusual';

    const lengthCategory = doc.length < 500 ? 'short fragment' :
      doc.length < 2000 ? 'medium length' :
        doc.length < 10000 ? 'long sequence' : 'very long sequence';

    const aiSummary = `This ${lengthCategory} (${doc.length} bp) shows ${gcQuality} GC content at ${doc.gcContent}%. ` +
      `Analysis detected ${doc.orfCount || 0} open reading frames, suggesting ${doc.orfDetected ? 'potential protein-coding capacity' : 'non-coding or regulatory function'}. ` +
      `Nucleotide composition: A=${doc.nucleotideCounts.A}, T=${doc.nucleotideCounts.T}, G=${doc.nucleotideCounts.G}, C=${doc.nucleotideCounts.C}. ` +
      `${doc.length >= lengthThreshold ? 'Suitable for detailed analysis and annotation.' : 'Consider extending sequence for comprehensive analysis.'}`;

    const interpretation = `${doc.name}: ${doc.orfDetected ? 'Protein-coding potential detected' : 'Non-coding sequence'}. ` +
      `GC content is ${gcQuality}. Quality score: ${doc.length >= lengthThreshold ? 'HIGH' : 'MEDIUM'}.`;

    doc.aiSummary = aiSummary;
    doc.interpretation = interpretation;
    doc.cached = false;
    await doc.save();

    res.status(202).json({
      message: 'Report generation completed',
      id: doc.id,
      aiSummary,
      interpretation,
      analysis: {
        gcQuality,
        lengthCategory,
        orfCount: doc.orfCount || 0,
        qualityScore: doc.length >= lengthThreshold ? 'HIGH' : 'MEDIUM'
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE sequence
router.delete('/:id', async (req, res) => {
  try {
    if (STORAGE_MODE === 'atlas') {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).json({ error: 'Invalid ID' });
      }
      const deleted = await SequenceMongo.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Sequence not found' });
      return res.json({ message: 'Deleted', id: req.params.id });
    } else {
      const doc = await Sequence.findByPk(req.params.id);
      if (!doc) {
        return res.status(404).json({ error: 'Sequence not found' });
      }
      await doc.destroy();
      res.json({ message: 'Deleted', id: doc.id });
    }
  } catch (err) {
    console.error('Delete error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT update sequence metadata with validation
router.put('/:id', async (req, res) => {
  try {
    const { filename, header, metadata, description, name } = req.body || {};

    const doc = await Sequence.findByPk(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Sequence not found' });
    }

    // Update fields if provided
    if (filename) doc.filename = filename;
    if (header) doc.header = header;
    if (description) doc.description = description;
    if (name) doc.name = name;

    if (metadata) {
      if (metadata.user_note) doc.name = metadata.user_note;
      if (metadata.title) doc.title = metadata.title;
      if (metadata.description) doc.description = metadata.description;
    }

    await doc.save();

    res.json({
      id: doc.id,
      filename: doc.filename,
      header: doc.header,
      name: doc.name,
      description: doc.description,
      updatedAt: doc.updatedAt
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET metadata only
router.get('/:id/metadata', async (req, res) => {
  try {
    const doc = await Sequence.findByPk(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Sequence not found' });
    }

    res.json({
      status: 'ok',
      time: new Date().toISOString(),
      id: doc.id,
      name: doc.name,
      length: doc.length,
      gcContent: doc.gcContent,
      orfCount: doc.orfCount || 0
    });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// GET statistics across all sequences
router.get('/stats/aggregate', async (req, res) => {
  try {
    const total = await Sequence.count();

    if (total === 0) {
      return res.json({
        total: 0,
        avgLength: 0,
        avgGC: 0,
        totalORFs: 0,
        totalBases: 0
      });
    }

    const sequences = await Sequence.findAll({
      attributes: ['length', 'gcContent', 'orfCount']
    });

    const totalLength = sequences.reduce((sum, s) => sum + s.length, 0);
    const totalGC = sequences.reduce((sum, s) => sum + s.gcContent, 0);
    const totalORFs = sequences.reduce((sum, s) => sum + (s.orfCount || 0), 0);

    res.json({
      total,
      avgLength: Math.round(totalLength / total),
      avgGC: Math.round((totalGC / total) * 10) / 10,
      totalORFs,
      totalBases: totalLength,
      longestSequence: Math.max(...sequences.map(s => s.length)),
      shortestSequence: Math.min(...sequences.map(s => s.length))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST bulk delete sequences
router.post('/bulk/delete', validateBulkDelete, async (req, res) => {
  try {
    const { ids } = req.body || {};

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Array of IDs required' });
    }

    const deletedCount = await Sequence.destroy({
      where: {
        id: { [Op.in]: ids }
      }
    });

    res.json({
      message: 'Bulk delete completed',
      deletedCount: deletedCount
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET search sequences by text
router.get('/search/text', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query (q) required' });
    }

    const results = await Sequence.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${q}%` } },
          { header: { [Op.like]: `%${q}%` } },
          { filename: { [Op.like]: `%${q}%` } },
          { description: { [Op.like]: `%${q}%` } }
        ]
      },
      limit: parseInt(limit)
    });

    res.json({
      query: q,
      count: results.length,
      results: results.map(d => ({
        id: d.id,
        name: d.name,
        filename: d.filename,
        length: d.length,
        gcContent: d.gcContent,
        createdAt: d.createdAt
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST generate PDF report from sequences
router.post('/generate-pdf', async (req, res) => {
  try {
    const { sequenceIds = [], title = 'Symbio-NLM Sequence Analysis Report' } = req.body || {};

    let sequences = [];

    if (sequenceIds.length > 0) {
      // Fetch specific sequences
      sequences = await Sequence.findAll({
        where: {
          id: {
            [Op.in]: sequenceIds
          }
        }
      });
    } else {
      // Get all sequences if none specified
      sequences = await Sequence.findAll({
        limit: 100 // Limit to 100 for performance
      });
    }

    if (sequences.length === 0) {
      return res.status(400).json({ error: 'No sequences found for PDF generation' });
    }

    // Convert to format expected by PDF generator
    const sequenceData = sequences.map(seq => ({
      name: seq.name,
      length: seq.length,
      gcContent: seq.gcContent,
      orfCount: seq.orfCount || 0,
      orfs: seq.orfs || [],
      nucleotideCounts: seq.nucleotideCounts || { A: 0, T: 0, G: 0, C: 0 }
    }));

    // Generate PDF
    const pdfBuffer = await generatePDFReport(sequenceData, {
      title,
      includeAIAnalysis: true
    });

    // Send as file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="symbio-nlm-report-${Date.now()}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ error: err.message || 'Error generating PDF' });
  }
});

module.exports = router;