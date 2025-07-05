import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from './AuthProvider';

interface LoginFormProps {
  onLoginSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const { login, loading, error } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailOrUsernameError, setEmailOrUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmailOrUsername = (value: string): boolean => {
    if (!value) {
      setEmailOrUsernameError('Email or username is required');
      return false;
    }
    
    // If it looks like an email, validate it as an email
    if (value.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setEmailOrUsernameError('Please enter a valid email address');
        return false;
      }
    } else if (value.length < 3) {
      // If it's a username, make sure it's at least 3 characters
      setEmailOrUsernameError('Username must be at least 3 characters');
      return false;
    }
    
    setEmailOrUsernameError('');
    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isEmailOrUsernameValid = validateEmailOrUsername(emailOrUsername);
    const isPasswordValid = validatePassword(password);
    
    if (isEmailOrUsernameValid && isPasswordValid) {
      try {
        await login(emailOrUsername, password);
        // Only call onLoginSuccess if login was successful
        // This will be executed if no error is thrown from the login function
        onLoginSuccess();
      } catch (err) {
        // Error is already handled in the AuthProvider
        console.error('Login submission error:', err);
        // No need to do anything here as the error state is managed in AuthProvider
      }
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Paper elevation={2} sx={{ 
      p: 5, 
      maxWidth: 500, 
      mx: 'auto',
      borderRadius: 2,
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)'
    }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
        Sign in to your account
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          id="emailOrUsername"
          label="Email or Username"
          name="emailOrUsername"
          autoComplete="email username"
          autoFocus
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
          error={!!emailOrUsernameError}
          helperText={emailOrUsernameError}
          disabled={loading}
          sx={{ mb: 2 }}
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={!!passwordError}
          helperText={passwordError}
          disabled={loading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleTogglePasswordVisibility}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{
            mt: 2,
            py: 1.5,
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '1rem'
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'Sign In'}
        </Button>
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account? Contact your administrator.
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default LoginForm;