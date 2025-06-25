const mongoose = require('mongoose');

const conflictSchema = new mongoose.Schema({
  shopDomain: {
    type: String,
    required: true,
  },
  resourceType: {
    type: String,
    enum: ['product', 'variant', 'collection', 'inventory'],
    required: true,
  },
  shopifyResourceId: {
    type: String,
    required: true,
  },
  skuGenieResourceId: {
    type: String,
    required: true,
  },
  conflictType: {
    type: String,
    enum: ['data_mismatch', 'deletion_conflict', 'creation_conflict', 'inventory_conflict'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'ignored'],
    default: 'pending',
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  detectedAt: {
    type: Date,
    default: Date.now,
  },
  resolvedAt: Date,
  resolvedBy: {
    userId: String,
    userEmail: String,
  },
  resolution: {
    type: String,
    enum: ['use_shopify', 'use_skugenie', 'manual_merge', 'ignore'],
  },
  conflictDetails: {
    fields: [{
      fieldName: String,
      shopifyValue: mongoose.Schema.Types.Mixed,
      skuGenieValue: mongoose.Schema.Types.Mixed,
      resolvedValue: mongoose.Schema.Types.Mixed,
    }],
    shopifyData: mongoose.Schema.Types.Mixed,
    skuGenieData: mongoose.Schema.Types.Mixed,
  },
  syncJobId: String,
  notes: String,
  autoResolutionAttempted: {
    type: Boolean,
    default: false,
  },
  autoResolutionSuccessful: Boolean,
  autoResolutionStrategy: String,
  versionHistory: [{
    timestamp: {
      type: Date,
      default: Date.now,
    },
    action: {
      type: String,
      enum: ['created', 'updated', 'resolved', 'reopened', 'ignored'],
    },
    userId: String,
    userEmail: String,
    details: String,
  }],
}, {
  timestamps: true,
});

// Indexes
conflictSchema.index({ shopDomain: 1, resourceType: 1, shopifyResourceId: 1, status: 1 });
conflictSchema.index({ shopDomain: 1, status: 1 });
conflictSchema.index({ detectedAt: 1 });
conflictSchema.index({ severity: 1 });
conflictSchema.index({ syncJobId: 1 });

// Methods
conflictSchema.methods.resolve = function(resolution, resolvedBy, notes = null) {
  this.status = 'resolved';
  this.resolvedAt = new Date();
  this.resolution = resolution;
  this.resolvedBy = resolvedBy;
  
  if (notes) {
    this.notes = notes;
  }
  
  // Add to version history
  this.versionHistory.push({
    timestamp: new Date(),
    action: 'resolved',
    userId: resolvedBy.userId,
    userEmail: resolvedBy.userEmail,
    details: `Resolved with strategy: ${resolution}`,
  });
  
  return this.save();
};

conflictSchema.methods.ignore = function(resolvedBy, notes = null) {
  this.status = 'ignored';
  this.resolvedAt = new Date();
  this.resolution = 'ignore';
  this.resolvedBy = resolvedBy;
  
  if (notes) {
    this.notes = notes;
  }
  
  // Add to version history
  this.versionHistory.push({
    timestamp: new Date(),
    action: 'ignored',
    userId: resolvedBy.userId,
    userEmail: resolvedBy.userEmail,
    details: notes || 'Conflict ignored',
  });
  
  return this.save();
};

conflictSchema.methods.reopen = function(userId, userEmail, reason = null) {
  this.status = 'pending';
  this.resolvedAt = null;
  this.resolution = null;
  
  // Add to version history
  this.versionHistory.push({
    timestamp: new Date(),
    action: 'reopened',
    userId,
    userEmail,
    details: reason || 'Conflict reopened',
  });
  
  return this.save();
};

conflictSchema.methods.addFieldConflict = function(fieldName, shopifyValue, skuGenieValue) {
  if (!this.conflictDetails.fields) {
    this.conflictDetails.fields = [];
  }
  
  // Check if field already exists
  const existingField = this.conflictDetails.fields.find(f => f.fieldName === fieldName);
  
  if (existingField) {
    existingField.shopifyValue = shopifyValue;
    existingField.skuGenieValue = skuGenieValue;
  } else {
    this.conflictDetails.fields.push({
      fieldName,
      shopifyValue,
      skuGenieValue,
    });
  }
  
  return this;
};

conflictSchema.methods.resolveField = function(fieldName, resolvedValue) {
  const field = this.conflictDetails.fields.find(f => f.fieldName === fieldName);
  
  if (field) {
    field.resolvedValue = resolvedValue;
  }
  
  return this;
};

// Statics
conflictSchema.statics.findPendingConflicts = function(shopDomain, resourceType = null) {
  const query = { shopDomain, status: 'pending' };
  
  if (resourceType) {
    query.resourceType = resourceType;
  }
  
  return this.find(query).sort({ severity: -1, detectedAt: 1 });
};

conflictSchema.statics.findByResource = function(shopDomain, resourceType, resourceId) {
  return this.find({
    shopDomain,
    resourceType,
    shopifyResourceId: resourceId,
  }).sort({ detectedAt: -1 });
};

const ConflictResolution = mongoose.model('ConflictResolution', conflictSchema);

module.exports = ConflictResolution;