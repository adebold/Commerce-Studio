const { Shopify } = require('@shopify/shopify-api');
const Shop = require('../models/Shop');
const logger = require('../utils/logger');

/**
 * Middleware to verify Shopify webhook requests
 */
const verifyShopifyWebhook = async (req, res, next) => {
  try {
    const hmac = req.headers['x-shopify-hmac-sha256'];
    const topic = req.headers['x-shopify-topic'];
    const shop = req.headers['x-shopify-shop-domain'];
    
    if (!hmac || !topic || !shop) {
      logger.warn('Missing required Shopify webhook headers');
      return res.status(401).send('Unauthorized');
    }
    
    const rawBody = JSON.stringify(req.body);
    const isValid = await Shopify.Utils.verifyWebhookHmac({
      hmac,
      data: rawBody,
      secret: process.env.SHOPIFY_API_SECRET,
    });
    
    if (!isValid) {
      logger.warn(`Invalid webhook signature for shop: ${shop}, topic: ${topic}`);
      return res.status(401).send('Unauthorized');
    }
    
    // Add webhook info to request
    req.shopifyWebhook = {
      topic,
      shop,
    };
    
    next();
  } catch (error) {
    logger.error(`Webhook verification error: ${error.message}`);
    res.status(500).send('Internal Server Error');
  }
};

/**
 * Middleware to verify Shopify OAuth requests
 */
const verifyShopifyOAuth = async (req, res, next) => {
  try {
    const { shop } = req.query;
    
    if (!shop) {
      return res.status(400).send('Missing shop parameter');
    }
    
    // Verify the shop is a valid Shopify shop
    if (!Shopify.Utils.isValidShopDomain(shop)) {
      logger.warn(`Invalid shop domain: ${shop}`);
      return res.status(400).send('Invalid shop domain');
    }
    
    next();
  } catch (error) {
    logger.error(`OAuth verification error: ${error.message}`);
    res.status(500).send('Internal Server Error');
  }
};

/**
 * Middleware to verify Shopify session
 */
const verifyShopifySession = async (req, res, next) => {
  try {
    const session = await Shopify.Utils.loadCurrentSession(req, res);
    
    if (!session || !session.accessToken) {
      logger.warn('No active Shopify session');
      return res.redirect(`/auth?shop=${req.query.shop}`);
    }
    
    // Check if the shop exists in our database
    const shop = await Shop.findByShopDomain(session.shop);
    
    if (!shop || !shop.isActive) {
      logger.warn(`Shop not found or inactive: ${session.shop}`);
      return res.redirect(`/auth?shop=${session.shop}`);
    }
    
    // Add shop and session to request
    req.shopifySession = session;
    req.shop = shop;
    
    next();
  } catch (error) {
    logger.error(`Session verification error: ${error.message}`);
    res.status(500).send('Internal Server Error');
  }
};

/**
 * Middleware to verify API requests
 */
const verifyApiRequest = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey || apiKey !== process.env.API_KEY) {
      logger.warn('Invalid API key');
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    next();
  } catch (error) {
    logger.error(`API verification error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  verifyShopifyWebhook,
  verifyShopifyOAuth,
  verifyShopifySession,
  verifyApiRequest,
};