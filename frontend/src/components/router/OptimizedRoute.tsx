import React, { memo, Suspense, useCallback, useMemo } from 'react';
import { ThemeAwareErrorBoundary } from '../common/ThemeAwareErrorBoundary';
import { ThemeAwareLoadingSpinner } from '../common/ThemeAwareLoadingSpinner';
import { useUnifiedTheme } from '../../providers/UnifiedThemeProvider';

interface RouteGuardOptions {
  requiresAuth?: boolean;
  roles?: string[];
  permissions?: string[];
}

interface OptimizedRouteWrapperProps {
  component: React.ComponentType<Record<string, unknown>>;
  fallbackMessage?: string;
  errorFallback?: React.ReactNode;
  guardOptions?: RouteGuardOptions;
}

/**
 * Optimized Route wrapper component with theme-aware loading and error handling
 * Includes performance optimizations and accessibility features
 */
const OptimizedRouteWrapper: React.FC<OptimizedRouteWrapperProps> = memo(({
  component: Component,
  fallbackMessage = "Loading page...",
  errorFallback,
  guardOptions,
}) => {
  const { mode } = useUnifiedTheme();

  // Memoize the component to prevent unnecessary re-renders
  const MemoizedComponent = useMemo(() => memo(Component), [Component]);

  // Create error handler with theme context
  const handleError = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    console.error(`Route error in ${mode} mode:`, error, errorInfo);
    // Here you could send error to monitoring service with theme context
    
    // Use guardOptions for additional error context if needed
    if (guardOptions?.requiresAuth) {
      console.error('Authentication-related error occurred');
    }
  }, [mode, guardOptions]);

  // Create loading fallback with theme awareness
  const loadingFallback = useMemo(() => (
    <ThemeAwareLoadingSpinner
      message={fallbackMessage}
      size={48}
      fullScreen={false}
    />
  ), [fallbackMessage]);

  // Create the route element with all optimizations
  return (
    <ThemeAwareErrorBoundary onError={handleError} fallback={errorFallback}>
      <Suspense fallback={loadingFallback}>
        <MemoizedComponent />
      </Suspense>
    </ThemeAwareErrorBoundary>
  );
});

OptimizedRouteWrapper.displayName = 'OptimizedRouteWrapper';

export default OptimizedRouteWrapper;

/**
 * Higher-order component for route optimization
 */
export const withRouteOptimization = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    fallbackMessage?: string;
    errorFallback?: React.ReactNode;
    preload?: boolean;
  } = {}
) => {
  const OptimizedComponent = memo((props: P) => {
    const { mode } = useUnifiedTheme();
    
    return (
      <ThemeAwareErrorBoundary 
        fallback={options.errorFallback}
        onError={(error, errorInfo) => {
          console.error(`Component error in ${mode} mode:`, error, errorInfo);
        }}
      >
        <Suspense 
          fallback={
            <ThemeAwareLoadingSpinner
              message={options.fallbackMessage || "Loading..."}
              size={40}
            />
          }
        >
          <Component {...props} />
        </Suspense>
      </ThemeAwareErrorBoundary>
    );
  });

  OptimizedComponent.displayName = `withRouteOptimization(${Component.displayName || Component.name})`;
  
  return OptimizedComponent;
};

/**
 * Hook for route-level performance monitoring
 */
export const useRoutePerformance = (routeName: string) => {
  const { mode } = useUnifiedTheme();

  React.useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Route "${routeName}" loaded in ${loadTime.toFixed(2)}ms (${mode} mode)`);
      }
      
      // Here you could send performance metrics to monitoring service
    };
  }, [routeName, mode]);
};

/**
 * Route preloader utility
 */
export const preloadRoute = async (importFn: () => Promise<{ default: React.ComponentType<unknown> }>) => {
  try {
    await importFn();
  } catch (error) {
    console.warn('Route preload failed:', error);
  }
};