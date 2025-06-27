import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Box, Button, Grid, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { commerceStudioApi } from '../../services/commerce-studio';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
}

export const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/customer/login');
        return;
      }

      const response = await commerceStudioApi.get('/api/customers/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setUser(response.data.data);
      } else {
        navigate('/customer/login');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      navigate('/customer/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/customer/login');
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1">
              Welcome, {user?.firstName}!
            </Typography>
            <Button variant="outlined" onClick={handleLogout}>
              Logout
            </Button>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Account Information
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Name:</strong> {user?.firstName} {user?.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Email:</strong> {user?.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Role:</strong> {user?.role}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Member since:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button variant="contained" fullWidth>
                      Create New Store
                    </Button>
                    <Button variant="outlined" fullWidth>
                      View Products
                    </Button>
                    <Button variant="outlined" fullWidth>
                      Manage Orders
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Getting Started
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome to Commerce Studio! You can now start building your online store, 
              managing products, and processing orders. Use the navigation above to explore 
              all available features.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
