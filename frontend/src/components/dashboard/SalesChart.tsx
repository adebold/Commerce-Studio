import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { CircularProgress, Box, Typography } from '@mui/material';

interface SalesChartProps {
  timePeriod: 'daily' | 'weekly' | 'monthly';
  loading?: boolean;
}

const ChartContainer = styled.div`
  width: 100%;
  height: 300px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 300px;
`;

// Mock data for different time periods
const generateMockData = (period: 'daily' | 'weekly' | 'monthly') => {
  const now = new Date();
  const data = [];

  if (period === 'daily') {
    // Last 24 hours
    for (let i = 0; i < 24; i++) {
      const hour = new Date(now);
      hour.setHours(now.getHours() - 23 + i);
      
      data.push({
        time: `${hour.getHours()}:00`,
        sales: Math.floor(Math.random() * 5000) + 1000,
        orders: Math.floor(Math.random() * 50) + 10,
        revenue: Math.floor(Math.random() * 10000) + 2000,
      });
    }
  } else if (period === 'weekly') {
    // Last 7 days
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      
      data.push({
        time: days[day.getDay()],
        sales: Math.floor(Math.random() * 20000) + 5000,
        orders: Math.floor(Math.random() * 200) + 50,
        revenue: Math.floor(Math.random() * 40000) + 10000,
      });
    }
  } else {
    // Last 12 months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = now.getMonth();
    
    for (let i = 11; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      
      data.push({
        time: months[monthIndex],
        sales: Math.floor(Math.random() * 100000) + 20000,
        orders: Math.floor(Math.random() * 1000) + 200,
        revenue: Math.floor(Math.random() * 200000) + 50000,
      });
    }
  }

  return data;
};

const SalesChart: React.FC<SalesChartProps> = ({ timePeriod, loading = false }) => {
  const data = generateMockData(timePeriod);
  
  if (loading) {
    return (
      <LoadingContainer>
        <CircularProgress />
      </LoadingContainer>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          {timePeriod === 'daily' ? 'Today\'s Sales' : 
           timePeriod === 'weekly' ? 'Weekly Sales' : 'Monthly Sales'}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {timePeriod === 'daily' ? 'Last 24 hours' : 
           timePeriod === 'weekly' ? 'Last 7 days' : 'Last 12 months'}
        </Typography>
      </Box>
      
      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              name="Revenue" 
              stroke="#2563eb" 
              activeDot={{ r: 8 }} 
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="sales" 
              name="Sales" 
              stroke="#10b981" 
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="orders" 
              name="Orders" 
              stroke="#f59e0b" 
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Box>
  );
};

export default SalesChart;