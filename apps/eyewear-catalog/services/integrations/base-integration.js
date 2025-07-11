/**
 * Base Integration
 * 
 * Abstract base class for eyewear database integrations.
 * Defines the interface that all integrations must implement.
 */

const logger = require('../../utils/logger');

class BaseIntegration {
  constructor() {
    // Cache settings
    this.cacheEnabled = process.env.CACHE_ENABLED !== 'false';
    this.cacheTTL = parseInt(process.env.CACHE_TTL || '3600', 10); // Default: 1 hour
    
    // Caches
    this.brandCache = new Map();
    this.productCache = new Map();
    this.detailsCache = new Map();
    this.filtersCache = null;
    
    // Cache timestamps
    this.cacheTimestamps = {
      brands: 0,
      products: {},
      details: {},
      filters: 0
    };
    
    // Initialize flag
    this.initialized = false;
  }
  
  /**
   * Initialize the integration
   * This method should be implemented by subclasses
   */
  async initialize() {
    throw new Error('initialize() must be implemented by subclass');
  }
  
  /**
   * Test connection to the eyewear database
   * This method should be implemented by subclasses
   */
  async testConnection() {
    throw new Error('testConnection() must be implemented by subclass');
  }
  
  /**
   * Get all available eyewear brands
   * This method should be implemented by subclasses
   * 
   * @returns {Array} Array of brand objects
   */
  async getBrands() {
    throw new Error('getBrands() must be implemented by subclass');
  }
  
  /**
   * Get products for a specific brand
   * This method should be implemented by subclasses
   * 
   * @param {string} brandId Brand ID
   * @param {Object} options Options for filtering, pagination, etc.
   * @returns {Object} Object with products array and total count
   */
  async getProductsByBrand(brandId, options = {}) {
    throw new Error('getProductsByBrand() must be implemented by subclass');
  }
  
  /**
   * Get details for a specific product
   * This method should be implemented by subclasses
   * 
   * @param {string} productId Product ID
   * @returns {Object} Product details
   */
  async getProductDetails(productId) {
    throw new Error('getProductDetails() must be implemented by subclass');
  }
  
  /**
   * Search products across all brands
   * This method should be implemented by subclasses
   * 
   * @param {string} query Search query
   * @param {Object} options Options for filtering, pagination, etc.
   * @returns {Object} Object with products array and total count
   */
  async searchProducts(query, options = {}) {
    throw new Error('searchProducts() must be implemented by subclass');
  }
  
  /**
   * Get available filters for product search/browse
   * This method should be implemented by subclasses
   * 
   * @returns {Object} Available filters
   */
  async getAvailableFilters() {
    throw new Error('getAvailableFilters() must be implemented by subclass');
  }
  
  /**
   * Get cached brands
   * 
   * @returns {Array|null} Array of brands or null if not cached
   */
  getCachedBrands() {
    if (!this.cacheEnabled) {
      return null;
    }
    
    const now = Date.now();
    
    if (this.brandCache.size > 0 && 
        now - this.cacheTimestamps.brands < this.cacheTTL * 1000) {
      return Array.from(this.brandCache.values());
    }
    
    return null;
  }
  
  /**
   * Set brands in cache
   * 
   * @param {Array} brands Array of brand objects
   */
  cacheBrands(brands) {
    if (!this.cacheEnabled || !brands) {
      return;
    }
    
    this.brandCache.clear();
    
    brands.forEach(brand => {
      this.brandCache.set(brand.id, brand);
    });
    
    this.cacheTimestamps.brands = Date.now();
  }
  
  /**
   * Get cached products for a brand
   * 
   * @param {string} brandId Brand ID
   * @param {string} cacheKey Cache key (includes pagination and filter options)
   * @returns {Object|null} Products object or null if not cached
   */
  getCachedProducts(brandId, cacheKey) {
    if (!this.cacheEnabled) {
      return null;
    }
    
    const now = Date.now();
    
    if (!this.productCache.has(brandId)) {
      return null;
    }
    
    const brandCache = this.productCache.get(brandId);
    
    if (brandCache.has(cacheKey) && 
        now - this.cacheTimestamps.products[`${brandId}_${cacheKey}`] < this.cacheTTL * 1000) {
      return brandCache.get(cacheKey);
    }
    
    return null;
  }
  
  /**
   * Set products in cache
   * 
   * @param {string} brandId Brand ID
   * @param {string} cacheKey Cache key (includes pagination and filter options)
   * @param {Object} products Products object with array and total count
   */
  cacheProducts(brandId, cacheKey, products) {
    if (!this.cacheEnabled || !products) {
      return;
    }
    
    if (!this.productCache.has(brandId)) {
      this.productCache.set(brandId, new Map());
    }
    
    const brandCache = this.productCache.get(brandId);
    brandCache.set(cacheKey, products);
    
    this.cacheTimestamps.products[`${brandId}_${cacheKey}`] = Date.now();
  }
  
  /**
   * Get cached product details
   * 
   * @param {string} productId Product ID
   * @returns {Object|null} Product details or null if not cached
   */
  getCachedProductDetails(productId) {
    if (!this.cacheEnabled) {
      return null;
    }
    
    const now = Date.now();
    
    if (this.detailsCache.has(productId) && 
        now - this.cacheTimestamps.details[productId] < this.cacheTTL * 1000) {
      return this.detailsCache.get(productId);
    }
    
    return null;
  }
  
  /**
   * Set product details in cache
   * 
   * @param {string} productId Product ID
   * @param {Object} details Product details
   */
  cacheProductDetails(productId, details) {
    if (!this.cacheEnabled || !details) {
      return;
    }
    
    this.detailsCache.set(productId, details);
    this.cacheTimestamps.details[productId] = Date.now();
  }
  
  /**
   * Get cached available filters
   * 
   * @returns {Object|null} Available filters or null if not cached
   */
  getCachedFilters() {
    if (!this.cacheEnabled) {
      return null;
    }
    
    const now = Date.now();
    
    if (this.filtersCache && 
        now - this.cacheTimestamps.filters < this.cacheTTL * 1000) {
      return this.filtersCache;
    }
    
    return null;
  }
  
  /**
   * Set available filters in cache
   * 
   * @param {Object} filters Available filters
   */
  cacheFilters(filters) {
    if (!this.cacheEnabled || !filters) {
      return;
    }
    
    this.filtersCache = filters;
    this.cacheTimestamps.filters = Date.now();
  }
  
  /**
   * Clear cache
   * 
   * @param {string} type Cache type to clear (or all if not specified)
   */
  clearCache(type = null) {
    if (type === 'brands' || type === null) {
      this.brandCache.clear();
      this.cacheTimestamps.brands = 0;
    }
    
    if (type === 'products' || type === null) {
      this.productCache.clear();
      this.cacheTimestamps.products = {};
    }
    
    if (type === 'details' || type === null) {
      this.detailsCache.clear();
      this.cacheTimestamps.details = {};
    }
    
    if (type === 'filters' || type === null) {
      this.filtersCache = null;
      this.cacheTimestamps.filters = 0;
    }
  }
  
  /**
   * Check if integration is initialized
   * 
   * @returns {boolean} Is initialized
   */
  isInitialized() {
    return this.initialized;
  }
  
  /**
   * Generate cache key from options
   * 
   * @param {Object} options Options object
   * @returns {string} Cache key
   */
  generateCacheKey(options = {}) {
    const sortedKeys = Object.keys(options).sort();
    const keyParts = [];
    
    for (const key of sortedKeys) {
      let value = options[key];
      
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      }
      
      keyParts.push(`${key}:${value}`);
    }
    
    return keyParts.join('|');
  }
  
  /**
   * Log rate limit information
   * 
   * @param {Object} headers Response headers
   */
  logRateLimitInfo(headers) {
    if (!headers) {
      return;
    }
    
    const rateLimitLimit = headers['x-ratelimit-limit'];
    const rateLimitRemaining = headers['x-ratelimit-remaining'];
    const rateLimitReset = headers['x-ratelimit-reset'];
    
    if (rateLimitLimit && rateLimitRemaining) {
      const percent = Math.round((parseInt(rateLimitRemaining, 10) / parseInt(rateLimitLimit, 10)) * 100);
      
      if (percent < 20) {
        logger.warn(`API rate limit: ${rateLimitRemaining}/${rateLimitLimit} (${percent}%) remaining`);
      } else if (percent < 5) {
        logger.error(`API rate limit critical: ${rateLimitRemaining}/${rateLimitLimit} (${percent}%) remaining`);
      }
    }
  }
  
  /**
   * Normalize a product object for internal use
   * 
   * @param {Object} product Raw product object from API
   * @returns {Object} Normalized product
   */
  normalizeProduct(product) {
    // This is a base implementation that subclasses may override
    // for source-specific transformations
    return {
      id: product.id || '',
      title: product.title || product.name || '',
      description: product.description || '',
      brand: {
        id: product.brand?.id || product.brandId || '',
        name: product.brand?.name || product.brandName || ''
      },
      type: product.type || product.productType || 'eyewear',
      status: product.status || 'active',
      sku: product.sku || '',
      model: product.model || '',
      images: Array.isArray(product.images) ? product.images.map(img => ({
        id: img.id || '',
        src: img.src || img.url || '',
        position: img.position || 0,
        alt: img.alt || ''
      })) : [],
      variants: Array.isArray(product.variants) ? product.variants.map(variant => ({
        id: variant.id || '',
        title: variant.title || '',
        sku: variant.sku || '',
        price: variant.price || 0,
        compareAtPrice: variant.compareAtPrice || variant.compare_at_price || 0,
        option1: variant.option1 || '',
        option2: variant.option2 || '',
        option3: variant.option3 || '',
        inventoryQuantity: variant.inventoryQuantity || variant.inventory_quantity || 0
      })) : [],
      options: Array.isArray(product.options) ? product.options.map(option => ({
        name: option.name || '',
        values: Array.isArray(option.values) ? option.values : []
      })) : [],
      tags: Array.isArray(product.tags) ? product.tags : 
            (typeof product.tags === 'string' ? product.tags.split(',').map(t => t.trim()) : []),
      createdAt: product.createdAt || product.created_at || new Date().toISOString(),
      updatedAt: product.updatedAt || product.updated_at || new Date().toISOString()
    };
  }
}

module.exports = BaseIntegration;