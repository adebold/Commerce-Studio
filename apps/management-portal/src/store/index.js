import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    tenants: tenantsReducer,
    provisioning: provisioningReducer,
    analytics: analyticsReducer,
  },
});

export default store;