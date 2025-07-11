/**
 * Eyewear Service
 * 
 * Service for interacting with the eyewear database API.
 * Provides methods for fetching brands, products, and product details.
 */

const fetch = require('node-fetch');
const logger = require('../utils/logger');

// Cache implementation
const cache = {
  brands: new Map(),
  products: new Map(),
  productDetails: new Map(),
  filters: new Map(),
  expirations: new Map(),
  
  /**
   * Set cache item with expiration
   * 
   * @param {string} type Cache type
   * @param {string} key Cache key
   * @param {any} value Value to cache
   * @param {number} ttl Time to live in milliseconds
   */
  set(type, key, value, ttl = 3600000) {
    // Get cache for type
    const typeCache = this[type];
    
    if (!typeCache) {
      return;
    }
    
    // Set value in cache
    typeCache.set(key, value);
    
    // Set expiration
    const expiration = Date.now() + ttl;
    this.expirations.set(`${type}:${key}`, expiration);
    
    // Schedule cleanup
    setTimeout(() => {
      this.delete(type, key);
    }, ttl);
  },
  
  /**
   * Get cached item if not expired
   * 
   * @param {string} type Cache type
   * @param {string} key Cache key
   * @returns {any} Cached value or undefined
   */
  get(type, key) {
    // Get cache for type
    const typeCache = this[type];
    
    if (!typeCache) {
      return undefined;
    }
    
    // Check expiration
    const expiration = this.expirations.get(`${type}:${key}`);
    
    if (!expiration || expiration < Date.now()) {
      // Expired or not set
      this.delete(type, key);
      return undefined;
    }
    
    // Return cached value
    return typeCache.get(key);
  },
  
  /**
   * Delete cached item
   * 
   * @param {string} type Cache type
   * @param {string} key Cache key
   */
  delete(type, key) {
    // Get cache for type
    const typeCache = this[type];
    
    if (!typeCache) {
      return;
    }
    
    // Delete from cache
    typeCache.delete(key);
    this.expirations.delete(`${type}:${key}`);
  },
  
  /**
   * Clear cache by type
   * 
   * @param {string} type Cache type to clear (optional, clears all if not specified)
   */
  clear(type = null) {
    if (type && this[type]) {
      // Clear specific type
      this[type].clear();
      
      // Clear expirations for this type
      for (const expKey of this.expirations.keys()) {
        if (expKey.startsWith(`${type}:`)) {
          this.expirations.delete(expKey);
        }
      }
    } else if (!type) {
      // Clear all caches
      this.brands.clear();
      this.products.clear();
      this.productDetails.clear();
      this.filters.clear();
      this.expirations.clear();
    }
  }
};

class EyewearService {
  constructor() {
    this.baseUrl = process.env.EYEWEAR_DB_API_URL || 'https://api.eyewear-database.com';
    this.apiKey = process.env.EYEWEAR_DB_API_KEY;
    this.apiVersion = process.env.EYEWEAR_DB_API_VERSION || 'v1';
    this.timeout = parseInt(process.env.EYEWEAR_DB_TIMEOUT, 10) || 30000;
  }
  
  /**
   * Make API request
   * 
   * @param {string} endpoint API endpoint
   * @param {Object} options Request options
   * @returns {Object} API response
   */
  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${this.baseUrl}/${this.apiVersion}/${endpoint}`;
      
      // Set default options
      const requestOptions = {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
          'X-API-Version': this.apiVersion,
          ...options.headers
        },
        timeout: options.timeout || this.timeout
      };
      
      // Add body for non-GET requests
      if (options.body && requestOptions.method !== 'GET') {
        requestOptions.body = JSON.stringify(options.body);
      }
      
      // Add shop header if provided
      if (options.shop) {
        requestOptions.headers['X-Shop-Domain'] = options.shop;
      }
      
      // Make request
      const response = await fetch(url, requestOptions);
      
      // Parse response
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      // Check if response is successful
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}, ${JSON.stringify(data)}`);
      }
      
      return data;
    } catch (error) {
      logger.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }
  
  /**
   * Get all brands
   * 
   * @param {string} shop Shop domain
   * @param {Object} options Request options
   * @returns {Array} Brands
   */
  async getBrands(shop, options = {}) {
    try {
      // Check cache first if caching is enabled
      if (!options.noCache) {
        const cacheKey = `brands:${shop}`;
        const cachedBrands = cache.get('brands', cacheKey);
        
        if (cachedBrands) {
          return cachedBrands;
        }
      }
      
      // Make API request
      const response = await this.makeRequest('brands', {
        shop,
        headers: { 'X-Request-ID': options.requestId }
      });
      
      // Cache response if caching is enabled
      if (!options.noCache) {
        const cacheKey = `brands:${shop}`;
        cache.set('brands', cacheKey, response.brands, 3600000); // 1 hour
      }
      
      return response.brands;
    } catch (error) {
      logger.error(`Error getting brands for shop ${shop}:`, error);
      throw error;
    }
  }
  
  /**
   * Get products by brand
   * 
   * @param {string} shop Shop domain
   * @param {string} brandId Brand ID
   * @param {Object} options Request options
   * @returns {Object} Products with pagination
   */
  async getProductsByBrand(shop, brandId, options = {}) {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (options.page) {
        params.append('page', options.page);
      }
      
      if (options.limit) {
        params.append('limit', options.limit);
      }
      
      if (options.productType) {
        params.append('product_type', options.productType);
      }
      
      if (options.gender) {
        params.append('gender', options.gender);
      }
      
      if (options.material) {
        params.append('material', options.material);
      }
      
      if (options.color) {
        params.append('color', options.color);
      }
      
      if (options.shape) {
        params.append('shape', options.shape);
      }
      
      if (options.sort) {
        params.append('sort', options.sort);
      }
      
      // Check cache first if caching is enabled
      if (!options.noCache) {
        const cacheKey = `${brandId}:${params.toString()}:${shop}`;
        const cachedProducts = cache.get('products', cacheKey);
        
        if (cachedProducts) {
          return cachedProducts;
        }
      }
      
      // Make API request
      const response = await this.makeRequest(`brands/${brandId}/products?${params.toString()}`, {
        shop,
        headers: { 'X-Request-ID': options.requestId }
      });
      
      // Cache response if caching is enabled
      if (!options.noCache) {
        const cacheKey = `${brandId}:${params.toString()}:${shop}`;
        cache.set('products', cacheKey, response, 1800000); // 30 minutes
      }
      
      return response;
    } catch (error) {
      logger.error(`Error getting products for brand ${brandId} for shop ${shop}:`, error);
      throw error;
    }
  }
  
  /**
   * Get product details
   * 
   * @param {string} shop Shop domain
   * @param {string} productId Product ID
   * @param {Object} options Request options
   * @returns {Object} Product details
   */
  async getProductDetails(shop, productId, options = {}) {
    try {
      // Check cache first if caching is enabled
      if (!options.noCache) {
        const cacheKey = `${productId}:${shop}`;
        const cachedProduct = cache.get('productDetails', cacheKey);
        
        if (cachedProduct) {
          return cachedProduct;
        }
      }
      
      // Make API request
      const response = await this.makeRequest(`products/${productId}`, {
        shop,
        headers: { 'X-Request-ID': options.requestId }
      });
      
      // Cache response if caching is enabled
      if (!options.noCache) {
        const cacheKey = `${productId}:${shop}`;
        cache.set('productDetails', cacheKey, response.product, 3600000); // 1 hour
      }
      
      return response.product;
    } catch (error) {
      logger.error(`Error getting product details for ${productId} for shop ${shop}:`, error);
      throw error;
    }
  }
  
  /**
   * Get product by SKU
   * 
   * @param {string} shop Shop domain
   * @param {string} sku SKU
   * @param {Object} options Request options
   * @returns {Object} Product details
   */
  async getProductBySku(shop, sku, options = {}) {
    try {
      // Check cache first if caching is enabled
      if (!options.noCache) {
        const cacheKey = `sku:${sku}:${shop}`;
        const cachedProduct = cache.get('productDetails', cacheKey);
        
        if (cachedProduct) {
          return cachedProduct;
        }
      }
      
      // Make API request
      const response = await this.makeRequest(`products/sku/${sku}`, {
        shop,
        headers: { 'X-Request-ID': options.requestId }
      });
      
      // Cache response if caching is enabled
      if (!options.noCache) {
        const cacheKey = `sku:${sku}:${shop}`;
        cache.set('productDetails', cacheKey, response.product, 3600000); // 1 hour
      }
      
      return response.product;
    } catch (error) {
      logger.error(`Error getting product by SKU ${sku} for shop ${shop}:`, error);
      throw error;
    }
  }
  
  /**
   * Search products
   * 
   * @param {string} shop Shop domain
   * @param {string} query Search query
   * @param {Object} options Request options
   * @returns {Object} Search results with pagination
   */
  async searchProducts(shop, query, options = {}) {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('q', query);
      
      if (options.page) {
        params.append('page', options.page);
      }
      
      if (options.limit) {
        params.append('limit', options.limit);
      }
      
      if (options.productType) {
        params.append('product_type', options.productType);
      }
      
      if (options.brandId) {
        params.append('brand_id', options.brandId);
      }
      
      if (options.gender) {
        params.append('gender', options.gender);
      }
      
      if (options.material) {
        params.append('material', options.material);
      }
      
      if (options.color) {
        params.append('color', options.color);
      }
      
      if (options.shape) {
        params.append('shape', options.shape);
      }
      
      if (options.sort) {
        params.append('sort', options.sort);
      }
      
      // Make API request
      const response = await this.makeRequest(`search?${params.toString()}`, {
        shop,
        headers: { 'X-Request-ID': options.requestId }
      });
      
      return response;
    } catch (error) {
      logger.error(`Error searching products with query "${query}" for shop ${shop}:`, error);
      throw error;
    }
  }
  
  /**
   * Get available filters
   * 
   * @param {string} shop Shop domain
   * @param {Object} options Request options
   * @returns {Object} Available filters
   */
  async getAvailableFilters(shop, options = {}) {
    try {
      // Check cache first if caching is enabled
      if (!options.noCache) {
        const cacheKey = `filters:${shop}`;
        const cachedFilters = cache.get('filters', cacheKey);
        
        if (cachedFilters) {
          return cachedFilters;
        }
      }
      
      // Make API request
      const response = await this.makeRequest('filters', {
        shop,
        headers: { 'X-Request-ID': options.requestId }
      });
      
      // Cache response if caching is enabled
      if (!options.noCache) {
        const cacheKey = `filters:${shop}`;
        cache.set('filters', cacheKey, response.filters, 86400000); // 24 hours
      }
      
      return response.filters;
    } catch (error) {
      logger.error(`Error getting available filters for shop ${shop}:`, error);
      throw error;
    }
  }
  
  /**
   * Get recently updated products
   * 
   * @param {string} shop Shop domain
   * @param {Object} options Request options
   * @returns {Object} Recently updated products with pagination
   */
  async getRecentlyUpdatedProducts(shop, options = {}) {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (options.page) {
        params.append('page', options.page);
      }
      
      if (options.limit) {
        params.append('limit', options.limit);
      }
      
      if (options.since) {
        params.append('since', options.since);
      }
      
      if (options.productType) {
        params.append('product_type', options.productType);
      }
      
      if (options.brandId) {
        params.append('brand_id', options.brandId);
      }
      
      // Make API request
      const response = await this.makeRequest(`products/recent?${params.toString()}`, {
        shop,
        headers: { 'X-Request-ID': options.requestId }
      });
      
      return response;
    } catch (error) {
      logger.error(`Error getting recently updated products for shop ${shop}:`, error);
      throw error;
    }
  }
  
  /**
   * Clear cache
   * 
   * @param {string} shop Shop domain
   * @param {string} type Cache type to clear (optional)
   */
  clearCache(shop, type = null) {
    if (type) {
      // Clear specific cache type
      cache.clear(type);
      logger.info(`Cleared ${type} cache for shop ${shop}`);
    } else {
      // Clear all caches
      cache.clear();
      logger.info(`Cleared all caches for shop ${shop}`);
    }
    
    return true;
  }
}

// Create singleton instance
const eyewearService = new EyewearService();

module.exports = { eyewearService };