/**
 * VARAi Design System - Border Radius Tokens
 * 
 * This file defines border radius values used throughout the VARAi design system.
 * These tokens ensure consistent rounded corners across all components.
 */

const borderRadius = {
  none: '0px',
  xs: '2px',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '24px',
  full: '9999px',
} as const;

export type BorderRadiusToken = keyof typeof borderRadius;

export default borderRadius;