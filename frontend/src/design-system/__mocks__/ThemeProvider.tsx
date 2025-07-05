import React, { ReactNode } from 'react';
import { createTheme } from '@mui/material/styles';

// Create a test theme
export const testTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

interface ThemeProviderProps {
  children: ReactNode;
  theme?: typeof testTheme;
}

// Mock ThemeProvider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  theme = testTheme
}) => {
  return <>{children}</>;
};

export default ThemeProvider;