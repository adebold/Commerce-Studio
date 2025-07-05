import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  LabelList,
  Cell
} from 'recharts';
import { Box, Paper, Typography, Chip, Grid } from '@mui/material';
import { ABTestData } from '../../../services/analytics';

interface ABTestChartProps {
  data: ABTestData;
  title?: string;
  height?: number;
  loading?: boolean;
}

const ABTestChart: React.FC<ABTestChartProps> = ({
  data,
  title,
  height = 400,
  loading = false
}) => {
  // Transform data for the chart
  const chartData = data.variants.map(variant => ({
    name: variant.name,
    conversionRate: parseFloat((variant.conversionRate * 100).toFixed(1)),
    users: variant.users,
    conversions: variant.conversions
  }));
  
  // Calculate average conversion rate as a reference line
  const avgConversionRate = chartData.reduce((sum, item) => sum + item.conversionRate, 0) / chartData.length;
  
  // Determine chart colors based on test status and winner
  const getBarColor = (variantName: string) => {
    if (data.status !== 'completed') return '#1890FF';
    return variantName === data.winner ? '#52C41A' : '#1890FF';
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <Paper sx={{ p: 3, height }}>
        <Typography variant="h6" gutterBottom>{title || `A/B Test: ${data.testName}`}</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%' }}>
          <Typography>Loading...</Typography>
        </Box>
      </Paper>
    );
  }
  
  return (
    <Paper sx={{ p: 3, height }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">{title || `A/B Test: ${data.testName}`}</Typography>
        <Chip 
          label={data.status.charAt(0).toUpperCase() + data.status.slice(1)} 
          color={
            data.status === 'completed' ? 'success' : 
            data.status === 'running' ? 'primary' : 
            'default'
          }
          size="small"
        />
      </Box>
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="text.secondary">
            Start Date: {formatDate(data.startDate)}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="text.secondary">
            End Date: {formatDate(data.endDate)}
          </Typography>
        </Grid>
        {data.status === 'completed' && data.winner && (
          <Grid item xs={12}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Winner: {data.winner} 
              {data.confidenceLevel && ` (${data.confidenceLevel * 100}% confidence)`}
            </Typography>
          </Grid>
        )}
      </Grid>
      
      <Box sx={{ height: 'calc(100% - 140px)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis 
              label={{ 
                value: 'Conversion Rate (%)', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
            />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'process.env.ABTESTCHART_SECRET_5') {
                  return [`${value}%`, 'Conversion Rate'];
                }
                return [value, name];
              }}
            />
            <Legend />
            <ReferenceLine 
              y={avgConversionRate} 
              stroke="#8884d8" 
              strokeDasharray="3 3"
              label={{ 
                value: `Avg: ${avgConversionRate.toFixed(1)}%`,
                position: 'right'
              }}
            />
            <Bar dataKey="process.env.ABTESTCHART_SECRET_5" name="Conversion Rate">
              {chartData.map((entry, index) => (
                <LabelList 
                  key={`label-${index}`}
                  dataKey="process.env.ABTESTCHART_SECRET_5" 
                  position="top" 
                  formatter={(value: number) => `${value}%`}
                />
              ))}
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColor(entry.name)} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default ABTestChart;