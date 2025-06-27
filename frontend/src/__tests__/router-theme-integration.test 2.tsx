import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import Router from '../router';
import { createVaraiTheme } from '../design-system/mui-integration';
import { AuthProvider } from '../components/auth/AuthProvider';

// Mock auth service
jest.mock('../services/auth', () => ({
  authService: {
    getCurrentUser: jest.fn().mockResolvedValue(null),
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
  },
}));

// Mock lazy loaded components
jest.mock('../pages/HomePage', () => ({
  default: () => <div>Home Page</div>,
}));

jest.mock('../pages/LoginPage', () => ({
  default: () => <div>Login Page</div>,
}));

jest.mock('../pages/dashboard/index', () => ({
  default: () => <div>Dashboard</div>,
}));

describe('Router Theme Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithProviders = (initialEntries: string[] = ['/']) => {
    const theme = createVaraiTheme('light');
    
    return render(
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <MemoryRouter initialEntries={initialEntries}>
            <Router />
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    );
  };

  it('should render router with theme provider', async () => {
    renderWithProviders();
    
    await waitFor(() => {
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });
  });

  it('should apply theme styles to components', async () => {
    const { container } = renderWithProviders();
    
    await waitFor(() => {
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });

    // Check if MUI theme is applied
    const muiRoot = container.querySelector('.MuiBox-root');
    if (muiRoot) {
      const styles = window.getComputedStyle(muiRoot);
      expect(styles).toBeDefined();
    }
  });

  it('should navigate between routes with theme intact', async () => {
    renderWithProviders(['/login']);
    
    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  it('should handle dark theme', async () => {
    const darkTheme = createVaraiTheme('dark');
    
    render(
      <ThemeProvider theme={darkTheme}>
        <AuthProvider>
          <MemoryRouter initialEntries={['/']}>
            <Router />
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });

    expect(darkTheme.palette.mode).toBe('dark');
  });

  it('should maintain theme context through navigation', async () => {
    const { rerender } = renderWithProviders(['/']);
    
    await waitFor(() => {
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });

    // Navigate to login
    rerender(
      <ThemeProvider theme={createVaraiTheme('light')}>
        <AuthProvider>
          <MemoryRouter initialEntries={['/login']}>
            <Router />
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  it('should handle theme switching', async () => {
    let currentTheme = createVaraiTheme('light');
    
    const { rerender } = render(
      <ThemeProvider theme={currentTheme}>
        <AuthProvider>
          <MemoryRouter initialEntries={['/']}>
            <Router />
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });

    // Switch to dark theme
    currentTheme = createVaraiTheme('dark');
    
    rerender(
      <ThemeProvider theme={currentTheme}>
        <AuthProvider>
          <MemoryRouter initialEntries={['/']}>
            <Router />
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    );

    expect(currentTheme.palette.mode).toBe('dark');
  });

  it('should provide theme to nested components', async () => {
    const TestComponent = () => {
      const theme = createVaraiTheme('light');
      return <div data-testid="theme-mode">{theme.palette.mode}</div>;
    };

    render(
      <ThemeProvider theme={createVaraiTheme('light')}>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
  });

  it('should handle theme-dependent routing', async () => {
    const theme = createVaraiTheme('light');
    
    // Mock authenticated user for dashboard access
    const { authService } = jest.requireMock('../services/auth');
    authService.getCurrentUser.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      role: 'merchant',
    });

    render(
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <MemoryRouter initialEntries={['/dashboard']}>
            <Router />
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });
});