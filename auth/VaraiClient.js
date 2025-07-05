import axios from 'axios';

/**
 * Base HTTP client for VARAi API calls
 */
export class VaraiClient {
  constructor(config) {
    this.apiUrl = config.apiUrl;
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;

    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Client-ID': this.clientId
      }
    });

    // Add request interceptor to include auth token if available
    this.client.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${this.accessToken}`;
      }
      
      // Add tenant ID to params if available
      if (this.tenantId && config.params) {
        config.params.tenant_id = this.tenantId;
      } else if (this.tenantId) {
        config.params = { tenant_id: this.tenantId };
      }
      
      return config;
    });
  }

  /**
   * Get the API URL
   */
  getApiUrl() {
    return this.apiUrl;
  }

  /**
   * Get the client ID
   */
  getClientId() {
    return this.clientId;
  }

  /**
   * Set the access token for authenticated requests
   */
  setAccessToken(token) {
    this.accessToken = token;
  }

  /**
   * Clear the access token
   */
  clearAccessToken() {
    this.accessToken = null;
  }

  /**
   * Set the tenant ID for multi-tenant requests
   */
  setTenantId(tenantId) {
    this.tenantId = tenantId;
  }

  /**
   * Get the current tenant ID
   */
  getTenantId() {
    return this.tenantId;
  }

  /**
   * Clear the tenant ID
   */
  clearTenantId() {
    this.tenantId = null;
  }

  /**
   * Perform a GET request
   */
  async get(url, config) {
    const response = await this.client.get(url, config);
    return response.data;
  }

  /**
   * Perform a POST request
   */
  async post(url, data, config) {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  /**
   * Perform a PUT request
   */
  async put(url, data, config) {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  /**
   * Perform a PATCH request
   */
  async patch(url, data, config) {
    const response = await this.client.patch(url, data, config);
    return response.data;
  }

  /**
   * Perform a DELETE request
   */
  async delete(url, config) {
    const response = await this.client.delete(url, config);
    return response.data;
  }
}