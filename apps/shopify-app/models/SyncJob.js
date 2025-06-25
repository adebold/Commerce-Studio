const mongoose = require('mongoose');

const syncJobSchema = new mongoose.Schema({
  shopDomain: {
    type: String,
    required: true,
  },
  jobType: {
    type: String,
    enum: ['full_sync', 'product_sync', 'webhook_sync', 'manual_sync'],
    required: true,
  },
  direction: {
    type: String,
    enum: ['shopify-to-skugenie', 'skugenie-to-shopify', 'bidirectional'],
    required: true,
  },
  status: {
    type: String,
    enum: ['queued', 'in_progress', 'completed', 'failed', 'cancelled'],
    default: 'queued',
  },
  progress: {
    current: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
  },
  startedAt: Date,
  completedAt: Date,
  queuedBy: {
    userId: String,
    userEmail: String,
  },
  targetResources: {
    productIds: [String],
    collectionIds: [String],
    skuGenieIds: [String],
  },
  options: {
    forceSync: {
      type: Boolean,
      default: false,
    },
    syncImages: {
      type: Boolean,
      default: true,
    },
    syncInventory: {
      type: Boolean,
      default: true,
    },
    syncMetafields: {
      type: Boolean,
      default: true,
    },
  },
  results: {
    success: {
      count: {
        type: Number,
        default: 0,
      },
      ids: [String],
    },
    failed: {
      count: {
        type: Number,
        default: 0,
      },
      ids: [String],
    },
    skipped: {
      count: {
        type: Number,
        default: 0,
      },
      ids: [String],
    },
  },
  errors: [{
    resourceId: String,
    resourceType: {
      type: String,
      enum: ['product', 'variant', 'collection', 'inventory'],
    },
    message: String,
    code: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  logs: [{
    level: {
      type: String,
      enum: ['info', 'warning', 'error', 'debug'],
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

// Indexes
syncJobSchema.index({ shopDomain: 1, status: 1 });
syncJobSchema.index({ createdAt: 1 });
syncJobSchema.index({ jobType: 1 });

// Methods
syncJobSchema.methods.updateProgress = function(current, total) {
  this.progress.current = current;
  this.progress.total = total;
  this.progress.percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  return this.save();
};

syncJobSchema.methods.addLog = function(level, message) {
  this.logs.push({
    level,
    message,
    timestamp: new Date(),
  });
  return this;
};

syncJobSchema.methods.addError = function(resourceId, resourceType, message, code) {
  this.errors.push({
    resourceId,
    resourceType,
    message,
    code,
    timestamp: new Date(),
  });
  
  // Update failed count and ids
  if (!this.results.failed.ids.includes(resourceId)) {
    this.results.failed.count += 1;
    this.results.failed.ids.push(resourceId);
  }
  
  return this;
};

syncJobSchema.methods.markAsCompleted = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

syncJobSchema.methods.markAsFailed = function(errorMessage) {
  this.status = 'failed';
  this.completedAt = new Date();
  this.addLog('error', errorMessage);
  return this.save();
};

// Statics
syncJobSchema.statics.findActiveJobs = function(shopDomain) {
  return this.find({
    shopDomain,
    status: { $in: ['queued', 'in_progress'] },
  });
};

syncJobSchema.statics.findRecentJobs = function(shopDomain, limit = 10) {
  return this.find({ shopDomain })
    .sort({ createdAt: -1 })
    .limit(limit);
};

const SyncJob = mongoose.model('SyncJob', syncJobSchema);

module.exports = SyncJob;