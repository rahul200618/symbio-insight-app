/**
 * Health Check Routes
 * 
 * Provides endpoints for monitoring API health and uptime
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const os = require('os');

// Track server start time
const startTime = Date.now();

/**
 * GET /api/health
 * Basic health check
 */
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
  });
});

/**
 * GET /api/health/detailed
 * Detailed health check with system info
 */
router.get('/detailed', async (req, res) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {},
    system: {},
  };

  // Check MongoDB connection
  try {
    const mongoState = mongoose.connection.readyState;
    const mongoStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    
    healthCheck.checks.database = {
      status: mongoState === 1 ? 'healthy' : 'unhealthy',
      connection: mongoStates[mongoState],
      latency: null,
    };

    // Measure DB latency
    if (mongoState === 1) {
      const start = Date.now();
      await mongoose.connection.db.admin().ping();
      healthCheck.checks.database.latency = Date.now() - start;
    }
  } catch (error) {
    healthCheck.checks.database = {
      status: 'unhealthy',
      error: error.message,
    };
    healthCheck.status = 'degraded';
  }

  // System metrics
  healthCheck.system = {
    platform: os.platform(),
    arch: os.arch(),
    nodeVersion: process.version,
    memory: {
      total: Math.round(os.totalmem() / 1024 / 1024),
      free: Math.round(os.freemem() / 1024 / 1024),
      used: Math.round((os.totalmem() - os.freemem()) / 1024 / 1024),
      usagePercent: Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100),
    },
    cpu: {
      cores: os.cpus().length,
      model: os.cpus()[0]?.model,
      loadAverage: os.loadavg(),
    },
    process: {
      pid: process.pid,
      memoryUsage: {
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
      },
    },
  };

  // Check if any service is unhealthy
  const hasUnhealthy = Object.values(healthCheck.checks).some(
    check => check.status === 'unhealthy'
  );

  if (hasUnhealthy) {
    healthCheck.status = 'unhealthy';
    return res.status(503).json(healthCheck);
  }

  res.json(healthCheck);
});

/**
 * GET /api/health/ready
 * Readiness probe for Kubernetes/Docker
 */
router.get('/ready', async (req, res) => {
  const mongoState = mongoose.connection.readyState;
  
  if (mongoState === 1) {
    res.json({ ready: true });
  } else {
    res.status(503).json({ ready: false, reason: 'Database not connected' });
  }
});

/**
 * GET /api/health/live
 * Liveness probe for Kubernetes/Docker
 */
router.get('/live', (req, res) => {
  res.json({ alive: true });
});

/**
 * GET /api/health/metrics
 * Prometheus-compatible metrics endpoint
 */
router.get('/metrics', (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const memUsage = process.memoryUsage();
  const mongoState = mongoose.connection.readyState;

  const metrics = `
# HELP symbio_api_uptime_seconds Total uptime in seconds
# TYPE symbio_api_uptime_seconds counter
symbio_api_uptime_seconds ${uptimeSeconds}

# HELP symbio_api_memory_usage_bytes Process memory usage
# TYPE symbio_api_memory_usage_bytes gauge
symbio_api_memory_usage_bytes{type="rss"} ${memUsage.rss}
symbio_api_memory_usage_bytes{type="heapTotal"} ${memUsage.heapTotal}
symbio_api_memory_usage_bytes{type="heapUsed"} ${memUsage.heapUsed}
symbio_api_memory_usage_bytes{type="external"} ${memUsage.external}

# HELP symbio_mongodb_connection_state MongoDB connection state (1=connected)
# TYPE symbio_mongodb_connection_state gauge
symbio_mongodb_connection_state ${mongoState === 1 ? 1 : 0}

# HELP symbio_system_memory_bytes System memory
# TYPE symbio_system_memory_bytes gauge
symbio_system_memory_bytes{type="total"} ${os.totalmem()}
symbio_system_memory_bytes{type="free"} ${os.freemem()}

# HELP symbio_system_cpu_cores Number of CPU cores
# TYPE symbio_system_cpu_cores gauge
symbio_system_cpu_cores ${os.cpus().length}
`.trim();

  res.set('Content-Type', 'text/plain; charset=utf-8');
  res.send(metrics);
});

module.exports = router;
