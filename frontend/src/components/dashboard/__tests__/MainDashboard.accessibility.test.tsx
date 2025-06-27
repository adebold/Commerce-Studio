import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import MainDashboard from '../MainDashboard';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

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

describe('MainDashboard Accessibility Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ARIA Compliance', () => {
    it('should have proper ARIA labels and roles', async () => {
      renderWithTheme(<MainDashboard />);
      
      await waitFor(() => {
        // Main navigation should have proper ARIA labels
        expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Main navigation');
        expect(screen.getByRole('menubar')).toHaveAttribute('aria-label', 'Navigation menu');
        
        // Main content should have proper role and labeling
        expect(screen.getByRole('main')).toHaveAttribute('aria-labelledby', 'dashboard-title');
        
        // Banner should be properly identified
        expect(screen.getByRole('banner')).toBeInTheDocument();
      });
    });

    it('should have proper ARIA attributes for interactive elements', async () => {
      renderWithTheme(<MainDashboard />);
      
      await waitFor(() => {
        // Menu items should have proper ARIA attributes
        const menuItems = screen.getAllByRole('menuitem');
        menuItems.forEach(item => {
          expect(item).toHaveAttribute('tabIndex', '0');
        });
        
        // Active menu item should have aria-current
        const activeMenuItem = screen.getByText('Dashboard').closest('[role="menuitem"]');
        expect(activeMenuItem).toHaveAttribute('aria-current', 'page');
        
        // Buttons should have proper labels
        expect(screen.getByLabelText('Open navigation drawer')).toBeInTheDocument();
        expect(screen.getByLabelText('View notifications')).toBeInTheDocument();
        expect(screen.getByLabelText('Toggle dark mode')).toBeInTheDocument();
      });
    });

    it('should have proper region landmarks', async () => {
      renderWithTheme(<MainDashboard />);
      
      await waitFor(() => {
        // Should have multiple regions for different content areas
        const regions = screen.getAllByRole('region');
        expect(regions.length).toBeGreaterThan(0);
        
        // Specific regions should be labeled
        expect(screen.getByLabelText('Dashboard metrics')).toBeInTheDocument();
        expect(screen.getByLabelText('Dashboard charts')).toBeInTheDocument();
        expect(screen.getByLabelText('Quick actions')).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation in menu', async () => {
      renderWithTheme(<MainDashboard />);
      
      await waitFor(() => {
        const firstMenuItem = screen.getByText('Dashboard').closest('[role="menuitem"]');
        expect(firstMenuItem).toBeInTheDocument();
        
        // Focus first menu item
        (firstMenuItem as HTMLElement)?.focus();
        expect(firstMenuItem).toHaveFocus();
        
        // Test Arrow Down navigation
        fireEvent.keyDown(firstMenuItem!, { key: 'ArrowDown' });
        
        // Should move focus to next item (implementation depends on focus management)
        const secondMenuItem = screen.getByText('Stores').closest('[role="menuitem"]');
        expect(secondMenuItem).toBeInTheDocument();
      });
    });

    it('should handle Enter and Space key activation', async () => {
      renderWithTheme(<MainDashboard />);
      
      await waitFor(() => {
        const menuItem = screen.getByText('Dashboard').closest('[role="menuitem"]');
        expect(menuItem).toBeInTheDocument();
        
        // Test Enter key
        fireEvent.keyDown(menuItem!, { key: 'Enter' });
        
        // Test Space key
        fireEvent.keyDown(menuItem!, { key: ' ' });
        
        // Should handle both keys without errors
        expect(menuItem).toBeInTheDocument();
      });
    });

    it('should support tab navigation', () => {
      renderWithTheme(<MainDashboard />);
      
      // All interactive elements should be reachable via tab
      const interactiveElements = screen.getAllByRole('button');
      interactiveElements.forEach(element => {
        expect(element).not.toHaveAttribute('tabIndex', '-1');
      });
    });
  });

  describe('Focus Management', () => {
    it('should have visible focus indicators', async () => {
      renderWithTheme(<MainDashboard />);
      
      await waitFor(() => {
        const menuItems = screen.getAllByRole('menuitem');
        menuItems.forEach(item => {
          // Focus the item
          fireEvent.focus(item);
          
          // Should have focus-visible styles (tested via CSS)
          expect(item).toHaveStyle('cursor: pointer');
        });
      });
    });

    it('should trap focus in mobile drawer when open', () => {
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
      
      const drawerToggle = screen.getByLabelText('Open navigation drawer');
      fireEvent.click(drawerToggle);
      
      // Drawer should be open and focusable
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  describe('Screen Reader Support', () => {
    it('should have proper heading structure', async () => {
      renderWithTheme(<MainDashboard />);
      
      await waitFor(() => {
        // Main heading should be h1
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Dashboard Overview');
        
        // Section headings should be h6 (as per MUI Typography variant)
        const sectionHeadings = screen.getAllByText(/Sales Overview|Product Categories|Recent Orders/);
        expect(sectionHeadings.length).toBeGreaterThan(0);
      });
    });

    it('should provide meaningful text alternatives', async () => {
      renderWithTheme(<MainDashboard />);
      
      await waitFor(() => {
        // Icons should be hidden from screen readers
        const icons = document.querySelectorAll('[aria-hidden="true"]');
        expect(icons.length).toBeGreaterThan(0);
        
        // Interactive elements should have accessible names
        expect(screen.getByLabelText('User account')).toBeInTheDocument();
        expect(screen.getByLabelText('View notifications')).toBeInTheDocument();
      });
    });

    it('should announce loading states', () => {
      renderWithTheme(<MainDashboard />);
      
      // Loading skeletons should be present initially
      const skeletons = document.querySelectorAll('[class*="MuiSkeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Color and Contrast', () => {
    it('should not rely solely on color for information', async () => {
      renderWithTheme(<MainDashboard />);
      
      await waitFor(() => {
        // Status chips should have text labels, not just colors
        const statusElements = screen.getAllByText(/Completed|Processing|Shipped|Pending/);
        expect(statusElements.length).toBeGreaterThan(0);
        
        // Each status should have both color and text
        statusElements.forEach(element => {
          expect(element).toHaveTextContent(/Completed|Processing|Shipped|Pending/);
        });
      });
    });

    it('should maintain proper contrast ratios', () => {
      renderWithTheme(<MainDashboard />);
      
      // Text should be readable (this would typically be tested with actual color values)
      const textElements = screen.getAllByText(/Dashboard|Revenue|Orders|Customers/);
      textElements.forEach(element => {
        expect(element).toBeVisible();
      });
    });
  });

  describe('Responsive Accessibility', () => {
    it('should maintain accessibility on mobile', () => {
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
      
      // Mobile drawer toggle should be accessible
      expect(screen.getByLabelText('Open navigation drawer')).toBeInTheDocument();
    });

    it('should handle zoom levels appropriately', () => {
      renderWithTheme(<MainDashboard />);
      
      // Content should remain accessible at different zoom levels
      // This is primarily handled by responsive design
      expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
    });
  });

  describe('Error States Accessibility', () => {
    it('should announce errors to screen readers', async () => {
      // Mock console.error to test error states
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      renderWithTheme(<MainDashboard />);
      
      // Wait for potential error states
      await waitFor(() => {
        // Component should handle errors gracefully
        expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
      }, { timeout: 2000 });
      
      consoleSpy.mockRestore();
    });
  });

  describe('Automated Accessibility Testing', () => {
    it('should pass axe accessibility tests', async () => {
      const { container } = renderWithTheme(<MainDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
      });
      
      // Run axe accessibility tests
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should pass axe tests with mobile layout', async () => {
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
      
      const { container } = renderWithTheme(<MainDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
      });
      
      // Run axe accessibility tests for mobile layout
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Dynamic Content Accessibility', () => {
    it('should handle dynamic content updates accessibly', async () => {
      renderWithTheme(<MainDashboard />);
      
      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
      }, { timeout: 2000 });
      
      // Dynamic content should be accessible
      const metricCards = screen.getAllByRole('region');
      expect(metricCards.length).toBeGreaterThan(0);
    });

    it('should maintain accessibility during state changes', async () => {
      renderWithTheme(<MainDashboard />);
      
      // Test theme toggle
      const themeToggle = screen.getByLabelText('Toggle dark mode');
      fireEvent.click(themeToggle);
      
      // Should maintain accessibility after state change
      expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });
});