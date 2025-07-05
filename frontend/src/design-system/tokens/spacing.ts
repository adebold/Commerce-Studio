/**
 * VARAi Design System - Spacing Tokens
 * 
 * This file defines the spacing values for the VARAi design system.
 * It includes a base unit and derived spacing values for consistent layout.
 */

// Base unit for spacing (in pixels)
export const baseUnit = 4;

// Spacing scale (in pixels)
export const spacing = {
  0: '0',
  1: `${baseUnit * 0.25}px`, // 1px
  2: `${baseUnit * 0.5}px`,  // 2px
  4: `${baseUnit}px`,        // 4px
  8: `${baseUnit * 2}px`,    // 8px
  12: `${baseUnit * 3}px`,   // 12px
  16: `${baseUnit * 4}px`,   // 16px
  20: `${baseUnit * 5}px`,   // 20px
  24: `${baseUnit * 6}px`,   // 24px
  32: `${baseUnit * 8}px`,   // 32px
  40: `${baseUnit * 10}px`,  // 40px
  48: `${baseUnit * 12}px`,  // 48px
  56: `${baseUnit * 14}px`,  // 56px
  64: `${baseUnit * 16}px`,  // 64px
  80: `${baseUnit * 20}px`,  // 80px
  96: `${baseUnit * 24}px`,  // 96px
  128: `${baseUnit * 32}px`, // 128px
  160: `${baseUnit * 40}px`, // 160px
  192: `${baseUnit * 48}px`, // 192px
  224: `${baseUnit * 56}px`, // 224px
  256: `${baseUnit * 64}px`, // 256px
};

// Semantic spacing aliases
export const insets = {
  xs: spacing[4],    // 4px
  sm: spacing[8],    // 8px
  md: spacing[16],   // 16px
  lg: spacing[24],   // 24px
  xl: spacing[32],   // 32px
  '2xl': spacing[48], // 48px
  '3xl': spacing[64], // 64px
};

// Layout spacing
export const layout = {
  gutter: spacing[16],       // 16px - Standard gutter between grid items
  margin: spacing[24],       // 24px - Page margin
  containerPadding: {
    sm: spacing[16],         // 16px - Container padding for small screens
    md: spacing[24],         // 24px - Container padding for medium screens
    lg: spacing[32],         // 32px - Container padding for large screens
  },
  sectionSpacing: {
    sm: spacing[48],         // 48px - Section spacing for small screens
    md: spacing[64],         // 64px - Section spacing for medium screens
    lg: spacing[96],         // 96px - Section spacing for large screens
  },
};

// Export all spacing tokens
const spacingTokens = {
  baseUnit,
  spacing,
  insets,
  layout,
};

export default spacingTokens;