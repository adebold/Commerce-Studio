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

const ViewerDashboard: React.FC = () => {
  const { userContext } = useAuth();
  const navigate = useNavigate();

  // Redirect if not a viewer
  useEffect(() => {
    if (!userContext || userContext.role !== Role.VIEWER) {
      navigate('/');
    }
  }, [userContext, navigate]);

  return (
    <DashboardContainer maxWidth="lg">
      <DashboardHeader>
        <Typography variant="h4" component="h1" gutterBottom>
          Viewer Dashboard
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Welcome back, {userContext?.userId || 'Viewer'}. Here's your overview.
        </Typography>
      </DashboardHeader>

      <Grid container spacing={4}>
        {/* Key Metrics */}
        <Grid item xs={12}>
          <Typography variant="h5" component="h2" gutterBottom>
            Overview Metrics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard 
                title="Products" 
                value="1,245" 
                subtitle="total products"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard 
                title="Brands" 
                value="24" 
                subtitle="total brands"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard 
                title="Categories" 
                value="36" 
                subtitle="product categories"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard 
                title="Reports" 
                value="12" 
                subtitle="available reports"
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Recent Reports */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" component="h3" gutterBottom>
              Recent Reports
            </Typography>
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Recent reports will be displayed here.
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Saved Views */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" component="h3" gutterBottom>
              Saved Views
            </Typography>
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Your saved views will be displayed here.
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Recommendations */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" component="h3" gutterBottom>
              Recommended Products
            </Typography>
            <Typography variant="body2" color="textSecondary">
              This section will display recommended products based on your viewing history.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </DashboardContainer>
  );
};

export default ViewerDashboard;