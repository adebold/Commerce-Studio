const logger = require('../utils/logger');

/**
 * Global error handling middleware
 * Must be the last middleware in the chain
 */
function errorHandler(err, req, res, next) {
  logger.error('Internationalization Service Error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    language: req.language
  });

  // Default error response
  let statusCode = 500;
  let message = 'Internal Server Error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Forbidden';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Not Found';
  } else if (err.code === 'ECONNREFUSED') {
    statusCode = 503;
    message = 'Service Unavailable';
  }

  // Build error response
  const errorResponse = {
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
      language: req.language || 'en-US'
    }
  };

  // Add error details in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.details = err.message;
    errorResponse.error.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
}

module.exports = errorHandler;