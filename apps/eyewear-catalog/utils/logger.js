/**
 * Logger Utility
 * 
 * Provides consistent logging throughout the application.
 * Includes request ID tracking and proper log formatting.
 */

const winston = require('winston');
const { v4: uuidv4 } = require('uuid');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'info';
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

// Add colors to winston
winston.addColors(colors);

// Define format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(info => {
    // Include request ID if available
    const requestId = info.requestId ? `[${info.requestId}]` : '';
    
    // Format message
    return `${info.timestamp} ${requestId} ${info.level}: ${info.message} ${info.durationMs ? `(${info.durationMs}ms)` : ''}`;
  })
);

// Define transport
const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error'
  }),
  new winston.transports.File({
    filename: 'logs/combined.log'
  })
];

// Create winston logger
const winstonLogger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports
});

// Create stream for Morgan
const stream = {
  write: (message) => winstonLogger.http(message.trim())
};

// Add request ID to requests
const addRequestId = (req, res, next) => {
  // Generate request ID if not provided in headers
  req.id = req.headers['x-request-id'] || uuidv4();
  
  // Add request ID to response headers
  res.setHeader('x-request-id', req.id);
  
  // Create request-specific logger
  req.logger = createRequestLogger(req);
  
  next();
};

// Create request logger
const createRequestLogger = (req) => {
  return {
    error: (message, meta = {}) => log('error', message, { requestId: req.id, ...meta }),
    warn: (message, meta = {}) => log('warn', message, { requestId: req.id, ...meta }),
    info: (message, meta = {}) => log('info', message, { requestId: req.id, ...meta }),
    http: (message, meta = {}) => log('http', message, { requestId: req.id, ...meta }),
    debug: (message, meta = {}) => log('debug', message, { requestId: req.id, ...meta })
  };
};

// Log message
const log = (level, message, meta = {}) => {
  if (typeof message === 'object') {
    message = JSON.stringify(message);
  }
  
  winstonLogger[level](message, meta);
};

// Create base logger
const logger = {
  error: (message, meta = {}) => log('error', message, meta),
  warn: (message, meta = {}) => log('warn', message, meta),
  info: (message, meta = {}) => log('info', message, meta),
  http: (message, meta = {}) => log('http', message, meta),
  debug: (message, meta = {}) => log('debug', message, meta),
  stream,
  addRequestId
};

// Export logger
module.exports = logger;