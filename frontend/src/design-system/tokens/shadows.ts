/**
 * VARAi Design System - Shadow Tokens
 * 
 * This file defines the shadow styles for the VARAi design system.
 * It includes elevation levels and specific shadow effects.
 */

// Base shadow values
const shadowColor = 'rgba(0, 0, 0, 0.1)';
const shadowColorDarker = 'rgba(0, 0, 0, 0.2)';

// Elevation shadows (from lowest to highest)
export const elevation = {
  0: 'none',
  1: `0 2px 4px ${shadowColor}`,
  2: `0 4px 8px ${shadowColor}`,
  3: `0 8px 16px ${shadowColor}`,
  4: `0 12px 24px ${shadowColor}`,
  5: `0 16px 32px ${shadowColor}`,
  6: `0 20px 40px ${shadowColor}`,
  7: `0 24px 48px ${shadowColor}`,
  8: `0 28px 56px ${shadowColor}`,
  9: `0 32px 64px ${shadowColor}`,
};

// Specific shadow effects
export const effects = {
  // Subtle shadow for cards and containers
  card: `0 2px 8px ${shadowColor}`,
  
  // Medium shadow for dropdowns and popovers
  dropdown: `0 4px 16px ${shadowColor}`,
  
  // Strong shadow for modals and dialogs
  modal: `0 8px 30px ${shadowColorDarker}`,
  
  // Inner shadow for pressed buttons or input fields
  inset: `inset 0 2px 4px ${shadowColor}`,
  
  // Top shadow for sticky headers
  top: `0 -2px 8px ${shadowColor}`,
  
  // Bottom shadow for sticky footers
  bottom: `0 2px 8px ${shadowColor}`,
  
  // Left shadow for side drawers
  left: `-2px 0 8px ${shadowColor}`,
  
  // Right shadow for side drawers
  right: `2px 0 8px ${shadowColor}`,
  
  // Focus shadow for interactive elements
  focus: `0 0 0 3px rgba(24, 144, 255, 0.4)`,
  
  // Hover shadow for interactive elements
  hover: `0 8px 20px ${shadowColor}`,
};

// Export all shadow tokens
const shadows = {
  elevation,
  effects,
};

export default shadows;