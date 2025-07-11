/**
 * Shopify Routes
 * 
 * Routes for Shopify authentication, app installation, and data management.
 * Handles OAuth flow and app-specific operations.
 */

const express = require('express');
const crypto = require('crypto');
const { Shopify } = require('@shopify/shopify-api');
const router = express.Router();
const { shopifyService } = require('../services/shopify-service');
const logger = require('../utils/logger');
const db = require('../utils/db');

// Middleware to verify Shopify HMAC
const verifyShopifyHmac = (req, res, next) => {
  try {
    const { hmac, shop, timestamp, ...params } = req.query;
    
    // Make sure required parameters exist
    if (!hmac || !shop || !timestamp) {
      return res.status(400).json({
        error: true,
        message: 'Required parameters missing'
      });
    }
    
    // Build message from params sorted alphabetically
    const message = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    // Add shop and timestamp
    const fullMessage = `shop=${shop}&timestamp=${timestamp}${message ? '&' + message : ''}`;
    
    // Compute HMAC
    const computedHmac = crypto
      .createHmac('sha256', process.env.SHOPIFY_API_SECRET)
      .update(fullMessage)
      .digest('hex');
    
    // Verify HMAC
    if (computedHmac !== hmac) {
      return res.status(401).json({
        error: true,
        message: 'HMAC validation failed'
      });
    }
    
    // HMAC verified, continue
    next();
  } catch (error) {
    logger.error('HMAC verification error:', error);
    res.status(500).json({
      error: true,
      message: 'Error verifying request'
    });
  }
};

// Middleware to ensure shop authentication
const ensureShopAuth = async (req, res, next) => {
  try {
    // Check if we have a shop in session
    if (!req.session || !req.session.shop || !req.session.accessToken) {
      return res.status(403).json({
        error: true,
        message: 'Shop authentication required'
      });
    }
    
    // Get shop from database to verify it exists and has a valid token
    const shopData = await db.getShopByDomain(req.session.shop);
    
    if (!shopData || shopData.uninstalledAt) {
      // Shop not found or uninstalled, clear session
      req.session.destroy();
      
      return res.status(403).json({
        error: true,
        message: 'Shop not found or app uninstalled'
      });
    }
    
    // Set shop and token on request for convenience
    req.shop = req.session.shop;
    req.accessToken = req.session.accessToken;
    
    next();
  } catch (error) {
    logger.error('Shop authentication error:', error);
    res.status(500).json({
      error: true,
      message: 'Error authenticating shop'
    });
  }
};

/**
 * GET /shopify/install
 * Start the OAuth flow for installation
 */
router.get('/install', verifyShopifyHmac, (req, res) => {
  try {
    const { shop } = req.query;
    
    if (!shop) {
      return res.status(400).json({
        error: true,
        message: 'Shop parameter required'
      });
    }
    
    // Generate authorization URL
    const nonce = crypto.randomBytes(16).toString('hex');
    const redirectUri = `${process.env.SHOPIFY_APP_HOST}/shopify/callback`;
    const scopes = process.env.SHOPIFY_API_SCOPES.split(',');
    
    // Store nonce in session for verification later
    req.session.nonce = nonce;
    req.session.shop = shop;
    
    // Build authorization URL
    const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=${scopes.join(',')}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${nonce}`;
    
    // Redirect to Shopify for authorization
    res.redirect(authUrl);
  } catch (error) {
    logger.error('Error starting OAuth flow:', error);
    res.status(500).json({
      error: true,
      message: 'Error starting installation'
    });
  }
});

/**
 * GET /shopify/callback
 * Handle OAuth callback
 */
router.get('/callback', async (req, res) => {
  try {
    const { shop, code, state } = req.query;
    
    if (!shop || !code) {
      return res.status(400).json({
        error: true,
        message: 'Required parameters missing'
      });
    }
    
    // Verify state (nonce) to prevent CSRF
    if (!req.session.nonce || req.session.nonce !== state) {
      return res.status(403).json({
        error: true,
        message: 'State validation failed'
      });
    }
    
    // Verify shop matches the one we started with
    if (req.session.shop !== shop) {
      return res.status(403).json({
        error: true,
        message: 'Shop validation failed'
      });
    }
    
    // Exchange code for access token
    const accessTokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        code
      })
    });
    
    if (!accessTokenResponse.ok) {
      throw new Error(`Failed to exchange code for token: ${accessTokenResponse.statusText}`);
    }
    
    const tokenData = await accessTokenResponse.json();
    const accessToken = tokenData.access_token;
    
    // Store token in session
    req.session.accessToken = accessToken;
    
    // Get shop data and save to database
    const shopData = await shopifyService.getShopData(accessToken, shop);
    await shopifyService.saveShopData(accessToken, shop, shopData);
    
    // Register webhooks
    await shopifyService.registerWebhooks(accessToken, shop);
    
    // Clear nonce from session
    delete req.session.nonce;
    
    // Redirect to app
    if (process.env.SHOPIFY_APP_EMBEDDED === 'true') {
      // For embedded apps, redirect to the Shopify admin app page
      res.redirect(`https://${shop}/admin/apps/${process.env.SHOPIFY_API_KEY}`);
    } else {
      // For non-embedded apps, redirect to app home
      res.redirect('/');
    }
  } catch (error) {
    logger.error('OAuth callback error:', error);
    res.status(500).json({
      error: true,
      message: 'Error completing installation'
    });
  }
});

/**
 * GET /shopify/shop
 * Get current shop data
 */
router.get('/shop', ensureShopAuth, async (req, res) => {
  try {
    const shopData = await db.getShopByDomain(req.shop);
    
    // Return shop data excluding sensitive information
    const { accessToken, ...safeShopData } = shopData;
    
    res.json({
      success: true,
      shop: safeShopData
    });
  } catch (error) {
    logger.error(`Error getting shop data: ${error.message}`, { error, shop: req.shop });
    
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});

/**
 * GET /shopify/products
 * Get products from Shopify
 */
router.get('/products', ensureShopAuth, async (req, res) => {
  try {
    const options = {
      limit: parseInt(req.query.limit, 10) || 50,
      pageInfo: req.query.page_info,
      ids: req.query.ids ? req.query.ids.split(',') : undefined,
      collectionId: req.query.collection_id,
      productType: req.query.product_type,
      vendor: req.query.vendor,
      status: req.query.status,
      createdAtMin: req.query.created_at_min,
      createdAtMax: req.query.created_at_max,
      updatedAtMin: req.query.updated_at_min,
      updatedAtMax: req.query.updated_at_max
    };
    
    const products = await shopifyService.getProducts(
      req.accessToken,
      req.shop,
      options
    );
    
    res.json({
      success: true,
      ...products
    });
  } catch (error) {
    logger.error(`Error getting Shopify products: ${error.message}`, { error, shop: req.shop });
    
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});

/**
 * GET /shopify/products/:id
 * Get a specific product from Shopify
 */
router.get('/products/:id', ensureShopAuth, async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await shopifyService.getProduct(
      req.accessToken,
      req.shop,
      productId
    );
    
    if (!product) {
      return res.status(404).json({
        error: true,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      product
    });
  } catch (error) {
    logger.error(`Error getting Shopify product ${req.params.id}: ${error.message}`, { error, shop: req.shop });
    
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});

/**
 * GET /shopify/collections
 * Get collections from Shopify
 */
router.get('/collections', ensureShopAuth, async (req, res) => {
  try {
    const options = {
      limit: parseInt(req.query.limit, 10) || 250,
      pageInfo: req.query.page_info,
      ids: req.query.ids ? req.query.ids.split(',') : undefined
    };
    
    const collections = await shopifyService.getCollections(
      req.accessToken,
      req.shop,
      options
    );
    
    res.json({
      success: true,
      ...collections
    });
  } catch (error) {
    logger.error(`Error getting Shopify collections: ${error.message}`, { error, shop: req.shop });
    
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});

/**
 * GET /shopify/collections/:id/products
 * Get products in a collection
 */
router.get('/collections/:id/products', ensureShopAuth, async (req, res) => {
  try {
    const collectionId = req.params.id;
    const options = {
      limit: parseInt(req.query.limit, 10) || 50,
      pageInfo: req.query.page_info
    };
    
    const products = await shopifyService.getProductsByCollection(
      req.accessToken,
      req.shop,
      collectionId,
      options
    );
    
    res.json({
      success: true,
      ...products
    });
  } catch (error) {
    logger.error(`Error getting Shopify collection products for ${req.params.id}: ${error.message}`, { error, shop: req.shop });
    
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});

/**
 * POST /shopify/search
 * Search products in Shopify
 */
router.post('/search', ensureShopAuth, async (req, res) => {
  try {
    const options = {
      query: req.body.query,
      title: req.body.title,
      sku: req.body.sku,
      vendor: req.body.vendor,
      productType: req.body.product_type,
      tag: req.body.tag,
      limit: parseInt(req.body.limit, 10) || 50,
      pageInfo: req.body.page_info,
      fields: req.body.fields
    };
    
    const products = await shopifyService.searchProducts(
      req.accessToken,
      req.shop,
      options
    );
    
    res.json({
      success: true,
      ...products
    });
  } catch (error) {
    logger.error(`Error searching Shopify products: ${error.message}`, { error, shop: req.shop });
    
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});

/**
 * POST /shopify/import
 * Import a product from eyewear database to Shopify
 */
router.post('/import', ensureShopAuth, async (req, res) => {
  try {
    const { productId, options } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        error: true,
        message: 'Product ID is required'
      });
    }
    
    // Get product from eyewear database
    const sourceProduct = await req.eyewearService.getProductDetails(req.shop, productId);
    
    if (!sourceProduct) {
      return res.status(404).json({
        error: true,
        message: 'Product not found in eyewear database'
      });
    }
    
    // Import product to Shopify
    const importedProduct = await shopifyService.importProduct(
      req.accessToken,
      req.shop,
      sourceProduct,
      options || {}
    );
    
    res.json({
      success: true,
      product: importedProduct
    });
  } catch (error) {
    logger.error(`Error importing product: ${error.message}`, { error, shop: req.shop });
    
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});

/**
 * GET /shopify/logout
 * Logout from app
 */
router.get('/logout', (req, res) => {
  try {
    // Destroy session
    req.session.destroy();
    
    // Redirect to Shopify admin
    if (req.query.shop) {
      res.redirect(`https://${req.query.shop}/admin`);
    } else {
      res.redirect('/');
    }
  } catch (error) {
    logger.error(`Error logging out: ${error.message}`, { error });
    
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});

module.exports = router;