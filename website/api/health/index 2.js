/**
 * Health Monitoring API - Main Entry Point
 * Provides health check endpoints for Cloud Run services
 */

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { HealthMonitorService } = require('./services/health-monitor');
const { AlertManager } = require('./services/alert-manager');
const { MetricsAggregator } = require('./services/metrics-aggregator');
const { NotificationService } = require('./utils/notification-service');
const { setupWebSocket } = require('./websocket/health-websocket');
const { CLOUD_RUN_SERVICES } = require('./config/cloud-run-services');

const app = express();
const PORT = process.env.HEALTH_API_PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize services
const healthMonitor = new HealthMonitorService();
const alertManager = new AlertManager();
const metricsAggregator = new MetricsAggregator();
const notificationService = new NotificationService();

// API Key authentication middleware
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.HEALTH_API_KEY;
  
  if (!apiKey || apiKey !== validApiKey) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Valid API key required' 
    });
  }
  
  next();
};

// Apply authentication to all routes
app.use('/api/', authenticateApiKey);

// Health check for the health monitoring service itself
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'health-monitoring-api',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Core API Routes

/**
 * GET /api/v1/services
 * Returns list of monitored services with current status
 */
app.get('/api/v1/services', async (req, res) => {
  try {
    const services = await healthMonitor.getAllServicesStatus();
    res.json({
      services,
      timestamp: new Date().toISOString(),
      total_services: services.length
    });
  } catch (error) {
    console.error('Error fetching services status:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch services status'
    });
  }
});

/**
 * GET /api/v1/services/:serviceId/status
 * Returns current status for specific service
 */
app.get('/api/v1/services/:serviceId/status', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { include_dependencies, include_history } = req.query;
    
    const options = {
      includeDependencies: include_dependencies === 'true',
      includeHistory: include_history === 'true'
    };
    
    const status = await healthMonitor.getServiceStatus(serviceId, options);
    
    if (!status) {
      return res.status(404).json({
        error: 'Service Not Found',
        message: `Service ${serviceId} not found`
      });
    }
    
    res.json(status);
  } catch (error) {
    console.error(`Error fetching status for service ${req.params.serviceId}:`, error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch service status'
    });
  }
});

/**
 * GET /api/v1/services/:serviceId/metrics
 * Returns historical metrics for specific timeframe
 */
app.get('/api/v1/services/:serviceId/metrics', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { 
      timeframe = '24h', 
      metric_types, 
      resolution = '1h' 
    } = req.query;
    
    const metricTypes = metric_types ? metric_types.split(',') : null;
    
    const metrics = await metricsAggregator.getServiceMetrics(serviceId, {
      timeframe,
      metricTypes,
      resolution
    });
    
    res.json({
      service_id: serviceId,
      timeframe,
      resolution,
      metrics
    });
  } catch (error) {
    console.error(`Error fetching metrics for service ${req.params.serviceId}:`, error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch service metrics'
    });
  }
});

/**
 * GET /api/v1/alerts
 * Returns filtered alerts
 */
app.get('/api/v1/alerts', async (req, res) => {
  try {
    const { status, severity, service_id, limit = 50 } = req.query;
    
    const filters = {
      status,
      severity,
      service_id,
      limit: parseInt(limit)
    };
    
    const alerts = await alertManager.getAlerts(filters);
    
    res.json({
      alerts,
      total: alerts.length,
      filters
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch alerts'
    });
  }
});

/**
 * POST /api/v1/alerts/:alertId/acknowledge
 * Acknowledges an active alert
 */
app.post('/api/v1/alerts/:alertId/acknowledge', async (req, res) => {
  try {
    const { alertId } = req.params;
    const { acknowledged_by, comment } = req.body;
    
    if (!acknowledged_by) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'acknowledged_by field is required'
      });
    }
    
    const result = await alertManager.acknowledgeAlert(alertId, {
      acknowledged_by,
      comment,
      acknowledged_at: new Date().toISOString()
    });
    
    res.json(result);
  } catch (error) {
    console.error(`Error acknowledging alert ${req.params.alertId}:`, error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to acknowledge alert'
    });
  }
});

/**
 * GET /api/v1/dashboard/overview
 * Returns dashboard overview data
 */
app.get('/api/v1/dashboard/overview', async (req, res) => {
  try {
    const overview = await healthMonitor.getDashboardOverview();
    res.json(overview);
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch dashboard overview'
    });
  }
});

// Alert Management Routes

/**
 * POST /api/v1/alerts/rules
 * Creates new alert rule
 */
app.post('/api/v1/alerts/rules', async (req, res) => {
  try {
    const rule = await alertManager.createAlertRule(req.body);
    res.status(201).json(rule);
  } catch (error) {
    console.error('Error creating alert rule:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create alert rule'
    });
  }
});

/**
 * PUT /api/v1/alerts/rules/:ruleId
 * Updates alert rule
 */
app.put('/api/v1/alerts/rules/:ruleId', async (req, res) => {
  try {
    const { ruleId } = req.params;
    const rule = await alertManager.updateAlertRule(ruleId, req.body);
    res.json(rule);
  } catch (error) {
    console.error(`Error updating alert rule ${req.params.ruleId}:`, error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update alert rule'
    });
  }
});

/**
 * DELETE /api/v1/alerts/rules/:ruleId
 * Deletes alert rule
 */
app.delete('/api/v1/alerts/rules/:ruleId', async (req, res) => {
  try {
    const { ruleId } = req.params;
    await alertManager.deleteAlertRule(ruleId);
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting alert rule ${req.params.ruleId}:`, error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete alert rule'
    });
  }
});

// Configuration Routes

/**
 * GET /api/v1/config/thresholds
 * Returns current alert thresholds
 */
app.get('/api/v1/config/thresholds', async (req, res) => {
  try {
    const thresholds = await alertManager.getThresholds();
    res.json(thresholds);
  } catch (error) {
    console.error('Error fetching thresholds:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch thresholds'
    });
  }
});

/**
 * PUT /api/v1/config/thresholds
 * Updates alert thresholds
 */
app.put('/api/v1/config/thresholds', async (req, res) => {
  try {
    const thresholds = await alertManager.updateThresholds(req.body);
    res.json(thresholds);
  } catch (error) {
    console.error('Error updating thresholds:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update thresholds'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Health Monitoring API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Monitoring ${Object.keys(CLOUD_RUN_SERVICES).length} Cloud Run services`);
});

// Setup WebSocket server
setupWebSocket(server, {
  healthMonitor,
  alertManager,
  metricsAggregator
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

module.exports = app;