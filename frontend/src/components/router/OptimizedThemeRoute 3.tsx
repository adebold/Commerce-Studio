import React, { Suspense, memo, useCallback, useMemo, useEffect } from 'react';
import { Box } from '@mui/material';
import { ThemeAwareLoadingSpinner } from '../common/ThemeAwareLoadingSpinner';
import { ThemeAwareErrorBoundary } from '../common/ThemeAwareErrorBoundary';

interface OptimizedThemeRouteProps {
  element: React.ReactElement;
  fallbackMessage?: string;
  errorFallback?: React.ReactNode;
  enablePerformanceTracking?: boolean;
  routeName?: string;
}

/**
 * Performance tracking component for routes
 */
const PerformanceTracker: React.FC<{
  routeName?: string;
  children: React.ReactNode;
}> = ({ routeName, children }) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Route ${routeName} rendered in ${loadTime.toFixed(2)}ms`);
      }
      
      // Send performance metrics
      // analytics.track('route_performance', { route: routeName, loadTime });
    };
  }, [routeName]);

  return <>{children}</>;
};

/**
 * Optimized theme-aware route component with performance tracking
 * Combines error boundary, suspense, and theme awareness in a single component
 */
export const OptimizedThemeRoute = memo<OptimizedThemeRouteProps>(({
  element,
  fallbackMessage = "Loading page...",
  errorFallback,
  enablePerformanceTracking = false,
  routeName
}) => {

  // Memoized error handler for performance
  const handleError = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`Route error in ${routeName || 'unknown route'}:`, error, errorInfo);
    }
    
    // Here you could send error to monitoring service
    // analytics.track('route_error', { route: routeName, error: error.message });
  }, [routeName]);

  // Memoized loading component for performance
  const loadingComponent = useMemo(() => (
    <Box
      sx={{
        minHeight: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ThemeAwareLoadingSpinner
        message={fallbackMessage}
        size={32}
      />
    </Box>
  ), [fallbackMessage]);

  const content = enablePerformanceTracking ? (
    <PerformanceTracker routeName={routeName}>
      {element}
    </PerformanceTracker>
  ) : element;

  return (
    <ThemeAwareErrorBoundary
      onError={handleError}
      fallback={errorFallback}
    >
      <Suspense fallback={loadingComponent}>
        {content}
      </Suspense>
    </ThemeAwareErrorBoundary>
  );
});

OptimizedThemeRoute.displayName = 'OptimizedThemeRoute';

export default OptimizedThemeRoute;