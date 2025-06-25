const express = require('express');
const { verifyShopifyWebhook } = require('../middleware/auth');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const SyncJob = require('../models/SyncJob');
const logger = require('../utils/logger');
const productService = require('../services/productService');

const router = express.Router();

// Apply webhook verification middleware to all routes
router.use(verifyShopifyWebhook);

/**
 * Product created webhook
 */
router.post('/products/create', async (req, res) => {
  try {
    const { topic, shop } = req.shopifyWebhook;
    const productData = req.body;
    
    logger.info(`Received ${topic} webhook from ${shop} for product ${productData.id}`);
    
    // Find the shop
    const shopDoc = await Shop.findByShopDomain(shop);
    
    if (!shopDoc || !shopDoc.isActive) {
      logger.warn(`Shop not found or inactive: ${shop}`);
      return res.status(200).send(); // Acknowledge webhook even if we can't process it
    }
    
    // Check if product sync is enabled
    if (!shopDoc.settings.syncProducts) {
      logger.info(`Product sync disabled for shop: ${shop}`);
      return res.status(200).send();
    }
    
    // Create a sync job
    const syncJob = new SyncJob({
      shopDomain: shop,
      jobType: 'webhook_sync',
      direction: 'shopify-to-skugenie',
      status: 'queued',
      targetResources: {
        productIds: [productData.id.toString()],
      },
      queuedBy: {
        userId: 'webhook',
        userEmail: 'webhook@system',
      },
    });
    
    await syncJob.save();
    
    // Process the product asynchronously
    productService.processShopifyProduct(shopDoc, productData, syncJob._id)
      .catch(error => {
        logger.error(`Error processing product ${productData.id} for shop ${shop}: ${error.message}`);
      });
    
    // Acknowledge webhook
    res.status(200).send();
  } catch (error) {
    logger.error(`Error handling product create webhook: ${error.message}`);
    res.status(500).send();
  }
});

/**
 * App uninstalled webhook
 */
router.post('/app/uninstalled', async (req, res) => {
  try {
    const { topic, shop } = req.shopifyWebhook;
    
    logger.info(`Received ${topic} webhook from ${shop}`);
    
    // Find the shop
    const shopDoc = await Shop.findByShopDomain(shop);
    
    if (!shopDoc) {
      logger.warn(`Shop not found: ${shop}`);
      return res.status(200).send();
    }
    
    // Mark the shop as uninstalled
    await shopDoc.markAsUninstalled();
    logger.info(`Marked shop ${shop} as uninstalled`);
    
    // Acknowledge webhook
    res.status(200).send();
  } catch (error) {
    logger.error(`Error handling app uninstalled webhook: ${error.message}`);
    res.status(500).send();
  }
});

module.exports = router;