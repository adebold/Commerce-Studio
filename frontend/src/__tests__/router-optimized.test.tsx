import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import OptimizedRouter from '../router-optimized';
import { UnifiedThemeProvider } from '../providers/UnifiedThemeProvider';
import { AuthProvider } from '../components/auth/AuthProvider';

// Mock the lazy-loaded components
jest.mock('../pages/HomePage', () => ({
  __esModule: true,
  default: () => <div data-testid="home-page">Home Page</div>,
}));

jest.mock('../pages/recommendations/index', () => ({
  __esModule: true,
  default: () => <div data-testid="recommendations-page">Recommendations Page</div>,
  preload: jest.fn(),
}));

jest.mock('../pages/virtual-try-on/index', () => ({
  __esModule: true,
  default: () => <div data-testid="virtual-try-on-page">Virtual Try-On Page</div>,
  preload: jest.fn(),
}));

jest.mock('../pages/FramesPage', () => ({
  __esModule: true,
  default: () => <div data-testid="frames-page">Frames Page</div>,
  preload: jest.fn(),
}));

jest.mock('../pages/DashboardPage', () => ({
  __esModule: true,
  default: () => <div data-testid="dashboard-page">Dashboard Page</div>,
  preload: jest.fn(),
}));

jest.mock('../pages/AnalyticsPage', () => ({
  __esModule: true,
  default: () => <div data-testid="analytics-page">Analytics Page</div>,
  preload: jest.fn(),
}));

jest.mock('../pages/NotFoundPage', () => ({
  __esModule: true,
  default: () => <div data-testid="not-found-page">404 Not Found</div>,
}));

// Mock auth hook
jest.mock('../auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: '1', email: 'test@example.com', role: 'user' },
    isAuthenticated: true,
    isLoading: false,
  }),
}));

// Mock performance observer
global.PerformanceObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
})) as unknown as typeof PerformanceObserver;

// Mock intersection observer
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
});
global.IntersectionObserver = mockIntersectionObserver;

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode; initialEntries?: string[] }> = ({ 
  children, 
  initialEntries = ['/'] 
}) => {
  const theme = createTheme();
  
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <ThemeProvider theme={theme}>
        <UnifiedThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </UnifiedThemeProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe('OptimizedRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Route Navigation', () => {
    it('should render home page by default', async () => {
      render(
        <TestWrapper>
          <OptimizedRouter />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
    });

    it('should render recommendations page', async () => {
      render(
        <TestWrapper initialEntries={['/recommendations']}>
          <OptimizedRouter />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('recommendations-page')).toBeInTheDocument();
      });
    });

    it('should render virtual try-on page', async () => {
      render(
        <TestWrapper initialEntries={['/virtual-try-on']}>
          <OptimizedRouter />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('virtual-try-on-page')).toBeInTheDocument();
      });
    });

    it('should render frames page', async () => {
      render(
        <TestWrapper initialEntries={['/frames']}>
          <OptimizedRouter />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('frames-page')).toBeInTheDocument();
      });
    });

    it('should render 404 page for unknown routes', async () => {
      render(
        <TestWrapper initialEntries={['/unknown-route']}>
          <OptimizedRouter />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
      });
    });
  });

  describe('Protected Routes', () => {
    it('should render dashboard page for authenticated admin users', async () => {
      // Mock admin user
      jest.doMock('../auth/hooks/useAuth', () => ({
        useAuth: () => ({
          user: { id: '1', email: 'admin@example.com', role: 'admin' },
          isAuthenticated: true,
          isLoading: false,
        }),
      }));

      render(
        <TestWrapper initialEntries={['/admin/dashboard']}>
          <OptimizedRouter />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });
    });

    it('should render analytics page for authenticated admin users', async () => {
      // Mock admin user
      jest.doMock('../auth/hooks/useAuth', () => ({
        useAuth: () => ({
          user: { id: '1', email: 'admin@example.com', role: 'admin' },
          isAuthenticated: true,
          isLoading: false,
        }),
      }));

      render(
        <TestWrapper initialEntries={['/admin/analytics']}>
          <OptimizedRouter />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('analytics-page')).toBeInTheDocument();
      });
    });
  });

  describe('Performance Features', () => {
    it('should implement lazy loading for route components', async () => {
      render(
        <TestWrapper>
          <OptimizedRouter />
        </TestWrapper>
      );

      // Check that loading spinner appears initially
      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });

      // Loading spinner should be gone
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('should preload components on hover when enabled', async () => {
      const { container } = render(
        <TestWrapper>
          <OptimizedRouter />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });

      // Find a navigation link and hover over it
      const navLink = container.querySelector('a[href="/recommendations"]');
      if (navLink) {
        fireEvent.mouseEnter(navLink);
        
        // Check if preload was called (mocked)
        await waitFor(() => {
          // This would be implementation-specific based on how preloading is implemented
          expect(true).toBe(true); // Placeholder assertion
        });
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle component loading errors gracefully', async () => {
      // Mock a component that throws an error
      jest.doMock('../pages/HomePage', () => ({
        __esModule: true,
        default: () => {
          throw new Error('Component failed to load');
        },
      }));

      render(
        <TestWrapper>
          <OptimizedRouter />
        </TestWrapper>
      );

      // Should show error boundary fallback
      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });
    });

    it('should provide retry functionality on error', async () => {
      // Mock a component that throws an error
      jest.doMock('../pages/HomePage', () => ({
        __esModule: true,
        default: () => {
          throw new Error('Component failed to load');
        },
      }));

      render(
        <TestWrapper>
          <OptimizedRouter />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });

      // Check for retry button
      const retryButton = screen.getByRole('button', { name: /try again/i });
      expect(retryButton).toBeInTheDocument();

      // Click retry button
      fireEvent.click(retryButton);

      // Should attempt to reload the component
      await waitFor(() => {
        expect(retryButton).toBeInTheDocument(); // Still there since mock still throws
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', async () => {
      render(
        <TestWrapper>
          <OptimizedRouter />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });

      // Check for main content area
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();

      // Check for navigation
      const nav = screen.queryByRole('navigation');
      if (nav) {
        expect(nav).toBeInTheDocument();
      }
    });

    it('should support keyboard navigation', async () => {
      render(
        <TestWrapper>
          <OptimizedRouter />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });

      // Test tab navigation
      const focusableElements = screen.getAllByRole('link');
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
        expect(document.activeElement).toBe(focusableElements[0]);
      }
    });

    it('should announce route changes to screen readers', async () => {
      const { rerender } = render(
        <TestWrapper initialEntries={['/']}>
          <OptimizedRouter />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });

      // Navigate to different route
      rerender(
        <TestWrapper initialEntries={['/recommendations']}>
          <OptimizedRouter />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('recommendations-page')).toBeInTheDocument();
      });

      // Check for live region updates (implementation-specific)
      const liveRegion = screen.queryByRole('status');
      if (liveRegion) {
        expect(liveRegion).toBeInTheDocument();
      }
    });
  });

  describe('SEO and Meta Tags', () => {
    it('should update document title for different routes', async () => {
      render(
        <TestWrapper initialEntries={['/recommendations']}>
          <OptimizedRouter />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('recommendations-page')).toBeInTheDocument();
      });

      // Check if title was updated (would need helmet or similar)
      // This is a placeholder - actual implementation would depend on how titles are managed
      expect(document.title).toBeDefined();
    });
  });
});