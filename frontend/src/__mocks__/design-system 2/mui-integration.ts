/* eslint-disable @typescript-eslint/no-explicit-any */
import { createTheme, Theme } from '@mui/material/styles';

// Mock VaraiTheme interface
export interface VaraiTheme extends Theme {
  varai: any; // Simplified for testing
}

export function createCachedVaraiTheme(mode: 'light' | 'dark' = 'light'): VaraiTheme {
  const theme = createTheme({
    palette: {
      mode,
    },
  });

  return {
    ...theme,
    varai: {
      mode,
      colors: {
        primary: { 500: '#1976d2' },
        secondary: { 500: '#dc004e' },
        common: { white: '#ffffff', black: '#000000' },
      },
      typography: {},
      spacing: {},
      shadows: {},
      animations: {},
      components: {},
    },
  } as VaraiTheme;
}

export function createVaraiTheme(mode: 'light' | 'dark' = 'light'): VaraiTheme {
  return createCachedVaraiTheme(mode);
}

export function validateThemeIntegrity(theme: VaraiTheme): boolean {
  return !!(theme && theme.palette && theme.varai);
}

export const lightTheme = createVaraiTheme('light');
export const darkTheme = createVaraiTheme('dark');