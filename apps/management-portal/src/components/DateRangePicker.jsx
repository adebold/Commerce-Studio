import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Chip,
  Stack,
  Typography,
  Popover,
  Paper,
  Divider
} from '@mui/material';
import {
  DateRange,
  Today,
  CalendarToday,
  Schedule
} from '@mui/icons-material';

const DateRangePicker = ({
  startDate,
  endDate,
  onDateRangeChange,
  disabled = false,
  label = "Date Range",
  maxDate = null,
  minDate = null
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setTempStartDate(startDate);
    setTempEndDate(endDate);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleApply = () => {
    onDateRangeChange({
      start: tempStartDate,
      end: tempEndDate
    });
    handleClose();
  };

  const handleCancel = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    handleClose();
  };

  // Quick select options
  const quickSelects = [
    {
      label: 'Today',
      icon: <Today fontSize="small" />,
      getValue: () => {
        const today = new Date().toISOString().split('T')[0];
        return { start: today, end: today };
      }
    },
    {
      label: 'Last 7 days',
      icon: <Schedule fontSize="small" />,
      getValue: () => {
        const end = new Date().toISOString().split('T')[0];
        const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return { start, end };
      }
    },
    {
      label: 'Last 30 days',
      icon: <Schedule fontSize="small" />,
      getValue: () => {
        const end = new Date().toISOString().split('T')[0];
        const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return { start, end };
      }
    },
    {
      label: 'Last 90 days',
      icon: <Schedule fontSize="small" />,
      getValue: () => {
        const end = new Date().toISOString().split('T')[0];
        const start = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return { start, end };
      }
    },
    {
      label: 'This month',
      icon: <CalendarToday fontSize="small" />,
      getValue: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const end = new Date().toISOString().split('T')[0];
        return { start, end };
      }
    },
    {
      label: 'Last month',
      icon: <CalendarToday fontSize="small" />,
      getValue: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
        const end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
        return { start, end };
      }
    }
  ];

  const handleQuickSelect = (getValue) => {
    const { start, end } = getValue();
    setTempStartDate(start);
    setTempEndDate(end);
  };

  // Format date for display
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get display text for the current range
  const getDisplayText = () => {
    if (!startDate || !endDate) return 'Select date range';
    
    const start = formatDisplayDate(startDate);
    const end = formatDisplayDate(endDate);
    
    if (startDate === endDate) {
      return start;
    }
    
    return `${start} - ${end}`;
  };

  // Validate date range
  const isValidRange = () => {
    if (!tempStartDate || !tempEndDate) return false;
    return new Date(tempStartDate) <= new Date(tempEndDate);
  };

  const open = Boolean(anchorEl);

  return (
    <Box>
      <Chip
        icon={<DateRange />}
        label={getDisplayText()}
        onClick={handleOpen}
        disabled={disabled}
        clickable
        variant="outlined"
        sx={{
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'action.hover'
          }
        }}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Paper sx={{ p: 3, minWidth: 400 }}>
          <Typography variant="h6" gutterBottom>
            {label}
          </Typography>

          {/* Quick select buttons */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Quick Select
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {quickSelects.map((option, index) => (
                <Chip
                  key={index}
                  icon={option.icon}
                  label={option.label}
                  size="small"
                  onClick={() => handleQuickSelect(option.getValue)}
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Custom date inputs */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Custom Range
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <TextField
                label="Start Date"
                type="date"
                value={tempStartDate || ''}
                onChange={(e) => setTempStartDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  min: minDate,
                  max: tempEndDate || maxDate
                }}
                size="small"
                fullWidth
              />
              <TextField
                label="End Date"
                type="date"
                value={tempEndDate || ''}
                onChange={(e) => setTempEndDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  min: tempStartDate || minDate,
                  max: maxDate
                }}
                size="small"
                fullWidth
              />
            </Stack>

            {!isValidRange() && tempStartDate && tempEndDate && (
              <Typography variant="caption" color="error">
                End date must be after start date
              </Typography>
            )}
          </Box>

          {/* Action buttons */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={handleCancel} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              variant="contained"
              disabled={!isValidRange()}
            >
              Apply
            </Button>
          </Stack>
        </Paper>
      </Popover>
    </Box>
  );
};

export default DateRangePicker;