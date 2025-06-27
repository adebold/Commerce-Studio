/**
 * Loading spinner component
 * Provides consistent loading states across the application
 */

import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface LoadingSpinnerProps {
  size?: number | string;
  message?: string;
  fullScreen?: boolean;
  color?: 'primary' | 'secondary' | 'inherit';
  variant?: 'determinate' | 'indeterminate';
  value?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  message,
  fullScreen = false,
  color = 'primary',
  variant = 'indeterminate',
  value,
}) => {
  const theme = useTheme();

  const spinnerElement = (
    <CircularProgress
      size={size}
      color={color}
      variant={variant}
      value={value}
      sx={{
        color: color === 'primary' ? theme.palette.primary.main : undefined,
      }}
    />
  );

  const content = (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={2}
      sx={{
        ...(fullScreen && {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          zIndex: theme.zIndex.modal,
        }),
        ...(fullScreen && {
          minHeight: '100vh',
        }),
        ...(!fullScreen && {
          padding: 3,
        }),
      }}
    >
      {spinnerElement}
      
      {message && (
        <Typography
          variant="body1"
          sx={{
            color: theme.palette.text.secondary,
            textAlign: 'center',
            fontWeight: 500,
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );

  return content;
};

// Preset loading spinners for common use cases
export const PageLoadingSpinner: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => (
  <LoadingSpinner
    size={48}
    message={message}
    fullScreen={false}
  />
);

export const FullScreenLoadingSpinner: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => (
  <LoadingSpinner
    size={60}
    message={message}
    fullScreen={true}
  />
);

export const InlineLoadingSpinner: React.FC<{ size?: number }> = ({ 
  size = 24 
}) => (
  <LoadingSpinner
    size={size}
    fullScreen={false}
  />
);

export const ButtonLoadingSpinner: React.FC = () => (
  <CircularProgress
    size={20}
    color="inherit"
    sx={{ marginRight: 1 }}
  />
);

export default LoadingSpinner;