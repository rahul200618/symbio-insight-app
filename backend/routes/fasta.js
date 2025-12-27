const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { parseFastaWithBiopython } = require('../utils/biopythonFasta');
require('dotenv').config();

const router = express.Router();
const upload = multer({ dest: 'temp/' });

// Import JS parser (for demonstration, you may want to move this to backend/utils)
function parseFastaJS(content) {
  const records = [];
  let current = null;
  content.split(/\r?\n/).forEach(line => {
    if (line.startsWith('>')) {
      if (current) records.push(current);
      current = { id: line.substring(1).split(' ')[0], description: line.substring(1), sequence: '' };
    } else if (current && line.trim()) {
      current.sequence += line.trim();
    }
  });
  if (current) records.push(current);
  return records;
}

// POST /api/fasta/parse
router.post('/parse', upload.single('file'), async (req, res) => {
  const parser = req.body.parser || process.env.FASTA_PARSER || 'js';
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded.' });

  try {
    let result;
    if (parser === 'biopython') {
      result = await parseFastaWithBiopython(file.path);
    } else {
      const content = fs.readFileSync(file.path, 'utf8');
      result = parseFastaJS(content);
    }
    fs.unlinkSync(file.path); // Clean up temp file

    // Save all parsed sequences as a single record
    const Sequence = require('../models/Sequence');
    const doc = await Sequence.create({
      name: file.originalname || 'FASTA Upload',
      header: '',
      sequence: '',
      length: result.reduce((sum, rec) => sum + (rec.sequence?.length || 0), 0),
      gcContent: 0,
      orfDetected: false,
      orfCount: 0,
      orfs: [],
      nucleotideCounts: {},
      filename: file.originalname || '',
      sequences: result,
      sequenceCount: result.length,
    });
    res.json({ parser, record: doc });
  } catch (err) {
    if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
