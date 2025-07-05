import { ApiError } from './api';
import { CommerceAppsStatus } from '../types/commerce';

export interface MLMetrics {
  modelAccuracy: number;
  validationLoss: number;
  apiResponseTime: number;
  fallbackRate: number;
  embeddingSuccessRate: number;
  styleQueryAccuracy: number;
}

export interface DataPipelineMetrics {
  totalImages: number;
  processedLastHour: number;
  averageQualityScore: number;
  backgroundRemovalSuccess: number;
  totalFrames: number;
  dataFreshness: Date;
}

export interface APIMetrics {
  requestsPerMinute: number;
  averageResponseTime: number;
  errorRate: number;
  availability: number;
  confidenceScores: {
    average: number;
    distribution: number[];
  };
}

export interface BusinessMetrics {
  activeIntegrations: number;
  totalRecommendations: number;
  uniqueUsers: number;
  conversionRate: number;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  storageUsage: number;
  jobSuccessRate: number;
  activeJobs: number;
  lastUpdated: Date;
}

export interface ServiceStatus {
  nvidiaApi: boolean;
  deepseekApi: boolean;
  database: boolean;
  pipeline: boolean;
}

export class MetricsService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  }

  private async fetchMetrics<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}/metrics/${endpoint}`);
      
      if (!response.ok) {
        throw new ApiError(response.status, 'Failed to fetch metrics');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Network error while fetching metrics');
    }
  }

  async getMLMetrics(): Promise<MLMetrics> {
    return this.fetchMetrics<MLMetrics>('ml');
  }

  async getDataPipelineMetrics(): Promise<DataPipelineMetrics> {
    return this.fetchMetrics<DataPipelineMetrics>('pipeline');
  }

  async getAPIMetrics(): Promise<APIMetrics> {
    return this.fetchMetrics<APIMetrics>('api');
  }

  async getBusinessMetrics(): Promise<BusinessMetrics> {
    return this.fetchMetrics<BusinessMetrics>('business');
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    return this.fetchMetrics<SystemMetrics>('system');
  }

  async getServiceStatus(): Promise<ServiceStatus> {
    return this.fetchMetrics<ServiceStatus>('status');
  }

  async getCommerceAppsStatus(): Promise<CommerceAppsStatus> {
    return this.fetchMetrics<CommerceAppsStatus>('commerce');
  }

  // Mock data for development
  getMockData() {
    const now = new Date();
    return {
      ml: {
        modelAccuracy: 0.89,
        validationLoss: 0.23,
        apiResponseTime: 245,
        fallbackRate: 0.05,
        embeddingSuccessRate: 0.97,
        styleQueryAccuracy: 0.85
      },
      pipeline: {
        totalImages: 25000,
        processedLastHour: 150,
        averageQualityScore: 0.88,
        backgroundRemovalSuccess: 0.95,
        totalFrames: 12500,
        dataFreshness: now
      },
      api: {
        requestsPerMinute: 120,
        averageResponseTime: 180,
        errorRate: 0.02,
        availability: 0.998,
        confidenceScores: {
          average: 0.82,
          distribution: [0.1, 0.2, 0.3, 0.25, 0.15]
        }
      },
      business: {
        activeIntegrations: 8,
        totalRecommendations: 50000,
        uniqueUsers: 2500,
        conversionRate: 0.12
      },
      system: {
        cpuUsage: 0.45,
        memoryUsage: 0.68,
        storageUsage: 0.72,
        jobSuccessRate: 0.98,
        activeJobs: 3,
        lastUpdated: now
      },
      status: {
        nvidiaApi: true,
        deepseekApi: true,
        database: true,
        pipeline: true
      },
      commerce: {
        shopify: {
          deploymentStatus: 'online' as const,
          apiResponseTime: 150,
          errorRate: 0.01,
          activeUsers: 1200,
          lastDeployment: now,
          buildStatus: 'success' as const
        },
        woocommerce: {
          deploymentStatus: 'online' as const,
          apiResponseTime: 180,
          errorRate: 0.02,
          activeUsers: 800,
          lastDeployment: now,
          buildStatus: 'success' as const
        },
        bigcommerce: {
          deploymentStatus: 'online' as const,
          apiResponseTime: 165,
          errorRate: 0.015,
          activeUsers: 600,
          lastDeployment: now,
          buildStatus: 'success' as const
        },
        magento: {
          deploymentStatus: 'online' as const,
          apiResponseTime: 200,
          errorRate: 0.025,
          activeUsers: 400,
          lastDeployment: now,
          buildStatus: 'success' as const
        }
      }
    };
  }
}

export const metricsService = new MetricsService();
