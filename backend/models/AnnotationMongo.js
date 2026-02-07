/**
 * Annotation Model for MongoDB
 * 
 * Stores annotations for sequence regions
 */

const mongoose = require('mongoose');

const annotationSchema = new mongoose.Schema({
  sequenceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sequence',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  // Region markers
  startPosition: {
    type: Number,
    required: true,
    min: 0,
  },
  endPosition: {
    type: Number,
    required: true,
    min: 0,
  },
  // Annotation details
  label: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100,
  },
  description: {
    type: String,
    trim: true,
    maxLength: 500,
  },
  type: {
    type: String,
    enum: ['gene', 'promoter', 'exon', 'intron', 'motif', 'regulatory', 'coding', 'non-coding', 'custom'],
    default: 'custom',
  },
  color: {
    type: String,
    default: '#8b5cf6', // Purple default
    match: /^#[0-9A-Fa-f]{6}$/,
  },
  // Strand direction
  strand: {
    type: String,
    enum: ['+', '-', '.'],
    default: '+',
  },
  // Additional metadata
  notes: {
    type: String,
    maxLength: 1000,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  // Source information
  source: {
    type: String,
    enum: ['manual', 'predicted', 'imported'],
    default: 'manual',
  },
}, {
  timestamps: true,
});

// Compound index for efficient queries
annotationSchema.index({ sequenceId: 1, startPosition: 1, endPosition: 1 });

// Virtual for annotation length
annotationSchema.virtual('length').get(function() {
  return this.endPosition - this.startPosition + 1;
});

// Validate that endPosition >= startPosition
annotationSchema.pre('validate', function(next) {
  if (this.endPosition < this.startPosition) {
    this.invalidate('endPosition', 'End position must be >= start position');
  }
  next();
});

// Include virtuals in JSON output
annotationSchema.set('toJSON', { virtuals: true });
annotationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Annotation', annotationSchema);
