/**
 * Theme-aware Loading Spinner Component
 */

import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, CircularProgress, Typography } from '@mui/material';

interface ThemeAwareLoadingSpinnerProps {
  size?: number;
  message?: string;
  fullScreen?: boolean;
  color?: 'primary' | 'secondary' | 'inherit';
}

export const ThemeAwareLoadingSpinner: React.FC<ThemeAwareLoadingSpinnerProps> = ({
  size = 40,
  message = 'Loading...',
  fullScreen = false,
  color = 'primary',
}) => {
  const theme = useTheme();

  const containerStyles = fullScreen
    ? {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.palette.background.default,
        zIndex: theme.zIndex.modal,
      }
    : {
        minHeight: '200px',
      };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={2}
      sx={containerStyles}
    >
      <CircularProgress size={size} color={color} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default ThemeAwareLoadingSpinner;