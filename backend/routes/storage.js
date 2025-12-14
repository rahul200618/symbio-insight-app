const express = require('express');
const router = express.Router();
const { connectMongoDB, disconnectMongoDB, getConnectionStatus } = require('../config/mongodb');
const SequenceMongo = require('../models/SequenceMongo');

/**
 * GET /api/storage/status
 * Get current storage connection status
 */
router.get('/status', (req, res) => {
  try {
    const status = getConnectionStatus();
    res.json({
      success: true,
      ...status,
      message: status.isConnected 
        ? `Connected to MongoDB (${status.connectionType})`
        : 'Not connected to MongoDB'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/storage/connect
 * Connect to MongoDB (local or atlas)
 * Body: { type: 'local' | 'atlas' }
 */
router.post('/connect', async (req, res) => {
  try {
    const { type = 'local' } = req.body;
    
    if (!['local', 'atlas'].includes(type)) {
      return res.status(400).json({ error: 'Invalid storage type. Use "local" or "atlas"' });
    }
    
    const success = await connectMongoDB(type);
    
    if (success) {
      res.json({
        success: true,
        message: `Connected to MongoDB (${type})`,
        connectionType: type
      });
    } else {
      res.status(500).json({
        success: false,
        error: `Failed to connect to MongoDB (${type}). Check your configuration.`
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/storage/disconnect
 * Disconnect from MongoDB
 */
router.post('/disconnect', async (req, res) => {
  try {
    await disconnectMongoDB();
    res.json({
      success: true,
      message: 'Disconnected from MongoDB'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/storage/save
 * Save sequence(s) to MongoDB
 * Body: { sequences: [...], storageType: 'local' | 'atlas' }
 */
router.post('/save', async (req, res) => {
  try {
    const { sequences, storageType = 'local' } = req.body;
    
    if (!sequences || !Array.isArray(sequences) || sequences.length === 0) {
      return res.status(400).json({ error: 'No sequences provided' });
    }
    
    // Ensure we're connected to the right storage
    const status = getConnectionStatus();
    if (!status.isConnected || status.connectionType !== storageType) {
      const connected = await connectMongoDB(storageType);
      if (!connected) {
        return res.status(500).json({ 
          error: `Could not connect to MongoDB (${storageType}). Check configuration.` 
        });
      }
    }
    
    // Prepare documents
    const documents = sequences.map(seq => ({
      name: seq.sequenceName || seq.name || 'Unnamed Sequence',
      header: seq.header || '',
      sequence: seq.rawSequence || seq.sequence || '',
      length: seq.sequenceLength || seq.length || 0,
      gcContent: seq.gcPercentage || seq.gcContent || 0,
      atContent: 100 - (seq.gcPercentage || seq.gcContent || 0),
      orfDetected: (seq.orfs?.length || 0) > 0,
      orfCount: seq.orfs?.length || 0,
      orfs: seq.orfs || [],
      nucleotideCounts: seq.nucleotideCounts || { A: 0, T: 0, G: 0, C: 0 },
      codonFrequency: seq.codonFrequency || {},
      codonStats: seq.codonStats || {},
      filename: seq.filename || 'pasted_sequence.fasta',
      fileSize: seq.rawSequence?.length || seq.sequence?.length || 0,
      storageType
    }));
    
    // Insert into MongoDB
    const result = await SequenceMongo.insertMany(documents);
    
    res.json({
      success: true,
      message: `Saved ${result.length} sequence(s) to ${storageType}`,
      savedCount: result.length,
      ids: result.map(doc => doc._id)
    });
    
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/storage/sequences
 * Get all sequences from MongoDB
 * Query: { storageType: 'local' | 'atlas', limit: number, skip: number }
 */
router.get('/sequences', async (req, res) => {
  try {
    const { storageType = 'local', limit = 50, skip = 0 } = req.query;
    
    // Ensure we're connected
    const status = getConnectionStatus();
    if (!status.isConnected || status.connectionType !== storageType) {
      const connected = await connectMongoDB(storageType);
      if (!connected) {
        return res.status(500).json({ 
          error: `Could not connect to MongoDB (${storageType})` 
        });
      }
    }
    
    const sequences = await SequenceMongo.find({ storageType })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();
    
    const total = await SequenceMongo.countDocuments({ storageType });
    
    res.json({
      success: true,
      sequences,
      total,
      storageType
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/storage/sequences/:id
 * Delete a sequence from MongoDB
 */
router.delete('/sequences/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const status = getConnectionStatus();
    if (!status.isConnected) {
      return res.status(400).json({ error: 'Not connected to any database' });
    }
    
    const result = await SequenceMongo.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({ error: 'Sequence not found' });
    }
    
    res.json({
      success: true,
      message: 'Sequence deleted successfully'
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
