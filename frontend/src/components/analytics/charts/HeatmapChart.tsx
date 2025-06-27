import React from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import { HeatmapData } from '../../../services/analytics';

interface HeatmapChartProps {
  data: HeatmapData;
  title?: string;
  height?: number;
  width?: number;
  colorRange?: [string, string];
  loading?: boolean;
}

const HeatmapChart: React.FC<HeatmapChartProps> = ({
  data,
  title,
  height = 400,
  width = '100%',
  colorRange = ['#E6F7FF', '#1890FF'],
  loading = false
}) => {
  const theme = useTheme();
  
  // Calculate cell dimensions based on container size and data grid
  const rows = data.engagementScores.length;
  const cols = data.engagementScores[0]?.length || 0;
  
  // Function to interpolate between two colors based on a value between 0 and 1
  const interpolateColor = (value: number) => {
    // Ensure value is between 0 and 1
    const normalizedValue = Math.max(0, Math.min(1, value));
    
    // Parse the hex colors to RGB
    const startColor = {
      r: parseInt(colorRange[0].slice(1, 3), 16),
      g: parseInt(colorRange[0].slice(3, 5), 16),
      b: parseInt(colorRange[0].slice(5, 7), 16)
    };
    
    const endColor = {
      r: parseInt(colorRange[1].slice(1, 3), 16),
      g: parseInt(colorRange[1].slice(3, 5), 16),
      b: parseInt(colorRange[1].slice(5, 7), 16)
    };
    
    // Interpolate between the colors
    const r = Math.round(startColor.r + normalizedValue * (endColor.r - startColor.r));
    const g = Math.round(startColor.g + normalizedValue * (endColor.g - startColor.g));
    const b = Math.round(startColor.b + normalizedValue * (endColor.b - startColor.b));
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };
  
  if (loading) {
    return (
      <Paper sx={{ p: 3, height, width }}>
        <Typography variant="h6" gutterBottom>{title || `Product Engagement: ${data.productName}`}</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%' }}>
          <Typography>Loading...</Typography>
        </Box>
      </Paper>
    );
  }
  
  return (
    <Paper sx={{ p: 3, height, width }}>
      <Typography variant="h6" gutterBottom>{title || `Product Engagement: ${data.productName}`}</Typography>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Heatmap showing user engagement intensity
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        mt: 2,
        height: 'calc(100% - 80px)'
      }}>
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: '2px',
          width: '100%',
          height: '100%',
          maxWidth: '600px'
        }}>
          {data.engagementScores.flatMap((row, rowIndex) => 
            row.map((score, colIndex) => {
              const normalizedScore = data.maxScore > 0 ? score / data.maxScore : 0;
              return (
                <Box
                  key={`${rowIndex}-${colIndex}`}
                  sx={{
                    backgroundColor: interpolateColor(normalizedScore),
                    borderRadius: '2px',
                    position: 'relative',
                    '&:hover': {
                      outline: `2px solid ${theme.palette?.primary?.main || '#1890FF'}`,
                      zIndex: 1
                    },
                    '&:hover::after': {
                      content: `'${score}'`,
                      position: 'absolute',
                      top: '-24px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      color: '#FFFFFF',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      zIndex: 2
                    }
                  }}
                />
              );
            })
          )}
        </Box>
        
        {/* Legend */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          mt: 2,
          width: '100%',
          maxWidth: '600px'
        }}>
          <Box sx={{ 
            width: '100%', 
            height: '20px',
            background: `linear-gradient(to right, ${colorRange[0]}, ${colorRange[1]})`,
            borderRadius: '4px'
          }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mt: 1 }}>
            <Typography variant="caption">Low Engagement</Typography>
            <Typography variant="caption">High Engagement</Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default HeatmapChart;