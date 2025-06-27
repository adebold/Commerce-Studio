/**
 * VARAi Design System - Color Tokens
 * 
 * This file defines the color palette for the VARAi design system.
 * Colors are organized by primary, secondary, neutral, and semantic categories.
 */

// Primary colors - Main brand colors
export const primary = {
  50: '#E6F7FF',
  100: '#BAE7FF',
  200: '#91D5FF',
  300: '#69C0FF',
  400: '#40A9FF',
  500: '#1890FF', // Primary brand color
  600: '#096DD9',
  700: '#0050B3',
  800: '#003A8C',
  900: '#002766',
};

// Secondary colors - Complementary to primary
export const secondary = {
  50: '#F6FFED',
  100: '#D9F7BE',
  200: '#B7EB8F',
  300: '#95DE64',
  400: '#73D13D',
  500: '#52C41A', // Secondary brand color
  600: '#389E0D',
  700: '#237804',
  800: '#135200',
  900: '#092B00',
};

// Neutral colors - Grays for text, backgrounds, borders
export const neutral = {
  50: '#FAFAFA',
  100: '#F5F5F5',
  200: '#EEEEEE',
  300: '#E0E0E0',
  400: '#BDBDBD',
  500: '#9E9E9E',
  600: '#757575',
  700: '#616161',
  800: '#424242',
  900: '#212121',
};

// Semantic colors - For specific UI states
export const semantic = {
  success: {
    light: '#F6FFED',
    main: '#52C41A',
    dark: '#389E0D',
  },
  warning: {
    light: '#FFFBE6',
    main: '#FAAD14',
    dark: '#D48806',
  },
  error: {
    light: '#FFF1F0',
    main: '#FF4D4F',
    dark: '#CF1322',
  },
  info: {
    light: '#E6F7FF',
    main: '#1890FF',
    dark: '#096DD9',
  },
};

// Common colors
export const common = {
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

// Export all colors
const colors = {
  primary,
  secondary,
  neutral,
  semantic,
  common,
};

export default colors;