const BaseAdapter = require('../base-adapter');
const ShopifyClient = require('./client');
const { mapToStandardProduct, mapFromStandardProduct } = require('../../utils/data-mapper');

class ShopifyAdapter extends BaseAdapter {
    constructor(credentials) {
        super(credentials);
        this.client = new ShopifyClient(credentials);
    }

    async getProducts(options = {}) {
        const products = await this.client.getProducts(options);
        return products.map(mapToStandardProduct);
    }

    async getProduct(id) {
        const product = await this.client.getProduct(id);
        return mapToStandardProduct(product);
    }

    async createProduct(productData) {
        const shopifyProduct = mapFromStandardProduct(productData);
        const newProduct = await this.client.createProduct(shopifyProduct);
        return mapToStandardProduct(newProduct);
    }

    async updateProduct(id, productData) {
        const shopifyProduct = mapFromStandardProduct(productData);
        const updatedProduct = await this.client.updateProduct(id, shopifyProduct);
        return mapToStandardProduct(updatedProduct);
    }

    async getOrders(options = {}) {
        // Implementation for getting orders from Shopify
        return [];
    }

    async getOrder(id) {
        // Implementation for getting a single order from Shopify
        return {};
    }

    async createWebhook(topic, url) {
        return await this.client.createWebhook(topic, url);
    }

    async deleteWebhook(id) {
        return await this.client.deleteWebhook(id);
    }

    async proxyRequest(method, path, data) {
        return await this.client.proxyRequest(method, path, data);
    }
}

module.exports = ShopifyAdapter;