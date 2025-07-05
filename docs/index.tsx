import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '../frontend/src/design-system/ThemeProvider';
import ApiDocumentation from './api';
import ApiExplorer from './explorer';
import SdkDocumentation from './sdk';
import IntegrationGuides from './integrations';

/**
 * VARAi API Documentation Site
 *
 * This is the main entry point for the VARAi API documentation site.
 * It includes the API documentation, SDK documentation, and the interactive API explorer.
 */

// Main App component with routing
const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Routes>
          <Route path="/docs" element={<ApiDocumentation />} />
          <Route path="/docs/sdk" element={<SdkDocumentation />} />
          <Route path="/docs/explorer" element={<ApiExplorer />} />
          <Route path="/docs/integrations" element={<IntegrationGuides />} />
          <Route path="*" element={<Navigate to="/docs" replace />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
};

// Render the application
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}