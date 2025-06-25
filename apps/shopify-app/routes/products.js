const express = require('express');
const { Shopify } = require('@shopify/shopify-api');
const { verifyShopifySession } = require('../middleware/auth');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const SyncJob = require('../models/SyncJob');
const logger = require('../utils/logger');
const productService = require('../services/productService');

const router = express.Router();

// Apply session verification middleware to all routes
router.use(verifyShopifySession);

/**
 * Get all products
 */
router.get('/', async (req, res) => {
  try {
    const { shop } = req;
    const { page = 1, limit = 20, status, syncStatus } = req.query;
    
    // Build filter
    const filter = { shopDomain: shop.shopDomain };
    
    if (status) {
      filter.status = status;
    }
    
    if (syncStatus) {
      filter.syncStatus = syncStatus;
    }
    
    // Get products with pagination
    const skip = (page - 1) * limit;
    const products = await Product.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Product.countDocuments(filter);
    
    res.json({
      products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error(`Error getting products: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Get a product by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { shop } = req;
    const { id } = req.params;
    
    // Find the product
    const product = await Product.findOne({
      shopDomain: shop.shopDomain,
      shopifyProductId: id,
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    logger.error(`Error getting product: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Sync a product to SKU-Genie
 */
router.post('/:id/sync', async (req, res) => {
  try {
    const { shop } = req;
    const { id } = req.params;
    const { force = false } = req.body;
    
    // Find the product
    const product = await Product.findOne({
      shopDomain: shop.shopDomain,
      shopifyProductId: id,
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Create a sync job
    const syncJob = new SyncJob({
      shopDomain: shop.shopDomain,
      jobType: 'manual_sync',
      direction: shop.settings.syncDirection,
      status: 'queued',
      progress: {
        total: 1,
      },
      targetResources: {
        productIds: [id],
      },
      queuedBy: {
        userId: req.shopifySession.onlineAccessInfo?.associated_user?.id || 'unknown',
        userEmail: req.shopifySession.onlineAccessInfo?.associated_user?.email || 'unknown',
      },
      options: {
        forceSync: force,
      },
    });
    
    await syncJob.save();
    
    // Get the latest product data from Shopify
    const client = new Shopify.Clients.Rest(shop.shopDomain, shop.accessToken);
    const response = await client.get({
      path: `products/${id}`,
    });
    
    const shopifyProduct = response.body.product;
    
    // Process the product
    await productService.processShopifyProduct(shop, shopifyProduct, syncJob._id);
    
    res.json({
      message: 'Product sync initiated',
      syncJobId: syncJob._id,
    });
  } catch (error) {
    logger.error(`Error syncing product: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Sync all products to SKU-Genie
 */
router.post('/sync-all', async (req, res) => {
  try {
    const { shop } = req;
    const { force = false } = req.body;
    
    // Create a sync job
    const syncJob = new SyncJob({
      shopDomain: shop.shopDomain,
      jobType: 'full_sync',
      direction: shop.settings.syncDirection,
      status: 'queued',
      queuedBy: {
        userId: req.shopifySession.onlineAccessInfo?.associated_user?.id || 'unknown',
        userEmail: req.shopifySession.onlineAccessInfo?.associated_user?.email || 'unknown',
      },
      options: {
        forceSync: force,
      },
    });
    
    await syncJob.save();
    
    // Start the sync process asynchronously
    process.nextTick(async () => {
      try {
        // Get count of products
        const client = new Shopify.Clients.Rest(shop.shopDomain, shop.accessToken);
        const countResponse = await client.get({
          path: 'products/count',
        });
        
        const totalProducts = countResponse.body.count;
        
        // Update sync job with total
        syncJob.progress.total = totalProducts;
        syncJob.status = 'in_progress';
        syncJob.startedAt = new Date();
        await syncJob.save();
        
        // Process products in batches
        const batchSize = 50;
        let processedCount = 0;
        let page = 1;
        
        while (processedCount < totalProducts) {
          const productsResponse = await client.get({
            path: 'products',
            query: {
              limit: batchSize,
              page,
            },
          });
          
          const products = productsResponse.body.products;
          
          // Process each product
          for (const product of products) {
            await productService.processShopifyProduct(shop, product, syncJob._id);
            processedCount++;
            
            // Update progress
            syncJob.progress.current = processedCount;
            await syncJob.save();
          }
          
          page++;
          
          // Break if no more products
          if (products.length < batchSize) {
            break;
          }
        }
        
        // Mark job as completed
        await syncJob.markAsCompleted();
        logger.info(`Full sync completed for shop ${shop.shopDomain}`);
      } catch (error) {
        logger.error(`Error in full sync for shop ${shop.shopDomain}: ${error.message}`);
        await syncJob.markAsFailed(error.message);
      }
    });
    
    res.json({
      message: 'Full sync initiated',
      syncJobId: syncJob._id,
    });
  } catch (error) {
    logger.error(`Error initiating full sync: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;