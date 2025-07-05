import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, Paper, Alert, CircularProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';
import { useAuth } from '../../components/auth/AuthProvider';
import { Role } from '../../services/auth';

const AuthPage: React.FC = () => {
  const { isAuthenticated, userContext, logout, loading } = useAuth();
  const [logoutSuccess, setLogoutSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user was redirected from a protected route
  useEffect(() => {
    const state = location.state as { from?: { pathname: string } };
    if (state?.from && isAuthenticated) {
      // If user is already authenticated and was redirected here, send them back
      navigate(state.from.pathname, { replace: true });
    }
  }, [location, isAuthenticated, navigate]);

  const handleLoginSuccess = () => {
    // Redirection is handled in the AuthProvider
    console.log('Login successful - redirecting to dashboard');
  };

  const handleLogout = async () => {
    try {
      await logout();
      setLogoutSuccess(true);
      // Reset logout success message after 3 seconds
      setTimeout(() => {
        setLogoutSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get role display name
  const getRoleDisplayName = (role: Role): string => {
    switch (role) {
      case Role.SUPER_ADMIN:
        return 'Super Administrator';
      case Role.CLIENT_ADMIN:
        return 'Organization Administrator';
      case Role.BRAND_MANAGER:
        return 'Brand Manager';
      case Role.VIEWER:
        return 'Viewer';
      default:
        return 'Unknown Role';
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '2.2rem', md: '3.2rem' },
            letterSpacing: '-0.022em',
            mb: 2,
          }}
        >
          Account Access
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
          Sign in to access your VARAi Commerce Studio Dashboard and manage your account settings.
        </Typography>
      </Box>

      {logoutSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          You have been successfully logged out.
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : isAuthenticated && userContext ? (
        <Paper elevation={2} sx={{ 
          p: 5, 
          maxWidth: 600, 
          mx: 'auto',
          borderRadius: 2,
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Welcome, {getRoleDisplayName(userContext.role)}
          </Typography>

          <Box sx={{ mt: 2, mb: 4 }}>
            <Typography variant="body1" paragraph>
              You are currently logged in with the following permissions:
            </Typography>

            <Box component="ul" sx={{ pl: 4 }}>
              <Typography component="li">
                <strong>Role:</strong> {getRoleDisplayName(userContext.role)}
              </Typography>
              {userContext.clientId && (
                <Typography component="li">
                  <strong>Organization:</strong> {userContext.clientId}
                </Typography>
              )}
              {userContext.brandId && (
                <Typography component="li">
                  <strong>Brand:</strong> {userContext.brandId}
                </Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/')}
              sx={{
                py: 1.2,
                px: 3,
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Go to Home Page
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleLogout}
              sx={{
                py: 1.2,
                px: 3,
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Logout
            </Button>
          </Box>
        </Paper>
      ) : (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      )}
    </Container>
  );
};

export default AuthPage;
