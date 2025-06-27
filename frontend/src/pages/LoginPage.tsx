import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Grid
} from '@mui/material';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid credentials. Please try the demo accounts below.');
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo123');
    const success = await login(demoEmail, 'demo123');
    if (success) {
      navigate('/dashboard');
    }
  };

  const demoAccounts = [
    {
      email: 'super@varai.com',
      name: 'Sarah Chen',
      role: 'Super Admin',
      description: 'Full system access and management',
      avatar: '👩‍💼',
      color: '#e3f2fd'
    },
    {
      email: 'brand@varai.com',
      name: 'Marcus Rodriguez',
      role: 'Brand Manager',
      description: 'Brand and product management',
      avatar: '👨‍💼',
      color: '#f3e5f5'
    },
    {
      email: 'admin@varai.com',
      name: 'Emily Johnson',
      role: 'Client Admin',
      description: 'Client account administration',
      avatar: '👩‍💻',
      color: '#e8f5e8'
    },
    {
      email: 'dev@varai.com',
      name: 'Alex Kim',
      role: 'Developer',
      description: 'API and integration management',
      avatar: '👨‍💻',
      color: '#fff3e0'
    },
    {
      email: 'viewer@varai.com',
      name: 'Lisa Wang',
      role: 'Viewer',
      description: 'Read-only access and analytics',
      avatar: '👩‍🔬',
      color: '#fce4ec'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#0A2463' }}>
          VARAi Commerce Studio
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Sign in to access your dashboard
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
              Sign In
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                autoComplete="email"
                autoFocus
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                autoComplete="current-password"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ 
                  mt: 3, 
                  mb: 2, 
                  py: 1.5,
                  backgroundColor: '#0A2463',
                  '&:hover': {
                    backgroundColor: '#082050'
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={7}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
            Demo Accounts
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Click any account below to sign in instantly (password: demo123)
          </Typography>

          <Grid container spacing={2}>
            {demoAccounts.map((account) => (
              <Grid item xs={12} sm={6} key={account.email}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backgroundColor: account.color,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                  onClick={() => handleDemoLogin(account.email)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h4" sx={{ mr: 2 }}>
                        {account.avatar}
                      </Typography>
                      <Box>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                          {account.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {account.role}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {account.description}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1, fontFamily: 'monospace' }}>
                      {account.email}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      <Divider sx={{ my: 6 }} />

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Don't have an account? Contact your administrator for access.
        </Typography>
      </Box>
    </Container>
  );
};

export default LoginPage;