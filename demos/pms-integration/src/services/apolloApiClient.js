/**
 * Apollo API Client
 * Handles authentication and API calls to the Apollo optical management system
 */
const axios = require('axios');
const moment = require('moment');
const logger = require('../utils/logger');

class ApolloApiClient {
  constructor(config) {
    this.config = config;
    this.baseUrl = config.apiEndpoint;
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.token = null;
    this.tokenExpiry = null;
    
    // Create axios instance with default headers
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    // Add request interceptor for authentication
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // Ensure we have a valid token
        if (!this.token || this.isTokenExpired()) {
          await this.authenticate();
        }
        
        // Add token to request header
        config.headers.Authorization = `Bearer ${this.token}`;
        return config;
      },
      (error) => {
        logger.error('Request error:', error);
        return Promise.reject(error);
      }
    );
    
    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If error is 401 and we haven't already tried to refresh the token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          // Force token refresh
          await this.authenticate();
          
          // Retry the request with new token
          originalRequest.headers.Authorization = `Bearer ${this.token}`;
          return this.axiosInstance(originalRequest);
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * Check if the current token is expired or close to expiring
   * We consider tokens that expire in less than 5 minutes as "expired"
   */
  isTokenExpired() {
    if (!this.tokenExpiry) return true;
    
    const now = moment();
    const expiryTime = moment(this.tokenExpiry);
    const minutesUntilExpiry = expiryTime.diff(now, 'minutes');
    
    return minutesUntilExpiry < 5;
  }
  
  /**
   * Authenticate with Apollo API and get token
   */
  async authenticate() {
    try {
      logger.info('Authenticating with Apollo API');
      
      const response = await axios.post(`${this.baseUrl}/token`, {
        apiKey: this.apiKey,
        apiSecret: this.apiSecret
      });
      
      if (response.data && response.data.token) {
        this.token = response.data.token;
        
        // Calculate token expiry (typical tokens last 1 hour)
        this.tokenExpiry = moment().add(response.data.expiresIn || 3600, 'seconds').toDate();
        
        logger.info('Successfully authenticated with Apollo API');
      } else {
        throw new Error('Invalid authentication response from Apollo API');
      }
    } catch (error) {
      logger.error('Authentication failed:', error.message);
      throw new Error(`Failed to authenticate with Apollo API: ${error.message}`);
    }
  }
  
  /**
   * Get patients from Apollo API
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} - List of patients
   */
  async getPatients(params = {}) {
    try {
      const response = await this.axiosInstance.get('/api/Patients', { params });
      return response.data;
    } catch (error) {
      logger.error('Error fetching patients:', error.message);
      throw new Error(`Failed to fetch patients: ${error.message}`);
    }
  }
  
  /**
   * Get a single patient by ID
   * @param {string} patientId - Patient ID
   * @returns {Promise<Object>} - Patient data
   */
  async getPatientById(patientId) {
    try {
      const response = await this.axiosInstance.get(`/api/Patients/${patientId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching patient ${patientId}:`, error.message);
      throw new Error(`Failed to fetch patient ${patientId}: ${error.message}`);
    }
  }
  
  /**
   * Get prescriptions for a patient
   * @param {string} patientId - Patient ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} - List of prescriptions
   */
  async getPatientPrescriptions(patientId, params = {}) {
    try {
      const response = await this.axiosInstance.get(`/api/Patients/${patientId}/Prescriptions`, { params });
      return response.data;
    } catch (error) {
      logger.error(`Error fetching prescriptions for patient ${patientId}:`, error.message);
      throw new Error(`Failed to fetch prescriptions for patient ${patientId}: ${error.message}`);
    }
  }
  
  /**
   * Get a single prescription by ID
   * @param {string} prescriptionId - Prescription ID
   * @returns {Promise<Object>} - Prescription data
   */
  async getPrescriptionById(prescriptionId) {
    try {
      const response = await this.axiosInstance.get(`/api/Prescriptions/${prescriptionId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching prescription ${prescriptionId}:`, error.message);
      throw new Error(`Failed to fetch prescription ${prescriptionId}: ${error.message}`);
    }
  }
  
  /**
   * Get products (frames) from the Apollo system
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} - List of products
   */
  async getProducts(params = {}) {
    try {
      // Ensure we filter for frames by default
      const queryParams = { 
        ...params,
        type: params.type || 'FRAME'
      };
      
      const response = await this.axiosInstance.get('/api/Products', { params: queryParams });
      return response.data;
    } catch (error) {
      logger.error('Error fetching products:', error.message);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  }
  
  /**
   * Get a single product by ID
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} - Product data
   */
  async getProductById(productId) {
    try {
      const response = await this.axiosInstance.get(`/api/Products/${productId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching product ${productId}:`, error.message);
      throw new Error(`Failed to fetch product ${productId}: ${error.message}`);
    }
  }
}

module.exports = ApolloApiClient;
