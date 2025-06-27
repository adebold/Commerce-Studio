import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CustomerLayout from '../CustomerLayout';
import CommerceStudioLayout from '../CommerceStudioLayout';
import { useAuth } from '../../components/auth/AuthProvider';
import { Role } from '../../services/auth';

// Mock the auth hook
jest.mock('../../components/auth/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

// Mock the Outlet component
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Outlet: () => <div data-testid="outlet-content">Outlet Content</div>,
}));

describe('Layout Components', () => {
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default auth mock
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      userContext: {
        id: 'user-123',
        email: 'admin@example.com',
        role: Role.CLIENT_ADMIN,
      },
      loading: false,
      checkAuth: jest.fn().mockResolvedValue(true),
      login: jest.fn(),
      logout: jest.fn(),
      error: null,
    });
  });
  
  describe('CustomerLayout', () => {
    it('renders the customer layout with header and footer', () => {
      render(
        <MemoryRouter>
          <CustomerLayout />
        </MemoryRouter>
      );
      
      // Check for layout elements
      expect(screen.getByText('VARAi')).toBeInTheDocument();
      expect(screen.getByText(/All rights reserved/)).toBeInTheDocument();
      
      // Check that the outlet content is rendered
      expect(screen.getByTestId('outlet-content')).toBeInTheDocument();
    });
  });
  
  describe('CommerceStudioLayout', () => {
    it('renders the commerce studio layout with sidebar and user info', () => {
      render(
        <MemoryRouter>
          <CommerceStudioLayout />
        </MemoryRouter>
      );
      
      // Check for layout elements
      expect(screen.getByText('Commerce Studio')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
      expect(screen.getByText('CLIENT_ADMIN')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
      
      // Check that the outlet content is rendered
      expect(screen.getByTestId('outlet-content')).toBeInTheDocument();
    });
    
    it('handles logout when logout button is clicked', () => {
      const mockLogout = jest.fn().mockResolvedValue(undefined);
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        userContext: {
          id: 'user-123',
          email: 'admin@example.com',
          role: Role.CLIENT_ADMIN,
        },
        loading: false,
        checkAuth: jest.fn().mockResolvedValue(true),
        login: jest.fn(),
        logout: mockLogout,
        error: null,
      });
      
      render(
        <MemoryRouter>
          <CommerceStudioLayout />
        </MemoryRouter>
      );
      
      // Click the logout button
      const logoutButton = screen.getByText('Logout');
      logoutButton.click();
      
      // Check that logout was called
      expect(mockLogout).toHaveBeenCalled();
    });
  });
});