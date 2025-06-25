/**
 * Shopify Service
 * 
 * Service for interacting with the Shopify API.
 * Handles authentication, product management, and webhook registration.
 */

const { Shopify } = require('@shopify/shopify-api');
const logger = require('../utils/logger');
const db = require('../utils/db');

class ShopifyService {
  constructor() {
    this.apiVersion = process.env.SHOPIFY_API_VERSION || '2023-07';
  }
  
  /**
   * Initialize Shopify client
   * 
   * @param {string} accessToken Shop access token
   * @param {string} shop Shop domain
   * @returns {Object} Shopify client
   */
  getClient(accessToken, shop) {
    return new Shopify.Clients.Rest(shop, accessToken, {
      apiVersion: this.apiVersion
    });
  }
  
  /**
   * Get shop data from Shopify
   * 
   * @param {string} accessToken Shop access token
   * @param {string} shop Shop domain
   * @returns {Object} Shop data
   */
  async getShopData(accessToken, shop) {
    try {
      const client = this.getClient(accessToken, shop);
      
      const response = await client.get({
        path: 'shop'
      });
      
      return response.body.shop;
    } catch (error) {
      logger.error(`Error getting shop data for ${shop}:`, error);
      throw error;
    }
  }
  
  /**
   * Save shop data to database
   * 
   * @param {string} accessToken Shop access token
   * @param {string} shop Shop domain
   * @param {Object} shopData Shop data
   * @returns {Object} Saved shop data
   */
  async saveShopData(accessToken, shop, shopData) {
    try {
      const shopRecord = {
        domain: shop,
        accessToken,
        shopData,
        settings: {},
        uninstalledAt: null,
        updatedAt: new Date()
      };
      
      // Save to database
      return await db.saveShop(shopRecord);
    } catch (error) {
      logger.error(`Error saving shop data for ${shop}:`, error);
      throw error;
    }
  }
  
  /**
   * Register webhooks for a shop
   * 
   * @param {string} accessToken Shop access token
   * @param {string} shop Shop domain
   * @returns {boolean} Success
   */
  async registerWebhooks(accessToken, shop) {
    try {
      const client = this.getClient(accessToken, shop);
      const webhooks = [
        {
          address: `${process.env.SHOPIFY_APP_HOST}/webhooks/app/uninstalled`,
          topic: 'app/uninstalled',
          format: 'json'
        },
        {
          address: `${process.env.SHOPIFY_APP_HOST}/webhooks/products/create`,
          topic: 'products/create',
          format: 'json'
        },
        {
          address: `${process.env.SHOPIFY_APP_HOST}/webhooks/products/update`,
          topic: 'products/update',
          format: 'json'
        },
        {
          address: `${process.env.SHOPIFY_APP_HOST}/webhooks/products/delete`,
          topic: 'products/delete',
          format: 'json'
        }
      ];
      
      // Register each webhook
      for (const webhook of webhooks) {
        try {
          await client.post({
            path: 'webhooks',
            data: { webhook }
          });
          
          logger.info(`Registered webhook ${webhook.topic} for shop ${shop}`);
        } catch (webhookError) {
          logger.error(`Failed to register webhook ${webhook.topic} for shop ${shop}:`, webhookError);
        }
      }
      
      return true;
    } catch (error) {
      logger.error(`Error registering webhooks for shop ${shop}:`, error);
      throw error;
    }
  }
  
  /**
   * Get products from Shopify
   * 
   * @param {string} accessToken Shop access token
   * @param {string} shop Shop domain
   * @param {Object} options Request options
   * @returns {Object} Products with pagination
   */
  async getProducts(accessToken, shop, options = {}) {
    try {
      const client = this.getClient(accessToken, shop);
      
      // Build query parameters
      const params = {
        limit: options.limit || 50,
        fields: options.fields || 'id,title,handle,variants,images,product_type,vendor,created_at,updated_at,status'
      };
      
      if (options.pageInfo) {
        params.page_info = options.pageInfo;
      }
      
      if (options.ids) {
        params.ids = options.ids.join(',');
      }
      
      if (options.collectionId) {
        params.collection_id = options.collectionId;
      }
      
      if (options.productType) {
        params.product_type = options.productType;
      }
      
      if (options.vendor) {
        params.vendor = options.vendor;
      }
      
      if (options.status) {
        params.status = options.status;
      }
      
      if (options.createdAtMin) {
        params.created_at_min = options.createdAtMin;
      }
      
      if (options.createdAtMax) {
        params.created_at_max = options.createdAtMax;
      }
      
      if (options.updatedAtMin) {
        params.updated_at_min = options.updatedAtMin;
      }
      
      if (options.updatedAtMax) {
        params.updated_at_max = options.updatedAtMax;
      }
      
      // Make API request
      const response = await client.get({
        path: 'products',
        query: params
      });
      
      // Get pagination headers
      const link = response.headers.get('Link');
      const pageInfo = this.parseLinkHeader(link);
      
      return {
        products: response.body.products,
        pageInfo
      };
    } catch (error) {
      logger.error(`Error getting products for shop ${shop}:`, error);
      throw error;
    }
  }
  
  /**
   * Get a specific product from Shopify
   * 
   * @param {string} accessToken Shop access token
   * @param {string} shop Shop domain
   * @param {string} productId Product ID
   * @returns {Object} Product details
   */
  async getProduct(accessToken, shop, productId) {
    try {
      const client = this.getClient(accessToken, shop);
      
      // Make API request
      const response = await client.get({
        path: `products/${productId}`
      });
      
      return response.body.product;
    } catch (error) {
      // If product not found, return null
      if (error.statusCode === 404) {
        return null;
      }
      
      logger.error(`Error getting product ${productId} for shop ${shop}:`, error);
      throw error;
    }
  }
  
  /**
   * Get collections from Shopify
   * 
   * @param {string} accessToken Shop access token
   * @param {string} shop Shop domain
   * @param {Object} options Request options
   * @returns {Object} Collections with pagination
   */
  async getCollections(accessToken, shop, options = {}) {
    try {
      const client = this.getClient(accessToken, shop);
      
      // Build query parameters
      const params = {
        limit: options.limit || 250,
        fields: options.fields || 'id,title,handle,updated_at,published_at'
      };
      
      if (options.pageInfo) {
        params.page_info = options.pageInfo;
      }
      
      if (options.ids) {
        params.ids = options.ids.join(',');
      }
      
      // Make API request
      const response = await client.get({
        path: 'custom_collections',
        query: params
      });
      
      // Get pagination headers
      const link = response.headers.get('Link');
      const pageInfo = this.parseLinkHeader(link);
      
      return {
        collections: response.body.custom_collections,
        pageInfo
      };
    } catch (error) {
      logger.error(`Error getting collections for shop ${shop}:`, error);
      throw error;
    }
  }
  
  /**
   * Get products in a collection
   * 
   * @param {string} accessToken Shop access token
   * @param {string} shop Shop domain
   * @param {string} collectionId Collection ID
   * @param {Object} options Request options
   * @returns {Object} Products with pagination
   */
  async getProductsByCollection(accessToken, shop, collectionId, options = {}) {
    try {
      // Use the products endpoint with collection_id filter
      return await this.getProducts(accessToken, shop, {
        ...options,
        collectionId
      });
    } catch (error) {
      logger.error(`Error getting products for collection ${collectionId} for shop ${shop}:`, error);
      throw error;
    }
  }
  
  /**
   * Search products in Shopify
   * 
   * @param {string} accessToken Shop access token
   * @param {string} shop Shop domain
   * @param {Object} options Search options
   * @returns {Object} Search results with pagination
   */
  async searchProducts(accessToken, shop, options = {}) {
    try {
      const client = this.getClient(accessToken, shop);
      
      // Build query parameters
      const params = {
        limit: options.limit || 50,
        fields: options.fields || 'id,title,handle,variants,images,product_type,vendor'
      };
      
      // Build query string
      let query = '';
      
      if (options.query) {
        query = options.query;
      } else {
        // Build structured query
        const queryParts = [];
        
        if (options.title) {
          queryParts.push(`title:${options.title}`);
        }
        
        if (options.sku) {
          queryParts.push(`sku:${options.sku}`);
        }
        
        if (options.vendor) {
          queryParts.push(`vendor:${options.vendor}`);
        }
        
        if (options.productType) {
          queryParts.push(`product_type:${options.productType}`);
        }
        
        if (options.tag) {
          queryParts.push(`tag:${options.tag}`);
        }
        
        query = queryParts.join(' AND ');
      }
      
      params.query = query;
      
      if (options.pageInfo) {
        params.page_info = options.pageInfo;
      }
      
      // Make API request
      const response = await client.get({
        path: 'products',
        query: params
      });
      
      // Get pagination headers
      const link = response.headers.get('Link');
      const pageInfo = this.parseLinkHeader(link);
      
      return {
        products: response.body.products,
        pageInfo
      };
    } catch (error) {
      logger.error(`Error searching products for shop ${shop}:`, error);
      throw error;
    }
  }
  
  /**
   * Import a product from eyewear database to Shopify
   * 
   * @param {string} accessToken Shop access token
   * @param {string} shop Shop domain
   * @param {Object} sourceProduct Source product data
   * @param {Object} options Import options
   * @returns {Object} Imported product
   */
  async importProduct(accessToken, shop, sourceProduct, options = {}) {
    try {
      const client = this.getClient(accessToken, shop);
      
      // Format product data for Shopify
      const productData = this.formatProductDataForShopify(sourceProduct, options);
      
      // Create product in Shopify
      const response = await client.post({
        path: 'products',
        data: { product: productData }
      });
      
      const createdProduct = response.body.product;
      
      // If product was created successfully, save the import record
      if (createdProduct && createdProduct.id) {
        await db.saveImportedProduct(
          shop,
          sourceProduct.id,
          createdProduct.id.toString(),
          'imported',
          {
            importTimestamp: new Date().toISOString(),
            options
          }
        );
      }
      
      return createdProduct;
    } catch (error) {
      logger.error(`Error importing product ${sourceProduct.id} for shop ${shop}:`, error);
      
      // Record import error
      try {
        await db.saveImportedProduct(
          shop,
          sourceProduct.id,
          null,
          'error',
          {
            importTimestamp: new Date().toISOString(),
            options
          },
          {
            message: error.message,
            stack: error.stack
          }
        );
      } catch (dbError) {
        logger.error(`Error saving import error for product ${sourceProduct.id}:`, dbError);
      }
      
      throw error;
    }
  }
  
  /**
   * Update a product in Shopify
   * 
   * @param {string} accessToken Shop access token
   * @param {string} shop Shop domain
   * @param {string} productId Shopify product ID
   * @param {Object} productData Product data
   * @returns {Object} Updated product
   */
  async updateProduct(accessToken, shop, productId, productData) {
    try {
      const client = this.getClient(accessToken, shop);
      
      // Update product in Shopify
      const response = await client.put({
        path: `products/${productId}`,
        data: { product: productData }
      });
      
      return response.body.product;
    } catch (error) {
      logger.error(`Error updating product ${productId} for shop ${shop}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a product from Shopify
   * 
   * @param {string} accessToken Shop access token
   * @param {string} shop Shop domain
   * @param {string} productId Shopify product ID
   * @returns {boolean} Success
   */
  async deleteProduct(accessToken, shop, productId) {
    try {
      const client = this.getClient(accessToken, shop);
      
      // Delete product from Shopify
      await client.delete({
        path: `products/${productId}`
      });
      
      return true;
    } catch (error) {
      logger.error(`Error deleting product ${productId} for shop ${shop}:`, error);
      throw error;
    }
  }
  
  /**
   * Format product data for Shopify
   * 
   * @param {Object} sourceProduct Source product data
   * @param {Object} options Formatting options
   * @returns {Object} Formatted product data
   */
  formatProductDataForShopify(sourceProduct, options = {}) {
    // Default options
    const defaultOptions = {
      includeDescription: true,
      includeTags: true,
      includeImages: true,
      prefixTitle: false,
      prefixSku: false,
      createVariants: true,
      status: 'active',
      publishedScope: 'web'
    };
    
    // Merge options
    const formatOptions = { ...defaultOptions, ...options };
    
    // Format basic product data
    const productData = {
      title: formatOptions.prefixTitle ? `${sourceProduct.brand?.name} ${sourceProduct.title}` : sourceProduct.title,
      body_html: formatOptions.includeDescription ? this.formatProductDescription(sourceProduct) : '',
      vendor: sourceProduct.brand?.name || sourceProduct.vendor || 'Unknown',
      product_type: sourceProduct.productType || sourceProduct.type || 'Eyewear',
      status: formatOptions.status,
      published_scope: formatOptions.publishedScope
    };
    
    // Add tags
    if (formatOptions.includeTags) {
      productData.tags = this.formatProductTags(sourceProduct);
    }
    
    // Add images
    if (formatOptions.includeImages && sourceProduct.images && sourceProduct.images.length > 0) {
      productData.images = sourceProduct.images.map(image => ({
        src: image.src || image.url,
        alt: image.alt || `${sourceProduct.title} - ${image.position || 'Image'}`
      }));
    }
    
    // Add variants
    productData.variants = this.formatProductVariants(sourceProduct, formatOptions);
    
    // Add options if we have variants
    if (productData.variants.length > 1 && sourceProduct.options) {
      productData.options = sourceProduct.options.map(option => ({
        name: option.name,
        values: option.values.map(value => value.value || value)
      }));
    }
    
    // Add metafields for source tracking
    productData.metafields = [
      {
        namespace: 'eyewear_db',
        key: 'process.env.SHOPIFY_SERVICE_SECRET',
        value: sourceProduct.id,
        type: 'single_line_text_field'
      },
      {
        namespace: 'eyewear_db',
        key: 'process.env.SHOPIFY_SERVICE_SECRET_1',
        value: sourceProduct.brandId || sourceProduct.brand?.id || '',
        type: 'single_line_text_field'
      },
      {
        namespace: 'eyewear_db',
        key: 'process.env.SHOPIFY_SERVICE_SECRET_2',
        value: new Date().toISOString(),
        type: 'single_line_text_field'
      }
    ];
    
    return productData;
  }
  
  /**
   * Format product description
   * 
   * @param {Object} product Product data
   * @returns {string} Formatted HTML description
   */
  formatProductDescription(product) {
    let description = product.description || '';
    
    // Add specifications as a table if available
    if (product.specifications && Object.keys(product.specifications).length > 0) {
      description += '<h3>Specifications</h3><table>';
      
      for (const [key, value] of Object.entries(product.specifications)) {
        if (value) {
          const formattedKey = key.replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
          
          description += `<tr><th>${formattedKey}</th><td>${value}</td></tr>`;
        }
      }
      
      description += '</table>';
    }
    
    // Add features if available
    if (product.features && product.features.length > 0) {
      description += '<h3>Features</h3><ul>';
      
      for (const feature of product.features) {
        description += `<li>${feature}</li>`;
      }
      
      description += '</ul>';
    }
    
    return description;
  }
  
  /**
   * Format product tags
   * 
   * @param {Object} product Product data
   * @returns {string} Comma-separated tags
   */
  formatProductTags(product) {
    const tags = [];
    
    // Add brand
    if (product.brand?.name) {
      tags.push(product.brand.name);
    }
    
    // Add product type
    if (product.productType || product.type) {
      tags.push(product.productType || product.type);
    }
    
    // Add gender
    if (product.gender || product.specifications?.gender) {
      const gender = product.gender || product.specifications?.gender;
      tags.push(gender);
    }
    
    // Add material
    if (product.material || product.specifications?.material) {
      const material = product.material || product.specifications?.material;
      tags.push(material);
    }
    
    // Add shape
    if (product.shape || product.specifications?.shape) {
      const shape = product.shape || product.specifications?.shape;
      tags.push(shape);
    }
    
    // Add color
    if (product.color || product.specifications?.color) {
      const color = product.color || product.specifications?.color;
      tags.push(color);
    }
    
    // Add custom tags
    if (product.tags && product.tags.length > 0) {
      tags.push(...product.tags);
    }
    
    // Return unique tags
    return [...new Set(tags)].join(', ');
  }
  
  /**
   * Format product variants
   * 
   * @param {Object} product Product data
   * @param {Object} options Formatting options
   * @returns {Array} Formatted variants
   */
  formatProductVariants(product, options = {}) {
    // If product has variants, format them
    if (product.variants && product.variants.length > 0 && options.createVariants) {
      return product.variants.map(variant => ({
        sku: options.prefixSku ? `${product.brand?.name.replace(/\s+/g, '')}-${variant.sku}` : variant.sku,
        barcode: variant.barcode || variant.upc || '',
        price: variant.price || product.price || 0,
        compare_at_price: variant.compareAtPrice || variant.compare_at_price || null,
        option1: variant.option1 || null,
        option2: variant.option2 || null,
        option3: variant.option3 || null,
        inventory_management: 'shopify',
        inventory_quantity: variant.inventoryQuantity || variant.inventory_quantity || 0,
        inventory_policy: 'deny',
        fulfillment_service: 'manual',
        weight: variant.weight || 0,
        weight_unit: variant.weightUnit || variant.weight_unit || 'g'
      }));
    } else {
      // Create a single variant
      return [{
        sku: options.prefixSku ? `${product.brand?.name.replace(/\s+/g, '')}-${product.sku}` : product.sku,
        barcode: product.barcode || product.upc || '',
        price: product.price || 0,
        compare_at_price: product.compareAtPrice || product.compare_at_price || null,
        inventory_management: 'shopify',
        inventory_quantity: product.inventoryQuantity || product.inventory_quantity || 0,
        inventory_policy: 'deny',
        fulfillment_service: 'manual',
        weight: product.weight || 0,
        weight_unit: product.weightUnit || product.weight_unit || 'g'
      }];
    }
  }
  
  /**
   * Parse Link header for pagination
   * 
   * @param {string} linkHeader Link header
   * @returns {Object} Pagination info
   */
  parseLinkHeader(linkHeader) {
    if (!linkHeader) {
      return {};
    }
    
    // Parse link header
    const links = linkHeader.split(',');
    const pageInfo = {};
    
    for (const link of links) {
      const [url, rel] = link.split(';');
      const relMatch = rel.match(/rel="(.+)"/);
      
      if (relMatch) {
        const relType = relMatch[1];
        const urlMatch = url.match(/page_info=([^&>]+)/);
        
        if (urlMatch) {
          pageInfo[relType] = urlMatch[1];
        }
      }
    }
    
    return pageInfo;
  }
}

// Create singleton instance
const shopifyService = new ShopifyService();

module.exports = { shopifyService };