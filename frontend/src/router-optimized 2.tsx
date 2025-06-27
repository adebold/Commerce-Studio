import React, { lazy, Suspense, memo, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { routeGuards } from './utils/routeGuards';
import EnhancedCustomerLayout from './layouts/EnhancedCustomerLayout';
import CommerceStudioLayout from './layouts/CommerceStudioLayout';
import { ThemeAwareLoadingSpinner } from './components/common/ThemeAwareLoadingSpinner';
import { ThemeAwareErrorBoundary } from './components/common/ThemeAwareErrorBoundary';

// Type definitions for preloadable components
interface PreloadableComponent extends React.LazyExoticComponent<React.ComponentType<Record<string, unknown>>> {
  preload?: () => Promise<unknown>;
}

// Optimized lazy loading with preloading capabilities
const createLazyComponent = (importFn: () => Promise<{ default: React.ComponentType<Record<string, unknown>> }>, componentName: string): PreloadableComponent => {
  const LazyComponent = lazy(importFn) as PreloadableComponent;
  
  // Add preload method for performance optimization
  LazyComponent.preload = importFn;
  
  // Add display name for debugging
  Object.defineProperty(LazyComponent, 'displayName', {
    value: `Lazy(${componentName})`,
    writable: false,
    enumerable: false,
    configurable: true
  });
  
  return LazyComponent;
};

// Customer-facing pages with optimized loading
const LandingPage = createLazyComponent(() => import('./pages/LandingPage'), 'LandingPage');
const RecommendationsPage = createLazyComponent(() => import('./pages/recommendations'), 'RecommendationsPage');
const FrameDetailPage = createLazyComponent(() => import('./pages/FrameDetailPage'), 'FrameDetailPage');
const CartPage = createLazyComponent(() => import('./pages/CartPage'), 'CartPage');
const SignupPage = createLazyComponent(() => import('./pages/SignupPage'), 'SignupPage');
const OnboardingPage = createLazyComponent(() => import('./pages/OnboardingPage'), 'OnboardingPage');
const VirtualTryOnPage = createLazyComponent(() => import('./pages/virtual-try-on'), 'VirtualTryOnPage');
const ContactLensTryOnPage = createLazyComponent(() => import('./pages/ContactLensTryOnPage'), 'ContactLensTryOnPage');
const FrameFinderPage = createLazyComponent(() => import('./pages/frame-finder'), 'FrameFinderPage');
const FramesPage = createLazyComponent(() => import('./pages/FramesPage'), 'FramesPage');
const StyleGuidePage = createLazyComponent(() => import('./pages/StyleGuidePage'), 'StyleGuidePage');

// Customer-facing feature pages
const FaceShapeAnalysisPage = createLazyComponent(() => import('./pages/FaceShapeAnalysisPage'), 'FaceShapeAnalysisPage');
const GetStartedPage = createLazyComponent(() => import('./pages/GetStartedPage'), 'GetStartedPage');
const ScheduleDemoPage = createLazyComponent(() => import('./pages/ScheduleDemoPage'), 'ScheduleDemoPage');
const MarketplacePage = createLazyComponent(() => import('./pages/MarketplacePage'), 'MarketplacePage');
const ContactPage = createLazyComponent(() => import('./pages/ContactPage'), 'ContactPage');
const SolutionsPage = createLazyComponent(() => import('./pages/SolutionsPage'), 'SolutionsPage');
const FeatureDetailPage = createLazyComponent(() => import('./pages/FeatureDetailPage'), 'FeatureDetailPage');
const ProductDetailPage = createLazyComponent(() => import('./pages/ProductDetailPage'), 'ProductDetailPage');
const PricingDetailPage = createLazyComponent(() => import('./pages/PricingDetailPage'), 'PricingDetailPage');

// Commerce Studio pages
const HomePage = createLazyComponent(() => import('./pages/commerce-studio/HomePage'), 'HomePage');
const DashboardPage = createLazyComponent(() => import('./pages/commerce-studio/DashboardPage'), 'DashboardPage');
const AuthPage = createLazyComponent(() => import('./pages/commerce-studio/AuthPage'), 'AuthPage');
const ProductsPage = createLazyComponent(() => import('./pages/commerce-studio/ProductsPage'), 'ProductsPage');
const SkuGeniePage = createLazyComponent(() => import('./pages/commerce-studio/SkuGeniePage'), 'SkuGeniePage');
const CommerceIntegrationsPage = createLazyComponent(() => import('./pages/commerce-studio/CommerceIntegrationsPage'), 'CommerceIntegrationsPage');
const AITechnologyPage = createLazyComponent(() => import('./pages/commerce-studio/AITechnologyPage'), 'AITechnologyPage');
const ApiDocumentationPage = createLazyComponent(() => import('./pages/commerce-studio/ApiDocumentationPage'), 'ApiDocumentationPage');
const AppStorePage = createLazyComponent(() => import('./pages/commerce-studio/AppStorePage'), 'AppStorePage');
const FitConsultationPage = createLazyComponent(() => import('./pages/commerce-studio/FitConsultationPage'), 'FitConsultationPage');
const CommerceStudioFrameFinderPage = createLazyComponent(() => import('./pages/commerce-studio/FrameFinderPage'), 'CommerceStudioFrameFinderPage');
const PricingPage = createLazyComponent(() => import('./pages/commerce-studio/PricingPage'), 'PricingPage');
const RetailIntegrationsPage = createLazyComponent(() => import('./pages/commerce-studio/RetailIntegrationsPage'), 'RetailIntegrationsPage');
const AdminSolutionsPage = createLazyComponent(() => import('./pages/commerce-studio/SolutionsPage'), 'AdminSolutionsPage');
const StyleRecommendationsPage = createLazyComponent(() => import('./pages/commerce-studio/StyleRecommendationsPage'), 'StyleRecommendationsPage');
const AnalyticsPage = createLazyComponent(() => import('./pages/commerce-studio/AnalyticsPage'), 'AnalyticsPage');
const SettingsPage = createLazyComponent(() => import('./pages/commerce-studio/SettingsPage'), 'SettingsPage');
const MerchantOnboardingPage = createLazyComponent(() => import('./pages/commerce-studio/MerchantOnboardingPage'), 'MerchantOnboardingPage');
const MerchantOnboardingAnalyticsPage = createLazyComponent(() => import('./pages/commerce-studio/MerchantOnboardingAnalyticsPage'), 'MerchantOnboardingAnalyticsPage');

// Settings pages
const AccountSettingsPage = createLazyComponent(() => import('./pages/commerce-studio/settings/AccountSettingsPage'), 'AccountSettingsPage');
const IntegrationSettingsPage = createLazyComponent(() => import('./pages/commerce-studio/settings/IntegrationSettingsPage'), 'IntegrationSettingsPage');
const AppearanceSettingsPage = createLazyComponent(() => import('./pages/commerce-studio/settings/AppearanceSettingsPage'), 'AppearanceSettingsPage');
const RecommendationSettingsPage = createLazyComponent(() => import('./pages/commerce-studio/settings/RecommendationSettingsPage'), 'RecommendationSettingsPage');
const NotificationSettingsPage = createLazyComponent(() => import('./pages/commerce-studio/settings/NotificationSettingsPage'), 'NotificationSettingsPage');

/**
 * Enhanced Route Component with optimized error handling and loading
 */
interface EnhancedRouteProps {
  element: React.ReactElement;
  fallbackMessage?: string;
  errorFallback?: React.ReactNode;
  preloadOnHover?: boolean;
}

const EnhancedRoute = memo<EnhancedRouteProps>(({
  element,
  fallbackMessage = "Loading page...",
  errorFallback,
  preloadOnHover = true
}) => {
  const handleMouseEnter = useCallback(() => {
    if (preloadOnHover && element.type && typeof element.type === 'object' && 'preload' in element.type) {
      const preloadableComponent = element.type as PreloadableComponent;
      preloadableComponent.preload?.();
    }
  }, [element.type, preloadOnHover]);

  return (
    <div onMouseEnter={handleMouseEnter}>
      <ThemeAwareErrorBoundary fallback={errorFallback}>
        <Suspense fallback={<ThemeAwareLoadingSpinner message={fallbackMessage} />}>
          {element}
        </Suspense>
      </ThemeAwareErrorBoundary>
    </div>
  );
});

EnhancedRoute.displayName = 'EnhancedRoute';

/**
 * Enhanced Protected Route with optimized performance
 */
interface EnhancedProtectedRouteProps {
  element: React.ReactElement;
  guardOptions: typeof routeGuards.admin;
  fallbackMessage?: string;
  errorFallback?: React.ReactNode;
  preloadOnHover?: boolean;
}

const EnhancedProtectedRoute = memo<EnhancedProtectedRouteProps>(({ 
  element, 
  guardOptions, 
  fallbackMessage = "Loading secure page...", 
  errorFallback,
  preloadOnHover = true
}) => {
  const handleMouseEnter = useCallback(() => {
    if (preloadOnHover && element.type && typeof element.type === 'object' && 'preload' in element.type) {
      const preloadableComponent = element.type as PreloadableComponent;
      preloadableComponent.preload?.();
    }
  }, [element.type, preloadOnHover]);

  return (
    <div onMouseEnter={handleMouseEnter}>
      <ThemeAwareErrorBoundary fallback={errorFallback}>
        <Suspense fallback={<ThemeAwareLoadingSpinner message={fallbackMessage} />}>
          <ProtectedRoute guardOptions={guardOptions}>
            {element}
          </ProtectedRoute>
        </Suspense>
      </ThemeAwareErrorBoundary>
    </div>
  );
});

EnhancedProtectedRoute.displayName = 'EnhancedProtectedRoute';

/**
 * Performance monitoring hook
 */
const useRoutePerformance = () => {
  const location = useLocation();

  const handleRouteChange = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      const endTime = performance.now();
      console.log(`Route ${location.pathname} navigation completed at ${endTime.toFixed(2)}ms`);
    }
  }, [location.pathname]);

  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          handleRouteChange();
        }
      });
    });

    if ('observe' in observer) {
      observer.observe({ entryTypes: ['navigation'] });
    }

    return () => {
      if ('disconnect' in observer) {
        observer.disconnect();
      }
    };
  }, [handleRouteChange]);
};

/**
 * Optimized Router Component with enhanced performance and error handling
 */
const OptimizedRouter: React.FC = memo(() => {
  const location = useLocation();
  
  // Use performance monitoring
  useRoutePerformance();

  // Memoize route configurations for better performance
  const customerRoutes = useMemo(() => [
    { path: '/', element: <LandingPage />, message: 'Loading home page...' },
    { path: '/recommendations', element: <RecommendationsPage />, message: 'Loading recommendations...' },
    { path: '/recommendations/:categoryId', element: <RecommendationsPage />, message: 'Loading category recommendations...' },
    { path: '/frames', element: <FramesPage />, message: 'Loading frames catalog...' },
    { path: '/frames/:frameId', element: <FrameDetailPage />, message: 'Loading frame details...' },
    { path: '/cart', element: <CartPage />, message: 'Loading cart...' },
    { path: '/signup', element: <SignupPage />, message: 'Loading signup...' },
    { path: '/onboarding', element: <OnboardingPage />, message: 'Loading onboarding...' },
    { path: '/virtual-try-on', element: <VirtualTryOnPage />, message: 'Loading virtual try-on...' },
    { path: '/contact-lens-try-on', element: <ContactLensTryOnPage />, message: 'Loading contact lens try-on...' },
    { path: '/style-guide', element: <StyleGuidePage />, message: 'Loading style guide...' },
    { path: '/frame-finder', element: <FrameFinderPage />, message: 'Loading frame finder...' },
    { path: '/face-shape-analysis', element: <FaceShapeAnalysisPage />, message: 'Loading face shape analysis...' },
    { path: '/get-started', element: <GetStartedPage />, message: 'Loading getting started...' },
    { path: '/schedule-demo', element: <ScheduleDemoPage />, message: 'Loading demo scheduler...' },
    { path: '/marketplace', element: <MarketplacePage />, message: 'Loading marketplace...' },
    { path: '/contact', element: <ContactPage />, message: 'Loading contact page...' },
    { path: '/solutions', element: <SolutionsPage />, message: 'Loading solutions...' },
    { path: '/features/:featureId', element: <FeatureDetailPage />, message: 'Loading feature details...' },
    { path: '/products/:productId', element: <ProductDetailPage />, message: 'Loading product details...' },
    { path: '/pricing/:planId', element: <PricingDetailPage />, message: 'Loading pricing details...' },
  ], []);

  const adminRoutes = useMemo(() => [
    { path: '', element: <DashboardPage />, message: 'Loading admin dashboard...' },
    { path: 'dashboard', element: <DashboardPage />, message: 'Loading dashboard...' },
    { path: 'home', element: <HomePage />, message: 'Loading admin home...' },
    { path: 'auth', element: <AuthPage />, message: 'Loading authentication...', protected: false },
    { path: 'products', element: <ProductsPage />, message: 'Loading products...' },
    { path: 'products/catalog', element: <ProductsPage />, message: 'Loading product catalog...' },
    { path: 'sku-genie', element: <SkuGeniePage />, message: 'Loading SKU Genie...' },
    { path: 'integrations', element: <CommerceIntegrationsPage />, message: 'Loading integrations...' },
    { path: 'integrations/commerce', element: <CommerceIntegrationsPage />, message: 'Loading commerce integrations...' },
    { path: 'integrations/retail', element: <RetailIntegrationsPage />, message: 'Loading retail integrations...' },
    { path: 'merchant-onboarding', element: <MerchantOnboardingPage />, message: 'Loading merchant onboarding...' },
    { path: 'solutions', element: <AdminSolutionsPage />, message: 'Loading solutions...' },
    { path: 'ai-technology', element: <AITechnologyPage />, message: 'Loading AI technology...' },
    { path: 'api-documentation', element: <ApiDocumentationPage />, message: 'Loading API documentation...' },
    { path: 'app-store', element: <AppStorePage />, message: 'Loading app store...' },
    { path: 'fit-consultation', element: <FitConsultationPage />, message: 'Loading fit consultation...' },
    { path: 'frame-finder', element: <CommerceStudioFrameFinderPage />, message: 'Loading frame finder...' },
    { path: 'pricing', element: <PricingPage />, message: 'Loading pricing...' },
    { path: 'style-recommendations', element: <StyleRecommendationsPage />, message: 'Loading style recommendations...' },
    { path: 'analytics', element: <AnalyticsPage />, message: 'Loading analytics...' },
    { path: 'merchant-onboarding-analytics', element: <MerchantOnboardingAnalyticsPage />, message: 'Loading merchant analytics...' },
    { path: 'settings', element: <SettingsPage />, message: 'Loading settings...' },
  ], []);

  const settingsRoutes = useMemo(() => [
    { path: 'account', element: <AccountSettingsPage />, message: 'Loading account settings...' },
    { path: 'integration', element: <IntegrationSettingsPage />, message: 'Loading integration settings...' },
    { path: 'appearance', element: <AppearanceSettingsPage />, message: 'Loading appearance settings...' },
    { path: 'recommendation', element: <RecommendationSettingsPage />, message: 'Loading recommendation settings...' },
    { path: 'notification', element: <NotificationSettingsPage />, message: 'Loading notification settings...' },
  ], []);

  // Preload critical routes based on current location
  useEffect(() => {
    const preloadCriticalRoutes = () => {
      if (location.pathname === '/') {
        // Preload commonly accessed pages from home
        RecommendationsPage.preload?.();
        FramesPage.preload?.();
        VirtualTryOnPage.preload?.();
      } else if (location.pathname.startsWith('/admin')) {
        // Preload admin dashboard if on admin routes
        DashboardPage.preload?.();
        AnalyticsPage.preload?.();
      }
    };

    const timeoutId = setTimeout(preloadCriticalRoutes, 1000);
    return () => clearTimeout(timeoutId);
  }, [location.pathname]);

  return (
    <Routes>
      {/* Customer-facing routes */}
      <Route path="/" element={<EnhancedCustomerLayout />}>
        <Route index element={<EnhancedRoute element={<LandingPage />} fallbackMessage="Loading home page..." />} />
        
        {/* Recommendations routes */}
        <Route path="recommendations">
          <Route index element={<EnhancedRoute element={<RecommendationsPage />} fallbackMessage="Loading recommendations..." />} />
          <Route path=":categoryId" element={<EnhancedRoute element={<RecommendationsPage />} fallbackMessage="Loading category recommendations..." />} />
        </Route>
        
        {/* Frames routes */}
        <Route path="frames">
          <Route index element={<EnhancedRoute element={<FramesPage />} fallbackMessage="Loading frames catalog..." />} />
          <Route path=":frameId" element={<EnhancedRoute element={<FrameDetailPage />} fallbackMessage="Loading frame details..." />} />
        </Route>
        
        {/* Render other customer routes */}
        {customerRoutes.slice(3).map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<EnhancedRoute element={route.element} fallbackMessage={route.message} />}
          />
        ))}
      </Route>
      
      {/* Admin routes */}
      <Route path="/admin" element={<CommerceStudioLayout />}>
        {adminRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              route.protected === false ? (
                <EnhancedRoute element={route.element} fallbackMessage={route.message} />
              ) : (
                <EnhancedProtectedRoute
                  element={route.element}
                  guardOptions={routeGuards.admin}
                  fallbackMessage={route.message}
                />
              )
            }
          />
        ))}
        
        {/* Settings nested routes */}
        <Route path="settings" element={
          <EnhancedProtectedRoute
            element={<SettingsPage />}
            guardOptions={routeGuards.admin}
            fallbackMessage="Loading settings..."
          />
        }>
          {settingsRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <EnhancedProtectedRoute
                  element={route.element}
                  guardOptions={routeGuards.admin}
                  fallbackMessage={route.message}
                />
              }
            />
          ))}
        </Route>
        
        {/* Catch-all for admin routes */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
      
      {/* Catch-all for unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
});

OptimizedRouter.displayName = 'OptimizedRouter';

export default OptimizedRouter;