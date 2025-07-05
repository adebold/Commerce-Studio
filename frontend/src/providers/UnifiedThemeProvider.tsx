import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { createCachedVaraiTheme, VaraiTheme, validateThemeIntegrity } from '../design-system/mui-integration';
import { createEmotionTheme } from '../design-system/emotion-theme';
import { Theme as EmotionReactTheme } from '@emotion/react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface UnifiedThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  theme: VaraiTheme;
  isSystemPreference: boolean;
}

export const UnifiedThemeContext = createContext<UnifiedThemeContextType | undefined>(undefined);

interface UnifiedThemeProviderProps {
  children: ReactNode;
  initialMode?: ThemeMode;
  enableSystemPreference?: boolean;
}

/**
 * Unified Theme Provider that consolidates all theme management
 * Replaces multiple theme providers and contexts with a single source of truth
 */
export const UnifiedThemeProvider: React.FC<UnifiedThemeProviderProps> = ({
  children,
  initialMode
}) => {
  // Detect user's preferred color scheme
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)', { noSsr: true });
  
  // Theme preference state (what the user selected)
  const [themePreference, setThemePreference] = useState<ThemeMode>(() => {
    try {
      const savedMode = localStorage.getItem('theme-preference') as ThemeMode | null;
      if (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system') {
        return savedMode;
      }
    } catch (error) {
      console.warn('Failed to read theme preference from localStorage:', error);
    }
    
    // Fallback to initial mode or light
    return initialMode || 'light';
  });

  // Actual theme mode (resolved from preference and system)
  const mode = useMemo<'light' | 'dark'>(() => {
    if (themePreference === 'system') {
      return prefersDarkMode ? 'dark' : 'light';
    }
    return themePreference === 'dark' ? 'dark' : 'light';
  }, [themePreference, prefersDarkMode]);

  // Track if current mode is from system preference
  const isSystemPreference = themePreference === 'system';

  // No need for this effect anymore as mode is computed from themePreference

  // Update document attributes for theme detection
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.style.colorScheme = mode;
  }, [mode]);

  // Set theme function with error handling and localStorage persistence
  const setTheme = useCallback((newMode: ThemeMode) => {
    setThemePreference(newMode);
    
    try {
      localStorage.setItem('theme-preference', newMode);
    } catch (error) {
      console.warn('Failed to save theme preference to localStorage:', error);
    }
  }, []);

  // Toggle theme function
  const toggleTheme = useCallback(() => {
    // When toggling, we always switch between light and dark (not system)
    const newMode = mode === 'light' ? 'dark' : 'light';
    setTheme(newMode);
  }, [mode, setTheme]);

  // Memoized theme creation with validation and fallback
  const theme = useMemo<VaraiTheme>(() => {
    try {
      const createdTheme = createCachedVaraiTheme(mode);
      
      // Validate theme integrity
      if (!validateThemeIntegrity(createdTheme)) {
        console.error('Theme validation failed. Using fallback light theme.');
        const fallbackTheme = createCachedVaraiTheme('light');
        
        // Validate fallback theme as well
        if (!validateThemeIntegrity(fallbackTheme)) {
          console.error('Critical: Fallback theme also failed validation');
          throw new Error('Theme system failure: Both primary and fallback themes are invalid');
        }
        
        return fallbackTheme;
      }
      
      // Debug theme in development
      if (process.env.NODE_ENV === 'development') {
        console.log('🎨 Theme created successfully:', {
          mode,
          palette: createdTheme.palette.mode,
          varai: !!createdTheme.varai,
          spacing: typeof createdTheme.spacing,
          breakpoints: !!createdTheme.breakpoints,
        });
      }
      
      return createdTheme;
    } catch (error) {
      console.error('Failed to create theme. Using emergency fallback:', error);
      
      // Emergency fallback - create minimal theme
      try {
        const emergencyTheme = createCachedVaraiTheme('light');
        if (!validateThemeIntegrity(emergencyTheme)) {
          console.error('Emergency theme validation failed');
          throw new Error('Complete theme system failure');
        }
        return emergencyTheme;
      } catch (emergencyError) {
        console.error('Critical theme system failure:', emergencyError);
        throw new Error('Complete theme system failure');
      }
    }
  }, [mode]);

  // Unified theme context value
  const contextValue = useMemo<UnifiedThemeContextType>(() => ({
    mode: mode as ThemeMode, // The resolved mode (light/dark)
    toggleTheme,
    setTheme,
    theme,
    isSystemPreference,
  }), [mode, toggleTheme, setTheme, theme, isSystemPreference]);

  // Create Emotion-compatible theme with error handling
  const emotionTheme = useMemo(() => {
    try {
      if (!theme.varai) {
        console.warn('Missing varai theme extension, using fallback');
        return createEmotionTheme(createCachedVaraiTheme('light').varai);
      }
      return createEmotionTheme(theme.varai);
    } catch (error) {
      console.error('Failed to create Emotion theme:', error);
      // Fallback to a basic emotion theme
      return createEmotionTheme(createCachedVaraiTheme('light').varai);
    }
  }, [theme.varai]);

  return (
    <UnifiedThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <EmotionThemeProvider theme={emotionTheme as unknown as EmotionReactTheme}>
          <CssBaseline enableColorScheme />
          {children}
        </EmotionThemeProvider>
      </MuiThemeProvider>
    </UnifiedThemeContext.Provider>
  );
};

/**
 * Hook to access unified theme context
 * Provides type-safe access to theme state and functions
 */
export const useUnifiedTheme = (): UnifiedThemeContextType => {
  const context = useContext(UnifiedThemeContext);
  if (context === undefined) {
    throw new Error('useUnifiedTheme must be used within UnifiedThemeProvider');
  }
  return context;
};

/**
 * Hook to access only the theme object (for performance optimization)
 */
export const useTheme = (): VaraiTheme => {
  const { theme } = useUnifiedTheme();
  return theme;
};

/**
 * Hook to access only theme mode and toggle function
 */
export const useThemeMode = (): Pick<UnifiedThemeContextType, 'mode' | 'toggleTheme' | 'setTheme' | 'isSystemPreference'> => {
  const { mode, toggleTheme, setTheme, isSystemPreference } = useUnifiedTheme();
  return { mode, toggleTheme, setTheme, isSystemPreference };
};

export default UnifiedThemeProvider;