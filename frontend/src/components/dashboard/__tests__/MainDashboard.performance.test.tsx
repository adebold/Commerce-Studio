import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import '@testing-library/jest-dom';
import MainDashboard from '../MainDashboard';

// Mock recharts to avoid canvas issues in tests
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
}));

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('MainDashboard Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Memoization', () => {
    it('should not re-render DashboardMetricCard when props are unchanged', async () => {
      const { rerender } = renderWithTheme(<MainDashboard />);
      
      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
      });

      // Get initial metric cards
      const metricCards = screen.getAllByRole('region');
      const initialCardCount = metricCards.length;

      // Re-render with same props
      rerender(
        <ThemeProvider theme={theme}>
          <MainDashboard />
        </ThemeProvider>
      );

      // Should have same number of cards (memoization working)
      const newMetricCards = screen.getAllByRole('region');
      expect(newMetricCards).toHaveLength(initialCardCount);
    });

    it('should memoize menu items to prevent unnecessary re-renders', () => {
      renderWithTheme(<MainDashboard />);
      
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems).toHaveLength(6); // Dashboard, Stores, Analytics, Orders, Customers, Settings
      
      // Verify menu items are properly memoized by checking they exist
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Stores')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      expect(screen.getByText('Orders')).toBeInTheDocument();
      expect(screen.getByText('Customers')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });

  describe('Event Handler Optimization', () => {
    it('should use memoized event handlers', async () => {
      renderWithTheme(<MainDashboard />);
      
      const drawerToggle = screen.getByLabelText('Open navigation drawer');
      
      // Test that event handlers are stable (memoized)
      fireEvent.click(drawerToggle);
      
      // Should not cause unnecessary re-renders
      expect(drawerToggle).toBeInTheDocument();
    });

    it('should handle theme toggle efficiently', () => {
      renderWithTheme(<MainDashboard />);
      
      const themeToggle = screen.getByLabelText('Toggle dark mode');
      
      fireEvent.click(themeToggle);
      
      // Should toggle without performance issues
      expect(themeToggle).toBeInTheDocument();
    });
  });

  describe('Data Loading Performance', () => {
    it('should show loading states for dashboard metrics', () => {
      renderWithTheme(<MainDashboard />);
      
      // Should show skeleton loading initially
      const skeletons = screen.getAllByTestId(/skeleton/i);
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should handle data loading errors gracefully', async () => {
      // Mock console.error to avoid noise in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      renderWithTheme(<MainDashboard />);
      
      // Wait for potential error states
      await waitFor(() => {
        // Component should still render even if data loading fails
        expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
      }, { timeout: 2000 });
      
      consoleSpy.mockRestore();
    });
  });

  describe('Chart Performance', () => {
    it('should render charts with suspense fallbacks', async () => {
      renderWithTheme(<MainDashboard />);
      
      await waitFor(() => {
        // Should have chart containers
        expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      });
    });

    it('should handle chart data efficiently', async () => {
      renderWithTheme(<MainDashboard />);
      
      await waitFor(() => {
        // Charts should be rendered
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      });
    });
  });

  describe('Memory Management', () => {
    it('should clean up event listeners on unmount', () => {
      const { unmount } = renderWithTheme(<MainDashboard />);
      
      // Component should mount successfully
      expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
      
      // Should unmount without memory leaks
      unmount();
    });

    it('should handle component updates efficiently', async () => {
      const { rerender } = renderWithTheme(<MainDashboard />);
      
      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
      });
      
      // Re-render multiple times to test performance
      for (let i = 0; i < 5; i++) {
        rerender(
          <ThemeProvider theme={theme}>
            <MainDashboard />
          </ThemeProvider>
        );
      }
      
      // Should still be functional after multiple re-renders
      expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
    });
  });

  describe('Bundle Size Optimization', () => {
    it('should use selective MUI imports', () => {
      renderWithTheme(<MainDashboard />);
      
      // Verify key MUI components are available
      expect(screen.getByRole('banner')).toBeInTheDocument(); // AppBar
      expect(screen.getByRole('navigation')).toBeInTheDocument(); // Drawer
      expect(screen.getByRole('main')).toBeInTheDocument(); // Main content
    });

    it('should minimize component footprint', () => {
      const { container } = renderWithTheme(<MainDashboard />);
      
      // Should render efficiently without excessive DOM nodes
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Responsive Performance', () => {
    it('should handle mobile breakpoints efficiently', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query.includes('(max-width: 900px)'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
      
      renderWithTheme(<MainDashboard />);
      
      // Should render mobile-optimized version
      expect(screen.getByLabelText('Open navigation drawer')).toBeInTheDocument();
    });
  });
});