import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../services/provisioning-api';

export const provisionStore = createAsyncThunk('provisioning/provisionStore', async (tenantId) => {
  const response = await api.provisionStore(tenantId);
  return response.data;
});

export const fetchProvisioningStatus = createAsyncThunk('provisioning/fetchStatus', async (jobId) => {
  const response = await api.getProvisioningStatus(jobId);
  return response.data;
});

const initialState = {
  jobs: {}, // { [jobId]: { status, logs } }
  status: 'idle',
  error: null,
};

const provisioningSlice = createSlice({
  name: 'provisioning',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(provisionStore.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(provisionStore.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.jobs[action.payload.jobId] = {
          status: action.payload.status,
          logs: [],
        };
      })
      .addCase(provisionStore.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchProvisioningStatus.fulfilled, (state, action) => {
        const { jobId, state: jobState, logs } = action.payload;
        if (state.jobs[jobId]) {
          state.jobs[jobId].status = jobState;
          state.jobs[jobId].logs = logs;
        }
      });
  },
});

export default provisioningSlice.reducer;