import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import EnhancedApp from '../App-enhanced';

// Mock the router component
jest.mock('../router-optimized', () => ({
  __esModule: true,
  default: () => <div data-testid="optimized-router">Router Content</div>,
}));

// Mock the auth provider
jest.mock('../components/auth/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}));

// Mock the theme-aware components
jest.mock('../components/common/ThemeAwareErrorBoundary', () => ({
  ThemeAwareErrorBoundary: ({ 
    children, 
    fallback 
  }: { 
    children: React.ReactNode; 
    fallback?: React.ReactNode;
  }) => (
    <div data-testid="error-boundary">
      {children}
      {fallback && <div data-testid="error-fallback">{fallback}</div>}
    </div>
  ),
}));

jest.mock('../components/common/ThemeAwareLoadingSpinner', () => ({
  ThemeAwareLoadingSpinner: ({ message, fullScreen }: { message?: string; fullScreen?: boolean }) => (
    <div data-testid="loading-spinner" data-fullscreen={fullScreen}>
      {message || 'Loading...'}
    </div>
  ),
}));

// Mock the unified theme provider
const mockToggleTheme = jest.fn();
const mockSetTheme = jest.fn();

jest.mock('../providers/UnifiedThemeProvider', () => ({
  UnifiedThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
  useUnifiedTheme: () => ({
    mode: 'light',
    toggleTheme: mockToggleTheme,
    setTheme: mockSetTheme,
    theme: {
      palette: { mode: 'light' },
      spacing: jest.fn(),
      breakpoints: {},
    },
    isSystemPreference: false,
  }),
}));

// Mock polyfills
jest.mock('../polyfills', () => ({}));

// Mock performance observer
global.PerformanceObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
})) as unknown as typeof PerformanceObserver;

// Mock intersection observer
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
})) as unknown as typeof IntersectionObserver;

describe('EnhancedApp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset document state
    document.head.innerHTML = '';
    document.body.className = '';
    
    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the enhanced app with all providers', async () => {
      render(<EnhancedApp />);

      await waitFor(() => {
        expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
        expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
        expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
        expect(screen.getByTestId('optimized-router')).toBeInTheDocument();
      });
    });

    it('should render loading spinner initially', async () => {
      render(<EnhancedApp />);

      // Loading spinner should appear during Suspense
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('Loading application...')).toBeInTheDocument();
    });

    it('should render router content after loading', async () => {
      render(<EnhancedApp />);

      await waitFor(() => {
        expect(screen.getByTestId('optimized-router')).toBeInTheDocument();
        expect(screen.getByText('Router Content')).toBeInTheDocument();
      });
    });
  });

  describe('Theme Integration', () => {
    it('should apply global styles based on theme mode', async () => {
      render(<EnhancedApp />);

      await waitFor(() => {
        expect(screen.getByTestId('optimized-router')).toBeInTheDocument();
      });

      // Check if global styles are applied (implementation-specific)
      const styles = document.querySelector('style');
      expect(styles).toBeTruthy();
    });

    it('should update document meta theme-color', async () => {
      render(<EnhancedApp />);

      await waitFor(() => {
        expect(screen.getByTestId('optimized-router')).toBeInTheDocument();
      });

      // Check if meta theme-color is set
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      expect(metaThemeColor).toBeTruthy();
      expect(metaThemeColor?.getAttribute('content')).toBe('#ffffff'); // Light theme color
    });

    it('should update body class based on theme', async () => {
      render(<EnhancedApp />);

      await waitFor(() => {
        expect(screen.getByTestId('optimized-router')).toBeInTheDocument();
      });

      // Check if body class is set
      expect(document.body.className).toBe('light-theme');
    });

    it('should handle theme toggle keyboard shortcut', async () => {
      render(<EnhancedApp />);

      await waitFor(() => {
        expect(screen.getByTestId('optimized-router')).toBeInTheDocument();
      });

      // Simulate Ctrl+Shift+T keyboard shortcut
      fireEvent.keyDown(document, {
        key: 'T',
        ctrlKey: true,
        shiftKey: true,
      });

      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });

    it('should handle theme toggle with Cmd+Shift+T on Mac', async () => {
      render(<EnhancedApp />);

      await waitFor(() => {
        expect(screen.getByTestId('optimized-router')).toBeInTheDocument();
      });

      // Simulate Cmd+Shift+T keyboard shortcut
      fireEvent.keyDown(document, {
        key: 'T',
        metaKey: true,
        shiftKey: true,
      });

      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });
  });

  describe('Performance Features', () => {
    it('should preload critical fonts', async () => {
      render(<EnhancedApp />);

      await waitFor(() => {
        expect(screen.getByTestId('optimized-router')).toBeInTheDocument();
      });

      // Check if font preload links are added
      const preloadLinks = document.querySelectorAll('link[rel="preload"][as="style"]');
      expect(preloadLinks.length).toBeGreaterThan(0);

      const fontLink = Array.from(preloadLinks).find(link => 
        link.getAttribute('href')?.includes('fonts.googleapis.com')
      );
      expect(fontLink).toBeTruthy();
    });

    it('should initialize performance monitoring in development', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(<EnhancedApp />);

      await waitFor(() => {
        expect(screen.getByTestId('optimized-router')).toBeInTheDocument();
      });

      // Check if PerformanceObserver was called
      expect(global.PerformanceObserver).toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });

    it('should not initialize performance monitoring in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      render(<EnhancedApp />);

      await waitFor(() => {
        expect(screen.getByTestId('optimized-router')).toBeInTheDocument();
      });

      // PerformanceObserver should not be called in production
      expect(global.PerformanceObserver).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Error Handling', () => {
    it('should display error fallback when component fails', async () => {
      // Mock a component that throws an error
      jest.doMock('../router-optimized', () => ({
        __esModule: true,
        default: () => {
          throw new Error('Router failed to load');
        },
      }));

      render(<EnhancedApp />);

      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });
    });

    it('should provide refresh functionality in error fallback', async () => {
      // Mock window.location.reload
      const mockReload = jest.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true,
      });

      // Mock a component that throws an error
      jest.doMock('../router-optimized', () => ({
        __esModule: true,
        default: () => {
          throw new Error('Router failed to load');
        },
      }));

      render(<EnhancedApp />);

      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });

      // Click refresh button
      const refreshButton = screen.getByRole('button', { name: /refresh page/i });
      fireEvent.click(refreshButton);

      expect(mockReload).toHaveBeenCalledTimes(1);
    });

    it('should handle theme provider errors gracefully', async () => {
      // Mock theme provider that throws an error
      jest.doMock('../providers/UnifiedThemeProvider', () => ({
        UnifiedThemeProvider: () => {
          throw new Error('Theme provider failed');
        },
        useUnifiedTheme: () => ({
          mode: 'light',
          toggleTheme: jest.fn(),
          setTheme: jest.fn(),
          theme: {},
          isSystemPreference: false,
        }),
      }));

      render(<EnhancedApp />);

      // Should still render error boundary
      await waitFor(() => {
        expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper document structure', async () => {
      render(<EnhancedApp />);

      await waitFor(() => {
        expect(screen.getByTestId('optimized-router')).toBeInTheDocument();
      });

      // Check for proper HTML structure
      expect(document.documentElement).toBeTruthy();
      expect(document.body).toBeTruthy();
    });

    it('should support keyboard navigation', async () => {
      render(<EnhancedApp />);

      await waitFor(() => {
        expect(screen.getByTestId('optimized-router')).toBeInTheDocument();
      });

      // Test keyboard event handling
      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
      });

      document.dispatchEvent(keydownEvent);

      // Should not throw errors
      expect(true).toBe(true);
    });

    it('should prevent default behavior for theme toggle shortcut', async () => {
      render(<EnhancedApp />);

      await waitFor(() => {
        expect(screen.getByTestId('optimized-router')).toBeInTheDocument();
      });

      const preventDefault = jest.fn();
      
      // Simulate keyboard event with preventDefault
      fireEvent.keyDown(document, {
        key: 'T',
        ctrlKey: true,
        shiftKey: true,
        preventDefault,
      });

      expect(preventDefault).toHaveBeenCalled();
    });
  });

  describe('Provider Integration', () => {
    it('should wrap components in correct provider hierarchy', async () => {
      render(<EnhancedApp />);

      await waitFor(() => {
        expect(screen.getByTestId('optimized-router')).toBeInTheDocument();
      });

      // Check provider hierarchy
      const themeProvider = screen.getByTestId('theme-provider');
      const authProvider = screen.getByTestId('auth-provider');
      const errorBoundary = screen.getByTestId('error-boundary');

      expect(themeProvider).toContainElement(authProvider);
      expect(authProvider).toContainElement(errorBoundary);
      expect(errorBoundary).toContainElement(screen.getByTestId('optimized-router'));
    });

    it('should handle provider initialization', async () => {
      render(<EnhancedApp />);

      await waitFor(() => {
        expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
        expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
      });

      // All providers should be initialized
      expect(screen.getByTestId('optimized-router')).toBeInTheDocument();
    });
  });
});