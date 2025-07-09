const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  // Default error response
  let statusCode = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_ERROR';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
    code = 'VALIDATION_ERROR';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
    code = 'UNAUTHORIZED';
  } else if (err.code === '23505') { // PostgreSQL unique constraint violation
    statusCode = 409;
    message = 'Resource already exists';
    code = 'CONFLICT';
  } else if (err.code === '23503') { // PostgreSQL foreign key violation
    statusCode = 400;
    message = 'Invalid reference';
    code = 'INVALID_REFERENCE';
  }

  res.status(statusCode).json({
    error: message,
    code: code,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { errorHandler };