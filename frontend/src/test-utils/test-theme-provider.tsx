import React from 'react';
import { ThemeProvider } from '@emotion/react';
import theme from '../design-system/theme';

/**
 * A wrapper component that provides the theme context for testing components
 * that use styled-components or emotion.
 */
export const TestThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

/**
 * A utility function to wrap components with the TestThemeProvider for testing.
 */
export const withTheme = (component: React.ReactNode) => {
  return <TestThemeProvider>{component}</TestThemeProvider>;
};