import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService, UserContext, Role } from '../../services/auth';

// Define the shape of our auth context
interface AuthContextType {
  isAuthenticated: boolean;
  userContext: UserContext | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  checkAuth: () => Promise<boolean>;
  hasRole: (role: Role) => boolean;
  hasAccess: (resourceType: string) => boolean;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props for the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication status
  const checkAuth = async (): Promise<boolean> => {
    try {
      const user = await authService.getCurrentUser();
      
      if (user) {
        setIsAuthenticated(true);
        setUserContext(user);
        return true;
      } else {
        setIsAuthenticated(false);
        setUserContext(null);
        return false;
      }
    } catch (err) {
      console.error('Auth check error:', err);
      setIsAuthenticated(false);
      setUserContext(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Check for existing auth on mount and when location changes
  useEffect(() => {
    checkAuth();
  }, []);

  // Redirect unauthenticated users away from protected routes
  useEffect(() => {
    const handleProtectedRoutes = async () => {
      // Skip during initial loading
      if (loading) return;
      
      const isAdmin = location.pathname.startsWith('/admin');
      
      // If trying to access admin routes
      if (isAdmin) {
        if (!isAuthenticated) {
          // Redirect to login
          navigate('/admin/auth', { replace: true });
        } else if (userContext && userContext.role !== Role.SUPER_ADMIN &&
                  userContext.role !== Role.CLIENT_ADMIN) {
          // Redirect users without admin privileges
          navigate('/', { replace: true });
        }
      }
    };
    
    handleProtectedRoutes();
  }, [location, isAuthenticated, userContext, loading, navigate]);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use emailOrUsername parameter to support both email and username login
      const response = await authService.login({ emailOrUsername: email, password });
      
      // Update state
      setIsAuthenticated(true);
      setUserContext(response.user);
      
      // Redirect based on role
      if (response.user.role === Role.SUPER_ADMIN || response.user.role === Role.CLIENT_ADMIN) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: unknown) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Invalid email or password. Please try again.';
      setError(errorMessage);
      setIsAuthenticated(false);
      setUserContext(null);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    
    try {
      await authService.logout();
      
      // Update state
      setIsAuthenticated(false);
      setUserContext(null);
      
      // Redirect to login page
      navigate('/admin/auth');
    } catch (err: unknown) {
      console.error('Logout error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Logout failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Check if user has a specific role
  const hasRole = (role: Role): boolean => {
    if (!isAuthenticated || !userContext) {
      return false;
    }
    
    // Super admin has access to everything
    if (userContext.role === Role.SUPER_ADMIN) {
      return true;
    }
    
    return userContext.role === role;
  };
  
  // Check if user has access to a specific resource type
  const hasAccess = (resourceType: string): boolean => {
    if (!isAuthenticated || !userContext) {
      return false;
    }
    
    // Super admin has access to everything
    if (userContext.role === Role.SUPER_ADMIN) {
      return true;
    }
    
    // Define resource access based on roles
    const roleResourceMap: Record<Role, string[]> = {
      [Role.SUPER_ADMIN]: ['*'], // All resources
      [Role.CLIENT_ADMIN]: ['products', 'analytics', 'settings', 'users'],
      [Role.BRAND_MANAGER]: ['products', 'analytics'],
      [Role.VIEWER]: ['products', 'analytics'],
    };
    
    const allowedResources = roleResourceMap[userContext.role] || [];
    
    return allowedResources.includes('*') || allowedResources.includes(resourceType);
  };

  // Create the context value
  const contextValue: AuthContextType = {
    isAuthenticated,
    userContext,
    login,
    logout,
    loading,
    error,
    checkAuth,
    hasRole,
    hasAccess
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// RBAC component for role-based access control
interface RBACProps {
  allowedRoles?: Role[];
  resourceType?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export const RBAC: React.FC<RBACProps> = ({
  allowedRoles,
  resourceType,
  children,
  fallback = null
}) => {
  const { isAuthenticated, hasRole, hasAccess } = useAuth();
  
  if (!isAuthenticated) {
    return fallback as React.ReactElement || null;
  }
  
  // Check role-based access
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAllowedRole = allowedRoles.some(role => hasRole(role));
    if (!hasAllowedRole) {
      return fallback as React.ReactElement || null;
    }
  }
  
  // Check resource-based access
  if (resourceType && !hasAccess(resourceType)) {
    return fallback as React.ReactElement || null;
  }
  
  return children as React.ReactElement;
};

export default AuthProvider;