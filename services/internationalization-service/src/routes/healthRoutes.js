const express = require('express');
const LanguageDetectionService = require('../services/LanguageDetectionService');

const router = express.Router();
const languageDetectionService = new LanguageDetectionService();

// Health check endpoint
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'internationalization-service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Detailed health check
router.get('/detailed', (req, res) => {
  try {
    const supportedLanguages = languageDetectionService.getAllSupportedLanguages();
    
    res.json({
      status: 'healthy',
      service: 'internationalization-service',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      features: {
        languageDetection: 'operational',
        geoLocation: 'operational',
        browserLanguageParsing: 'operational',
        userPreferences: 'operational',
        gdprCompliance: 'operational'
      },
      supportedLanguages: {
        total: supportedLanguages.length,
        languages: supportedLanguages.map(lang => lang.code)
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;