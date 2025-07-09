const WooCommerceAPI = require('@woocommerce/woocommerce-rest-api').default;
const logger = require('../../utils/logger');

class WooCommerceClient {
    constructor(credentials) {
        this.client = new WooCommerceAPI({
            url: credentials.url,
            consumerKey: credentials.consumerKey,
            consumerSecret: credentials.consumerSecret,
            version: 'wc/v3'
        });
    }

    async getProducts(options = {}) {
        try {
            const response = await this.client.get('products', options);
            return response.data;
        } catch (error) {
            logger.error('Failed to get products from WooCommerce:', error);
            throw error;
        }
    }

    async getProduct(id) {
        try {
            const response = await this.client.get(`products/${id}`);
            return response.data;
        } catch (error) {
            logger.error(`Failed to get product ${id} from WooCommerce:`, error);
            throw error;
        }
    }

    async createProduct(productData) {
        try {
            const response = await this.client.post('products', productData);
            return response.data;
        } catch (error) {
            logger.error('Failed to create product in WooCommerce:', error);
            throw error;
        }
    }

    async updateProduct(id, productData) {
        try {
            const response = await this.client.put(`products/${id}`, productData);
            return response.data;
        } catch (error) {
            logger.error(`Failed to update product ${id} in WooCommerce:`, error);
            throw error;
        }
    }

    async createWebhook(topic, address) {
        try {
            const response = await this.client.post('webhooks', {
                name: `Commerce Studio: ${topic}`,
                topic: `action.${topic}`,
                delivery_url: address
            });
            return response.data;
        } catch (error) {
            logger.error('Failed to create webhook in WooCommerce:', error);
            throw error;
        }
    }

    async deleteWebhook(id) {
        try {
            const response = await this.client.delete(`webhooks/${id}`, { force: true });
            return response.data;
        } catch (error) {
            logger.error(`Failed to delete webhook ${id} in WooCommerce:`, error);
            throw error;
        }
    }

    async proxyRequest(method, path, data) {
        try {
            const response = await this.client.request({
                method,
                path,
                data
            });
            return response.data;
        } catch (error) {
            logger.error(`Failed to proxy request to WooCommerce: ${method} ${path}`, error);
            throw error;
        }
    }
}

module.exports = WooCommerceClient;