import pino from 'pino';
import { config } from '../config';

// Create logger instance
export const logger = pino({
  name: config.serviceName,
  level: config.logLevel || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  }
});

// Export logger types for TypeScript
export type Logger = typeof logger;