/**
 * Emotion Theme Adapter
 * Provides type-safe integration between our design system and Emotion
 */

import { Theme as DesignSystemTheme } from './theme';
import spacingTokens from './tokens/spacing';

// Define Emotion-compatible theme interface
export interface EmotionTheme {
  colors: {
    primary: Record<string, string>;
    secondary: Record<string, string>;
    neutral: Record<string, string>;
    semantic: Record<string, string>;
    common: Record<string, string>;
  };
  typography: {
    fontFamily: Record<string, string>;
    fontSize: Record<string, string>;
    fontWeight: Record<string, number>;
    lineHeight: Record<string, number>;
  };
  spacing: Record<string, string>;
  breakpoints: {
    values: Record<string, number>;
    up: (key: string) => string;
    down: (key: string) => string;
  };
  shadows: Record<string, string>;
  borderRadius: Record<string, string>;
  mode: 'light' | 'dark';
  // Additional properties for compatibility
  spacingTokens: typeof spacingTokens;
  components: {
    button: {
      borderRadius: string;
      transition: string;
    };
    input: {
      borderRadius: string;
      borderWidth: string;
    };
    card: {
      borderRadius: string;
      padding: string;
    };
  };
}

/**
 * Converts design system theme to Emotion-compatible format
 */
export function createEmotionTheme(dsTheme: DesignSystemTheme): EmotionTheme {
  // Flatten semantic colors to string values
  const flattenSemanticColors = (semantic: typeof dsTheme.colors.semantic): Record<string, string> => {
    const flattened: Record<string, string> = {};
    
    Object.entries(semantic).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        Object.entries(value).forEach(([subKey, subValue]) => {
          flattened[`${key}_${subKey}`] = subValue as string;
        });
        // Also add the main color as the base key
        if ('main' in value) {
          flattened[key] = value.main as string;
        }
      } else {
        flattened[key] = value as string;
      }
    });
    
    return flattened;
  };

  return {
    colors: {
      primary: dsTheme.colors.primary,
      secondary: dsTheme.colors.secondary,
      neutral: dsTheme.colors.neutral,
      semantic: flattenSemanticColors(dsTheme.colors.semantic),
      common: dsTheme.colors.common,
    },
    typography: {
      fontFamily: dsTheme.typography.fontFamily,
      fontSize: dsTheme.typography.fontSize,
      fontWeight: dsTheme.typography.fontWeight,
      lineHeight: dsTheme.typography.lineHeight,
    },
    spacing: dsTheme.spacingTokens.spacing,
    breakpoints: {
      values: dsTheme.breakpoints.values,
      up: (key: string) => `@media (min-width: ${dsTheme.breakpoints.values[key as keyof typeof dsTheme.breakpoints.values]}px)`,
      down: (key: string) => `@media (max-width: ${dsTheme.breakpoints.values[key as keyof typeof dsTheme.breakpoints.values] - 1}px)`,
    },
    shadows: dsTheme.shadows.elevation,
    borderRadius: dsTheme.borderRadius,
    mode: dsTheme.mode,
    // Include additional properties for compatibility
    spacingTokens: dsTheme.spacingTokens,
    components: dsTheme.components,
  };
}


export default createEmotionTheme;