/**
 * Client Portal Service
 * 
 * Service for integrating with client portals.
 * Provides methods for sharing product data from Shopify
 * to client portals and managing client portal settings.
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const db = require('../utils/db');
const logger = require('../utils/logger');
const { shopifyService } = require('./shopify-service');

class ClientPortalService {
  constructor() {
    // Cache for portal connections by shop
    this.portalConnections = new Map();
    
    // Initialize flag
    this.initialized = false;
  }
  
  /**
   * Initialize the client portal service
   */
  async initialize() {
    if (this.initialized) {
      return true;
    }
    
    try {
      logger.info('Initializing client portal service');
      
      // Nothing specific to initialize here yet
      // Portal connections will be created on demand per shop
      
      this.initialized = true;
      return true;
    } catch (error) {
      logger.error('Failed to initialize client portal service:', error);
      throw error;
    }
  }
  
  /**
   * Get shop-specific portal settings
   * 
   * @param {string} shop Shop domain
   * @returns {Object} Portal settings
   */
  async getPortalSettings(shop) {
    try {
      // Get shop settings
      const shopData = await db.getShopByDomain(shop);
      
      if (!shopData) {
        throw new Error(`Shop ${shop} not found`);
      }
      
      // Get portal settings from shop settings
      const portalSettings = shopData.settings?.portalSettings || {
        enabled: false,
        portalUrl: '',
        apiKey: '',
        autoSync: false,
        syncFrequency: 'daily',
        lastSyncAt: null,
        collections: [],
        customerVisibility: 'all',
        displaySettings: {
          logoEnabled: true,
          colorScheme: 'light',
          showPrices: true,
          allowClientFavorites: true,
          allowClientNotes: true
        }
      };
      
      return portalSettings;
    } catch (error) {
      logger.error(`Error getting portal settings for shop ${shop}:`, error);
      throw error;
    }
  }
  
  /**
   * Save shop-specific portal settings
   * 
   * @param {string} shop Shop domain
   * @param {Object} settings Portal settings
   * @returns {boolean} Success
   */
  async savePortalSettings(shop, settings) {
    try {
      // Get shop data
      const shopData = await db.getShopByDomain(shop);
      
      if (!shopData) {
        throw new Error(`Shop ${shop} not found`);
      }
      
      // Initialize settings if needed
      if (!shopData.settings) {
        shopData.settings = {};
      }
      
      // Update portal settings
      shopData.settings.portalSettings = settings;
      
      // Save to database
      await db.saveShop(shopData);
      
      // Clear connection cache if settings changed
      this.portalConnections.delete(shop);
      
      return true;
    } catch (error) {
      logger.error(`Error saving portal settings for shop ${shop}:`, error);
      throw error;
    }
  }
  
  /**
   * Test connection to client portal
   * 
   * @param {string} shop Shop domain
   * @param {string} portalUrl Portal URL
   * @param {string} apiKey API key
   * @returns {Object} Test result
   */
  async testConnection(shop, portalUrl, apiKey) {
    try {
      // Make API request to portal health check endpoint
      const response = await axios({
        method: 'GET',
        url: `${portalUrl}/api/health`,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Eyewear Catalog Shopify App'
        },
        params: {
          shop
        }
      });
      
      if (response.status === 200 && response.data.status === 'ok') {
        return {
          success: true,
          message: 'Connection successful',
          details: response.data
        };
      } else {
        return {
          success: false,
          message: 'Connection test failed',
          error: 'Invalid response from client portal'
        };
      }
    } catch (error) {
      logger.error('Client portal connection test failed:', error);
      return {
        success: false,
        message: 'Connection failed',
        error: error.message || 'Unknown error'
      };
    }
  }
  
  /**
   * Get client portal connection for a shop
   * 
   * @param {string} shop Shop domain
   * @returns {Object} Portal connection with API methods
   */
  async getPortalConnection(shop) {
    try {
      // Check cache first
      if (this.portalConnections.has(shop)) {
        return this.portalConnections.get(shop);
      }
      
      // Get portal settings
      const portalSettings = await this.getPortalSettings(shop);
      
      if (!portalSettings.enabled || !portalSettings.portalUrl || !portalSettings.apiKey) {
        throw new Error('Client portal not configured');
      }
      
      // Create connection
      const connection = {
        shop,
        portalUrl: portalSettings.portalUrl,
        apiKey: portalSettings.apiKey,
        
        // API methods
        getPortalInfo: async () => {
          return this.makePortalRequest(
            portalSettings.portalUrl,
            portalSettings.apiKey,
            'GET',
            '/api/portal-info',
            { shop }
          );
        },
        
        syncProduct: async (productId, shopifyProduct) => {
          return this.makePortalRequest(
            portalSettings.portalUrl,
            portalSettings.apiKey,
            'POST',
            '/api/products/sync',
            {
              shop,
              productId,
              productData: shopifyProduct
            }
          );
        },
        
        syncProducts: async (products) => {
          return this.makePortalRequest(
            portalSettings.portalUrl,
            portalSettings.apiKey,
            'POST',
            '/api/products/bulk-sync',
            {
              shop,
              products
            }
          );
        },
        
        deleteProduct: async (productId) => {
          return this.makePortalRequest(
            portalSettings.portalUrl,
            portalSettings.apiKey,
            'DELETE',
            `/api/products/${productId}`,
            { shop }
          );
        },
        
        syncCollection: async (collectionId, shopifyCollection) => {
          return this.makePortalRequest(
            portalSettings.portalUrl,
            portalSettings.apiKey,
            'POST',
            '/api/collections/sync',
            {
              shop,
              collectionId,
              collectionData: shopifyCollection
            }
          );
        },
        
        syncCollections: async (collections) => {
          return this.makePortalRequest(
            portalSettings.portalUrl,
            portalSettings.apiKey,
            'POST',
            '/api/collections/bulk-sync',
            {
              shop,
              collections
            }
          );
        },
        
        getCustomers: async (page = 1, limit = 50) => {
          return this.makePortalRequest(
            portalSettings.portalUrl,
            portalSettings.apiKey,
            'GET',
            '/api/customers',
            { 
              shop,
              page,
              limit
            }
          );
        },
        
        getCustomerActivity: async (customerId, startDate, endDate) => {
          return this.makePortalRequest(
            portalSettings.portalUrl,
            portalSettings.apiKey,
            'GET',
            `/api/customers/${customerId}/activity`,
            { 
              shop,
              startDate,
              endDate
            }
          );
        },
        
        getProductEngagement: async (productId, startDate, endDate) => {
          return this.makePortalRequest(
            portalSettings.portalUrl,
            portalSettings.apiKey,
            'GET',
            `/api/products/${productId}/engagement`,
            { 
              shop,
              startDate,
              endDate
            }
          );
        },
        
        getPortalStats: async (startDate, endDate) => {
          return this.makePortalRequest(
            portalSettings.portalUrl,
            portalSettings.apiKey,
            'GET',
            '/api/stats',
            { 
              shop,
              startDate,
              endDate
            }
          );
        },
        
        updateSettings: async (settings) => {
          return this.makePortalRequest(
            portalSettings.portalUrl,
            portalSettings.apiKey,
            'POST',
            '/api/settings',
            {
              shop,
              settings
            }
          );
        }
      };
      
      // Cache the connection
      this.portalConnections.set(shop, connection);
      
      return connection;
    } catch (error) {
      logger.error(`Error getting portal connection for shop ${shop}:`, error);
      throw error;
    }
  }
  
  /**
   * Make an API request to the client portal
   * 
   * @param {string} portalUrl Portal URL
   * @param {string} apiKey API key
   * @param {string} method HTTP method
   * @param {string} endpoint API endpoint
   * @param {Object} data Request data
   * @returns {Object} API response
   */
  async makePortalRequest(portalUrl, apiKey, method, endpoint, data) {
    try {
      // Format GET params
      let params = {};
      
      if (method === 'GET' && data) {
        params = { ...data };
        data = null;
      }
      
      // Make the request
      const response = await axios({
        method,
        url: `${portalUrl}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Eyewear Catalog Shopify App'
        },
        params,
        data: data ? JSON.stringify(data) : undefined
      });
      
      return response.data;
    } catch (error) {
      logger.error(`Client portal API error (${method} ${endpoint}):`, error.response?.data || error.message);
      throw error;
    }
  }
  
  /**
   * Sync a product to client portal
   * 
   * @param {string} shop Shop domain
   * @param {string} accessToken Shop access token
   * @param {string} productId Shopify product ID
   * @returns {Object} Sync result
   */
  async syncProduct(shop, accessToken, productId) {
    try {
      // Check if portal is enabled
      const settings = await this.getPortalSettings(shop);
      
      if (!settings.enabled) {
        throw new Error('Client portal integration is not enabled');
      }
      
      // Get product from Shopify
      const product = await shopifyService.getProduct(
        accessToken,
        shop,
        productId
      );
      
      if (!product) {
        throw new Error(`Product ${productId} not found in Shopify`);
      }
      
      // Get portal connection
      const portalConn = await this.getPortalConnection(shop);
      
      // Sync product
      const result = await portalConn.syncProduct(productId, product);
      
      // Log sync
      await this.logPortalSync(shop, {
        type: 'product',
        id: productId,
        action: 'sync',
        timestamp: new Date().toISOString(),
        success: true,
        details: { result }
      });
      
      return {
        success: true,
        productId,
        syncedAt: new Date().toISOString(),
        result
      };
    } catch (error) {
      logger.error(`Error syncing product ${productId} to client portal:`, error);
      
      // Log failure
      await this.logPortalSync(shop, {
        type: 'product',
        id: productId,
        action: 'sync',
        timestamp: new Date().toISOString(),
        success: false,
        error: error.message || 'Unknown error'
      });
      
      throw error;
    }
  }
  
  /**
   * Sync multiple products to client portal
   * 
   * @param {string} shop Shop domain
   * @param {string} accessToken Shop access token
   * @param {Array} productIds Shopify product IDs
   * @returns {Object} Sync result
   */
  async syncProducts(shop, accessToken, productIds) {
    try {
      // Check if portal is enabled
      const settings = await this.getPortalSettings(shop);
      
      if (!settings.enabled) {
        throw new Error('Client portal integration is not enabled');
      }
      
      // Get products from Shopify
      const products = [];
      const errors = [];
      
      // Process in batches of 10
      const batchSize = 10;
      const batchCount = Math.ceil(productIds.length / batchSize);
      
      for (let i = 0; i < batchCount; i++) {
        const batchProductIds = productIds.slice(i * batchSize, (i + 1) * batchSize);
        const productBatch = await Promise.all(
          batchProductIds.map(async (productId) => {
            try {
              const product = await shopifyService.getProduct(
                accessToken,
                shop,
                productId
              );
              
              if (product) {
                return {
                  id: productId,
                  product
                };
              } else {
                errors.push({
                  productId,
                  error: 'Product not found in Shopify'
                });
                return null;
              }
            } catch (error) {
              errors.push({
                productId,
                error: error.message || 'Error fetching product'
              });
              return null;
            }
          })
        );
        
        // Filter out nulls
        productBatch.filter(p => p !== null).forEach(p => products.push(p));
      }
      
      if (products.length === 0) {
        return {
          success: false,
          error: 'No valid products to sync',
          errors
        };
      }
      
      // Get portal connection
      const portalConn = await this.getPortalConnection(shop);
      
      // Sync products
      const result = await portalConn.syncProducts(products);
      
      // Log sync
      await this.logPortalSync(shop, {
        type: 'products',
        ids: products.map(p => p.id),
        action: 'bulk-sync',
        timestamp: new Date().toISOString(),
        success: true,
        details: { 
          total: products.length,
          result
        }
      });
      
      return {
        success: true,
        total: productIds.length,
        synced: products.length,
        failed: errors.length,
        errors,
        syncedAt: new Date().toISOString(),
        result
      };
    } catch (error) {
      logger.error(`Error syncing multiple products to client portal:`, error);
      
      // Log failure
      await this.logPortalSync(shop, {
        type: 'products',
        ids: productIds,
        action: 'bulk-sync',
        timestamp: new Date().toISOString(),
        success: false,
        error: error.message || 'Unknown error'
      });
      
      throw error;
    }
  }
  
  /**
   * Sync all products within a collection
   * 
   * @param {string} shop Shop domain
   * @param {string} accessToken Shop access token
   * @param {string} collectionId Shopify collection ID
   * @returns {Object} Sync result
   */
  async syncCollection(shop, accessToken, collectionId) {
    try {
      // Check if portal is enabled
      const settings = await this.getPortalSettings(shop);
      
      if (!settings.enabled) {
        throw new Error('Client portal integration is not enabled');
      }
      
      // Get collection from Shopify
      const collection = await shopifyService.getCollection(
        accessToken,
        shop,
        collectionId
      );
      
      if (!collection) {
        throw new Error(`Collection ${collectionId} not found in Shopify`);
      }
      
      // Get products in collection
      const collectionProducts = await shopifyService.getProductsByCollection(
        accessToken,
        shop,
        collectionId,
        { limit: 250 }
      );
      
      if (!collectionProducts || collectionProducts.products.length === 0) {
        return {
          success: true,
          message: 'Collection synced but contains no products',
          collectionId,
          productCount: 0
        };
      }
      
      // Get portal connection
      const portalConn = await this.getPortalConnection(shop);
      
      // Sync collection first
      await portalConn.syncCollection(collectionId, collection);
      
      // Then sync products
      const productIds = collectionProducts.products.map(p => p.id);
      const result = await this.syncProducts(shop, accessToken, productIds);
      
      return {
        success: true,
        collectionId,
        collectionTitle: collection.title,
        productCount: productIds.length,
        syncedAt: new Date().toISOString(),
        productsResult: result
      };
    } catch (error) {
      logger.error(`Error syncing collection ${collectionId} to client portal:`, error);
      
      // Log failure
      await this.logPortalSync(shop, {
        type: 'collection',
        id: collectionId,
        action: 'sync',
        timestamp: new Date().toISOString(),
        success: false,
        error: error.message || 'Unknown error'
      });
      
      throw error;
    }
  }
  
  /**
   * Sync multiple collections to client portal
   * 
   * @param {string} shop Shop domain
   * @param {string} accessToken Shop access token
   * @param {Array} collectionIds Shopify collection IDs
   * @returns {Object} Sync result
   */
  async syncCollections(shop, accessToken, collectionIds) {
    try {
      // Check if portal is enabled
      const settings = await this.getPortalSettings(shop);
      
      if (!settings.enabled) {
        throw new Error('Client portal integration is not enabled');
      }
      
      const results = [];
      const errors = [];
      
      for (const collectionId of collectionIds) {
        try {
          const result = await this.syncCollection(shop, accessToken, collectionId);
          results.push(result);
        } catch (error) {
          errors.push({
            collectionId,
            error: error.message || 'Error syncing collection'
          });
        }
      }
      
      return {
        success: true,
        total: collectionIds.length,
        synced: results.length,
        failed: errors.length,
        errors,
        syncedAt: new Date().toISOString(),
        results
      };
    } catch (error) {
      logger.error(`Error syncing multiple collections to client portal:`, error);
      throw error;
    }
  }
  
  /**
   * Run automatic sync to client portal
   * 
   * @param {string} shop Shop domain
   * @param {string} accessToken Shop access token
   * @returns {Object} Sync result
   */
  async runAutoSync(shop, accessToken) {
    try {
      // Get portal settings
      const settings = await this.getPortalSettings(shop);
      
      if (!settings.enabled || !settings.autoSync) {
        throw new Error('Automatic sync is not enabled');
      }
      
      // Update last sync time
      settings.lastSyncAt = new Date().toISOString();
      await this.savePortalSettings(shop, settings);
      
      // Sync collections
      if (settings.collections && settings.collections.length > 0) {
        await this.syncCollections(shop, accessToken, settings.collections);
      } else {
        // If no collections specified, sync all products
        const products = await shopifyService.getProducts(
          accessToken,
          shop,
          { limit: 250 }
        );
        
        if (products && products.products.length > 0) {
          const productIds = products.products.map(p => p.id);
          await this.syncProducts(shop, accessToken, productIds);
        }
      }
      
      return {
        success: true,
        syncedAt: settings.lastSyncAt
      };
    } catch (error) {
      logger.error(`Error running auto sync to client portal for ${shop}:`, error);
      throw error;
    }
  }
  
  /**
   * Process a webhook from the client portal
   * 
   * @param {string} shop Shop domain
   * @param {string} event Event type
   * @param {Object} payload Event payload
   * @returns {Object} Processing result
   */
  async processWebhook(shop, event, payload) {
    try {
      // Log webhook
      logger.info(`Received webhook from client portal - shop: ${shop}, event: ${event}`);
      
      let result = null;
      
      switch (event) {
        case 'customer.favorite.added':
          // Product favorited by customer
          result = await this.handleFavoriteAdded(shop, payload);
          break;
          
        case 'customer.note.added':
          // Note added to product by customer
          result = await this.handleNoteAdded(shop, payload);
          break;
          
        case 'customer.activity':
          // Customer activity (view, click, etc.)
          result = await this.handleCustomerActivity(shop, payload);
          break;
          
        case 'settings.updated':
          // Portal settings updated
          result = await this.handleSettingsUpdated(shop, payload);
          break;
          
        default:
          logger.warn(`Unknown webhook event: ${event}`);
          result = { success: false, error: 'Unknown event type' };
      }
      
      // Log webhook handling
      await this.logPortalWebhook(shop, {
        event,
        payload,
        timestamp: new Date().toISOString(),
        result
      });
      
      return result;
    } catch (error) {
      logger.error(`Error processing webhook:`, error);
      throw error;
    }
  }
  
  /**
   * Handle favorite added webhook
   * 
   * @param {string} shop Shop domain
   * @param {Object} payload Event payload
   * @returns {Object} Handling result
   */
  async handleFavoriteAdded(shop, payload) {
    try {
      const { customerId, productId, timestamp } = payload;
      
      // Get shop settings
      const shopData = await db.getShopByDomain(shop);
      
      if (!shopData) {
        throw new Error(`Shop ${shop} not found`);
      }
      
      // Add favorite to database
      await db.saveCustomerFavorite(shop, customerId, productId, timestamp);
      
      return {
        success: true,
        message: 'Favorite processed'
      };
    } catch (error) {
      logger.error(`Error handling favorite added:`, error);
      return {
        success: false,
        error: error.message || 'Unknown error'
      };
    }
  }
  
  /**
   * Handle note added webhook
   * 
   * @param {string} shop Shop domain
   * @param {Object} payload Event payload
   * @returns {Object} Handling result
   */
  async handleNoteAdded(shop, payload) {
    try {
      const { customerId, productId, note, timestamp } = payload;
      
      // Add note to database
      await db.saveCustomerNote(shop, customerId, productId, note, timestamp);
      
      return {
        success: true,
        message: 'Note processed'
      };
    } catch (error) {
      logger.error(`Error handling note added:`, error);
      return {
        success: false,
        error: error.message || 'Unknown error'
      };
    }
  }
  
  /**
   * Handle customer activity webhook
   * 
   * @param {string} shop Shop domain
   * @param {Object} payload Event payload
   * @returns {Object} Handling result
   */
  async handleCustomerActivity(shop, payload) {
    try {
      const { customerId, activity, timestamp } = payload;
      
      // Save activity to database
      await db.saveCustomerActivity(shop, customerId, activity, timestamp);
      
      return {
        success: true,
        message: 'Activity processed'
      };
    } catch (error) {
      logger.error(`Error handling customer activity:`, error);
      return {
        success: false,
        error: error.message || 'Unknown error'
      };
    }
  }
  
  /**
   * Handle settings updated webhook
   * 
   * @param {string} shop Shop domain
   * @param {Object} payload Event payload
   * @returns {Object} Handling result
   */
  async handleSettingsUpdated(shop, payload) {
    try {
      const { settings } = payload;
      
      // Get current settings
      const currentSettings = await this.getPortalSettings(shop);
      
      // Merge with new settings
      const updatedSettings = {
        ...currentSettings,
        ...settings,
        // Don't override credentials from webhook
        portalUrl: currentSettings.portalUrl,
        apiKey: currentSettings.apiKey
      };
      
      // Save updated settings
      await this.savePortalSettings(shop, updatedSettings);
      
      return {
        success: true,
        message: 'Settings updated'
      };
    } catch (error) {
      logger.error(`Error handling settings updated:`, error);
      return {
        success: false,
        error: error.message || 'Unknown error'
      };
    }
  }
  
  /**
   * Get customer engagement data for products
   * 
   * @param {string} shop Shop domain
   * @param {Array} productIds Product IDs (optional)
   * @param {string} startDate Start date (optional)
   * @param {string} endDate End date (optional)
   * @returns {Object} Engagement data
   */
  async getProductEngagement(shop, productIds = null, startDate = null, endDate = null) {
    try {
      // Check if portal is enabled
      const settings = await this.getPortalSettings(shop);
      
      if (!settings.enabled) {
        throw new Error('Client portal integration is not enabled');
      }
      
      // Get portal connection
      const portalConn = await this.getPortalConnection(shop);
      
      // Get engagement stats for products
      let engagementData = [];
      
      if (productIds && productIds.length > 0) {
        // Get stats for specific products
        engagementData = await Promise.all(
          productIds.map(async (productId) => {
            try {
              return await portalConn.getProductEngagement(productId, startDate, endDate);
            } catch (error) {
              logger.error(`Error getting engagement for product ${productId}:`, error);
              return {
                productId,
                error: error.message || 'Unknown error'
              };
            }
          })
        );
      } else {
        // Get overall stats
        const stats = await portalConn.getPortalStats(startDate, endDate);
        
        // If the API returns product-level stats in a different format
        if (stats.products) {
          engagementData = stats.products;
        } else {
          engagementData = [stats];
        }
      }
      
      return {
        success: true,
        data: engagementData
      };
    } catch (error) {
      logger.error(`Error getting product engagement:`, error);
      throw error;
    }
  }
  
  /**
   * Log a portal sync event
   * 
   * @param {string} shop Shop domain
   * @param {Object} logData Log data
   * @returns {boolean} Success
   */
  async logPortalSync(shop, logData) {
    try {
      return await db.savePortalSyncLog(shop, logData);
    } catch (error) {
      logger.error(`Error logging portal sync:`, error);
      return false;
    }
  }
  
  /**
   * Log a portal webhook
   * 
   * @param {string} shop Shop domain
   * @param {Object} logData Log data
   * @returns {boolean} Success
   */
  async logPortalWebhook(shop, logData) {
    try {
      return await db.savePortalWebhookLog(shop, logData);
    } catch (error) {
      logger.error(`Error logging portal webhook:`, error);
      return false;
    }
  }
  
  /**
   * Get portal sync logs
   * 
   * @param {string} shop Shop domain
   * @param {number} page Page number
   * @param {number} limit Items per page
   * @param {string} type Filter by log type
   * @returns {Object} Logs with pagination
   */
  async getPortalSyncLogs(shop, page = 1, limit = 20, type = null) {
    try {
      return await db.getPortalSyncLogs(shop, page, limit, type);
    } catch (error) {
      logger.error(`Error getting portal sync logs:`, error);
      throw error;
    }
  }
  
  /**
   * Get portal webhook logs
   * 
   * @param {string} shop Shop domain
   * @param {number} page Page number
   * @param {number} limit Items per page
   * @param {string} event Filter by event type
   * @returns {Object} Logs with pagination
   */
  async getPortalWebhookLogs(shop, page = 1, limit = 20, event = null) {
    try {
      return await db.getPortalWebhookLogs(shop, page, limit, event);
    } catch (error) {
      logger.error(`Error getting portal webhook logs:`, error);
      throw error;
    }
  }
}

// Create singleton instance
const clientPortalService = new ClientPortalService();

module.exports = { clientPortalService };