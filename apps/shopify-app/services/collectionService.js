const { Shopify } = require('@shopify/shopify-api');
const Collection = require('../models/Collection');
const Product = require('../models/Product');
const SyncJob = require('../models/SyncJob');
const logger = require('../utils/logger');
const skuGenieApi = require('./skuGenieApi');

/**
 * Process a Shopify collection and sync it to SKU-Genie
 */
async function processShopifyCollection(shop, shopifyCollection, syncJobId) {
  try {
    logger.info(`Processing Shopify collection ${shopifyCollection.id} for shop ${shop.shopDomain}`);
    
    // Determine collection type
    const isSmartCollection = shopifyCollection.rules !== undefined;
    const collectionType = isSmartCollection ? 'smart' : 'custom';
    
    // Find or create the collection in our database
    let collection = await Collection.findByShopifyId(shop.shopDomain, shopifyCollection.id.toString());
    
    if (!collection) {
      // Create a new collection
      collection = new Collection({
        shopDomain: shop.shopDomain,
        shopifyCollectionId: shopifyCollection.id.toString(),
        title: shopifyCollection.title,
        description: shopifyCollection.body_html,
        handle: shopifyCollection.handle,
        collectionType,
        publishedAt: shopifyCollection.published_at,
        publishedScope: shopifyCollection.published_scope,
        sortOrder: shopifyCollection.sort_order,
        templateSuffix: shopifyCollection.template_suffix,
        syncDirection: shop.settings.syncDirection,
        syncStatus: 'pending',
      });
      
      logger.info(`Created new collection record for ${shopifyCollection.id}`);
    } else {
      // Update existing collection
      collection.title = shopifyCollection.title;
      collection.description = shopifyCollection.body_html;
      collection.handle = shopifyCollection.handle;
      collection.publishedAt = shopifyCollection.published_at;
      collection.publishedScope = shopifyCollection.published_scope;
      collection.sortOrder = shopifyCollection.sort_order;
      collection.templateSuffix = shopifyCollection.template_suffix;
      collection.syncStatus = 'pending';
      
      logger.info(`Updated collection record for ${shopifyCollection.id}`);
    }
    
    // Process smart collection rules
    if (isSmartCollection && shopifyCollection.rules) {
      collection.disjunctive = shopifyCollection.disjunctive;
      collection.rules = shopifyCollection.rules.map(rule => ({
        column: rule.column,
        relation: rule.relation,
        condition: rule.condition,
      }));
    }
    
    // Process custom collection products
    if (!isSmartCollection && shopifyCollection.products) {
      collection.products = shopifyCollection.products.map(product => product.id.toString());
    }
    
    // Process image
    if (shopifyCollection.image) {
      collection.image = {
        shopifyImageId: shopifyCollection.image.id.toString(),
        src: shopifyCollection.image.src,
        width: shopifyCollection.image.width,
        height: shopifyCollection.image.height,
        alt: shopifyCollection.image.alt,
      };
    }
    
    // Save the collection
    await collection.save();
    
    // Sync to SKU-Genie
    await syncToSKUGenie(shop, collection, syncJobId);
    
    return collection;
  } catch (error) {
    logger.error(`Error processing Shopify collection ${shopifyCollection.id}: ${error.message}`);
    
    // Update sync job if provided
    if (syncJobId) {
      const syncJob = await SyncJob.findById(syncJobId);
      if (syncJob) {
        await syncJob.addError(
          shopifyCollection.id.toString(),
          'collection',
          error.message,
          'PROCESSING_ERROR'
        );
      }
    }
    
    throw error;
  }
}

/**
 * Sync a collection to SKU-Genie
 */
async function syncToSKUGenie(shop, collection, syncJobId) {
  try {
    logger.info(`Syncing collection ${collection.shopifyCollectionId} to SKU-Genie`);
    
    // Update sync job if provided
    let syncJob = null;
    if (syncJobId) {
      syncJob = await SyncJob.findById(syncJobId);
      if (syncJob) {
        syncJob.status = 'in_progress';
        if (!syncJob.startedAt) {
          syncJob.startedAt = new Date();
        }
        await syncJob.save();
      }
    }
    
    // Map collection data
    const skuGenieCollection = {
      id: collection.skuGenieId, // Will be null for new collections
      name: collection.title,
      description: collection.description,
      type: collection.collectionType === 'smart' ? 'dynamic' : 'static',
      external_id: collection.shopifyCollectionId,
      external_source: 'shopify',
      active: collection.publishedAt ? true : false,
    };
    
    // Add rules for smart collections
    if (collection.collectionType === 'smart' && collection.rules && collection.rules.length > 0) {
      skuGenieCollection.rules = {
        operator: collection.disjunctive ? 'OR' : 'AND',
        conditions: collection.rules.map(rule => ({
          field: mapShopifyRuleColumn(rule.column),
          operator: mapShopifyRuleRelation(rule.relation),
          value: rule.condition,
        })),
      };
    }
    
    // Add products for custom collections
    if (collection.collectionType === 'custom' && collection.products && collection.products.length > 0) {
      // Get SKU-Genie product IDs for these Shopify product IDs
      const products = await Product.find({
        shopDomain: shop.shopDomain,
        shopifyProductId: { $in: collection.products },
      });
      
      const skuGenieProductIds = products
        .filter(product => product.skuGenieId)
        .map(product => product.skuGenieId);
      
      skuGenieCollection.product_ids = skuGenieProductIds;
    }
    
    // Add image if available
    if (collection.image && collection.image.src) {
      skuGenieCollection.image_url = collection.image.src;
    }
    
    // Send to SKU-Genie
    let response;
    if (collection.skuGenieId) {
      // Update existing collection
      response = await skuGenieApi.updateCollection(shop.clientId, collection.skuGenieId, skuGenieCollection);
      logger.info(`Updated collection ${collection.shopifyCollectionId} in SKU-Genie with ID ${response.id}`);
    } else {
      // Create new collection
      response = await skuGenieApi.createCollection(shop.clientId, skuGenieCollection);
      logger.info(`Created collection ${collection.shopifyCollectionId} in SKU-Genie with ID ${response.id}`);
      
      // Save SKU-Genie ID
      collection.skuGenieId = response.id;
    }
    
    // Update collection status
    collection.syncStatus = 'synced';
    collection.lastSyncedAt = new Date();
    await collection.save();
    
    // Update sync job if provided
    if (syncJob) {
      syncJob.results.success.count += 1;
      syncJob.results.success.ids.push(collection.shopifyCollectionId);
      syncJob.progress.current += 1;
      
      if (syncJob.progress.current >= syncJob.progress.total) {
        await syncJob.markAsCompleted();
      } else {
        await syncJob.save();
      }
    }
    
    return response;
  } catch (error) {
    logger.error(`Error syncing collection ${collection.shopifyCollectionId} to SKU-Genie: ${error.message}`);
    
    // Update collection status
    collection.syncStatus = 'failed';
    collection.syncError = error.message;
    await collection.save();
    
    // Update sync job if provided
    if (syncJobId) {
      const syncJob = await SyncJob.findById(syncJobId);
      if (syncJob) {
        await syncJob.addError(
          collection.shopifyCollectionId,
          'collection',
          error.message,
          'SYNC_ERROR'
        );
      }
    }
    
    throw error;
  }
}

/**
 * Delete a collection from SKU-Genie
 */
async function deleteCollectionFromSKUGenie(shop, collection) {
  try {
    if (!collection.skuGenieId) {
      logger.warn(`Collection ${collection.shopifyCollectionId} has no SKU-Genie ID, skipping delete`);
      return;
    }
    
    logger.info(`Deleting collection ${collection.shopifyCollectionId} from SKU-Genie`);
    
    // Delete from SKU-Genie
    await skuGenieApi.deleteCollection(shop.clientId, collection.skuGenieId);
    logger.info(`Deleted collection ${collection.shopifyCollectionId} from SKU-Genie`);
    
    return true;
  } catch (error) {
    logger.error(`Error deleting collection ${collection.shopifyCollectionId} from SKU-Genie: ${error.message}`);
    throw error;
  }
}

/**
 * Map Shopify rule column to SKU-Genie field
 */
function mapShopifyRuleColumn(column) {
  const mapping = {
    'title': 'title',
    'type': 'productType',
    'vendor': 'brand',
    'variant_price': 'price',
    'tag': 'tags',
    'variant_compare_at_price': 'compareAtPrice',
    'variant_weight': 'weight',
    'variant_inventory': 'inventoryQuantity',
    'variant_title': 'variantTitle',
  };
  
  return mapping[column] || column;
}

/**
 * Map Shopify rule relation to SKU-Genie operator
 */
function mapShopifyRuleRelation(relation) {
  const mapping = {
    'equals': 'equals',
    'not_equals': 'not_equals',
    'greater_than': 'greater_than',
    'less_than': 'less_than',
    'starts_with': 'starts_with',
    'ends_with': 'ends_with',
    'contains': 'contains',
    'not_contains': 'not_contains',
  };
  
  return mapping[relation] || relation;
}

module.exports = {
  processShopifyCollection,
  syncToSKUGenie,
  deleteCollectionFromSKUGenie,
};