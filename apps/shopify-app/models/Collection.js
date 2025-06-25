const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  shopDomain: {
    type: String,
    required: true,
  },
  shopifyCollectionId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  handle: String,
  collectionType: {
    type: String,
    enum: ['smart', 'custom'],
    required: true,
  },
  publishedAt: Date,
  publishedScope: String,
  sortOrder: String,
  templateSuffix: String,
  disjunctive: Boolean, // For smart collections
  rules: [{ // For smart collections
    column: String,
    relation: String,
    condition: String,
  }],
  products: [{ // For custom collections
    type: String, // Shopify product ID
  }],
  image: {
    shopifyImageId: String,
    src: String,
    width: Number,
    height: Number,
    alt: String,
  },
  skuGenieId: String,
  skuGenieCategoryType: String,
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
  metafields: [{
    namespace: String,
    key: String,
    value: String,
    valueType: String,
  }],
}, {
  timestamps: true,
});

// Indexes
collectionSchema.index({ shopDomain: 1, shopifyCollectionId: 1 }, { unique: true });
collectionSchema.index({ skuGenieId: 1 });
collectionSchema.index({ syncStatus: 1 });
collectionSchema.index({ lastSyncedAt: 1 });

// Methods
collectionSchema.methods.updateSyncStatus = function(status, error = null) {
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
collectionSchema.statics.findByShopifyId = function(shopDomain, shopifyCollectionId) {
  return this.findOne({ shopDomain, shopifyCollectionId });
};

collectionSchema.statics.findBySKUGenieId = function(skuGenieId) {
  return this.findOne({ skuGenieId });
};

collectionSchema.statics.findPendingSync = function(shopDomain, limit = 100) {
  return this.find({ 
    shopDomain, 
    syncStatus: 'pending' 
  }).limit(limit);
};

const Collection = mongoose.model('Collection', collectionSchema);

module.exports = Collection;