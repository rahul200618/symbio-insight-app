const mongoose = require('mongoose');
const crypto = require('crypto');

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
  
  // Multi-sequence support (for FASTA files with multiple sequences)
  sequences: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },
  sequenceCount: {
    type: Number,
    default: 1
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
  
  // Sharing configuration
  isPublic: {
    type: Boolean,
    default: false
  },
  shareToken: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  shareExpires: {
    type: Date
  },
  shareViewCount: {
    type: Number,
    default: 0
  },
  
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

// Generate a unique share token
SequenceMongoSchema.methods.generateShareToken = function(expiresInDays = 7) {
  this.shareToken = crypto.randomBytes(16).toString('hex');
  this.shareExpires = expiresInDays > 0 
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null; // null = never expires
  this.isPublic = true;
  return this.shareToken;
};

// Check if share link is valid
SequenceMongoSchema.methods.isShareValid = function() {
  if (!this.isPublic || !this.shareToken) return false;
  if (!this.shareExpires) return true; // No expiry = always valid
  return new Date() < this.shareExpires;
};

// Revoke share access
SequenceMongoSchema.methods.revokeShare = function() {
  this.shareToken = undefined;
  this.shareExpires = undefined;
  this.isPublic = false;
};

// Virtual for formatted size
SequenceMongoSchema.virtual('formattedSize').get(function() {
  if (!this.fileSize) return 'Unknown';
  const kb = this.fileSize / 1024;
  return kb < 1 ? `${this.fileSize} B` : `${kb.toFixed(2)} KB`;
});

const SequenceMongo = mongoose.model('Sequence', SequenceMongoSchema);

module.exports = SequenceMongo;
