/**
 * useUnifiedTheme Hook Tests
 * Tests the unified theme context hook functionality
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { useUnifiedTheme, UnifiedThemeContext } from '../App';
import { createVaraiTheme, VaraiTheme } from '../design-system/mui-integration';

// Test component that uses the unified theme hook
const TestComponent: React.FC = () => {
  const { mode, toggleTheme } = useUnifiedTheme();
  
  return (
    <div>
      <span data-testid="current-mode">{mode}</span>
      <button data-testid="toggle-button" onClick={toggleTheme}>
        Toggle Theme
      </button>
    </div>
  );
};

// Mock unified theme context provider
const MockUnifiedThemeProvider: React.FC<{
  children: React.ReactNode;
  initialMode?: 'light' | 'dark';
}> = ({ children, initialMode = 'light' }) => {
  const [mode, setMode] = React.useState<'light' | 'dark'>(initialMode);
  
  const toggleTheme = React.useCallback(() => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
  }, []);
  
  const theme = React.useMemo<VaraiTheme>(() => createVaraiTheme(mode), [mode]);
  
  const contextValue = React.useMemo(() => ({
    mode,
    toggleTheme,
    theme,
  }), [mode, toggleTheme, theme]);
  
  return (
    <UnifiedThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <EmotionThemeProvider theme={theme.varai}>
          {children}
        </EmotionThemeProvider>
      </MuiThemeProvider>
    </UnifiedThemeContext.Provider>
  );
};

describe('useUnifiedTheme Hook', () => {
  describe('Basic Functionality', () => {
    it('should return current theme mode', () => {
      render(
        <MockUnifiedThemeProvider initialMode="light">
          <TestComponent />
        </MockUnifiedThemeProvider>
      );
      
      expect(screen.getByTestId('current-mode')).toHaveTextContent('light');
    });

    it('should return dark mode when initialized with dark', () => {
      render(
        <MockUnifiedThemeProvider initialMode="dark">
          <TestComponent />
        </MockUnifiedThemeProvider>
      );
      
      expect(screen.getByTestId('current-mode')).toHaveTextContent('dark');
    });

    it('should provide toggle function', () => {
      render(
        <MockUnifiedThemeProvider initialMode="light">
          <TestComponent />
        </MockUnifiedThemeProvider>
      );
      
      expect(screen.getByTestId('toggle-button')).toBeInTheDocument();
    });
  });

  describe('Theme Toggle Functionality', () => {
    it('should toggle from light to dark', () => {
      render(
        <MockUnifiedThemeProvider initialMode="light">
          <TestComponent />
        </MockUnifiedThemeProvider>
      );
      
      expect(screen.getByTestId('current-mode')).toHaveTextContent('light');
      
      act(() => {
        fireEvent.click(screen.getByTestId('toggle-button'));
      });
      
      expect(screen.getByTestId('current-mode')).toHaveTextContent('dark');
    });

    it('should toggle from dark to light', () => {
      render(
        <MockUnifiedThemeProvider initialMode="dark">
          <TestComponent />
        </MockUnifiedThemeProvider>
      );
      
      expect(screen.getByTestId('current-mode')).toHaveTextContent('dark');
      
      act(() => {
        fireEvent.click(screen.getByTestId('toggle-button'));
      });
      
      expect(screen.getByTestId('current-mode')).toHaveTextContent('light');
    });

    it('should toggle multiple times correctly', () => {
      render(
        <MockUnifiedThemeProvider initialMode="light">
          <TestComponent />
        </MockUnifiedThemeProvider>
      );
      
      const toggleButton = screen.getByTestId('toggle-button');
      const modeDisplay = screen.getByTestId('current-mode');
      
      expect(modeDisplay).toHaveTextContent('light');
      
      // First toggle: light -> dark
      act(() => {
        fireEvent.click(toggleButton);
      });
      expect(modeDisplay).toHaveTextContent('dark');
      
      // Second toggle: dark -> light
      act(() => {
        fireEvent.click(toggleButton);
      });
      expect(modeDisplay).toHaveTextContent('light');
      
      // Third toggle: light -> dark
      act(() => {
        fireEvent.click(toggleButton);
      });
      expect(modeDisplay).toHaveTextContent('dark');
    });
  });

  describe('Error Handling', () => {
    it('should throw error when used outside UnifiedThemeContext.Provider', () => {
      const ErrorComponent = () => {
        useUnifiedTheme();
        return <div>Should not render</div>;
      };
      
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => render(<ErrorComponent />)).toThrow(
        'useUnifiedTheme must be used within App component'
      );
      
      consoleSpy.mockRestore();
    });

    it('should throw error with correct message', () => {
      const ErrorComponent = () => {
        useUnifiedTheme();
        return <div>Should not render</div>;
      };
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      try {
        render(<ErrorComponent />);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe(
          'useUnifiedTheme must be used within App component'
        );
      }
      
      consoleSpy.mockRestore();
    });
  });

  describe('Context Value Stability', () => {
    it('should maintain stable context value when mode does not change', () => {
      let renderCount = 0;
      
      const StabilityTestComponent = () => {
        const context = useUnifiedTheme();
        renderCount++;
        
        return (
          <div>
            <span data-testid="render-count">{renderCount}</span>
            <span data-testid="context-mode">{context.mode}</span>
          </div>
        );
      };
      
      const { rerender } = render(
        <MockUnifiedThemeProvider initialMode="light">
          <StabilityTestComponent />
        </MockUnifiedThemeProvider>
      );
      
      expect(screen.getByTestId('render-count')).toHaveTextContent('1');
      
      // Re-render without changing theme
      rerender(
        <MockUnifiedThemeProvider initialMode="light">
          <StabilityTestComponent />
        </MockUnifiedThemeProvider>
      );
      
      // Component should re-render but context should be stable
      expect(screen.getByTestId('render-count')).toHaveTextContent('2');
      expect(screen.getByTestId('context-mode')).toHaveTextContent('light');
    });

    it('should update when theme mode changes', () => {
      const ChangeTestComponent = () => {
        const { mode, toggleTheme } = useUnifiedTheme();
        
        return (
          <div>
            <span data-testid="mode">{mode}</span>
            <button data-testid="change-theme" onClick={toggleTheme}>
              Change
            </button>
          </div>
        );
      };
      
      render(
        <MockUnifiedThemeProvider initialMode="light">
          <ChangeTestComponent />
        </MockUnifiedThemeProvider>
      );
      
      expect(screen.getByTestId('mode')).toHaveTextContent('light');
      
      act(() => {
        fireEvent.click(screen.getByTestId('change-theme'));
      });
      
      expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    });
  });

  describe('Multiple Components', () => {
    it('should provide same context to multiple components', () => {
      const Component1 = () => {
        const { mode } = useUnifiedTheme();
        return <span data-testid="component1-mode">{mode}</span>;
      };
      
      const Component2 = () => {
        const { mode, toggleTheme } = useUnifiedTheme();
        return (
          <div>
            <span data-testid="component2-mode">{mode}</span>
            <button data-testid="component2-toggle" onClick={toggleTheme}>
              Toggle
            </button>
          </div>
        );
      };
      
      render(
        <MockUnifiedThemeProvider initialMode="light">
          <Component1 />
          <Component2 />
        </MockUnifiedThemeProvider>
      );
      
      expect(screen.getByTestId('component1-mode')).toHaveTextContent('light');
      expect(screen.getByTestId('component2-mode')).toHaveTextContent('light');
      
      act(() => {
        fireEvent.click(screen.getByTestId('component2-toggle'));
      });
      
      expect(screen.getByTestId('component1-mode')).toHaveTextContent('dark');
      expect(screen.getByTestId('component2-mode')).toHaveTextContent('dark');
    });
  });

  describe('TypeScript Integration', () => {
    it('should provide correct TypeScript types', () => {
      const TypeTestComponent = () => {
        const context = useUnifiedTheme();
        
        // These should compile without TypeScript errors
        const mode: 'light' | 'dark' = context.mode;
        const toggle: () => void = context.toggleTheme;
        const theme: VaraiTheme = context.theme;
        
        return (
          <div>
            <span data-testid="typed-mode">{mode}</span>
            <span data-testid="theme-primary">{theme.palette.primary.main}</span>
            <button onClick={toggle}>Typed Toggle</button>
          </div>
        );
      };
      
      render(
        <MockUnifiedThemeProvider initialMode="dark">
          <TypeTestComponent />
        </MockUnifiedThemeProvider>
      );
      
      expect(screen.getByTestId('typed-mode')).toHaveTextContent('dark');
      expect(screen.getByTestId('theme-primary')).toBeInTheDocument();
    });
  });
});