const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  shopDomain: {
    type: String,
    required: true,
  },
  shopifyInventoryItemId: {
    type: String,
    required: true,
  },
  shopifyProductId: {
    type: String,
    required: true,
  },
  shopifyVariantId: {
    type: String,
    required: true,
  },
  sku: String,
  inventoryLevels: [{
    locationId: {
      type: String,
      required: true,
    },
    locationName: String,
    available: {
      type: Number,
      default: 0,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  inventoryManagement: {
    type: String,
    enum: ['shopify', 'fulfillment_service', 'not_managed'],
    default: 'shopify',
  },
  inventoryPolicy: {
    type: String,
    enum: ['deny', 'continue'],
    default: 'deny',
  },
  skuGenieId: String,
  lastSyncedAt: Date,
  syncDirection: {
    type: String,
    enum: ['shopify-to-skugenie', 'skugenie-to-shopify', 'bidirectional'],
    default: 'bidirectional',
  },
  syncStatus: {
    type: String,
    enum: ['pending', 'synced', 'failed'],
    default: 'pending',
  },
  syncError: String,
  trackingEnabled: {
    type: Boolean,
    default: true,
  },
  historicalLevels: [{
    locationId: String,
    available: Number,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    source: {
      type: String,
      enum: ['shopify', 'skugenie', 'manual'],
      default: 'shopify',
    },
    changeReason: String,
  }],
}, {
  timestamps: true,
});

// Indexes
inventorySchema.index({ shopDomain: 1, shopifyInventoryItemId: 1 }, { unique: true });
inventorySchema.index({ shopDomain: 1, shopifyVariantId: 1 });
inventorySchema.index({ shopDomain: 1, shopifyProductId: 1 });
inventorySchema.index({ sku: 1 });
inventorySchema.index({ syncStatus: 1 });
inventorySchema.index({ lastSyncedAt: 1 });

// Methods
inventorySchema.methods.updateInventoryLevel = function(locationId, available, source = 'shopify', reason = null) {
  // Find the inventory level for this location
  const levelIndex = this.inventoryLevels.findIndex(level => level.locationId === locationId);
  
  // Get the current level
  const currentLevel = levelIndex >= 0 ? this.inventoryLevels[levelIndex].available : 0;
  
  // If the level is different, add to historical levels
  if (currentLevel !== available) {
    this.historicalLevels.push({
      locationId,
      available,
      timestamp: new Date(),
      source,
      changeReason: reason,
    });
    
    // Update or add the inventory level
    if (levelIndex >= 0) {
      this.inventoryLevels[levelIndex].available = available;
      this.inventoryLevels[levelIndex].updatedAt = new Date();
    } else {
      this.inventoryLevels.push({
        locationId,
        available,
        updatedAt: new Date(),
      });
    }
  }
  
  return this;
};

inventorySchema.methods.updateSyncStatus = function(status, error = null) {
  this.syncStatus = status;
  
  if (status === 'synced') {
    this.lastSyncedAt = new Date();
  }
  
  if (error && status === 'failed') {
    this.syncError = error.message || String(error);
  } else {
    this.syncError = null;
  }
  
  return this.save();
};

// Statics
inventorySchema.statics.findByShopifyId = function(shopDomain, shopifyInventoryItemId) {
  return this.findOne({ shopDomain, shopifyInventoryItemId });
};

inventorySchema.statics.findByVariantId = function(shopDomain, shopifyVariantId) {
  return this.findOne({ shopDomain, shopifyVariantId });
};

inventorySchema.statics.findByProductId = function(shopDomain, shopifyProductId) {
  return this.find({ shopDomain, shopifyProductId });
};

inventorySchema.statics.findBySku = function(shopDomain, sku) {
  return this.findOne({ shopDomain, sku });
};

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;