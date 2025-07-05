import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { MemoryRouter } from 'react-router-dom';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import theme from '../design-system/theme';

// Create a custom Emotion cache for testing
const emotionCache = createCache({ key: 'process.env.TEST_WRAPPER_SECRET_2' });

// Create a custom render function that includes all providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
}

function customRender(
  ui: ReactElement,
  { route = '/', ...options }: CustomRenderOptions = {}
) {
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <CacheProvider value={emotionCache}>
        <MemoryRouter initialEntries={[route]}>
          <ThemeProvider theme={theme}>
            {children}
          </ThemeProvider>
        </MemoryRouter>
      </CacheProvider>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Export the wrapper component for use in individual tests
export const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <CacheProvider value={emotionCache}>
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  </CacheProvider>
);

// Export the router wrapper component for use in individual tests
export const TestRouterWrapper = ({ children, route = '/' }: { children: React.ReactNode, route?: string }) => (
  <CacheProvider value={emotionCache}>
    <MemoryRouter initialEntries={[route]}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </MemoryRouter>
  </CacheProvider>
);