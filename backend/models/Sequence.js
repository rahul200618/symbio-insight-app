const mongoose = require('mongoose');

const SequenceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    header: { type: String, default: '' },
    sequence: { type: String, required: true },
    length: { type: Number, required: true },
    gcContent: { type: Number, required: true },
    orfDetected: { type: Boolean, default: false },
    nucleotideCounts: {
      A: { type: Number, default: 0 },
      T: { type: Number, default: 0 },
      G: { type: Number, default: 0 },
      C: { type: Number, default: 0 }
    },
    filename: { type: String, required: true },
    title: { type: String },
    metrics: {
      length: { type: Number },
      gcContent: { type: Number },
      orfDetected: { type: Boolean }
    },
    interpretation: { type: String },
    aiSummary: { type: String },
    cached: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Sequence', SequenceSchema);