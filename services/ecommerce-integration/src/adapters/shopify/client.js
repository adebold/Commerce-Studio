const Shopify = require('shopify-api-node');
const logger = require('../../utils/logger');

class ShopifyClient {
    constructor(credentials) {
        this.client = new Shopify({
            shopName: credentials.shopName,
            accessToken: credentials.accessToken,
            apiVersion: '2023-10'
        });
    }

    async getProducts(options = {}) {
        try {
            return await this.client.product.list(options);
        } catch (error) {
            logger.error('Failed to get products from Shopify:', error);
            throw error;
        }
    }

    async getProduct(id) {
        try {
            return await this.client.product.get(id);
        } catch (error) {
            logger.error(`Failed to get product ${id} from Shopify:`, error);
            throw error;
        }
    }

    async createProduct(productData) {
        try {
            return await this.client.product.create(productData);
        } catch (error) {
            logger.error('Failed to create product in Shopify:', error);
            throw error;
        }
    }

    async updateProduct(id, productData) {
        try {
            return await this.client.product.update(id, productData);
        } catch (error) {
            logger.error(`Failed to update product ${id} in Shopify:`, error);
            throw error;
        }
    }

    async createWebhook(topic, address) {
        try {
            return await this.client.webhook.create({
                topic,
                address,
                format: 'json'
            });
        } catch (error) {
            logger.error('Failed to create webhook in Shopify:', error);
            throw error;
        }
    }

    async deleteWebhook(id) {
        try {
            return await this.client.webhook.delete(id);
        } catch (error) {
            logger.error(`Failed to delete webhook ${id} in Shopify:`, error);
            throw error;
        }
    }

    async proxyRequest(method, path, data) {
        try {
            return await this.client.request({
                method,
                path,
                data
            });
        } catch (error) {
            logger.error(`Failed to proxy request to Shopify: ${method} ${path}`, error);
            throw error;
        }
    }
}

module.exports = ShopifyClient;