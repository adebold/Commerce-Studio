import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { Role } from '../../services/auth';
import { RouteGuardOptions, defaultGuardOptions, hasRequiredRole } from '../../utils/routeGuards';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: Role[];
  redirectPath?: string;
  requireAuth?: boolean;
  guardOptions?: RouteGuardOptions;
}

/**
 * A component that protects routes by checking authentication status
 * and optionally verifying user roles.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
  redirectPath,
  requireAuth,
  guardOptions,
}) => {
  // Merge provided props with guard options or default options
  const options = guardOptions || {
    requiredRoles: requiredRoles || defaultGuardOptions.requiredRoles,
    redirectPath: redirectPath || defaultGuardOptions.redirectPath,
    requireAuth: requireAuth !== undefined ? requireAuth : defaultGuardOptions.requireAuth,
  };

  const { isAuthenticated, userContext, loading, checkAuth } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();
      setIsChecking(false);
    };

    verifyAuth();
  }, [checkAuth]);

  // Show loading indicator while checking authentication
  if (loading || isChecking) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
        <p>Verifying authentication...</p>
      </div>
    );
  }

  // If authentication is required but user is not authenticated, redirect to login
  if (options.requireAuth && !isAuthenticated) {
    return <Navigate to={options.redirectPath || '/admin/auth'} state={{ from: location }} replace />;
  }

  // If roles are specified, check if user has required role
  if (options.requiredRoles && options.requiredRoles.length > 0 && userContext) {
    const userHasRequiredRole = hasRequiredRole(userContext.role, options.requiredRoles);
    
    if (!userHasRequiredRole) {
      // Redirect to home if user doesn't have required role
      return <Navigate to="/" replace />;
    }
  }

  // If all checks pass, render children
  return <>{children}</>;
};

export default ProtectedRoute;