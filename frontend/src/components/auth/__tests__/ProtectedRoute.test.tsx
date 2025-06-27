import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import { AuthProvider } from '../AuthProvider';
import { authService, Role } from '../../../services/auth';
import { routeGuards } from '../../../utils/routeGuards';

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

// Test components
const ProtectedComponent = () => <div>Protected Content</div>;
const LoginPage = () => <div>Login Page</div>;
const HomePage = () => <div>Home Page</div>;

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should render children when user is authenticated', async () => {
    // Mock getCurrentUser to return a user
    (authService.getCurrentUser as jest.Mock).mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
      role: Role.CLIENT_ADMIN
    });
    
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/protected" element={
              <ProtectedRoute redirectPath="/login">
                <ProtectedComponent />
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
    
    // Wait for auth check to complete
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
    
    expect(authService.getCurrentUser).toHaveBeenCalled();
  });
  
  it('should redirect to login when user is not authenticated', async () => {
    // Mock getCurrentUser to return null (not authenticated)
    (authService.getCurrentUser as jest.Mock).mockResolvedValue(null);
    
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/protected" element={
              <ProtectedRoute redirectPath="/login">
                <ProtectedComponent />
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
    
    // Wait for auth check to complete and redirect
    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
    
    expect(authService.getCurrentUser).toHaveBeenCalled();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
  
  it('should check user role when requiredRoles is provided', async () => {
    // Mock getCurrentUser to return a user with VIEWER role
    (authService.getCurrentUser as jest.Mock).mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
      role: Role.VIEWER
    });
    
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={
              <ProtectedRoute requiredRoles={[Role.SUPER_ADMIN, Role.CLIENT_ADMIN]}>
                <ProtectedComponent />
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
    
    // Wait for auth check to complete and redirect
    await waitFor(() => {
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });
    
    expect(authService.getCurrentUser).toHaveBeenCalled();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
  
  it('should allow access when user has required role', async () => {
    // Mock getCurrentUser to return a user with CLIENT_ADMIN role
    (authService.getCurrentUser as jest.Mock).mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
      role: Role.CLIENT_ADMIN
    });
    
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={
              <ProtectedRoute requiredRoles={[Role.SUPER_ADMIN, Role.CLIENT_ADMIN]}>
                <ProtectedComponent />
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
    
    // Wait for auth check to complete
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
    
    expect(authService.getCurrentUser).toHaveBeenCalled();
  });

  // New tests for route guards
  it('should use admin route guard options correctly', async () => {
    // Mock getCurrentUser to return a user with CLIENT_ADMIN role
    (authService.getCurrentUser as jest.Mock).mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
      role: Role.CLIENT_ADMIN
    });
    
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={
              <ProtectedRoute guardOptions={routeGuards.admin}>
                <ProtectedComponent />
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
    
    // Wait for auth check to complete
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
    
    expect(authService.getCurrentUser).toHaveBeenCalled();
  });

  it('should deny access with admin route guard for non-admin users', async () => {
    // Mock getCurrentUser to return a user with VIEWER role
    (authService.getCurrentUser as jest.Mock).mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
      role: Role.VIEWER
    });
    
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={
              <ProtectedRoute guardOptions={routeGuards.admin}>
                <ProtectedComponent />
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
    
    // Wait for auth check to complete and redirect
    await waitFor(() => {
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });
    
    expect(authService.getCurrentUser).toHaveBeenCalled();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should allow access to public routes without authentication', async () => {
    // Mock getCurrentUser to return null (not authenticated)
    (authService.getCurrentUser as jest.Mock).mockResolvedValue(null);
    
    render(
      <MemoryRouter initialEntries={['/public']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/public" element={
              <ProtectedRoute guardOptions={routeGuards.public}>
                <ProtectedComponent />
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
    
    // Wait for auth check to complete
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
    
    expect(authService.getCurrentUser).toHaveBeenCalled();
  });

  it('should show loading indicator while checking authentication', async () => {
    // We'll resolve the getCurrentUser promise later to simulate loading
    const getCurrentUserPromise = new Promise<{id: string; email: string; role: Role} | null>(resolve => {
      // This will be resolved in the test
      setTimeout(() => {
        resolve({
          id: 'user-123',
          email: 'test@example.com',
          role: Role.CLIENT_ADMIN
        });
      }, 100);
    });
    
    (authService.getCurrentUser as jest.Mock).mockReturnValue(getCurrentUserPromise);
    
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <AuthProvider>
          <Routes>
            <Route path="/protected" element={
              <ProtectedRoute>
                <ProtectedComponent />
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
    
    // Check for loading indicator
    expect(screen.getByText('Verifying authentication...')).toBeInTheDocument();
    
    // Wait for auth check to complete
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
    
    // Loading indicator should be gone
    expect(screen.queryByText('Verifying authentication...')).not.toBeInTheDocument();
  });
});