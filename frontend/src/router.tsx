import React, { lazy } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { routeGuards } from './utils/routeGuards';
import CustomerLayout from './layouts/CustomerLayout';
import CommerceStudioLayout from './layouts/CommerceStudioLayout';

// Error boundary component
const ErrorBoundary = () => {
  return (
    <div className="error-container">
      <h2>Something went wrong</h2>
      <p>We're sorry, but there was an error loading this page.</p>
      <button onClick={() => window.location.href = '/'}>Go to Home</button>
    </div>
  );
};

// Lazy load components for better performance
// Customer-facing pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const RecommendationsPage = lazy(() => import('./pages/recommendations'));
const FrameDetailPage = lazy(() => import('./pages/FrameDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const VirtualTryOnPage = lazy(() => import('./pages/virtual-try-on'));
const ContactLensTryOnPage = lazy(() => import('./pages/ContactLensTryOnPage'));
const FrameFinderPage = lazy(() => import('./pages/frame-finder'));
const FramesPage = lazy(() => import('./pages/FramesPage'));
const StyleGuidePage = lazy(() => import('./pages/StyleGuidePage'));

// Commerce Studio pages
const HomePage = lazy(() => import('./pages/commerce-studio/HomePage'));
const DashboardPage = lazy(() => import('./pages/commerce-studio/DashboardPage'));
const AuthPage = lazy(() => import('./pages/commerce-studio/AuthPage'));
const ProductsPage = lazy(() => import('./pages/commerce-studio/ProductsPage'));
const SkuGeniePage = lazy(() => import('./pages/commerce-studio/SkuGeniePage'));
const CommerceIntegrationsPage = lazy(() => import('./pages/commerce-studio/CommerceIntegrationsPage'));
const AITechnologyPage = lazy(() => import('./pages/commerce-studio/AITechnologyPage'));
const ApiDocumentationPage = lazy(() => import('./pages/commerce-studio/ApiDocumentationPage'));
const AppStorePage = lazy(() => import('./pages/commerce-studio/AppStorePage'));
const FitConsultationPage = lazy(() => import('./pages/commerce-studio/FitConsultationPage'));
const CommerceStudioFrameFinderPage = lazy(() => import('./pages/commerce-studio/FrameFinderPage'));
const PricingPage = lazy(() => import('./pages/commerce-studio/PricingPage'));
const RetailIntegrationsPage = lazy(() => import('./pages/commerce-studio/RetailIntegrationsPage'));
const SolutionsPage = lazy(() => import('./pages/commerce-studio/SolutionsPage'));
const StyleRecommendationsPage = lazy(() => import('./pages/commerce-studio/StyleRecommendationsPage'));
const AnalyticsPage = lazy(() => import('./pages/commerce-studio/AnalyticsPage'));
const SettingsPage = lazy(() => import('./pages/commerce-studio/SettingsPage'));
const MerchantOnboardingPage = lazy(() => import('./pages/commerce-studio/MerchantOnboardingPage'));
const MerchantOnboardingAnalyticsPage = lazy(() => import('./pages/commerce-studio/MerchantOnboardingAnalyticsPage'));

// Settings pages
const AccountSettingsPage = lazy(() => import('./pages/commerce-studio/settings/AccountSettingsPage'));
const IntegrationSettingsPage = lazy(() => import('./pages/commerce-studio/settings/IntegrationSettingsPage'));
const AppearanceSettingsPage = lazy(() => import('./pages/commerce-studio/settings/AppearanceSettingsPage'));
const RecommendationSettingsPage = lazy(() => import('./pages/commerce-studio/settings/RecommendationSettingsPage'));
const NotificationSettingsPage = lazy(() => import('./pages/commerce-studio/settings/NotificationSettingsPage'));

// Create router with nested routes
const router = createBrowserRouter([
  // Customer-facing routes (varai.ai)
  {
    path: '/',
    element: <CustomerLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: 'recommendations',
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute guardOptions={routeGuards.customer}>
                <RecommendationsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: ':categoryId',
            element: (
              <ProtectedRoute guardOptions={routeGuards.customer}>
                <RecommendationsPage />
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        path: 'frames',
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute guardOptions={routeGuards.customer}>
                <FramesPage />
              </ProtectedRoute>
            ),
          },
          {
            path: ':frameId',
            element: (
              <ProtectedRoute guardOptions={routeGuards.customer}>
                <FrameDetailPage />
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        path: 'cart',
        element: (
          <ProtectedRoute guardOptions={routeGuards.customer}>
            <CartPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'signup',
        element: <SignupPage />,
      },
      {
        path: 'onboarding',
        element: (
          <ProtectedRoute guardOptions={routeGuards.customer}>
            <OnboardingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'virtual-try-on',
        element: (
          <ProtectedRoute guardOptions={routeGuards.customer}>
            <VirtualTryOnPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'contact-lens-try-on',
        element: (
          <ProtectedRoute guardOptions={routeGuards.customer}>
            <ContactLensTryOnPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'style-guide',
        element: <StyleGuidePage />,
      },
      {
        path: 'frame-finder',
        element: (
          <ProtectedRoute guardOptions={routeGuards.customer}>
            <FrameFinderPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  
  // Commerce Studio routes (app.varai.ai)
  {
    path: '/admin',
    element: <CommerceStudioLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute guardOptions={routeGuards.admin}>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute guardOptions={routeGuards.admin}>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'home',
        element: (
          <ProtectedRoute guardOptions={routeGuards.admin}>
            <HomePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'auth',
        element: <AuthPage />,
      },
      {
        path: 'products',
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute guardOptions={routeGuards.admin}>
                <ProductsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'catalog',
            element: (
              <ProtectedRoute guardOptions={routeGuards.admin}>
                <ProductsPage />
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        path: 'sku-genie',
        element: (
          <ProtectedRoute guardOptions={routeGuards.admin}>
            <SkuGeniePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'integrations',
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute guardOptions={routeGuards.admin}>
                <CommerceIntegrationsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'commerce',
            element: (
              <ProtectedRoute guardOptions={routeGuards.admin}>
                <CommerceIntegrationsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'retail',
            element: (
              <ProtectedRoute guardOptions={routeGuards.admin}>
                <RetailIntegrationsPage />
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        path: 'merchant-onboarding',
        element: (
          <ProtectedRoute guardOptions={routeGuards.admin}>
            <MerchantOnboardingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'solutions',
        element: (
          <ProtectedRoute guardOptions={routeGuards.admin}>
            <SolutionsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'ai-technology',
        element: (
          <ProtectedRoute guardOptions={routeGuards.admin}>
            <AITechnologyPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'api-documentation',
        element: (
          <ProtectedRoute guardOptions={routeGuards.admin}>
            <ApiDocumentationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'app-store',
        element: (
          <ProtectedRoute guardOptions={routeGuards.admin}>
            <AppStorePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'fit-consultation',
        element: (
          <ProtectedRoute guardOptions={routeGuards.admin}>
            <FitConsultationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'frame-finder',
        element: (
          <ProtectedRoute guardOptions={routeGuards.admin}>
            <CommerceStudioFrameFinderPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'pricing',
        element: (
          <ProtectedRoute guardOptions={routeGuards.admin}>
            <PricingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'style-recommendations',
        element: (
          <ProtectedRoute guardOptions={routeGuards.admin}>
            <StyleRecommendationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'analytics',
        element: (
          <ProtectedRoute guardOptions={routeGuards.admin}>
            <AnalyticsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'merchant-onboarding-analytics',
        element: (
          <ProtectedRoute guardOptions={routeGuards.admin}>
            <MerchantOnboardingAnalyticsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute guardOptions={routeGuards.admin}>
            <SettingsPage />
          </ProtectedRoute>
        ),
        children: [
          {
            path: 'account',
            element: (
              <ProtectedRoute guardOptions={routeGuards.admin}>
                <AccountSettingsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'integration',
            element: (
              <ProtectedRoute guardOptions={routeGuards.admin}>
                <IntegrationSettingsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'appearance',
            element: (
              <ProtectedRoute guardOptions={routeGuards.admin}>
                <AppearanceSettingsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'recommendation',
            element: (
              <ProtectedRoute guardOptions={routeGuards.admin}>
                <RecommendationSettingsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'notification',
            element: (
              <ProtectedRoute guardOptions={routeGuards.admin}>
                <NotificationSettingsPage />
              </ProtectedRoute>
            ),
          },
        ],
      },
      // Catch-all redirect for admin routes
      {
        path: '*',
        element: <Navigate to="/admin" replace />,
      },
    ],
  },
  // Catch-all redirect for unknown routes
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

const Router: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default Router;