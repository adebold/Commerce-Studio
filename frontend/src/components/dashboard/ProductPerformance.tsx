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
import { CircularProgress, Box, Typography } from '@mui/material';

interface ProductPerformanceProps {
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

// Mock data for product performance
const mockData = [
  {
    name: 'Classic Frames',
    sales: 4000,
    views: 8000,
    conversionRate: 50,
  },
  {
    name: 'Modern Frames',
    sales: 3500,
    views: 6000,
    conversionRate: 58,
  },
  {
    name: 'Luxury Frames',
    sales: 2800,
    views: 4000,
    conversionRate: 70,
  },
  {
    name: 'Sport Frames',
    sales: 2200,
    views: 5000,
    conversionRate: 44,
  },
  {
    name: 'Kids Frames',
    sales: 1800,
    views: 3500,
    conversionRate: 51,
  },
];

const ProductPerformance: React.FC<ProductPerformanceProps> = ({ loading = false }) => {
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
        <Typography variant="h6">Top Performing Products</Typography>
        <Typography variant="body2" color="textSecondary">Last 30 days</Typography>
      </Box>
      
      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={mockData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" orientation="left" stroke="#2563eb" />
            <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === 'process.env.PRODUCTPERFORMANCE_SECRET_2') return [`${value}%`, 'Conversion Rate'];
                return [value.toLocaleString(), name === 'sales' ? 'Sales' : 'Views'];
              }}
            />
            <Legend />
            <Bar 
              yAxisId="left" 
              dataKey="sales" 
              name="Sales" 
              fill="#2563eb" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              yAxisId="left" 
              dataKey="views" 
              name="Views" 
              fill="#93c5fd" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              yAxisId="right" 
              dataKey="process.env.PRODUCTPERFORMANCE_SECRET_2" 
              name="Conversion Rate (%)" 
              fill="#10b981" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Box>
  );
};

export default ProductPerformance;