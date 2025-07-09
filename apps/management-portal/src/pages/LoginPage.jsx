import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { Box, Paper, Typography } from '@mui/material';
import { login } from '../store/authSlice';
import LoginForm from '../components/LoginForm';

function LoginPage() {
  const dispatch = useDispatch();
  const { isAuthenticated, error } = useSelector((state) => state.auth);

  const handleLogin = (credentials) => {
    dispatch(login(credentials));
  };

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <Paper sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Typography variant="h4" sx={{ mb: 2, textAlign: 'center' }}>
          Management Portal Login
        </Typography>
        <LoginForm onSubmit={handleLogin} />
        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
      </Paper>
    </Box>
  );
}

export default LoginPage;