/**
 * Emotion Theme Type Declaration
 *
 * This file extends the Emotion theme interface to include our design system theme.
 */

import '@emotion/react';

declare module '@emotion/react' {
  export interface Theme {
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
  }
}