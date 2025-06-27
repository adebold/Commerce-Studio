/**
 * VARAi Design System - Theme Provider
 * 
 * This component provides the theme to all child components using Emotion's ThemeProvider.
 * It also handles theme switching between light and dark modes.
 */

import React, { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import theme, { Theme } from './theme';

// Theme context for accessing and updating the theme
interface ThemeContextType {
  theme: Theme;
  mode: 'light' | 'dark';
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Hook for accessing the theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  initialMode?: 'light' | 'dark';
}

/**
 * VARAi Theme Provider Component
 * Provides theme context and theme switching functionality
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialMode = 'light',
}) => {
  const [mode, setMode] = useState<'light' | 'dark'>(initialMode);

  // Toggle between light and dark mode
  const toggleMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Create a memoized theme object that updates when the mode changes
  const currentTheme = useMemo(() => {
    return {
      ...theme,
      mode,
      // Add mode-specific overrides here if needed
      colors: {
        ...theme.colors,
        // Example of mode-specific color overrides
        // background: mode === 'light' ? theme.colors.common.white : theme.colors.neutral[900],
        // text: mode === 'light' ? theme.colors.neutral[900] : theme.colors.common.white,
      },
    };
  }, [mode]);

  // Create the context value
  const contextValue = useMemo(() => {
    return {
      theme: currentTheme,
      mode,
      toggleMode,
    };
  }, [currentTheme, mode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <EmotionThemeProvider theme={currentTheme}>
        {children}
      </EmotionThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;