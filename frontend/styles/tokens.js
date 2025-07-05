/**
 * Design Token System
 * 
 * This file defines all design tokens used throughout the application.
 * Tokens are organized by category (colors, spacing, typography, etc.)
 * and follow a consistent naming pattern.
 * 
 * DO NOT IMPORT THIS FILE DIRECTLY IN COMPONENTS.
 * These tokens are processed and converted to CSS variables.
 */

// Color Palette
// Based on VARA Design's brand colors with extended shades
export const colors = {
  // Primary brand colors
  primary: {
    50: 'hsl(270, 100%, 97%)', // Lightest purple
    100: 'hsl(270, 95%, 94%)',
    200: 'hsl(270, 90%, 88%)',
    300: 'hsl(270, 85%, 75%)',
    400: 'hsl(270, 90%, 65%)',
    500: 'hsl(270, 90%, 50%)',
    600: 'hsl(270, 95%, 40%)',
    700: 'hsl(270, 100%, 30%)',
    800: 'hsl(270, 100%, 20%)',
    900: 'hsl(270, 100%, 10%)', // --vara-purple
    950: 'hsl(270, 100%, 5%)',
  },
  // Secondary brand color
  secondary: {
    50: 'hsl(223, 100%, 97%)',
    100: 'hsl(223, 95%, 94%)',
    200: 'hsl(223, 90%, 88%)',
    300: 'hsl(223, 85%, 81%)',
    400: 'hsl(223, 80%, 70%)',
    500: 'hsl(223, 85%, 65%)', 
    600: 'hsl(223, 90%, 55%)', // --vara-blue
    700: 'hsl(223, 95%, 45%)',
    800: 'hsl(223, 100%, 35%)',
    900: 'hsl(223, 100%, 25%)',
    950: 'hsl(223, 100%, 15%)',
  },
  // Gray shades for text, backgrounds, borders
  gray: {
    50: 'hsl(0, 0%, 98%)',
    100: 'hsl(0, 0%, 96%)',
    200: 'hsl(0, 0%, 90%)',
    300: 'hsl(0, 0%, 83%)',
    400: 'hsl(0, 0%, 74%)',
    500: 'hsl(0, 0%, 62%)',
    600: 'hsl(0, 0%, 46%)',
    700: 'hsl(0, 0%, 38%)',
    800: 'hsl(0, 0%, 26%)',
    900: 'hsl(0, 0%, 13%)',
    950: 'hsl(0, 0%, 8%)',
  },
  // Success colors
  success: {
    50: 'hsl(142, 76%, 97%)',
    100: 'hsl(141, 84%, 93%)',
    200: 'hsl(141, 79%, 85%)',
    300: 'hsl(142, 77%, 73%)',
    400: 'hsl(142, 69%, 58%)',
    500: 'hsl(142, 71%, 45%)',
    600: 'hsl(142, 76%, 36%)',
    700: 'hsl(142, 72%, 29%)',
    800: 'hsl(143, 64%, 24%)',
    900: 'hsl(144, 61%, 20%)',
    950: 'hsl(145, 80%, 10%)',
  },
  // Warning colors
  warning: {
    50: 'hsl(48, 100%, 96%)',
    100: 'hsl(48, 96%, 89%)',
    200: 'hsl(48, 96%, 76%)',
    300: 'hsl(45, 96%, 65%)',
    400: 'hsl(45, 93%, 58%)',
    500: 'hsl(43, 96%, 50%)',
    600: 'hsl(39, 100%, 43%)',
    700: 'hsl(35, 92%, 33%)',
    800: 'hsl(32, 81%, 29%)',
    900: 'hsl(28, 73%, 26%)',
    950: 'hsl(26, 83%, 14%)',
  },
  // Error/danger colors
  error: {
    50: 'hsl(0, 86%, 97%)',
    100: 'hsl(0, 93%, 94%)',
    200: 'hsl(0, 96%, 89%)',
    300: 'hsl(0, 94%, 82%)',
    400: 'hsl(0, 91%, 71%)',
    500: 'hsl(0, 84%, 60%)',
    600: 'hsl(0, 72%, 51%)',
    700: 'hsl(0, 74%, 42%)',
    800: 'hsl(0, 70%, 35%)',
    900: 'hsl(0, 63%, 31%)',
    950: 'hsl(0, 75%, 15%)',
  },
  // Data visualization colors
  chart: {
    blue: 'hsl(223, 100%, 55%)',
    purple: 'hsl(270, 80%, 50%)',
    indigo: 'hsl(250, 70%, 60%)',
    azure: 'hsl(230, 80%, 65%)',
    cyan: 'hsl(210, 70%, 60%)',
  },
  // Basic colors for specific use cases
  common: {
    black: 'hsl(0, 0%, 0%)',
    white: 'hsl(0, 0%, 100%)',
    transparent: 'transparent',
  },
};

// Spacing Scale
// Based on a 4px grid (0.25rem = 4px)
export const spacing = {
  px: '1px',
  0: '0px',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem',     // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem',    // 12px
  3.5: '0.875rem', // 14px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  7: '1.75rem',    // 28px
  8: '2rem',       // 32px
  9: '2.25rem',    // 36px
  10: '2.5rem',    // 40px
  11: '2.75rem',   // 44px
  12: '3rem',      // 48px
  14: '3.5rem',    // 56px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  28: '7rem',      // 112px
  32: '8rem',      // 128px
  36: '9rem',      // 144px
  40: '10rem',     // 160px
  44: '11rem',     // 176px
  48: '12rem',     // 192px
  52: '13rem',     // 208px
  56: '14rem',     // 224px
  60: '15rem',     // 240px
  64: '16rem',     // 256px
  72: '18rem',     // 288px
  80: '20rem',     // 320px
  96: '24rem',     // 384px
};

// Typography Scale
export const typography = {
  // Font families
  fonts: {
    sans: 'var(--font-inter), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  // Font sizes (follows a Major Third type scale: 1.25)
  fontSizes: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
    '7xl': '4.5rem',   // 72px
    '8xl': '6rem',     // 96px
    '9xl': '8rem',     // 128px
  },
  // Font weights
  fontWeights: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  // Line heights
  lineHeights: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

// Border radius
export const borderRadius = {
  none: '0px',
  sm: '0.125rem',    // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',    // 6px
  lg: '0.5rem',      // 8px
  xl: '0.75rem',     // 12px
  '2xl': '1rem',     // 16px
  '3xl': '1.5rem',   // 24px
  full: '9999px',
};

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',
};

// Transitions and animations
export const transitions = {
  duration: {
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms',
  },
  timing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// Z-index scale
export const zIndex = {
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  auto: 'auto',
  toast: '1000',
  modal: '100',
  popover: '50',
  dropdown: '40',
  header: '30',
};

// Export all tokens as a single object
export default {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  transitions,
  zIndex,
};