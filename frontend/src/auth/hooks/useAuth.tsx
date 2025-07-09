import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { AuthService } from '../AuthService';
import { Tenant } from '../components/TenantSelector';
import axios, { AxiosInstance } from 'axios';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  permissions: string[];
  tenantId?: string;
  clientId?: string;
  brandId?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  tenants: Tenant[] | null;
  error: Error | null;
  login: (email: string, password: string, tenantId?: string | null) => Promise<void>;
  loginWithSSO: (provider: string, tenantId?: string | null) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  getAuthenticatedRequest: () => AxiosInstance; // Returns an axios instance with auth headers
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider for components to consume and subscribe to changes
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [tenants, setTenants] = useState<Tenant[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [authService, setAuthService] = useState<AuthService | null>(null);

  useEffect(() => {
    // Initialize auth service
    const service = new AuthService({
      varaiApiUrl: process.env.REACT_APP_VARAI_API_URL || 'https://api.varai.com',
      varaiClientId: process.env.REACT_APP_VARAI_CLIENT_ID || '',
      varaiClientSecret: process.env.REACT_APP_VARAI_CLIENT_SECRET || '',
      platform: process.env.REACT_APP_PLATFORM || 'web',
      redirectUri: `${window.location.origin}/auth/callback`
    });
    
    setAuthService(service);

    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check for token in localStorage
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setIsAuthenticated(false);
          setUser(null);
          return;
        }
        
        // Verify token and get user context
        const authContext = await service.getAuthContext(token);
        if (!authContext) {
          setIsAuthenticated(false);
          setUser(null);
          localStorage.removeItem('auth_token');
          return;
        }
        
        // Get user profile
        const profile = await service.getProfile(token);
        
        setUser({
          id: authContext.userId,
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          roles: authContext.roles,
          permissions: authContext.permissions,
          tenantId: authContext.tenantId,
          clientId: authContext.clientId,
          brandId: authContext.brandId
        });
        
        setIsAuthenticated(true);
        
        // Load available tenants if needed
        if (process.env.REACT_APP_MULTI_TENANT === 'true') {
          const tenantService = service.getTenantService();
          const tenantsResponse = await tenantService.listTenants({ status: 'active' });
          setTenants(tenantsResponse.data);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string, tenantId?: string | null) => {
    if (!authService) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Set tenant ID if provided
      if (tenantId) {
        authService.setTenantId(tenantId);
      } else {
        authService.clearTenantId();
      }
      
      // Implement your login logic here
      // This is a placeholder - you would need to implement the actual API call
      // For example, you might use a custom endpoint that exchanges credentials for tokens
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          tenant_id: tenantId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      const data = await response.json();
      
      // Store token
      localStorage.setItem('auth_token', data.accessToken);
      
      // Get user context
      const authContext = await authService.getAuthContext(data.accessToken);
      
      // Get user profile
      const profile = data.profile || await authService.getProfile(data.accessToken);
      
      setUser({
        id: authContext.userId,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        roles: authContext.roles,
        permissions: authContext.permissions,
        tenantId: authContext.tenantId,
        clientId: authContext.clientId,
        brandId: authContext.brandId
      });
      
      setIsAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithSSO = async (provider: string, tenantId?: string | null) => {
    if (!authService) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Set tenant ID if provided
      if (tenantId) {
        authService.setTenantId(tenantId);
      } else {
        authService.clearTenantId();
      }
      
      // Generate state for CSRF protection
      const state = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('auth_state', state);
      
      // Get OAuth URL
      const url = authService.getOAuthUrl(state);
      
      // Redirect to OAuth provider
      window.location.href = `${url}&provider=${provider}`;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Clear local storage
      localStorage.removeItem('auth_token');
      
      // Reset state
      setIsAuthenticated(false);
      setUser(null);
      
      // Optional: Call logout endpoint to invalidate token on server
      try {
        const token = localStorage.getItem('auth_token');
        if (token && authService) {
          await fetch(`${process.env.REACT_APP_API_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        }
      } catch (err) {
        console.error('Logout API call failed:', err);
        // Continue with local logout even if API call fails
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    if (!authService) return;
    
    try {
      setIsLoading(true);
      
      const currentToken = localStorage.getItem('auth_token');
      if (!currentToken) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }
      
      // Get refresh token from storage or from a secure cookie
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('auth_token');
        return;
      }
      
      // Refresh the token
      const tokenResponse = await authService.refreshToken(refreshToken);
      
      // Store new tokens
      localStorage.setItem('auth_token', tokenResponse.accessToken);
      localStorage.setItem('refresh_token', tokenResponse.refreshToken);
      
      // Update user context if needed
      if (!user) {
        const authContext = await authService.getAuthContext(tokenResponse.accessToken);
        const profile = await authService.getProfile(tokenResponse.accessToken);
        
        setUser({
          id: authContext.userId,
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          roles: authContext.roles,
          permissions: authContext.permissions,
          tenantId: authContext.tenantId,
          clientId: authContext.clientId,
          brandId: authContext.brandId
        });
      }
      
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Token refresh failed:', err);
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };

  const getAuthenticatedRequest = (): AxiosInstance => {
    const token = localStorage.getItem('auth_token');
    const instance = axios.create({
      baseURL: process.env.REACT_APP_API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });

    // Add interceptor to handle token expiration
    instance.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
        
        // If error is 401 and we haven't already tried to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            // Try to refresh the token
            await refreshToken();
            
            // Update the token in the request
            const newToken = localStorage.getItem('auth_token');
            if (newToken) {
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              return instance(originalRequest);
            }
          } catch (refreshError) {
            // If refresh fails, redirect to login
            logout();
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );

    return instance;
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    tenants,
    error,
    login,
    loginWithSSO,
    logout,
    refreshToken,
    hasPermission,
    getAuthenticatedRequest
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook for components to get the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};