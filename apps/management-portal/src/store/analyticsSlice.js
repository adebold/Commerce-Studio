import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../services/analytics-api';

export const fetchGlobalMetrics = createAsyncThunk('analytics/fetchGlobalMetrics', async (dateRange) => {
  const response = await api.getGlobalMetrics(dateRange);
  return response.data;
});

export const fetchTenantMetrics = createAsyncThunk('analytics/fetchTenantMetrics', async (dateRange) => {
  const response = await api.getTenantMetrics(dateRange);
  return response.data;
});

const initialState = {
  globalMetrics: {},
  tenantMetrics: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGlobalMetrics.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchGlobalMetrics.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.globalMetrics = action.payload.data;
      })
      .addCase(fetchGlobalMetrics.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchTenantMetrics.fulfilled, (state, action) => {
        state.tenantMetrics = action.payload.data;
      });
  },
});

export default analyticsSlice.reducer;