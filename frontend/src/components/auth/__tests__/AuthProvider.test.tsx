import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth, RBAC } from '../AuthProvider';
import { authService, Role } from '../../../services/auth';

// Mock the auth service
jest.mock('../../../services/auth', () => {
  const originalModule = jest.requireActual('../../../services/auth');
  
  return {
    ...originalModule,
    authService: {
      login: jest.fn(),
      logout: jest.fn(),
      getCurrentUser: jest.fn(),
      getToken: jest.fn(),
      isTokenValid: jest.fn()
    }
  };
});

// Test component that uses the auth context
const TestComponent = () => {
  const { 
    isAuthenticated, 
    userContext, 
    login, 
    logout, 
    loading, 
    error,
    hasRole,
    hasAccess
  } = useAuth();

  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      <div data-testid="error">{error || 'No Error'}</div>
      <div data-testid="user-role">{userContext?.role || 'No Role'}</div>
      
      <button 
        data-testid="login-button" 
        onClick={() => login('test@example.com', 'process.env.AUTHPROVIDER_SECRET')}
      >
        Login
      </button>
      
      <button 
        data-testid="logout-button" 
        onClick={() => logout()}
      >
        Logout
      </button>
      
      <div data-testid="has-admin-role">
        {hasRole(Role.SUPER_ADMIN) ? 'Has Admin Role' : 'No Admin Role'}
      </div>
      
      <div data-testid="has-products-access">
        {hasAccess('products') ? 'Has Products Access' : 'No Products Access'}
      </div>
    </div>
  );
};

// Test component for RBAC
const RBACTestComponent = () => {
  return (
    <div>
      <RBAC allowedRoles={[Role.SUPER_ADMIN]}>
        <div data-testid="admin-content">Admin Content</div>
      </RBAC>
      
      <RBAC allowedRoles={[Role.CLIENT_ADMIN, Role.BRAND_MANAGER]}>
        <div data-testid="manager-content">Manager Content</div>
      </RBAC>
      
      <RBAC resourceType="products">
        <div data-testid="products-content">Products Content</div>
      </RBAC>
      
      <RBAC 
        allowedRoles={[Role.VIEWER]} 
        fallback={<div data-testid="fallback-content">Fallback Content</div>}
      >
        <div data-testid="viewer-content">Viewer Content</div>
      </RBAC>
    </div>
  );
};

// Wrapper component for testing
const TestWrapper = ({ initialEntries = ['/'] }) => {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route 
          path="/" 
          element={
            <AuthProvider>
              <TestComponent />
            </AuthProvider>
          } 
        />
        <Route 
          path="/rbac-test" 
          element={
            <AuthProvider>
              <RBACTestComponent />
            </AuthProvider>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <AuthProvider>
              <div data-testid="admin-page">Admin Page</div>
            </AuthProvider>
          } 
        />
        <Route 
          path="/admin/auth" 
          element={
            <AuthProvider>
              <div data-testid="login-page">Login Page</div>
            </AuthProvider>
          } 
        />
        <Route 
          path="/super-admin-dashboard" 
          element={
            <AuthProvider>
              <div data-testid="super-admin-dashboard">Super Admin Dashboard</div>
            </AuthProvider>
          } 
        />
      </Routes>
    </MemoryRouter>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders children and starts in loading state', () => {
    render(<TestWrapper />);
    
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
    expect(screen.getByTestId('error')).toHaveTextContent('No Error');
  });

  test('checks authentication status on mount', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      role: Role.CLIENT_ADMIN,
      clientId: 'client-456'
    };
    
    (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    
    render(<TestWrapper />);
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
    
    expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
    expect(screen.getByTestId('user-role')).toHaveTextContent(Role.CLIENT_ADMIN);
  });

  test('handles login success', async () => {
    const mockResponse = {
      token: 'mock-token',
      user: {
        id: 'user-123',
        email: 'test@example.com',
        role: Role.SUPER_ADMIN
      }
    };
    
    (authService.login as jest.Mock).mockResolvedValue(mockResponse);
    
    const { container } = render(<TestWrapper />);
    
    fireEvent.click(screen.getByTestId('login-button'));
    
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
    
    expect(authService.login).toHaveBeenCalledWith({
      emailOrUsername: 'test@example.com',
      password: 'password123'
    });
    
    expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
    expect(screen.getByTestId('user-role')).toHaveTextContent(Role.SUPER_ADMIN);
    
    // Should redirect to super admin dashboard
    expect(container.innerHTML).toContain('Super Admin Dashboard');
  });

  test('handles login error', async () => {
    const mockError = new Error('Invalid credentials');
    (authService.login as jest.Mock).mockRejectedValue(mockError);
    
    render(<TestWrapper />);
    
    fireEvent.click(screen.getByTestId('login-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
    
    expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
  });

  test('handles logout', async () => {
    // Setup initial authenticated state
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      role: Role.CLIENT_ADMIN
    };
    
    (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    
    const { container } = render(<TestWrapper />);
    
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
    });
    
    // Mock successful logout
    (authService.logout as jest.Mock).mockResolvedValue(undefined);
    
    fireEvent.click(screen.getByTestId('logout-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
    
    expect(authService.logout).toHaveBeenCalled();
    expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
    
    // Should redirect to login page
    expect(container.innerHTML).toContain('Login Page');
  });

  test('redirects unauthenticated users away from admin routes', async () => {
    (authService.getCurrentUser as jest.Mock).mockResolvedValue(null);
    
    const { container } = render(<TestWrapper initialEntries={['/admin']} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
    
    // Should redirect to login page
    expect(container.innerHTML).toContain('Login Page');
  });

  test('RBAC component renders content based on user role', async () => {
    // Setup authenticated user with SUPER_ADMIN role
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      role: Role.SUPER_ADMIN
    };
    
    (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    
    render(<TestWrapper initialEntries={['/rbac-test']} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
    });
    
    // Super admin should see admin content
    expect(screen.getByTestId('admin-content')).toBeInTheDocument();
    
    // Super admin should see products content (has access to all resources)
    expect(screen.getByTestId('products-content')).toBeInTheDocument();
    
    // Super admin should not see viewer content, but should see fallback
    expect(screen.queryByTestId('viewer-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('fallback-content')).toBeInTheDocument();
  });

  test('hasRole and hasAccess functions work correctly', async () => {
    // Setup authenticated user with CLIENT_ADMIN role
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      role: Role.CLIENT_ADMIN,
      clientId: 'client-456'
    };
    
    (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    
    render(<TestWrapper />);
    
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
    });
    
    // CLIENT_ADMIN does not have SUPER_ADMIN role
    expect(screen.getByTestId('has-admin-role')).toHaveTextContent('No Admin Role');
    
    // CLIENT_ADMIN has access to products
    expect(screen.getByTestId('has-products-access')).toHaveTextContent('Has Products Access');
  });
});