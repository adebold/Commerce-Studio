/**
 * Theme type definitions for unified theme system
 */

import { Theme as MuiTheme } from '@mui/material/styles';

// Re-export VaraiTheme from design system
export type { VaraiTheme } from '../design-system/theme/types';

// Extended MUI theme that includes our custom theme
export interface ExtendedMuiTheme extends MuiTheme {
  varai: import('../design-system/theme/types').VaraiTheme;
}

// Type guard to check if theme has varai properties
export function isExtendedTheme(theme: MuiTheme): theme is ExtendedMuiTheme {
  return 'varai' in theme;
}

// Helper to safely access varai theme properties
export function getVaraiTheme(theme: MuiTheme): import('../design-system/theme/types').VaraiTheme | null {
  return isExtendedTheme(theme) ? theme.varai : null;
}