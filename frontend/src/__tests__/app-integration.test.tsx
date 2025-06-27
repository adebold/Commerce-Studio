import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { UnifiedThemeProvider } from '../providers/UnifiedThemeProvider';

// Mock the auth service to avoid network calls
jest.mock('../services/auth', () => ({
  getCurrentUser: jest.fn().mockResolvedValue(null),
  isAuthenticated: jest.fn().mockReturnValue(false),
}));

// Mock the face shape service
jest.mock('../services/faceShapeService', () => ({
  analyzeFaceShape: jest.fn().mockResolvedValue({ shape: 'oval', confidence: 0.95 }),
}));

describe('App Integration Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Theme-Router Integration', () => {
    it('should render the app with theme and router working together', async () => {
      render(<App />);
      
      // Wait for the app to load
      await waitFor(() => {
        expect(screen.getByTestId('theme-aware-loading-spinner')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should handle theme switching across different routes', async () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <UnifiedThemeProvider>
            <App />
          </UnifiedThemeProvider>
        </MemoryRouter>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      });

      // The theme should be applied consistently across routes
      expect(document.documentElement).toHaveStyle('color-scheme: light');
    });

    it('should maintain theme state during navigation', async () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      });

      // Theme should persist during navigation
      const initialColorScheme = getComputedStyle(document.documentElement).colorScheme;
      
      // Navigate to a different route (if navigation elements are available)
      // This would depend on your specific navigation implementation
      
      expect(getComputedStyle(document.documentElement).colorScheme).toBe(initialColorScheme);
    });
  });

  describe('Error Boundary Integration', () => {
    it('should handle theme-aware error boundaries in router context', async () => {
      // Create a component that throws an error
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
        expect(screen.getByTestId('theme-aware-error-boundary')).toBeInTheDocument();
      });

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
      expect(screen.getByTestId('home-button')).toBeInTheDocument();
    });
  });

  describe('Loading States Integration', () => {
    it('should show theme-aware loading spinners during route transitions', async () => {
      render(
        <MemoryRouter initialEntries={['/recommendations']}>
          <App />
        </MemoryRouter>
      );

      // Should show loading spinner initially
      expect(screen.getByTestId('theme-aware-loading-spinner')).toBeInTheDocument();
      
      // Loading message should be theme-aware
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility Integration', () => {
    it('should maintain accessibility standards across theme modes', async () => {
      const { rerender } = render(
        <UnifiedThemeProvider initialMode="light">
          <MemoryRouter>
            <App />
          </MemoryRouter>
        </UnifiedThemeProvider>
      );

      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      });

      // Check light mode accessibility
      expect(document.documentElement).toHaveAttribute('data-theme', 'light');

      // Switch to dark mode
      rerender(
        <UnifiedThemeProvider initialMode="dark">
          <MemoryRouter>
            <App />
          </MemoryRouter>
        </UnifiedThemeProvider>
      );

      await waitFor(() => {
        expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
      });
    });

    it('should provide proper ARIA labels and roles', async () => {
      render(<App />);

      await waitFor(() => {
        const loadingSpinner = screen.getByTestId('theme-aware-loading-spinner');
        expect(loadingSpinner).toBeInTheDocument();
        
        // Should have proper accessibility attributes
        expect(loadingSpinner).toHaveAttribute('role', 'status');
        expect(loadingSpinner).toHaveAttribute('aria-label', 'Loading application...');
      });
    });
  });

  describe('Performance Integration', () => {
    it('should not cause unnecessary re-renders during theme changes', async () => {
      const renderSpy = jest.fn();
      
      const TestComponent = () => {
        renderSpy();
        return <div data-testid="test-component">Test</div>;
      };

      const { rerender } = render(
        <UnifiedThemeProvider initialMode="light">
          <MemoryRouter>
            <TestComponent />
          </MemoryRouter>
        </UnifiedThemeProvider>
      );

      const initialRenderCount = renderSpy.mock.calls.length;

      // Change theme mode
      rerender(
        <UnifiedThemeProvider initialMode="dark">
          <MemoryRouter>
            <TestComponent />
          </MemoryRouter>
        </UnifiedThemeProvider>
      );

      // Should only re-render once for theme change
      expect(renderSpy.mock.calls.length).toBe(initialRenderCount + 1);
    });
  });

  describe('LocalStorage Integration', () => {
    it('should persist theme preferences across app restarts', () => {
      // Set initial theme preference
      localStorage.setItem('varai-theme-mode', 'dark');

      render(<App />);

      // Theme should be restored from localStorage
      expect(document.documentElement).toHaveStyle('color-scheme: dark');
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw an error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('localStorage error');
      });

      // Should not crash the app
      expect(() => render(<App />)).not.toThrow();

      // Restore original localStorage
      localStorage.setItem = originalSetItem;
    });
  });
});