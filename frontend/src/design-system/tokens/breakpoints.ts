/**
 * VARAi Design System - Breakpoint Tokens
 * 
 * This file defines the breakpoints for responsive design in the VARAi design system.
 * It includes standard screen size breakpoints and utility functions.
 */

// Breakpoint values (in pixels)
export const values = {
  xs: 0,      // Extra small devices (portrait phones)
  sm: 600,    // Small devices (landscape phones)
  md: 960,    // Medium devices (tablets)
  lg: 1280,   // Large devices (desktops)
  xl: 1920,   // Extra large devices (large desktops)
};

// Media query strings for use with Emotion
export const up = (key: keyof typeof values) => {
  return `@media (min-width: ${values[key]}px)`;
};

export const down = (key: keyof typeof values) => {
  const value = values[key];
  // The xs breakpoint is special - it doesn't have a lower bound
  if (key === 'xs') {
    return `@media (max-width: ${values.sm - 0.05}px)`;
  }
  
  // For other breakpoints, we use the next smaller breakpoint
  const keys = Object.keys(values) as Array<keyof typeof values>;
  const index = keys.indexOf(key);
  
  if (index === keys.length - 1) {
    return up('xs'); // If it's the largest breakpoint, return all sizes
  }
  
  return `@media (max-width: ${value - 0.05}px)`;
};

export const between = (start: keyof typeof values, end: keyof typeof values) => {
  const keys = Object.keys(values) as Array<keyof typeof values>;
  const startIndex = keys.indexOf(start);
  const endIndex = keys.indexOf(end);
  
  if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
    return '';
  }
  
  return `@media (min-width: ${values[start]}px) and (max-width: ${values[end] - 0.05}px)`;
};

export const only = (key: keyof typeof values) => {
  const keys = Object.keys(values) as Array<keyof typeof values>;
  const index = keys.indexOf(key);
  
  if (index === -1) {
    return '';
  }
  
  if (index === keys.length - 1) {
    return up(key);
  }
  
  const nextKey = keys[index + 1] as keyof typeof values;
  return between(key, nextKey);
};

// Export all breakpoint tokens and utilities
const breakpoints = {
  values,
  up,
  down,
  between,
  only,
};

export default breakpoints;