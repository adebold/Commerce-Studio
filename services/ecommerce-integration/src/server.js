const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const logger = require('./utils/logger');
const { routeToAdapter } = require('./services/router');

class EcommerceIntegrationServer {
  constructor() {
    this.app = express();
    this.server = null;
  }

  async initialize() {
    try {
      // Configure middleware
      this.app.use(helmet());
      this.app.use(cors({
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3001'],
        credentials: true
      }));
      this.app.use(express.json());

      // Health check endpoint
      this.app.get('/health', (req, res) => {
        res.json({ status: 'healthy', service: 'ecommerce-integration' });
      });

      // API routes
      this.app.use('/api/v1', routeToAdapter);

      logger.info('E-commerce Integration Service initialized successfully');

    } catch (error) {
      logger.error('Failed to initialize E-commerce Integration Service:', error);
      throw error;
    }
  }

  async start() {
    const port = process.env.ECOMMERCE_INTEGRATION_PORT || 3003;
    
    this.server = this.app.listen(port, () => {
      logger.info(`E-commerce Integration Service running on port ${port}`);
    });
  }
}

// Start the service
if (require.main === module) {
  const service = new EcommerceIntegrationServer();
  service.initialize().then(() => service.start());
}

module.exports = EcommerceIntegrationServer;