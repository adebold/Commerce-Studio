const BaseAdapter = require('../base-adapter');
const WooCommerceClient = require('./client');
const { mapToStandardProduct, mapFromStandardProduct } = require('../../utils/data-mapper');

class WooCommerceAdapter extends BaseAdapter {
    constructor(credentials) {
        super(credentials);
        this.client = new WooCommerceClient(credentials);
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
        const wooCommerceProduct = mapFromStandardProduct(productData);
        const newProduct = await this.client.createProduct(wooCommerceProduct);
        return mapToStandardProduct(newProduct);
    }

    async updateProduct(id, productData) {
        const wooCommerceProduct = mapFromStandardProduct(productData);
        const updatedProduct = await this.client.updateProduct(id, wooCommerceProduct);
        return mapToStandardProduct(updatedProduct);
    }

    async getOrders(options = {}) {
        // Implementation for getting orders from WooCommerce
        return [];
    }

    async getOrder(id) {
        // Implementation for getting a single order from WooCommerce
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

module.exports = WooCommerceAdapter;