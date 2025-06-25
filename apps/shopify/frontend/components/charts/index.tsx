import React from 'react';
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart as RechartsBarChart,
  Bar,
} from 'recharts';
import { useTheme } from '@shopify/polaris';

interface ChartProps {
  data: any[];
  metrics: string[];
}

const COLORS = ['#5C6AC4', '#47C1BF', '#F49342', '#9C6ADE'];

export function LineChart({ data, metrics }: ChartProps) {
  const theme = useTheme();

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          {metrics.map((metric, index) => (
            <Line
              key={metric}
              type="monotone"
              dataKey={metric}
              stroke={COLORS[index % COLORS.length]}
              activeDot={{ r: 8 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarChart({ data, metrics }: ChartProps) {
  const theme = useTheme();

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          {metrics.map((metric, index) => (
            <Bar
              key={metric}
              dataKey={metric}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Sample data generators for demonstration
export const generateTimeSeriesData = (days: number) => {
  const data = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      views: Math.floor(Math.random() * 100) + 50,
      try_ons: Math.floor(Math.random() * 30) + 10,
      purchases: Math.floor(Math.random() * 15) + 5,
    });
  }
  
  return data;
};

export const generateAlgorithmData = () => {
  return [
    {
      name: 'Style Based',
      impressions: 450,
      clicks: 135,
      revenue: 7250,
    },
    {
      name: 'Collaborative',
      impressions: 380,
      clicks: 114,
      revenue: 6120,
    },
    {
      name: 'Hybrid',
      impressions: 150,
      clicks: 36,
      revenue: 3380,
    },
  ];
};
