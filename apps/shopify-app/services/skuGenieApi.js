const axios = require('axios');
const logger = require('../utils/logger');

class SKUGenieApiService {
  constructor() {
    this.baseUrl = process.env.SKU_GENIE_API_URL;
    this.apiKey = process.env.SKU_GENIE_API_KEY;
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds
    });
    
    // Add response interceptor for logging
    this.client.interceptors.response.use(
      response => response,
      error => {
        const { response } = error;
        if (response) {
          logger.error(`SKU-Genie API Error: ${response.status} - ${JSON.stringify(response.data)}`);
        } else {
          logger.error(`SKU-Genie API Error: ${error.message}`);
        }
        return Promise.reject(error);
      }
    );
  }
  
  // Client operations
  async getClient(clientId) {
    try {
      const response = await this.client.get(`/clients/${clientId}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to get client ${clientId}: ${error.message}`);
      throw error;
    }
  }
  
  async createClient(clientData) {
    try {
      const response = await this.client.post('/clients', clientData);
      return response.data;
    } catch (error) {
      logger.error(`Failed to create client: ${error.message}`);
      throw error;
    }
  }
  
  // Product operations
  async getProducts(clientId, options = {}) {
    try {
      const params = { client_id: clientId, ...options };
      const response = await this.client.get('/products', { params });
      return response.data;
    } catch (error) {
      logger.error(`Failed to get products for client ${clientId}: ${error.message}`);
      throw error;
    }
  }
  
  async getProduct(clientId, productId) {
    try {
      const response = await this.client.get(`/products/${productId}`, {
        params: { client_id: clientId }
      });
      return response.data;
    } catch (error) {
      logger.error(`Failed to get product ${productId} for client ${clientId}: ${error.message}`);
      throw error;
    }
  }
  
  async createProduct(clientId, productData) {
    try {
      const response = await this.client.post('/products', {
        client_id: clientId,
        ...productData
      });
      return response.data;
    } catch (error) {
      logger.error(`Failed to create product for client ${clientId}: ${error.message}`);
      throw error;
    }
  }
  
  async updateProduct(clientId, productId, productData) {
    try {
      const response = await this.client.put(`/products/${productId}`, {
        client_id: clientId,
        ...productData
      });
      return response.data;
    } catch (error) {
      logger.error(`Failed to update product ${productId} for client ${clientId}: ${error.message}`);
      throw error;
    }
  }
  
  async deleteProduct(clientId, productId) {
    try {
      const response = await this.client.delete(`/products/${productId}`, {
        params: { client_id: clientId }
      });
      return response.data;
    } catch (error) {
      logger.error(`Failed to delete product ${productId} for client ${clientId}: ${error.message}`);
      throw error;
    }
  }
  
  // Collection operations
  async getCollections(clientId, options = {}) {
    try {
      const params = { client_id: clientId, ...options };
      const response = await this.client.get('/collections', { params });
      return response.data;
    } catch (error) {
      logger.error(`Failed to get collections for client ${clientId}: ${error.message}`);
      throw error;
    }
  }
  
  async getCollection(clientId, collectionId) {
    try {
      const response = await this.client.get(`/collections/${collectionId}`, {
        params: { client_id: clientId }
      });
      return response.data;
    } catch (error) {
      logger.error(`Failed to get collection ${collectionId} for client ${clientId}: ${error.message}`);
      throw error;
    }
  }
  
  async createCollection(clientId, collectionData) {
    try {
      const response = await this.client.post('/collections', {
        client_id: clientId,
        ...collectionData
      });
      return response.data;
    } catch (error) {
      logger.error(`Failed to create collection for client ${clientId}: ${error.message}`);
      throw error;
    }
  }
  
  async updateCollection(clientId, collectionId, collectionData) {
    try {
      const response = await this.client.put(`/collections/${collectionId}`, {
        client_id: clientId,
        ...collectionData
      });
      return response.data;
    } catch (error) {
      logger.error(`Failed to update collection ${collectionId} for client ${clientId}: ${error.message}`);
      throw error;
    }
  }
  
  async deleteCollection(clientId, collectionId) {
    try {
      const response = await this.client.delete(`/collections/${collectionId}`, {
        params: { client_id: clientId }
      });
      return response.data;
    } catch (error) {
      logger.error(`Failed to delete collection ${collectionId} for client ${clientId}: ${error.message}`);
      throw error;
    }
  }
  
  // Inventory operations
  async getInventory(clientId, productId) {
    try {
      const response = await this.client.get(`/inventory`, {
        params: { client_id: clientId, product_id: productId }
      });
      return response.data;
    } catch (error) {
      logger.error(`Failed to get inventory for product ${productId}, client ${clientId}: ${error.message}`);
      throw error;
    }
  }
  
  async updateInventory(clientId, inventoryData) {
    try {
      const response = await this.client.put('/inventory', {
        client_id: clientId,
        ...inventoryData
      });
      return response.data;
    } catch (error) {
      logger.error(`Failed to update inventory for client ${clientId}: ${error.message}`);
      throw error;
    }
  }
  
  // Analytics operations
  async getAnalytics(clientId, startDate, endDate, metrics = []) {
    try {
      const response = await this.client.get('/analytics', {
        params: { 
          client_id: clientId,
          start_date: startDate,
          end_date: endDate,
          metrics: metrics.join(',')
        }
      });
      return response.data;
    } catch (error) {
      logger.error(`Failed to get analytics for client ${clientId}: ${error.message}`);
      throw error;
    }
  }
  
  // Data source operations
  async createDataSource(clientId, sourceData) {
    try {
      const response = await this.client.post('/data-sources', {
        client_id: clientId,
        ...sourceData
      });
      return response.data;
    } catch (error) {
      logger.error(`Failed to create data source for client ${clientId}: ${error.message}`);
      throw error;
    }
  }
  
  async updateDataSource(clientId, sourceId, sourceData) {
    try {
      const response = await this.client.put(`/data-sources/${sourceId}`, {
        client_id: clientId,
        ...sourceData
      });
      return response.data;
    } catch (error) {
      logger.error(`Failed to update data source ${sourceId} for client ${clientId}: ${error.message}`);
      throw error;
    }
  }
  
  // Import operations
  async createImportJob(clientId, sourceId, options = {}) {
    try {
      const response = await this.client.post('/imports', {
        client_id: clientId,
        source_id: sourceId,
        ...options
      });
      return response.data;
    } catch (error) {
      logger.error(`Failed to create import job for client ${clientId}, source ${sourceId}: ${error.message}`);
      throw error;
    }
  }
  
  async getImportJob(jobId) {
    try {
      const response = await this.client.get(`/imports/${jobId}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to get import job ${jobId}: ${error.message}`);
      throw error;
    }
  }
  
  // Batch operations
  async batchCreateProducts(clientId, products) {
    try {
      const response = await this.client.post('/products/batch', {
        client_id: clientId,
        products
      });
      return response.data;
    } catch (error) {
      logger.error(`Failed to batch create products for client ${clientId}: ${error.message}`);
      throw error;
    }
  }
  
  async batchUpdateProducts(clientId, products) {
    try {
      const response = await this.client.put('/products/batch', {
        client_id: clientId,
        products
      });
      return response.data;
    } catch (error) {
      logger.error(`Failed to batch update products for client ${clientId}: ${error.message}`);
      throw error;
    }
  }
}

// Create singleton instance
const skuGenieApi = new SKUGenieApiService();

module.exports = skuGenieApi;