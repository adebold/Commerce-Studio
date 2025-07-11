import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Chip,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  InfoOutlined,
  BarChart,
  SmartToy,
  Visibility,
  ShoppingCart,
  EuroSymbol,
  People,
  Psychology,
  Analytics
} from '@mui/icons-material';

const MetricCard = ({
  title,
  value,
  previousValue,
  isLoading = false,
  formatType = 'number',
  trend = null,
  subtitle = null,
  tooltip = null,
  color = 'primary',
  type = 'general',
  size = 'medium',
  showTrend = true,
  additionalInfo = null,
  onClick = null
}) => {
  // Format the value based on type
  const formatValue = (val, type) => {
    if (val === null || val === undefined) return '-';
    
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'EUR'
        }).format(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'number':
        return new Intl.NumberFormat('en-US').format(val);
      case 'decimal':
        return val.toFixed(2);
      default:
        return val.toString();
    }
  };

  // Calculate trend percentage and direction
  const calculateTrend = () => {
    if (!showTrend || !previousValue || previousValue === 0) return null;
    
    const change = ((value - previousValue) / previousValue) * 100;
    const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'flat';
    
    return {
      percentage: Math.abs(change),
      direction,
      isPositive: change > 0
    };
  };

  // Get icon based on metric type
  const getIcon = () => {
    const iconProps = { fontSize: size === 'small' ? 'small' : 'medium' };
    
    switch (type) {
      case 'revenue':
        return <EuroSymbol {...iconProps} />;
      case 'orders':
        return <ShoppingCart {...iconProps} />;
      case 'users':
        return <People {...iconProps} />;
      case 'ai':
        return <SmartToy {...iconProps} />;
      case 'recommendations':
        return <Psychology {...iconProps} />;
      case 'analytics':
        return <Analytics {...iconProps} />;
      case 'views':
        return <Visibility {...iconProps} />;
      case 'chart':
        return <BarChart {...iconProps} />;
      default:
        return <BarChart {...iconProps} />;
    }
  };

  const trendData = calculateTrend();
  const formattedValue = formatValue(value, formatType);
  const isClickable = onClick !== null;

  const TrendIcon = () => {
    if (!trendData) return null;
    
    const iconProps = { fontSize: 'small', sx: { ml: 0.5 } };
    
    switch (trendData.direction) {
      case 'up':
        return <TrendingUp {...iconProps} color="success" />;
      case 'down':
        return <TrendingDown {...iconProps} color="error" />;
      default:
        return <TrendingFlat {...iconProps} color="disabled" />;
    }
  };

  const cardContent = (
    <CardContent sx={{ 
      p: size === 'small' ? 2 : 3,
      '&:last-child': { pb: size === 'small' ? 2 : 3 }
    }}>
      {/* Header with title and optional tooltip */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          color: `${color}.main`,
          mr: 1 
        }}>
          {getIcon()}
        </Box>
        <Typography 
          variant={size === 'small' ? 'body2' : 'h6'} 
          color="text.secondary"
          sx={{ flexGrow: 1 }}
        >
          {title}
        </Typography>
        {tooltip && (
          <Tooltip title={tooltip} placement="top">
            <IconButton size="small">
              <InfoOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Main value */}
      <Box sx={{ mb: subtitle || trendData ? 1 : 0 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Loading...
            </Typography>
          </Box>
        ) : (
          <Typography 
            variant={size === 'small' ? 'h6' : 'h4'} 
            component="div"
            fontWeight="bold"
            color={`${color}.main`}
          >
            {formattedValue}
          </Typography>
        )}
      </Box>

      {/* Subtitle */}
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {subtitle}
        </Typography>
      )}

      {/* Trend indicator */}
      {trendData && !isLoading && (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Chip
            size="small"
            label={`${trendData.percentage.toFixed(1)}%`}
            color={trendData.isPositive ? 'success' : 'error'}
            variant="outlined"
            sx={{ fontSize: '0.75rem' }}
          />
          <TrendIcon />
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            vs previous period
          </Typography>
        </Box>
      )}

      {/* Additional info */}
      {additionalInfo && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {additionalInfo}
          </Typography>
        </Box>
      )}
    </CardContent>
  );

  return (
    <Card 
      sx={{ 
        height: '100%',
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': isClickable ? {
          transform: 'translateY(-2px)',
          boxShadow: 4
        } : {}
      }}
      onClick={onClick}
    >
      {cardContent}
    </Card>
  );
};

export default MetricCard;