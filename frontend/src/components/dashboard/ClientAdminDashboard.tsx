import React, { useEffect } from 'react';
import { Container, Typography, Grid, Paper, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import MetricCard from './MetricCard';
import { useAuth } from '../auth/AuthProvider';
import { Role } from '../../services/auth';
import { useNavigate } from 'react-router-dom';

const DashboardContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(8),
}));

const DashboardHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const ClientAdminDashboard: React.FC = () => {
  const { userContext } = useAuth();
  const navigate = useNavigate();

  // Redirect if not a client admin
  useEffect(() => {
    if (!userContext || userContext.role !== Role.CLIENT_ADMIN) {
      navigate('/');
    }
  }, [userContext, navigate]);

  return (
    <DashboardContainer maxWidth="lg">
      <DashboardHeader>
        <Typography variant="h4" component="h1" gutterBottom>
          Client Admin Dashboard
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Welcome back, {userContext?.userId || 'Admin'}. Here's an overview of your organization.
        </Typography>
      </DashboardHeader>

      <Grid container spacing={4}>
        {/* Key Metrics */}
        <Grid item xs={12}>
          <Typography variant="h5" component="h2" gutterBottom>
            Organization Metrics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard 
                title="Total Brands" 
                value="8" 
                trend={1}
                subtitle="from last month"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard 
                title="Active Users" 
                value="42" 
                trend={5}
                subtitle="from last month"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard 
                title="Products" 
                value="1,245" 
                trend={12}
                subtitle="from last month"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard 
                title="Conversions" 
                value="3.2%" 
                trend={0.5}
                subtitle="from last month"
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Brand Performance */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" component="h3" gutterBottom>
              Brand Performance
            </Typography>
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Brand performance metrics will be displayed here.
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Integration Status */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" component="h3" gutterBottom>
              Integration Status
            </Typography>
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Integration status information will be displayed here.
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" component="h3" gutterBottom>
              Recent Activity
            </Typography>
            <Typography variant="body2" color="textSecondary">
              This section will display recent organization activity.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </DashboardContainer>
  );
};

export default ClientAdminDashboard;