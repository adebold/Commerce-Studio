import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Container, Typography, Box, Button } from "@mui/material";
import HomePage from "./pages/commerce-studio/HomePage";
import LandingPage from "./pages/LandingPage";
import { AuthProvider, useAuth } from "./components/auth/AuthProvider";
import { Role } from "./services/auth";
import NavigationMenu from "./components/NavigationMenu";

import {
  SuperAdminDashboard,
  ClientAdminDashboard,
  BrandManagerDashboard,
  ViewerDashboard,
} from "./components/dashboard";

// Protected route component that checks user role before rendering
interface ProtectedRouteProps {
  element: React.ReactNode;
  allowedRoles: Role[];
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element,
  allowedRoles,
  redirectPath = "/auth",
}) => {
  const { isAuthenticated, userContext } = useAuth();

  if (!isAuthenticated) {
    // Not logged in, redirect to login
    return <Navigate to={redirectPath} replace />;
  }

  if (userContext && allowedRoles.includes(userContext.role)) {
    // User has permission, render the component
    return <>{element}</>;
  }

  // User doesn't have permission, render access denied
  return (
    <Box sx={{ textAlign: "center", py: 8 }}>
      <Typography variant="h4" color="error" gutterBottom>
        Access Denied
      </Typography>
      <Typography variant="body1" paragraph>
        You don't have permission to access this page.
      </Typography>
      <Button variant="contained" color="primary" href="/">
        Return to Home
      </Button>
    </Box>
  );
};

// Not Found Page
const NotFoundPage = () => (
  <Box sx={{ textAlign: "center", py: 8 }}>
    <Typography variant="h4" gutterBottom>
      Page Not Found
    </Typography>
    <Typography variant="body1" paragraph>
      The page you are looking for doesn't exist or has been moved.
    </Typography>
    <Button variant="contained" color="primary" href="/">
      Return to Home
    </Button>
  </Box>
);

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <NavigationMenu />
        <Container>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<HomePage />} />
            {/* <Route path="/products" element={<ProductsPage />} />
            <Route path="/solutions" element={<SolutionsPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/app-store" element={<AppStorePage />} /> */}

            {/* Routes accessible to all authenticated users */}
            {/* <Route
              path="/frame-finder"
              element={
                <ProtectedRoute
                  element={<FrameFinderPage />}
                  allowedRoles={[
                    Role.SUPER_ADMIN,
                    Role.CLIENT_ADMIN,
                    Role.BRAND_MANAGER,
                    Role.VIEWER,
                  ]}
                />
              }
            />
            <Route
              path="/style-recommendations"
              element={
                <ProtectedRoute
                  element={<StyleRecommendationsPage />}
                  allowedRoles={[
                    Role.SUPER_ADMIN,
                    Role.CLIENT_ADMIN,
                    Role.BRAND_MANAGER,
                    Role.VIEWER,
                  ]}
                />
              }
            />
            <Route
              path="/fit-consultation"
              element={
                <ProtectedRoute
                  element={<FitConsultationPage />}
                  allowedRoles={[
                    Role.SUPER_ADMIN,
                    Role.CLIENT_ADMIN,
                    Role.BRAND_MANAGER,
                    Role.VIEWER,
                  ]}
                />
              }
            /> */}

            {/* Routes with specific role restrictions */}
            {/* <Route
              path="/ai-technology"
              element={
                <ProtectedRoute
                  element={<AITechnologyPage />}
                  allowedRoles={[
                    Role.SUPER_ADMIN,
                    Role.CLIENT_ADMIN,
                    Role.BRAND_MANAGER,
                  ]}
                />
              }
            />
            <Route
              path="/commerce-integrations"
              element={
                <ProtectedRoute
                  element={<CommerceIntegrationsPage />}
                  allowedRoles={[Role.SUPER_ADMIN, Role.CLIENT_ADMIN]}
                />
              }
            />
            <Route
              path="/retail-integrations"
              element={
                <ProtectedRoute
                  element={<RetailIntegrationsPage />}
                  allowedRoles={[Role.SUPER_ADMIN, Role.CLIENT_ADMIN]}
                />
              }
            />
            <Route
              path="/sku-genie"
              element={
                <ProtectedRoute
                  element={<SkuGeniePage />}
                  allowedRoles={[Role.SUPER_ADMIN, Role.CLIENT_ADMIN]}
                />
              }
            /> */}

            {/* Admin-only routes */}
            {/* <Route
              path="/api-documentation"
              element={
                <ProtectedRoute
                  element={<ApiDocumentationPage />}
                  allowedRoles={[Role.SUPER_ADMIN]}
                />
              }
            /> */}

            {/* Dashboard routes */}
            {/* <Route
              path="/super-admin-dashboard"
              element={
                <ProtectedRoute
                  element={<SuperAdminDashboard />}
                  allowedRoles={[Role.SUPER_ADMIN]}
                />
              }
            />
            <Route
              path="/client-admin-dashboard"
              element={
                <ProtectedRoute
                  element={<ClientAdminDashboard />}
                  allowedRoles={[Role.SUPER_ADMIN, Role.CLIENT_ADMIN]}
                />
              }
            />
            <Route
              path="/brand-manager-dashboard"
              element={
                <ProtectedRoute
                  element={<BrandManagerDashboard />}
                  allowedRoles={[
                    Role.SUPER_ADMIN,
                    Role.CLIENT_ADMIN,
                    Role.BRAND_MANAGER,
                  ]}
                />
              }
            />
            <Route
              path="/viewer-dashboard"
              element={
                <ProtectedRoute
                  element={<ViewerDashboard />}
                  allowedRoles={[
                    Role.SUPER_ADMIN,
                    Role.CLIENT_ADMIN,
                    Role.BRAND_MANAGER,
                    Role.VIEWER,
                  ]}
                />
              }
            /> */}

            {/* 404 Not Found route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Container>
      </AuthProvider>
    </Router>
  );
};

export default AppRoutes;
