/**
 * Logger utility for PMS integration
 */
const winston = require('winston');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.printf(info => {
    const { timestamp, level, message, ...rest } = info;
    const formattedTimestamp = new Date(timestamp).toISOString();
    return `${formattedTimestamp} [${level.toUpperCase()}]: ${message} ${
      Object.keys(rest).length > 0 ? JSON.stringify(rest) : ''
    }`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    // Console transport for all environments
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(info => {
          const { timestamp, level, message, ...rest } = info;
          const formattedTimestamp = new Date(timestamp).toISOString();
          return `${formattedTimestamp} [${level}]: ${message} ${
            Object.keys(rest).length > 0 ? JSON.stringify(rest) : ''
          }`;
        })
      )
    }),
    
    // File transport for non-development environments
    ...(process.env.NODE_ENV !== 'development'
      ? [
          new winston.transports.File({ 
            filename: 'logs/error.log', 
            level: 'error' 
          }),
          new winston.transports.File({ 
            filename: 'logs/combined.log' 
          })
        ]
      : [])
  ]
});

module.exports = logger;
