const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const winston = require('winston');
require('dotenv').config();

// Import services and middleware
const ConsultationService = require('./services/ConsultationService');
const LanguageMiddleware = require('./middleware/LanguageMiddleware');
const ErrorHandler = require('./middleware/ErrorHandler');
const ValidationMiddleware = require('./middleware/ValidationMiddleware');

// Import routes
const consultationRoutes = require('./routes/consultationRoutes');
const healthRoutes = require('./routes/healthRoutes');
const socketHandler = require('./socket/socketHandler');

// Logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Add console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing and compression
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// Language detection middleware
app.use(LanguageMiddleware(process.env.I18N_SERVICE_URL || 'https://internationalization-service-YOUR_PROJECT_ID.us-central1.run.app'));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - Language: ${req.language || 'unknown'} - IP: ${req.ip}`);
  next();
});

// Initialize consultation service
const consultationService = new ConsultationService({
  i18nServiceUrl: process.env.I18N_SERVICE_URL || 'https://internationalization-service-YOUR_PROJECT_ID.us-central1.run.app',
  faceAnalysisServiceUrl: process.env.FACE_ANALYSIS_SERVICE_URL || 'https://face-analysis-service-YOUR_PROJECT_ID.us-central1.run.app',
  logger
});

// Make services available to routes
app.locals.consultationService = consultationService;
app.locals.logger = logger;

// Routes
app.use('/api/consultation', consultationRoutes);
app.use('/api/health', healthRoutes);

// Socket.IO handling
socketHandler(io, consultationService, logger);

// Error handling
app.use(ErrorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    language: req.language || 'en-US'
  });
});

const PORT = process.env.PORT || 3010;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  logger.info(`🌍 Multi-Language Consultation Service running on ${HOST}:${PORT}`);
  logger.info(`📱 Socket.IO server ready for real-time consultations`);
  logger.info(`🗣️ Supporting languages: ${process.env.SUPPORTED_LANGUAGES || 'en-US,nl-NL,de-DE,es-ES,pt-PT,fr-FR,en-IE'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

module.exports = { app, server, io };