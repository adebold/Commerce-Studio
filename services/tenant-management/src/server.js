const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Pool } = require('pg');
require('dotenv').config();

const createTenantRoutes = require('./routes/tenantRoutes');
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
      // Initialize database connection
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      // Test database connection
      await this.pool.query('SELECT NOW()');
      logger.info('Database connected successfully');

      // Configure middleware
      this.app.use(helmet());
      this.app.use(cors({
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
        credentials: true
      }));
      this.app.use(express.json({ limit: '10mb' }));
      this.app.use(express.urlencoded({ extended: true }));

      // Health check endpoint
      this.app.get('/health', (req, res) => {
        res.json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          service: 'tenant-management',
          version: process.env.npm_package_version || '1.0.0'
        });
      });

      // API routes
      this.app.use('/api/tenants', createTenantRoutes(this.pool));

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

    } catch (error) {
      logger.error('Failed to initialize Tenant Management Service:', error);
      throw error;
    }
  }

  async start() {
    const port = process.env.PORT || 3001;
    
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