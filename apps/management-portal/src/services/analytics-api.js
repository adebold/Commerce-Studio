import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_ANALYTICS_API_URL || 'http://localhost:3004/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Global platform metrics
export const getGlobalMetrics = (dateRange) => 
  apiClient.get('/analytics/global', { 
    params: { 
      startDate: dateRange?.start, 
      endDate: dateRange?.end 
    } 
  });

// Tenant-specific metrics
export const getTenantMetrics = (dateRange) => 
  apiClient.get('/analytics/tenants', { 
    params: { 
      startDate: dateRange?.start, 
      endDate: dateRange?.end 
    } 
  });

// Advanced recommendation engine metrics
export const getRecommendationMetrics = (dateRange) => 
  apiClient.get('/analytics/recommendations', { 
    params: { 
      startDate: dateRange?.start, 
      endDate: dateRange?.end 
    } 
  });

// AI feature usage and performance metrics
export const getAIMetrics = (dateRange) => 
  apiClient.get('/analytics/ai-features', { 
    params: { 
      startDate: dateRange?.start, 
      endDate: dateRange?.end 
    } 
  });

// Conversion funnel data
export const getConversionFunnels = (dateRange) => 
  apiClient.get('/analytics/conversion-funnels', { 
    params: { 
      startDate: dateRange?.start, 
      endDate: dateRange?.end 
    } 
  });

// Demographics and style preference analytics
export const getDemographicInsights = (dateRange) => 
  apiClient.get('/analytics/demographics', { 
    params: { 
      startDate: dateRange?.start, 
      endDate: dateRange?.end 
    } 
  });

// ML model performance metrics
export const getMLModelMetrics = (dateRange) => 
  apiClient.get('/analytics/ml-models', { 
    params: { 
      startDate: dateRange?.start, 
      endDate: dateRange?.end 
    } 
  });

// European market specific analytics
export const getEuropeanMarketMetrics = (dateRange) => 
  apiClient.get('/analytics/european-markets', { 
    params: { 
      startDate: dateRange?.start, 
      endDate: dateRange?.end 
    } 
  });

// Individual tenant drill-down
export const getTenantDetails = (tenantId, dateRange) => 
  apiClient.get(`/analytics/tenant/${tenantId}`, { 
    params: { 
      startDate: dateRange?.start, 
      endDate: dateRange?.end 
    } 
  });

// Real-time metrics (for live dashboard updates)
export const getRealtimeMetrics = () => 
  apiClient.get('/analytics/realtime');

// Performance and health metrics
export const getSystemHealth = () =>
  apiClient.get('/analytics/system-health');

// Export metrics for reporting
export const exportAnalyticsReport = (dateRange, format = 'csv') =>
  apiClient.get('/analytics/export', {
    params: {
      startDate: dateRange?.start,
      endDate: dateRange?.end,
      format
    },
    responseType: 'blob'
  });