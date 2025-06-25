const express = require('express');
const { verifyShopifySession } = require('../middleware/auth');
const Shop = require('../models/Shop');
const logger = require('../utils/logger');
const skuGenieApi = require('../services/skuGenieApi');

const router = express.Router();

// Apply session verification middleware to all routes
router.use(verifyShopifySession);

/**
 * Get shop settings
 */
router.get('/', async (req, res) => {
  try {
    const { shop } = req;
    
    res.json({
      settings: shop.settings,
      shopInfo: shop.shopInfo,
      lastSyncedAt: shop.lastSyncedAt,
      syncStatus: shop.syncStatus,
    });
  } catch (error) {
    logger.error(`Error getting settings: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Update shop settings
 */
router.put('/', async (req, res) => {
  try {
    const { shop } = req;
    const { settings } = req.body;
    
    // Validate settings
    if (!settings) {
      return res.status(400).json({ error: 'Settings are required' });
    }
    
    // Update settings
    shop.settings = {
      ...shop.settings,
      ...settings,
    };
    
    // Save shop
    await shop.save();
    
    // Update data source in SKU-Genie if sync settings changed
    if (settings.syncProducts !== undefined || 
        settings.syncInterval !== undefined || 
        settings.syncDirection !== undefined) {
      try {
        await skuGenieApi.updateDataSource(shop.clientId, shop.shopDomain, {
          sync_frequency: shop.settings.syncInterval ? `*/${shop.settings.syncInterval} * * * *` : '0 0 * * *',
          active: shop.settings.syncProducts,
        });
        
        logger.info(`Updated data source settings in SKU-Genie for shop ${shop.shopDomain}`);
      } catch (error) {
        logger.error(`Error updating data source in SKU-Genie: ${error.message}`);
        // Continue anyway, we don't want to fail the settings update
      }
    }
    
    res.json({
      message: 'Settings updated successfully',
      settings: shop.settings,
    });
  } catch (error) {
    logger.error(`Error updating settings: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Get product mapping
 */
router.get('/mapping', async (req, res) => {
  try {
    const { shop } = req;
    
    res.json({
      mapping: shop.settings.productMapping,
    });
  } catch (error) {
    logger.error(`Error getting product mapping: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Update product mapping
 */
router.put('/mapping', async (req, res) => {
  try {
    const { shop } = req;
    const { mapping } = req.body;
    
    // Validate mapping
    if (!mapping) {
      return res.status(400).json({ error: 'Mapping is required' });
    }
    
    // Update mapping
    shop.settings.productMapping = new Map(Object.entries(mapping));
    
    // Save shop
    await shop.save();
    
    res.json({
      message: 'Product mapping updated successfully',
      mapping: Object.fromEntries(shop.settings.productMapping),
    });
  } catch (error) {
    logger.error(`Error updating product mapping: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Get sync status
 */
router.get('/sync-status', async (req, res) => {
  try {
    const { shop } = req;
    
    res.json({
      lastSyncedAt: shop.lastSyncedAt,
      syncStatus: shop.syncStatus,
      syncErrors: shop.syncErrors,
    });
  } catch (error) {
    logger.error(`Error getting sync status: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Get sync jobs
 */
router.get('/sync-jobs', async (req, res) => {
  try {
    const { shop } = req;
    const { limit = 10, status } = req.query;
    
    // Build filter
    const filter = { shopDomain: shop.shopDomain };
    
    if (status) {
      filter.status = status;
    }
    
    // Get sync jobs
    const syncJobs = await SyncJob.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json({
      syncJobs,
    });
  } catch (error) {
    logger.error(`Error getting sync jobs: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Get a sync job by ID
 */
router.get('/sync-jobs/:id', async (req, res) => {
  try {
    const { shop } = req;
    const { id } = req.params;
    
    // Find the sync job
    const syncJob = await SyncJob.findOne({
      _id: id,
      shopDomain: shop.shopDomain,
    });
    
    if (!syncJob) {
      return res.status(404).json({ error: 'Sync job not found' });
    }
    
    res.json(syncJob);
  } catch (error) {
    logger.error(`Error getting sync job: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Cancel a sync job
 */
router.post('/sync-jobs/:id/cancel', async (req, res) => {
  try {
    const { shop } = req;
    const { id } = req.params;
    
    // Find the sync job
    const syncJob = await SyncJob.findOne({
      _id: id,
      shopDomain: shop.shopDomain,
    });
    
    if (!syncJob) {
      return res.status(404).json({ error: 'Sync job not found' });
    }
    
    // Check if job can be cancelled
    if (syncJob.status !== 'queued' && syncJob.status !== 'in_progress') {
      return res.status(400).json({ error: 'Sync job cannot be cancelled' });
    }
    
    // Cancel the job
    syncJob.status = 'cancelled';
    syncJob.completedAt = new Date();
    await syncJob.save();
    
    res.json({
      message: 'Sync job cancelled successfully',
      syncJob,
    });
  } catch (error) {
    logger.error(`Error cancelling sync job: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;