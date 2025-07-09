class BaseAdapter {
    constructor(credentials) {
        if (!credentials) {
            throw new Error('Credentials are required to initialize an adapter.');
        }
        this.credentials = credentials;
    }

    // Product Synchronization
    async getProducts(options = {}) {
        throw new Error('getProducts() not implemented');
    }

    async getProduct(id) {
        throw new Error('getProduct() not implemented');
    }

    async createProduct(productData) {
        throw new Error('createProduct() not implemented');
    }

    async updateProduct(id, productData) {
        throw new Error('updateProduct() not implemented');
    }

    // Order Management
    async getOrders(options = {}) {
        throw new Error('getOrders() not implemented');
    }

    async getOrder(id) {
        throw new Error('getOrder() not implemented');
    }

    // Webhook Management
    async createWebhook(topic, url) {
        throw new Error('createWebhook() not implemented');
    }

    async deleteWebhook(id) {
        throw new Error('deleteWebhook() not implemented');
    }

    // Data Mapping
    mapToStandardProduct(platformProduct) {
        throw new Error('mapToStandardProduct() not implemented');
    }

    mapFromStandardProduct(standardProduct) {
        throw new Error('mapFromStandardProduct() not implemented');
    }

    // Generic proxy for extensibility
    async proxyRequest(method, path, data) {
        throw new Error('proxyRequest() not implemented');
    }
}

module.exports = BaseAdapter;