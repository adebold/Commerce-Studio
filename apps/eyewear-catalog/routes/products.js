/**
 * Products Routes
 * 
 * Handles API endpoints for Shopify product management operations.
 */

const express = require('express');
const router = express.Router();
const { shopifyService } = require('../services/shopify-service');
const { eyewearService } = require('../services/eyewear-service');
const { syncService } = require('../services/sync-service');
const { verifyToken } = require('./auth');
const db = require('../utils/db');
const logger = require('../utils/logger');

// Get Shopify products
router.get('/shopify', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 50, status = 'any' } = req.query;
    
    // Get products from Shopify
    const products = await shopifyService.getProducts(
      req.accessToken, 
      req.shop, 
      {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        status
      }
    );
    
    res.status(200).json(products);
  } catch (error) {
    logger.error('Error getting Shopify products:', error);
    res.status(500).json({ error: 'Failed to get Shopify products' });
  }
});

// Get a specific Shopify product
router.get('/shopify/:productId', verifyToken, async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Get product from Shopify
    const product = await shopifyService.getProduct(
      req.accessToken,
      req.shop,
      productId
    );
    
    res.status(200).json(product);
  } catch (error) {
    logger.error(`Error getting Shopify product ${req.params.productId}:`, error);
    res.status(500).json({ error: 'Failed to get Shopify product' });
  }
});

// Import a product from eyewear database to Shopify
router.post('/import', verifyToken, async (req, res) => {
  try {
    const { productId, status = 'draft', importImages = true } = req.body;
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    
    // Check if product is already imported
    const importStatus = await db.getProductImportStatus(req.shop, productId);
    
    if (importStatus === 'imported') {
      return res.status(400).json({ error: 'Product is already imported' });
    }
    
    // Get product details from eyewear database
    const integration = await eyewearService.getShopIntegration(req.shop);
    const product = await integration.getProductDetails(productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found in eyewear database' });
    }
    
    // Import product to Shopify
    const shopifyProduct = await shopifyService.importProduct(
      req.accessToken,
      req.shop,
      product,
      {
        status,
        includeImages: importImages,
        includeVariants: true
      }
    );
    
    // Save import status
    await db.saveImportedProduct(
      req.shop,
      productId,
      shopifyProduct.id,
      'imported'
    );
    
    // Update usage stats
    await db.incrementUsageStat(req.shop, 'productsImported');
    
    res.status(200).json({ 
      success: true, 
      product: shopifyProduct,
      importedAt: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Error importing product ${req.body.productId}:`, error);
    
    // Save failure status
    if (req.body.productId) {
      await db.setProductImportStatus(req.shop, req.body.productId, 'failed');
    }
    
    res.status(500).json({ error: 'Failed to import product' });
  }
});

// Start a bulk import job
router.post('/bulk-import', verifyToken, async (req, res) => {
  try {
    const { productIds, options = {} } = req.body;
    
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: 'Product IDs array is required' });
    }
    
    // Create a job ID
    const jobId = `import_${Date.now()}`;
    
    // Save job to database
    await db.saveBulkImportJob(jobId, req.shop, {
      productIds,
      options,
      status: 'queued',
      createdAt: new Date().toISOString()
    });
    
    // Start the job in the background
    shopifyService.startBulkImportJob(
      req.accessToken,
      req.shop,
      productIds,
      options
    ).catch(error => {
      logger.error(`Error in bulk import job ${jobId}:`, error);
      db.updateBulkImportJobStatus(jobId, 'failed', {
        error: error.message || 'Unknown error'
      });
    });
    
    res.status(200).json({ 
      success: true, 
      jobId,
      status: 'queued',
      productCount: productIds.length
    });
  } catch (error) {
    logger.error('Error starting bulk import job:', error);
    res.status(500).json({ error: 'Failed to start bulk import job' });
  }
});

// Get bulk import job status
router.get('/bulk-import/:jobId', verifyToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Get job from database
    const job = await db.getBulkImportJob(jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Bulk import job not found' });
    }
    
    // Check if shop matches
    if (job.shop !== req.shop) {
      return res.status(403).json({ error: 'Unauthorized access to job' });
    }
    
    res.status(200).json(job);
  } catch (error) {
    logger.error(`Error getting bulk import job ${req.params.jobId}:`, error);
    res.status(500).json({ error: 'Failed to get bulk import job status' });
  }
});

// Start a sync job
router.post('/sync', verifyToken, async (req, res) => {
  try {
    const { brandIds, options = {} } = req.body;
    
    if (!brandIds || !Array.isArray(brandIds) || brandIds.length === 0) {
      return res.status(400).json({ error: 'Brand IDs array is required' });
    }
    
    // Create a sync ID
    const syncId = `sync_${Date.now()}`;
    
    // Create sync job
    const syncJob = {
      id: syncId,
      shop: req.shop,
      status: 'initializing',
      brandIds,
      options,
      progress: {
        processed: 0,
        total: 0,
        succeeded: 0,
        failed: 0,
        skipped: 0
      },
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.saveSyncJob(syncJob);
    
    // Start sync in the background
    syncService.startSync(
      syncId,
      req.shop,
      req.accessToken,
      brandIds,
      options
    ).catch(error => {
      logger.error(`Error in sync job ${syncId}:`, error);
      db.updateSyncJobStatus(syncId, 'failed', {
        error: error.message || 'Unknown error'
      });
    });
    
    res.status(200).json({ 
      success: true, 
      syncId,
      status: 'initializing',
      brandCount: brandIds.length
    });
  } catch (error) {
    logger.error('Error starting sync job:', error);
    res.status(500).json({ error: 'Failed to start sync job' });
  }
});

// Get sync job status
router.get('/sync/:syncId', verifyToken, async (req, res) => {
  try {
    const { syncId } = req.params;
    
    // Get sync job from database
    const syncJob = await db.getSyncJob(syncId);
    
    if (!syncJob) {
      return res.status(404).json({ error: 'Sync job not found' });
    }
    
    // Check if shop matches
    if (syncJob.shop !== req.shop) {
      return res.status(403).json({ error: 'Unauthorized access to sync job' });
    }
    
    res.status(200).json(syncJob);
  } catch (error) {
    logger.error(`Error getting sync job ${req.params.syncId}:`, error);
    res.status(500).json({ error: 'Failed to get sync job status' });
  }
});

// Cancel a sync job
router.post('/sync/:syncId/cancel', verifyToken, async (req, res) => {
  try {
    const { syncId } = req.params;
    
    // Get sync job from database
    const syncJob = await db.getSyncJob(syncId);
    
    if (!syncJob) {
      return res.status(404).json({ error: 'Sync job not found' });
    }
    
    // Check if shop matches
    if (syncJob.shop !== req.shop) {
      return res.status(403).json({ error: 'Unauthorized access to sync job' });
    }
    
    // Check if job can be cancelled
    if (syncJob.status === 'completed' || syncJob.status === 'failed' || syncJob.status === 'cancelled') {
      return res.status(400).json({ error: `Sync job is already ${syncJob.status}` });
    }
    
    // Cancel the sync
    await syncService.cancelSync(syncId);
    
    res.status(200).json({ 
      success: true, 
      status: 'cancelling'
    });
  } catch (error) {
    logger.error(`Error cancelling sync job ${req.params.syncId}:`, error);
    res.status(500).json({ error: 'Failed to cancel sync job' });
  }
});

// Retry failed items from a sync
router.post('/sync/:syncId/retry', verifyToken, async (req, res) => {
  try {
    const { syncId } = req.params;
    const { options = {} } = req.body;
    
    // Get sync job from database
    const syncJob = await db.getSyncJob(syncId);
    
    if (!syncJob) {
      return res.status(404).json({ error: 'Sync job not found' });
    }
    
    // Check if shop matches
    if (syncJob.shop !== req.shop) {
      return res.status(403).json({ error: 'Unauthorized access to sync job' });
    }
    
    // Create a retry ID
    const retryId = `retry_${Date.now()}`;
    
    // Start retry in the background
    syncService.retryFailedItems(
      retryId,
      syncId,
      req.shop,
      req.accessToken,
      options
    ).catch(error => {
      logger.error(`Error in retry job ${retryId}:`, error);
      db.updateSyncJobStatus(retryId, 'failed', {
        error: error.message || 'Unknown error'
      });
    });
    
    res.status(200).json({ 
      success: true, 
      retryId,
      status: 'initializing',
      originalSyncId: syncId
    });
  } catch (error) {
    logger.error(`Error retrying failed items from sync ${req.params.syncId}:`, error);
    res.status(500).json({ error: 'Failed to retry failed items' });
  }
});

// Get sync jobs for a shop
router.get('/sync', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    // Get sync jobs from database
    const syncJobs = await db.getSyncJobs(req.shop, parseInt(page, 10), parseInt(limit, 10));
    
    res.status(200).json(syncJobs);
  } catch (error) {
    logger.error('Error getting sync jobs:', error);
    res.status(500).json({ error: 'Failed to get sync jobs' });
  }
});

// Get imported products for a shop
router.get('/imported', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    // Get imported products from database
    const products = await db.getImportedProducts(
      req.shop, 
      parseInt(page, 10), 
      parseInt(limit, 10),
      status
    );
    
    res.status(200).json(products);
  } catch (error) {
    logger.error('Error getting imported products:', error);
    res.status(500).json({ error: 'Failed to get imported products' });
  }
});

// Get Shopify collections
router.get('/collections', verifyToken, async (req, res) => {
  try {
    // Get collections from Shopify
    const collections = await shopifyService.getCollections(
      req.accessToken,
      req.shop
    );
    
    res.status(200).json({ collections });
  } catch (error) {
    logger.error('Error getting Shopify collections:', error);
    res.status(500).json({ error: 'Failed to get Shopify collections' });
  }
});

// Get collection mappings for a shop
router.get('/collection-mappings', verifyToken, async (req, res) => {
  try {
    // Get collection mappings from database
    const mappings = await db.getCollectionMappings(req.shop);
    
    res.status(200).json({ mappings: mappings || [] });
  } catch (error) {
    logger.error('Error getting collection mappings:', error);
    res.status(500).json({ error: 'Failed to get collection mappings' });
  }
});

// Update collection mappings for a shop
router.post('/collection-mappings', verifyToken, async (req, res) => {
  try {
    const { mappings } = req.body;
    
    if (!mappings || !Array.isArray(mappings)) {
      return res.status(400).json({ error: 'Mappings array is required' });
    }
    
    // Save collection mappings to database
    await db.saveCollectionMappings(req.shop, mappings);
    
    res.status(200).json({ 
      success: true, 
      mappings
    });
  } catch (error) {
    logger.error('Error updating collection mappings:', error);
    res.status(500).json({ error: 'Failed to update collection mappings' });
  }
});

// Get metadata mappings for a shop
router.get('/metadata-mappings', verifyToken, async (req, res) => {
  try {
    // Get metadata mappings from database
    const mappings = await db.getMetadataMappings(req.shop);
    
    res.status(200).json({ mappings: mappings || {} });
  } catch (error) {
    logger.error('Error getting metadata mappings:', error);
    res.status(500).json({ error: 'Failed to get metadata mappings' });
  }
});

// Update metadata mappings for a shop
router.post('/metadata-mappings', verifyToken, async (req, res) => {
  try {
    const { mappings } = req.body;
    
    if (!mappings || typeof mappings !== 'object') {
      return res.status(400).json({ error: 'Mappings object is required' });
    }
    
    // Save metadata mappings to database
    await db.saveMetadataMappings(req.shop, mappings);
    
    res.status(200).json({ 
      success: true, 
      mappings
    });
  } catch (error) {
    logger.error('Error updating metadata mappings:', error);
    res.status(500).json({ error: 'Failed to update metadata mappings' });
  }
});

module.exports = router;