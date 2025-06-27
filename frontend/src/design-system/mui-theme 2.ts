/**
 * Material-UI Theme Configuration
 * Provides a dedicated MUI theme setup separate from the integration layer
 */

import { createTheme, Theme, ThemeOptions } from '@mui/material/styles';
import { createVaraiTheme, VaraiTheme } from './mui-integration';

/**
 * Creates a pure MUI theme without VARAi extensions
 * Useful for components that only need standard MUI theming
 */
export function createPureMuiTheme(mode: 'light' | 'dark' = 'light'): Theme {
  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#1976d2' : '#90caf9',
      },
      secondary: {
        main: mode === 'light' ? '#dc004e' : '#f48fb1',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
  };

  return createTheme(themeOptions);
}

/**
 * Enhanced theme creation with validation and fallbacks
 */
export function createEnhancedMuiTheme(mode: 'light' | 'dark' = 'light'): VaraiTheme {
  try {
    return createVaraiTheme(mode);
  } catch (error) {
    console.error('Failed to create enhanced theme, falling back to pure MUI theme:', error);
    return createPureMuiTheme(mode) as VaraiTheme;
  }
}

/**
 * Theme debugging utility
 */
export function debugMuiTheme(theme: Theme): void {
  if (process.env.NODE_ENV === 'development') {
    console.group('🎨 MUI Theme Debug');
    console.log('Mode:', theme.palette.mode);
    console.log('Primary:', theme.palette.primary);
    console.log('Secondary:', theme.palette.secondary);
    console.log('Background:', theme.palette.background);
    console.log('Text:', theme.palette.text);
    console.log('Typography:', theme.typography);
    console.log('Spacing function test:', theme.spacing(1, 2, 3));
    console.log('Breakpoints:', theme.breakpoints.values);
    console.groupEnd();
  }
}

// Export default themes
export const lightMuiTheme = createEnhancedMuiTheme('light');
export const darkMuiTheme = createEnhancedMuiTheme('dark');

export default {
  light: lightMuiTheme,
  dark: darkMuiTheme,
  create: createEnhancedMuiTheme,
  debug: debugMuiTheme,
};