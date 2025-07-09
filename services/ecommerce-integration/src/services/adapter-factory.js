const logger = require('../utils/logger');
const { getTenantCredentials } = require('./credential-manager');
const ShopifyAdapter = require('../adapters/shopify');
const WooCommerceAdapter = require('../adapters/woocommerce');

const adapters = {
    shopify: ShopifyAdapter,
    woocommerce: WooCommerceAdapter,
};

const activeAdapters = new Map();

const getAdapter = async (tenantId, platform) => {
    const cacheKey = `${tenantId}:${platform}`;

    if (activeAdapters.has(cacheKey)) {
        return activeAdapters.get(cacheKey);
    }

    const AdapterClass = adapters[platform];
    if (!AdapterClass) {
        throw new Error(`Unsupported platform: ${platform}`);
    }

    try {
        const credentials = await getTenantCredentials(tenantId, platform);
        const adapter = new AdapterClass(credentials);
        
        activeAdapters.set(cacheKey, adapter);
        logger.info(`Created new adapter for tenant ${tenantId} and platform ${platform}`);
        
        return adapter;

    } catch (error) {
        logger.error(`Failed to create adapter for tenant ${tenantId}:`, error);
        throw error;
    }
};

module.exports = { getAdapter };