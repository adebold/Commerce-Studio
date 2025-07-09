import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Typography, Box, Grid } from '@mui/material';
import { fetchGlobalMetrics, fetchTenantMetrics } from '../store/analyticsSlice';
import MetricCard from '../components/MetricCard';
import AnalyticsChart from '../components/AnalyticsChart';

function AnalyticsPage() {
  const dispatch = useDispatch();
  const { globalMetrics, tenantMetrics, status, error } = useSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(fetchGlobalMetrics());
    dispatch(fetchTenantMetrics());
  }, [dispatch]);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Analytics Dashboard
      </Typography>
      {status === 'loading' && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {status === 'succeeded' && (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard title="Total Revenue" value={globalMetrics.totalRevenue} unit="USD" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard title="Total Orders" value={globalMetrics.totalOrders} />
          </Grid>
          <Grid item xs={12}>
            <AnalyticsChart data={tenantMetrics} dataKey="revenue" xAxisKey="name" />
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default AnalyticsPage;