import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import '@shopify/polaris/build/esm/styles.css';

// Providers
import { AuthProvider } from './providers/AuthProvider';
import { ApiProvider } from './providers/ApiProvider';

// Pages
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import ProductSync from './pages/ProductSync';
import SyncHistory from './pages/SyncHistory';
import Auth from './pages/Auth';

// Layouts
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';

// Protected route component
function ProtectedRoute({ children }) {
  // Check if user is authenticated by session existence in localStorage
  const isAuthenticated = localStorage.getItem('shopify_session') !== null;
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/auth" replace />;
  }
  
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider i18n={enTranslations}>
        <Routes>
          {/* Auth routes */}
          <Route path="/auth" element={
            <AuthLayout>
              <Auth />
            </AuthLayout>
          } />
          
          {/* App routes - protected */}
          <Route path="/" element={
            <ProtectedRoute>
              <AuthProvider>
                <ApiProvider>
                  <AppLayout />
                </ApiProvider>
              </AuthProvider>
            </ProtectedRoute>
          }>
            {/* Dashboard (index route) */}
            <Route index element={<Dashboard />} />
            
            {/* Settings page */}
            <Route path="settings" element={<Settings />} />
            
            {/* Products page */}
            <Route path="products" element={<ProductSync />} />
            
            {/* Sync history page */}
            <Route path="history" element={<SyncHistory />} />
            
            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;