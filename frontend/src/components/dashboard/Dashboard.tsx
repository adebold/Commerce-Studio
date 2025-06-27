import { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box, Alert } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import MetricCard from './MetricCard';
import ServiceStatus from './ServiceStatus';
import { metricsService } from '../../services/metrics';
import type { MLMetrics, DataPipelineMetrics, APIMetrics, BusinessMetrics, SystemMetrics, ServiceStatus as ServiceStatusType } from '../../services/metrics';

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<{
    ml: MLMetrics;
    pipeline: DataPipelineMetrics;
    api: APIMetrics;
    business: BusinessMetrics;
    system: SystemMetrics;
    status: ServiceStatusType;
  }>(metricsService.getMockData());

  // Debug logging
  useEffect(() => {
    console.log('Dashboard metrics:', metrics);
    console.log('System metrics:', metrics.system);
    console.log('Loading:', loading);
  }, [metrics, loading]);

  useEffect(() => {
    const fetchMetrics = async () => {
      // Don't set loading to true when using mock data
      try {
        // const [ml, pipeline, api, business, system, status] = await Promise.all([
        //   metricsService.getMLMetrics(),
        //   metricsService.getDataPipelineMetrics(),
        //   metricsService.getAPIMetrics(),
        //   metricsService.getBusinessMetrics(),
        //   metricsService.getSystemMetrics(),
        //   metricsService.getServiceStatus()
        // ]);

        // Using mock data for now
        setMetrics(metricsService.getMockData());
        setError(null);
      } catch (err) {
        setError('Failed to fetch metrics. Using mock data.');
        // Keep using mock data on error
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatNumber = (value: number) => value.toLocaleString();

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Service Status */}
        <Grid item xs={12}>
          <ServiceStatus status={metrics.status} loading={loading} />
        </Grid>

        {/* System Health */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            System Health
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="CPU Usage"
                value={formatPercentage(metrics.system.cpuUsage)}
                loading={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Memory Usage"
                value={formatPercentage(metrics.system.memoryUsage)}
                loading={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Storage Usage"
                value={formatPercentage(metrics.system.storageUsage)}
                loading={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Active Jobs"
                value={metrics.system.activeJobs.toString()}
                loading={loading}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* ML Metrics */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            ML Performance
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Model Accuracy"
                value={formatPercentage(metrics.ml.modelAccuracy)}
                loading={loading}
                tooltipText="Overall model prediction accuracy"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="API Response Time"
                value={`${metrics.ml.apiResponseTime}ms`}
                loading={loading}
                tooltipText="Average API response time"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Embedding Success Rate"
                value={formatPercentage(metrics.ml.embeddingSuccessRate)}
                loading={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Style Query Accuracy"
                value={formatPercentage(metrics.ml.styleQueryAccuracy)}
                loading={loading}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* API Performance Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 400, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              API Requests per Minute
            </Typography>
            <ResponsiveContainer>
              <LineChart
                data={[
                  { time: '00:00', value: 100 },
                  { time: '00:05', value: 120 },
                  { time: '00:10', value: 140 },
                  { time: '00:15', value: 130 },
                  { time: '00:20', value: 150 }
                ]}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#1976d2" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>


        {/* Business Metrics */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Business Performance
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Active Integrations"
                value={formatNumber(metrics.business.activeIntegrations)}
                loading={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Total Recommendations"
                value={formatNumber(metrics.business.totalRecommendations)}
                loading={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Unique Users"
                value={formatNumber(metrics.business.uniqueUsers)}
                loading={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Conversion Rate"
                value={formatPercentage(metrics.business.conversionRate)}
                loading={loading}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
