import pino from 'pino';
import { config } from '../config';

// Create a logger instance
export const logger = pino({
  name: config.serviceName,
  level: config.logging.level,
  transport: config.logging.pretty
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  base: {
    env: config.environment,
    instance: config.instanceId,
  },
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
});

// Create a child logger with request context
export const createRequestLogger = (requestId: string) => {
  return logger.child({ request_id: requestId });
};

// Export a middleware for Express
export const requestLoggerMiddleware = (req: any, res: any, next: any) => {
  req.log = createRequestLogger(req.id);
  req.log.info({ req }, 'Incoming request');

  // Log response on finish
  res.on('finish', () => {
    req.log.info(
      {
        res: {
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
        },
        responseTime: Date.now() - req.startTime,
      },
      'Request completed'
    );
  });

  // Set start time
  req.startTime = Date.now();
  next();
};