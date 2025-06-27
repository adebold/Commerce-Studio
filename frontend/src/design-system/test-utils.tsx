import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from './ThemeProvider';

// Mock theme for testing that includes all necessary properties
export const mockTheme = {
  colors: {
    primary: { 50: '#F5F7FF', 100: '#E5E7F0', 500: '#4C6FFF', 700: '#3B5BDB' },
    neutral: { 50: '#F9FAFB', 100: '#F3F4F6', 300: '#D1D5DB', 500: '#6B7280', 600: '#4B5563', 800: '#1F2937' },
    common: { white: '#FFFFFF', black: '#000000' },
    success: { 500: '#10B981' },
    error: { 500: '#EF4444' },
    warning: { 500: '#F59E0B' },
    info: { 500: '#3B82F6' }
  },
  spacing: {
    spacing: {
      4: '4px',
      8: '8px',
      12: '12px',
      16: '16px',
    },
  },
  components: {
    card: {
      borderRadius: '8px',
    },
    button: {
      borderRadius: '4px',
      transition: 'all 0.2s ease-in-out',
    },
    input: {
      borderRadius: '4px',
      borderWidth: '1px',
    },
  },
  typography: {
    fontFamily: {
      primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      secondary: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      mono: '"Roboto Mono", "SF Mono", "Courier New", Courier, monospace',
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semiBold: 600,
      bold: 700,
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
    // Add textStyles to fix the Typography component
    textStyles: {
      h1: {
        fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        fontSize: '3rem',
        fontWeight: 700,
        lineHeight: 1.25,
        letterSpacing: '-0.025em',
      },
      h2: {
        fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        fontSize: '2.25rem',
        fontWeight: 700,
        lineHeight: 1.25,
        letterSpacing: '-0.025em',
      },
      h3: {
        fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        fontSize: '1.875rem',
        fontWeight: 600,
        lineHeight: 1.25,
        letterSpacing: '0',
      },
      h4: {
        fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.25,
        letterSpacing: '0',
      },
      h5: {
        fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.25,
        letterSpacing: '0',
      },
      h6: {
        fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        fontSize: '1.125rem',
        fontWeight: 600,
        lineHeight: 1.5,
        letterSpacing: '0',
      },
      body1: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        fontSize: '1rem',
        fontWeight: 400,
        lineHeight: 1.625,
        letterSpacing: '0',
      },
      body2: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        fontSize: '0.875rem',
        fontWeight: 400,
        lineHeight: 1.625,
        letterSpacing: '0',
      },
      caption: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        fontSize: '0.75rem',
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: '0.025em',
      },
      button: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        fontSize: '0.875rem',
        fontWeight: 500,
        lineHeight: 1.5,
        letterSpacing: '0.025em',
        textTransform: 'uppercase',
      },
      overline: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        fontSize: '0.75rem',
        fontWeight: 500,
        lineHeight: 1.5,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      },
    },
  },
  breakpoints: {
    xs: '0px',
    sm: '600px',
    md: '960px',
    lg: '1280px',
    xl: '1920px',
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  mode: 'light',
};

// Custom render function that includes the ThemeProvider with the mock theme
export const renderWithTheme = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const Wrapper: React.FC<{children: React.ReactNode}> = ({ children }) => {
    return <ThemeProvider initialMode="light">{children}</ThemeProvider>;
  };
  
  // Override the default theme with our mock theme
  jest.mock('./theme', () => mockTheme);
  
  return render(ui, { wrapper: Wrapper, ...options });
};

// Export a mock TextEncoder and TextDecoder for tests that use React Router
if (typeof global.TextEncoder === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.TextEncoder = class TextEncoder {
    encoding = 'utf-8';
    encode(text: string): Uint8Array {
      const arr = new Uint8Array(text.length);
      for (let i = 0; i < text.length; i++) {
        arr[i] = text.charCodeAt(i);
      }
      return arr;
    }
    encodeInto(text: string, dest: Uint8Array): { read: number; written: number } {
      const encoded = this.encode(text);
      const length = Math.min(encoded.length, dest.length);
      for (let i = 0; i < length; i++) {
        dest[i] = encoded[i];
      }
      return { read: text.length, written: length };
    }
  };
}

if (typeof global.TextDecoder === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.TextDecoder = class TextDecoder {
    encoding = 'utf-8';
    fatal = false;
    ignoreBOM = false;
    
    constructor(label?: string, options?: { fatal?: boolean; ignoreBOM?: boolean }) {
      this.encoding = label || 'utf-8';
      this.fatal = options?.fatal || false;
      this.ignoreBOM = options?.ignoreBOM || false;
    }
    
    decode(arr?: Uint8Array): string {
      if (!arr) return '';
      let str = '';
      for (let i = 0; i < arr.length; i++) {
        str += String.fromCharCode(arr[i]);
      }
      return str;
    }
  };
}