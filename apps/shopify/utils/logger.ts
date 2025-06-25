import winston from 'winston';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// In production (Vercel), we only use console logging
// File transports are removed as Vercel doesn't support persistent file storage
if (process.env.NODE_ENV === 'production') {
  logger.info('Running in production mode with console-only logging');
}

export const loggerMiddleware = (err: Error) => {
  logger.error('Application error:', {
    message: err.message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    timestamp: new Date().toISOString()
  });
};
