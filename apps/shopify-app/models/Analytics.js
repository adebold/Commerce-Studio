const mongoose = require('mongoose');

const syncMetricsSchema = new mongoose.Schema({
  shopDomain: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  syncJobs: {
    total: {
      type: Number,
      default: 0,
    },
    completed: {
      type: Number,
      default: 0,
    },
    failed: {
      type: Number,
      default: 0,
    },
    cancelled: {
      type: Number,
      default: 0,
    },
    avgDuration: {
      type: Number, // in milliseconds
      default: 0,
    },
  },
  resources: {
    products: {
      synced: {
        type: Number,
        default: 0,
      },
      failed: {
        type: Number,
        default: 0,
      },
      created: {
        type: Number,
        default: 0,
      },
      updated: {
        type: Number,
        default: 0,
      },
      deleted: {
        type: Number,
        default: 0,
      },
    },
    collections: {
      synced: {
        type: Number,
        default: 0,
      },
      failed: {
        type: Number,
        default: 0,
      },
      created: {
        type: Number,
        default: 0,
      },
      updated: {
        type: Number,
        default: 0,
      },
      deleted: {
        type: Number,
        default: 0,
      },
    },
    inventory: {
      synced: {
        type: Number,
        default: 0,
      },
      failed: {
        type: Number,
        default: 0,
      },
      updated: {
        type: Number,
        default: 0,
      },
    },
  },
  conflicts: {
    total: {
      type: Number,
      default: 0,
    },
    resolved: {
      type: Number,
      default: 0,
    },
    ignored: {
      type: Number,
      default: 0,
    },
    autoResolved: {
      type: Number,
      default: 0,
    },
    byType: {
      data_mismatch: {
        type: Number,
        default: 0,
      },
      deletion_conflict: {
        type: Number,
        default: 0,
      },
      creation_conflict: {
        type: Number,
        default: 0,
      },
      inventory_conflict: {
        type: Number,
        default: 0,
      },
    },
  },
  apiUsage: {
    shopify: {
      requests: {
        type: Number,
        default: 0,
      },
      errors: {
        type: Number,
        default: 0,
      },
      avgResponseTime: {
        type: Number, // in milliseconds
        default: 0,
      },
    },
    skuGenie: {
      requests: {
        type: Number,
        default: 0,
      },
      errors: {
        type: Number,
        default: 0,
      },
      avgResponseTime: {
        type: Number, // in milliseconds
        default: 0,
      },
    },
  },
  webhooks: {
    received: {
      type: Number,
      default: 0,
    },
    processed: {
      type: Number,
      default: 0,
    },
    failed: {
      type: Number,
      default: 0,
    },
    byType: {
      products_create: {
        type: Number,
        default: 0,
      },
      products_update: {
        type: Number,
        default: 0,
      },
      products_delete: {
        type: Number,
        default: 0,
      },
      collections_create: {
        type: Number,
        default: 0,
      },
      collections_update: {
        type: Number,
        default: 0,
      },
      collections_delete: {
        type: Number,
        default: 0,
      },
      inventory_levels_update: {
        type: Number,
        default: 0,
      },
      app_uninstalled: {
        type: Number,
        default: 0,
      },
    },
  },
}, {
  timestamps: true,
});

// Indexes
syncMetricsSchema.index({ shopDomain: 1, date: 1 }, { unique: true });
syncMetricsSchema.index({ date: 1 });

// Methods
syncMetricsSchema.methods.incrementSyncJob = function(status, duration = null) {
  this.syncJobs.total += 1;
  
  if (status === 'completed') {
    this.syncJobs.completed += 1;
    
    // Update average duration
    if (duration) {
      const totalDuration = this.syncJobs.avgDuration * (this.syncJobs.completed - 1) + duration;
      this.syncJobs.avgDuration = totalDuration / this.syncJobs.completed;
    }
  } else if (status === 'failed') {
    this.syncJobs.failed += 1;
  } else if (status === 'cancelled') {
    this.syncJobs.cancelled += 1;
  }
  
  return this;
};

syncMetricsSchema.methods.incrementResource = function(resourceType, action) {
  if (!this.resources[resourceType]) {
    return this;
  }
  
  if (action === 'synced' || action === 'failed') {
    this.resources[resourceType][action] += 1;
  } else if (action === 'created' || action === 'updated' || action === 'deleted') {
    this.resources[resourceType][action] += 1;
    this.resources[resourceType].synced += 1;
  }
  
  return this;
};

syncMetricsSchema.methods.incrementConflict = function(type, resolution = null) {
  this.conflicts.total += 1;
  
  if (this.conflicts.byType[type]) {
    this.conflicts.byType[type] += 1;
  }
  
  if (resolution === 'resolved') {
    this.conflicts.resolved += 1;
  } else if (resolution === 'ignored') {
    this.conflicts.ignored += 1;
  } else if (resolution === 'auto') {
    this.conflicts.autoResolved += 1;
  }
  
  return this;
};

syncMetricsSchema.methods.incrementApiUsage = function(api, success, responseTime = null) {
  if (!this.apiUsage[api]) {
    return this;
  }
  
  this.apiUsage[api].requests += 1;
  
  if (!success) {
    this.apiUsage[api].errors += 1;
  }
  
  if (responseTime) {
    const totalTime = this.apiUsage[api].avgResponseTime * (this.apiUsage[api].requests - 1) + responseTime;
    this.apiUsage[api].avgResponseTime = totalTime / this.apiUsage[api].requests;
  }
  
  return this;
};

syncMetricsSchema.methods.incrementWebhook = function(type, success) {
  this.webhooks.received += 1;
  
  if (success) {
    this.webhooks.processed += 1;
  } else {
    this.webhooks.failed += 1;
  }
  
  const normalizedType = type.toLowerCase().replace(/\./g, '_');
  if (this.webhooks.byType[normalizedType] !== undefined) {
    this.webhooks.byType[normalizedType] += 1;
  }
  
  return this;
};

// Statics
syncMetricsSchema.statics.getOrCreateForToday = async function(shopDomain) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let metrics = await this.findOne({ shopDomain, date: today });
  
  if (!metrics) {
    metrics = new this({
      shopDomain,
      date: today,
    });
    await metrics.save();
  }
  
  return metrics;
};

syncMetricsSchema.statics.getDateRange = function(shopDomain, startDate, endDate) {
  return this.find({
    shopDomain,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ date: 1 });
};

const SyncMetrics = mongoose.model('SyncMetrics', syncMetricsSchema);

module.exports = SyncMetrics;