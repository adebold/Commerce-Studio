/**
 * Webhook Routes
 * 
 * Routes for handling Shopify webhooks.
 * Processes app uninstalls and product events.
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { Buffer } = require('buffer');
const { shopifyService } = require('../services/shopify-service');
const logger = require('../utils/logger');
const db = require('../utils/db');

// Raw body parsing middleware for webhooks
const rawBodyParser = (req, res, next) => {
  let data = '';
  
  req.on('data', chunk => {
    data += chunk;
  });
  
  req.on('end', () => {
    req.rawBody = data;
    next();
  });
};

// Middleware to verify Shopify webhook HMAC
const verifyShopifyWebhook = (req, res, next) => {
  try {
    // Get HMAC header
    const hmacHeader = req.headers['x-shopify-hmac-sha256'];
    
    if (!hmacHeader) {
      logger.error('Missing X-Shopify-Hmac-SHA256 header');
      return res.status(401).send('Missing HMAC header');
    }
    
    // Get shop domain
    const shop = req.headers['x-shopify-shop-domain'];
    
    if (!shop) {
      logger.error('Missing X-Shopify-Shop-Domain header');
      return res.status(401).send('Missing shop domain header');
    }
    
    // Verify HMAC
    const generatedHash = crypto
      .createHmac('sha256', process.env.SHOPIFY_API_SECRET)
      .update(req.rawBody)
      .digest('base64');
    
    if (generatedHash !== hmacHeader) {
      logger.error(`HMAC verification failed for shop ${shop}`);
      return res.status(401).send('HMAC verification failed');
    }
    
    // HMAC verified, add shop to request
    req.shop = shop;
    
    next();
  } catch (error) {
    logger.error('Error verifying webhook:', error);
    res.status(500).send('Error verifying webhook');
  }
};

// Initialize router with raw body handling
router.use(rawBodyParser);

/**
 * POST /webhooks/app/uninstalled
 * Handle app uninstalled webhook
 */
router.post('/app/uninstalled', verifyShopifyWebhook, async (req, res) => {
  try {
    const shop = req.shop;
    
    // Parse webhook body
    const webhookData = JSON.parse(req.rawBody);
    
    logger.info(`App uninstalled from shop ${shop}`);
    
    // Get shop data
    const shopData = await db.getShopByDomain(shop);
    
    if (shopData) {
      // Mark shop as uninstalled
      shopData.uninstalledAt = new Date();
      await db.saveShop(shopData);
      
      logger.info(`Marked shop ${shop} as uninstalled in database`);
    }
    
    // Return 200 success
    res.status(200).send('OK');
  } catch (error) {
    logger.error(`Error handling app/uninstalled webhook:`, error);
    
    // Always return 200 to acknowledge receipt
    res.status(200).send('OK');
  }
});

/**
 * POST /webhooks/products/create
 * Handle products/create webhook
 */
router.post('/products/create', verifyShopifyWebhook, async (req, res) => {
  try {
    const shop = req.shop;
    
    // Parse webhook body
    const productData = JSON.parse(req.rawBody);
    
    logger.info(`Product ${productData.id} created in shop ${shop}`);
    
    // Check if this product was created from our app (has eyewear_db metafields)
    const sourceIdMetafield = (productData.metafields || []).find(
      metafield => metafield.namespace === 'eyewear_db' && metafield.key === 'source_id'
    );
    
    if (sourceIdMetafield) {
      // This is a product we created, update our import records
      const sourceId = sourceIdMetafield.value;
      
      // Check if we already have an import record
      const existingImport = await db.getImportedProductBySourceId(shop, sourceId);
      
      if (existingImport) {
        // Update existing record
        await db.saveImportedProduct(
          shop,
          sourceId,
          productData.id.toString(),
          'imported',
          {
            lastUpdateReason: 'webhook_create',
            updateTimestamp: new Date().toISOString()
          }
        );
      } else {
        // Create new import record
        await db.saveImportedProduct(
          shop,
          sourceId,
          productData.id.toString(),
          'imported',
          {
            importTimestamp: new Date().toISOString()
          }
        );
      }
      
      logger.info(`Updated import record for product ${productData.id} with source ID ${sourceId} in shop ${shop}`);
    }
    
    // Return 200 success
    res.status(200).send('OK');
  } catch (error) {
    logger.error(`Error handling products/create webhook:`, error);
    
    // Always return 200 to acknowledge receipt
    res.status(200).send('OK');
  }
});

/**
 * POST /webhooks/products/update
 * Handle products/update webhook
 */
router.post('/products/update', verifyShopifyWebhook, async (req, res) => {
  try {
    const shop = req.shop;
    
    // Parse webhook body
    const productData = JSON.parse(req.rawBody);
    
    logger.info(`Product ${productData.id} updated in shop ${shop}`);
    
    // Check if this product is one we've imported
    const existingImport = await db.getImportedProductByShopifyId(shop, productData.id.toString());
    
    if (existingImport) {
      // This is a product we're tracking, update our import record
      await db.saveImportedProduct(
        shop,
        existingImport.sourceProductId,
        productData.id.toString(),
        'updated',
        {
          lastUpdateReason: 'webhook_update',
          updateTimestamp: new Date().toISOString()
        }
      );
      
      logger.info(`Updated import record for product ${productData.id} in shop ${shop}`);
    }
    
    // Return 200 success
    res.status(200).send('OK');
  } catch (error) {
    logger.error(`Error handling products/update webhook:`, error);
    
    // Always return 200 to acknowledge receipt
    res.status(200).send('OK');
  }
});

/**
 * POST /webhooks/products/delete
 * Handle products/delete webhook
 */
router.post('/products/delete', verifyShopifyWebhook, async (req, res) => {
  try {
    const shop = req.shop;
    
    // Parse webhook body
    const productData = JSON.parse(req.rawBody);
    
    logger.info(`Product ${productData.id} deleted from shop ${shop}`);
    
    // Check if this product is one we've imported
    const existingImport = await db.getImportedProductByShopifyId(shop, productData.id.toString());
    
    if (existingImport) {
      // This is a product we're tracking, mark it as deleted
      await db.markImportedProductAsDeleted(shop, productData.id.toString());
      
      logger.info(`Marked product ${productData.id} as deleted in shop ${shop}`);
    }
    
    // Return 200 success
    res.status(200).send('OK');
  } catch (error) {
    logger.error(`Error handling products/delete webhook:`, error);
    
    // Always return 200 to acknowledge receipt
    res.status(200).send('OK');
  }
});

module.exports = router;