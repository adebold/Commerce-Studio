const { Worker } = require('bullmq');
const axios = require('axios');
const ejs = require('ejs');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs').promises;

const logger = require('../utils/logger');

const storage = new Storage();
const tenantServiceUrl = process.env.TENANT_SERVICE_URL || 'http://localhost:3001';

const provisionStore = async (job) => {
  const { tenantId } = job.data;
  logger.info(`Starting provisioning for tenant: ${tenantId}`);

  try {
    // 1. Fetch tenant configuration
    await job.updateProgress(10);
    const configResponse = await axios.get(`${tenantServiceUrl}/api/tenants/${tenantId}/config`, {
      headers: { Authorization: `Bearer ${process.env.ADMIN_API_KEY}` }
    });
    const tenantConfig = configResponse.data.data;
    logger.info(`Fetched configuration for tenant: ${tenantId}`);

    // 2. Render store templates
    await job.updateProgress(30);
    const templateDir = path.join(__dirname, '../templates/default');
    const templateFiles = await fs.readdir(templateDir);
    
    const renderedFiles = await Promise.all(templateFiles.map(async (file) => {
      const filePath = path.join(templateDir, file);
      const templateContent = await fs.readFile(filePath, 'utf-8');
      const renderedContent = ejs.render(templateContent, { tenant: tenantConfig.default });
      return { name: file, content: renderedContent };
    }));
    logger.info(`Rendered templates for tenant: ${tenantId}`);

    // 3. Upload to Google Cloud Storage
    await job.updateProgress(60);
    const bucketName = process.env.GCS_BUCKET_NAME;
    const bucket = storage.bucket(bucketName);

    await Promise.all(renderedFiles.map(async (file) => {
      const gcsFile = bucket.file(`tenant-stores/${tenantId}/${file.name}`);
      await gcsFile.save(file.content, {
        metadata: { contentType: getContentType(file.name) }
      });
    }));
    logger.info(`Uploaded files to GCS for tenant: ${tenantId}`);

    // 4. Update tenant status
    await job.updateProgress(90);
    const storeUrl = `https://${tenantId}.commercestudio.store`; // Example URL
    await axios.put(`${tenantServiceUrl}/api/tenants/${tenantId}`, {
      status: 'deployed',
      storeUrl: storeUrl
    }, {
      headers: { Authorization: `Bearer ${process.env.ADMIN_API_KEY}` }
    });
    logger.info(`Updated tenant status to deployed: ${tenantId}`);

    await job.updateProgress(100);
    logger.info(`Provisioning complete for tenant: ${tenantId}`);
    return { storeUrl };

  } catch (error) {
    logger.error(`Failed to provision store for tenant ${tenantId}:`, error);
    await axios.put(`${tenantServiceUrl}/api/tenants/${tenantId}`, {
      status: 'provisioning_failed'
    }, {
      headers: { Authorization: `Bearer ${process.env.ADMIN_API_KEY}` }
    });
    throw error;
  }
};

const getContentType = (fileName) => {
  if (fileName.endsWith('.html')) return 'text/html';
  if (fileName.endsWith('.css')) return 'text/css';
  if (fileName.endsWith('.js')) return 'application/javascript';
  return 'application/octet-stream';
};

// Initialize the worker
const startWorker = () => {
  const redisConnection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  };

  const worker = new Worker('store-provisioning', provisionStore, {
    connection: redisConnection,
    concurrency: 5, // Process up to 5 jobs concurrently
  });

  worker.on('completed', (job, result) => {
    logger.info(`Job ${job.id} completed successfully. Result:`, result);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Job ${job.id} failed with error:`, err);
  });

  logger.info('Provisioning worker started...');
};

if (require.main === module) {
  startWorker();
}

module.exports = { provisionStore, startWorker };