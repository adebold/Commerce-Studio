const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  shopifyVariantId: {
    type: String,
    required: true,
  },
  title: String,
  price: Number,
  sku: String,
  barcode: String,
  inventoryQuantity: Number,
  inventoryManagement: String,
  weight: Number,
  weightUnit: String,
  requiresShipping: Boolean,
  taxable: Boolean,
  options: [{
    name: String,
    value: String,
  }],
  skuGenieId: String,
  lastSyncedAt: Date,
  syncStatus: {
    type: String,
    enum: ['pending', 'synced', 'failed'],
    default: 'pending',
  },
  syncError: String,
}, { 
  timestamps: true,
  _id: true,
});

const imageSchema = new mongoose.Schema({
  shopifyImageId: {
    type: String,
    required: true,
  },
  position: Number,
  src: {
    type: String,
    required: true,
  },
  width: Number,
  height: Number,
  alt: String,
  skuGenieId: String,
}, {
  timestamps: true,
  _id: true,
});

const productSchema = new mongoose.Schema({
  shopDomain: {
    type: String,
    required: true,
  },
  shopifyProductId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  vendor: String,
  productType: String,
  tags: [String],
  handle: String,
  status: {
    type: String,
    enum: ['active', 'draft', 'archived'],
    default: 'active',
  },
  publishedAt: Date,
  publishedScope: String,
  variants: [variantSchema],
  options: [{
    name: String,
    values: [String],
  }],
  images: [imageSchema],
  skuGenieId: String,
  skuGenieProductType: String,
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
  customAttributes: Map,
}, {
  timestamps: true,
});

// Indexes
productSchema.index({ shopDomain: 1, shopifyProductId: 1 }, { unique: true });
productSchema.index({ skuGenieId: 1 });
productSchema.index({ syncStatus: 1 });
productSchema.index({ lastSyncedAt: 1 });
productSchema.index({ 'variants.sku': 1 });

// Methods
productSchema.methods.updateSyncStatus = function(status, error = null) {
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
productSchema.statics.findByShopifyId = function(shopDomain, shopifyProductId) {
  return this.findOne({ shopDomain, shopifyProductId });
};

productSchema.statics.findBySKUGenieId = function(skuGenieId) {
  return this.findOne({ skuGenieId });
};

productSchema.statics.findPendingSync = function(shopDomain, limit = 100) {
  return this.find({ 
    shopDomain, 
    syncStatus: 'pending' 
  }).limit(limit);
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;