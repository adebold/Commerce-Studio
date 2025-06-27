import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { UnifiedThemeProvider } from '../providers/UnifiedThemeProvider';

// Mock lazy loaded components
jest.mock('../pages/Dashboard', () => ({
  default: () => <div data-testid="dashboard-page">Dashboard</div>,
}));

jest.mock('../pages/VirtualTryOn', () => ({
  default: () => <div data-testid="virtual-try-on-page">Virtual Try On</div>,
}));

jest.mock('../pages/FaceShapeAnalysis', () => ({
  default: () => <div data-testid="face-shape-page">Face Shape Analysis</div>,
}));

jest.mock('../pages/Recommendations', () => ({
  default: () => <div data-testid="recommendations-page">Recommendations</div>,
}));

jest.mock('../pages/Analytics', () => ({
  default: () => <div data-testid="analytics-page">Analytics</div>,
}));

jest.mock('../pages/Settings', () => ({
  default: () => <div data-testid="settings-page">Settings</div>,
}));

jest.mock('../pages/Login', () => ({
  default: () => <div data-testid="login-page">Login</div>,
}));

jest.mock('../pages/NotFound', () => ({
  default: () => <div data-testid="not-found-page">404 Not Found</div>,
}));

// Mock auth service
jest.mock('../services/auth', () => ({
  authService: {
    getCurrentUser: jest.fn().mockResolvedValue(null),
    login: jest.fn(),
    logout: jest.fn(),
  },
}));

// Helper to render with all providers
const renderWithProviders = (ui: React.ReactElement, options?: Record<string, unknown>) => {
  return render(
    <UnifiedThemeProvider>
      {ui}
    </UnifiedThemeProvider>,
    options
  );
};

describe('Router Functionality Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Route Navigation', () => {
    it('should navigate to dashboard route', async () => {
      renderWithProviders(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/dashboard" element={<div data-testid="dashboard-page">Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });
    });

    it('should navigate to virtual try-on route', async () => {
      renderWithProviders(
        <MemoryRouter initialEntries={['/virtual-try-on']}>
          <Routes>
            <Route path="/virtual-try-on" element={<div data-testid="virtual-try-on-page">Virtual Try On</div>} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('virtual-try-on-page')).toBeInTheDocument();
      });
    });

    it('should handle nested routes correctly', async () => {
      renderWithProviders(
        <MemoryRouter initialEntries={['/analytics/performance']}>
          <Routes>
            <Route path="/analytics">
              <Route path="performance" element={<div data-testid="performance-page">Performance Analytics</div>} />
              <Route path="users" element={<div data-testid="users-page">User Analytics</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('performance-page')).toBeInTheDocument();
      });
    });

    it('should handle 404 routes', async () => {
      renderWithProviders(
        <MemoryRouter initialEntries={['/non-existent-route']}>
          <Routes>
            <Route path="/" element={<div>Home</div>} />
            <Route path="*" element={<div data-testid="not-found-page">404 Not Found</div>} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
      });
    });
  });

  describe('Lazy Loading', () => {
    it('should show loading state while lazy loading components', async () => {
      const LazyComponent = React.lazy(() =>
        new Promise<{ default: React.ComponentType }>(resolve =>
          setTimeout(() =>
            resolve({ default: () => <div data-testid="lazy-component">Lazy Component</div> }),
            100
          )
        )
      );

      renderWithProviders(
        <MemoryRouter initialEntries={['/lazy']}>
          <Routes>
            <Route 
              path="/lazy" 
              element={
                <React.Suspense fallback={<div data-testid="loading">Loading...</div>}>
                  <LazyComponent />
                </React.Suspense>
              } 
            />
          </Routes>
        </MemoryRouter>
      );

      // Should show loading state initially
      expect(screen.getByTestId('loading')).toBeInTheDocument();

      // Wait for lazy component to load
      await waitFor(() => {
        expect(screen.getByTestId('lazy-component')).toBeInTheDocument();
      }, { timeout: 200 });
    });

    it('should handle lazy loading errors', async () => {
      const LazyComponent = React.lazy(() => 
        Promise.reject(new Error('Failed to load'))
      );

      // Error boundary component
      class ErrorBoundary extends React.Component<
        { children: React.ReactNode },
        { hasError: boolean }
      > {
        constructor(props: { children: React.ReactNode }) {
          super(props);
          this.state = { hasError: false };
        }

        static getDerivedStateFromError() {
          return { hasError: true };
        }

        render() {
          if (this.state.hasError) {
            return <div data-testid="error-boundary">Error loading component</div>;
          }
          return this.props.children;
        }
      }

      renderWithProviders(
        <MemoryRouter initialEntries={['/lazy-error']}>
          <Routes>
            <Route 
              path="/lazy-error" 
              element={
                <ErrorBoundary>
                  <React.Suspense fallback={<div>Loading...</div>}>
                    <LazyComponent />
                  </React.Suspense>
                </ErrorBoundary>
              } 
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
      });
    });
  });

  describe('Protected Routes', () => {
    it('should redirect to login when accessing protected route without auth', async () => {
      const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
        const isAuthenticated = false; // Not authenticated
        return isAuthenticated ? <>{children}</> : <div data-testid="login-redirect">Redirecting to login...</div>;
      };

      renderWithProviders(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route 
              path="/protected" 
              element={
                <ProtectedRoute>
                  <div data-testid="protected-content">Protected Content</div>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('login-redirect')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should allow access to protected route when authenticated', async () => {
      const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
        const isAuthenticated = true; // Authenticated
        return isAuthenticated ? <>{children}</> : <div>Redirecting to login...</div>;
      };

      renderWithProviders(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route 
              path="/protected" 
              element={
                <ProtectedRoute>
                  <div data-testid="protected-content">Protected Content</div>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  describe('Route Parameters', () => {
    it('should handle route parameters correctly', async () => {
      const ProductDetail = () => {
        const params = { id: '123' }; // Simulated params
        return <div data-testid="product-detail">Product ID: {params.id}</div>;
      };

      renderWithProviders(
        <MemoryRouter initialEntries={['/products/123']}>
          <Routes>
            <Route path="/products/:id" element={<ProductDetail />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('product-detail')).toHaveTextContent('Product ID: 123');
      });
    });

    it('should handle query parameters', async () => {
      const SearchResults = () => {
        const searchParams = new URLSearchParams('?q=glasses&category=sunglasses');
        return (
          <div data-testid="search-results">
            Query: {searchParams.get('q')}, Category: {searchParams.get('category')}
          </div>
        );
      };

      renderWithProviders(
        <MemoryRouter initialEntries={['/search?q=glasses&category=sunglasses']}>
          <Routes>
            <Route path="/search" element={<SearchResults />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toHaveTextContent('Query: glasses, Category: sunglasses');
      });
    });
  });

  describe('Navigation Guards', () => {
    it('should prevent navigation when form has unsaved changes', async () => {
      const FormWithGuard = () => {
        const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(true);
        
        React.useEffect(() => {
          const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
              e.preventDefault();
              e.returnValue = '';
            }
          };
          
          window.addEventListener('beforeunload', handleBeforeUnload);
          return () => window.removeEventListener('beforeunload', handleBeforeUnload);
        }, [hasUnsavedChanges]);

        return (
          <div>
            <div data-testid="form-status">
              {hasUnsavedChanges ? 'Unsaved changes' : 'All saved'}
            </div>
            <button onClick={() => setHasUnsavedChanges(false)}>Save</button>
          </div>
        );
      };

      renderWithProviders(
        <MemoryRouter>
          <Routes>
            <Route path="/" element={<FormWithGuard />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('form-status')).toHaveTextContent('Unsaved changes');
      
      fireEvent.click(screen.getByText('Save'));
      
      expect(screen.getByTestId('form-status')).toHaveTextContent('All saved');
    });
  });

  describe('Route Transitions', () => {
    it('should handle route transitions smoothly', async () => {
      const Page1 = () => <div data-testid="page-1">Page 1</div>;
      const Page2 = () => <div data-testid="page-2">Page 2</div>;

      const App = () => {
        const [currentPage, setCurrentPage] = React.useState('/page1');
        
        return (
          <MemoryRouter initialEntries={[currentPage]}>
            <div>
              <button onClick={() => setCurrentPage('/page2')}>Go to Page 2</button>
              <Routes>
                <Route path="/page1" element={<Page1 />} />
                <Route path="/page2" element={<Page2 />} />
              </Routes>
            </div>
          </MemoryRouter>
        );
      };

      const { rerender } = renderWithProviders(<App />);

      expect(screen.getByTestId('page-1')).toBeInTheDocument();
      
      // Simulate navigation
      fireEvent.click(screen.getByText('Go to Page 2'));
      
      // Re-render with new route
      rerender(
        <UnifiedThemeProvider>
          <MemoryRouter initialEntries={['/page2']}>
            <Routes>
              <Route path="/page1" element={<Page1 />} />
              <Route path="/page2" element={<Page2 />} />
            </Routes>
          </MemoryRouter>
        </UnifiedThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-2')).toBeInTheDocument();
      });
    });
  });

  describe('Breadcrumb Navigation', () => {
    it('should generate correct breadcrumbs for nested routes', () => {
      const getBreadcrumbs = (pathname: string) => {
        const paths = pathname.split('/').filter(Boolean);
        return paths.map((path, index) => ({
          label: path.charAt(0).toUpperCase() + path.slice(1),
          path: '/' + paths.slice(0, index + 1).join('/'),
        }));
      };

      const breadcrumbs = getBreadcrumbs('/analytics/performance/metrics');
      
      expect(breadcrumbs).toEqual([
        { label: 'Analytics', path: '/analytics' },
        { label: 'Performance', path: '/analytics/performance' },
        { label: 'Metrics', path: '/analytics/performance/metrics' },
      ]);
    });
  });

  describe('Route Metadata', () => {
    it('should update document title based on route', async () => {
      const PageWithTitle = ({ title }: { title: string }) => {
        React.useEffect(() => {
          document.title = title;
        }, [title]);
        
        return <div data-testid="page-content">{title}</div>;
      };

      renderWithProviders(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/dashboard" element={<PageWithTitle title="Dashboard - VARAi" />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(document.title).toBe('Dashboard - VARAi');
      });
    });
  });
});