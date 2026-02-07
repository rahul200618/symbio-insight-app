/**
 * Annotations Routes
 * 
 * CRUD operations for sequence annotations
 */

const express = require('express');
const router = express.Router();
const Annotation = require('../models/AnnotationMongo');
const Sequence = require('../models/SequenceMongo');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

/**
 * GET /api/annotations/sequence/:sequenceId
 * Get all annotations for a sequence
 */
router.get('/sequence/:sequenceId', async (req, res) => {
  try {
    const { sequenceId } = req.params;
    const userId = req.user.id;

    // Verify sequence exists and belongs to user
    const sequence = await Sequence.findOne({ _id: sequenceId, userId });
    if (!sequence) {
      return res.status(404).json({ error: 'Sequence not found' });
    }

    const annotations = await Annotation.find({ 
      sequenceId, 
      userId 
    }).sort({ startPosition: 1 });

    res.json({
      success: true,
      count: annotations.length,
      data: annotations,
    });
  } catch (error) {
    console.error('Error fetching annotations:', error);
    res.status(500).json({ error: 'Failed to fetch annotations' });
  }
});

/**
 * POST /api/annotations
 * Create a new annotation
 */
router.post('/', async (req, res) => {
  try {
    const {
      sequenceId,
      startPosition,
      endPosition,
      label,
      description,
      type,
      color,
      strand,
      notes,
      tags,
      source,
    } = req.body;

    const userId = req.user.id;

    // Validate required fields
    if (!sequenceId || startPosition === undefined || endPosition === undefined || !label) {
      return res.status(400).json({ 
        error: 'Missing required fields: sequenceId, startPosition, endPosition, label' 
      });
    }

    // Verify sequence exists and belongs to user
    const sequence = await Sequence.findOne({ _id: sequenceId, userId });
    if (!sequence) {
      return res.status(404).json({ error: 'Sequence not found' });
    }

    // Validate positions are within sequence length
    const seqLength = sequence.sequenceLength || sequence.sequence?.length || 0;
    if (startPosition < 0 || endPosition >= seqLength) {
      return res.status(400).json({ 
        error: `Positions must be within sequence range (0-${seqLength - 1})` 
      });
    }

    const annotation = new Annotation({
      sequenceId,
      userId,
      startPosition,
      endPosition,
      label,
      description,
      type: type || 'custom',
      color: color || '#8b5cf6',
      strand: strand || '+',
      notes,
      tags: tags || [],
      source: source || 'manual',
    });

    await annotation.save();

    res.status(201).json({
      success: true,
      data: annotation,
    });
  } catch (error) {
    console.error('Error creating annotation:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create annotation' });
  }
});

/**
 * PUT /api/annotations/:id
 * Update an annotation
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    // Find annotation and verify ownership
    const annotation = await Annotation.findOne({ _id: id, userId });
    if (!annotation) {
      return res.status(404).json({ error: 'Annotation not found' });
    }

    // If positions are updated, validate them
    if (updates.startPosition !== undefined || updates.endPosition !== undefined) {
      const sequence = await Sequence.findById(annotation.sequenceId);
      const seqLength = sequence?.sequenceLength || sequence?.sequence?.length || 0;
      
      const start = updates.startPosition ?? annotation.startPosition;
      const end = updates.endPosition ?? annotation.endPosition;
      
      if (start < 0 || end >= seqLength) {
        return res.status(400).json({ 
          error: `Positions must be within sequence range (0-${seqLength - 1})` 
        });
      }
    }

    // Allowed fields to update
    const allowedUpdates = [
      'startPosition', 'endPosition', 'label', 'description',
      'type', 'color', 'strand', 'notes', 'tags'
    ];

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        annotation[field] = updates[field];
      }
    });

    await annotation.save();

    res.json({
      success: true,
      data: annotation,
    });
  } catch (error) {
    console.error('Error updating annotation:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update annotation' });
  }
});

/**
 * DELETE /api/annotations/:id
 * Delete an annotation
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const annotation = await Annotation.findOneAndDelete({ _id: id, userId });
    
    if (!annotation) {
      return res.status(404).json({ error: 'Annotation not found' });
    }

    res.json({
      success: true,
      message: 'Annotation deleted',
    });
  } catch (error) {
    console.error('Error deleting annotation:', error);
    res.status(500).json({ error: 'Failed to delete annotation' });
  }
});

/**
 * DELETE /api/annotations/sequence/:sequenceId
 * Delete all annotations for a sequence
 */
router.delete('/sequence/:sequenceId', async (req, res) => {
  try {
    const { sequenceId } = req.params;
    const userId = req.user.id;

    const result = await Annotation.deleteMany({ sequenceId, userId });

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} annotations`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Error deleting annotations:', error);
    res.status(500).json({ error: 'Failed to delete annotations' });
  }
});

/**
 * POST /api/annotations/bulk
 * Create multiple annotations at once
 */
router.post('/bulk', async (req, res) => {
  try {
    const { sequenceId, annotations } = req.body;
    const userId = req.user.id;

    if (!sequenceId || !Array.isArray(annotations) || annotations.length === 0) {
      return res.status(400).json({ 
        error: 'Missing required fields: sequenceId and annotations array' 
      });
    }

    // Verify sequence exists and belongs to user
    const sequence = await Sequence.findOne({ _id: sequenceId, userId });
    if (!sequence) {
      return res.status(404).json({ error: 'Sequence not found' });
    }

    const seqLength = sequence.sequenceLength || sequence.sequence?.length || 0;

    // Prepare annotations with userId
    const annotationsToInsert = annotations.map(ann => ({
      sequenceId,
      userId,
      startPosition: ann.startPosition,
      endPosition: ann.endPosition,
      label: ann.label,
      description: ann.description || '',
      type: ann.type || 'custom',
      color: ann.color || '#8b5cf6',
      strand: ann.strand || '+',
      notes: ann.notes || '',
      tags: ann.tags || [],
      source: ann.source || 'manual',
    }));

    // Validate all positions
    for (const ann of annotationsToInsert) {
      if (ann.startPosition < 0 || ann.endPosition >= seqLength) {
        return res.status(400).json({ 
          error: `Invalid position for "${ann.label}". Must be within 0-${seqLength - 1}` 
        });
      }
    }

    const inserted = await Annotation.insertMany(annotationsToInsert);

    res.status(201).json({
      success: true,
      count: inserted.length,
      data: inserted,
    });
  } catch (error) {
    console.error('Error bulk creating annotations:', error);
    res.status(500).json({ error: 'Failed to create annotations' });
  }
});

/**
 * GET /api/annotations/export/:sequenceId
 * Export annotations in GFF3 format
 */
router.get('/export/:sequenceId', async (req, res) => {
  try {
    const { sequenceId } = req.params;
    const userId = req.user.id;
    const { format = 'gff3' } = req.query;

    // Verify sequence exists and belongs to user
    const sequence = await Sequence.findOne({ _id: sequenceId, userId });
    if (!sequence) {
      return res.status(404).json({ error: 'Sequence not found' });
    }

    const annotations = await Annotation.find({ sequenceId, userId })
      .sort({ startPosition: 1 });

    if (format === 'gff3') {
      // Generate GFF3 format
      const seqName = sequence.sequenceName || sequence.name || 'sequence';
      let gff = '##gff-version 3\n';
      gff += `##sequence-region ${seqName} 1 ${sequence.sequenceLength || 0}\n`;

      annotations.forEach((ann, index) => {
        const fields = [
          seqName,
          ann.source || 'SymbioNLM',
          ann.type,
          ann.startPosition + 1, // GFF3 uses 1-based coordinates
          ann.endPosition + 1,
          '.', // Score
          ann.strand,
          '.', // Phase
          `ID=annotation_${index + 1};Name=${ann.label}${ann.description ? `;Note=${ann.description}` : ''}`
        ];
        gff += fields.join('\t') + '\n';
      });

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${seqName}_annotations.gff3"`);
      return res.send(gff);
    }

    // Default: return JSON
    res.json({
      success: true,
      data: annotations,
    });
  } catch (error) {
    console.error('Error exporting annotations:', error);
    res.status(500).json({ error: 'Failed to export annotations' });
  }
});

module.exports = router;
