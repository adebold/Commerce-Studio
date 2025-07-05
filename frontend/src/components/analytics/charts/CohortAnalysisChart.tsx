import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Box, Paper, Typography } from '@mui/material';
import { CohortData } from '../../../services/analytics';

interface CohortAnalysisChartProps {
  data: CohortData;
  title?: string;
  height?: number;
  loading?: boolean;
}

const CohortAnalysisChart: React.FC<CohortAnalysisChartProps> = ({
  data,
  title = 'Cohort Retention Analysis',
  height = 500,
  loading = false
}) => {
  // Transform data for the chart
  const transformedData = data.periods.map((period, periodIndex) => {
    const periodData: Record<string, string | number> = { name: period };
    
    data.cohorts.forEach((cohort) => {
      // Only include data points that exist for this cohort
      if (periodIndex < cohort.retentionRates.length) {
        periodData[cohort.name] = (cohort.retentionRates[periodIndex] * 100).toFixed(1);
      }
    });
    
    return periodData;
  });
  
  // Generate colors for each cohort
  const cohortColors = [
    '#1890FF', // Primary blue
    '#52C41A', // Green
    '#FAAD14', // Yellow
    '#F5222D', // Red
    '#722ED1', // Purple
    '#13C2C2', // Cyan
    '#FA8C16', // Orange
    '#EB2F96'  // Pink
  ];
  
  if (loading) {
    return (
      <Paper sx={{ p: 3, height }}>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%' }}>
          <Typography>Loading...</Typography>
        </Box>
      </Paper>
    );
  }
  
  return (
    <Paper sx={{ p: 3, height }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Retention rates by cohort over time (%)
      </Typography>
      
      <Box sx={{ mt: 2, height: 'calc(100% - 80px)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={transformedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={70} 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              label={{ 
                value: 'Retention Rate (%)', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
              domain={[0, 100]}
            />
            <Tooltip 
              formatter={(value) => [`${value}%`, 'Retention Rate']}
              labelFormatter={(label) => `Period: ${label}`}
            />
            <Legend 
              verticalAlign="top" 
              wrapperStyle={{ paddingBottom: '10px' }}
              formatter={(value) => {
                const cohort = data.cohorts.find(c => c.name === value);
                return cohort ? `${value} (${cohort.size} users)` : value;
              }}
            />
            
            {data.cohorts.map((cohort, index) => (
              <Bar 
                key={cohort.name}
                dataKey={cohort.name} 
                fill={cohortColors[index % cohortColors.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default CohortAnalysisChart;