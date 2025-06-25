import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Box, GlobalStyles, H1, Tabs } from '@bigcommerce/big-design';
import { ThemeProvider } from '@bigcommerce/big-design-theme';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import { ApiClient } from '../lib/api-client';

interface AppProps {
  clientId: string;
  accessToken: string;
  storeHash: string;
  varaiApiKey: string;
}

const App: React.FC<AppProps> = ({ clientId, accessToken, storeHash, varaiApiKey }) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [apiClient, setApiClient] = useState<ApiClient | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const client = new ApiClient({
        clientId,
        accessToken,
        storeHash,
        varaiApiKey
      });
      setApiClient(client);
    } catch (err) {
      console.error('Failed to initialize API client:', err);
      setError('Failed to initialize API client. Please check your credentials.');
    }
  }, [clientId, accessToken, storeHash, varaiApiKey]);

  const tabs = [
    { id: 'dashboard', title: 'Dashboard' },
    { id: 'settings', title: 'Settings' },
    { id: 'documentation', title: 'Documentation' }
  ];

  const renderContent = () => {
    if (error) {
      return (
        <Box marginY="xxLarge" marginX="auto" textAlign="center">
          <H1 color="danger">{error}</H1>
        </Box>
      );
    }

    if (!apiClient) {
      return (
        <Box marginY="xxLarge" marginX="auto" textAlign="center">
          <H1>Loading...</H1>
        </Box>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard apiClient={apiClient} />;
      case 'settings':
        return <Settings apiClient={apiClient} />;
      case 'documentation':
        return (
          <Box marginY="medium">
            <iframe 
              src="https://docs.varai.ai/bigcommerce" 
              style={{ width: '100%', height: 'calc(100vh - 200px)', border: 'none' }}
              title="VARAi Documentation"
            />
          </Box>
        );
      default:
        return <Dashboard apiClient={apiClient} />;
    }
  };

  return (
    <ThemeProvider>
      <GlobalStyles />
      <Box padding="medium">
        <H1>VARAi for BigCommerce</H1>
        
        <Tabs
          activeTab={activeTab}
          items={tabs}
          onTabClick={setActiveTab}
        />
        
        <Box marginY="medium">
          {renderContent()}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

// Initialize the app when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('varai-app');
  
  if (container) {
    // Get configuration from data attributes
    const clientId = container.getAttribute('data-client-id') || '';
    const accessToken = container.getAttribute('data-access-token') || '';
    const storeHash = container.getAttribute('data-store-hash') || '';
    const varaiApiKey = container.getAttribute('data-varai-api-key') || '';
    
    const root = createRoot(container);
    root.render(
      <App
        clientId={clientId}
        accessToken={accessToken}
        storeHash={storeHash}
        varaiApiKey={varaiApiKey}
      />
    );
  } else {
    console.error('VARAi app container not found');
  }
});

// Export for testing
export default App;