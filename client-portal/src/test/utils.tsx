import React, { ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider } from '@/services/auth/AuthContext';
import { vi } from 'vitest';

// Create a basic theme for testing
const theme = createTheme();

// Mock AuthContext for testing
vi.mock('@/services/auth/AuthContext', async () => {
  const actual = await vi.importActual('@/services/auth/AuthContext');
  return {
    ...actual as any,
    useAuth: vi.fn().mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      forgotPassword: vi.fn(),
      resetPassword: vi.fn(),
      updateProfile: vi.fn(),
    }),
    AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>
  };
});

// Testing wrapper with router and theme
export function AllTheProviders({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

// Extended render with our providers
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

// Export all testing-library utilities
export * from '@testing-library/react';
export { renderWithProviders as render };
