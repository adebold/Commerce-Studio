/**
 * Error handling middleware for consultation service
 */
const ErrorHandler = (err, req, res, next) => {
  // Log error details
  const logger = req.app.locals.logger;
  
  if (logger) {
    logger.error('Request error', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      ip: req.ip,
      language: req.language,
      tenantId: req.headers['x-tenant-id'],
      userId: req.headers['x-user-id']
    });
  }
  
  // Default error response
  let status = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_ERROR';
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Invalid request data';
    code = 'VALIDATION_ERROR';
  } else if (err.name === 'ConsultationNotFoundError') {
    status = 404;
    message = 'Consultation not found';
    code = 'CONSULTATION_NOT_FOUND';
  } else if (err.name === 'LanguageNotSupportedError') {
    status = 400;
    message = 'Language not supported';
    code = 'LANGUAGE_NOT_SUPPORTED';
  } else if (err.name === 'ServiceUnavailableError') {
    status = 503;
    message = 'Service temporarily unavailable';
    code = 'SERVICE_UNAVAILABLE';
  } else if (err.name === 'RateLimitError') {
    status = 429;
    message = 'Too many requests';
    code = 'RATE_LIMIT_EXCEEDED';
  } else if (err.status) {
    status = err.status;
    message = err.message;
    code = err.code || 'REQUEST_ERROR';
  }
  
  // Send error response
  res.status(status).json({
    success: false,
    error: {
      code,
      message,
      language: req.language || 'en-US',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown'
    },
    // Include stack trace in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = ErrorHandler;