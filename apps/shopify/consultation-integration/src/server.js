/**
 * Shopify Consultation Integration Server
 * Main server for Shopify app integration with consultation services
 */

import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import { verifyRequest } from '@shopify/koa-shopify-auth';
import { receiveWebhook } from '@shopify/koa-shopify-webhooks';
import dotenv from 'dotenv';
import ConsultationService from './services/consultation-service.js';
import ShopifyAPIService from './services/shopify-api-service.js';
import ProductSyncService from './services/product-sync-service.js';

dotenv.config();

const app = new Koa();
const router = new Router();

// Configuration
const config = {
  SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
  SHOPIFY_API_SECRET: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SCOPES || 'read_products,write_products,read_script_tags,write_script_tags',
  HOST: process.env.HOST || 'localhost:3000',
  CONSULTATION_API_URL: process.env.CONSULTATION_API_URL || 'http://localhost:3002',
  PORT: process.env.PORT || 3000
};

// Initialize services
const consultationService = new ConsultationService(config);
const shopifyAPIService = new ShopifyAPIService(config);
const productSyncService = new ProductSyncService(config);

// Middleware
app.use(bodyParser());

// Health check endpoint
router.get('/health', (ctx) => {
  ctx.body = { 
    status: 'healthy', 
    service: 'shopify-consultation-integration',
    timestamp: new Date().toISOString() 
  };
});

// OAuth and installation routes
router.get('/auth', async (ctx) => {
  const { shop } = ctx.query;
  
  if (!shop) {
    ctx.status = 400;
    ctx.body = { error: 'Missing shop parameter' };
    return;
  }
  
  const authUrl = shopifyAPIService.getAuthURL(shop);
  ctx.redirect(authUrl);
});

router.get('/auth/callback', async (ctx) => {
  try {
    const { shop, code } = ctx.query;
    
    if (!shop || !code) {
      ctx.status = 400;
      ctx.body = { error: 'Missing required parameters' };
      return;
    }
    
    const accessToken = await shopifyAPIService.getAccessToken(shop, code);
    
    // Store shop credentials securely
    await shopifyAPIService.storeShopCredentials(shop, accessToken);
    
    // Initialize consultation integration for this shop
    await consultationService.initializeShopIntegration(shop, accessToken);
    
    // Sync products for initial setup
    await productSyncService.syncShopProducts(shop);
    
    ctx.redirect(`https://${shop}/admin/apps`);
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    ctx.status = 500;
    ctx.body = { error: 'Authentication failed' };
  }
});

// Consultation API endpoints
router.post('/api/consultation/start', verifyRequest(), async (ctx) => {
  try {
    const { shop } = ctx.query;
    const { customerId, sessionData } = ctx.request.body;
    
    const result = await consultationService.startConsultation(shop, customerId, sessionData);
    
    ctx.body = {
      success: true,
      sessionId: result.sessionId,
      consultationUrl: result.consultationUrl
    };
    
  } catch (error) {
    console.error('Start consultation error:', error);
    ctx.status = 500;
    ctx.body = { error: 'Failed to start consultation' };
  }
});

router.post('/api/consultation/:sessionId/face-analysis', verifyRequest(), async (ctx) => {
  try {
    const { sessionId } = ctx.params;
    const { shop } = ctx.query;
    const { imageData } = ctx.request.body;
    
    const result = await consultationService.analyzeFaceShape(sessionId, imageData);
    
    ctx.body = {
      success: true,
      faceAnalysis: result
    };
    
  } catch (error) {
    console.error('Face analysis error:', error);
    ctx.status = 500;
    ctx.body = { error: 'Face analysis failed' };
  }
});

router.post('/api/consultation/:sessionId/recommendations', verifyRequest(), async (ctx) => {
  try {
    const { sessionId } = ctx.params;
    const { shop } = ctx.query;
    const { preferences, faceAnalysis } = ctx.request.body;
    
    // Get shop products for recommendations
    const shopProducts = await productSyncService.getShopProducts(shop);
    
    const result = await consultationService.getRecommendations(
      sessionId, 
      preferences, 
      faceAnalysis,
      shopProducts
    );
    
    ctx.body = {
      success: true,
      recommendations: result.recommendations,
      insights: result.insights
    };
    
  } catch (error) {
    console.error('Recommendations error:', error);
    ctx.status = 500;
    ctx.body = { error: 'Failed to get recommendations' };
  }
});

router.get('/api/consultation/:sessionId/store-locator', verifyRequest(), async (ctx) => {
  try {
    const { sessionId } = ctx.params;
    const { shop } = ctx.query;
    const { latitude, longitude, selectedProducts } = ctx.query;
    
    const result = await consultationService.findNearbyStores(
      sessionId,
      { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
      selectedProducts ? selectedProducts.split(',') : []
    );
    
    ctx.body = {
      success: true,
      stores: result.stores,
      inventory: result.inventory
    };
    
  } catch (error) {
    console.error('Store locator error:', error);
    ctx.status = 500;
    ctx.body = { error: 'Failed to find stores' };
  }
});

// Product sync endpoints
router.post('/api/products/sync', verifyRequest(), async (ctx) => {
  try {
    const { shop } = ctx.query;
    
    const result = await productSyncService.syncShopProducts(shop);
    
    ctx.body = {
      success: true,
      syncedProducts: result.syncedCount,
      lastSync: result.timestamp
    };
    
  } catch (error) {
    console.error('Product sync error:', error);
    ctx.status = 500;
    ctx.body = { error: 'Product sync failed' };
  }
});

// Webhook endpoints
router.post('/webhooks/products/create', receiveWebhook({ secret: config.SHOPIFY_API_SECRET }), async (ctx) => {
  try {
    const product = ctx.state.webhook.payload;
    const shop = ctx.get('x-shopify-shop-domain');
    
    await productSyncService.syncSingleProduct(shop, product);
    
    ctx.status = 200;
    ctx.body = { received: true };
    
  } catch (error) {
    console.error('Product create webhook error:', error);
    ctx.status = 500;
  }
});

router.post('/webhooks/products/update', receiveWebhook({ secret: config.SHOPIFY_API_SECRET }), async (ctx) => {
  try {
    const product = ctx.state.webhook.payload;
    const shop = ctx.get('x-shopify-shop-domain');
    
    await productSyncService.updateSyncedProduct(shop, product);
    
    ctx.status = 200;
    ctx.body = { received: true };
    
  } catch (error) {
    console.error('Product update webhook error:', error);
    ctx.status = 500;
  }
});

router.post('/webhooks/app/uninstalled', receiveWebhook({ secret: config.SHOPIFY_API_SECRET }), async (ctx) => {
  try {
    const shop = ctx.get('x-shopify-shop-domain');
    
    await consultationService.cleanupShopIntegration(shop);
    await shopifyAPIService.removeShopCredentials(shop);
    
    ctx.status = 200;
    ctx.body = { received: true };
    
  } catch (error) {
    console.error('App uninstall webhook error:', error);
    ctx.status = 500;
  }
});

// Theme integration endpoints
router.get('/theme/consultation-widget.js', async (ctx) => {
  try {
    const { shop } = ctx.query;
    
    const widgetScript = await consultationService.generateThemeWidget(shop);
    
    ctx.type = 'application/javascript';
    ctx.body = widgetScript;
    
  } catch (error) {
    console.error('Widget script error:', error);
    ctx.status = 500;
    ctx.body = '// Widget unavailable';
  }
});

router.get('/theme/consultation-modal', async (ctx) => {
  try {
    const { shop, sessionId } = ctx.query;
    
    const modalHTML = await consultationService.generateConsultationModal(shop, sessionId);
    
    ctx.type = 'text/html';
    ctx.body = modalHTML;
    
  } catch (error) {
    console.error('Modal generation error:', error);
    ctx.status = 500;
    ctx.body = '<div>Consultation unavailable</div>';
  }
});

// App configuration endpoints
router.get('/admin/config', verifyRequest(), async (ctx) => {
  try {
    const { shop } = ctx.query;
    
    const config = await consultationService.getShopConfiguration(shop);
    
    ctx.body = {
      success: true,
      configuration: config
    };
    
  } catch (error) {
    console.error('Get config error:', error);
    ctx.status = 500;
    ctx.body = { error: 'Failed to get configuration' };
  }
});

router.post('/admin/config', verifyRequest(), async (ctx) => {
  try {
    const { shop } = ctx.query;
    const configuration = ctx.request.body;
    
    await consultationService.updateShopConfiguration(shop, configuration);
    
    ctx.body = {
      success: true,
      message: 'Configuration updated successfully'
    };
    
  } catch (error) {
    console.error('Update config error:', error);
    ctx.status = 500;
    ctx.body = { error: 'Failed to update configuration' };
  }
});

// Apply routes
app.use(router.routes());
app.use(router.allowedMethods());

// Error handling
app.on('error', (err, ctx) => {
  console.error('Server error:', err);
});

// Start server
const server = app.listen(config.PORT, () => {
  console.log(`Shopify Consultation Integration server running on port ${config.PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default server;