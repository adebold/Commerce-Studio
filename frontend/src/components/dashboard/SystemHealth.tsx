import { Box, Typography, Grid } from '@mui/material';
import type { SystemMetrics } from '../../services/metrics';
import MetricCard from './MetricCard';

interface SystemHealthProps {
  metrics: SystemMetrics;
  loading: boolean;
  formatPercentage: (value: number) => string;
}

export default function SystemHealth({ metrics, loading, formatPercentage }: SystemHealthProps) {
  if (!metrics) {
    return null;
  }

  const items = [
    { title: 'CPU Usage', value: formatPercentage(metrics.cpuUsage) },
    { title: 'Memory Usage', value: formatPercentage(metrics.memoryUsage) },
    { title: 'Storage Usage', value: formatPercentage(metrics.storageUsage) },
    { title: 'Active Jobs', value: metrics.activeJobs.toString() }
  ];

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        System Health
      </Typography>
      <Grid container spacing={2} sx={{ flexGrow: 1, mt: 0 }}>
        {items.map((item) => (
          <Grid item xs={12} key={item.title}>
            <MetricCard
              title={item.title}
              value={item.value}
              loading={loading}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
