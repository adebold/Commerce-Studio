const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Queue } = require('bullmq');
const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');
require('dotenv').config();

const logger = require('./utils/logger');
const { provisionStore } = require('./jobs/provisioning-job');

class StoreProvisioningServer {
  constructor() {
    this.app = express();
    this.provisioningQueue = null;
    this.server = null;
  }

  async initialize() {
    try {
      // Initialize Redis connection for BullMQ
      const redisConnection = {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
      };

      // Create provisioning queue
      this.provisioningQueue = new Queue('store-provisioning', { connection: redisConnection });

      // Configure middleware
      this.app.use(helmet());
      this.app.use(cors({
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
        credentials: true
      }));
      this.app.use(express.json());

      // Setup Bull Board for monitoring queues
      const serverAdapter = new ExpressAdapter();
      serverAdapter.setBasePath('/admin/queues');
      createBullBoard({
        queues: [new BullMQAdapter(this.provisioningQueue)],
        serverAdapter,
      });
      this.app.use('/admin/queues', serverAdapter.getRouter());

      // Health check endpoint
      this.app.get('/health', (req, res) => {
        res.json({ status: 'healthy', service: 'store-provisioning' });
      });

      // API routes
      this.app.post('/api/provision/store', async (req, res) => {
        const { tenantId } = req.body;
        if (!tenantId) {
          return res.status(400).json({ error: 'tenantId is required' });
        }

        const job = await this.provisioningQueue.add('provision-store', { tenantId });
        
        res.status(202).json({
          jobId: job.id,
          status: 'queued',
          message: 'Store provisioning has been queued.'
        });
      });

      this.app.get('/api/provision/status/:jobId', async (req, res) => {
        const { jobId } = req.params;
        const job = await this.provisioningQueue.getJob(jobId);

        if (!job) {
          return res.status(404).json({ error: 'Job not found' });
        }

        const state = await job.getState();
        const result = job.returnvalue;

        res.json({
          jobId,
          state,
          progress: job.progress,
          result
        });
      });

      logger.info('Store Provisioning Service initialized successfully');

    } catch (error) {
      logger.error('Failed to initialize Store Provisioning Service:', error);
      throw error;
    }
  }

  async start() {
    const port = process.env.PROVISIONING_PORT || 3002;
    
    this.server = this.app.listen(port, () => {
      logger.info(`Store Provisioning Service running on port ${port}`);
    });
  }
}

// Start the service
if (require.main === module) {
  const service = new StoreProvisioningServer();
  service.initialize().then(() => service.start());
}

module.exports = StoreProvisioningServer;