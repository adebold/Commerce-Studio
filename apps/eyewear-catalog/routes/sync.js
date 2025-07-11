/**
 * Sync Routes
 * 
 * Routes for managing data synchronization between the eyewear database and Shopify.
 * Provides endpoints for starting, monitoring, and configuring sync processes.
 */

const express = require('express');
const router = express.Router();
const { syncService } = require('../services/sync-service');
const logger = require('../utils/logger');
const db = require('../utils/db');

// Middleware to ensure shop authentication
const ensureShop = (req, res, next) => {
  if (!req.session || !req.session.shop || !req.session.accessToken) {
    return res.status(403).json({
      error: true,
      message: 'Shop authentication required'
    });
  }
  
  req.shop = req.session.shop;
  req.accessToken = req.session.accessToken;
  next();
};

/**
 * GET /sync/status
 * Get sync status for the current shop
 */
router.get('/status', ensureShop, async (req, res) => {
  try {
    const status = syncService.getSyncStatus(req.shop);
    
    res.json({
      success: true,
      isSyncing: !!status,
      status: status || null
    });
  } catch (error) {
    logger.error(`Error getting sync status for shop ${req.shop}:`, error);
    
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});

/**
 * POST /sync/start
 * Start a sync process
 */
router.post('/start', ensureShop, async (req, res) => {
  try {
    // Get sync options from request body
    const options = req.body.options || {};
    
    // Check if sync is already running
    if (syncService.isShopSyncing(req.shop)) {
      return res.status(409).json({
        error: true,
        message: 'A sync process is already running for this shop'
      });
    }
    
    // Start sync
    const jobInfo = await syncService.startFullSync(req.shop, req.accessToken, options);
    
    res.json({
      success: true,
      jobId: jobInfo.id,
      status: jobInfo.status
    });
  } catch (error) {
    logger.error(`Error starting sync for shop ${req.shop}:`, error);
    
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});

/**
 * POST /sync/cancel
 * Cancel a running sync process
 */
router.post('/cancel', ensureShop, async (req, res) => {
  try {
    // Check if sync is running
    if (!syncService.isShopSyncing(req.shop)) {
      return res.status(404).json({
        error: true,
        message: 'No sync process is currently running for this shop'
      });
    }
    
    // Cancel sync
    const success = syncService.cancelSync(req.shop);
    
    if (!success) {
      return res.status(409).json({
        error: true,
        message: 'Failed to cancel sync process'
      });
    }
    
    res.json({
      success: true,
      message: 'Sync process cancelled'
    });
  } catch (error) {
    logger.error(`Error cancelling sync for shop ${req.shop}:`, error);
    
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});

/**
 * GET /sync/settings
 * Get sync settings for the shop
 */
router.get('/settings', ensureShop, async (req, res) => {
  try {
    // Get shop data
    const shopData = await db.getShopByDomain(req.shop);
    
    if (!shopData) {
      return res.status(404).json({
        error: true,
        message: 'Shop not found'
      });
    }
    
    // Get sync settings from shop data
    const settings = shopData.settings?.syncSettings || {
      enabled: false,
      schedule: {
        cronExpression: '0 2 * * *' // Default: 2 AM daily
      },
      options: {}
    };
    
    res.json({
      success: true,
      settings
    });
  } catch (error) {
    logger.error(`Error getting sync settings for shop ${req.shop}:`, error);
    
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});

/**
 * POST /sync/settings
 * Update sync settings for the shop
 */
router.post('/settings', ensureShop, async (req, res) => {
  try {
    // Get settings from request body
    const settings = req.body.settings;
    
    if (!settings) {
      return res.status(400).json({
        error: true,
        message: 'Settings object required'
      });
    }
    
    // Validate schedule cron expression if provided
    if (settings.schedule?.cronExpression) {
      // Basic validation for cron expression format
      const cronParts = settings.schedule.cronExpression.split(' ');
      
      if (cronParts.length !== 5) {
        return res.status(400).json({
          error: true,
          message: 'Invalid cron expression format'
        });
      }
    }
    
    // Save settings
    await syncService.saveSyncSettings(req.shop, settings);
    
    res.json({
      success: true,
      message: 'Sync settings updated'
    });
  } catch (error) {
    logger.error(`Error updating sync settings for shop ${req.shop}:`, error);
    
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});

/**
 * POST /sync/product
 * Sync a single product
 */
router.post('/product', ensureShop, async (req, res) => {
  try {
    const productId = req.body.productId;
    
    if (!productId) {
      return res.status(400).json({
        error: true,
        message: 'Product ID required'
      });
    }
    
    // Get product details
    const product = await req.eyewearService.getProductDetails(req.shop, productId);
    
    if (!product) {
      return res.status(404).json({
        error: true,
        message: 'Product not found'
      });
    }
    
    // Sync product
    const result = await syncService.syncProduct(req.shop, req.accessToken, product);
    
    res.json({
      success: true,
      productId,
      syncResult: result
    });
  } catch (error) {
    logger.error(`Error syncing product for shop ${req.shop}:`, error);
    
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});

/**
 * GET /sync/history
 * Get sync history for the shop
 */
router.get('/history', ensureShop, async (req, res) => {
  try {
    // Get shop data
    const shopData = await db.getShopByDomain(req.shop);
    
    if (!shopData) {
      return res.status(404).json({
        error: true,
        message: 'Shop not found'
      });
    }
    
    // Get pagination options
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    
    // Get import history from database
    const importHistory = await db.getImportedProducts(req.shop, {
      page,
      limit
    });
    
    // Get import statistics
    const stats = await db.getImportStatistics(req.shop);
    
    res.json({
      success: true,
      history: importHistory,
      stats
    });
  } catch (error) {
    logger.error(`Error getting sync history for shop ${req.shop}:`, error);
    
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});

/**
 * GET /sync/stats
 * Get sync statistics for the shop
 */
router.get('/stats', ensureShop, async (req, res) => {
  try {
    // Get import statistics
    const stats = await db.getImportStatistics(req.shop);
    
    // Get recent activity
    const recentActivity = await db.getRecentlyImportedProducts(req.shop, 5);
    
    // Get current sync status
    const currentSync = syncService.getSyncStatus(req.shop);
    
    res.json({
      success: true,
      stats,
      recentActivity,
      currentSync
    });
  } catch (error) {
    logger.error(`Error getting sync statistics for shop ${req.shop}:`, error);
    
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});

module.exports = router;