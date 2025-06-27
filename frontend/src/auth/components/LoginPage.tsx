import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { TenantSelector, Tenant } from './TenantSelector';


interface LoginPageProps {
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTenantSelector, setShowTenantSelector] = useState(false);
  
  const { login, loginWithSSO, isAuthenticated, tenants } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the return URL from location state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';
  
  useEffect(() => {
    // If user is already authenticated, redirect to the return URL
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
    
    // Check if we need to show tenant selector
    // This would be determined by your auth configuration
    // For example, if the app is configured to support multiple tenants
    setShowTenantSelector(tenants ? tenants.length > 1 : false);
    
    // If there's only one tenant, select it automatically
    if (tenants && tenants.length === 1 && tenants[0]) {
      setSelectedTenantId(tenants[0].id);
    }
  }, [isAuthenticated, navigate, from, tenants]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    
    try {
      setIsLoading(true);
      await login(email, password, selectedTenantId);
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to login. Please check your credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSSOLogin = async (provider: string) => {
    try {
      setIsLoading(true);
      await loginWithSSO(provider, selectedTenantId);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to login with ${provider}`
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex-center min-h-screen py-12">
      <div className="apple-card max-w-md w-full p-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-center mb-6">Sign In</h1>

        {showTenantSelector && (
          <div className="mb-4">
            <TenantSelector
              tenants={tenants || []}
              selectedTenantId={selectedTenantId}
              onChange={setSelectedTenantId}
            />
          </div>
        )}

        {error && (
          <div className="mb-4">
            <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md text-center">
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus-ring"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground focus-ring"
            />
          </div>
          <button
            type="submit"
            className="apple-button-primary w-full mt-2"
            disabled={isLoading || !email || !password}
          >
            {isLoading ? <span className="inline-block w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin align-middle"></span> : 'Sign In'}
          </button>
          <div className="flex justify-between mt-2">
            <a href="/forgot-password" className="text-sm underline text-primary">Forgot password?</a>
            <a href="/register" className="text-sm underline text-primary">Don't have an account? Sign Up</a>
          </div>
        </form>

        {selectedTenantId && tenants && (
          <>
            <div className="my-4">
              <div className="flex items-center">
                <div className="flex-grow border-t border-border"></div>
                <span className="mx-2 text-muted-foreground text-sm">OR</span>
                <div className="flex-grow border-t border-border"></div>
              </div>
            </div>
            <div>
              {tenants.find((t: Tenant) => t.id === selectedTenantId)?.settings?.ssoProviders?.map((provider: {provider: string; enabled: boolean}) => (
                <button
                  key={provider.provider}
                  type="button"
                  className="apple-button-outline w-full mb-2"
                  onClick={() => handleSSOLogin(provider.provider)}
                  disabled={isLoading}
                >
                  Sign in with {getSSOProviderName(provider.provider)}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Helper function to get SSO provider icon
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getSSOIcon = (provider: string) => {
  // You would implement this with actual icons
  return null;
};

// Helper function to get SSO provider display name
const getSSOProviderName = (provider: string): string => {
  switch (provider) {
    case 'google':
      return 'Google';
    case 'microsoft':
      return 'Microsoft';
    case 'okta':
      return 'Okta';
    case 'auth0':
      return 'Auth0';
    case 'saml':
      return 'SAML';
    default:
      return provider.charAt(0).toUpperCase() + provider.slice(1);
  }
};