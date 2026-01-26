const mongoose = require('mongoose');

const SequenceMongoSchema = new mongoose.Schema({
  // User reference (optional for now)
  userId: {
    type: String,
    index: true
  },
  
  // Basic sequence info
  name: {
    type: String,
    required: true
  },
  header: {
    type: String,
    default: ''
  },
  sequence: {
    type: String,
    required: true
  },
  
  // Metrics
  length: {
    type: Number,
    required: true
  },
  gcContent: {
    type: Number,
    required: true
  },
  atContent: {
    type: Number
  },
  
  // ORF data
  orfDetected: {
    type: Boolean,
    default: false
  },
  orfCount: {
    type: Number,
    default: 0
  },
  orfs: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },
  
  // Nucleotide counts
  nucleotideCounts: {
    type: mongoose.Schema.Types.Mixed,
    default: { A: 0, T: 0, G: 0, C: 0 }
  },
  
  // Codon data
  codonFrequency: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  codonStats: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // File info
  filename: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number
  },
  
  // AI Analysis
  aiSummary: {
    type: String
  },
  speciesPrediction: {
    type: String
  },
  genomeType: {
    type: String
  },
  
  // Metadata
  title: String,
  description: String,
  tags: [String],
  
  // Storage info
  storageType: {
    type: String,
    enum: ['local', 'atlas'],
    default: 'atlas'
  }
}, {
  timestamps: true,
  collection: 'sequences'
});

// Indexes for faster queries
SequenceMongoSchema.index({ name: 'text', header: 'text' });
SequenceMongoSchema.index({ createdAt: -1 });
SequenceMongoSchema.index({ gcContent: 1 });
SequenceMongoSchema.index({ length: 1 });

// Virtual for formatted size
SequenceMongoSchema.virtual('formattedSize').get(function() {
  if (!this.fileSize) return 'Unknown';
  const kb = this.fileSize / 1024;
  return kb < 1 ? `${this.fileSize} B` : `${kb.toFixed(2)} KB`;
});

const SequenceMongo = mongoose.model('Sequence', SequenceMongoSchema);

module.exports = SequenceMongo;
