const express = require('express');
const router = express.Router();

/**
 * Health check endpoint
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'internationalization-service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    detectedLanguage: req.language || 'en-US'
  });
});

/**
 * Detailed health check
 */
router.get('/detailed', (req, res) => {
  const memUsage = process.memoryUsage();
  
  res.status(200).json({
    status: 'healthy',
    service: 'internationalization-service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    memory: {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)} MB`
    },
    language: {
      detected: req.language || 'en-US',
      isEuUser: req.languageInfo?.isEuUser || false,
      detectionMethod: req.languageInfo?.detectionMethod || 'unknown'
    },
    supportedLanguages: ['nl-NL', 'de-DE', 'es-ES', 'pt-PT', 'fr-FR', 'en-IE', 'en-US']
  });
});

module.exports = router;