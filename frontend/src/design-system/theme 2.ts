/**
 * VARAi Design System - Theme Configuration
 * 
 * This file provides a central theme configuration for the VARAi design system.
 * It combines all tokens and provides theme-related utilities.
 */

import { colors, typography, spacing, breakpoints, shadows } from './tokens';

// Theme object that combines all tokens
const theme = {
  colors,
  typography,
  spacing,
  breakpoints,
  shadows,
  
  // Theme-specific configurations
  mode: 'light' as 'light' | 'dark',
  
  // Component-specific theme overrides can be added here
  components: {
    // Example: Button-specific theme settings
    button: {
      borderRadius: '4px',
      transition: 'all 0.2s ease-in-out',
    },
    
    // Example: Input-specific theme settings
    input: {
      borderRadius: '4px',
      borderWidth: '1px',
    },
    
    // Example: Card-specific theme settings
    card: {
      borderRadius: '8px',
      padding: spacing.spacing[16],
    },
  },
};

// Type definition for the theme
export type Theme = typeof theme;

// Function to get a value from the theme using a path string
// Example: getThemeValue('colors.primary.500')
export const getThemeValue = (path: string, defaultValue?: any): any => {
  const keys = path.split('.');
  let value: any = theme;
  
  for (const key of keys) {
    if (value === undefined || value === null) {
      return defaultValue;
    }
    value = value[key as keyof typeof value];
  }
  
  return value !== undefined ? value : defaultValue;
};

export default theme;