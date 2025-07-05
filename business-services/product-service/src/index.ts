import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';
import { config } from './config';
import { logger } from './utils/logger';
import { connectToMongoDB } from './infrastructure/mongodb';
import { connectToRedis } from './infrastructure/redis';
import { registerWithConsul } from './infrastructure/consul';
import { connectToRabbitMQ } from './infrastructure/rabbitmq';
import { setupTracing } from './infrastructure/tracing';
import { setupMetrics } from './infrastructure/metrics';
import { healthRouter } from './api/health';
import { metricsRouter } from './api/metrics';
import { productRouter } from './api/routes/product';
import { categoryRouter } from './api/routes/category';
import { variantRouter } from './api/routes/variant';
import { searchRouter } from './api/routes/search';
import { recommendationRouter } from './api/routes/recommendation';

// Setup tracing
setupTracing();

// Create Express server
const app = express();

// Express configuration
app.set('port', config.port);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Setup metrics
setupMetrics(app);

// Request ID middleware
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] as string || uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// API routes
app.use('/health', healthRouter);
app.use('/metrics', metricsRouter);
app.use('/api/products', productRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/products/:productId/variants', variantRouter);
app.use('/api/search', searchRouter);
app.use('/api/recommendations', recommendationRouter);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error({ err, req_id: req.id }, 'Error processing request');
  res.status(err.status || 500).json({
    error: {
      message: err.message,
      code: err.code || 'INTERNAL_SERVER_ERROR',
      request_id: req.id
    }
  });
});

// Start server
const server = app.listen(app.get('port'), () => {
  logger.info(
    `${config.serviceName} is running at http://localhost:${app.get('port')} in ${app.get('env')} mode`
  );
});

// Initialize service
const initService = async () => {
  try {
    // Connect to MongoDB
    await connectToMongoDB();
    logger.info('Connected to MongoDB');

    // Connect to Redis
    await connectToRedis();
    logger.info('Connected to Redis');

    // Register with Consul
    await registerWithConsul();
    logger.info('Registered with Consul');

    // Connect to RabbitMQ
    await connectToRabbitMQ();
    logger.info('Connected to RabbitMQ');

    logger.info(`${config.serviceName} initialized successfully`);
  } catch (error) {
    logger.error({ error }, 'Failed to initialize service');
    process.exit(1);
  }
};

// Handle graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down service...');
  
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
  
  // Force exit after timeout
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Handle process signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Initialize the service
initService().catch((error) => {
  logger.error({ error }, 'Service initialization failed');
  process.exit(1);
});

export default app;