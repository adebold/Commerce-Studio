import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Grid,
  Container,
  ButtonGroup
} from '@mui/material';
import { metricsService } from '../../services/metrics';
import MetricCard from '../../components/dashboard/MetricCard';
import SalesChart from '../../components/dashboard/SalesChart';
import ProductPerformance from '../../components/dashboard/ProductPerformance';
import CustomerEngagement from '../../components/dashboard/CustomerEngagement';
import IntegrationStatus from '../../components/dashboard/IntegrationStatus';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import type {
  MLMetrics,
  DataPipelineMetrics,
  APIMetrics,
  BusinessMetrics,
  SystemMetrics,
  ServiceStatus as ServiceStatusType
} from '../../services/metrics';

const DashboardPage: React.FC = () => {
  // State for metrics data
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<{
    ml: MLMetrics;
    pipeline: DataPipelineMetrics;
    api: APIMetrics;
    business: BusinessMetrics;
    system: SystemMetrics;
    status: ServiceStatusType;
  }>(metricsService.getMockData());
  
  // State for time period selection
  const [timePeriod, setTimePeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        // Using mock data for now
        setMetrics(metricsService.getMockData());
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  // Helper functions for formatting
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatNumber = (value: number) => value.toLocaleString();

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Header Section */}
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard Overview
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor your store's performance and customer engagement metrics
          </Typography>
        </Box>

        {/* KPI Summary Section */}
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            Key Performance Indicators
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard 
                title="Conversion Rate" 
                value={formatPercentage(metrics.business.conversionRate)}
                loading={loading}
                trend={2.5}
                tooltipText="Percentage of visitors who complete a purchase"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard 
                title="Active Users" 
                value={formatNumber(metrics.business.uniqueUsers)}
                loading={loading}
                trend={5.2}
                tooltipText="Number of unique users in the last 30 days"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard 
                title="Active Integrations" 
                value={formatNumber(metrics.business.activeIntegrations)}
                loading={loading}
                tooltipText="Number of active e-commerce platform integrations"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard 
                title="Model Accuracy" 
                value={formatPercentage(metrics.ml.modelAccuracy)}
                loading={loading}
                trend={1.3}
                tooltipText="Accuracy of the recommendation model"
              />
            </Grid>
          </Grid>
        </Box>

        {/* Sales Overview Section */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" component="h2">
              Sales Overview
            </Typography>
            <ButtonGroup size="small" variant="outlined">
              <Button 
                variant={timePeriod === 'daily' ? 'contained' : 'outlined'}
                onClick={() => setTimePeriod('daily')}
              >
                Daily
              </Button>
              <Button 
                variant={timePeriod === 'weekly' ? 'contained' : 'outlined'}
                onClick={() => setTimePeriod('weekly')}
              >
                Weekly
              </Button>
              <Button 
                variant={timePeriod === 'monthly' ? 'contained' : 'outlined'}
                onClick={() => setTimePeriod('monthly')}
              >
                Monthly
              </Button>
            </ButtonGroup>
          </Box>
          <Card>
            <CardContent>
              <SalesChart timePeriod={timePeriod} loading={loading} />
            </CardContent>
          </Card>
        </Box>

        {/* Product Performance & Customer Engagement */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <Box>
              <Typography variant="h5" component="h2" gutterBottom>
                Product Performance
              </Typography>
              <Card>
                <CardContent>
                  <ProductPerformance loading={loading} />
                </CardContent>
              </Card>
            </Box>
          </Grid>
          
          <Grid item xs={12} lg={6}>
            <Box>
              <Typography variant="h5" component="h2" gutterBottom>
                Customer Engagement
              </Typography>
              <Card>
                <CardContent>
                  <CustomerEngagement loading={loading} />
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>

        {/* Integration Status & Activity Feed */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <Box>
              <Typography variant="h5" component="h2" gutterBottom>
                Integration Status
              </Typography>
              <Card>
                <CardContent>
                  <IntegrationStatus loading={loading} />
                </CardContent>
              </Card>
            </Box>
          </Grid>
          
          <Grid item xs={12} lg={6}>
            <Box>
              <Typography variant="h5" component="h2" gutterBottom>
                Recent Activity
              </Typography>
              <Card>
                <CardContent>
                  <ActivityFeed loading={loading} />
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default DashboardPage;