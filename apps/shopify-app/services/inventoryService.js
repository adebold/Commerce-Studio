const { Shopify } = require('@shopify/shopify-api');
const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const SyncJob = require('../models/SyncJob');
const logger = require('../utils/logger');
const skuGenieApi = require('./skuGenieApi');

/**
 * Process Shopify inventory item and sync it to SKU-Genie
 */
async function processShopifyInventory(shop, inventoryItem, inventoryLevels, syncJobId) {
  try {
    logger.info(`Processing Shopify inventory item ${inventoryItem.id} for shop ${shop.shopDomain}`);
    
    // Find or create the inventory in our database
    let inventory = await Inventory.findByShopifyId(shop.shopDomain, inventoryItem.id.toString());
    
    // Find the variant and product
    const variant = await findVariantByInventoryItemId(shop.shopDomain, inventoryItem.id.toString());
    
    if (!variant) {
      logger.warn(`No variant found for inventory item ${inventoryItem.id}`);
      return null;
    }
    
    const product = await Product.findOne({
      shopDomain: shop.shopDomain,
      'variants.shopifyVariantId': variant.id.toString(),
    });
    
    if (!product) {
      logger.warn(`No product found for variant ${variant.id}`);
      return null;
    }
    
    if (!inventory) {
      // Create a new inventory record
      inventory = new Inventory({
        shopDomain: shop.shopDomain,
        shopifyInventoryItemId: inventoryItem.id.toString(),
        shopifyProductId: product.shopifyProductId,
        shopifyVariantId: variant.id.toString(),
        sku: inventoryItem.sku,
        inventoryManagement: variant.inventory_management,
        inventoryPolicy: variant.inventory_policy,
        inventoryLevels: [],
        syncDirection: shop.settings.syncDirection,
        syncStatus: 'pending',
      });
      
      logger.info(`Created new inventory record for ${inventoryItem.id}`);
    } else {
      // Update existing inventory
      inventory.sku = inventoryItem.sku;
      inventory.inventoryManagement = variant.inventory_management;
      inventory.inventoryPolicy = variant.inventory_policy;
      inventory.syncStatus = 'pending';
      
      logger.info(`Updated inventory record for ${inventoryItem.id}`);
    }
    
    // Process inventory levels
    if (inventoryLevels && inventoryLevels.length > 0) {
      for (const level of inventoryLevels) {
        inventory.updateInventoryLevel(
          level.location_id.toString(),
          level.available,
          'shopify'
        );
      }
    }
    
    // Save the inventory
    await inventory.save();
    
    // Sync to SKU-Genie
    await syncInventoryToSKUGenie(shop, inventory, product, syncJobId);
    
    return inventory;
  } catch (error) {
    logger.error(`Error processing Shopify inventory item: ${error.message}`);
    
    // Update sync job if provided
    if (syncJobId) {
      const syncJob = await SyncJob.findById(syncJobId);
      if (syncJob) {
        await syncJob.addError(
          inventoryItem.id.toString(),
          'inventory',
          error.message,
          'PROCESSING_ERROR'
        );
      }
    }
    
    throw error;
  }
}

/**
 * Sync inventory to SKU-Genie
 */
async function syncInventoryToSKUGenie(shop, inventory, product, syncJobId) {
  try {
    logger.info(`Syncing inventory ${inventory.shopifyInventoryItemId} to SKU-Genie`);
    
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
    
    // Skip if product has no SKU-Genie ID
    if (!product.skuGenieId) {
      logger.warn(`Product ${product.shopifyProductId} has no SKU-Genie ID, skipping inventory sync`);
      return;
    }
    
    // Find the variant in the product
    const variant = product.variants.find(v => v.shopifyVariantId === inventory.shopifyVariantId);
    
    if (!variant) {
      logger.warn(`Variant ${inventory.shopifyVariantId} not found in product ${product.shopifyProductId}`);
      return;
    }
    
    // Skip if variant has no SKU-Genie ID
    if (!variant.skuGenieId) {
      logger.warn(`Variant ${inventory.shopifyVariantId} has no SKU-Genie ID, skipping inventory sync`);
      return;
    }
    
    // Calculate total inventory across all locations
    const totalInventory = inventory.inventoryLevels.reduce((sum, level) => sum + level.available, 0);
    
    // Prepare inventory data for SKU-Genie
    const skuGenieInventory = {
      product_id: product.skuGenieId,
      variant_id: variant.skuGenieId,
      sku: inventory.sku,
      quantity: totalInventory,
      locations: inventory.inventoryLevels.map(level => ({
        location_id: level.locationId,
        location_name: level.locationName || `Location ${level.locationId}`,
        quantity: level.available,
      })),
      external_id: inventory.shopifyInventoryItemId,
      external_source: 'shopify',
    };
    
    // Send to SKU-Genie
    const response = await skuGenieApi.updateInventory(shop.clientId, skuGenieInventory);
    logger.info(`Updated inventory for product ${product.shopifyProductId} in SKU-Genie`);
    
    // Update inventory status
    inventory.syncStatus = 'synced';
    inventory.lastSyncedAt = new Date();
    inventory.skuGenieId = response.id || variant.skuGenieId; // Use response ID if available
    await inventory.save();
    
    // Update sync job if provided
    if (syncJob) {
      syncJob.results.success.count += 1;
      syncJob.results.success.ids.push(inventory.shopifyInventoryItemId);
      syncJob.progress.current += 1;
      
      if (syncJob.progress.current >= syncJob.progress.total) {
        await syncJob.markAsCompleted();
      } else {
        await syncJob.save();
      }
    }
    
    return response;
  } catch (error) {
    logger.error(`Error syncing inventory ${inventory.shopifyInventoryItemId} to SKU-Genie: ${error.message}`);
    
    // Update inventory status
    inventory.syncStatus = 'failed';
    inventory.syncError = error.message;
    await inventory.save();
    
    // Update sync job if provided
    if (syncJobId) {
      const syncJob = await SyncJob.findById(syncJobId);
      if (syncJob) {
        await syncJob.addError(
          inventory.shopifyInventoryItemId,
          'inventory',
          error.message,
          'SYNC_ERROR'
        );
      }
    }
    
    throw error;
  }
}

/**
 * Get inventory levels for a shop
 */
async function getShopifyInventoryLevels(shop, inventoryItemIds) {
  try {
    logger.info(`Getting inventory levels for shop ${shop.shopDomain}`);
    
    const client = new Shopify.Clients.Rest(shop.shopDomain, shop.accessToken);
    
    // Get all locations
    const locationsResponse = await client.get({
      path: 'locations',
    });
    
    const locations = locationsResponse.body.locations;
    
    // Get inventory levels for each location
    const inventoryLevels = [];
    
    for (const location of locations) {
      // Skip non-active locations
      if (!location.active) {
        continue;
      }
      
      // Get inventory levels for this location
      const response = await client.get({
        path: 'inventory_levels',
        query: {
          location_id: location.id,
          limit: 250,
        },
      });
      
      // Filter by inventory item IDs if provided
      let levels = response.body.inventory_levels;
      
      if (inventoryItemIds && inventoryItemIds.length > 0) {
        levels = levels.filter(level => 
          inventoryItemIds.includes(level.inventory_item_id.toString())
        );
      }
      
      // Add location name to each level
      levels.forEach(level => {
        level.location_name = location.name;
      });
      
      inventoryLevels.push(...levels);
    }
    
    return inventoryLevels;
  } catch (error) {
    logger.error(`Error getting inventory levels: ${error.message}`);
    throw error;
  }
}

/**
 * Find variant by inventory item ID
 */
async function findVariantByInventoryItemId(shopDomain, inventoryItemId) {
  try {
    // Create Shopify client
    const shop = await Shop.findByShopDomain(shopDomain);
    
    if (!shop) {
      throw new Error(`Shop ${shopDomain} not found`);
    }
    
    const client = new Shopify.Clients.Rest(shopDomain, shop.accessToken);
    
    // Get variant by inventory item ID
    const response = await client.get({
      path: 'variants',
      query: {
        inventory_item_id: inventoryItemId,
      },
    });
    
    const variants = response.body.variants;
    
    if (variants.length === 0) {
      return null;
    }
    
    return variants[0];
  } catch (error) {
    logger.error(`Error finding variant by inventory item ID: ${error.message}`);
    throw error;
  }
}

module.exports = {
  processShopifyInventory,
  syncInventoryToSKUGenie,
  getShopifyInventoryLevels,
  findVariantByInventoryItemId,
};