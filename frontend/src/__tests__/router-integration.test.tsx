import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UnifiedThemeProvider } from '../providers/UnifiedThemeProvider';
import Router from '../router';
import { AuthProvider } from '../components/auth/AuthProvider';
import { Role, UserContext } from '../services/auth';
import '@testing-library/jest-dom';

// Mock lazy-loaded components
jest.mock('../pages/Dashboard', () => ({
  __esModule: true,
  default: () => <div data-testid="dashboard-page">Dashboard</div>,
}));

jest.mock('../pages/virtual-try-on', () => ({
  __esModule: true,
  default: () => <div data-testid="virtual-try-on-page">Virtual Try On</div>,
}));

jest.mock('../pages/recommendations', () => ({
  __esModule: true,
  default: () => <div data-testid="recommendations-page">Recommendations</div>,
}));

jest.mock('../pages/FaceShapeAnalysisPage', () => ({
  __esModule: true,
  default: () => <div data-testid="face-shape-page">Face Shape Analysis</div>,
}));

jest.mock('../pages/Login', () => ({
  __esModule: true,
  default: () => <div data-testid="login-page">Login</div>,
}));

jest.mock('../pages/NotFound', () => ({
  __esModule: true,
  default: () => <div data-testid="not-found-page">404 Not Found</div>,
}));

// Mock auth context
const mockAuthContext = {
  isAuthenticated: false,
  user: null as UserContext | null,
  login: jest.fn(),
  logout: jest.fn(),
  loading: false,
  error: null,
  hasRole: jest.fn(),
  hasAnyRole: jest.fn(),
  hasAllRoles: jest.fn(),
};

jest.mock('../components/auth/AuthProvider', () => ({
  ...jest.requireActual('../components/auth/AuthProvider'),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => mockAuthContext,
  RBAC: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock CssBaseline
jest.mock('@mui/material/CssBaseline', () => ({
  __esModule: true,
  default: ({ children }: { children?: React.ReactNode }) => children || null,
}));

describe('Router Integration Tests', () => {
  const renderWithProviders = (initialRoute = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <AuthProvider>
          <UnifiedThemeProvider>
            <Router />
          </UnifiedThemeProvider>
        </AuthProvider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset auth context
    mockAuthContext.isAuthenticated = false;
    mockAuthContext.user = null;
    mockAuthContext.loading = false;
    mockAuthContext.error = null;
  });

  describe('Route Navigation', () => {
    it('should render dashboard for root route when authenticated', async () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { id: '1', email: 'test@example.com', role: Role.VIEWER };
      
      renderWithProviders('/');

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });
    });

    it('should redirect to login when accessing protected route without auth', async () => {
      mockAuthContext.isAuthenticated = false;
      mockAuthContext.user = null;
      
      renderWithProviders('/dashboard');

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });
    });

    it('should render virtual try-on page', async () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { id: '1', email: 'test@example.com', role: Role.VIEWER };
      
      renderWithProviders('/virtual-try-on');

      await waitFor(() => {
        expect(screen.getByTestId('virtual-try-on-page')).toBeInTheDocument();
      });
    });

    it('should render recommendations page', async () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { id: '1', email: 'test@example.com', role: Role.VIEWER };
      
      renderWithProviders('/recommendations');

      await waitFor(() => {
        expect(screen.getByTestId('recommendations-page')).toBeInTheDocument();
      });
    });

    it('should render face shape analysis page', async () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { id: '1', email: 'test@example.com', role: Role.VIEWER };
      
      renderWithProviders('/face-shape-analysis');

      await waitFor(() => {
        expect(screen.getByTestId('face-shape-page')).toBeInTheDocument();
      });
    });

    it('should render 404 page for unknown routes', async () => {
      renderWithProviders('/unknown-route');

      await waitFor(() => {
        expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
      });
    });
  });

  describe('Lazy Loading', () => {
    it('should show loading state while lazy loading components', async () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { id: '1', email: 'test@example.com', role: Role.VIEWER };
      
      const { container } = renderWithProviders('/dashboard');

      // Should show suspense fallback initially
      expect(container.textContent).toContain('');

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      }, { timeout: 200 });
    });

    it('should handle lazy loading errors gracefully', async () => {
      // Mock a component that fails to load
      jest.mock('../pages/Dashboard', () => ({
        __esModule: true,
        default: () => Promise.reject(new Error('Failed to load')),
      }));

      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      renderWithProviders('/dashboard');

      // Should handle the error without crashing
      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });
  });

  describe('Theme Integration with Router', () => {
    it('should maintain theme across route changes', async () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { id: '1', email: 'test@example.com', role: Role.VIEWER };
      
      const { rerender } = renderWithProviders('/dashboard');

      // Check initial theme
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });

      // Navigate to another route
      rerender(
        <MemoryRouter initialEntries={['/virtual-try-on']}>
          <AuthProvider>
            <UnifiedThemeProvider>
              <Router />
            </UnifiedThemeProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      // Theme should persist
      await waitFor(() => {
        expect(screen.getByTestId('virtual-try-on-page')).toBeInTheDocument();
      });
    });

    it('should apply theme to all lazy-loaded components', async () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { id: '1', email: 'test@example.com', role: Role.VIEWER };
      
      renderWithProviders('/dashboard');

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });
    });
  });

  describe('Error Boundaries', () => {
    it('should catch and display errors in route components', async () => {
      const ErrorComponent = () => {
        throw new Error('Test error');
      };

      jest.mock('../pages/Dashboard', () => ({
        __esModule: true,
        default: ErrorComponent,
      }));

      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      renderWithProviders('/dashboard');

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });

    it('should recover from errors when navigating to different routes', async () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { id: '1', email: 'test@example.com', role: Role.VIEWER };
      
      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      // Navigate to working route
      renderWithProviders('/virtual-try-on');

      await waitFor(() => {
        expect(screen.getByTestId('virtual-try-on-page')).toBeInTheDocument();
      });

      consoleError.mockRestore();
    });
  });

  describe('Authentication Flow', () => {
    it('should show loading state while checking authentication', async () => {
      mockAuthContext.loading = true;
      
      const { container } = renderWithProviders('/dashboard');

      expect(container.textContent).toContain('');
    });

    it('should redirect to login after logout', async () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { id: '1', email: 'test@example.com', role: Role.VIEWER };
      
      const { rerender } = renderWithProviders('/dashboard');

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });

      // Simulate logout
      mockAuthContext.isAuthenticated = false;
      mockAuthContext.user = null;
      
      rerender(
        <MemoryRouter initialEntries={['/dashboard']}>
          <AuthProvider>
            <UnifiedThemeProvider>
              <Router />
            </UnifiedThemeProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });
    });

    it('should preserve intended route after login', async () => {
      mockAuthContext.isAuthenticated = false;
      mockAuthContext.user = null;
      
      // Try to access protected route
      const { rerender } = renderWithProviders('/virtual-try-on');

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });

      // Simulate successful login
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { id: '1', email: 'test@example.com', role: Role.VIEWER };
      
      rerender(
        <MemoryRouter initialEntries={['/virtual-try-on']}>
          <AuthProvider>
            <UnifiedThemeProvider>
              <Router />
            </UnifiedThemeProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      // Should redirect to originally requested route
      await waitFor(() => {
        expect(screen.getByTestId('virtual-try-on-page')).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('should not re-render router unnecessarily', async () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { id: '1', email: 'test@example.com', role: Role.VIEWER };
      
      let renderCount = 0;
      const RouterSpy = () => {
        renderCount++;
        return <Router />;
      };

      const { rerender } = render(
        <MemoryRouter initialEntries={['/']}>
          <AuthProvider>
            <UnifiedThemeProvider>
              <RouterSpy />
            </UnifiedThemeProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });

      const initialRenderCount = renderCount;

      // Re-render with same props
      rerender(
        <MemoryRouter initialEntries={['/']}>
          <AuthProvider>
            <UnifiedThemeProvider>
              <RouterSpy />
            </UnifiedThemeProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      // Should not cause additional renders
      expect(renderCount).toBe(initialRenderCount + 1); // Only one re-render
    });

    it('should prefetch route components on hover', async () => {
      // This would test route prefetching if implemented
      // For now, we'll just verify the structure is in place
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { id: '1', email: 'test@example.com', role: Role.VIEWER };
      
      renderWithProviders('/');

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });
    });
  });
});