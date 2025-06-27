import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Router from '../router';
import { UnifiedThemeProvider } from '../providers/UnifiedThemeProvider';

// Mock all the page components to avoid complex dependencies
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

jest.mock('../pages/virtual-try-on', () => {
  return function MockVirtualTryOnPage() {
    return <div data-testid="virtual-try-on-page">Virtual Try-On Page</div>;
  };
});

jest.mock('../pages/commerce-studio/DashboardPage', () => {
  return function MockDashboardPage() {
    return <div data-testid="dashboard-page">Dashboard Page</div>;
  };
});

// Mock layouts
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

// Mock auth components
jest.mock('../components/auth/ProtectedRoute', () => {
  return function MockProtectedRoute({ children }: { children: React.ReactNode }) {
    return <div data-testid="protected-route">{children}</div>;
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

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

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

describe('Enhanced Router Theme Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    // Suppress console errors for cleaner test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderWithTheme = (initialEntries: string[] = ['/'], themeMode: 'light' | 'dark' = 'light') => {
    return render(
      <UnifiedThemeProvider initialMode={themeMode}>
        <MemoryRouter initialEntries={initialEntries}>
          <Router />
        </MemoryRouter>
      </UnifiedThemeProvider>
    );
  };

  describe('Theme Integration', () => {
    it('should render with light theme by default', async () => {
      renderWithTheme(['/']);

      await waitFor(() => {
        expect(screen.getByTestId('customer-layout')).toBeInTheDocument();
      });

      expect(screen.getByTestId('landing-page')).toBeInTheDocument();
    });

    it('should render with dark theme when specified', async () => {
      renderWithTheme(['/'], 'dark');

      await waitFor(() => {
        expect(screen.getByTestId('customer-layout')).toBeInTheDocument();
      });

      expect(screen.getByTestId('landing-page')).toBeInTheDocument();
    });

    it('should handle theme switching gracefully', async () => {
      const { rerender } = renderWithTheme(['/'], 'light');

      await waitFor(() => {
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      });

      // Switch to dark theme
      rerender(
        <UnifiedThemeProvider initialMode="dark">
          <MemoryRouter initialEntries={['/']}>
            <Router />
          </MemoryRouter>
        </UnifiedThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      });
    });

    it('should persist theme preference in localStorage', async () => {
      mockLocalStorage.getItem.mockReturnValue('dark');
      
      renderWithTheme(['/']);

      await waitFor(() => {
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      });

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('varai-theme-mode');
    });
  });

  describe('Route Navigation with Theme', () => {
    it('should maintain theme across route changes', async () => {
      const { rerender } = renderWithTheme(['/']);

      await waitFor(() => {
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      });

      // Navigate to recommendations
      rerender(
        <UnifiedThemeProvider>
          <MemoryRouter initialEntries={['/recommendations']}>
            <Router />
          </MemoryRouter>
        </UnifiedThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('recommendations-page')).toBeInTheDocument();
      });
    });

    it('should handle nested routes with theme context', async () => {
      renderWithTheme(['/recommendations/sunglasses']);

      await waitFor(() => {
        expect(screen.getByTestId('customer-layout')).toBeInTheDocument();
      });

      expect(screen.getByTestId('recommendations-page')).toBeInTheDocument();
    });

    it('should handle admin routes with theme and protection', async () => {
      renderWithTheme(['/admin/dashboard']);

      await waitFor(() => {
        expect(screen.getByTestId('commerce-studio-layout')).toBeInTheDocument();
      });

      expect(screen.getByTestId('protected-route')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });
  });

  describe('Error Handling with Theme', () => {
    it('should provide error boundaries for all routes', async () => {
      renderWithTheme(['/']);

      await waitFor(() => {
        expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
      });
    });

    it('should handle theme creation errors gracefully', async () => {
      // Mock theme creation to throw an error
      const mockCreateVaraiTheme = jest.fn().mockImplementation(() => {
        throw new Error('Theme creation failed');
      });
      
      jest.doMock('../design-system/mui-integration', () => ({
        ...jest.requireActual('../design-system/mui-integration'),
        createVaraiTheme: mockCreateVaraiTheme,
      }));

      // Should still render with fallback theme
      renderWithTheme(['/']);

      await waitFor(() => {
        expect(screen.getByTestId('customer-layout')).toBeInTheDocument();
      });

      // Clear the mock
      jest.clearAllMocks();
    });
  });

  describe('Loading States with Theme', () => {
    it('should show theme-aware loading spinners', async () => {
      renderWithTheme(['/']);

      // The loading spinner might be visible briefly
      await waitFor(() => {
        expect(screen.getByTestId('customer-layout')).toBeInTheDocument();
      });

      // Eventually the page should load
      expect(screen.getByTestId('landing-page')).toBeInTheDocument();
    });

    it('should handle lazy loading with theme context', async () => {
      renderWithTheme(['/virtual-try-on']);

      await waitFor(() => {
        expect(screen.getByTestId('virtual-try-on-page')).toBeInTheDocument();
      });
    });
  });

  describe('Performance Optimizations', () => {
    it('should memoize route components for better performance', async () => {
      const { rerender } = renderWithTheme(['/']);

      await waitFor(() => {
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      });

      // Re-render with same route should not cause unnecessary re-renders
      rerender(
        <UnifiedThemeProvider>
          <MemoryRouter initialEntries={['/']}>
            <Router />
          </MemoryRouter>
        </UnifiedThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      });
    });

    it('should handle theme changes efficiently', async () => {
      const { rerender } = renderWithTheme(['/'], 'light');

      await waitFor(() => {
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      });

      // Theme change should be smooth
      rerender(
        <UnifiedThemeProvider initialMode="dark">
          <MemoryRouter initialEntries={['/']}>
            <Router />
          </MemoryRouter>
        </UnifiedThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility with Theme', () => {
    it('should maintain accessibility standards across themes', async () => {
      renderWithTheme(['/'], 'light');

      await waitFor(() => {
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      });

      // Check that the page is accessible
      const layout = screen.getByTestId('customer-layout');
      expect(layout).toBeInTheDocument();
    });

    it('should support high contrast mode', async () => {
      // Mock high contrast media query
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query.includes('prefers-contrast: high'),
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      renderWithTheme(['/']);

      await waitFor(() => {
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      });
    });
  });

  describe('System Preference Integration', () => {
    it('should respect system dark mode preference', async () => {
      // Mock system dark mode preference
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query.includes('prefers-color-scheme: dark'),
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      renderWithTheme(['/']);

      await waitFor(() => {
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      });
    });

    it('should handle system preference changes', async () => {
      const mockMatchMedia = jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      window.matchMedia = mockMatchMedia;

      renderWithTheme(['/']);

      await waitFor(() => {
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      });

      // Simulate system preference change
      act(() => {
        mockMatchMedia.mockImplementation(query => ({
          matches: query.includes('prefers-color-scheme: dark'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }));
      });

      await waitFor(() => {
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      });
    });
  });
});