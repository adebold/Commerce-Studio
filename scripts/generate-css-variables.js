/**
 * Generate CSS Variables Script
 * 
 * This script converts design tokens defined in styles/tokens.js
 * into CSS variables that can be used throughout the application.
 * 
 * Usage: node scripts/generate-css-variables.js
 */

/* eslint-disable */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import design tokens
import tokens from '../styles/tokens.js';

// Configuration
const OUTPUT_PATH = path.join(__dirname, '..', 'styles', 'generated-variables.css');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Convert a JavaScript object to CSS variables
 * 
 * @param {Object} obj - The object to convert 
 * @param {string} prefix - The prefix for the variable names
 * @returns {string} CSS variable declarations
 */
function objectToCssVariables(obj, prefix = '') {
  let css = '';
  
  for (const [key, value] of Object.entries(obj)) {
    const varName = prefix ? `${prefix}-${key}` : key;
    
    // If the value is an object, recursively process it
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      css += objectToCssVariables(value, varName);
    } else {
      // Otherwise, create a CSS variable
      css += `  --${varName}: ${value};\n`;
    }
  }
  
  return css;
}

/**
 * Convert color tokens to CSS variables with both HSL and hex formats
 * 
 * @param {Object} colorTokens - The color tokens object
 * @returns {string} CSS variable declarations
 */
function processColorTokens(colorTokens) {
  let css = '';
  
  for (const [category, colors] of Object.entries(colorTokens)) {
    for (const [shade, value] of Object.entries(colors)) {
      // Skip non-HSL color values
      if (!value.startsWith('hsl')) continue;
      
      // Extract HSL values - assume format is hsl(H, S%, L%)
      const hslMatch = value.match(/hsl\(([^,]+),\s*([^,]+),\s*([^)]+)\)/);
      if (hslMatch) {
        const [, h, s, l] = hslMatch;
        // Create HSL variable in format that Tailwind uses
        css += `  --color-${category}-${shade}: ${h.trim()} ${s.trim()} ${l.trim()};\n`;
      }
    }
  }
  
  return css;
}

/**
 * Convert spacing tokens to CSS variables
 */
function processSpacingTokens(spacingTokens) {
  let css = '';
  
  for (const [key, value] of Object.entries(spacingTokens)) {
    // Replace fractional keys (like "0.5") with dash notation (like "0-5")
    const sanitizedKey = String(key).replace('.', '-');
    css += `  --spacing-${sanitizedKey}: ${value};\n`;
  }
  
  return css;
}

/**
 * Process typography tokens
 */
function processTypographyTokens(typographyTokens) {
  let css = '';
  
  // Process font families
  for (const [key, value] of Object.entries(typographyTokens.fonts)) {
    css += `  --font-${key}: ${value};\n`;
  }
  
  // Process font sizes
  for (const [key, value] of Object.entries(typographyTokens.fontSizes)) {
    const sanitizedKey = String(key).replace('.', '-');
    css += `  --font-size-${sanitizedKey}: ${value};\n`;
  }
  
  // Process font weights
  for (const [key, value] of Object.entries(typographyTokens.fontWeights)) {
    css += `  --font-weight-${key}: ${value};\n`;
  }
  
  // Process line heights
  for (const [key, value] of Object.entries(typographyTokens.lineHeights)) {
    css += `  --line-height-${key}: ${value};\n`;
  }
  
  // Process letter spacing
  for (const [key, value] of Object.entries(typographyTokens.letterSpacing)) {
    css += `  --letter-spacing-${key}: ${value};\n`;
  }
  
  return css;
}

/**
 * Process border radius tokens
 */
function processBorderRadiusTokens(borderRadiusTokens) {
  let css = '';
  
  for (const [key, value] of Object.entries(borderRadiusTokens)) {
    // Handle the DEFAULT case
    if (key === 'DEFAULT') {
      css += `  --radius: ${value};\n`;
    } else {
      css += `  --radius-${key}: ${value};\n`;
    }
  }
  
  return css;
}

/**
 * Process shadow tokens
 */
function processShadowTokens(shadowTokens) {
  let css = '';
  
  for (const [key, value] of Object.entries(shadowTokens)) {
    // Handle the DEFAULT case
    if (key === 'DEFAULT') {
      css += `  --shadow: ${value};\n`;
    } else {
      css += `  --shadow-${key}: ${value};\n`;
    }
  }
  
  return css;
}

/**
 * Generate the CSS content
 */
function generateCssContent() {
  // Start with a comment header
  let css = `/**
 * GENERATED FILE - DO NOT EDIT DIRECTLY
 * Generated by scripts/generate-css-variables.js
 * Generated on: ${new Date().toISOString()}
 */

:root {
`;

  // Process color tokens
  css += `  /* Color Variables */\n`;
  css += processColorTokens(tokens.colors);
  css += '\n';
  
  // Process spacing tokens
  css += `  /* Spacing Variables */\n`;
  css += processSpacingTokens(tokens.spacing);
  css += '\n';
  
  // Process typography tokens
  css += `  /* Typography Variables */\n`;
  css += processTypographyTokens(tokens.typography);
  css += '\n';
  
  // Process border radius tokens
  css += `  /* Border Radius Variables */\n`;
  css += processBorderRadiusTokens(tokens.borderRadius);
  css += '\n';
  
  // Process shadow tokens
  css += `  /* Shadow Variables */\n`;
  css += processShadowTokens(tokens.shadows);
  css += '\n';
  
  // Process z-index tokens
  css += `  /* Z-Index Variables */\n`;
  css += objectToCssVariables(tokens.zIndex, 'z');
  css += '\n';
  
  // Process transition tokens
  css += `  /* Transition Variables */\n`;
  for (const [category, values] of Object.entries(tokens.transitions)) {
    for (const [key, value] of Object.entries(values)) {
      css += `  --transition-${category}-${key}: ${value};\n`;
    }
  }
  
  // Close the root selector
  css += `}\n`;
  
  // Add dark mode overrides if needed
  css += `
/* Dark mode variables */
.dark {
  /* Add dark mode overrides here */
  --color-primary-50: 270 100% 7%;
  --color-primary-900: 270 100% 90%;
  /* Continue with other dark mode overrides */
}
`;
  
  return css;
}

/**
 * Write the CSS content to a file
 */
function writeToFile(content) {
  try {
    fs.writeFileSync(OUTPUT_PATH, content, 'utf8');
    console.log(`${colors.green}✓ Successfully generated CSS variables to:${colors.reset}`);
    console.log(`  ${colors.blue}${OUTPUT_PATH}${colors.reset}`);
    return true;
  } catch (err) {
    console.error(`${colors.red}✗ Error writing to file:${colors.reset}`, err);
    return false;
  }
}

/**
 * Main function
 */
function main() {
  console.log(`${colors.cyan}=== Generating CSS Variables ===${colors.reset}`);
  
  // Generate CSS content
  const cssContent = generateCssContent();
  
  // Write to file
  const success = writeToFile(cssContent);
  
  if (success) {
    console.log(`${colors.cyan}=== CSS Variables Generation Complete ===${colors.reset}`);
    console.log(`${colors.yellow}Import the generated file in your main CSS:${colors.reset}`);
    console.log(`@import "./styles/generated-variables.css";`);
  } else {
    console.log(`${colors.red}=== CSS Variables Generation Failed ===${colors.reset}`);
    process.exit(1);
  }
}

// Run the main function
main();
