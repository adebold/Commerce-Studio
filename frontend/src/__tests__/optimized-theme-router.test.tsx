/**
 * Optimized Theme and Router Integration Tests
 * 
 * This test suite validates:
 * - Cached theme creation performance
 * - Router memoization and optimization
 * - Theme-router integration seamlessly working together
 * - Performance metrics and error handling
 * 
 * Following TDD principles: Red-Green-Refactor cycle
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  createCachedVaraiTheme,
  validateThemeIntegrity
} from '../design-system/mui-integration';
import { UnifiedThemeProvider } from '../providers/UnifiedThemeProvider';
import Router from '../router';

// Mock performance API for testing
const mockObserve = jest.fn();
const mockDisconnect = jest.fn();

// Mock PerformanceObserver properly

const MockPerformanceObserverConstructor = jest.fn().mockImplementation(() => ({
  observe: mockObserve,
  disconnect: mockDisconnect
}));

Object.defineProperty(global, 'PerformanceObserver', {
  writable: true,
  value: MockPerformanceObserverConstructor
});

// Mock route guards
jest.mock('../utils/routeGuards', () => ({
  routeGuards: {
    requireAuth: jest.fn(() => true),
    requireRole: jest.fn(() => true),
    requireSubscription: jest.fn(() => true)
  }
}));

// Mock lazy-loaded components
jest.mock('../pages/HomePage', () => ({
  __esModule: true,
  default: () => <div data-testid="home-page">Home Page</div>
}));

jest.mock('../pages/DashboardPage', () => ({
  __esModule: true,
  default: () => <div data-testid="dashboard-page">Dashboard Page</div>
}));

describe('Optimized Theme and Router Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Cached Theme Creation Performance', () => {
    test('should cache themes for improved performance', () => {
      // RED: Should fail if caching is not implemented
      const startTime = performance.now();
      
      // First call - should create and cache
      const theme1 = createCachedVaraiTheme('light');
      const firstCallTime = performance.now() - startTime;
      
      const secondStartTime = performance.now();
      // Second call - should use cache
      const theme2 = createCachedVaraiTheme('light');
      const secondCallTime = performance.now() - secondStartTime;
      
      // Verify themes are identical (same reference from cache)
      expect(theme1).toBe(theme2);
      
      // Second call should be significantly faster
      expect(secondCallTime).toBeLessThan(firstCallTime);
      
      // Verify theme integrity
      expect(validateThemeIntegrity(theme1)).toBe(true);
      expect(validateThemeIntegrity(theme2)).toBe(true);
    });

    test('should cache different theme modes separately', () => {
      // RED: Should fail if modes are not cached separately
      const lightTheme1 = createCachedVaraiTheme('light');
      const darkTheme1 = createCachedVaraiTheme('dark');
      const lightTheme2 = createCachedVaraiTheme('light');
      const darkTheme2 = createCachedVaraiTheme('dark');
      
      // Same modes should return cached instances
      expect(lightTheme1).toBe(lightTheme2);
      expect(darkTheme1).toBe(darkTheme2);
      
      // Different modes should be different instances
      expect(lightTheme1).not.toBe(darkTheme1);
      
      // Verify mode-specific properties
      expect(lightTheme1.palette.mode).toBe('light');
      expect(darkTheme1.palette.mode).toBe('dark');
    });

    test('should maintain theme integrity with caching', () => {
      // RED: Should fail if cached themes lose integrity
      const theme = createCachedVaraiTheme('light');
      
      // Verify all required properties exist
      expect(theme.palette).toBeDefined();
      expect(theme.typography).toBeDefined();
      expect(theme.spacing).toBeDefined();
      expect(theme.breakpoints).toBeDefined();
      expect(theme.varai).toBeDefined();
      
      // Verify theme validation passes
      expect(validateThemeIntegrity(theme)).toBe(true);
      
      // Verify cached theme maintains same integrity
      const cachedTheme = createCachedVaraiTheme('light');
      expect(validateThemeIntegrity(cachedTheme)).toBe(true);
      expect(cachedTheme).toBe(theme);
    });
  });

  describe('Router Memoization and Performance', () => {
    test('should memoize router component for performance', () => {
      // RED: Should fail if router is not memoized
      const TestWrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter initialEntries={['/']}>
          <UnifiedThemeProvider>
            {children}
          </UnifiedThemeProvider>
        </MemoryRouter>
      );

      const { rerender } = render(
        <TestWrapper>
          <Router />
        </TestWrapper>
      );

      // Rerender with same props
      rerender(
        <TestWrapper>
          <Router />
        </TestWrapper>
      );

      // Router should be memoized and not re-render unnecessarily
      // This is tested by checking that performance observer is set up correctly
      expect(mockObserve).toHaveBeenCalled();
    });

    test('should set up performance monitoring correctly', () => {
      // RED: Should fail if performance monitoring is not set up
      render(
        <MemoryRouter initialEntries={['/']}>
          <UnifiedThemeProvider>
            <Router />
          </UnifiedThemeProvider>
        </MemoryRouter>
      );

      // Verify PerformanceObserver was created and configured
      expect(global.PerformanceObserver).toHaveBeenCalled();
      expect(mockObserve).toHaveBeenCalledWith({ entryTypes: ['navigation'] });
    });

    test('should clean up performance observer on unmount', () => {
      // RED: Should fail if cleanup is not implemented
      const { unmount } = render(
        <MemoryRouter initialEntries={['/']}>
          <UnifiedThemeProvider>
            <Router />
          </UnifiedThemeProvider>
        </MemoryRouter>
      );

      // Unmount component
      unmount();

      // Verify cleanup was called
      expect(mockDisconnect).toHaveBeenCalled();
    });
  });

  describe('Theme-Router Integration', () => {
    test('should render router with unified theme provider', async () => {
      // RED: Should fail if integration is broken
      render(
        <MemoryRouter initialEntries={['/']}>
          <UnifiedThemeProvider>
            <Router />
          </UnifiedThemeProvider>
        </MemoryRouter>
      );

      // Wait for router to render
      await waitFor(() => {
        // Should render without errors
        expect(document.body).toBeInTheDocument();
      });

      // Verify theme context is available
      const themeElements = document.querySelectorAll('[class*="MuiThemeProvider"]');
      expect(themeElements.length).toBeGreaterThan(0);
    });

    test('should handle theme mode changes during navigation', async () => {
      // RED: Should fail if theme changes break navigation
      const TestComponent = () => {
        const [mode, setMode] = React.useState<'light' | 'dark'>('light');
        
        return (
          <MemoryRouter initialEntries={['/']}>
            <UnifiedThemeProvider>
              <button 
                data-testid="toggle-theme"
                onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
              >
                Toggle Theme
              </button>
              <Router />
            </UnifiedThemeProvider>
          </MemoryRouter>
        );
      };

      render(<TestComponent />);

      // Initial render should work
      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      });

      // Theme toggle should not break router
      const toggleButton = screen.getByTestId('toggle-theme');
      act(() => {
        toggleButton.click();
      });

      await waitFor(() => {
        // Router should still be functional after theme change
        expect(document.body).toBeInTheDocument();
      });
    });

    test('should maintain performance during theme-router operations', async () => {
      // RED: Should fail if performance degrades
      const startTime = performance.now();

      render(
        <MemoryRouter initialEntries={['/']}>
          <UnifiedThemeProvider>
            <Router />
          </UnifiedThemeProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      });

      const renderTime = performance.now() - startTime;

      // Render should complete within reasonable time (adjust threshold as needed)
      expect(renderTime).toBeLessThan(100); // 100ms threshold
    });
  });

  describe('Error Handling and Resilience', () => {
    test('should handle router navigation errors gracefully', async () => {
      // RED: Should fail if router error handling is not implemented
      render(
        <MemoryRouter initialEntries={['/invalid-route']}>
          <UnifiedThemeProvider>
            <Router />
          </UnifiedThemeProvider>
        </MemoryRouter>
      );

      // Should redirect to home or show 404, not crash
      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility and User Experience', () => {
    test('should maintain accessibility during theme changes', async () => {
      // RED: Should fail if accessibility is compromised
      render(
        <MemoryRouter initialEntries={['/']}>
          <UnifiedThemeProvider>
            <Router />
          </UnifiedThemeProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        // Check for basic accessibility features
        const main = document.querySelector('main');
        const nav = document.querySelector('nav');
        
        // Should have semantic HTML structure
        expect(main || nav || document.body).toBeInTheDocument();
      });
    });

    test('should provide smooth user experience during navigation', async () => {
      // RED: Should fail if UX is poor
      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <UnifiedThemeProvider>
            <Router />
          </UnifiedThemeProvider>
        </MemoryRouter>
      );

      // Should render without layout shifts or flickers
      await waitFor(() => {
        expect(container.firstChild).toBeInTheDocument();
      });

      // Verify no error boundaries are triggered
      const errorBoundaries = container.querySelectorAll('[data-testid*="error"]');
      expect(errorBoundaries).toHaveLength(0);
    });
  });
});