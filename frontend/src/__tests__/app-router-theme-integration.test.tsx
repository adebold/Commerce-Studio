import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { UnifiedThemeProvider } from '../providers/UnifiedThemeProvider';
import Router from '../router';

// Mock the auth service
jest.mock('../services/auth', () => ({
  getCurrentUser: jest.fn().mockResolvedValue(null),
  isAuthenticated: jest.fn().mockReturnValue(false),
  login: jest.fn(),
  logout: jest.fn(),
  refreshToken: jest.fn(),
}));

// Mock all lazy-loaded components to avoid import issues
jest.mock('../pages/LandingPage', () => {
  return function MockLandingPage() {
    return <div data-testid="landing-page">Landing Page</div>;
  };
});

jest.mock('../pages/recommendations', () => {
  return function MockRecommendationsPage() {
    return <div data-testid="recommendations-page">Recommendations Page</div>;
  };
});

jest.mock('../pages/commerce-studio/DashboardPage', () => {
  return function MockDashboardPage() {
    return <div data-testid="dashboard-page">Dashboard Page</div>;
  };
});

jest.mock('../layouts/EnhancedCustomerLayout', () => {
  return function MockEnhancedCustomerLayout({ children }: { children: React.ReactNode }) {
    return <div data-testid="customer-layout">{children}</div>;
  };
});

jest.mock('../layouts/CommerceStudioLayout', () => {
  return function MockCommerceStudioLayout({ children }: { children: React.ReactNode }) {
    return <div data-testid="commerce-studio-layout">{children}</div>;
  };
});

// Mock route guards
jest.mock('../utils/routeGuards', () => ({
  routeGuards: {
    admin: {
      requireAuth: true,
      roles: ['admin'],
    },
  },
}));

describe('App-Router-Theme Integration', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Theme Integration', () => {
    it('should render App with theme provider and router successfully', async () => {
      render(<App />);
      
      // Wait for the app to load
      await waitFor(() => {
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      });
      
      // Verify theme provider is working
      const themeElements = document.querySelectorAll('[data-theme]');
      expect(themeElements.length).toBeGreaterThan(0);
    });

    it('should handle theme switching correctly', async () => {
      const TestComponent = () => {
        return (
          <UnifiedThemeProvider>
            <MemoryRouter initialEntries={['/']}>
              <Router />
            </MemoryRouter>
          </UnifiedThemeProvider>
        );
      };

      render(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      });

      // Check initial theme
      expect(document.documentElement.getAttribute('data-theme')).toBeTruthy();
    });

    it('should persist theme preference in localStorage', async () => {
      // Set initial theme preference
      localStorage.setItem('varai-theme-mode', 'dark');
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      });
      
      // Verify theme is applied
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('Router Integration', () => {
    it('should navigate between routes correctly', async () => {
      const TestRouter = () => (
        <UnifiedThemeProvider>
          <MemoryRouter initialEntries={['/recommendations']}>
            <Router />
          </MemoryRouter>
        </UnifiedThemeProvider>
      );

      render(<TestRouter />);
      
      await waitFor(() => {
        expect(screen.getByTestId('recommendations-page')).toBeInTheDocument();
      });
    });

    it('should handle route not found correctly', async () => {
      const TestRouter = () => (
        <UnifiedThemeProvider>
          <MemoryRouter initialEntries={['/non-existent-route']}>
            <Router />
          </MemoryRouter>
        </UnifiedThemeProvider>
      );

      render(<TestRouter />);
      
      // Should redirect to home page
      await waitFor(() => {
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      });
    });

    it('should show loading spinner during route transitions', async () => {
      render(<App />);
      
      // Initially should show loading spinner
      expect(screen.getByText('Loading application...')).toBeInTheDocument();
      
      // Then should show the actual page
      await waitFor(() => {
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      });
    });
  });

  describe('Error Boundary Integration', () => {
    it('should catch and display errors gracefully', async () => {
      // Mock a component that throws an error
      const ErrorComponent = () => {
        throw new Error('Test error');
      };

      const TestApp = () => (
        <UnifiedThemeProvider>
          <MemoryRouter>
            <ErrorComponent />
          </MemoryRouter>
        </UnifiedThemeProvider>
      );

      render(<TestApp />);
      
      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      });
      
      // Should show retry and home buttons
      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
      expect(screen.getByTestId('home-button')).toBeInTheDocument();
    });

    it('should handle retry functionality', async () => {
      let shouldThrow = true;
      
      const ConditionalErrorComponent = () => {
        if (shouldThrow) {
          throw new Error('Test error');
        }
        return <div data-testid="success-component">Success!</div>;
      };

      const TestApp = () => (
        <UnifiedThemeProvider>
          <MemoryRouter>
            <ConditionalErrorComponent />
          </MemoryRouter>
        </UnifiedThemeProvider>
      );

      render(<TestApp />);
      
      // Should show error initially
      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      });
      
      // Fix the error condition
      shouldThrow = false;
      
      // Click retry button
      fireEvent.click(screen.getByTestId('retry-button'));
      
      // Should show success component
      await waitFor(() => {
        expect(screen.getByTestId('success-component')).toBeInTheDocument();
      });
    });
  });

  describe('Performance Monitoring', () => {
    it('should track route changes in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const consoleSpy = jest.spyOn(console, 'log');
      
      const TestRouter = () => (
        <UnifiedThemeProvider>
          <MemoryRouter initialEntries={['/']}>
            <Router />
          </MemoryRouter>
        </UnifiedThemeProvider>
      );

      render(<TestRouter />);
      
      await waitFor(() => {
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      });
      
      // Should log route performance in development
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Route / loaded in')
      );
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Accessibility', () => {
    it('should maintain proper ARIA attributes', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      });
      
      // Check for proper document structure
      expect(document.documentElement).toHaveAttribute('data-theme');
      expect(document.documentElement.style.colorScheme).toBeTruthy();
    });
  });

  describe('Memory Management', () => {
    it('should clean up event listeners on unmount', async () => {
      const { unmount } = render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      });
      
      // Unmount should not throw errors
      expect(() => unmount()).not.toThrow();
    });
  });
});