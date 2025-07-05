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
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';

/**
 * Enhanced Customer Layout with basic MUI integration
 */
const EnhancedCustomerLayout: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const navigationLinks = [
    { to: '/', label: 'Home' },
    { to: '/frames', label: 'Frames' },
    { to: '/virtual-try-on', label: 'Virtual Try-On' },
    { to: '/recommendations', label: 'Recommendations' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            VARAi Commerce Studio
          </Typography>
          
          {/* Navigation Links */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              {navigationLinks.map((link) => (
                <Button
                  key={link.to}
                  color="inherit"
                  component={Link}
                  to={link.to}
                  sx={{ textTransform: 'none' }}
                >
                  {link.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Theme Toggle Button */}
          <IconButton
            color="inherit"
            onClick={() => {
              // Basic theme toggle - can be enhanced later
              console.log('Theme toggle clicked');
            }}
            sx={{ ml: 1 }}
          >
            <Brightness4 />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container component="main" maxWidth="xl" sx={{ flex: 1, py: 3 }}>
        <Suspense 
          fallback={
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '200px' 
              }}
            >
              <CircularProgress />
            </Box>
          }
        >
          <Outlet />
        </Suspense>
      </Container>

      {/* Footer */}
      <Box 
        component="footer" 
        sx={{ 
          bgcolor: 'grey.100', 
          py: 2, 
          mt: 'auto' 
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="body2" color="text.secondary" align="center">
            © 2024 VARAi Commerce Studio. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default EnhancedCustomerLayout;