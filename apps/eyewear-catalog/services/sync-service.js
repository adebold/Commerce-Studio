/**
 * Sync Service
 * 
 * Service for synchronizing data between eyewear database and Shopify stores.
 * Manages sync processes, tracks status, and handles scheduled sync jobs.
 */

const cron = require('node-cron');
const logger = require('../utils/logger');
const db = require('../utils/db');
const { eyewearService } = require('./eyewear-service');
const { shopifyService } = require('./shopify-service');

// Active sync jobs
const activeJobs = new Map();

// Scheduled jobs
const scheduledJobs = new Map();

class SyncService {
  constructor() {
    this.initialized = false;
  }
  
  /**
   * Initialize the sync service
   */
  async initialize() {
    try {
      // Skip if already initialized
      if (this.initialized) {
        return;
      }
      
      // Initialize scheduled jobs
      await this.initializeScheduledJobs();
      
      // Mark as initialized
      this.initialized = true;
      
      logger.info('Sync service initialized');
    } catch (error) {
      logger.error('Error initializing sync service:', error);
      throw error;
    }
  }
  
  /**
   * Initialize scheduled jobs from database
   */
  async initializeScheduledJobs() {
    try {
      // Get all shops with sync schedules enabled
      const shops = await db.getShopsWithSyncEnabled();
      
      // Schedule jobs for each shop
      for (const shop of shops) {
        await this.scheduleShopSync(shop);
      }
      
      logger.info(`Scheduled sync jobs for ${shops.length} shops`);
    } catch (error) {
      logger.error('Error initializing scheduled jobs:', error);
      throw error;
    }
  }
  
  /**
   * Schedule a sync job for a shop
   * 
   * @param {Object} shop Shop data
   * @returns {boolean} Success
   */
  async scheduleShopSync(shop) {
    try {
      // Skip if shop doesn't have sync settings
      if (!shop.settings?.syncSettings?.enabled) {
        return false;
      }
      
      const cronExpression = shop.settings.syncSettings.schedule?.cronExpression || '0 2 * * *'; // Default: 2 AM daily
      
      // Validate cron expression
      if (!cron.validate(cronExpression)) {
        logger.error(`Invalid cron expression for shop ${shop.domain}: ${cronExpression}`);
        return false;
      }
      
      // Cancel existing scheduled job if any
      this.cancelScheduledSync(shop.domain);
      
      // Schedule new job
      const job = cron.schedule(cronExpression, async () => {
        try {
          logger.info(`Running scheduled sync for shop ${shop.domain}`);
          
          // Check if sync is already running
          if (this.isShopSyncing(shop.domain)) {
            logger.warn(`Skipping scheduled sync for shop ${shop.domain} - sync already in progress`);
            return;
          }
          
          // Start sync
          await this.startFullSync(shop.domain, shop.accessToken, shop.settings.syncSettings.options || {});
        } catch (error) {
          logger.error(`Error running scheduled sync for shop ${shop.domain}:`, error);
        }
      });
      
      // Store job reference
      scheduledJobs.set(shop.domain, {
        job,
        cronExpression,
        createdAt: new Date()
      });
      
      logger.info(`Scheduled sync job for shop ${shop.domain} with cron: ${cronExpression}`);
      
      return true;
    } catch (error) {
      logger.error(`Error scheduling sync for shop ${shop.domain}:`, error);
      return false;
    }
  }
  
  /**
   * Cancel a scheduled sync job
   * 
   * @param {string} shop Shop domain
   * @returns {boolean} Success
   */
  cancelScheduledSync(shop) {
    try {
      // Get scheduled job
      const scheduledJob = scheduledJobs.get(shop);
      
      if (!scheduledJob) {
        return false;
      }
      
      // Stop job
      scheduledJob.job.stop();
      
      // Remove from scheduled jobs
      scheduledJobs.delete(shop);
      
      logger.info(`Cancelled scheduled sync job for shop ${shop}`);
      
      return true;
    } catch (error) {
      logger.error(`Error cancelling scheduled sync for shop ${shop}:`, error);
      return false;
    }
  }
  
  /**
   * Start a full sync process
   * 
   * @param {string} shop Shop domain
   * @param {string} accessToken Shop access token
   * @param {Object} options Sync options
   * @returns {Object} Job info
   */
  async startFullSync(shop, accessToken, options = {}) {
    try {
      // Check if sync is already running
      if (this.isShopSyncing(shop)) {
        throw new Error('A sync process is already running for this shop');
      }
      
      // Create job info
      const jobId = `sync-${shop}-${Date.now()}`;
      const jobInfo = {
        id: jobId,
        shop,
        status: 'initializing',
        startedAt: new Date(),
        updatedAt: new Date(),
        options,
        stats: {
          total: 0,
          processed: 0,
          imported: 0,
          updated: 0,
          skipped: 0,
          failed: 0
        },
        errors: []
      };
      
      // Save job info
      activeJobs.set(shop, jobInfo);
      
      // Record sync start in database
      await db.saveSyncJob(shop, jobInfo);
      
      // Start sync process in background
      this.runSyncProcess(shop, accessToken, options, jobInfo);
      
      return jobInfo;
    } catch (error) {
      logger.error(`Error starting sync for shop ${shop}:`, error);
      throw error;
    }
  }
  
  /**
   * Run sync process
   * 
   * @param {string} shop Shop domain
   * @param {string} accessToken Shop access token
   * @param {Object} options Sync options
   * @param {Object} jobInfo Job info
   */
  async runSyncProcess(shop, accessToken, options, jobInfo) {
    try {
      logger.info(`Starting sync process for shop ${shop}`);
      
      // Update job status
      jobInfo.status = 'in_progress';
      jobInfo.updatedAt = new Date();
      await this.updateJobInfo(shop, jobInfo);
      
      // Get sync settings
      const shopData = await db.getShopByDomain(shop);
      const syncSettings = options.settings || shopData?.settings?.syncSettings?.options || {};
      
      // Determine products to sync
      let brands = [];
      
      if (options.brandId) {
        // Sync specific brand
        brands = await eyewearService.getBrands(shop);
        brands = brands.filter(brand => brand.id === options.brandId);
      } else if (Array.isArray(options.brandIds) && options.brandIds.length > 0) {
        // Sync multiple brands
        brands = await eyewearService.getBrands(shop);
        brands = brands.filter(brand => options.brandIds.includes(brand.id));
      } else {
        // Sync all brands
        brands = await eyewearService.getBrands(shop);
      }
      
      if (brands.length === 0) {
        throw new Error('No brands to sync');
      }
      
      // Update job status with totals
      jobInfo.stats.totalBrands = brands.length;
      jobInfo.stats.processedBrands = 0;
      await this.updateJobInfo(shop, jobInfo);
      
      // Process each brand
      for (const brand of brands) {
        // Skip if job was cancelled
        if (jobInfo.status === 'cancelled') {
          logger.info(`Sync process cancelled for shop ${shop}`);
          return;
        }
        
        try {
          // Update job status
          jobInfo.currentBrand = brand.name;
          jobInfo.updatedAt = new Date();
          await this.updateJobInfo(shop, jobInfo);
          
          // Process brand
          await this.syncBrand(shop, accessToken, brand, syncSettings, jobInfo);
          
          // Update processed brands count
          jobInfo.stats.processedBrands++;
          await this.updateJobInfo(shop, jobInfo);
        } catch (brandError) {
          // Record error and continue
          logger.error(`Error syncing brand ${brand.name} for shop ${shop}:`, brandError);
          
          jobInfo.errors.push({
            type: 'brand',
            brandId: brand.id,
            brandName: brand.name,
            message: brandError.message,
            timestamp: new Date()
          });
          
          // Update processed brands count
          jobInfo.stats.processedBrands++;
          jobInfo.stats.failedBrands = (jobInfo.stats.failedBrands || 0) + 1;
          await this.updateJobInfo(shop, jobInfo);
        }
      }
      
      // Complete sync process
      jobInfo.status = 'completed';
      jobInfo.completedAt = new Date();
      jobInfo.updatedAt = new Date();
      jobInfo.duration = jobInfo.completedAt - jobInfo.startedAt;
      
      await this.updateJobInfo(shop, jobInfo);
      
      logger.info(`Sync process completed for shop ${shop}`);
      
      // Record sync completion in database
      await db.updateSyncJob(shop, jobInfo);
      
      // Remove from active jobs
      activeJobs.delete(shop);
    } catch (error) {
      logger.error(`Error in sync process for shop ${shop}:`, error);
      
      // Update job status
      jobInfo.status = 'error';
      jobInfo.error = {
        message: error.message,
        stack: error.stack
      };
      jobInfo.updatedAt = new Date();
      
      await this.updateJobInfo(shop, jobInfo);
      
      // Record sync error in database
      await db.updateSyncJob(shop, jobInfo);
      
      // Remove from active jobs
      activeJobs.delete(shop);
    }
  }
  
  /**
   * Sync a brand
   * 
   * @param {string} shop Shop domain
   * @param {string} accessToken Shop access token
   * @param {Object} brand Brand to sync
   * @param {Object} syncSettings Sync settings
   * @param {Object} jobInfo Job info
   */
  async syncBrand(shop, accessToken, brand, syncSettings, jobInfo) {
    try {
      logger.info(`Syncing brand ${brand.name} for shop ${shop}`);
      
      let page = 1;
      const limit = 50;
      let hasMore = true;
      
      // Get product type option
      const productType = syncSettings.productType || null;
      
      while (hasMore) {
        // Skip if job was cancelled
        if (jobInfo.status === 'cancelled') {
          return;
        }
        
        // Update job status
        jobInfo.currentPage = page;
        jobInfo.updatedAt = new Date();
        await this.updateJobInfo(shop, jobInfo);
        
        // Get products for brand
        const response = await eyewearService.getProductsByBrand(shop, brand.id, {
          page,
          limit,
          productType
        });
        
        const products = response.products || [];
        
        // Update job total
        if (page === 1) {
          jobInfo.stats.total += response.total || products.length;
          await this.updateJobInfo(shop, jobInfo);
        }
        
        // Process each product
        for (const product of products) {
          // Skip if job was cancelled
          if (jobInfo.status === 'cancelled') {
            return;
          }
          
          try {
            // Update job status
            jobInfo.currentProduct = {
              id: product.id,
              title: product.title
            };
            jobInfo.updatedAt = new Date();
            await this.updateJobInfo(shop, jobInfo);
            
            // Get complete product details
            const productDetails = await eyewearService.getProductDetails(shop, product.id);
            
            // Sync product
            const syncResult = await this.syncProduct(shop, accessToken, productDetails, syncSettings);
            
            // Update job stats
            jobInfo.stats.processed++;
            
            if (syncResult.action === 'imported') {
              jobInfo.stats.imported++;
            } else if (syncResult.action === 'updated') {
              jobInfo.stats.updated++;
            } else if (syncResult.action === 'skipped') {
              jobInfo.stats.skipped++;
            }
            
            await this.updateJobInfo(shop, jobInfo);
          } catch (productError) {
            // Record error and continue
            logger.error(`Error syncing product ${product.id} for shop ${shop}:`, productError);
            
            jobInfo.errors.push({
              type: 'product',
              productId: product.id,
              productTitle: product.title,
              message: productError.message,
              timestamp: new Date()
            });
            
            // Update job stats
            jobInfo.stats.processed++;
            jobInfo.stats.failed++;
            await this.updateJobInfo(shop, jobInfo);
          }
        }
        
        // Check if there are more pages
        hasMore = products.length === limit && (!response.pagination || response.pagination.current_page < response.pagination.total_pages);
        
        // Move to next page
        page++;
      }
      
      return true;
    } catch (error) {
      logger.error(`Error syncing brand ${brand.name} for shop ${shop}:`, error);
      throw error;
    }
  }
  
  /**
   * Sync a product
   * 
   * @param {string} shop Shop domain
   * @param {string} accessToken Shop access token
   * @param {Object} product Product to sync
   * @param {Object} syncSettings Sync settings
   * @returns {Object} Sync result
   */
  async syncProduct(shop, accessToken, product, syncSettings = {}) {
    try {
      // Check if product is already imported
      const importedProduct = await db.getImportedProductBySourceId(shop, product.id);
      
      // Apply sync settings
      const importOptions = {
        includeDescription: syncSettings.includeDescription !== false,
        includeTags: syncSettings.includeTags !== false,
        includeImages: syncSettings.includeImages !== false,
        prefixTitle: syncSettings.prefixTitle === true,
        prefixSku: syncSettings.prefixSku === true,
        createVariants: syncSettings.createVariants !== false,
        status: syncSettings.productStatus || 'active',
        publishedScope: syncSettings.publishedScope || 'web',
        skipExisting: syncSettings.skipExisting === true
      };
      
      if (importedProduct) {
        // Product already exists in Shopify
        
        // Skip if configured to skip existing
        if (importOptions.skipExisting) {
          return {
            action: 'skipped',
            reason: 'product_exists',
            sourceId: product.id,
            shopifyId: importedProduct.shopifyProductId
          };
        }
        
        // Check if product still exists in Shopify
        const shopifyProduct = await shopifyService.getProduct(accessToken, shop, importedProduct.shopifyProductId);
        
        if (!shopifyProduct) {
          // Product was deleted in Shopify, re-import
          const newShopifyProduct = await shopifyService.importProduct(accessToken, shop, product, importOptions);
          
          // Update import record
          await db.saveImportedProduct(
            shop,
            product.id,
            newShopifyProduct.id.toString(),
            'reimported',
            {
              previousShopifyId: importedProduct.shopifyProductId,
              importTimestamp: new Date().toISOString(),
              options: importOptions
            }
          );
          
          return {
            action: 'reimported',
            sourceId: product.id,
            shopifyId: newShopifyProduct.id.toString(),
            previousShopifyId: importedProduct.shopifyProductId
          };
        }
        
        // Format product data for update
        const productData = shopifyService.formatProductDataForShopify(product, importOptions);
        
        // Update product in Shopify
        const updatedProduct = await shopifyService.updateProduct(accessToken, shop, importedProduct.shopifyProductId, productData);
        
        // Update import record
        await db.saveImportedProduct(
          shop,
          product.id,
          updatedProduct.id.toString(),
          'updated',
          {
            updateTimestamp: new Date().toISOString(),
            options: importOptions
          }
        );
        
        return {
          action: 'updated',
          sourceId: product.id,
          shopifyId: updatedProduct.id.toString()
        };
      } else {
        // Product doesn't exist in Shopify, import it
        const shopifyProduct = await shopifyService.importProduct(accessToken, shop, product, importOptions);
        
        return {
          action: 'imported',
          sourceId: product.id,
          shopifyId: shopifyProduct.id.toString()
        };
      }
    } catch (error) {
      logger.error(`Error syncing product ${product.id} for shop ${shop}:`, error);
      
      // Record import error
      try {
        await db.saveImportedProduct(
          shop,
          product.id,
          null,
          'error',
          {
            importTimestamp: new Date().toISOString()
          },
          {
            message: error.message,
            stack: error.stack
          }
        );
      } catch (dbError) {
        logger.error(`Error saving import error for product ${product.id}:`, dbError);
      }
      
      throw error;
    }
  }
  
  /**
   * Update job info
   * 
   * @param {string} shop Shop domain
   * @param {Object} jobInfo Job info
   */
  async updateJobInfo(shop, jobInfo) {
    try {
      // Update active job
      activeJobs.set(shop, { ...jobInfo });
      
      // Update in database
      await db.updateSyncJob(shop, jobInfo);
    } catch (error) {
      logger.error(`Error updating job info for shop ${shop}:`, error);
    }
  }
  
  /**
   * Cancel a sync job
   * 
   * @param {string} shop Shop domain
   * @returns {boolean} Success
   */
  cancelSync(shop) {
    try {
      // Get active job
      const jobInfo = activeJobs.get(shop);
      
      if (!jobInfo) {
        return false;
      }
      
      // Update job status
      jobInfo.status = 'cancelled';
      jobInfo.updatedAt = new Date();
      
      // Save job info
      activeJobs.set(shop, jobInfo);
      
      // Record cancellation in database
      db.updateSyncJob(shop, jobInfo).catch(error => {
        logger.error(`Error updating sync job for shop ${shop}:`, error);
      });
      
      logger.info(`Cancelled sync job for shop ${shop}`);
      
      return true;
    } catch (error) {
      logger.error(`Error cancelling sync for shop ${shop}:`, error);
      return false;
    }
  }
  
  /**
   * Check if shop is currently syncing
   * 
   * @param {string} shop Shop domain
   * @returns {boolean} Is syncing
   */
  isShopSyncing(shop) {
    const jobInfo = activeJobs.get(shop);
    
    return !!(jobInfo && ['initializing', 'in_progress'].includes(jobInfo.status));
  }
  
  /**
   * Get sync status for shop
   * 
   * @param {string} shop Shop domain
   * @returns {Object} Sync status
   */
  getSyncStatus(shop) {
    return activeJobs.get(shop) || null;
  }
  
  /**
   * Save sync settings for shop
   * 
   * @param {string} shop Shop domain
   * @param {Object} settings Sync settings
   * @returns {boolean} Success
   */
  async saveSyncSettings(shop, settings) {
    try {
      // Get shop data
      const shopData = await db.getShopByDomain(shop);
      
      if (!shopData) {
        throw new Error('Shop not found');
      }
      
      // Update settings
      shopData.settings = shopData.settings || {};
      shopData.settings.syncSettings = settings;
      
      // Save to database
      await db.saveShop(shopData);
      
      // Update scheduled job if needed
      if (settings.enabled) {
        await this.scheduleShopSync(shopData);
      } else {
        this.cancelScheduledSync(shop);
      }
      
      return true;
    } catch (error) {
      logger.error(`Error saving sync settings for shop ${shop}:`, error);
      throw error;
    }
  }
}

// Create singleton instance
const syncService = new SyncService();

module.exports = { syncService };