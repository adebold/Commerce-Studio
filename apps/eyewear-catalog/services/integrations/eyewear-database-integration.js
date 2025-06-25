/**
 * Eyewear Database Integration
 * 
 * Integration service for connecting to the eyewear database API.
 * Provides methods for retrieving eyewear product data.
 */

const axios = require('axios');
const logger = require('../../utils/logger');
const NodeCache = require('node-cache');

class EyewearDatabaseIntegration {
  /**
   * Create a new eyewear database integration
   * 
   * @param {Object} config Integration configuration
   * @param {string} config.apiBaseUrl Base URL for the API
   * @param {string} config.apiKey API key for authentication
   * @param {number} config.timeout Request timeout in milliseconds
   * @param {string} config.version API version
   * @param {string} config.shopId Unique identifier for the shop
   * @param {boolean} config.includeInactive Whether to include inactive products
   */
  constructor(config) {
    this.config = {
      apiBaseUrl: config.apiBaseUrl,
      apiKey: config.apiKey,
      timeout: config.timeout || 30000,
      version: config.version || 'v1',
      shopId: config.shopId || 'default',
      includeInactive: config.includeInactive || false
    };
    
    // Initialize axios client
    this.client = axios.create({
      baseURL: `${this.config.apiBaseUrl}/${this.config.version}`,
      timeout: this.config.timeout,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Shop-ID': this.config.shopId
      }
    });
    
    // Initialize cache
    this.cache = {
      brands: new NodeCache({ stdTTL: 3600, checkperiod: 120 }), // 1 hour cache
      products: new NodeCache({ stdTTL: 1800, checkperiod: 120 }), // 30 minutes cache
      details: new NodeCache({ stdTTL: 1800, checkperiod: 120 }), // 30 minutes cache
      filters: new NodeCache({ stdTTL: 3600, checkperiod: 120 }) // 1 hour cache
    };
    
    // Initialize flag
    this.initialized = false;
  }
  
  /**
   * Initialize the integration
   */
  async initialize() {
    if (this.initialized) {
      return true;
    }
    
    try {
      logger.info(`Initializing eyewear database integration for shop ${this.config.shopId}`);
      
      // Test connection to API
      await this.testConnection();
      
      this.initialized = true;
      logger.info(`Eyewear database integration initialized successfully for shop ${this.config.shopId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to initialize eyewear database integration for shop ${this.config.shopId}:`, error);
      throw error;
    }
  }
  
  /**
   * Test connection to the API
   * 
   * @returns {Object} Connection status
   */
  async testConnection() {
    try {
      const response = await this.client.get('/status');
      
      if (response.status === 200) {
        return {
          success: true,
          message: 'Successfully connected to eyewear database API',
          apiVersion: response.data.version,
          timestamp: response.data.timestamp
        };
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    } catch (error) {
      if (error.response) {
        // API responded with an error
        throw new Error(`API error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
      } else if (error.request) {
        // No response received
        throw new Error(`No response from API: ${error.message}`);
      } else {
        // Request setup error
        throw new Error(`Request setup error: ${error.message}`);
      }
    }
  }
  
  /**
   * Get all brands
   * 
   * @returns {Array} Array of brand objects
   */
  async getBrands() {
    try {
      // Check cache first
      const cacheKey = 'process.env.EYEWEAR_DATABASE_INTEGRATION_SECRET';
      const cachedBrands = this.cache.brands.get(cacheKey);
      
      if (cachedBrands) {
        return cachedBrands;
      }
      
      // Not in cache, fetch from API
      const response = await this.client.get('/brands', {
        params: {
          limit: 1000,
          include_products_count: true
        }
      });
      
      if (response.status === 200) {
        // Cache the result
        this.cache.brands.set(cacheKey, response.data.brands);
        
        return response.data.brands;
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    } catch (error) {
      logger.error('Error getting brands from eyewear database:', error);
      
      if (error.response) {
        throw new Error(`API error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
      } else {
        throw error;
      }
    }
  }
  
  /**
   * Get products by brand
   * 
   * @param {string} brandId Brand ID
   * @param {Object} options Options for filtering, pagination, etc.
   * @returns {Object} Object with products array and total count
   */
  async getProductsByBrand(brandId, options = {}) {
    try {
      // Check cache first
      const cacheKey = `brand_${brandId}_page_${options.page || 1}_limit_${options.limit || 50}`;
      const cachedProducts = this.cache.products.get(cacheKey);
      
      if (cachedProducts) {
        return cachedProducts;
      }
      
      // Not in cache, fetch from API
      const response = await this.client.get(`/brands/${brandId}/products`, {
        params: {
          page: options.page || 1,
          limit: options.limit || 50,
          include_inactive: this.config.includeInactive,
          product_type: options.productType,
          gender: options.gender,
          material: options.material,
          color: options.color,
          shape: options.shape,
          sort: options.sort || 'newest'
        }
      });
      
      if (response.status === 200) {
        // Cache the result
        this.cache.products.set(cacheKey, response.data);
        
        return response.data;
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    } catch (error) {
      logger.error(`Error getting products for brand ${brandId} from eyewear database:`, error);
      
      if (error.response) {
        throw new Error(`API error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
      } else {
        throw error;
      }
    }
  }
  
  /**
   * Get product details
   * 
   * @param {string} productId Product ID
   * @returns {Object} Product details
   */
  async getProductDetails(productId) {
    try {
      // Check cache first
      const cacheKey = `product_${productId}`;
      const cachedProduct = this.cache.details.get(cacheKey);
      
      if (cachedProduct) {
        return cachedProduct;
      }
      
      // Not in cache, fetch from API
      const response = await this.client.get(`/products/${productId}`, {
        params: {
          include_variants: true,
          include_images: true,
          include_specifications: true,
          include_dimensions: true,
          include_metadata: true
        }
      });
      
      if (response.status === 200) {
        // Cache the result
        this.cache.details.set(cacheKey, response.data.product);
        
        return response.data.product;
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    } catch (error) {
      logger.error(`Error getting details for product ${productId} from eyewear database:`, error);
      
      if (error.response) {
        // If 404, return null
        if (error.response.status === 404) {
          return null;
        }
        
        throw new Error(`API error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
      } else {
        throw error;
      }
    }
  }
  
  /**
   * Search products
   * 
   * @param {string} query Search query
   * @param {Object} options Options for filtering, pagination, etc.
   * @returns {Object} Object with products array and total count
   */
  async searchProducts(query, options = {}) {
    try {
      // For search, we don't use cache as queries can be very diverse
      
      const response = await this.client.get('/products/search', {
        params: {
          q: query,
          page: options.page || 1,
          limit: options.limit || 50,
          include_inactive: this.config.includeInactive,
          product_type: options.productType,
          brand_id: options.brandId,
          gender: options.gender,
          material: options.material,
          color: options.color,
          shape: options.shape,
          sort: options.sort || 'relevance'
        }
      });
      
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    } catch (error) {
      logger.error(`Error searching products with query "${query}" from eyewear database:`, error);
      
      if (error.response) {
        throw new Error(`API error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
      } else {
        throw error;
      }
    }
  }
  
  /**
   * Get available filters
   * 
   * @returns {Object} Available filters
   */
  async getAvailableFilters() {
    try {
      // Check cache first
      const cacheKey = 'filters';
      const cachedFilters = this.cache.filters.get(cacheKey);
      
      if (cachedFilters) {
        return cachedFilters;
      }
      
      // Not in cache, fetch from API
      const response = await this.client.get('/filters');
      
      if (response.status === 200) {
        // Cache the result
        this.cache.filters.set(cacheKey, response.data.filters);
        
        return response.data.filters;
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    } catch (error) {
      logger.error('Error getting available filters from eyewear database:', error);
      
      if (error.response) {
        throw new Error(`API error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
      } else {
        throw error;
      }
    }
  }
  
  /**
   * Get product by SKU
   * 
   * @param {string} sku Product SKU
   * @returns {Object|null} Product or null if not found
   */
  async getProductBySku(sku) {
    try {
      // For SKU lookup, we don't use cache as it's not called frequently
      
      const response = await this.client.get('/products', {
        params: {
          sku: sku
        }
      });
      
      if (response.status === 200) {
        if (response.data.products.length > 0) {
          const product = response.data.products[0];
          
          // Cache the result in the details cache
          this.cache.details.set(`product_${product.id}`, product);
          
          return product;
        } else {
          return null;
        }
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    } catch (error) {
      logger.error(`Error getting product by SKU ${sku} from eyewear database:`, error);
      
      if (error.response) {
        // If 404, return null
        if (error.response.status === 404) {
          return null;
        }
        
        throw new Error(`API error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
      } else {
        throw error;
      }
    }
  }
  
  /**
   * Get recently updated products
   * 
   * @param {Object} options Options for filtering, pagination, etc.
   * @returns {Object} Object with products array and total count
   */
  async getRecentlyUpdatedProducts(options = {}) {
    try {
      // For recently updated products, we don't use cache as we want fresh data
      
      const response = await this.client.get('/products/recent', {
        params: {
          page: options.page || 1,
          limit: options.limit || 50,
          include_inactive: this.config.includeInactive,
          since: options.since, // ISO string timestamp
          product_type: options.productType,
          brand_id: options.brandId
        }
      });
      
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    } catch (error) {
      logger.error('Error getting recently updated products from eyewear database:', error);
      
      if (error.response) {
        throw new Error(`API error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
      } else {
        throw error;
      }
    }
  }
  
  /**
   * Clear cache
   * 
   * @param {string} type Cache type (brands, products, details, filters, or null for all)
   */
  clearCache(type = null) {
    if (!type) {
      // Clear all caches
      this.cache.brands.flushAll();
      this.cache.products.flushAll();
      this.cache.details.flushAll();
      this.cache.filters.flushAll();
      
      logger.info(`Cleared all caches for eyewear database integration for shop ${this.config.shopId}`);
    } else if (this.cache[type]) {
      // Clear specific cache
      this.cache[type].flushAll();
      
      logger.info(`Cleared ${type} cache for eyewear database integration for shop ${this.config.shopId}`);
    } else {
      throw new Error(`Unknown cache type: ${type}`);
    }
  }
}

module.exports = EyewearDatabaseIntegration;