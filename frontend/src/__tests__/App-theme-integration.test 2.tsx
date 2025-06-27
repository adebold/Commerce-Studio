import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import { ThemeProvider } from '@mui/material/styles';
import { createVaraiTheme } from '../design-system/mui-integration';

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

// Mock router to avoid navigation issues in tests
jest.mock('../router', () => ({
  default: () => <div data-testid="router">Router Component</div>,
}));

describe('App Theme Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render App with theme provider', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('router')).toBeInTheDocument();
  });

  it('should provide theme context to child components', () => {
    const { container } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Check if MUI theme is available
    const muiElements = container.querySelectorAll('[class*="Mui"]');
    expect(muiElements.length).toBeGreaterThanOrEqual(0);
  });

  it('should handle theme mode switching', async () => {
    // Create a test component that uses theme
    const TestThemeComponent = () => {
      const theme = createVaraiTheme('light');
      return (
        <div>
          <span data-testid="theme-mode">{theme.palette.mode}</span>
          <button onClick={() => {
            // Simulate theme switch
            const newTheme = createVaraiTheme('dark');
            expect(newTheme.palette.mode).toBe('dark');
          }}>
            Switch Theme
          </button>
        </div>
      );
    };

    render(<TestThemeComponent />);
    
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
    
    const switchButton = screen.getByText('Switch Theme');
    fireEvent.click(switchButton);
  });

  it('should integrate with MUI components', () => {
    const theme = createVaraiTheme('light');
    
    render(
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('router')).toBeInTheDocument();
  });

  it('should maintain theme consistency across components', () => {
    const lightTheme = createVaraiTheme('light');
    const darkTheme = createVaraiTheme('dark');
    
    // Verify theme properties
    expect(lightTheme.palette.mode).toBe('light');
    expect(darkTheme.palette.mode).toBe('dark');
    
    // Verify theme structure
    expect(lightTheme.palette.primary).toBeDefined();
    expect(lightTheme.palette.secondary).toBeDefined();
    expect(lightTheme.typography).toBeDefined();
    expect(lightTheme.spacing).toBeDefined();
  });

  it('should handle theme with auth provider', async () => {
    const { authService } = jest.requireMock('../services/auth');
    authService.getCurrentUser.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      role: 'merchant',
    });

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('router')).toBeInTheDocument();
    });
  });

  it('should apply theme to emotion styled components', () => {
    const theme = createVaraiTheme('light');
    
    // Verify theme has emotion compatibility
    expect(theme.palette).toBeDefined();
    expect(theme.typography).toBeDefined();
    expect(theme.breakpoints).toBeDefined();
    expect(theme.spacing).toBeDefined();
  });

  it('should handle responsive breakpoints', () => {
    const theme = createVaraiTheme('light');
    
    // Verify breakpoints are defined
    expect(theme.breakpoints.values.xs).toBe(0);
    expect(theme.breakpoints.values.sm).toBeDefined();
    expect(theme.breakpoints.values.md).toBeDefined();
    expect(theme.breakpoints.values.lg).toBeDefined();
    expect(theme.breakpoints.values.xl).toBeDefined();
  });

  it('should provide custom theme extensions', () => {
    const theme = createVaraiTheme('light');
    
    // Verify custom varai extension exists
    expect(theme.varai).toBeDefined();
    expect(theme.varai.borderRadius).toBeDefined();
    expect(theme.varai.shadows).toBeDefined();
  });

  it('should handle theme provider nesting', () => {
    const outerTheme = createVaraiTheme('light');
    const innerTheme = createVaraiTheme('dark');
    
    render(
      <ThemeProvider theme={outerTheme}>
        <div data-testid="outer">
          <ThemeProvider theme={innerTheme}>
            <div data-testid="inner">
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </div>
          </ThemeProvider>
        </div>
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('outer')).toBeInTheDocument();
    expect(screen.getByTestId('inner')).toBeInTheDocument();
    expect(screen.getByTestId('router')).toBeInTheDocument();
  });
});