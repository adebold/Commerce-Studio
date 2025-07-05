import { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box, Chip } from '@mui/material';
import { metricsService } from '../../services/metrics';
import type { CommerceAppsStatus } from '../../types/commerce';
import MetricCard from './MetricCard';

interface CommerceAppCardProps {
  title: string;
  metrics: {
    deploymentStatus: 'online' | 'offline' | 'error';
    apiResponseTime: number;
    errorRate: number;
    activeUsers: number;
    lastDeployment: Date;
    buildStatus: 'success' | 'failed' | 'in_progress';
  };
  loading: boolean;
}

const CommerceAppCard = ({ title, metrics, loading }: CommerceAppCardProps) => {
  const getStatusColor = (status: 'online' | 'offline' | 'error') => {
    switch (status) {
      case 'online':
        return 'success';
      case 'offline':
        return 'error';
      case 'error':
        return 'warning';
    }
  };

  const getBuildStatusColor = (status: 'success' | 'failed' | 'in_progress') => {
    switch (status) {
      case 'success':
        return 'success';
      case 'failed':
        return 'error';
      case 'in_progress':
        return 'warning';
    }
  };

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">{title}</Typography>
        <Box>
          <Chip 
            label={`Deployment: ${metrics.deploymentStatus}`}
            color={getStatusColor(metrics.deploymentStatus)}
            size="small"
            sx={{ mr: 1 }}
          />
          <Chip 
            label={`Build: ${metrics.buildStatus}`}
            color={getBuildStatusColor(metrics.buildStatus)}
            size="small"
          />
        </Box>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <MetricCard
            title="API Response Time"
            value={`${metrics.apiResponseTime}ms`}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <MetricCard
            title="Error Rate"
            value={`${(metrics.errorRate * 100).toFixed(2)}%`}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <MetricCard
            title="Active Users"
            value={metrics.activeUsers.toString()}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <MetricCard
            title="Last Deployment"
            value={new Date(metrics.lastDeployment).toLocaleString()}
            loading={loading}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default function CommerceApps() {
  const [loading, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<CommerceAppsStatus>(
    metricsService.getMockData().commerce
  );

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await metricsService.getCommerceAppsStatus();
        setMetrics(data);
        setError(null);
      } catch {
        setError('Failed to fetch commerce apps metrics');
        // Keep using mock data on error
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Commerce Apps Status
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <CommerceAppCard
            title="Shopify"
            metrics={metrics.shopify}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CommerceAppCard
            title="WooCommerce"
            metrics={metrics.woocommerce}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CommerceAppCard
            title="BigCommerce"
            metrics={metrics.bigcommerce}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <CommerceAppCard
            title="Magento"
            metrics={metrics.magento}
            loading={loading}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
