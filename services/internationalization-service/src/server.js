const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const languageRoutes = require('./routes/languageRoutes');
const translationRoutes = require('./routes/translationRoutes');
const localizationRoutes = require('./routes/localizationRoutes');
const healthRoutes = require('./routes/healthRoutes');
const languageMiddleware = require('./middleware/languageMiddleware');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3008;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Language detection middleware
app.use(languageMiddleware);

// Health check (before other routes)
app.use('/health', healthRoutes);

// API routes
app.use('/api/language', languageRoutes);
app.use('/api/translations', translationRoutes);
app.use('/api/localization', localizationRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Commerce Studio Internationalization Service',
    version: '1.0.0',
    status: 'operational',
    supportedLanguages: ['nl-NL', 'de-DE', 'es-ES', 'pt-PT', 'fr-FR', 'en-IE', 'en-US'],
    endpoints: {
      health: '/health',
      language: '/api/language',
      translations: '/api/translations',
      localization: '/api/localization'
    },
    detectedLanguage: req.language || 'en-US'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🌍 Internationalization Service running on port ${PORT}`);
  logger.info(`📍 Supported languages: Dutch (NL), German (DE), Spanish (ES), Portuguese (PT), French (FR), Irish English (IE), US English (US)`);
});

module.exports = app;