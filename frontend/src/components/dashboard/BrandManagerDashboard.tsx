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

const BrandManagerDashboard: React.FC = () => {
  const { userContext } = useAuth();
  const navigate = useNavigate();

  // Redirect if not a brand manager
  useEffect(() => {
    if (!userContext || userContext.role !== Role.BRAND_MANAGER) {
      navigate('/');
    }
  }, [userContext, navigate]);

  return (
    <DashboardContainer maxWidth="lg">
      <DashboardHeader>
        <Typography variant="h4" component="h1" gutterBottom>
          Brand Manager Dashboard
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Welcome back, {userContext?.userId || 'Manager'}. Here's an overview of your brand.
        </Typography>
      </DashboardHeader>

      <Grid container spacing={4}>
        {/* Key Metrics */}
        <Grid item xs={12}>
          <Typography variant="h5" component="h2" gutterBottom>
            Brand Metrics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard 
                title="Total Products" 
                value="342" 
                trend={15}
                subtitle="from last month"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard 
                title="Product Views" 
                value="12.5K" 
                trend={8}
                subtitle="from last month"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard 
                title="Conversion Rate" 
                value="4.2%" 
                trend={0.7}
                subtitle="from last month"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard 
                title="Avg. Rating" 
                value="4.7" 
                trend={0.2}
                subtitle="from last month"
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Product Performance */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" component="h3" gutterBottom>
              Product Performance
            </Typography>
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Product performance metrics will be displayed here.
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Customer Insights */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" component="h3" gutterBottom>
              Customer Insights
            </Typography>
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Customer insights and analytics will be displayed here.
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
              This section will display recent brand activity.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </DashboardContainer>
  );
};

export default BrandManagerDashboard;