/**
 * Integration Health Check
 * 
 * This module provides health check functionality for e-commerce platform integrations.
 * It monitors the health of integrations and reports issues.
 */

import axios, { AxiosInstance } from 'axios';
import { EventEmitter } from 'events';
import dashboard, { 
  MetricType, 
  MetricCategory, 
  PlatformType, 
  OperationType, 
  createMetric 
} from './integration-dashboard';

// Define health status
export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  UNKNOWN = 'unknown'
}

// Define health check result
export interface HealthCheckResult {
  status: HealthStatus;
  platform: PlatformType;
  timestamp: number;
  latency?: number;
  message?: string;
  details?: Record<string, any>;
}

// Define health check options
export interface HealthCheckOptions {
  platform: PlatformType;
  endpoint: string;
  interval?: number;
  timeout?: number;
  headers?: Record<string, string>;
  validateResponse?: (response: any) => boolean;
}

// Define health check interface
export interface HealthCheck {
  platform: PlatformType;
  status: HealthStatus;
  lastChecked: number;
  start(): void;
  stop(): void;
  check(): Promise<HealthCheckResult>;
  on(event: string, listener: (...args: any[]) => void): void;
}

/**
 * Base health check implementation
 */
export abstract class BaseHealthCheck extends EventEmitter implements HealthCheck {
  platform: PlatformType;
  status: HealthStatus = HealthStatus.UNKNOWN;
  lastChecked: number = 0;
  protected interval: number;
  protected timeout: number;
  protected timer: NodeJS.Timeout | null = null;
  protected client: AxiosInstance;
  protected endpoint: string;
  protected headers: Record<string, string>;
  protected validateResponse: (response: any) => boolean;

  constructor(options: HealthCheckOptions) {
    super();
    this.platform = options.platform;
    this.endpoint = options.endpoint;
    this.interval = options.interval || 60000; // Default: 1 minute
    this.timeout = options.timeout || 10000; // Default: 10 seconds
    this.headers = options.headers || {};
    this.validateResponse = options.validateResponse || (() => true);
    
    // Create HTTP client
    this.client = axios.create({
      timeout: this.timeout,
      headers: this.headers
    });
  }

  /**
   * Start health check monitoring
   */
  start(): void {
    if (!this.timer) {
      // Perform initial check
      this.check().catch(error => {
        console.error(`Error performing initial health check for ${this.platform}:`, error);
      });
      
      // Schedule periodic checks
      this.timer = setInterval(() => {
        this.check().catch(error => {
          console.error(`Error performing health check for ${this.platform}:`, error);
        });
      }, this.interval);
    }
  }

  /**
   * Stop health check monitoring
   */
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Perform health check
   */
  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    let status = HealthStatus.UNKNOWN;
    let message = '';
    let details = {};
    let latency = 0;
    
    try {
      // Perform platform-specific health check
      const result = await this.performCheck();
      
      // Calculate latency
      latency = Date.now() - startTime;
      
      // Update status
      status = result.status;
      message = result.message || '';
      details = result.details || {};
      
      // Record metrics
      this.recordMetrics(status, latency);
      
    } catch (error) {
      // Calculate latency even for failed requests
      latency = Date.now() - startTime;
      
      // Set status to unhealthy
      status = HealthStatus.UNHEALTHY;
      message = error instanceof Error ? error.message : 'Unknown error';
      
      // Record error metrics
      this.recordErrorMetrics(latency, message);
    }
    
    // Update status and last checked timestamp
    this.status = status;
    this.lastChecked = Date.now();
    
    // Create result
    const result: HealthCheckResult = {
      status,
      platform: this.platform,
      timestamp: this.lastChecked,
      latency,
      message,
      details
    };
    
    // Emit health check event
    this.emit('healthCheck', result);
    
    // Emit status change event if status changed
    if (status !== this.status) {
      this.emit('statusChange', {
        platform: this.platform,
        previousStatus: this.status,
        currentStatus: status,
        timestamp: this.lastChecked
      });
    }
    
    return result;
  }

  /**
   * Record health check metrics
   * @param status Health status
   * @param latency Response latency
   */
  protected recordMetrics(status: HealthStatus, latency: number): void {
    // Record latency metric
    dashboard.addMetric(createMetric(
      'integration_health_check_latency',
      MetricType.GAUGE,
      MetricCategory.PERFORMANCE,
      this.platform,
      OperationType.AUTHENTICATION,
      latency,
      { status }
    ));
    
    // Record status metric (1 for healthy, 0 for unhealthy)
    dashboard.addMetric(createMetric(
      'integration_health_check_status',
      MetricType.GAUGE,
      MetricCategory.HEALTH,
      this.platform,
      OperationType.AUTHENTICATION,
      status === HealthStatus.HEALTHY ? 1 : 0,
      { status }
    ));
  }

  /**
   * Record error metrics
   * @param latency Response latency
   * @param errorMessage Error message
   */
  protected recordErrorMetrics(latency: number, errorMessage: string): void {
    // Record error metric
    dashboard.addMetric(createMetric(
      'integration_health_check_error',
      MetricType.COUNTER,
      MetricCategory.ERROR,
      this.platform,
      OperationType.AUTHENTICATION,
      1,
      { error: errorMessage }
    ));
    
    // Record latency metric for failed requests
    dashboard.addMetric(createMetric(
      'integration_health_check_error_latency',
      MetricType.GAUGE,
      MetricCategory.PERFORMANCE,
      this.platform,
      OperationType.AUTHENTICATION,
      latency,
      { error: errorMessage }
    ));
  }

  /**
   * Perform platform-specific health check
   */
  protected abstract performCheck(): Promise<HealthCheckResult>;
}

/**
 * Shopify health check implementation
 */
export class ShopifyHealthCheck extends BaseHealthCheck {
  constructor(options: Omit<HealthCheckOptions, 'platform'>) {
    super({
      ...options,
      platform: PlatformType.SHOPIFY
    });
  }

  protected async performCheck(): Promise<HealthCheckResult> {
    try {
      // Make request to Shopify API
      const response = await this.client.get(this.endpoint);
      
      // Validate response
      const isValid = response.status === 200 && this.validateResponse(response.data);
      
      // Determine status
      const status = isValid ? HealthStatus.HEALTHY : HealthStatus.DEGRADED;
      
      return {
        status,
        platform: this.platform,
        timestamp: Date.now(),
        message: isValid ? 'Shopify API is healthy' : 'Shopify API response validation failed',
        details: {
          statusCode: response.status,
          responseTime: response.headers['x-shopify-response-time']
        }
      };
    } catch (error) {
      // Handle specific error cases
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with an error status code
          return {
            status: HealthStatus.DEGRADED,
            platform: this.platform,
            timestamp: Date.now(),
            message: `Shopify API returned error: ${error.response.status} ${error.response.statusText}`,
            details: {
              statusCode: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data
            }
          };
        } else if (error.request) {
          // Request was made but no response received
          return {
            status: HealthStatus.UNHEALTHY,
            platform: this.platform,
            timestamp: Date.now(),
            message: 'No response received from Shopify API',
            details: {
              request: error.request
            }
          };
        }
      }
      
      // Generic error
      throw error;
    }
  }
}

/**
 * Magento health check implementation
 */
export class MagentoHealthCheck extends BaseHealthCheck {
  constructor(options: Omit<HealthCheckOptions, 'platform'>) {
    super({
      ...options,
      platform: PlatformType.MAGENTO
    });
  }

  protected async performCheck(): Promise<HealthCheckResult> {
    try {
      // Make request to Magento API
      const response = await this.client.get(this.endpoint);
      
      // Validate response
      const isValid = response.status === 200 && this.validateResponse(response.data);
      
      // Determine status
      const status = isValid ? HealthStatus.HEALTHY : HealthStatus.DEGRADED;
      
      return {
        status,
        platform: this.platform,
        timestamp: Date.now(),
        message: isValid ? 'Magento API is healthy' : 'Magento API response validation failed',
        details: {
          statusCode: response.status
        }
      };
    } catch (error) {
      // Handle specific error cases
      if (axios.isAxiosError(error) && error.response) {
        return {
          status: HealthStatus.DEGRADED,
          platform: this.platform,
          timestamp: Date.now(),
          message: `Magento API returned error: ${error.response.status}`,
          details: {
            statusCode: error.response.status,
            data: error.response.data
          }
        };
      }
      
      // Generic error
      throw error;
    }
  }
}

/**
 * WooCommerce health check implementation
 */
export class WooCommerceHealthCheck extends BaseHealthCheck {
  constructor(options: Omit<HealthCheckOptions, 'platform'>) {
    super({
      ...options,
      platform: PlatformType.WOOCOMMERCE
    });
  }

  protected async performCheck(): Promise<HealthCheckResult> {
    try {
      // Make request to WooCommerce API
      const response = await this.client.get(this.endpoint);
      
      // Validate response
      const isValid = response.status === 200 && this.validateResponse(response.data);
      
      // Determine status
      const status = isValid ? HealthStatus.HEALTHY : HealthStatus.DEGRADED;
      
      return {
        status,
        platform: this.platform,
        timestamp: Date.now(),
        message: isValid ? 'WooCommerce API is healthy' : 'WooCommerce API response validation failed',
        details: {
          statusCode: response.status
        }
      };
    } catch (error) {
      // Handle specific error cases
      if (axios.isAxiosError(error) && error.response) {
        return {
          status: HealthStatus.DEGRADED,
          platform: this.platform,
          timestamp: Date.now(),
          message: `WooCommerce API returned error: ${error.response.status}`,
          details: {
            statusCode: error.response.status,
            data: error.response.data
          }
        };
      }
      
      // Generic error
      throw error;
    }
  }
}

/**
 * BigCommerce health check implementation
 */
export class BigCommerceHealthCheck extends BaseHealthCheck {
  constructor(options: Omit<HealthCheckOptions, 'platform'>) {
    super({
      ...options,
      platform: PlatformType.BIGCOMMERCE
    });
  }

  protected async performCheck(): Promise<HealthCheckResult> {
    try {
      // Make request to BigCommerce API
      const response = await this.client.get(this.endpoint);
      
      // Validate response
      const isValid = response.status === 200 && this.validateResponse(response.data);
      
      // Determine status
      const status = isValid ? HealthStatus.HEALTHY : HealthStatus.DEGRADED;
      
      return {
        status,
        platform: this.platform,
        timestamp: Date.now(),
        message: isValid ? 'BigCommerce API is healthy' : 'BigCommerce API response validation failed',
        details: {
          statusCode: response.status,
          rateLimit: {
            remaining: response.headers['x-rate-limit-requests-left'],
            limit: response.headers['x-rate-limit-requests-quota'],
            resetTime: response.headers['x-rate-limit-time-reset-ms']
          }
        }
      };
    } catch (error) {
      // Handle specific error cases
      if (axios.isAxiosError(error) && error.response) {
        // Check for rate limiting
        if (error.response.status === 429) {
          return {
            status: HealthStatus.DEGRADED,
            platform: this.platform,
            timestamp: Date.now(),
            message: 'BigCommerce API rate limit exceeded',
            details: {
              statusCode: 429,
              rateLimit: {
                resetTime: error.response.headers['x-rate-limit-time-reset-ms']
              }
            }
          };
        }
        
        return {
          status: HealthStatus.DEGRADED,
          platform: this.platform,
          timestamp: Date.now(),
          message: `BigCommerce API returned error: ${error.response.status}`,
          details: {
            statusCode: error.response.status,
            data: error.response.data
          }
        };
      }
      
      // Generic error
      throw error;
    }
  }
}

/**
 * Create a health check for the specified platform
 * @param platform Platform type
 * @param options Health check options
 * @returns Health check instance
 */
export function createHealthCheck(
  platform: PlatformType,
  options: Omit<HealthCheckOptions, 'platform'>
): HealthCheck {
  switch (platform) {
    case PlatformType.SHOPIFY:
      return new ShopifyHealthCheck(options);
    case PlatformType.MAGENTO:
      return new MagentoHealthCheck(options);
    case PlatformType.WOOCOMMERCE:
      return new WooCommerceHealthCheck(options);
    case PlatformType.BIGCOMMERCE:
      return new BigCommerceHealthCheck(options);
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

// Export health check factory
export default createHealthCheck;