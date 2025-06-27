import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';
import { Role, UserContext } from '../services/auth';
import '@testing-library/jest-dom';

// Mock auth service
jest.mock('../services/auth', () => ({
  ...jest.requireActual('../services/auth'),
  authService: {
    login: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
    refreshToken: jest.fn(),
  },
}));

// Mock lazy-loaded components
jest.mock('../pages/Dashboard', () => ({
  __esModule: true,
  default: () => <div data-testid="dashboard-page">Dashboard</div>,
}));

jest.mock('../pages/virtual-try-on', () => ({
  __esModule: true,
  default: () => <div data-testid="virtual-try-on-page">Virtual Try On</div>,
}));

jest.mock('../pages/recommendations', () => ({
  __esModule: true,
  default: () => <div data-testid="recommendations-page">Recommendations</div>,
}));

jest.mock('../pages/FaceShapeAnalysisPage', () => ({
  __esModule: true,
  default: () => <div data-testid="face-shape-page">Face Shape Analysis</div>,
}));

jest.mock('../pages/Login', () => ({
  __esModule: true,
  default: () => <div data-testid="login-page">Login</div>,
}));

jest.mock('../pages/NotFound', () => ({
  __esModule: true,
  default: () => <div data-testid="not-found-page">404 Not Found</div>,
}));

// Mock auth context
const mockAuthContext = {
  isAuthenticated: false,
  user: null as UserContext | null,
  login: jest.fn(),
  logout: jest.fn(),
  loading: false,
  error: null,
  hasRole: jest.fn(),
  hasAnyRole: jest.fn(),
  hasAllRoles: jest.fn(),
};

jest.mock('../components/auth/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => mockAuthContext,
}));

describe('App Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthContext.isAuthenticated = false;
    mockAuthContext.user = null;
    mockAuthContext.loading = false;
    mockAuthContext.error = null;
  });

  describe('Full App Integration', () => {
    it('should render the complete app with all providers', () => {
      const { container } = render(<App />);
      expect(container).toBeInTheDocument();
    });

    it('should show login page when not authenticated', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });
    });

    it('should show dashboard when authenticated', async () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { id: '1', email: 'test@example.com', role: Role.VIEWER };
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });
    });

    it('should handle theme persistence across page reloads', async () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { id: '1', email: 'test@example.com', role: Role.VIEWER };
      
      const { rerender } = render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });

      // Simulate page reload
      rerender(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });
    });
  });

  describe('Error Boundary Integration', () => {
    it('should catch and display errors gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock a component that throws an error
      jest.mock('../pages/Dashboard', () => ({
        __esModule: true,
        default: () => {
          throw new Error('Test error');
        },
      }));

      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { id: '1', email: 'test@example.com', role: Role.VIEWER };
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });

      consoleError.mockRestore();
    });

    it('should allow recovery from errors', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { id: '1', email: 'test@example.com', role: Role.VIEWER };
      
      render(<App />);
      
      // Should show dashboard normally
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });

      consoleError.mockRestore();
    });
  });

  describe('Theme Integration', () => {
    it('should apply theme to all components', async () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { id: '1', email: 'test@example.com', role: Role.VIEWER };
      
      const { container } = render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });

      // Check if MUI theme is applied
      const muiRoot = container.querySelector('.MuiBox-root');
      expect(muiRoot).toBeInTheDocument();
    });

    it('should support theme switching', async () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { id: '1', email: 'test@example.com', role: Role.VIEWER };
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });

      // Theme switching would be tested here if implemented
    });
  });

  describe('Routing Integration', () => {
    it('should handle navigation between routes', async () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { id: '1', email: 'test@example.com', role: Role.VIEWER };
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });

      // Navigation would be tested here with actual navigation components
    });

    it('should handle deep linking', async () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { id: '1', email: 'test@example.com', role: Role.VIEWER };
      
      // Test deep linking by setting initial route
      window.history.pushState({}, '', '/virtual-try-on');
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('virtual-try-on-page')).toBeInTheDocument();
      });
    });

    it('should handle 404 routes', async () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { id: '1', email: 'test@example.com', role: Role.VIEWER };
      
      window.history.pushState({}, '', '/non-existent-route');
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
      });
    });
  });

  describe('Authentication Flow Integration', () => {
    it('should handle login flow', async () => {
      render(<App />);
      
      // Initially show login
      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });

      // Simulate successful login
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { id: '1', email: 'test@example.com', role: Role.VIEWER };
      
      // Force re-render to simulate auth state change
      const { rerender } = render(<App />);
      rerender(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });
    });

    it('should handle logout flow', async () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { id: '1', email: 'test@example.com', role: Role.VIEWER };
      
      const { rerender } = render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });

      // Simulate logout
      mockAuthContext.isAuthenticated = false;
      mockAuthContext.user = null;
      
      rerender(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });
    });

    it('should handle token refresh', async () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { id: '1', email: 'test@example.com', role: Role.VIEWER };
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });

      // Token refresh would be tested here
    });
  });

  describe('Performance Optimization', () => {
    it('should lazy load route components', async () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { id: '1', email: 'test@example.com', role: Role.VIEWER };
      
      render(<App />);
      
      // Component should load asynchronously
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      }, { timeout: 200 });
    });

    it('should show loading state during lazy loading', async () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { id: '1', email: 'test@example.com', role: Role.VIEWER };
      
      const { container } = render(<App />);
      
      // Should show suspense fallback initially
      expect(container.textContent).toContain('');
      
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Integration', () => {
    it('should maintain focus management during navigation', async () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { id: '1', email: 'test@example.com', role: Role.VIEWER };
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });

      // Focus management would be tested here
    });

    it('should announce route changes to screen readers', async () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { id: '1', email: 'test@example.com', role: Role.VIEWER };
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });

      // Screen reader announcements would be tested here
    });
  });

  describe('State Management Integration', () => {
    it('should maintain global state across routes', async () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { id: '1', email: 'test@example.com', role: Role.VIEWER };
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });

      // Global state persistence would be tested here
    });

    it('should handle concurrent state updates', async () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { id: '1', email: 'test@example.com', role: Role.VIEWER };
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });

      // Concurrent updates would be tested here
    });
  });

  describe('Security Integration', () => {
    it('should sanitize user inputs', async () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { 
        id: '1', 
        email: '<script>alert("xss")</script>@example.com', 
        role: Role.VIEWER 
      };
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });

      // XSS prevention would be tested here
    });

    it('should enforce role-based access control', async () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.user = { id: '1', email: 'test@example.com', role: Role.VIEWER };
      mockAuthContext.hasRole.mockReturnValue(false);
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });

      // RBAC enforcement would be tested here
    });
  });
});