/**
 * Eyewear Catalog Application Server
 * 
 * Express server for the Eyewear Catalog Shopify application.
 * Handles API endpoints, Shopify authentication, and data synchronization.
 */

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const logger = require('./utils/logger');
const { syncService } = require('./services/sync-service');

// Import routes
const authRoutes = require('./routes/auth');
const shopifyRoutes = require('./routes/shopify');
const catalogRoutes = require('./routes/catalog');
const syncRoutes = require('./routes/sync');
const webhookRoutes = require('./routes/webhooks');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  logger.info('Connected to MongoDB');
})
.catch(error => {
  logger.error('MongoDB connection error:', error);
  process.exit(1);
});

// Configure CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
  process.env.ALLOWED_ORIGINS.split(',') : 
  ['https://admin.shopify.com'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    
    return callback(null, true);
  },
  credentials: true
}));

// Request logging
app.use(morgan('combined', { stream: logger.stream }));

// Add request ID to requests
app.use(logger.addRequestId);

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'eyewear-catalog-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 24 * 60 * 60 // 24 hours
  })
}));

// Parse JSON for all routes except webhooks
// Webhooks need raw body for HMAC verification
app.use((req, res, next) => {
  if (req.path.startsWith('/webhooks')) {
    return next();
  }
  
  express.json()(req, res, next);
});

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/auth', authRoutes);
app.use('/shopify', shopifyRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/sync', syncRoutes);
app.use('/webhooks', webhookRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  // Log error
  req.logger ? 
    req.logger.error(`Error: ${err.message}`, { error: err, statusCode }) : 
    logger.error(`Error: ${err.message}`, { error: err, statusCode });
  
  res.status(statusCode).json({
    error: true,
    message: process.env.NODE_ENV === 'production' ? 
      'An error occurred' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT}`);
  
  // Initialize sync service
  try {
    await syncService.initialize();
    logger.info('Sync service initialized');
  } catch (error) {
    logger.error('Error initializing sync service:', error);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection:', reason);
});

// Export app for testing
module.exports = app;