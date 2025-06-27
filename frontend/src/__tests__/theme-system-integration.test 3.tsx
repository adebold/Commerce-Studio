import React from 'react';
import { render, screen } from '@testing-library/react';
import { UnifiedThemeProvider } from '../providers/UnifiedThemeProvider';
import { createVaraiTheme, validateThemeIntegrity, VaraiTheme } from '../design-system/mui-integration';
import { useTheme } from '@mui/material/styles';

// Test component that uses the theme
const ThemeTestComponent: React.FC = () => {
  const theme = useTheme() as VaraiTheme;
  
  return (
    <div data-testid="theme-test">
      <div data-testid="primary-color">{theme.palette.primary.main}</div>
      <div data-testid="breakpoint-xs">{theme.breakpoints.values.xs}</div>
      <div data-testid="spacing-function">{typeof theme.spacing}</div>
      <div data-testid="varai-extension">{theme.varai ? 'present' : 'missing'}</div>
    </div>
  );
};

describe('Theme System Integration', () => {
  describe('Theme Creation and Validation', () => {
    it('should create a valid light theme', () => {
      const lightTheme = createVaraiTheme('light');
      expect(validateThemeIntegrity(lightTheme)).toBe(true);
    });

    it('should create a valid dark theme', () => {
      const darkTheme = createVaraiTheme('dark');
      expect(validateThemeIntegrity(darkTheme)).toBe(true);
    });

    it('should have all required breakpoints', () => {
      const theme = createVaraiTheme('light');
      expect(theme.breakpoints.values.xs).toBe(0);
      expect(theme.breakpoints.values.sm).toBe(600);
      expect(theme.breakpoints.values.md).toBe(960);
      expect(theme.breakpoints.values.lg).toBe(1280);
      expect(theme.breakpoints.values.xl).toBe(1920);
    });

    it('should have varai extension', () => {
      const theme = createVaraiTheme('light');
      expect(theme.varai).toBeDefined();
      expect(theme.varai.colors).toBeDefined();
      expect(theme.varai.typography).toBeDefined();
    });

    it('should have proper spacing function', () => {
      const theme = createVaraiTheme('light');
      expect(typeof theme.spacing).toBe('function');
      expect(theme.spacing(1)).toBe('8px');
      expect(theme.spacing(2)).toBe('16px');
    });
  });

  describe('UnifiedThemeProvider Integration', () => {
    it('should provide theme to child components', () => {
      render(
        <UnifiedThemeProvider>
          <ThemeTestComponent />
        </UnifiedThemeProvider>
      );

      expect(screen.getByTestId('theme-test')).toBeInTheDocument();
      expect(screen.getByTestId('spacing-function')).toHaveTextContent('function');
      expect(screen.getByTestId('varai-extension')).toHaveTextContent('present');
      expect(screen.getByTestId('breakpoint-xs')).toHaveTextContent('0');
    });

    it('should handle theme mode switching', () => {
      const { rerender } = render(
        <UnifiedThemeProvider initialMode="light">
          <ThemeTestComponent />
        </UnifiedThemeProvider>
      );

      // Verify light theme is applied
      expect(screen.getByTestId('theme-test')).toBeInTheDocument();

      // Switch to dark mode
      rerender(
        <UnifiedThemeProvider initialMode="dark">
          <ThemeTestComponent />
        </UnifiedThemeProvider>
      );

      // Theme should still be valid
      expect(screen.getByTestId('theme-test')).toBeInTheDocument();
    });

    it('should handle theme validation errors gracefully', () => {
      // Mock console.error to avoid noise in test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // This should not crash the app even if theme validation fails
      render(
        <UnifiedThemeProvider>
          <ThemeTestComponent />
        </UnifiedThemeProvider>
      );

      expect(screen.getByTestId('theme-test')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Theme Validation Function', () => {
    it('should validate complete theme structure', () => {
      const theme = createVaraiTheme('light');
      expect(validateThemeIntegrity(theme)).toBe(true);
    });

    it('should fail validation for incomplete theme', () => {
      const incompleteTheme = {
        palette: {},
        typography: {},
        spacing: () => '8px',
        breakpoints: { values: {} }
      } as unknown as VaraiTheme;

      expect(validateThemeIntegrity(incompleteTheme)).toBe(false);
    });

    it('should fail validation for missing breakpoints.values.xs', () => {
      const theme = createVaraiTheme('light');
      const modifiedTheme = { ...theme };
      delete (modifiedTheme.breakpoints.values as Record<string, unknown>).xs;
      
      expect(validateThemeIntegrity(modifiedTheme)).toBe(false);
    });

    it('should fail validation for missing varai extension', () => {
      const theme = createVaraiTheme('light');
      const modifiedTheme = { ...theme } as Record<string, unknown>;
      delete modifiedTheme.varai;
      
      expect(validateThemeIntegrity(modifiedTheme as unknown as VaraiTheme)).toBe(false);
    });
  });
});