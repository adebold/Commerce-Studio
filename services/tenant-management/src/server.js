const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Pool } = require('pg');
require('dotenv').config();

const createTenantRoutes = require('./routes/tenantRoutes');
const DatabaseMigrations = require('./database/migrations');
const logger = require('./utils/logger');
const { errorHandler } = require('./middleware/errorHandler');

class TenantManagementServer {
  constructor() {
    this.app = express();
    this.pool = null;
    this.server = null;
  }

  async initialize() {
    try {
      // Configure middleware first
      this.app.use(helmet());
      this.app.use(cors({
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
        credentials: true
      }));
      this.app.use(express.json({ limit: '10mb' }));
      this.app.use(express.urlencoded({ extended: true }));

      // Health check endpoint (always available)
      this.app.get('/health', (req, res) => {
        res.json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          service: 'tenant-management',
          version: process.env.npm_package_version || '1.0.0',
          database: this.pool ? 'connected' : 'disconnected'
        });
      });

      // Database status endpoint
      this.app.get('/status', async (req, res) => {
        try {
          if (!this.pool) {
            return res.status(503).json({
              status: 'database not initialized',
              timestamp: new Date().toISOString()
            });
          }
          
          const result = await this.pool.query('SELECT NOW()');
          res.json({
            status: 'database connected',
            timestamp: new Date().toISOString(),
            database_time: result.rows[0].now
          });
        } catch (error) {
          res.status(503).json({
            status: 'database error',
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      });

      // API routes (will be available after DB initialization)
      this.app.use('/api/tenants', (req, res, next) => {
        if (!this.pool) {
          return res.status(503).json({
            error: 'Database not initialized yet',
            message: 'Please wait for database initialization to complete'
          });
        }
        return createTenantRoutes(this.pool)(req, res, next);
      });

      // Error handling middleware
      this.app.use(errorHandler);

      // 404 handler
      this.app.use('*', (req, res) => {
        res.status(404).json({
          error: 'Route not found',
          path: req.originalUrl
        });
      });

      logger.info('Tenant Management Service initialized successfully');

      // Initialize database asynchronously (non-blocking)
      this.initializeDatabase();

    } catch (error) {
      logger.error('Failed to initialize Tenant Management Service:', error);
      throw error;
    }
  }

  async initializeDatabase() {
    try {
      logger.info('Starting database initialization...');
      
      // Initialize database connection
      const dbConfig = {
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000, // Increased timeout
      };

      logger.info(`Current NODE_ENV: ${process.env.NODE_ENV}`);

      if (process.env.NODE_ENV === 'production') {
        // In production, use the Cloud SQL socket path.
        dbConfig.host = `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`;
        dbConfig.user = process.env.DB_USER;
        dbConfig.password = process.env.DB_PASSWORD;
        dbConfig.database = process.env.DB_NAME;
        logger.info('Using Cloud SQL socket for database connection:', { host: dbConfig.host, user: dbConfig.user, database: dbConfig.database });
      } else {
        // In development, use the connection string.
        dbConfig.connectionString = process.env.DATABASE_URL;
        logger.info('Using local database connection string.');
      }

      this.pool = new Pool(dbConfig);

      // Initialize database migrations with retry logic
      const migrations = new DatabaseMigrations(this.pool);
      await migrations.testConnection();
      await migrations.runMigrations();
      logger.info('Database connected and migrations completed successfully');

    } catch (error) {
      logger.error('Database initialization failed:', error);
      // Don't crash the server, just log the error
      // The API routes will return 503 until database is ready
    }
  }

  async start() {
    const port = process.env.PORT || 8080;
    
    this.server = this.app.listen(port, () => {
      logger.info(`Tenant Management Service running on port ${port}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
  }

  async shutdown() {
    logger.info('Shutting down Tenant Management Service...');
    
    if (this.server) {
      this.server.close(() => {
        logger.info('HTTP server closed');
      });
    }

    if (this.pool) {
      await this.pool.end();
      logger.info('Database connections closed');
    }

    process.exit(0);
  }
}

// Start the service
async function startService() {
  const service = new TenantManagementServer();
  
  try {
    await service.initialize();
    await service.start();
  } catch (error) {
    logger.error('Failed to start Tenant Management Service:', error);
    process.exit(1);
  }
}

// Only start if this file is run directly
if (require.main === module) {
  startService();
}

module.exports = TenantManagementServer;