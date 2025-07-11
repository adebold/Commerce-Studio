/**
 * Database Utilities
 * 
 * Provides database access methods for the eyewear catalog application.
 * Abstracts MongoDB operations and provides consistent error handling.
 */

const mongoose = require('mongoose');
const logger = require('./logger');

// Define schemas
const ShopSchema = new mongoose.Schema({
  domain: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  accessToken: { 
    type: String, 
    required: true 
  },
  shopData: { 
    type: mongoose.Schema.Types.Mixed 
  },
  settings: { 
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  uninstalledAt: { 
    type: Date, 
    default: null 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

const ImportedProductSchema = new mongoose.Schema({
  shop: { 
    type: String, 
    required: true,
    trim: true,
    lowercase: true
  },
  sourceProductId: { 
    type: String, 
    required: true 
  },
  shopifyProductId: { 
    type: String, 
    default: null 
  },
  status: { 
    type: String, 
    enum: ['imported', 'updated', 'error', 'reimported', 'deleted'],
    default: 'imported' 
  },
  metadata: { 
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  error: { 
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Add indexes
ImportedProductSchema.index({ shop: 1, sourceProductId: 1 }, { unique: true });
ImportedProductSchema.index({ shop: 1, shopifyProductId: 1 });
ImportedProductSchema.index({ shop: 1, status: 1 });
ImportedProductSchema.index({ updatedAt: -1 });

const SyncJobSchema = new mongoose.Schema({
  jobId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  shop: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['initializing', 'in_progress', 'completed', 'cancelled', 'error'],
    default: 'initializing' 
  },
  startedAt: { 
    type: Date, 
    default: Date.now 
  },
  completedAt: { 
    type: Date, 
    default: null 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  options: { 
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  stats: { 
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  errors: [{ 
    type: mongoose.Schema.Types.Mixed 
  }],
  error: { 
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
});

// Add indexes
SyncJobSchema.index({ shop: 1, startedAt: -1 });
SyncJobSchema.index({ status: 1 });

// Create models
const Shop = mongoose.model('Shop', ShopSchema);
const ImportedProduct = mongoose.model('ImportedProduct', ImportedProductSchema);
const SyncJob = mongoose.model('SyncJob', SyncJobSchema);

/**
 * Save shop data to database
 * 
 * @param {Object} shopData Shop data to save
 * @returns {Object} Saved shop data
 */
async function saveShop(shopData) {
  try {
    // Add timestamp
    shopData.updatedAt = new Date();
    
    // Find or create
    const shop = await Shop.findOneAndUpdate(
      { domain: shopData.domain },
      shopData,
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );
    
    return shop.toObject();
  } catch (error) {
    logger.error(`Error saving shop data for ${shopData.domain}:`, error);
    throw error;
  }
}

/**
 * Get shop by domain
 * 
 * @param {string} domain Shop domain
 * @returns {Object} Shop data
 */
async function getShopByDomain(domain) {
  try {
    const shop = await Shop.findOne({ domain });
    
    if (!shop) {
      return null;
    }
    
    return shop.toObject();
  } catch (error) {
    logger.error(`Error getting shop data for ${domain}:`, error);
    throw error;
  }
}

/**
 * Get shops with sync enabled
 * 
 * @returns {Array} Shop data
 */
async function getShopsWithSyncEnabled() {
  try {
    const shops = await Shop.find({
      'settings.syncSettings.enabled': true,
      uninstalledAt: null
    });
    
    return shops.map(shop => shop.toObject());
  } catch (error) {
    logger.error('Error getting shops with sync enabled:', error);
    throw error;
  }
}

/**
 * Delete shop
 * 
 * @param {string} domain Shop domain
 * @returns {boolean} Success
 */
async function deleteShop(domain) {
  try {
    await Shop.deleteOne({ domain });
    
    return true;
  } catch (error) {
    logger.error(`Error deleting shop ${domain}:`, error);
    throw error;
  }
}

/**
 * Save imported product record
 * 
 * @param {string} shop Shop domain
 * @param {string} sourceProductId Source product ID
 * @param {string} shopifyProductId Shopify product ID
 * @param {string} status Status
 * @param {Object} metadata Metadata
 * @param {Object} error Error details
 * @returns {Object} Saved import data
 */
async function saveImportedProduct(shop, sourceProductId, shopifyProductId, status, metadata = {}, error = null) {
  try {
    // Add timestamp
    const now = new Date();
    
    // Find and update
    const importedProduct = await ImportedProduct.findOneAndUpdate(
      { shop, sourceProductId },
      {
        shopifyProductId,
        status,
        metadata,
        error,
        updatedAt: now
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );
    
    return importedProduct.toObject();
  } catch (error) {
    logger.error(`Error saving imported product for shop ${shop}, product ${sourceProductId}:`, error);
    throw error;
  }
}

/**
 * Get imported product by source ID
 * 
 * @param {string} shop Shop domain
 * @param {string} sourceProductId Source product ID
 * @returns {Object} Imported product data
 */
async function getImportedProductBySourceId(shop, sourceProductId) {
  try {
    const importedProduct = await ImportedProduct.findOne({
      shop,
      sourceProductId
    });
    
    if (!importedProduct) {
      return null;
    }
    
    return importedProduct.toObject();
  } catch (error) {
    logger.error(`Error getting imported product by source ID for shop ${shop}, product ${sourceProductId}:`, error);
    throw error;
  }
}

/**
 * Get imported product by Shopify ID
 * 
 * @param {string} shop Shop domain
 * @param {string} shopifyProductId Shopify product ID
 * @returns {Object} Imported product data
 */
async function getImportedProductByShopifyId(shop, shopifyProductId) {
  try {
    const importedProduct = await ImportedProduct.findOne({
      shop,
      shopifyProductId
    });
    
    if (!importedProduct) {
      return null;
    }
    
    return importedProduct.toObject();
  } catch (error) {
    logger.error(`Error getting imported product by Shopify ID for shop ${shop}, product ${shopifyProductId}:`, error);
    throw error;
  }
}

/**
 * Mark imported product as deleted
 * 
 * @param {string} shop Shop domain
 * @param {string} shopifyProductId Shopify product ID
 * @returns {boolean} Success
 */
async function markImportedProductAsDeleted(shop, shopifyProductId) {
  try {
    const importedProduct = await ImportedProduct.findOneAndUpdate(
      { shop, shopifyProductId },
      {
        status: 'deleted',
        updatedAt: new Date()
      }
    );
    
    return !!importedProduct;
  } catch (error) {
    logger.error(`Error marking imported product as deleted for shop ${shop}, product ${shopifyProductId}:`, error);
    throw error;
  }
}

/**
 * Get imported products
 * 
 * @param {string} shop Shop domain
 * @param {Object} options Query options
 * @returns {Object} Imported products with pagination
 */
async function getImportedProducts(shop, options = {}) {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      sourceProductId,
      shopifyProductId,
      sortBy = 'updatedAt',
      sortOrder = -1
    } = options;
    
    // Build query
    const query = { shop };
    
    if (status) {
      query.status = status;
    }
    
    if (sourceProductId) {
      query.sourceProductId = sourceProductId;
    }
    
    if (shopifyProductId) {
      query.shopifyProductId = shopifyProductId;
    }
    
    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder;
    
    // Get total count
    const total = await ImportedProduct.countDocuments(query);
    
    // Get products
    const products = await ImportedProduct.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);
    
    return {
      products: products.map(product => product.toObject()),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error(`Error getting imported products for shop ${shop}:`, error);
    throw error;
  }
}

/**
 * Get recently imported products
 * 
 * @param {string} shop Shop domain
 * @param {number} limit Result limit
 * @returns {Array} Imported products
 */
async function getRecentlyImportedProducts(shop, limit = 5) {
  try {
    const products = await ImportedProduct.find({ shop })
      .sort({ updatedAt: -1 })
      .limit(limit);
    
    return products.map(product => product.toObject());
  } catch (error) {
    logger.error(`Error getting recently imported products for shop ${shop}:`, error);
    throw error;
  }
}

/**
 * Get import statistics
 * 
 * @param {string} shop Shop domain
 * @returns {Object} Import statistics
 */
async function getImportStatistics(shop) {
  try {
    const stats = {
      total: 0,
      imported: 0,
      updated: 0,
      deleted: 0,
      error: 0,
      lastSyncDate: null
    };
    
    // Get total count
    stats.total = await ImportedProduct.countDocuments({ shop });
    
    // Get counts by status
    const statusCounts = await ImportedProduct.aggregate([
      { $match: { shop } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Process status counts
    statusCounts.forEach(status => {
      stats[status._id] = status.count;
    });
    
    // Get last sync date
    const lastSync = await ImportedProduct.findOne({ shop })
      .sort({ updatedAt: -1 })
      .select('updatedAt');
    
    if (lastSync) {
      stats.lastSyncDate = lastSync.updatedAt;
    }
    
    // Get last sync job
    const lastSyncJob = await SyncJob.findOne({ shop })
      .sort({ startedAt: -1 })
      .select('startedAt completedAt status stats');
    
    if (lastSyncJob) {
      stats.lastSyncJob = lastSyncJob.toObject();
    }
    
    return stats;
  } catch (error) {
    logger.error(`Error getting import statistics for shop ${shop}:`, error);
    throw error;
  }
}

/**
 * Save sync job
 * 
 * @param {string} shop Shop domain
 * @param {Object} jobInfo Job info
 * @returns {Object} Saved job info
 */
async function saveSyncJob(shop, jobInfo) {
  try {
    // Create new job
    const syncJob = new SyncJob({
      jobId: jobInfo.id,
      shop,
      status: jobInfo.status,
      startedAt: jobInfo.startedAt,
      updatedAt: jobInfo.updatedAt,
      options: jobInfo.options,
      stats: jobInfo.stats,
      errors: jobInfo.errors,
      error: jobInfo.error
    });
    
    await syncJob.save();
    
    return syncJob.toObject();
  } catch (error) {
    logger.error(`Error saving sync job for shop ${shop}:`, error);
    throw error;
  }
}

/**
 * Update sync job
 * 
 * @param {string} shop Shop domain
 * @param {Object} jobInfo Job info
 * @returns {Object} Updated job info
 */
async function updateSyncJob(shop, jobInfo) {
  try {
    // Find and update job
    const syncJob = await SyncJob.findOneAndUpdate(
      { jobId: jobInfo.id },
      {
        status: jobInfo.status,
        completedAt: jobInfo.completedAt,
        updatedAt: jobInfo.updatedAt || new Date(),
        stats: jobInfo.stats,
        errors: jobInfo.errors,
        error: jobInfo.error
      },
      { new: true }
    );
    
    if (!syncJob) {
      return null;
    }
    
    return syncJob.toObject();
  } catch (error) {
    logger.error(`Error updating sync job for shop ${shop}:`, error);
    throw error;
  }
}

/**
 * Get sync jobs for shop
 * 
 * @param {string} shop Shop domain
 * @param {Object} options Query options
 * @returns {Object} Sync jobs with pagination
 */
async function getSyncJobs(shop, options = {}) {
  try {
    const {
      page = 1,
      limit = 10,
      status
    } = options;
    
    // Build query
    const query = { shop };
    
    if (status) {
      query.status = status;
    }
    
    // Get total count
    const total = await SyncJob.countDocuments(query);
    
    // Get jobs
    const jobs = await SyncJob.find(query)
      .sort({ startedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    return {
      jobs: jobs.map(job => job.toObject()),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error(`Error getting sync jobs for shop ${shop}:`, error);
    throw error;
  }
}

/**
 * Get sync job by ID
 * 
 * @param {string} jobId Job ID
 * @returns {Object} Sync job
 */
async function getSyncJobById(jobId) {
  try {
    const job = await SyncJob.findOne({ jobId });
    
    if (!job) {
      return null;
    }
    
    return job.toObject();
  } catch (error) {
    logger.error(`Error getting sync job ${jobId}:`, error);
    throw error;
  }
}

// Export database functions
module.exports = {
  saveShop,
  getShopByDomain,
  getShopsWithSyncEnabled,
  deleteShop,
  saveImportedProduct,
  getImportedProductBySourceId,
  getImportedProductByShopifyId,
  markImportedProductAsDeleted,
  getImportedProducts,
  getRecentlyImportedProducts,
  getImportStatistics,
  saveSyncJob,
  updateSyncJob,
  getSyncJobs,
  getSyncJobById
};