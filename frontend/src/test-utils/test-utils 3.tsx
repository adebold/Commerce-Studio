import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { MemoryRouter } from 'react-router-dom';
import { createTheme } from '@mui/material/styles';

// Create a test theme
export const testTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Custom render function that includes providers
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <MemoryRouter>
        <ThemeProvider theme={testTheme}>
          {children}
        </ThemeProvider>
      </MemoryRouter>
    );
  };
  
  return render(ui, { wrapper: Wrapper, ...options });
}

// Export everything from testing-library
export * from '@testing-library/react';
export { renderWithProviders as render };