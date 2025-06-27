import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';

interface DateRangeSelectorProps {
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
}

type PresetRange = '7days' | '30days' | '90days' | 'ytd' | 'custom';

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  startDate,
  endDate,
  onChange
}) => {
  const [selectedRange, setSelectedRange] = useState<PresetRange>('30days');
  const [customStartDate, setCustomStartDate] = useState(startDate);
  const [customEndDate, setCustomEndDate] = useState(endDate);
  
  // Handle preset selection
  const handlePresetChange = (event: SelectChangeEvent<PresetRange>) => {
    const value = event.target.value as PresetRange;
    setSelectedRange(value);
    
    if (value !== 'custom') {
      const { start, end } = getPresetDates(value);
      setCustomStartDate(start);
      setCustomEndDate(end);
      onChange(start, end);
    }
  };
  
  // Apply custom date range
  const applyCustomRange = () => {
    onChange(customStartDate, customEndDate);
  };
  
  // Calculate preset date ranges
  const getPresetDates = (preset: PresetRange): { start: string, end: string } => {
    const today = new Date();
    const end = today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    let start: string;
    
    switch (preset) {
      case '7days': {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
        start = sevenDaysAgo.toISOString().split('T')[0];
        break;
      }
        
      case '30days': {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        start = thirtyDaysAgo.toISOString().split('T')[0];
        break;
      }
        
      case '90days': {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(today.getDate() - 90);
        start = ninetyDaysAgo.toISOString().split('T')[0];
        break;
      }
        
      case 'ytd': {
        const yearStart = new Date(today.getFullYear(), 0, 1);
        start = yearStart.toISOString().split('T')[0];
        break;
      }
        
      default:
        start = customStartDate;
    }
    
    return { start, end };
  };
  
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Date Range</Typography>
      
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel id="date-range-preset-label">Preset Range</InputLabel>
            <Select
              labelId="date-range-preset-label"
              id="date-range-preset"
              value={selectedRange}
              label="Preset Range"
              onChange={handlePresetChange}
            >
              <MenuItem value="7days">Last 7 Days</MenuItem>
              <MenuItem value="30days">Last 30 Days</MenuItem>
              <MenuItem value="90days">Last 90 Days</MenuItem>
              <MenuItem value="ytd">Year to Date</MenuItem>
              <MenuItem value="custom">Custom Range</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              label="Start Date"
              type="date"
              size="small"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              disabled={selectedRange !== 'custom'}
              InputLabelProps={{ shrink: true }}
            />
            
            <Typography variant="body2">to</Typography>
            
            <TextField
              label="End Date"
              type="date"
              size="small"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              disabled={selectedRange !== 'custom'}
              InputLabelProps={{ shrink: true }}
            />
            
            {selectedRange === 'custom' && (
              <Button 
                variant="contained" 
                size="small" 
                onClick={applyCustomRange}
                disabled={!customStartDate || !customEndDate}
              >
                Apply
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DateRangeSelector;