import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface VaraiClientConfig {
  apiUrl: string;
  clientId: string;
  clientSecret: string;
}

/**
 * Base HTTP client for VARAi API calls
 */
export class VaraiClient {
  private client: AxiosInstance;
  private apiUrl: string;
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tenantId: string | null = null;

  constructor(config: VaraiClientConfig) {
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
  getApiUrl(): string {
    return this.apiUrl;
  }

  /**
   * Get the client ID
   */
  getClientId(): string {
    return this.clientId;
  }

  /**
   * Set the access token for authenticated requests
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Clear the access token
   */
  clearAccessToken(): void {
    this.accessToken = null;
  }

  /**
   * Set the tenant ID for multi-tenant requests
   */
  setTenantId(tenantId: string): void {
    this.tenantId = tenantId;
  }

  /**
   * Get the current tenant ID
   */
  getTenantId(): string | null {
    return this.tenantId;
  }

  /**
   * Clear the tenant ID
   */
  clearTenantId(): void {
    this.tenantId = null;
  }

  /**
   * Perform a GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  /**
   * Perform a POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  /**
   * Perform a PUT request
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  /**
   * Perform a PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data, config);
    return response.data;
  }

  /**
   * Perform a DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }
}
