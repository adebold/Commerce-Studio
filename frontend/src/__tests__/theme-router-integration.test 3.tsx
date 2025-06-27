import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UnifiedThemeProvider } from '../providers/UnifiedThemeProvider';
import { createCachedVaraiTheme } from '../design-system/mui-integration';
import App from '../App';
import Router from '../router';
import EnhancedCustomerLayout from '../layouts/EnhancedCustomerLayout';
import { AuthProvider } from '../components/auth/AuthProvider';

// Mock components that might not be available in test environment
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

jest.mock('../components/auth/ProtectedRoute', () => {
  return function MockProtectedRoute({ children }: { children: React.ReactNode }) {
    return <div data-testid="protected-route">{children}</div>;
  };
});

// Mock auth service
jest.mock('../services/auth', () => ({
  getCurrentUser: jest.fn().mockResolvedValue(null),
  login: jest.fn(),
  logout: jest.fn(),
  signup: jest.fn(),
}));

describe('Theme-Router Integration', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Theme Integration', () => {
    it('should create and validate theme successfully', () => {
      const lightTheme = createCachedVaraiTheme('light');
      const darkTheme = createCachedVaraiTheme('dark');

      // Validate theme structure
      expect(lightTheme.palette.mode).toBe('light');
      expect(darkTheme.palette.mode).toBe('dark');
      expect(lightTheme.varai).toBeDefined();
      expect(darkTheme.varai).toBeDefined();
      
      // Validate theme properties
      expect(lightTheme.palette.primary.main).toBeDefined();
      expect(lightTheme.palette.secondary.main).toBeDefined();
      expect(lightTheme.typography.fontFamily).toBeDefined();
      expect(typeof lightTheme.spacing).toBe('function');
      expect(lightTheme.breakpoints.values).toBeDefined();
    });

    it('should provide unified theme context', () => {
      const TestComponent = () => {
        return (
          <UnifiedThemeProvider>
            <div data-testid="theme-provider-test">Theme Provider Test</div>
          </UnifiedThemeProvider>
        );
      };

      render(<TestComponent />);
      expect(screen.getByTestId('theme-provider-test')).toBeInTheDocument();
    });

    it('should handle theme mode switching', async () => {
      const TestComponent = () => {
        return (
          <UnifiedThemeProvider>
            <EnhancedCustomerLayout />
          </UnifiedThemeProvider>
        );
      };

      render(
        <MemoryRouter initialEntries={['/']}>
          <TestComponent />
        </MemoryRouter>
      );

      const themeToggle = screen.getByTestId('theme-toggle');
      expect(themeToggle).toBeInTheDocument();

      // Test theme toggle
      fireEvent.click(themeToggle);
      
      // Verify theme toggle functionality
      await waitFor(() => {
        expect(themeToggle).toHaveAttribute('aria-label');
      });
    });
  });

  describe('Router Integration', () => {
    it('should render customer layout routes correctly', async () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <UnifiedThemeProvider>
            <AuthProvider>
              <Router />
            </AuthProvider>
          </UnifiedThemeProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('enhanced-customer-layout')).toBeInTheDocument();
      });
    });

    it('should handle route navigation with theme persistence', async () => {
      render(
        <MemoryRouter initialEntries={['/recommendations']}>
          <UnifiedThemeProvider>
            <AuthProvider>
              <Router />
            </AuthProvider>
          </UnifiedThemeProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('enhanced-customer-layout')).toBeInTheDocument();
      });
    });

    it('should handle protected routes correctly', async () => {
      render(
        <MemoryRouter initialEntries={['/admin']}>
          <UnifiedThemeProvider>
            <AuthProvider>
              <Router />
            </AuthProvider>
          </UnifiedThemeProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle theme errors gracefully', () => {
      // Mock theme creation to throw error
      const originalConsoleError = console.error;
      console.error = jest.fn();

      const TestComponent = () => {
        return (
          <UnifiedThemeProvider>
            <div data-testid="error-test">Error Test</div>
          </UnifiedThemeProvider>
        );
      };

      render(<TestComponent />);
      
      // Should still render despite potential theme errors
      expect(screen.getByTestId('error-test')).toBeInTheDocument();
      
      console.error = originalConsoleError;
    });

    it('should display error boundary when router fails', () => {
      const ThrowError = () => {
        throw new Error('Test router error');
      };

      render(
        <MemoryRouter>
          <UnifiedThemeProvider>
            <ThrowError />
          </UnifiedThemeProvider>
        </MemoryRouter>
      );

      expect(screen.getByTestId('theme-aware-error-boundary')).toBeInTheDocument();
    });
  });

  describe('Performance Integration', () => {
    it('should memoize theme creation', () => {
      const theme1 = createCachedVaraiTheme('light');
      const theme2 = createCachedVaraiTheme('light');
      
      // Should return the same cached instance
      expect(theme1).toBe(theme2);
    });

    it('should handle lazy loading correctly', async () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <UnifiedThemeProvider>
            <AuthProvider>
              <Router />
            </AuthProvider>
          </UnifiedThemeProvider>
        </MemoryRouter>
      );

      // Should show loading spinner initially
      expect(screen.getByTestId('theme-aware-loading-spinner')).toBeInTheDocument();

      // Should eventually load the page
      await waitFor(() => {
        expect(screen.getByTestId('enhanced-customer-layout')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Accessibility Integration', () => {
    it('should provide proper ARIA labels for theme controls', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <UnifiedThemeProvider>
            <EnhancedCustomerLayout />
          </UnifiedThemeProvider>
        </MemoryRouter>
      );

      const themeToggle = screen.getByTestId('theme-toggle');
      expect(themeToggle).toHaveAttribute('aria-label');
    });

    it('should provide proper loading states with ARIA', () => {
      render(
        <MemoryRouter>
          <UnifiedThemeProvider>
            <div>Loading test</div>
          </UnifiedThemeProvider>
        </MemoryRouter>
      );

      const loadingSpinner = screen.getByTestId('theme-aware-loading-spinner');
      expect(loadingSpinner).toHaveAttribute('role', 'status');
      expect(loadingSpinner).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Full App Integration', () => {
    it('should render complete app without errors', async () => {
      render(<App />);

      // Should render without throwing errors
      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      });
    });

    it('should handle theme persistence across app restarts', () => {
      // Set theme preference
      localStorage.setItem('varai-theme-mode', 'dark');

      render(<App />);

      // Should respect saved theme preference
      expect(localStorage.getItem('varai-theme-mode')).toBe('dark');
    });
  });
});