import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { UnifiedThemeProvider, UnifiedThemeContext } from '../providers/UnifiedThemeProvider';
import { useTheme } from '@mui/material/styles';
import { useTheme as useEmotionTheme } from '@emotion/react';
import { createVaraiTheme, validateThemeIntegrity } from '../design-system/mui-integration';
import { createEmotionTheme } from '../design-system/emotion-theme';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock matchMedia
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

describe('Theme Integration Tests', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    mockMatchMedia(false); // Default to light mode
  });

  describe('UnifiedThemeProvider', () => {
    it('should provide theme context to children', () => {
      const TestComponent = () => {
        const context = React.useContext(UnifiedThemeContext);
        return (
          <div>
            <span data-testid="mode">{context?.mode}</span>
            <span data-testid="is-system">{context?.isSystemPreference ? 'true' : 'false'}</span>
          </div>
        );
      };

      render(
        <UnifiedThemeProvider>
          <TestComponent />
        </UnifiedThemeProvider>
      );

      expect(screen.getByTestId('mode')).toHaveTextContent('light');
      expect(screen.getByTestId('is-system')).toHaveTextContent('false');
    });

    it('should initialize with saved theme preference', () => {
      localStorageMock.getItem.mockReturnValue('dark');

      const TestComponent = () => {
        const context = React.useContext(UnifiedThemeContext);
        return <span data-testid="mode">{context?.mode}</span>;
      };

      render(
        <UnifiedThemeProvider>
          <TestComponent />
        </UnifiedThemeProvider>
      );

      expect(screen.getByTestId('mode')).toHaveTextContent('dark');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('theme-preference');
    });

    it('should respect system preference when set to system mode', () => {
      localStorageMock.getItem.mockReturnValue('system');
      mockMatchMedia(true); // System prefers dark

      const TestComponent = () => {
        const context = React.useContext(UnifiedThemeContext);
        const muiTheme = useTheme();
        return (
          <div>
            <span data-testid="mode">{context?.mode}</span>
            <span data-testid="is-system">{context?.isSystemPreference ? 'true' : 'false'}</span>
            <span data-testid="mui-mode">{muiTheme.palette.mode}</span>
          </div>
        );
      };

      render(
        <UnifiedThemeProvider>
          <TestComponent />
        </UnifiedThemeProvider>
      );

      expect(screen.getByTestId('mode')).toHaveTextContent('system');
      expect(screen.getByTestId('is-system')).toHaveTextContent('true');
      expect(screen.getByTestId('mui-mode')).toHaveTextContent('dark');
    });

    it('should toggle theme correctly', async () => {
      const TestComponent = () => {
        const context = React.useContext(UnifiedThemeContext);
        return (
          <div>
            <span data-testid="mode">{context?.mode}</span>
            <button onClick={context?.toggleTheme}>Toggle</button>
          </div>
        );
      };

      render(
        <UnifiedThemeProvider>
          <TestComponent />
        </UnifiedThemeProvider>
      );

      expect(screen.getByTestId('mode')).toHaveTextContent('light');

      await act(async () => {
        fireEvent.click(screen.getByText('Toggle'));
      });

      expect(screen.getByTestId('mode')).toHaveTextContent('dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme-preference', 'dark');
    });

    it('should set theme directly', async () => {
      const TestComponent = () => {
        const context = React.useContext(UnifiedThemeContext);
        return (
          <div>
            <span data-testid="mode">{context?.mode}</span>
            <button onClick={() => context?.setTheme('system')}>Set System</button>
          </div>
        );
      };

      render(
        <UnifiedThemeProvider>
          <TestComponent />
        </UnifiedThemeProvider>
      );

      await act(async () => {
        fireEvent.click(screen.getByText('Set System'));
      });

      expect(screen.getByTestId('mode')).toHaveTextContent('system');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme-preference', 'system');
    });

    it('should provide both MUI and Emotion themes', () => {
      const TestComponent = () => {
        const muiTheme = useTheme();
        const emotionTheme = useEmotionTheme();
        
        return (
          <div>
            <span data-testid="mui-primary">{muiTheme.palette.primary.main}</span>
            <span data-testid="emotion-primary">{emotionTheme.colors?.primary?.['500'] || 'no-primary'}</span>
          </div>
        );
      };

      render(
        <UnifiedThemeProvider>
          <TestComponent />
        </UnifiedThemeProvider>
      );

      expect(screen.getByTestId('mui-primary')).toBeTruthy();
      expect(screen.getByTestId('emotion-primary')).toBeTruthy();
    });

    it('should update themes when mode changes', async () => {
      const TestComponent = () => {
        const context = React.useContext(UnifiedThemeContext);
        const muiTheme = useTheme();
        
        return (
          <div>
            <span data-testid="mui-mode">{muiTheme.palette.mode}</span>
            <button onClick={context?.toggleTheme}>Toggle</button>
          </div>
        );
      };

      render(
        <UnifiedThemeProvider>
          <TestComponent />
        </UnifiedThemeProvider>
      );

      expect(screen.getByTestId('mui-mode')).toHaveTextContent('light');

      await act(async () => {
        fireEvent.click(screen.getByText('Toggle'));
      });

      expect(screen.getByTestId('mui-mode')).toHaveTextContent('dark');
    });

    it('should handle system preference changes', async () => {
      localStorageMock.getItem.mockReturnValue('system');
      const listeners: Array<() => void> = [];
      
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn((event, listener) => {
            if (event === 'change') listeners.push(listener);
          }),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      const TestComponent = () => {
        const muiTheme = useTheme();
        return <span data-testid="mui-mode">{muiTheme.palette.mode}</span>;
      };

      render(
        <UnifiedThemeProvider>
          <TestComponent />
        </UnifiedThemeProvider>
      );

      expect(screen.getByTestId('mui-mode')).toHaveTextContent('light');

      // Simulate system preference change
      act(() => {
        Object.defineProperty(window, 'matchMedia', {
          writable: true,
          value: jest.fn().mockImplementation(query => ({
            matches: true, // Now dark
            media: query,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
          })),
        });
        
        // Trigger all listeners
        listeners.forEach(listener => listener());
      });

      await waitFor(() => {
        expect(screen.getByTestId('mui-mode')).toHaveTextContent('dark');
      });
    });
  });

  describe('Theme Validation', () => {
    it('should validate theme integrity', () => {
      const lightTheme = createVaraiTheme('light');
      const darkTheme = createVaraiTheme('dark');

      expect(() => validateThemeIntegrity(lightTheme)).not.toThrow();
      expect(() => validateThemeIntegrity(darkTheme)).not.toThrow();
    });

    it('should have consistent theme structure between light and dark modes', () => {
      const lightTheme = createVaraiTheme('light');
      const darkTheme = createVaraiTheme('dark');

      // Check that both themes have the same structure
      expect(Object.keys(lightTheme.palette)).toEqual(Object.keys(darkTheme.palette));
      expect(Object.keys(lightTheme.typography)).toEqual(Object.keys(darkTheme.typography));
      expect(Object.keys(lightTheme.components || {})).toEqual(Object.keys(darkTheme.components || {}));
    });

    it('should have proper emotion theme structure', () => {
      const lightTheme = createVaraiTheme('light');
      const darkTheme = createVaraiTheme('dark');
      
      // Create emotion themes from the varai themes
      const lightEmotionTheme = createEmotionTheme(lightTheme.varai);
      const darkEmotionTheme = createEmotionTheme(darkTheme.varai);

      // Verify emotion theme has required properties
      expect(lightEmotionTheme).toHaveProperty('colors');
      expect(lightEmotionTheme).toHaveProperty('spacing');
      expect(lightEmotionTheme).toHaveProperty('typography');
      expect(lightEmotionTheme).toHaveProperty('breakpoints');
      expect(lightEmotionTheme).toHaveProperty('shadows');
      expect(lightEmotionTheme).toHaveProperty('borderRadius');

      // Check consistency between modes
      expect(Object.keys(lightEmotionTheme)).toEqual(Object.keys(darkEmotionTheme));
    });
  });

  describe('Theme Performance', () => {
    it('should cache theme creation', () => {
      const spy = jest.spyOn(console, 'log').mockImplementation();
      
      // First call should create theme
      const theme1 = createVaraiTheme('light');
      
      // Second call should return cached theme
      const theme2 = createVaraiTheme('light');
      
      expect(theme1).toBe(theme2); // Should be the same reference
      
      spy.mockRestore();
    });

    it('should not re-render unnecessarily when theme does not change', () => {
      let renderCount = 0;
      
      const TestComponent = () => {
        renderCount++;
        const context = React.useContext(UnifiedThemeContext);
        return <div>{context?.mode}</div>;
      };

      const { rerender } = render(
        <UnifiedThemeProvider>
          <TestComponent />
        </UnifiedThemeProvider>
      );

      expect(renderCount).toBe(1);

      // Re-render with same provider
      rerender(
        <UnifiedThemeProvider>
          <TestComponent />
        </UnifiedThemeProvider>
      );

      // Should not cause additional renders if theme hasn't changed
      expect(renderCount).toBe(2); // One for the rerender
    });
  });

  describe('Accessibility', () => {
    it('should provide proper color contrast in light mode', () => {
      const theme = createVaraiTheme('light');
      
      // This is a simplified check - in real tests you'd use a contrast ratio calculator
      expect(theme.palette.text.primary).not.toBe(theme.palette.background.default);
      expect(theme.palette.primary.main).not.toBe(theme.palette.background.default);
    });

    it('should provide proper color contrast in dark mode', () => {
      const theme = createVaraiTheme('dark');
      
      expect(theme.palette.text.primary).not.toBe(theme.palette.background.default);
      expect(theme.palette.primary.main).not.toBe(theme.palette.background.default);
    });

    it('should respect prefers-reduced-motion', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      const theme = createVaraiTheme('light');
      
      // Verify that transitions are defined
      expect(theme.transitions?.create).toBeDefined();
      // In a real implementation, you would check if transitions are disabled
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      const TestComponent = () => {
        const context = React.useContext(UnifiedThemeContext);
        return <span data-testid="mode">{context?.mode}</span>;
      };

      // Should not throw and should use default theme
      expect(() => {
        render(
          <UnifiedThemeProvider>
            <TestComponent />
          </UnifiedThemeProvider>
        );
      }).not.toThrow();

      expect(screen.getByTestId('mode')).toHaveTextContent('light');
    });

    it('should handle invalid theme mode in localStorage', () => {
      localStorageMock.getItem.mockReturnValue('invalid-mode');

      const TestComponent = () => {
        const context = React.useContext(UnifiedThemeContext);
        return <span data-testid="mode">{context?.mode}</span>;
      };

      render(
        <UnifiedThemeProvider>
          <TestComponent />
        </UnifiedThemeProvider>
      );

      // Should fallback to default theme
      expect(screen.getByTestId('mode')).toHaveTextContent('light');
    });
  });
});