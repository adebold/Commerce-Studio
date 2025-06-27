import React from 'react';
import { 
  ResponsiveContainer, 
  FunnelChart, 
  Funnel, 
  LabelList, 
  Tooltip, 
  Cell 
} from 'recharts';
import { Box, Typography, Paper } from '@mui/material';
import { ConversionFunnelData } from '../../../services/analytics';

interface ConversionFunnelProps {
  data: ConversionFunnelData;
  title?: string;
  height?: number;
  colors?: string[];
  loading?: boolean;
}

const ConversionFunnel: React.FC<ConversionFunnelProps> = ({
  data,
  title = 'Conversion Funnel',
  height = 400,
  colors = ['#1890FF', '#36CBCB', '#4ECB73', '#FBD437', '#F2637B'],
  loading = false
}) => {
  // Transform data for the funnel chart
  const funnelData = data.stages.map((stage, index) => ({
    name: stage.name,
    value: stage.count,
    conversionRate: stage.conversionRate,
    fill: colors[index % colors.length]
  }));

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
        Overall Conversion Rate: {(data.overallConversionRate * 100).toFixed(1)}%
      </Typography>
      
      <ResponsiveContainer width="100%" height="80%">
        <FunnelChart>
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'value') {
                return [`${value.toLocaleString()} users`, 'Count'];
              }
              return [value, name];
            }}
          />
          <Funnel
            dataKey="value"
            data={funnelData}
            isAnimationActive
          >
            <LabelList
              position="right"
              fill="#000"
              stroke="none"
              dataKey="name"
            />
            <LabelList
              position="right"
              fill="#666"
              stroke="none"
              dataKey={(entry) => `${(entry.conversionRate * 100).toFixed(1)}%`}
              offset={60}
            />
            {funnelData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default ConversionFunnel;