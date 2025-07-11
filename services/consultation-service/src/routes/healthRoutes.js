const express = require('express');
const router = express.Router();

/**
 * Health check routes for consultation service
 */

/**
 * GET /health
 * Basic health check
 */
router.get('/', async (req, res) => {
  try {
    const consultationService = req.app.locals.consultationService;
    
    // Check service availability
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'consultation-service',
      version: '1.0.0',
      uptime: Math.floor(process.uptime()),
      memory: process.memoryUsage(),
      activeConsultations: consultationService?.activeConsultations?.size || 0,
      totalConsultations: (consultationService?.activeConsultations?.size || 0) + 
                         (consultationService?.consultationHistory?.size || 0),
      supportedLanguages: consultationService?.supportedLanguages || [],
      environment: process.env.NODE_ENV || 'development'
    };
    
    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * GET /health/ready
 * Readiness check for Kubernetes
 */
router.get('/ready', async (req, res) => {
  try {
    const consultationService = req.app.locals.consultationService;
    
    // Check dependencies
    const checks = {
      consultation_service: consultationService ? 'ok' : 'error',
      i18n_service: 'checking',
      face_analysis_service: 'checking'
    };
    
    // Test internationalization service
    try {
      await consultationService.i18nClient.get('/health', { timeout: 5000 });
      checks.i18n_service = 'ok';
    } catch (error) {
      checks.i18n_service = 'error';
    }
    
    // Test face analysis service
    try {
      await consultationService.faceAnalysisClient.get('/health', { timeout: 5000 });
      checks.face_analysis_service = 'ok';
    } catch (error) {
      checks.face_analysis_service = 'error';
    }
    
    const allHealthy = Object.values(checks).every(status => status === 'ok');
    
    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      checks
    });
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * GET /health/live
 * Liveness check for Kubernetes
 */
router.get('/live', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    pid: process.pid,
    uptime: Math.floor(process.uptime())
  });
});

/**
 * GET /health/metrics
 * Basic metrics for monitoring
 */
router.get('/metrics', (req, res) => {
  try {
    const consultationService = req.app.locals.consultationService;
    
    const metrics = {
      timestamp: new Date().toISOString(),
      service: 'consultation-service',
      metrics: {
        active_consultations: consultationService?.activeConsultations?.size || 0,
        total_consultations: (consultationService?.activeConsultations?.size || 0) + 
                           (consultationService?.consultationHistory?.size || 0),
        memory_usage: process.memoryUsage(),
        cpu_usage: process.cpuUsage(),
        uptime_seconds: Math.floor(process.uptime()),
        nodejs_version: process.version,
        supported_languages: consultationService?.supportedLanguages?.length || 0
      }
    };
    
    res.json(metrics);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve metrics',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;