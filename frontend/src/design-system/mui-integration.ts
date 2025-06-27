import { createTheme, Theme } from '@mui/material/styles';
import { VaraiTheme } from './theme-types';

// Create a cached VARAi theme that extends MUI theme
export function createCachedVaraiTheme(baseTheme?: Partial<Theme>): VaraiTheme {
  const theme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#1890FF',
        light: '#69C0FF',
        dark: '#096DD9',
      },
      secondary: {
        main: '#52C41A',
        light: '#95DE64',
        dark: '#389E0D',
      },
      error: {
        main: '#FF4D4F',
        light: '#FFF1F0',
        dark: '#CF1322',
      },
      warning: {
        main: '#FAAD14',
        light: '#FFFBE6',
        dark: '#D48806',
      },
      info: {
        main: '#1890FF',
        light: '#E6F7FF',
        dark: '#096DD9',
      },
      success: {
        main: '#52C41A',
        light: '#F6FFED',
        dark: '#389E0D',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 500,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 500,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 500,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
    },
    ...baseTheme,
  }) as VaraiTheme;

  // Add custom VARAi properties
  (theme as any).colors = {
    semantic: {
      success: {
        main: '#52C41A',
        light: '#F6FFED',
        dark: '#389E0D',
      },
      warning: {
        main: '#FAAD14',
        light: '#FFFBE6',
        dark: '#D48806',
      },
      error: {
        main: '#FF4D4F',
        light: '#FFF1F0',
        dark: '#CF1322',
      },
    },
  };

  // Add custom shadows
  (theme as any).shadows = {
    ...theme.shadows,
    effects: {
      hover: '0 4px 12px rgba(0, 0, 0, 0.15)',
    },
  };

  // Add custom components
  if (!theme.components) {
    theme.components = {};
  }
  (theme.components as any).card = {
    borderRadius: 16,
  };

  return theme;
}

// Validate theme integrity
export function validateThemeIntegrity(theme: VaraiTheme): boolean {
  return !!(
    theme.palette &&
    theme.typography &&
    theme.spacing &&
    theme.shape &&
    theme.components
  );
}

// Export the default VARAi theme
export const defaultVaraiTheme = createCachedVaraiTheme();

export default defaultVaraiTheme;