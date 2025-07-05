/**
 * VARAi Design System - Typography Tokens
 * 
 * This file defines the typography styles for the VARAi design system.
 * It includes font families, weights, sizes, and line heights.
 */

// Font families
export const fontFamily = {
  primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  secondary: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  mono: '"Roboto Mono", "SF Mono", "Courier New", Courier, monospace',
};

// Font weights
export const fontWeight = {
  light: 300,
  regular: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
};

// Font sizes (in pixels)
export const fontSize = {
  xs: '0.75rem',     // 12px
  sm: '0.875rem',    // 14px
  md: '1rem',        // 16px
  lg: '1.125rem',    // 18px
  xl: '1.25rem',     // 20px
  '2xl': '1.5rem',   // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem',  // 36px
  '5xl': '3rem',     // 48px
  '6xl': '3.75rem',  // 60px
};

// Line heights
export const lineHeight = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
};

// Letter spacing
export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
};

// Text transforms
export const textTransform = {
  uppercase: 'uppercase',
  lowercase: 'lowercase',
  capitalize: 'capitalize',
  none: 'none',
};

// Text decorations
export const textDecoration = {
  underline: 'underline',
  lineThrough: 'line-through',
  none: 'none',
};

// Predefined text styles
export const textStyles = {
  h1: {
    fontFamily: fontFamily.secondary,
    fontSize: fontSize['5xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    fontFamily: fontFamily.secondary,
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  h3: {
    fontFamily: fontFamily.secondary,
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.semiBold,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.normal,
  },
  h4: {
    fontFamily: fontFamily.secondary,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.semiBold,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.normal,
  },
  h5: {
    fontFamily: fontFamily.secondary,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semiBold,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.normal,
  },
  h6: {
    fontFamily: fontFamily.secondary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semiBold,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  body1: {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.relaxed,
    letterSpacing: letterSpacing.normal,
  },
  body2: {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.relaxed,
    letterSpacing: letterSpacing.normal,
  },
  caption: {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.wide,
  },
  button: {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.wide,
    textTransform: textTransform.uppercase,
  },
  overline: {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.widest,
    textTransform: textTransform.uppercase,
  },
};

// Export all typography tokens
const typography = {
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
  textTransform,
  textDecoration,
  textStyles,
};

export default typography;