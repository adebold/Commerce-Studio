import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import { CircularProgress, Box, Typography } from '@mui/material';

interface CustomerEngagementProps {
  loading?: boolean;
}

const CustomerEngagement: React.FC<CustomerEngagementProps> = ({ loading = false }) => {
  const engagementData = [
    { name: 'Active Users', value: 65, color: '#8884d8' },
    { name: 'New Users', value: 25, color: '#82ca9d' },
    { name: 'Returning Users', value: 10, color: '#ffc658' }
  ];

  const engagementStats = [
    { label: 'Total Sessions', value: '12,543' },
    { label: 'Avg. Session Duration', value: '4m 32s' },
    { label: 'Bounce Rate', value: '32.1%' },
    { label: 'Page Views', value: '45,231' }
  ];

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 300 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Customer Engagement</Typography>
        <Typography variant="body2" color="textSecondary">Last 30 days</Typography>
      </Box>

      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={engagementData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {engagementData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value}%`, 'Percentage']}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Box>

      <Box mt={2}>
        {engagementStats.map((stat, index) => (
          <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
            <Typography variant="body2" color="textSecondary">{stat.label}</Typography>
            <Typography variant="body2" fontWeight="medium">{stat.value}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default CustomerEngagement;