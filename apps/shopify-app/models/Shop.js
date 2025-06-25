const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ShopSchema = new Schema({
  shopDomain: {
    type: String,
    required: true,
    unique: true,
  },
  accessToken: {
    type: String,
    required: true,
  },
  scope: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  shopName: {
    type: String,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  contactName: {
    type: String,
  },
  plan: {
    type: String,
  },
  shopId: {
    type: String,
  },
  settings: {
    syncDirection: {
      type: String,
      enum: ['shopify_to_skugenie', 'skugenie_to_shopify', 'bidirectional'],
      default: 'shopify_to_skugenie',
    },
    productMapping: {
      type: Map,
      of: String,
      default: new Map([
        ['title', 'title'],
        ['description', 'description'],
        ['vendor', 'brand'],
        ['productType', 'frameShape'],
        ['tags', 'tags'],
      ]),
    },
    syncFrequency: {
      type: String,
      enum: ['realtime', 'hourly', 'daily'],
      default: 'realtime',
    },
    syncEnabled: {
      type: Boolean,
      default: true,
    },
  },
  clientId: {
    type: String,
  },
  // Client Portal Integration Fields
  clientPortalClientId: {
    type: String,
  },
  clientPortalAccountId: {
    type: String,
  },
  clientPortalSettings: {
    reportsEnabled: {
      type: Boolean,
      default: true,
    },
    reportFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly',
    },
    dashboardEnabled: {
      type: Boolean,
      default: true,
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamps on save
ShopSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Find shop by Shopify ID
ShopSchema.statics.findByShopifyId = function (shopDomain, shopifyId) {
  return this.findOne({
    shopDomain,
    shopId: shopifyId,
  });
};

// Find active shops
ShopSchema.statics.findActive = function () {
  return this.find({ isActive: true });
};

const Shop = mongoose.model('Shop', ShopSchema);

module.exports = Shop;