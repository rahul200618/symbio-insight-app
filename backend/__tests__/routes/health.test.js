/**
 * Health Routes Tests
 * 
 * Tests for API health check endpoints
 */

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');

// Create a mock express app for testing
const app = express();
app.use(express.json());

// Mock the health routes
const healthRouter = require('../../routes/health');
app.use('/api/health', healthRouter);

describe('Health Routes', () => {
  describe('GET /api/health', () => {
    it('returns healthy status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });

    it('includes uptime in seconds', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });

    it('includes valid ISO timestamp', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp instanceof Date).toBe(true);
      expect(isNaN(timestamp.getTime())).toBe(false);
    });
  });

  describe('GET /api/health/detailed', () => {
    it('returns detailed health information', async () => {
      const response = await request(app)
        .get('/api/health/detailed')
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('checks');
      expect(response.body).toHaveProperty('system');
    });

    it('includes database check', async () => {
      const response = await request(app)
        .get('/api/health/detailed');

      expect(response.body.checks).toHaveProperty('database');
      expect(response.body.checks.database).toHaveProperty('status');
    });

    it('includes system metrics', async () => {
      const response = await request(app)
        .get('/api/health/detailed');

      expect(response.body.system).toHaveProperty('platform');
      expect(response.body.system).toHaveProperty('nodeVersion');
      expect(response.body.system).toHaveProperty('memory');
      expect(response.body.system).toHaveProperty('cpu');
      expect(response.body.system).toHaveProperty('process');
    });

    it('includes memory usage details', async () => {
      const response = await request(app)
        .get('/api/health/detailed');

      const memory = response.body.system.memory;
      expect(memory).toHaveProperty('total');
      expect(memory).toHaveProperty('free');
      expect(memory).toHaveProperty('used');
      expect(memory).toHaveProperty('usagePercent');
    });

    it('includes process memory details', async () => {
      const response = await request(app)
        .get('/api/health/detailed');

      const processInfo = response.body.system.process;
      expect(processInfo).toHaveProperty('pid');
      expect(processInfo).toHaveProperty('memoryUsage');
      expect(processInfo.memoryUsage).toHaveProperty('heapUsed');
    });

    it('includes environment info', async () => {
      const response = await request(app)
        .get('/api/health/detailed');

      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('environment');
    });
  });

  describe('GET /api/health/ready', () => {
    it('returns readiness status', async () => {
      const response = await request(app)
        .get('/api/health/ready')
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('ready');
    });

    it('indicates not ready when database is disconnected', async () => {
      // When mongoose is not connected
      const response = await request(app)
        .get('/api/health/ready');

      // Will be not ready since mongoose isn't connected in tests
      if (mongoose.connection.readyState !== 1) {
        expect(response.status).toBe(503);
        expect(response.body.ready).toBe(false);
      }
    });
  });

  describe('GET /api/health/live', () => {
    it('returns liveness status', async () => {
      const response = await request(app)
        .get('/api/health/live')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('alive', true);
    });

    it('always returns alive true', async () => {
      const response = await request(app)
        .get('/api/health/live')
        .expect(200);

      expect(response.body.alive).toBe(true);
    });
  });

  describe('GET /api/health/metrics', () => {
    it('returns Prometheus-compatible metrics', async () => {
      const response = await request(app)
        .get('/api/health/metrics')
        .expect('Content-Type', /text\/plain/)
        .expect(200);

      expect(response.text).toContain('symbio_api_uptime_seconds');
    });

    it('includes uptime metric', async () => {
      const response = await request(app)
        .get('/api/health/metrics')
        .expect(200);

      expect(response.text).toMatch(/symbio_api_uptime_seconds \d+/);
    });

    it('includes memory metrics', async () => {
      const response = await request(app)
        .get('/api/health/metrics')
        .expect(200);

      expect(response.text).toContain('symbio_api_memory_usage_bytes');
      expect(response.text).toContain('type="rss"');
      expect(response.text).toContain('type="heapTotal"');
      expect(response.text).toContain('type="heapUsed"');
    });

    it('includes MongoDB connection metric', async () => {
      const response = await request(app)
        .get('/api/health/metrics')
        .expect(200);

      expect(response.text).toContain('symbio_mongodb_connection_state');
    });

    it('includes system metrics', async () => {
      const response = await request(app)
        .get('/api/health/metrics')
        .expect(200);

      expect(response.text).toContain('symbio_system_memory_bytes');
      expect(response.text).toContain('symbio_system_cpu_cores');
    });

    it('formats metrics with proper Prometheus comments', async () => {
      const response = await request(app)
        .get('/api/health/metrics')
        .expect(200);

      expect(response.text).toContain('# HELP');
      expect(response.text).toContain('# TYPE');
    });
  });
});
