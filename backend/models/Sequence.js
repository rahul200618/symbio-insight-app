const mongoose = require('mongoose');

const SequenceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    header: { type: String, default: '' },
    sequence: { type: String, required: true },
    length: { type: Number, required: true },
    gcContent: { type: Number, required: true },
    orfDetected: { type: Boolean, default: false },
    orfCount: { type: Number, default: 0 },
    orfs: [{
      start: { type: Number },
      end: { type: Number },
      length: { type: Number },
      sequence: { type: String },
      frame: { type: Number }
    }],
    nucleotideCounts: {
      A: { type: Number, default: 0 },
      T: { type: Number, default: 0 },
      G: { type: Number, default: 0 },
      C: { type: Number, default: 0 }
    },
    filename: { type: String, required: true },
    title: { type: String },
    description: { type: String },
    metrics: {
      length: { type: Number },
      gcContent: { type: Number },
      orfDetected: { type: Boolean },
      orfCount: { type: Number }
    },
    interpretation: { type: String },
    aiSummary: { type: String },
    cached: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Sequence', SequenceSchema);