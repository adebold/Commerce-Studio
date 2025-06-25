const ConflictResolution = require('../models/ConflictResolution');
const Product = require('../models/Product');
const Collection = require('../models/Collection');
const Inventory = require('../models/Inventory');
const SyncMetrics = require('../models/Analytics');
const logger = require('../utils/logger');

/**
 * Detect and create a conflict
 */
async function createConflict(shopDomain, resourceType, shopifyData, skuGenieData, conflictType, severity = 'medium') {
  try {
    logger.info(`Creating conflict for ${resourceType} in shop ${shopDomain}`);
    
    // Get resource IDs
    const shopifyResourceId = getResourceId(shopifyData, resourceType);
    const skuGenieResourceId = getResourceId(skuGenieData, resourceType, true);
    
    if (!shopifyResourceId || !skuGenieResourceId) {
      logger.warn(`Missing resource IDs for conflict: shopify=${shopifyResourceId}, skuGenie=${skuGenieResourceId}`);
      return null;
    }
    
    // Check if a similar conflict already exists
    const existingConflict = await ConflictResolution.findOne({
      shopDomain,
      resourceType,
      shopifyResourceId,
      skuGenieResourceId,
      status: 'pending',
    });
    
    if (existingConflict) {
      logger.info(`Conflict already exists for ${resourceType} ${shopifyResourceId}`);
      return existingConflict;
    }
    
    // Create a new conflict
    const conflict = new ConflictResolution({
      shopDomain,
      resourceType,
      shopifyResourceId,
      skuGenieResourceId,
      conflictType,
      severity,
      conflictDetails: {
        shopifyData,
        skuGenieData,
        fields: [],
      },
      versionHistory: [{
        timestamp: new Date(),
        action: 'created',
        userId: 'system',
        userEmail: 'system@app',
        details: `Conflict detected: ${conflictType}`,
      }],
    });
    
    // Detect field conflicts
    if (conflictType === 'data_mismatch') {
      detectFieldConflicts(conflict, shopifyData, skuGenieData, resourceType);
    }
    
    // Save the conflict
    await conflict.save();
    
    // Update analytics
    try {
      const metrics = await SyncMetrics.getOrCreateForToday(shopDomain);
      metrics.incrementConflict(conflictType);
      await metrics.save();
    } catch (error) {
      logger.error(`Error updating metrics: ${error.message}`);
    }
    
    logger.info(`Created conflict ${conflict._id} for ${resourceType} ${shopifyResourceId}`);
    
    return conflict;
  } catch (error) {
    logger.error(`Error creating conflict: ${error.message}`);
    throw error;
  }
}

/**
 * Attempt to automatically resolve a conflict
 */
async function attemptAutoResolution(conflict) {
  try {
    logger.info(`Attempting auto-resolution for conflict ${conflict._id}`);
    
    // Mark that auto-resolution was attempted
    conflict.autoResolutionAttempted = true;
    
    // Choose resolution strategy based on conflict type and severity
    let strategy = null;
    let success = false;
    
    if (conflict.conflictType === 'data_mismatch') {
      if (conflict.severity === 'low') {
        // For low severity data mismatches, use the most recent data
        const shopifyUpdatedAt = getUpdatedAt(conflict.conflictDetails.shopifyData);
        const skuGenieUpdatedAt = getUpdatedAt(conflict.conflictDetails.skuGenieData);
        
        if (shopifyUpdatedAt && skuGenieUpdatedAt) {
          if (shopifyUpdatedAt > skuGenieUpdatedAt) {
            strategy = 'use_shopify';
          } else {
            strategy = 'use_skugenie';
          }
          success = true;
        }
      } else if (conflict.severity === 'medium') {
        // For medium severity, try to merge non-conflicting fields
        strategy = 'manual_merge';
        
        // Auto-resolve fields that don't conflict
        const fieldsResolved = await autoResolveFields(conflict);
        success = fieldsResolved > 0;
      }
    } else if (conflict.conflictType === 'inventory_conflict') {
      // For inventory conflicts, use the higher inventory level
      strategy = 'use_higher_inventory';
      success = await resolveInventoryConflict(conflict);
    }
    
    // Update conflict with resolution results
    conflict.autoResolutionStrategy = strategy;
    conflict.autoResolutionSuccessful = success;
    
    if (success && strategy !== 'manual_merge') {
      // If fully resolved, mark as resolved
      conflict.status = 'resolved';
      conflict.resolvedAt = new Date();
      conflict.resolution = strategy;
      conflict.resolvedBy = {
        userId: 'system',
        userEmail: 'system@app',
      };
      
      // Add to version history
      conflict.versionHistory.push({
        timestamp: new Date(),
        action: 'resolved',
        userId: 'system',
        userEmail: 'system@app',
        details: `Auto-resolved with strategy: ${strategy}`,
      });
      
      // Update analytics
      try {
        const metrics = await SyncMetrics.getOrCreateForToday(conflict.shopDomain);
        metrics.incrementConflict(conflict.conflictType, 'auto');
        await metrics.save();
      } catch (error) {
        logger.error(`Error updating metrics: ${error.message}`);
      }
    }
    
    await conflict.save();
    
    logger.info(`Auto-resolution ${success ? 'succeeded' : 'failed'} for conflict ${conflict._id} with strategy ${strategy}`);
    
    return {
      success,
      strategy,
      conflict,
    };
  } catch (error) {
    logger.error(`Error in auto-resolution: ${error.message}`);
    throw error;
  }
}

/**
 * Resolve a conflict manually
 */
async function resolveConflict(conflictId, resolution, resolvedBy, notes = null) {
  try {
    logger.info(`Resolving conflict ${conflictId} with strategy ${resolution}`);
    
    // Find the conflict
    const conflict = await ConflictResolution.findById(conflictId);
    
    if (!conflict) {
      throw new Error(`Conflict ${conflictId} not found`);
    }
    
    if (conflict.status !== 'pending') {
      throw new Error(`Conflict ${conflictId} is already ${conflict.status}`);
    }
    
    // Apply the resolution
    await conflict.resolve(resolution, resolvedBy, notes);
    
    // Update analytics
    try {
      const metrics = await SyncMetrics.getOrCreateForToday(conflict.shopDomain);
      metrics.incrementConflict(conflict.conflictType, 'resolved');
      await metrics.save();
    } catch (error) {
      logger.error(`Error updating metrics: ${error.message}`);
    }
    
    // Apply the changes based on resolution
    if (resolution === 'use_shopify' || resolution === 'use_skugenie') {
      await applyResolution(conflict, resolution);
    }
    
    logger.info(`Resolved conflict ${conflictId}`);
    
    return conflict;
  } catch (error) {
    logger.error(`Error resolving conflict: ${error.message}`);
    throw error;
  }
}

/**
 * Ignore a conflict
 */
async function ignoreConflict(conflictId, resolvedBy, notes = null) {
  try {
    logger.info(`Ignoring conflict ${conflictId}`);
    
    // Find the conflict
    const conflict = await ConflictResolution.findById(conflictId);
    
    if (!conflict) {
      throw new Error(`Conflict ${conflictId} not found`);
    }
    
    if (conflict.status !== 'pending') {
      throw new Error(`Conflict ${conflictId} is already ${conflict.status}`);
    }
    
    // Ignore the conflict
    await conflict.ignore(resolvedBy, notes);
    
    // Update analytics
    try {
      const metrics = await SyncMetrics.getOrCreateForToday(conflict.shopDomain);
      metrics.incrementConflict(conflict.conflictType, 'ignored');
      await metrics.save();
    } catch (error) {
      logger.error(`Error updating metrics: ${error.message}`);
    }
    
    logger.info(`Ignored conflict ${conflictId}`);
    
    return conflict;
  } catch (error) {
    logger.error(`Error ignoring conflict: ${error.message}`);
    throw error;
  }
}

/**
 * Detect field conflicts between Shopify and SKU-Genie data
 */
function detectFieldConflicts(conflict, shopifyData, skuGenieData, resourceType) {
  // Define fields to compare based on resource type
  const fieldsToCompare = getFieldsToCompare(resourceType);
  
  for (const field of fieldsToCompare) {
    const shopifyValue = getNestedValue(shopifyData, field.shopify);
    const skuGenieValue = getNestedValue(skuGenieData, field.skuGenie);
    
    // Skip if both values are undefined or null
    if (shopifyValue === undefined && skuGenieValue === undefined) {
      continue;
    }
    
    if (shopifyValue === null && skuGenieValue === null) {
      continue;
    }
    
    // Compare values
    if (!areValuesEqual(shopifyValue, skuGenieValue)) {
      conflict.addFieldConflict(field.name, shopifyValue, skuGenieValue);
    }
  }
}

/**
 * Auto-resolve fields that don't conflict
 */
async function autoResolveFields(conflict) {
  let resolvedCount = 0;
  
  // For each field conflict
  for (const field of conflict.conflictDetails.fields) {
    // Skip fields that are already resolved
    if (field.resolvedValue !== undefined) {
      continue;
    }
    
    // Try to auto-resolve based on field type
    const fieldName = field.fieldName;
    const shopifyValue = field.shopifyValue;
    const skuGenieValue = field.skuGenieValue;
    
    // Auto-resolve timestamps - use the most recent
    if (fieldName.includes('date') || fieldName.includes('time') || fieldName.includes('At')) {
      const shopifyDate = new Date(shopifyValue);
      const skuGenieDate = new Date(skuGenieValue);
      
      if (!isNaN(shopifyDate.getTime()) && !isNaN(skuGenieDate.getTime())) {
        if (shopifyDate > skuGenieDate) {
          field.resolvedValue = shopifyValue;
        } else {
          field.resolvedValue = skuGenieValue;
        }
        resolvedCount++;
      }
    }
    
    // Auto-resolve numeric fields - use the average
    else if (typeof shopifyValue === 'number' && typeof skuGenieValue === 'number') {
      field.resolvedValue = (shopifyValue + skuGenieValue) / 2;
      resolvedCount++;
    }
    
    // Auto-resolve boolean fields - use OR logic
    else if (typeof shopifyValue === 'boolean' && typeof skuGenieValue === 'boolean') {
      field.resolvedValue = shopifyValue || skuGenieValue;
      resolvedCount++;
    }
    
    // Auto-resolve arrays - merge unique values
    else if (Array.isArray(shopifyValue) && Array.isArray(skuGenieValue)) {
      field.resolvedValue = [...new Set([...shopifyValue, ...skuGenieValue])];
      resolvedCount++;
    }
  }
  
  return resolvedCount;
}

/**
 * Resolve inventory conflict
 */
async function resolveInventoryConflict(conflict) {
  try {
    // Get inventory levels
    const shopifyInventory = conflict.conflictDetails.shopifyData;
    const skuGenieInventory = conflict.conflictDetails.skuGenieData;
    
    // Compare inventory levels
    const shopifyQuantity = shopifyInventory.available || 0;
    const skuGenieQuantity = skuGenieInventory.quantity || 0;
    
    // Use the higher inventory level
    const resolvedQuantity = Math.max(shopifyQuantity, skuGenieQuantity);
    
    // Update the inventory in our database
    const inventory = await Inventory.findByShopifyId(
      conflict.shopDomain,
      conflict.shopifyResourceId
    );
    
    if (!inventory) {
      return false;
    }
    
    // Update all locations to the resolved quantity
    for (const level of inventory.inventoryLevels) {
      inventory.updateInventoryLevel(
        level.locationId,
        resolvedQuantity,
        'system',
        'Conflict resolution'
      );
    }
    
    await inventory.save();
    
    return true;
  } catch (error) {
    logger.error(`Error resolving inventory conflict: ${error.message}`);
    return false;
  }
}

/**
 * Apply resolution to the data
 */
async function applyResolution(conflict, resolution) {
  try {
    const { resourceType, shopDomain, shopifyResourceId, skuGenieResourceId } = conflict;
    
    // Get the data to use
    const dataToUse = resolution === 'use_shopify' 
      ? conflict.conflictDetails.shopifyData 
      : conflict.conflictDetails.skuGenieData;
    
    // Apply based on resource type
    if (resourceType === 'product') {
      const product = await Product.findByShopifyId(shopDomain, shopifyResourceId);
      
      if (!product) {
        return false;
      }
      
      // Update product with resolved data
      if (resolution === 'use_shopify') {
        // Update SKU-Genie with Shopify data
        // This would be handled by the product sync process
      } else {
        // Update Shopify with SKU-Genie data
        // This would require calling the Shopify API
      }
    } 
    else if (resourceType === 'collection') {
      const collection = await Collection.findByShopifyId(shopDomain, shopifyResourceId);
      
      if (!collection) {
        return false;
      }
      
      // Update collection with resolved data
      if (resolution === 'use_shopify') {
        // Update SKU-Genie with Shopify data
        // This would be handled by the collection sync process
      } else {
        // Update Shopify with SKU-Genie data
        // This would require calling the Shopify API
      }
    }
    else if (resourceType === 'inventory') {
      const inventory = await Inventory.findByShopifyId(shopDomain, shopifyResourceId);
      
      if (!inventory) {
        return false;
      }
      
      // Update inventory with resolved data
      if (resolution === 'use_shopify') {
        // Update SKU-Genie with Shopify data
        // This would be handled by the inventory sync process
      } else {
        // Update Shopify with SKU-Genie data
        // This would require calling the Shopify API
      }
    }
    
    return true;
  } catch (error) {
    logger.error(`Error applying resolution: ${error.message}`);
    return false;
  }
}

/**
 * Get resource ID from data
 */
function getResourceId(data, resourceType, isSkuGenie = false) {
  if (!data) {
    return null;
  }
  
  if (isSkuGenie) {
    return data.id ? data.id.toString() : null;
  }
  
  switch (resourceType) {
    case 'product':
      return data.id ? data.id.toString() : null;
    case 'variant':
      return data.id ? data.id.toString() : null;
    case 'collection':
      return data.id ? data.id.toString() : null;
    case 'inventory':
      return data.inventory_item_id ? data.inventory_item_id.toString() : null;
    default:
      return data.id ? data.id.toString() : null;
  }
}

/**
 * Get updated timestamp from data
 */
function getUpdatedAt(data) {
  if (!data) {
    return null;
  }
  
  if (data.updated_at) {
    return new Date(data.updated_at);
  }
  
  if (data.updatedAt) {
    return new Date(data.updatedAt);
  }
  
  return null;
}

/**
 * Get fields to compare based on resource type
 */
function getFieldsToCompare(resourceType) {
  switch (resourceType) {
    case 'product':
      return [
        { name: 'title', shopify: 'title', skuGenie: 'title' },
        { name: 'description', shopify: 'body_html', skuGenie: 'description' },
        { name: 'vendor', shopify: 'vendor', skuGenie: 'brand' },
        { name: 'productType', shopify: 'product_type', skuGenie: 'frameShape' },
        { name: 'tags', shopify: 'tags', skuGenie: 'tags' },
        { name: 'status', shopify: 'status', skuGenie: 'status' },
      ];
    case 'collection':
      return [
        { name: 'title', shopify: 'title', skuGenie: 'name' },
        { name: 'description', shopify: 'body_html', skuGenie: 'description' },
        { name: 'published', shopify: 'published', skuGenie: 'active' },
      ];
    case 'inventory':
      return [
        { name: 'quantity', shopify: 'available', skuGenie: 'quantity' },
        { name: 'sku', shopify: 'sku', skuGenie: 'sku' },
      ];
    default:
      return [];
  }
}

/**
 * Get nested value from object
 */
function getNestedValue(obj, path) {
  if (!obj || !path) {
    return undefined;
  }
  
  const keys = path.split('.');
  let value = obj;
  
  for (const key of keys) {
    if (value === null || value === undefined) {
      return undefined;
    }
    
    value = value[key];
  }
  
  return value;
}

/**
 * Compare values for equality
 */
function areValuesEqual(value1, value2) {
  // Handle null and undefined
  if (value1 === value2) {
    return true;
  }
  
  if (value1 === null || value1 === undefined || value2 === null || value2 === undefined) {
    return false;
  }
  
  // Handle dates
  if (value1 instanceof Date && value2 instanceof Date) {
    return value1.getTime() === value2.getTime();
  }
  
  // Handle arrays
  if (Array.isArray(value1) && Array.isArray(value2)) {
    if (value1.length !== value2.length) {
      return false;
    }
    
    // Sort arrays for comparison
    const sorted1 = [...value1].sort();
    const sorted2 = [...value2].sort();
    
    for (let i = 0; i < sorted1.length; i++) {
      if (!areValuesEqual(sorted1[i], sorted2[i])) {
        return false;
      }
    }
    
    return true;
  }
  
  // Handle objects
  if (typeof value1 === 'object' && typeof value2 === 'object') {
    const keys1 = Object.keys(value1);
    const keys2 = Object.keys(value2);
    
    if (keys1.length !== keys2.length) {
      return false;
    }
    
    for (const key of keys1) {
      if (!areValuesEqual(value1[key], value2[key])) {
        return false;
      }
    }
    
    return true;
  }
  
  // Handle strings (case insensitive)
  if (typeof value1 === 'string' && typeof value2 === 'string') {
    return value1.toLowerCase() === value2.toLowerCase();
  }
  
  // Handle numbers (with tolerance for floating point)
  if (typeof value1 === 'number' && typeof value2 === 'number') {
    const tolerance = 0.00001;
    return Math.abs(value1 - value2) < tolerance;
  }
  
  // Default comparison
  return value1 === value2;
}

module.exports = {
  createConflict,
  attemptAutoResolution,
  resolveConflict,
  ignoreConflict,
};