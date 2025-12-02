const express = require('express');
const router = express.Router();
const Sequence = require('../models/Sequence');

// Simple FASTA parser
function parseFastaToMetadata(fasta) {
  const lines = fasta.split(/\r?\n/).filter(Boolean);
  let name = 'Sequence';
  let seq = '';
  for (const line of lines) {
    if (line.startsWith('>')) name = line.replace(/^>\s*/, '').trim();
    else seq += line.trim();
  }
  const length = seq.length;
  const gc = seq.replace(/[^GCgc]/g, '').length;
  const gcContent = length ? Math.round((gc / length) * 100) : 0;
  return { name, length, gcContent };
}

// GET all sequences
router.get('/', async (req, res) => {
  try {
    const list = await Sequence.find().sort({ createdAt: -1 }).limit(20);
    res.json(
      list.map((d) => ({
        id: d._id.toString(),
        name: d.name,
        length: d.length,
        gcContent: d.gcContent,
        createdAt: d.createdAt
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new sequence
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
        name: doc.name,
        length: doc.length,
        gcContent: doc.gcContent
      }
    ]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;