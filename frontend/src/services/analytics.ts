import { ApiError } from './errors';

// Analytics data interfaces
export interface ConversionFunnelData {
  stages: {
    name: string;
    count: number;
    conversionRate: number;
  }[];
  totalEntries: number;
  overallConversionRate: number;
}

export interface HeatmapData {
  productId: string;
  productName: string;
  engagementScores: number[][];
  maxScore: number;
}

export interface CohortData {
  cohorts: {
    name: string;
    size: number;
    retentionRates: number[];
  }[];
  periods: string[];
}

export interface ABTestData {
  testId: string;
  testName: string;
  variants: {
    name: string;
    users: number;
    conversions: number;
    conversionRate: number;
  }[];
  startDate: string;
  endDate: string;
  status: 'running' | 'completed' | 'scheduled';
  winner?: string;
  confidenceLevel?: number;
}

export interface AnalyticsFilters {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  products?: string[];
  channels?: string[];
  userSegments?: string[];
  deviceTypes?: string[];
  countries?: string[];
}

export interface ReportConfig {
  id: string;
  name: string;
  description: string;
  type: 'conversion' | 'engagement' | 'retention' | 'abTest' | 'custom';
  filters: AnalyticsFilters;
  visualizationType: 'line' | 'bar' | 'pie' | 'funnel' | 'heatmap' | 'table';
  createdAt: string;
  lastModified: string;
}

export class AnalyticsService {
  private baseUrl: string;

  constructor() {
    // Use process.env in tests and import.meta.env in the browser
    // Check if we're in a test environment
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test') {
      this.baseUrl = process.env.VITE_API_URL || 'http://localhost:8000';
    } else {
      // In browser environment
      try {
        // Safely access import.meta.env
        const env = typeof import.meta !== 'undefined' ? import.meta.env : {};
        // Use type assertion with a more specific type
        interface EnvVars {
          VITE_API_URL?: string;
        }
        this.baseUrl = (env && (env as EnvVars).VITE_API_URL) || 'http://localhost:8000';
      } catch {
        // Fallback if import.meta is not available
        this.baseUrl = 'http://localhost:8000';
      }
    }
  }

  private async fetchAnalytics<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    try {
      const url = new URL(`${this.baseUrl}/analytics/${endpoint}`);
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (typeof value === 'object') {
            url.searchParams.append(key, JSON.stringify(value));
          } else {
            url.searchParams.append(key, String(value));
          }
        });
      }
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new ApiError(response.status, 'Failed to fetch analytics data');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Network error while fetching analytics data');
    }
  }

  async getConversionFunnel(filters?: AnalyticsFilters): Promise<ConversionFunnelData> {
    // In a real implementation, we would pass the filters to the API
    // return this.fetchAnalytics<ConversionFunnelData>('conversion-funnel', filters);
    
    // For now, return mock data with optional date filtering
    const mockData = this.getMockConversionFunnel();
    
    // Apply simple date filtering if provided (just logging for now to use the parameter)
    if (filters?.dateRange) {
      console.log(`Filtering conversion funnel data from ${filters.dateRange.startDate} to ${filters.dateRange.endDate}`);
    }
    
    return mockData;
  }

  async getProductEngagementHeatmap(productId: string, filters?: AnalyticsFilters): Promise<HeatmapData> {
    // In a real implementation, we would pass the productId and filters to the API
    // return this.fetchAnalytics<HeatmapData>(`product-engagement/${productId}`, filters);
    
    // For now, return mock data with optional date filtering
    const mockData = this.getMockHeatmapData(productId);
    
    // Apply simple date filtering if provided (just logging for now to use the parameter)
    if (filters?.dateRange) {
      console.log(`Filtering heatmap data for product ${productId} from ${filters.dateRange.startDate} to ${filters.dateRange.endDate}`);
    }
    
    return mockData;
  }

  async getCohortAnalysis(filters?: AnalyticsFilters): Promise<CohortData> {
    // In a real implementation, we would pass the filters to the API
    // return this.fetchAnalytics<CohortData>('cohort-analysis', filters);
    
    // For now, return mock data with optional date filtering
    const mockData = this.getMockCohortData();
    
    // Apply simple date filtering if provided (just logging for now to use the parameter)
    if (filters?.dateRange) {
      console.log(`Filtering cohort data from ${filters.dateRange.startDate} to ${filters.dateRange.endDate}`);
    }
    
    return mockData;
  }

  async getABTestResults(testId?: string, filters?: AnalyticsFilters): Promise<ABTestData[]> {
    // In a real implementation, we would pass the testId and filters to the API
    // const endpoint = testId ? `ab-tests/${testId}` : 'ab-tests';
    // return this.fetchAnalytics<ABTestData[]>(endpoint, filters);
    
    // For now, return mock data with optional filtering
    const allTests = this.getMockABTestData();
    
    // Filter by testId if provided
    const filteredByTestId = testId
      ? allTests.filter(test => test.testId === testId)
      : allTests;
    
    // Apply simple date filtering if provided (just logging for now to use the parameter)
    if (filters?.dateRange) {
      console.log(`Filtering AB test data from ${filters.dateRange.startDate} to ${filters.dateRange.endDate}`);
    }
    
    return filteredByTestId;
  }

  async getSavedReports(): Promise<ReportConfig[]> {
    // In a real implementation, we would fetch from the API
    // return this.fetchAnalytics<ReportConfig[]>('reports');
    
    // For now, return mock data
    return this.getMockReportConfigs();
  }

  async saveReport(config: Omit<ReportConfig, 'id' | 'createdAt' | 'lastModified'>): Promise<ReportConfig> {
    // In a real implementation, we would post to the API
    // const response = await fetch(`${this.baseUrl}/analytics/reports`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(config),
    // });
    
    // if (!response.ok) {
    //   throw new ApiError(response.status, 'Failed to save report');
    // }
    
    // return await response.json();
    
    // For now, return mock data
    const now = new Date().toISOString();
    return {
      ...config,
      id: `report-${Math.floor(Math.random() * 1000)}`,
      createdAt: now,
      lastModified: now,
    } as ReportConfig;
  }

  // Mock data for development
  getMockConversionFunnel(): ConversionFunnelData {
    return {
      stages: [
        { name: 'Product View', count: 10000, conversionRate: 1.0 },
        { name: 'Add to Cart', count: 3500, conversionRate: 0.35 },
        { name: 'Checkout', count: 2200, conversionRate: 0.63 },
        { name: 'Payment', count: 1800, conversionRate: 0.82 },
        { name: 'Purchase Complete', count: 1500, conversionRate: 0.83 }
      ],
      totalEntries: 10000,
      overallConversionRate: 0.15
    };
  }

  getMockHeatmapData(productId: string): HeatmapData {
    // Generate random engagement scores
    const engagementScores = Array(10).fill(0).map(() => 
      Array(10).fill(0).map(() => Math.floor(Math.random() * 100))
    );
    
    const maxScore = Math.max(...engagementScores.flat());
    
    return {
      productId,
      productName: `Product ${productId}`,
      engagementScores,
      maxScore
    };
  }

  getMockCohortData(): CohortData {
    return {
      cohorts: [
        {
          name: 'Jan 2025',
          size: 1200,
          retentionRates: [1.0, 0.65, 0.48, 0.42, 0.38, 0.35]
        },
        {
          name: 'Feb 2025',
          size: 1500,
          retentionRates: [1.0, 0.68, 0.52, 0.45, 0.41]
        },
        {
          name: 'Mar 2025',
          size: 1800,
          retentionRates: [1.0, 0.72, 0.56, 0.48]
        },
        {
          name: 'Apr 2025',
          size: 2100,
          retentionRates: [1.0, 0.75, 0.60]
        },
        {
          name: 'May 2025',
          size: 2400,
          retentionRates: [1.0, 0.78]
        },
        {
          name: 'Jun 2025',
          size: 2700,
          retentionRates: [1.0]
        }
      ],
      periods: ['Week 0', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5']
    };
  }

  getMockABTestData(): ABTestData[] {
    return [
      {
        testId: 'test-1',
        testName: 'Homepage Hero Banner',
        variants: [
          { name: 'Control', users: 5000, conversions: 250, conversionRate: 0.05 },
          { name: 'Variant A', users: 5000, conversions: 300, conversionRate: 0.06 }
        ],
        startDate: '2025-03-01',
        endDate: '2025-03-15',
        status: 'completed',
        winner: 'Variant A',
        confidenceLevel: 0.95
      },
      {
        testId: 'test-2',
        testName: 'Product Page Layout',
        variants: [
          { name: 'Control', users: 3000, conversions: 210, conversionRate: 0.07 },
          { name: 'Variant A', users: 3000, conversions: 240, conversionRate: 0.08 },
          { name: 'Variant B', users: 3000, conversions: 270, conversionRate: 0.09 }
        ],
        startDate: '2025-04-01',
        endDate: '2025-04-30',
        status: 'running'
      },
      {
        testId: 'test-3',
        testName: 'Checkout Flow',
        variants: [
          { name: 'Control', users: 0, conversions: 0, conversionRate: 0 },
          { name: 'Variant A', users: 0, conversions: 0, conversionRate: 0 }
        ],
        startDate: '2025-05-01',
        endDate: '2025-05-31',
        status: 'scheduled'
      }
    ];
  }

  getMockReportConfigs(): ReportConfig[] {
    return [
      {
        id: 'report-1',
        name: 'Monthly Conversion Funnel',
        description: 'Tracks the conversion funnel performance on a monthly basis',
        type: 'conversion',
        filters: {
          dateRange: {
            startDate: '2025-01-01',
            endDate: '2025-04-30'
          }
        },
        visualizationType: 'funnel',
        createdAt: '2025-01-15T10:30:00Z',
        lastModified: '2025-04-10T14:45:00Z'
      },
      {
        id: 'report-2',
        name: 'Product Engagement Analysis',
        description: 'Heatmap visualization of user engagement with products',
        type: 'engagement',
        filters: {
          dateRange: {
            startDate: '2025-03-01',
            endDate: '2025-04-30'
          },
          products: ['product-1', 'product-2', 'product-3']
        },
        visualizationType: 'heatmap',
        createdAt: '2025-03-05T09:15:00Z',
        lastModified: '2025-04-12T11:20:00Z'
      },
      {
        id: 'report-3',
        name: 'User Retention by Cohort',
        description: 'Analysis of user retention rates by monthly cohorts',
        type: 'retention',
        filters: {
          dateRange: {
            startDate: '2025-01-01',
            endDate: '2025-06-30'
          },
          userSegments: ['new-users', 'returning-users']
        },
        visualizationType: 'bar',
        createdAt: '2025-02-20T13:40:00Z',
        lastModified: '2025-04-15T16:30:00Z'
      }
    ];
  }
}

export const analyticsService = new AnalyticsService();