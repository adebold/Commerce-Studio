import { Theme as MuiTheme } from '@mui/material/styles';

// Extended theme interface for VARAi design system
export interface VaraiTheme extends MuiTheme {
  // Custom VARAi theme properties
  colors?: {
    semantic?: {
      success?: {
        main?: string;
        light?: string;
        dark?: string;
      };
      warning?: {
        main?: string;
        light?: string;
        dark?: string;
      };
      error?: {
        main?: string;
        light?: string;
        dark?: string;
      };
    };
  };
  shadows: {
    effects?: {
      hover?: string;
    };
  } & MuiTheme['shadows'];
  components?: MuiTheme['components'] & {
    card?: {
      borderRadius?: number;
    };
  };
}

// Theme mode type
export type ThemeMode = 'light' | 'dark' | 'system';

// Export default theme type
export type { Theme } from '@mui/material/styles';