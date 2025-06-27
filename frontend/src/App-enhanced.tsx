import React, { Suspense, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, GlobalStyles } from '@mui/material';
import { UnifiedThemeProvider, useUnifiedTheme } from './providers/UnifiedThemeProvider';
import { AuthProvider } from './components/auth/AuthProvider';
import { ThemeAwareErrorBoundary } from './components/common/ThemeAwareErrorBoundary';
import { ThemeAwareLoadingSpinner } from './components/common/ThemeAwareLoadingSpinner';
import OptimizedRouter from './router-optimized';
import './polyfills';

// Global styles for consistent theming
const createGlobalStyles = (mode: 'light' | 'dark') => ({
  '*': {
    boxSizing: 'border-box',
  },
  'html, body': {
    margin: 0,
    padding: 0,
    height: '100%',
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    backgroundColor: mode === 'dark' ? '#0a0a0a' : '#ffffff',
    color: mode === 'dark' ? '#ffffff' : '#000000',
    transition: 'background-color 0.3s ease, color 0.3s ease',
  },
  '#root': {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  // Scrollbar styling
  '::-webkit-scrollbar': {
    width: '8px',
    height: '8px',
  },
  '::-webkit-scrollbar-track': {
    backgroundColor: mode === 'dark' ? '#1a1a1a' : '#f1f1f1',
  },
  '::-webkit-scrollbar-thumb': {
    backgroundColor: mode === 'dark' ? '#404040' : '#c1c1c1',
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: mode === 'dark' ? '#505050' : '#a8a8a8',
    },
  },
  // Focus styles for accessibility
  '*:focus-visible': {
    outline: `2px solid ${mode === 'dark' ? '#60a5fa' : '#3b82f6'}`,
    outlineOffset: '2px',
  },
  // Selection styles
  '::selection': {
    backgroundColor: mode === 'dark' ? '#3b82f6' : '#60a5fa',
    color: mode === 'dark' ? '#ffffff' : '#000000',
  },
  // Loading animation
  '@keyframes fadeIn': {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  '.fade-in': {
    animation: 'fadeIn 0.3s ease-in-out',
  },
});

/**
 * Performance monitoring component
 */
const PerformanceMonitor: React.FC = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Monitor Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          console.log(`Performance metric: ${entry.name}`, entry);
        });
      });

      if ('observe' in observer) {
        observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
      }

      return () => {
        if ('disconnect' in observer) {
          observer.disconnect();
        }
      };
    }
  }, []);

  return null;
};

/**
 * Theme-aware global styles component
 */
const ThemeAwareGlobalStyles: React.FC = () => {
  const { mode } = useUnifiedTheme();
  const globalStyles = useMemo(() => createGlobalStyles(mode), [mode]);

  return <GlobalStyles styles={globalStyles} />;
};


/**
 * App content component with theme integration
 */
const AppContent: React.FC = () => {
  const { mode, toggleTheme } = useUnifiedTheme();

  // Keyboard shortcut for theme toggle (Ctrl/Cmd + Shift + T)
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'T') {
      event.preventDefault();
      toggleTheme();
    }
  }, [toggleTheme]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Update document title and meta theme-color based on theme
  useEffect(() => {
    const themeColor = mode === 'dark' ? '#0a0a0a' : '#ffffff';
    
    // Update meta theme-color
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', themeColor);

    // Update body class for theme
    document.body.className = mode === 'dark' ? 'dark-theme' : 'light-theme';
  }, [mode]);

  return (
    <>
      <CssBaseline />
      <ThemeAwareGlobalStyles />
      <PerformanceMonitor />
      <ThemeAwareErrorBoundary>
        <Suspense fallback={<ThemeAwareLoadingSpinner message="Loading application..." fullScreen />}>
          <OptimizedRouter />
        </Suspense>
      </ThemeAwareErrorBoundary>
    </>
  );
};

/**
 * Enhanced App component with comprehensive theme and router integration
 */
const EnhancedApp: React.FC = () => {
  // Preload critical resources
  useEffect(() => {
    const preloadCriticalResources = () => {
      // Preload critical fonts
      const fontPreloads = [
        'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
      ];

      fontPreloads.forEach((href) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = href;
        document.head.appendChild(link);
      });
    };

    preloadCriticalResources();
  }, []);

  // Error boundary fallback
  const errorFallback = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h1>Something went wrong</h1>
      <p>We're sorry, but something unexpected happened. Please refresh the page to try again.</p>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: 'pointer',
          fontSize: '1rem',
          marginTop: '1rem'
        }}
      >
        Refresh Page
      </button>
    </div>
  );

  return (
    <BrowserRouter>
      <UnifiedThemeProvider>
        <AuthProvider>
          <ThemeAwareErrorBoundary fallback={errorFallback}>
            <AppContent />
          </ThemeAwareErrorBoundary>
        </AuthProvider>
      </UnifiedThemeProvider>
    </BrowserRouter>
  );
};

export default EnhancedApp;