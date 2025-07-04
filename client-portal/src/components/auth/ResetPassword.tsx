import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Link, 
  Paper,
  Alert 
} from '@mui/material';
import { Link as RouterLink, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/services/auth/AuthContext';

const ResetPassword: React.FC = () => {
  const { resetPassword, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setPasswordError('');
    setError('');
    setSuccess(false);
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    // Check if token exists
    if (!token) {
      setError('Reset token is missing. Please use the link from your email.');
      return;
    }
    
    try {
      await resetPassword(token, password);
      setSuccess(true);
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError('Failed to reset password. The link may have expired.');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Typography variant="h5" component="h1" align="center" gutterBottom>
          Set New Password
        </Typography>
        <Typography variant="body2" align="center" sx={{ mb: 3 }}>
          Enter your new password below.
        </Typography>
        
        {!token && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            No reset token found in the URL. Please use the link from your email.
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Password reset successful! Redirecting to login page...
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="New Password"
            margin="normal"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={!token || success}
            error={!!passwordError}
          />
          <TextField
            fullWidth
            label="Confirm New Password"
            margin="normal"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={!token || success}
            error={!!passwordError}
            helperText={passwordError}
          />
          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={isLoading || !token || success}
            sx={{ mt: 3, mb: 2 }}
          >
            {isLoading ? 'Processing...' : 'Reset Password'}
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <Link component={RouterLink} to="/login" variant="body2">
              Back to Login
            </Link>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ResetPassword;
