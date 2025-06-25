import React, { useCallback } from 'react';
import { Navigation as PolarisNavigation } from '@shopify/polaris';
import { 
  HomeMinor, 
  ProductsMinor, 
  HistoryMinor, 
  SettingsMinor 
} from '@shopify/polaris-icons';
import { useNavigate, useLocation } from 'react-router-dom';

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Navigation callback
  const handleNavigationClick = useCallback((path) => {
    navigate(path);
  }, [navigate]);
  
  return (
    <PolarisNavigation location={location.pathname}>
      <PolarisNavigation.Section
        items={[
          {
            url: '/',
            label: 'Dashboard',
            icon: HomeMinor,
            onClick: () => handleNavigationClick('/'),
            selected: location.pathname === '/'
          },
          {
            url: '/products',
            label: 'Products & Sync',
            icon: ProductsMinor,
            onClick: () => handleNavigationClick('/products'),
            selected: location.pathname === '/products'
          },
          {
            url: '/history',
            label: 'Sync History',
            icon: HistoryMinor,
            onClick: () => handleNavigationClick('/history'),
            selected: location.pathname === '/history'
          },
          {
            url: '/settings',
            label: 'Settings',
            icon: SettingsMinor,
            onClick: () => handleNavigationClick('/settings'),
            selected: location.pathname === '/settings'
          }
        ]}
      />
      
      <PolarisNavigation.Section
        title="Help"
        items={[
          {
            url: 'https://eyewear-database.com/docs',
            label: 'Documentation',
            external: true
          },
          {
            url: 'https://eyewear-database.com/support',
            label: 'Support',
            external: true
          }
        ]}
      />
    </PolarisNavigation>
  );
}

export default Navigation;