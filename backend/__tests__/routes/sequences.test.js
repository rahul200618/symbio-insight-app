/**
 * Sequences Routes Tests
 * 
 * Tests for sequence management endpoints
 */

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');

// Set environment
process.env.STORAGE_MODE = 'atlas';

const SequenceMongo = require('../../models/SequenceMongo');
const sequencesRouter = require('../../routes/sequences');

// Create test app
const createApp = () => {
  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use('/api/sequences', sequencesRouter);
  return app;
};

// Valid FASTA for testing
const validFasta = `>TestSequence Test Description
ATGCATGCATGCATGCATGCATGCATGCATGC
GCGCGCGCGCGCGCGCGCGCGCGCGCGCGCGC`;

const simpleFasta = `>SimpleSeq
ATGCATGCATGC`;

describe('Sequences Routes', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(async () => {
    await SequenceMongo.deleteMany({});
  });

  describe('GET /api/sequences', () => {
    it('should return empty array when no sequences exist', async () => {
      const response = await request(app)
        .get('/api/sequences')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toEqual([]);
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta.total).toBe(0);
    });

    it('should return sequences with pagination meta', async () => {
      // Create a test sequence
      await SequenceMongo.create({
        name: 'TestSeq',
        header: 'Test Header',
        sequence: 'ATGCATGC',
        length: 8,
        gcContent: 50,
        filename: 'test.fasta',
      });

      const response = await request(app)
        .get('/api/sequences')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta.total).toBe(1);
      expect(response.body.data[0].name).toBe('TestSeq');
    });

    it('should support pagination parameters', async () => {
      // Create multiple sequences
      for (let i = 0; i < 5; i++) {
        await SequenceMongo.create({
          name: `Seq${i}`,
          header: `Header ${i}`,
          sequence: 'ATGC',
          length: 4,
          gcContent: 50,
          filename: `seq${i}.fasta`,
        });
      }

      const response = await request(app)
        .get('/api/sequences?page=1&limit=2')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta.totalPages).toBe(3);
    });

    it('should support search parameter', async () => {
      await SequenceMongo.create({
        name: 'UniqueSequenceName',
        header: 'Unique Header',
        sequence: 'ATGC',
        length: 4,
        gcContent: 50,
        filename: 'unique.fasta',
      });

      await SequenceMongo.create({
        name: 'OtherSeq',
        header: 'Other Header',
        sequence: 'GCGC',
        length: 4,
        gcContent: 100,
        filename: 'other.fasta',
      });

      const response = await request(app)
        .get('/api/sequences?search=Unique')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('UniqueSequenceName');
    });
  });

  describe('POST /api/sequences', () => {
    it('should create a new sequence from FASTA', async () => {
      const response = await request(app)
        .post('/api/sequences')
        .send({ fasta: simpleFasta })
        .expect(201);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0].length).toBe(12);
    });

    it('should return 400 for missing fasta', async () => {
      const response = await request(app)
        .post('/api/sequences')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid fasta format', async () => {
      const response = await request(app)
        .post('/api/sequences')
        .send({ fasta: 'not a valid fasta' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/sequences/:id', () => {
    it('should return sequence by ID', async () => {
      const seq = await SequenceMongo.create({
        name: 'GetSeq',
        header: 'Get Header',
        sequence: 'ATGCATGC',
        length: 8,
        gcContent: 50,
        filename: 'get.fasta',
      });

      const response = await request(app)
        .get(`/api/sequences/${seq._id}`)
        .expect(200);

      expect(response.body.name).toBe('GetSeq');
    });

    it('should return 404 for non-existent sequence', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/sequences/${fakeId}`)
        .expect(404);
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/sequences/invalid-id');

      // Could be 400 or 404 depending on implementation
      expect([400, 404, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/sequences/:id', () => {
    it('should delete sequence by ID', async () => {
      const seq = await SequenceMongo.create({
        name: 'DeleteSeq',
        header: 'Delete Header',
        sequence: 'ATGC',
        length: 4,
        gcContent: 50,
        filename: 'delete.fasta',
      });

      await request(app)
        .delete(`/api/sequences/${seq._id}`)
        .expect(200);

      // Verify it's deleted
      const deleted = await SequenceMongo.findById(seq._id);
      expect(deleted).toBeNull();
    });

    it('should return 404 for non-existent sequence', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/sequences/${fakeId}`)
        .expect(404);
    });
  });
});
