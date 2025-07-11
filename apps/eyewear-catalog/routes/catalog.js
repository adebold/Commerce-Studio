/**
 * Catalog Routes
 * 
 * Routes for browsing and interacting with the eyewear catalog.
 * Provides endpoints for accessing brands, products, and search functionality.
 */

const express = require('express');
const router = express.Router();
const { eyewearService } = require('../services/eyewear-service');
const logger = require('../utils/logger');

// Middleware to ensure shop authentication
const ensureShop = (req, res, next) => {
  if (!req.session || !req.session.shop) {
    return res.status(403).json({
      error: true,
      message: 'Shop authentication required'
    });
  }
  
  req.shop = req.session.shop;
  next();
};

/**
 * GET /catalog/brands
 * Get all brands
 */
router.get('/brands', ensureShop, async (req, res) => {
  try {
    const brands = await eyewearService.getBrands(req.shop);
    
    res.json({
      success: true,
      brands
    });
  } catch (error) {
    logger.error(`Error getting brands: ${error.message}`, { error, shop: req.shop });
    
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});

/**
 * GET /catalog/brands/:brandId/products
 * Get products by brand
 */
router.get('/brands/:brandId/products', ensureShop, async (req, res) => {
  try {
    const brandId = req.params.brandId;
    
    const options = {
      page: parseInt(req.query.page, 10) || 1,
      limit: parseInt(req.query.limit, 10) || 50,
      productType: req.query.product_type,
      gender: req.query.gender,
      material: req.query.material,
      color: req.query.color,
      shape: req.query.shape,
      sort: req.query.sort
    };
    
    const result = await eyewearService.getProductsByBrand(req.shop, brandId, options);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error(`Error getting products for brand ${req.params.brandId}: ${error.message}`, { error, shop: req.shop });
    
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});

/**
 * GET /catalog/products/:productId
 * Get product details
 */
router.get('/products/:productId', ensureShop, async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await eyewearService.getProductDetails(req.shop, productId);
    
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
    logger.error(`Error getting product details for ${req.params.productId}: ${error.message}`, { error, shop: req.shop });
    
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});

/**
 * GET /catalog/products/sku/:sku
 * Get product by SKU
 */
router.get('/products/sku/:sku', ensureShop, async (req, res) => {
  try {
    const sku = req.params.sku;
    const product = await eyewearService.getProductBySku(req.shop, sku);
    
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
    logger.error(`Error getting product by SKU ${req.params.sku}: ${error.message}`, { error, shop: req.shop });
    
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});

/**
 * GET /catalog/search
 * Search products
 */
router.get('/search', ensureShop, async (req, res) => {
  try {
    const query = req.query.q || '';
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        error: true,
        message: 'Search query must be at least 2 characters'
      });
    }
    
    const options = {
      page: parseInt(req.query.page, 10) || 1,
      limit: parseInt(req.query.limit, 10) || 50,
      productType: req.query.product_type,
      brandId: req.query.brand_id,
      gender: req.query.gender,
      material: req.query.material,
      color: req.query.color,
      shape: req.query.shape,
      sort: req.query.sort
    };
    
    const result = await eyewearService.searchProducts(req.shop, query, options);
    
    res.json({
      success: true,
      query,
      ...result
    });
  } catch (error) {
    logger.error(`Error searching products with query "${req.query.q}": ${error.message}`, { error, shop: req.shop });
    
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});

/**
 * GET /catalog/filters
 * Get available filters
 */
router.get('/filters', ensureShop, async (req, res) => {
  try {
    const filters = await eyewearService.getAvailableFilters(req.shop);
    
    res.json({
      success: true,
      filters
    });
  } catch (error) {
    logger.error(`Error getting available filters: ${error.message}`, { error, shop: req.shop });
    
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});

/**
 * GET /catalog/recent
 * Get recently updated products
 */
router.get('/recent', ensureShop, async (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page, 10) || 1,
      limit: parseInt(req.query.limit, 10) || 50,
      since: req.query.since, // ISO date string
      productType: req.query.product_type,
      brandId: req.query.brand_id
    };
    
    const result = await eyewearService.getRecentlyUpdatedProducts(req.shop, options);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error(`Error getting recently updated products: ${error.message}`, { error, shop: req.shop });
    
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});

/**
 * POST /catalog/cache/clear
 * Clear cache
 */
router.post('/cache/clear', ensureShop, async (req, res) => {
  try {
    const type = req.body.type || null;
    await eyewearService.clearCache(req.shop, type);
    
    res.json({
      success: true,
      message: type ? `${type} cache cleared` : 'All caches cleared'
    });
  } catch (error) {
    logger.error(`Error clearing cache: ${error.message}`, { error, shop: req.shop });
    
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
});

module.exports = router;