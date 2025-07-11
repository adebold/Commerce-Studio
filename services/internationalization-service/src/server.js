const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const logger = require('./utils/logger');
const languageRoutes = require('./routes/languageRoutes');
const translationRoutes = require('./routes/translationRoutes');
const localizationRoutes = require('./routes/localizationRoutes');
const healthRoutes = require('./routes/healthRoutes');
const languageMiddleware = require('./middleware/languageMiddleware');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3008;

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global language detection middleware
app.use('/api', languageMiddleware);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    language: req.detectedLanguage,
    tenant: req.headers['x-tenant-id']
  });
  next();
});

// Routes
app.use('/api/languages', languageRoutes);
app.use('/api/translations', translationRoutes);
app.use('/api/localization', localizationRoutes);
app.use('/health', healthRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Commerce Studio Internationalization Service',
    version: '1.0.0',
    status: 'healthy',
    supportedLanguages: ['en-US', 'de-DE', 'nl-NL', 'es-ES', 'pt-PT', 'fr-FR'],
    endpoints: {
      health: '/health',
      languages: '/api/languages',
      translations: '/api/translations',
      localization: '/api/localization'
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  logger.info(`Internationalization Service running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info('Supported languages: en-US, de-DE, nl-NL, es-ES, pt-PT, fr-FR');
});

module.exports = app;