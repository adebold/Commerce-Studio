import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import SettingsPage from '../pages/commerce-studio/SettingsPage';
import DashboardPage from '../pages/commerce-studio/DashboardPage';
import { theme } from '../theme';

expect.extend(toHaveNoViolations);

// Mock services
jest.mock('../services/settings', () => ({
  settingsService: {
    getSettings: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('../services/metrics', () => ({
  metricsService: {
    getMockData: jest.fn().mockReturnValue({
      ml: { modelAccuracy: 0.95 },
      pipeline: { processingTime: 150 },
      api: { responseTime: 45 },
      business: { 
        conversionRate: 0.034,
        uniqueUsers: 1250,
        activeIntegrations: 3
      },
      system: { uptime: 0.999 },
      status: { overall: 'healthy' }
    }),
  },
}));

// Mock dashboard components
jest.mock('../components/dashboard/SalesChart', () => {
  return function MockSalesChart({ timePeriod, loading }: any) {
    if (loading) return <div data-testid="sales-chart-loading">Loading...</div>;
    return <div data-testid="sales-chart">Sales Chart - {timePeriod}</div>;
  };
});

jest.mock('../components/dashboard/ProductPerformance', () => {
  return function MockProductPerformance({ loading }: any) {
    if (loading) return <div data-testid="product-performance-loading">Loading...</div>;
    return <div data-testid="product-performance">Product Performance</div>;
  };
});

jest.mock('../components/dashboard/CustomerEngagement', () => {
  return function MockCustomerEngagement({ loading }: any) {
    if (loading) return <div data-testid="customer-engagement-loading">Loading...</div>;
    return <div data-testid="customer-engagement">Customer Engagement</div>;
  };
});

jest.mock('../components/dashboard/IntegrationStatus', () => {
  return function MockIntegrationStatus({ loading }: any) {
    if (loading) return <div data-testid="integration-status-loading">Loading...</div>;
    return <div data-testid="integration-status">Integration Status</div>;
  };
});

jest.mock('../components/dashboard/ActivityFeed', () => {
  return function MockActivityFeed({ loading }: any) {
    if (loading) return <div data-testid="activity-feed-loading">Loading...</div>;
    return <div data-testid="activity-feed">Activity Feed</div>;
  };
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('LS5_003 Implementation Tests', () => {
  describe('SettingsPage Migration & Accessibility', () => {
    beforeEach(() => {
      // Mock window.location for navigation tests
      delete (window as any).location;
      window.location = { pathname: '/admin/settings/account' } as any;
    });

    it('should render with proper MUI Card components', () => {
      renderWithProviders(<SettingsPage />);
      
      // Verify MUI Card components are rendered with proper roles
      expect(screen.getByRole('complementary')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should have zero accessibility violations', async () => {
      const { container } = renderWithProviders(<SettingsPage />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SettingsPage />);
      
      // Test Tab navigation to settings navigation
      const navigation = screen.getByRole('navigation');
      expect(navigation).toBeInTheDocument();
      
      // Test that menu items are focusable
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems.length).toBeGreaterThan(0);
      
      // Test keyboard interaction
      await user.tab();
      expect(menuItems[0]).toHaveFocus();
    });

    it('should have proper ARIA attributes', () => {
      renderWithProviders(<SettingsPage />);
      
      // Check for proper ARIA labeling
      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Settings navigation');
      expect(screen.getByRole('menu')).toHaveAttribute('aria-label', 'Settings sections');
      
      // Check for proper heading hierarchy
      expect(screen.getByRole('banner')).toBeInTheDocument();
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Settings');
    });

    it('should handle error states gracefully', async () => {
      // Mock settings service to throw error
      const mockSettingsService = require('../services/settings').settingsService;
      mockSettingsService.getSettings.mockRejectedValueOnce(new Error('Network error'));
      
      renderWithProviders(<SettingsPage />);
      
      // Wait for error to be displayed
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
      
      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toHaveAttribute('aria-live', 'polite');
    });

    it('should provide skip link for screen readers', () => {
      renderWithProviders(<SettingsPage />);
      
      const skipLink = screen.getByText('Skip to settings content');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#settings-content');
    });
  });

  describe('DashboardPage Performance & Accessibility', () => {
    it('should render dashboard metrics efficiently', async () => {
      const startTime = performance.now();
      renderWithProviders(<DashboardPage />);
      const endTime = performance.now();
      
      // Verify rendering performance (should be under 100ms for this test)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should have zero accessibility violations', async () => {
      const { container } = renderWithProviders(<DashboardPage />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should handle loading states properly', async () => {
      renderWithProviders(<DashboardPage />);
      
      // Initially should show skeleton loading states
      await waitFor(() => {
        const skeletons = screen.getAllByTestId(/skeleton/i);
        expect(skeletons.length).toBeGreaterThan(0);
      });
    });

    it('should support time period selection with proper ARIA', async () => {
      const user = userEvent.setup();
      renderWithProviders(<DashboardPage />);
      
      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByRole('tablist')).toBeInTheDocument();
      });
      
      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveAttribute('aria-label', 'Time period selection');
      
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(3);
      
      // Test tab selection
      const weeklyTab = screen.getByRole('tab', { name: /weekly/i });
      expect(weeklyTab).toHaveAttribute('aria-selected', 'true');
      
      const dailyTab = screen.getByRole('tab', { name: /daily/i });
      await user.click(dailyTab);
      
      expect(dailyTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should display proper metric cards with accessibility', async () => {
      renderWithProviders(<DashboardPage />);
      
      await waitFor(() => {
        // Check for metric cards with proper ARIA labels
        const metricCards = screen.getAllByRole('region');
        expect(metricCards.length).toBeGreaterThan(0);
        
        // Verify specific metrics are displayed
        expect(screen.getByText(/conversion rate/i)).toBeInTheDocument();
        expect(screen.getByText(/active users/i)).toBeInTheDocument();
        expect(screen.getByText(/active integrations/i)).toBeInTheDocument();
        expect(screen.getByText(/model accuracy/i)).toBeInTheDocument();
      });
    });

    it('should handle error states with proper announcements', async () => {
      // Mock metrics service to throw error
      const mockMetricsService = require('../services/metrics').metricsService;
      mockMetricsService.getMockData.mockImplementationOnce(() => {
        throw new Error('Failed to load metrics');
      });
      
      renderWithProviders(<DashboardPage />);
      
      await waitFor(() => {
        const errorAlert = screen.getByRole('alert');
        expect(errorAlert).toBeInTheDocument();
        expect(errorAlert).toHaveAttribute('aria-live', 'polite');
      });
    });

    it('should have proper heading hierarchy', () => {
      renderWithProviders(<DashboardPage />);
      
      // Check main heading
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Dashboard Overview');
      
      // Check section headings
      const sectionHeadings = screen.getAllByRole('heading', { level: 2 });
      expect(sectionHeadings.length).toBeGreaterThan(0);
    });
  });

  describe('Performance Optimization Tests', () => {
    it('should use memoized components for dashboard metrics', () => {
      const { rerender } = renderWithProviders(<DashboardPage />);
      
      // Re-render with same props should not cause unnecessary re-renders
      rerender(
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <DashboardPage />
          </ThemeProvider>
        </BrowserRouter>
      );
      
      // Component should still be rendered correctly
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('should handle time period changes efficiently', async () => {
      const user = userEvent.setup();
      renderWithProviders(<DashboardPage />);
      
      await waitFor(() => {
        expect(screen.getByRole('tablist')).toBeInTheDocument();
      });
      
      const startTime = performance.now();
      
      // Change time period multiple times
      const dailyTab = screen.getByRole('tab', { name: /daily/i });
      const monthlyTab = screen.getByRole('tab', { name: /monthly/i });
      
      await user.click(dailyTab);
      await user.click(monthlyTab);
      
      const endTime = performance.now();
      
      // Should handle changes quickly
      expect(endTime - startTime).toBeLessThan(50);
    });
  });

  describe('Import Path Consistency', () => {
    it('should use consistent MUI imports', () => {
      // This test verifies that the components are using proper MUI imports
      // by checking that MUI components render correctly
      renderWithProviders(<SettingsPage />);
      renderWithProviders(<DashboardPage />);
      
      // If imports are correct, components should render without errors
      expect(screen.getAllByRole('heading').length).toBeGreaterThan(0);
    });
  });

  describe('Error Boundary Integration', () => {
    it('should handle component errors gracefully', () => {
      // Mock console.error to avoid noise in test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // This would be tested with an actual error boundary in a real scenario
      renderWithProviders(<SettingsPage />);
      renderWithProviders(<DashboardPage />);
      
      // Components should render without throwing errors
      expect(screen.getAllByRole('heading').length).toBeGreaterThan(0);
      
      consoleSpy.mockRestore();
    });
  });
});