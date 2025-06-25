import React, { useState, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Frame,
  Navigation,
  TopBar,
  ContextualSaveBar,
  Toast,
  Loading,
  SkeletonPage,
  Layout,
  SkeletonBodyText
} from '@shopify/polaris';
import {
  HomeMinor,
  SettingsMinor,
  ProductsMinor,
  HistoryMinor,
  CategoriesMajor,
  AppsMinor
} from '@shopify/polaris-icons';
import { useAuth } from '../providers/AuthProvider';

/**
 * Main application layout with navigation, top bar and content area
 * Includes loading states and authenticated user handling
 */
function AppLayout() {
  const { session, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Local state
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastContent, setToastContent] = useState({});
  
  // Handle navigation
  const handleNavigation = useCallback((path) => {
    navigate(path);
  }, [navigate]);
  
  // Handle search
  const handleSearchChange = useCallback((value) => {
    setSearchValue(value);
  }, []);
  
  const handleSearchCancel = useCallback(() => {
    setIsSearchActive(false);
    setSearchValue('');
  }, []);
  
  // Show toast notification
  const showToastNotification = useCallback((content) => {
    setToastContent(content);
    setShowToast(true);
  }, []);
  
  // Toggle user menu
  const toggleUserMenuOpen = useCallback(() => {
    setUserMenuOpen((open) => !open);
  }, []);
  
  // Create top bar markup
  const topBarMarkup = (
    <TopBar
      showNavigationToggle
      userMenu={
        <TopBar.UserMenu
          actions={[
            {
              items: [{ content: 'Sign out', onAction: signOut }]
            }
          ]}
          name={session?.shop?.split('.')[0] || 'Shop'}
          detail={session?.shop || 'Unknown'}
          initials={session?.shop?.[0]?.toUpperCase() || 'S'}
          open={userMenuOpen}
          onToggle={toggleUserMenuOpen}
        />
      }
      searchField={
        <TopBar.SearchField
          onChange={handleSearchChange}
          value={searchValue}
          placeholder="Search"
          showFocusBorder
        />
      }
      searchResultsVisible={isSearchActive}
      onSearchResultsDismiss={handleSearchCancel}
    />
  );
  
  // Create navigation markup
  const navigationMarkup = (
    <Navigation location={location.pathname}>
      <Navigation.Section
        title="Eyewear Catalog"
        items={[
          {
            url: '/',
            label: 'Dashboard',
            icon: HomeMinor,
            selected: location.pathname === '/',
            onClick: () => handleNavigation('/')
          },
          {
            url: '/products',
            label: 'Products',
            icon: ProductsMinor,
            selected: location.pathname === '/products',
            onClick: () => handleNavigation('/products')
          },
          {
            url: '/history',
            label: 'Sync History',
            icon: HistoryMinor,
            selected: location.pathname === '/history',
            onClick: () => handleNavigation('/history')
          },
          {
            url: '/settings',
            label: 'Settings',
            icon: SettingsMinor,
            selected: location.pathname === '/settings',
            onClick: () => handleNavigation('/settings')
          }
        ]}
      />
      
      <Navigation.Section
        title="More"
        separator
        items={[
          {
            url: 'https://admin.shopify.com/store',
            label: 'Shopify Admin',
            icon: AppsMinor,
            external: true
          },
          {
            url: '/help',
            label: 'Help Center',
            icon: CategoriesMajor,
            onClick: () => showToastNotification({
              content: 'Help Center coming soon!',
              intent: 'info'
            })
          }
        ]}
      />
    </Navigation>
  );
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <Frame>
        <Loading />
        <SkeletonPage>
          <Layout>
            <Layout.Section>
              <SkeletonBodyText lines={10} />
            </Layout.Section>
          </Layout>
        </SkeletonPage>
      </Frame>
    );
  }
  
  return (
    <Frame
      topBar={topBarMarkup}
      navigation={navigationMarkup}
      showMobileNavigation={false}
    >
      {/* Main content area */}
      <Outlet />
      
      {/* Toast notifications */}
      {showToast && (
        <Toast
          content={toastContent.content}
          intent={toastContent.intent || 'success'}
          onDismiss={() => setShowToast(false)}
          duration={3000}
        />
      )}
    </Frame>
  );
}

export default AppLayout;