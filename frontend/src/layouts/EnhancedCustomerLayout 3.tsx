import React, { Suspense } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container,
  useTheme,
  IconButton,
  useMediaQuery
} from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { VaraiTheme } from '../design-system/mui-integration';
import { ThemeAwareLoadingSpinner } from '../components/common/ThemeAwareLoadingSpinner';
import { useUnifiedTheme } from '../providers/UnifiedThemeProvider';

/**
 * Enhanced Customer Layout with proper MUI integration
 */
const EnhancedCustomerLayout: React.FC = () => {
  const theme = useTheme() as VaraiTheme;
  const { mode, toggleTheme } = useUnifiedTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const navigationLinks = [
    { to: '/', label: 'Home' },
    { to: '/frames', label: 'Frames' },
    { to: '/virtual-try-on', label: 'Virtual Try-On' },
    { to: '/recommendations', label: 'Recommendations' },
  ];

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      data-testid="enhanced-customer-layout"
    >
      {/* Header */}
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: theme.shadows[1],
        }}
        data-testid="app-header"
      >
        <Toolbar data-testid="header-toolbar">
          {/* Logo */}
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: isMobile ? 1 : 0,
              fontWeight: theme.varai.typography.fontWeight.bold,
              color: theme.palette.primary.main,
              mr: 4
            }}
            data-testid="logo"
          >
            VARAi
          </Typography>

          {/* Navigation Links - Desktop */}
          {!isMobile && (
            <Box
              sx={{ flexGrow: 1, display: 'flex', gap: 3 }}
              data-testid="desktop-navigation"
            >
              {navigationLinks.map((link) => (
                <Button
                  key={link.to}
                  component={Link}
                  to={link.to}
                  sx={{
                    color: theme.palette.text.primary,
                    fontWeight: theme.varai.typography.fontWeight.medium,
                    '&:hover': {
                      color: theme.palette.primary.main,
                      backgroundColor: 'transparent',
                    },
                  }}
                  data-testid={`nav-link-${link.to.replace('/', '') || 'home'}`}
                >
                  {link.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Theme Toggle */}
          <IconButton
            onClick={toggleTheme}
            color="inherit"
            sx={{ mr: 1 }}
            aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
            data-testid="theme-toggle"
          >
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          {/* Auth Buttons */}
          <Box
            sx={{ display: 'flex', gap: 1 }}
            data-testid="auth-buttons"
          >
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate('/auth')}
              sx={{
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                '&:hover': {
                  borderColor: theme.palette.primary.dark,
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                },
              }}
              data-testid="sign-in-button"
            >
              Sign In
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => navigate('/signup')}
              sx={{
                backgroundColor: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
              data-testid="sign-up-button"
            >
              Sign Up
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Spacer for fixed header */}
      <Toolbar />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: theme.palette.background.default,
          minHeight: 'calc(100vh - 64px)',
        }}
        data-testid="main-content"
      >
        <Suspense fallback={<ThemeAwareLoadingSpinner message="Loading page..." />}>
          <Outlet />
        </Suspense>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          backgroundColor: theme.palette.grey[900],
          color: theme.palette.common.white,
          py: 3,
          mt: 'auto',
        }}
        data-testid="app-footer"
      >
        <Container maxWidth="lg">
          <Typography
            variant="body2"
            align="center"
            sx={{
              fontFamily: theme.varai.typography.fontFamily.primary,
            }}
            data-testid="footer-copyright"
          >
            &copy; {new Date().getFullYear()} VARAi. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default EnhancedCustomerLayout;