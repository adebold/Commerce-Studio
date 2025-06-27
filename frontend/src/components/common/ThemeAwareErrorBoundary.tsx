/**
 * Theme-aware Error Boundary Component
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Button } from '@mui/material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

const DefaultErrorFallback: React.FC<{ error?: Error }> = ({ error }) => {
  const theme = useTheme();

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="400px"
      p={3}
      sx={{
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      <Typography variant="h5" color="error" gutterBottom>
        Something went wrong
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" mb={2}>
        An unexpected error occurred. Please try reloading the page.
      </Typography>
      {error && (
        <Typography variant="body2" color="text.secondary" align="center" mb={3}>
          Error: {error.message}
        </Typography>
      )}
      <Button variant="contained" onClick={handleReload}>
        Reload Page
      </Button>
    </Box>
  );
};

class ErrorBoundaryClass extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <DefaultErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

export const ThemeAwareErrorBoundary: React.FC<Props> = (props) => {
  return <ErrorBoundaryClass {...props} />;
};

export default ThemeAwareErrorBoundary;