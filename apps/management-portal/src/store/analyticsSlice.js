import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as analyticsAPI from '../services/analytics-api';

// Async thunks for API calls
export const fetchGlobalMetrics = createAsyncThunk(
  'analytics/fetchGlobalMetrics',
  async (dateRange, { rejectWithValue }) => {
    try {
      const response = await analyticsAPI.getGlobalMetrics(dateRange);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch global metrics');
    }
  }
);

export const fetchTenantMetrics = createAsyncThunk(
  'analytics/fetchTenantMetrics',
  async (dateRange, { rejectWithValue }) => {
    try {
      const response = await analyticsAPI.getTenantMetrics(dateRange);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tenant metrics');
    }
  }
);

export const fetchRecommendationMetrics = createAsyncThunk(
  'analytics/fetchRecommendationMetrics',
  async (dateRange, { rejectWithValue }) => {
    try {
      const response = await analyticsAPI.getRecommendationMetrics(dateRange);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recommendation metrics');
    }
  }
);

export const fetchConversionFunnels = createAsyncThunk(
  'analytics/fetchConversionFunnels',
  async (dateRange, { rejectWithValue }) => {
    try {
      const response = await analyticsAPI.getConversionFunnels(dateRange);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversion funnels');
    }
  }
);

const initialState = {
  globalMetrics: {
    totalRevenue: 0,
    totalOrders: 0,
    activeTenants: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    newCustomers: 0,
    recommendationEngagementRate: 0,
    aiFeatureUsage: 0
  },
  tenantMetrics: [],
  recommendationMetrics: {
    totalRecommendations: 0,
    recommendationClickRate: 0,
    conversionFromRecommendations: 0,
    demographicOptInRate: 0,
    mlModelAccuracy: 0,
    averageRecommendationScore: 0
  },
  conversionFunnels: {
    visits: 0,
    faceAnalysisUse: 0,
    virtualTryOn: 0,
    recommendations: 0,
    cartAdditions: 0,
    purchases: 0
  },
  dateRange: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0]
  },
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  lastUpdated: null
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setDateRange: (state, action) => {
      state.dateRange = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetAnalytics: (state) => {
      return { ...initialState, dateRange: state.dateRange };
    }
  },
  extraReducers: (builder) => {
    builder
      // Global Metrics
      .addCase(fetchGlobalMetrics.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchGlobalMetrics.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.globalMetrics = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchGlobalMetrics.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Tenant Metrics
      .addCase(fetchTenantMetrics.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTenantMetrics.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tenantMetrics = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchTenantMetrics.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Recommendation Metrics
      .addCase(fetchRecommendationMetrics.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRecommendationMetrics.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.recommendationMetrics = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchRecommendationMetrics.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Conversion Funnels
      .addCase(fetchConversionFunnels.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchConversionFunnels.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.conversionFunnels = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchConversionFunnels.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const { setDateRange, clearError, resetAnalytics } = analyticsSlice.actions;

// Selectors
export const selectGlobalMetrics = (state) => state.analytics.globalMetrics;
export const selectTenantMetrics = (state) => state.analytics.tenantMetrics;
export const selectRecommendationMetrics = (state) => state.analytics.recommendationMetrics;
export const selectConversionFunnels = (state) => state.analytics.conversionFunnels;
export const selectDateRange = (state) => state.analytics.dateRange;
export const selectAnalyticsStatus = (state) => state.analytics.status;
export const selectAnalyticsError = (state) => state.analytics.error;
export const selectLastUpdated = (state) => state.analytics.lastUpdated;

export default analyticsSlice.reducer;