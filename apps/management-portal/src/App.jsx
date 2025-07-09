import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';

import DashboardLayout from './layouts/DashboardLayout';
import TenantListPage from './pages/TenantListPage';
import TenantDetailPage from './pages/TenantDetailPage';
import ProvisioningPage from './pages/ProvisioningPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<TenantListPage />} />
          <Route path="tenants" element={<TenantListPage />} />
          <Route path="tenants/:id" element={<TenantDetailPage />} />
          <Route path="provisioning" element={<ProvisioningPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;