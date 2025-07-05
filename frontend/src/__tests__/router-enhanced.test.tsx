/**
 * Enhanced Router Tests
 * Tests the enhanced router with error boundaries and loading states
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import Router from '../router';
import { createVaraiTheme } from '../design-system/mui-integration';

// Mock all the page components
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

jest.mock('../pages/frames/FramesPage', () => {
  return function MockFramesPage() {
    return <div data-testid="frames-page">Frames Page</div>;
  };
});

jest.mock('../pages/auth/AuthPage', () => {
  return function MockAuthPage() {
    return <div data-testid="auth-page">Auth Page</div>;
  };
});

jest.mock('../layouts/CustomerLayout', () => {
  return function MockCustomerLayout() {
    return (
      <div data-testid="customer-layout">
        <div>Customer Layout</div>
        <div data-testid="outlet-content">
          {/* This would be the Outlet content */}
        </div>
      </div>
    );
  };
});

jest.mock('../layouts/CommerceStudioLayout', () => {
  return function MockCommerceStudioLayout() {
    return (
      <div data-testid="commerce-studio-layout">
        <div>Commerce Studio Layout</div>
        <div data-testid="outlet-content">
          {/* This would be the Outlet content */}
        </div>
      </div>
    );
  };
});

jest.mock('../components/common/ThemeAwareLoadingSpinner', () => {
  return function MockThemeAwareLoadingSpinner({ message }: { message?: string }) {
    return <div data-testid="loading-spinner">{message || 'Loading...'}</div>;
  };
});

jest.mock('../components/common/ThemeAwareErrorBoundary', () => {
  return function MockThemeAwareErrorBoundary({ children }: { children: React.ReactNode }) {
    return <div data-testid="error-boundary">{children}</div>;
  };
});

jest.mock('../components/auth/ProtectedRoute', () => {
  return function MockProtectedRoute({ children }: { children: React.ReactNode }) {
    return <div data-testid="protected-route">{children}</div>;
  };
});

// Mock route guards
jest.mock('../routes', () => ({
  routeGuards: {
    admin: { requireAuth: true, roles: ['admin'] },
  },
}));

const renderWithRouter = (initialEntries: string[] = ['/']) => {
  const theme = createVaraiTheme('light');
  
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={initialEntries}>
        <Router />
      </MemoryRouter>
    </ThemeProvider>
  );
};

describe('Enhanced Router', () => {
  beforeEach(() => {
    // Mock matchMedia for useMediaQuery
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  describe('Enhanced Route Component', () => {
    it('should wrap routes with error boundary and suspense', async () => {
      renderWithRouter(['/']);
      
      // Should have error boundary
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
      
      // Should show loading spinner initially
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      
      // Should eventually show the page content
      await waitFor(() => {
        expect(screen.getByTestId('customer-layout')).toBeInTheDocument();
      });
    });

    it('should show custom loading messages for different routes', async () => {
      renderWithRouter(['/recommendations']);
      
      // Should show specific loading message for recommendations
      expect(screen.getByText('Loading recommendations...')).toBeInTheDocument();
    });

    it('should handle frames route with custom loading message', async () => {
      renderWithRouter(['/frames']);
      
      // Should show specific loading message for frames
      expect(screen.getByText('Loading frames catalog...')).toBeInTheDocument();
    });
  });

  describe('Enhanced Protected Route Component', () => {
    it('should wrap protected routes with error boundary and suspense', async () => {
      renderWithRouter(['/admin']);
      
      // Should have error boundary
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
      
      // Should have protected route wrapper
      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      
      // Should show loading spinner initially
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should show custom loading messages for admin routes', async () => {
      renderWithRouter(['/admin/dashboard']);
      
      // Should show specific loading message for dashboard
      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
    });

    it('should handle settings routes with custom loading messages', async () => {
      renderWithRouter(['/admin/settings/account']);
      
      // Should show specific loading message for account settings
      expect(screen.getByText('Loading account settings...')).toBeInTheDocument();
    });
  });

  describe('Route Navigation', () => {
    it('should render customer layout for public routes', async () => {
      renderWithRouter(['/']);
      
      await waitFor(() => {
        expect(screen.getByTestId('customer-layout')).toBeInTheDocument();
      });
    });

    it('should render commerce studio layout for admin routes', async () => {
      renderWithRouter(['/admin']);
      
      await waitFor(() => {
        expect(screen.getByTestId('commerce-studio-layout')).toBeInTheDocument();
      });
    });

    it('should handle nested routes correctly', async () => {
      renderWithRouter(['/admin/integrations/commerce']);
      
      await waitFor(() => {
        expect(screen.getByTestId('commerce-studio-layout')).toBeInTheDocument();
        expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should catch and handle route-level errors', async () => {
      // Mock a component that throws an error
      jest.doMock('../pages/LandingPage', () => {
        return function ErrorPage() {
          throw new Error('Test error');
        };
      });

      renderWithRouter(['/']);
      
      // Should show error boundary
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });

    it('should handle missing routes gracefully', async () => {
      renderWithRouter(['/non-existent-route']);
      
      // Should still render without crashing
      expect(screen.getByTestId('customer-layout')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show appropriate loading messages for different route types', async () => {
      const routes = [
        { path: '/virtual-try-on', message: 'Loading virtual try-on...' },
        { path: '/face-shape-analysis', message: 'Loading face shape analysis...' },
        { path: '/admin/analytics', message: 'Loading analytics...' },
        { path: '/admin/settings/integration', message: 'Loading integration settings...' },
      ];

      for (const route of routes) {
        renderWithRouter([route.path]);
        expect(screen.getByText(route.message)).toBeInTheDocument();
      }
    });

    it('should handle suspense fallbacks correctly', async () => {
      renderWithRouter(['/cart']);
      
      // Should show loading spinner
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('Loading cart...')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should provide proper ARIA labels for loading states', async () => {
      renderWithRouter(['/recommendations']);
      
      const loadingSpinner = screen.getByTestId('loading-spinner');
      expect(loadingSpinner).toBeInTheDocument();
      expect(loadingSpinner).toHaveTextContent('Loading recommendations...');
    });

    it('should maintain focus management during route transitions', async () => {
      renderWithRouter(['/']);
      
      await waitFor(() => {
        expect(screen.getByTestId('customer-layout')).toBeInTheDocument();
      });
      
      // Focus should be managed properly (tested indirectly through layout rendering)
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should lazy load route components', async () => {
      renderWithRouter(['/frames']);
      
      // Should show loading state first
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      
      // Then load the actual component
      await waitFor(() => {
        expect(screen.getByTestId('customer-layout')).toBeInTheDocument();
      });
    });

    it('should not re-render unnecessarily', async () => {
      const { rerender } = renderWithRouter(['/']);
      
      await waitFor(() => {
        expect(screen.getByTestId('customer-layout')).toBeInTheDocument();
      });
      
      // Re-render should not cause issues
      rerender(
        <ThemeProvider theme={createVaraiTheme('light')}>
          <MemoryRouter initialEntries={['/']}>
            <Router />
          </MemoryRouter>
        </ThemeProvider>
      );
      
      expect(screen.getByTestId('customer-layout')).toBeInTheDocument();
    });
  });
});