import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../services/tenant-api';

export const fetchTenants = createAsyncThunk('tenants/fetchTenants', async () => {
  const response = await api.getTenants();
  return response.data;
});

export const fetchTenantById = createAsyncThunk('tenants/fetchTenantById', async (id) => {
  const response = await api.getTenant(id);
  return response.data;
});

export const createTenant = createAsyncThunk('tenants/createTenant', async (tenantData) => {
  const response = await api.createTenant(tenantData);
  return response.data;
});

export const updateTenant = createAsyncThunk('tenants/updateTenant', async ({ id, ...tenantData }) => {
  const response = await api.updateTenant(id, tenantData);
  return response.data;
});

export const deleteTenant = createAsyncThunk('tenants/deleteTenant', async (id) => {
  await api.deleteTenant(id);
  return id;
});

const initialState = {
  tenants: [],
  selectedTenant: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const tenantsSlice = createSlice({
  name: 'tenants',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTenants.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTenants.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tenants = action.payload.data;
      })
      .addCase(fetchTenants.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchTenantById.fulfilled, (state, action) => {
        state.selectedTenant = action.payload.data;
      })
      .addCase(createTenant.fulfilled, (state, action) => {
        state.tenants.push(action.payload.data);
      })
      .addCase(updateTenant.fulfilled, (state, action) => {
        const index = state.tenants.findIndex(t => t.id === action.payload.data.id);
        if (index !== -1) {
          state.tenants[index] = action.payload.data;
        }
      })
      .addCase(deleteTenant.fulfilled, (state, action) => {
        state.tenants = state.tenants.filter(t => t.id !== action.payload);
      });
  },
});

export default tenantsSlice.reducer;