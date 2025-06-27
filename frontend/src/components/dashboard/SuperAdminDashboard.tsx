import React, { useEffect } from 'react';
import { Container, Typography, Grid, Paper, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import MetricCard from './MetricCard';
import CommerceApps from './CommerceApps';
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

const SuperAdminDashboard: React.FC = () => {
  const { userContext } = useAuth();
  const navigate = useNavigate();

  // Redirect if not a super admin
  useEffect(() => {
    if (!userContext || userContext.role !== Role.SUPER_ADMIN) {
      navigate('/');
    }
  }, [userContext, navigate]);

  return (
    <DashboardContainer maxWidth="lg">
      <DashboardHeader>
        <Typography variant="h4" component="h1" gutterBottom>
          Super Admin Dashboard
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Welcome back, {userContext?.userId || 'Admin'}. Here's an overview of your platform.
        </Typography>
      </DashboardHeader>

      <Grid container spacing={4}>
        {/* Key Metrics */}
        <Grid item xs={12}>
          <Typography variant="h5" component="h2" gutterBottom>
            Platform Metrics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard 
                title="Total Clients"
                value="24"
                trend={3}
                subtitle="from last month"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard 
                title="Active Users" 
                value="156" 
                trend={12}
                subtitle="from last month"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard 
                title="API Requests"
                value="1.2M"
                trend={8}
                subtitle="from last week"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard 
                title="ML Models"
                value="8"
                trend={2}
                subtitle="new models"
              />
            </Grid>
          </Grid>
        </Grid>

        {/* System Health */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" component="h3" gutterBottom>
              System Health
            </Typography>
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="textSecondary">
                System health monitoring will be displayed here.
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Commerce Apps */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" component="h3" gutterBottom>
              Commerce Apps
            </Typography>
            <CommerceApps />
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" component="h3" gutterBottom>
              Recent Activity
            </Typography>
            <Typography variant="body2" color="textSecondary">
              This section will display recent platform activity and audit logs.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </DashboardContainer>
  );
};

export default SuperAdminDashboard;