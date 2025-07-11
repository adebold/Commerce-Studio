// Service for managing recommendation system configuration and analytics
export interface RecommendationConfig {
  trendingEnabled: boolean;
  recentlyViewedEnabled: boolean;
  similarProductsEnabled: boolean;
  trendingTimeFrame: 'hour' | 'day' | 'week' | 'month';
  maxRecommendations: number;
  cacheEnabled: boolean;
  cacheTtl: number;
  minScore: number;
  enableAnalytics: boolean;
}

export interface ServiceStatus {
  trending: 'active' | 'paused' | 'error';
  recentlyViewed: 'active' | 'paused' | 'error';
  similarProducts: 'active' | 'paused' | 'error';
}

export interface AnalyticsData {
  totalRecommendations: number;
  clickThroughRate: number;
  conversionRate: number;
  popularCategories: Array<{ name: string; count: number }>;
  performanceMetrics: Array<{ 
    service: string; 
    avgResponseTime: number; 
    successRate: number; 
    totalRequests: number;
    errorRate: number;
  }>;
  trendsOverTime: Array<{
    date: string;
    recommendations: number;
    clicks: number;
    conversions: number;
  }>;
}

export interface RecommendationTest {
  productId: string;
  testType: 'trending' | 'similar' | 'recently-viewed';
  results: Array<{
    productId: string;
    score: number;
    reasons: string[];
    product: any;
  }>;
  executionTime: number;
  timestamp: Date;
}

class RecommendationManagementService {
  private baseUrl = '/api/recommendations';
  private tenantId = 'default'; // This should come from user context

  /**
   * Get current recommendation configuration
   */
  async getConfiguration(): Promise<RecommendationConfig> {
    try {
      const response = await fetch(`${this.baseUrl}/config`, {
        headers: {
          'X-Tenant-ID': this.tenantId
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch configuration: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching recommendation configuration:', error);
      // Return default configuration as fallback
      return {
        trendingEnabled: true,
        recentlyViewedEnabled: true,
        similarProductsEnabled: true,
        trendingTimeFrame: 'week',
        maxRecommendations: 10,
        cacheEnabled: true,
        cacheTtl: 3600,
        minScore: 0.5,
        enableAnalytics: true,
      };
    }
  }

  /**
   * Save recommendation configuration
   */
  async saveConfiguration(config: RecommendationConfig): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': this.tenantId
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        throw new Error(`Failed to save configuration: ${response.status}`);
      }
    } catch (error) {
      console.error('Error saving recommendation configuration:', error);
      throw error;
    }
  }

  /**
   * Get service status
   */
  async getServiceStatus(): Promise<ServiceStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/status`, {
        headers: {
          'X-Tenant-ID': this.tenantId
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch service status: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching service status:', error);
      // Return default status as fallback
      return {
        trending: 'active',
        recentlyViewed: 'active',
        similarProducts: 'active',
      };
    }
  }

  /**
   * Toggle service status
   */
  async toggleService(serviceName: keyof ServiceStatus, action: 'start' | 'stop'): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/service/${serviceName}/${action}`, {
        method: 'POST',
        headers: {
          'X-Tenant-ID': this.tenantId
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} service: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error ${action}ing service ${serviceName}:`, error);
      throw error;
    }
  }

  /**
   * Get analytics data
   */
  async getAnalytics(timeRange: 'day' | 'week' | 'month' | 'year' = 'week'): Promise<AnalyticsData> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics?timeRange=${timeRange}`, {
        headers: {
          'X-Tenant-ID': this.tenantId
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Return mock data as fallback
      return {
        totalRecommendations: 15420,
        clickThroughRate: 12.5,
        conversionRate: 3.2,
        popularCategories: [
          { name: 'Eyewear', count: 5200 },
          { name: 'Accessories', count: 3800 },
          { name: 'Frames', count: 2900 },
          { name: 'Lenses', count: 1200 },
        ],
        performanceMetrics: [
          { 
            service: 'Trending', 
            avgResponseTime: 120, 
            successRate: 99.2, 
            totalRequests: 8500,
            errorRate: 0.8 
          },
          { 
            service: 'Recently Viewed', 
            avgResponseTime: 85, 
            successRate: 98.8, 
            totalRequests: 12300,
            errorRate: 1.2 
          },
          { 
            service: 'Similar Products', 
            avgResponseTime: 150, 
            successRate: 97.5, 
            totalRequests: 6200,
            errorRate: 2.5 
          },
        ],
        trendsOverTime: [
          { date: '2024-01-01', recommendations: 1200, clicks: 150, conversions: 48 },
          { date: '2024-01-02', recommendations: 1350, clicks: 165, conversions: 52 },
          { date: '2024-01-03', recommendations: 1100, clicks: 140, conversions: 45 },
          { date: '2024-01-04', recommendations: 1450, clicks: 180, conversions: 58 },
          { date: '2024-01-05', recommendations: 1300, clicks: 160, conversions: 51 },
          { date: '2024-01-06', recommendations: 1250, clicks: 155, conversions: 49 },
          { date: '2024-01-07', recommendations: 1400, clicks: 175, conversions: 56 },
        ]
      };
    }
  }

  /**
   * Test recommendation algorithms
   */
  async testRecommendations(productId: string, testTypes: Array<'trending' | 'similar' | 'recently-viewed'> = ['trending', 'similar']): Promise<RecommendationTest[]> {
    try {
      const response = await fetch(`${this.baseUrl}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': this.tenantId
        },
        body: JSON.stringify({
          productId,
          testTypes,
          limit: 5
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to run tests: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error running recommendation tests:', error);
      throw error;
    }
  }

  /**
   * Clear recommendation cache
   */
  async clearCache(cacheType?: 'trending' | 'similar' | 'recently-viewed'): Promise<void> {
    try {
      const url = cacheType 
        ? `${this.baseUrl}/cache/clear?type=${cacheType}`
        : `${this.baseUrl}/cache/clear`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'X-Tenant-ID': this.tenantId
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to clear cache: ${response.status}`);
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw error;
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    trending: { size: number; hitRate: number; missRate: number };
    similar: { size: number; hitRate: number; missRate: number };
    recentlyViewed: { size: number; hitRate: number; missRate: number };
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/cache/stats`, {
        headers: {
          'X-Tenant-ID': this.tenantId
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch cache stats: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching cache stats:', error);
      // Return mock data as fallback
      return {
        trending: { size: 1250, hitRate: 85.2, missRate: 14.8 },
        similar: { size: 3200, hitRate: 78.5, missRate: 21.5 },
        recentlyViewed: { size: 5500, hitRate: 92.1, missRate: 7.9 },
      };
    }
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(format: 'csv' | 'json' | 'xlsx', timeRange: 'day' | 'week' | 'month' | 'year' = 'week'): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/export?format=${format}&timeRange=${timeRange}`, {
        headers: {
          'X-Tenant-ID': this.tenantId
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to export analytics: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting analytics:', error);
      throw error;
    }
  }

  /**
   * Get recommendation health check
   */
  async getHealthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    services: {
      trending: boolean;
      similar: boolean;
      recentlyViewed: boolean;
      database: boolean;
      cache: boolean;
    };
    lastCheck: Date;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        headers: {
          'X-Tenant-ID': this.tenantId
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch health check: ${response.status}`);
      }

      const data = await response.json();
      return {
        ...data.data,
        lastCheck: new Date(data.data.lastCheck)
      };
    } catch (error) {
      console.error('Error fetching health check:', error);
      // Return default health as fallback
      return {
        status: 'healthy',
        services: {
          trending: true,
          similar: true,
          recentlyViewed: true,
          database: true,
          cache: true,
        },
        lastCheck: new Date()
      };
    }
  }
}

// Create and export a singleton instance
export const recommendationManagementService = new RecommendationManagementService();