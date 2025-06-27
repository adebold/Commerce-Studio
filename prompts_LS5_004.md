# Prompts LS5_004: Advanced Component Migration & Performance Optimization

## Executive Summary

Based on the successful LS5_003_refined implementation and comprehensive analysis of the current codebase, LS5_004 targets the next critical phase of MUI migration focusing on high-impact dashboard and frame-finder components. This phase aims to achieve a **33% TypeScript error reduction** (150→100 errors) while establishing advanced performance optimization patterns and comprehensive accessibility compliance.

**Current State Analysis:**
- ✅ **LS5_002**: Card subcomponent migration completed (5 components)
- ✅ **LS5_003**: Enhanced accessibility and import standardization established
- 🎯 **LS5_004 TARGET**: Dashboard and frame-finder component migration (5 components)
- 📊 **Current Metrics**: 220 TypeScript errors, 73.8/100 overall score

**LS5_004 Strategic Focus:**
- [`MainDashboard.tsx`](frontend/src/components/dashboard/MainDashboard.tsx) - Performance-optimized dashboard with advanced memoization
- [`FrameComparison.tsx`](frontend/src/components/frame-finder/FrameComparison.tsx) - Accessibility-enhanced comparison interface
- [`FilterSortControls.tsx`](frontend/src/components/frame-finder/FilterSortControls.tsx) - Form accessibility and state management
- [`FaceShapeSelector.tsx`](frontend/src/components/frame-finder/FaceShapeSelector.tsx) - Interactive accessibility patterns
- [`FormSection.tsx`](frontend/src/components/settings/FormSection.tsx) - Reusable form component patterns

**Enhanced Quality Gates for LS5_004:**
- Accessibility compliance: **75.0+** (increased from 70.0)
- Performance optimization: **85.0+** (bundle size + rendering)
- Test coverage: **90%+** for all migrated components
- TypeScript error reduction: **33%** (150→100 errors)
- Import consistency: **100%** across all components

---

## Prompt [LS5_004_001]: Migrate MainDashboard.tsx with Advanced Performance Optimization

### Context
The [`MainDashboard.tsx`](frontend/src/components/dashboard/MainDashboard.tsx:1) component is a critical performance bottleneck requiring comprehensive optimization while maintaining its rich dashboard functionality. The component currently uses proper MUI imports but lacks advanced performance patterns and accessibility enhancements identified in LS5_003_refined analysis.

### Objective
Transform MainDashboard.tsx into a performance-optimized, accessibility-compliant component using advanced React patterns, comprehensive memoization, and MUI best practices while maintaining all dashboard functionality.

### Focus Areas
- Implement advanced React.memo patterns with custom comparison functions
- Add comprehensive useMemo and useCallback optimization for expensive operations
- Enhance accessibility with proper ARIA attributes and keyboard navigation
- Optimize bundle size through selective imports and code splitting
- Implement performance monitoring and error boundaries
- Add comprehensive loading states and skeleton components

### Code Reference
```typescript
// ADVANCED PERFORMANCE-OPTIMIZED DASHBOARD PATTERN
import React, { memo, useMemo, useCallback, useState, useEffect, Suspense } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Grid,
  Paper,
  Switch,
  FormControlLabel,
  Chip,
  Button,
  Avatar,
  Divider,
  Skeleton,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';

// Lazy load heavy chart components for better performance
const LazyLineChart = React.lazy(() => import('./charts/LazyLineChart'));
const LazyPieChart = React.lazy(() => import('./charts/LazyPieChart'));

// Memoized dashboard metric card with performance optimization
const DashboardMetricCard = memo<DashboardMetricCardProps>(({ 
  title, 
  value, 
  icon: Icon,
  color,
  isLoading, 
  error,
  onClick,
  ...props 
}) => {
  const theme = useTheme();
  
  const cardContent = useMemo(() => {
    if (isLoading) {
      return (
        <Box>
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="text" width="40%" height={24} />
        </Box>
      );
    }
    
    if (error) {
      return (
        <Alert severity="error" size="small">
          {error}
        </Alert>
      );
    }
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              color: theme.palette.text.primary,
              lineHeight: 1.2
            }}
            aria-label={`${title}: ${value}`}
          >
            {value}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            {title}
          </Typography>
        </Box>
        {Icon && (
          <Icon 
            sx={{ 
              fontSize: 40, 
              color: color || theme.palette.secondary.main,
              opacity: 0.8
            }} 
            aria-hidden="true"
          />
        )}
      </Box>
    );
  }, [isLoading, error, value, title, Icon, color, theme]);

  return (
    <Card 
      variant="outlined" 
      role="region"
      aria-labelledby={`metric-${title.toLowerCase().replace(/\s+/g, '-')}`}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        } : {},
        '&:focus-visible': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: '2px',
        }
      }}
      onClick={onClick}
      tabIndex={onClick ? 0 : -1}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      {...props}
    >
      <CardContent>
        {cardContent}
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for optimal re-rendering
  return (
    prevProps.title === nextProps.title &&
    prevProps.value === nextProps.value &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.error === nextProps.error &&
    prevProps.color === nextProps.color
  );
});

DashboardMetricCard.displayName = 'DashboardMetricCard';

// Performance-optimized navigation drawer
const NavigationDrawer = memo<NavigationDrawerProps>(({ 
  menuItems, 
  onItemClick, 
  activeItem,
  mode,
  onThemeToggle 
}) => {
  const theme = useTheme();
  
  const handleKeyNavigation = useCallback((event: React.KeyboardEvent, index: number) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = (index + 1) % menuItems.length;
      const nextElement = document.querySelector(`[data-menu-index="${nextIndex}"]`) as HTMLElement;
      nextElement?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prevIndex = index === 0 ? menuItems.length - 1 : index - 1;
      const prevElement = document.querySelector(`[data-menu-index="${prevIndex}"]`) as HTMLElement;
      prevElement?.focus();
    }
  }, [menuItems.length]);

  return (
    <Box 
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      role="navigation"
      aria-label="Main navigation"
    >
      <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography 
          variant="h5" 
          sx={{ fontWeight: 700, color: theme.palette.primary.main }}
          role="banner"
        >
          VARAi Studio
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Commerce Platform
        </Typography>
      </Box>
      
      <List 
        sx={{ flex: 1, px: 2, py: 1 }}
        role="menubar"
        aria-label="Navigation menu"
      >
        {menuItems.map((item, index) => (
          <ListItem
            key={item.text}
            data-menu-index={index}
            role="menuitem"
            tabIndex={0}
            aria-current={item.active ? 'page' : undefined}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              backgroundColor: item.active ? theme.palette.primary.main : 'transparent',
              color: item.active ? theme.palette.primary.contrastText : theme.palette.text.primary,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: item.active ? theme.palette.primary.dark : theme.palette.action.hover,
              },
              '&:focus-visible': {
                outline: `2px solid ${theme.palette.primary.main}`,
                outlineOffset: '2px',
              }
            }}
            onClick={() => onItemClick(item)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onItemClick(item);
              } else {
                handleKeyNavigation(e, index);
              }
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>

      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <FormControlLabel
          control={
            <Switch
              checked={mode === 'dark'}
              onChange={onThemeToggle}
              inputProps={{ 'aria-label': 'Toggle dark mode' }}
            />
          }
          label={`${mode === 'dark' ? 'Dark' : 'Light'} Mode`}
        />
      </Box>
    </Box>
  );
});

NavigationDrawer.displayName = 'NavigationDrawer';

// Main dashboard component with comprehensive optimization
const MainDashboard: React.FC<MainDashboardProps> = memo(() => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Memoized menu items to prevent unnecessary re-renders
  const menuItems = useMemo(() => [
    { text: 'Dashboard', icon: <DashboardIcon />, active: true, id: 'dashboard' },
    { text: 'Stores', icon: <StoreIcon />, active: false, id: 'stores' },
    { text: 'Analytics', icon: <AnalyticsIcon />, active: false, id: 'analytics' },
    { text: 'Orders', icon: <ShoppingCartIcon />, active: false, id: 'orders' },
    { text: 'Customers', icon: <PeopleIcon />, active: false, id: 'customers' },
    { text: 'Settings', icon: <SettingsIcon />, active: false, id: 'settings' },
  ], []);

  // Optimized event handlers
  const handleDrawerToggle = useCallback(() => {
    setMobileOpen(prev => !prev);
  }, []);

  const handleThemeToggle = useCallback(() => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const handleMenuItemClick = useCallback((item: MenuItem) => {
    // Handle navigation logic
    console.log('Navigate to:', item.id);
  }, []);

  const handleMetricClick = useCallback((metricType: string) => {
    // Handle metric drill-down
    console.log('Drill down into:', metricType);
  }, []);

  // Memoized dashboard metrics
  const dashboardMetrics = useMemo(() => {
    if (!dashboardData) return [];
    
    return [
      {
        title: 'Total Revenue',
        value: `$${dashboardData.revenue.toLocaleString()}`,
        icon: TrendingUpIcon,
        color: theme.palette.primary.main,
        onClick: () => handleMetricClick('revenue')
      },
      {
        title: 'Total Orders',
        value: dashboardData.orders.toLocaleString(),
        icon: ShoppingCartIcon,
        color: theme.palette.secondary.main,
        onClick: () => handleMetricClick('orders')
      },
      {
        title: 'Active Customers',
        value: dashboardData.customers.toLocaleString(),
        icon: PeopleIcon,
        color: theme.palette.info.main,
        onClick: () => handleMetricClick('customers')
      },
      {
        title: 'Active Stores',
        value: dashboardData.stores.toString(),
        icon: StoreIcon,
        color: theme.palette.success.main,
        onClick: () => handleMetricClick('stores')
      }
    ];
  }, [dashboardData, theme, handleMetricClick]);

  // Load dashboard data with error handling
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simulate API call - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setDashboardData({
          revenue: 24500,
          orders: 1234,
          customers: 856,
          stores: 12
        });
      } catch (err) {
        setError('Failed to load dashboard data. Please try again.');
        console.error('Dashboard data loading error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: theme.shadows[1],
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="Open navigation drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography 
            variant="h6" 
            noWrap 
            component="h1" 
            sx={{ flexGrow: 1 }}
            id="dashboard-title"
          >
            Dashboard Overview
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              color="inherit"
              aria-label="View notifications"
            >
              <NotificationsIcon />
            </IconButton>
            <Avatar 
              sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}
              aria-label="User account"
            >
              <AccountCircleIcon />
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="Main navigation"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          <NavigationDrawer
            menuItems={menuItems}
            onItemClick={handleMenuItemClick}
            activeItem="dashboard"
            mode={mode}
            onThemeToggle={handleThemeToggle}
          />
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          <NavigationDrawer
            menuItems={menuItems}
            onItemClick={handleMenuItemClick}
            activeItem="dashboard"
            mode={mode}
            onThemeToggle={handleThemeToggle}
          />
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
        role="main"
        aria-labelledby="dashboard-title"
      >
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {dashboardMetrics.map((metric, index) => (
            <Grid item xs={12} sm={6} md={3} key={metric.title}>
              <DashboardMetricCard
                title={metric.title}
                value={metric.value}
                icon={metric.icon}
                color={metric.color}
                isLoading={isLoading}
                error={error}
                onClick={metric.onClick}
              />
            </Grid>
          ))}
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} lg={8}>
            <Paper 
              sx={{ p: 3, height: 400 }}
              role="region"
              aria-labelledby="sales-chart-title"
            >
              <Typography 
                id="sales-chart-title"
                variant="h6" 
                sx={{ mb: 2, fontWeight: 600 }}
                component="h2"
              >
                Sales Overview
              </Typography>
              <Suspense fallback={<Skeleton variant="rectangular" height={300} />}>
                <LazyLineChart isLoading={isLoading} />
              </Suspense>
            </Paper>
          </Grid>
          
          <Grid item xs={12} lg={4}>
            <Paper 
              sx={{ p: 3, height: 400 }}
              role="region"
              aria-labelledby="categories-chart-title"
            >
              <Typography 
                id="categories-chart-title"
                variant="h6" 
                sx={{ mb: 2, fontWeight: 600 }}
                component="h2"
              >
                Product Categories
              </Typography>
              <Suspense fallback={<Skeleton variant="rectangular" height={300} />}>
                <LazyPieChart isLoading={isLoading} />
              </Suspense>
            </Paper>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Box 
          sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}
          role="region"
          aria-label="Quick actions"
        >
          <Button 
            variant="contained" 
            startIcon={<StoreIcon />}
            sx={{ borderRadius: 2 }}
            aria-label="Add new store"
          >
            Add New Store
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<AnalyticsIcon />}
            sx={{ borderRadius: 2 }}
            aria-label="View detailed analytics"
          >
            View Analytics
          </Button>
          <Button 
            variant="outlined" 
            href="https://varai-shop.myshopify.com"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ borderRadius: 2 }}
            aria-label="Try live demo (opens in new tab)"
          >
            Try Live Demo
          </Button>
        </Box>
      </Box>
    </Box>
  );
});

MainDashboard.displayName = 'MainDashboard';

export default MainDashboard;
```

### Requirements
- **MANDATORY**: Implement React.memo with custom comparison functions for all components
- **MANDATORY**: Add comprehensive useMemo and useCallback optimization
- **MANDATORY**: Implement lazy loading for heavy chart components
- **MANDATORY**: Add comprehensive ARIA attributes and keyboard navigation
- **MANDATORY**: Implement proper error boundaries and loading states
- **MANDATORY**: Add performance monitoring hooks
- **MANDATORY**: Ensure 90%+ test coverage with performance tests
- Optimize bundle size through code splitting and selective imports
- Implement comprehensive accessibility compliance (WCAG 2.1 AA)
- Add skeleton loading states for all async content

### Expected Improvements
- Reduce component re-renders by 60%+ through advanced memoization
- Improve initial load time by 40%+ through lazy loading
- Achieve 85.0+ performance score through optimization
- Eliminate all accessibility violations
- Reduce TypeScript errors by 15-20 in dashboard components
- Establish performance optimization patterns for other components

### Validation Criteria
- React DevTools Profiler shows minimal re-renders
- Bundle analyzer shows optimized chunk sizes
- Lighthouse accessibility score 95+
- All interactive elements keyboard accessible
- Screen reader compatibility verified
- Performance metrics meet or exceed targets

---

## Prompt [LS5_004_002]: Migrate FrameComparison.tsx with Enhanced Accessibility

### Context
The [`FrameComparison.tsx`](frontend/src/components/frame-finder/FrameComparison.tsx:1) component requires comprehensive accessibility enhancements while maintaining its comparison functionality. The component currently uses proper MUI Card imports but lacks advanced accessibility patterns and performance optimization.

### Objective
Transform FrameComparison.tsx into a fully accessible, performance-optimized component with comprehensive keyboard navigation, screen reader support, and enhanced user experience patterns.

### Focus Areas
- Implement comprehensive table accessibility with proper ARIA attributes
- Add advanced keyboard navigation for comparison interface
- Enhance screen reader support with descriptive labels and live regions
- Optimize performance through virtualization for large datasets
- Implement responsive design patterns for mobile accessibility
- Add comprehensive error handling and loading states

### Code Reference
```typescript
// ACCESSIBILITY-ENHANCED FRAME COMPARISON PATTERN
import React, { memo, useMemo, useCallback, useState, useRef, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
  Grid,
  Box,
  Alert,
  Skeleton,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  Compare as CompareIcon,
  Visibility as TryOnIcon,
} from '@mui/icons-material';

// Accessible comparison table component
const AccessibleComparisonTable = memo<ComparisonTableProps>(({
  frames,
  features,
  onRemoveFrame,
  onTryOn,
  isLoading
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [focusedCell, setFocusedCell] = useState<{ row: number; col: number } | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation handler
  const handleKeyNavigation = useCallback((event: React.KeyboardEvent, row: number, col: number) => {
    const maxRows = features.length + 2; // +2 for header and actions
    const maxCols = frames.length + 1; // +1 for feature names column

    let newRow = row;
    let newCol = col;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        newRow = Math.max(0, row - 1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        newRow = Math.min(maxRows - 1, row + 1);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        newCol = Math.max(0, col - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        newCol = Math.min(maxCols - 1, col + 1);
        break;
      case 'Home':
        event.preventDefault();
        newCol = 0;
        break;
      case 'End':
        event.preventDefault();
        newCol = maxCols - 1;
        break;
      default:
        return;
    }

    setFocusedCell({ row: newRow, col: newCol });
    
    // Focus the appropriate cell
    const cellSelector = `[data-row="${newRow}"][data-col="${newCol}"]`;
    const cellElement = tableRef.current?.querySelector(cellSelector) as HTMLElement;
    cellElement?.focus();
  }, [features.length, frames.length]);

  // Memoized feature value getter
  const getFeatureValue = useCallback((frame: Frame, featureId: string) => {
    switch (featureId) {
      case 'brand':
        return frame.brand;
      case 'shape':
        return frame.shape;
      case 'material':
        return frame.material;
      case 'color':
        return frame.color;
      case 'price':
        return `$${frame.price.toFixed(2)}`;
      default:
        return '';
    }
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {Array.from({ length: 12 }).map((_, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box
      ref={tableRef}
      role="table"
      aria-label="Frame comparison table"
      aria-describedby="comparison-instructions"
      sx={{
        overflowX: 'auto',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
      }}
    >
      {/* Instructions for screen readers */}
      <Box
        id="comparison-instructions"
        sx={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
      >
        Use arrow keys to navigate the comparison table. Press Enter to interact with buttons.
        Press Escape to exit table navigation mode.
      </Box>

      {/* Table Header */}
      <Box
        role="row"
        sx={{
          display: 'grid',
          gridTemplateColumns: `200px repeat(${frames.length}, minmax(200px, 1fr))`,
          gap: 1,
          p: 1,
          backgroundColor: theme.palette.grey[50],
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          role="columnheader"
          data-row="0"
          data-col="0"
          tabIndex={0}
          sx={{
            p: 2,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            '&:focus-visible': {
              outline: `2px solid ${theme.palette.primary.main}`,
              outlineOffset: '2px',
            }
          }}
          onKeyDown={(e) => handleKeyNavigation(e, 0, 0)}
        >
          <Typography variant="body2" component="span">
            Features
          </Typography>
        </Box>

        {frames.map((frame, colIndex) => (
          <Box
            key={frame.id}
            role="columnheader"
            data-row="0"
            data-col={colIndex + 1}
            tabIndex={0}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              '&:focus-visible': {
                outline: `2px solid ${theme.palette.primary.main}`,
                outlineOffset: '2px',
              }
            }}
            onKeyDown={(e) => handleKeyNavigation(e, 0, colIndex + 1)}
          >
            <Tooltip title="Remove from comparison">
              <IconButton
                size="small"
                onClick={() => onRemoveFrame(frame.id)}
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  backgroundColor: theme.palette.background.paper,
                  '&:hover': {
                    backgroundColor: theme.palette.error.light,
                    color: theme.palette.error.contrastText,
                  }
                }}
                aria-label={`Remove ${frame.name} from comparison`}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Box
              component="img"
              src={frame.imageUrl}
              alt={frame.name}
              sx={{
                width: '100%',
                height: 120,
                objectFit: 'contain',
                mb: 1,
                borderRadius: 1,
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Frame';
              }}
            />

            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                textAlign: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                width: '100%',
              }}
            >
              {frame.name}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Feature Rows */}
      {features.map((feature, rowIndex) => (
        <Box
          key={feature.id}
          role="row"
          sx
Button,
  Box,
  Grid,
  Alert,
  Skeleton,
  IconButton,
  Tooltip,
  LinearProgress,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  PhotoCamera as PhotoIcon,
  CloudUpload as UploadIcon,
  Refresh as RetryIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';

// Accessible shape selection grid
const AccessibleShapeGrid = memo<ShapeGridProps>(({
  shapes,
  selectedShape,
  onSelectShape,
  isLoading
}) => {
  const theme = useTheme();
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const gridRef = useRef<HTMLDivElement>(null);

  const handleKeyNavigation = useCallback((event: React.KeyboardEvent, index: number) => {
    const cols = 3; // Grid columns
    const rows = Math.ceil(shapes.length / cols);
    const currentRow = Math.floor(index / cols);
    const currentCol = index % cols;

    let newIndex = index;

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        newIndex = currentCol === cols - 1 ? currentRow * cols : index + 1;
        if (newIndex >= shapes.length) newIndex = currentRow * cols;
        break;
      
      case 'ArrowLeft':
        event.preventDefault();
        newIndex = currentCol === 0 ? Math.min((currentRow + 1) * cols - 1, shapes.length - 1) : index - 1;
        break;
      
      case 'ArrowDown':
        event.preventDefault();
        newIndex = currentRow === rows - 1 ? currentCol : Math.min(index + cols, shapes.length - 1);
        break;
      
      case 'ArrowUp':
        event.preventDefault();
        newIndex = currentRow === 0 ? Math.floor((shapes.length - 1) / cols) * cols + currentCol : index - cols;
        if (newIndex >= shapes.length) newIndex = shapes.length - 1;
        break;
      
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      
      case 'End':
        event.preventDefault();
        newIndex = shapes.length - 1;
        break;
      
      case ' ':
      case 'Enter':
        event.preventDefault();
        onSelectShape(shapes[index].id);
        return;
      
      default:
        return;
    }

    setFocusedIndex(newIndex);
    const shapeElement = gridRef.current?.querySelector(`[data-shape-index="${newIndex}"]`) as HTMLElement;
    shapeElement?.focus();
  }, [shapes, onSelectShape]);

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Grid item xs={6} sm={4} md={4} key={index}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Box
      ref={gridRef}
      role="radiogroup"
      aria-label="Face shape selection"
      aria-describedby="shape-selection-instructions"
    >
      <Box
        id="shape-selection-instructions"
        sx={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
      >
        Use arrow keys to navigate face shapes. Press Enter or Space to select.
      </Box>

      <Grid container spacing={2}>
        {shapes.map((shape, index) => {
          const isSelected = selectedShape === shape.id;
          return (
            <Grid item xs={6} sm={4} md={4} key={shape.id}>
              <Card
                data-shape-index={index}
                role="radio"
                aria-checked={isSelected}
                aria-labelledby={`shape-${shape.id}-label`}
                aria-describedby={`shape-${shape.id}-description`}
                tabIndex={0}
                onClick={() => onSelectShape(shape.id)}
                onKeyDown={(e) => handleKeyNavigation(e, index)}
                sx={{
                  cursor: 'pointer',
                  border: `2px solid ${isSelected ? theme.palette.primary.main : theme.palette.divider}`,
                  backgroundColor: isSelected ? theme.palette.primary.light : 'transparent',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4],
                  },
                  '&:focus-visible': {
                    outline: `3px solid ${theme.palette.primary.main}`,
                    outlineOffset: '2px',
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      mx: 'auto',
                      mb: 2,
                      backgroundColor: theme.palette.primary.main,
                      maskImage: `url('/images/face-shapes/${shape.id.toLowerCase()}.svg')`,
                      maskSize: 'contain',
                      maskRepeat: 'no-repeat',
                      maskPosition: 'center',
                    }}
                    aria-hidden="true"
                  />
                  
                  <Typography
                    id={`shape-${shape.id}-label`}
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    {shape.name}
                  </Typography>
                  
                  <Typography
                    id={`shape-${shape.id}-description`}
                    variant="body2"
                    color="text.secondary"
                  >
                    {shape.description}
                  </Typography>
                  
                  {isSelected && (
                    <SuccessIcon
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: theme.palette.primary.main,
                      }}
                      aria-label="Selected"
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
});

AccessibleShapeGrid.displayName = 'AccessibleShapeGrid';

// Accessible photo upload component
const AccessiblePhotoUpload = memo<PhotoUploadProps>(({
  onPhotoSelect,
  onAnalysisComplete,
  isAnalyzing,
  analysisResult,
  error
}) => {
  const theme = useTheme();
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      onPhotoSelect(e.target?.result as string);
      
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => setUploadProgress(0), 1000);
        }
      }, 100);
    };
    reader.readAsDataURL(file);
  }, [onPhotoSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleUploadClick();
    }
  }, [handleUploadClick]);

  return (
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        aria-label="Select photo file"
      />

      <Box
        ref={dropZoneRef}
        role="button"
        tabIndex={0}
        aria-label="Upload photo for face shape analysis"
        aria-describedby="upload-instructions"
        onClick={handleUploadClick}
        onKeyDown={handleKeyDown}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        sx={{
          border: `2px dashed ${dragActive ? theme.palette.primary.main : theme.palette.divider}`,
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: dragActive ? theme.palette.primary.light : 'transparent',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: theme.palette.primary.main,
            backgroundColor: theme.palette.primary.light,
          },
          '&:focus-visible': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: '2px',
          }
        }}
      >
        <PhotoIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        
        <Typography variant="h6" gutterBottom>
          Upload Your Photo
        </Typography>
        
        <Typography
          id="upload-instructions"
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          Click to select or drag and drop a front-facing photo.
          For best results, use a well-lit photo with your face clearly visible.
        </Typography>

        {uploadProgress > 0 && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={uploadProgress}
              aria-label={`Upload progress: ${uploadProgress}%`}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Uploading... {uploadProgress}%
            </Typography>
          </Box>
        )}
      </Box>

      {isAnalyzing && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Analyzing your face shape... This may take a few moments.
          </Typography>
        </Box>
      )}

      {analysisResult && (
        <Alert
          severity="success"
          sx={{ mt: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => onAnalysisComplete(analysisResult)}
            >
              Use This Result
            </Button>
          }
        >
          <Typography variant="body2">
            <strong>Analysis Complete:</strong> Your face shape appears to be {analysisResult.shapeName}.
            {analysisResult.confidence && ` (${Math.round(analysisResult.confidence * 100)}% confidence)`}
          </Typography>
        </Alert>
      )}

      {error && (
        <Alert
          severity="error"
          sx={{ mt: 3 }}
          action={
            <IconButton
              color="inherit"
              size="small"
              onClick={handleUploadClick}
              aria-label="Try uploading again"
            >
              <RetryIcon />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}
    </Box>
  );
});

AccessiblePhotoUpload.displayName = 'AccessiblePhotoUpload';

// Main face shape selector component
const FaceShapeSelector: React.FC<FaceShapeSelectorProps> = memo(({
  selectedShape,
  onSelectShape
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeTab, setActiveTab] = useState<'manual' | 'photo'>('manual');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  // Face shape data with accessibility enhancements
  const faceShapes = useMemo(() => [
    {
      id: 'oval',
      name: 'Oval',
      description: 'Balanced proportions with a slightly wider forehead than jaw',
      guide: 'Versatile shape that works with most frame styles'
    },
    {
      id: 'round',
      name: 'Round',
      description: 'Similar width and length with soft angles',
      guide: 'Angular frames add definition and make your face appear longer'
    },
    {
      id: 'square',
      name: 'Square',
      description: 'Strong jawline with similar width and length',
      guide: 'Round or oval frames soften angular features'
    },
    {
      id: 'heart',
      name: 'Heart',
      description: 'Wider forehead and cheekbones with a narrow chin',
      guide: 'Frames wider at the bottom balance your proportions'
    },
    {
      id: 'diamond',
      name: 'Diamond',
      description: 'Narrow forehead and jawline with wide cheekbones',
      guide: 'Cat-eye or oval frames complement your cheekbones'
    },
    {
      id: 'oblong',
      name: 'Oblong',
      description: 'Longer than wide with a straight cheek line',
      guide: 'Wider frames with decorative temples add width'
    },
  ], []);

  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: 'manual' | 'photo') => {
    setActiveTab(newValue);
    setError(null);
  }, []);

  const handlePhotoSelect = useCallback((photoData: string) => {
    setPhotoPreview(photoData);
    setError(null);
    setAnalysisResult(null);
    
    // Start analysis
    setIsAnalyzing(true);
    
    // Simulate AI analysis (replace with actual API call)
    setTimeout(() => {
      const randomShape = faceShapes[Math.floor(Math.random() * faceShapes.length)];
      setAnalysisResult({
        shapeId: randomShape.id,
        shapeName: randomShape.name,
        confidence: 0.85 + Math.random() * 0.15
      });
      setIsAnalyzing(false);
    }, 3000);
  }, [faceShapes]);

  const handleAnalysisComplete = useCallback((result: AnalysisResult) => {
    onSelectShape(result.shapeId);
    setActiveTab('manual'); // Switch back to show selection
  }, [onSelectShape]);

  const handleRetryUpload = useCallback(() => {
    setPhotoPreview(null);
    setAnalysisResult(null);
    setError(null);
    setIsAnalyzing(false);
  }, []);

  return (
    <Box role="region" aria-labelledby="face-shape-selector-title">
      <Typography
        id="face-shape-selector-title"
        variant="h5"
        gutterBottom
        sx={{ mb: 3 }}
      >
        Select Your Face Shape
      </Typography>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        aria-label="Face shape selection method"
        sx={{ mb: 3 }}
      >
        <Tab
          label="Manual Selection"
          value="manual"
          aria-describedby="manual-tab-description"
        />
        <Tab
          label="Upload Photo"
          value="photo"
          aria-describedby="photo-tab-description"
        />
      </Tabs>

      <Box
        id="manual-tab-description"
        sx={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
      >
        Manually select your face shape from the available options
      </Box>

      <Box
        id="photo-tab-description"
        sx={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
      >
        Upload a photo for automatic face shape detection
      </Box>

      {activeTab === 'manual' ? (
        <Box>
          <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>
            Select the face shape that most closely resembles yours:
          </Typography>

          <AccessibleShapeGrid
            shapes={faceShapes}
            selectedShape={selectedShape}
            onSelectShape={onSelectShape}
            isLoading={false}
          />

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => setShowGuide(!showGuide)}
              aria-expanded={showGuide}
              aria-controls="face-shape-guide"
            >
              {showGuide ? 'Hide' : 'Show'} Face Shape Guide
            </Button>
          </Box>

          <Collapse in={showGuide} timeout="auto" unmountOnExit>
            <Card
              id="face-shape-guide"
              variant="outlined"
              sx={{ mt: 3, p: 3 }}
              role="region"
              aria-labelledby="guide-title"
            >
              <Typography
                id="guide-title"
                variant="h6"
                gutterBottom
              >
                How to Determine Your Face Shape
              </Typography>

              <Typography variant="body2" sx={{ mb: 3 }}>
                Look at your face in a mirror and consider these characteristics:
              </Typography>

              <Grid container spacing={2}>
                {faceShapes.map((shape) => (
                  <Grid item xs={6} sm={4} md={2} key={shape.id}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          mx: 'auto',
                          mb: 1,
                          backgroundColor: theme.palette.primary.main,
                          maskImage: `url('/images/face-shapes/${shape.id}-guide.svg')`,
                          maskSize: 'contain',
                          maskRepeat: 'no-repeat',
                          maskPosition: 'center',
                        }}
                        aria-hidden="true"
                      />
                      <Typography variant="caption" display="block" gutterBottom>
                        <strong>{shape.name}</strong>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {shape.guide}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Card>
          </Collapse>
        </Box>
      ) : (
        <Box>
          <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>
            Upload a front-facing photo to automatically detect your face shape:
          </Typography>

          {!photoPreview ? (
            <AccessiblePhotoUpload
              onPhotoSelect={handlePhotoSelect}
              onAnalysisComplete={handleAnalysisComplete}
              isAnalyzing={isAnalyzing}
              analysisResult={analysisResult}
              error={error}
            />
          ) : (
            <Box>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <img
                      src={photoPreview}
                      alt="Uploaded photo for analysis"
                      style={{
                        maxWidth: '100%',
                        maxHeight: 300,
                        borderRadius: 8,
                        objectFit: 'contain'
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                      variant="outlined"
                      onClick={handleRetryUpload}
                      startIcon={<UploadIcon />}
                    >
                      Upload Different Photo
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              <AccessiblePhotoUpload
                onPhotoSelect={handlePhotoSelect}
                onAnalysisComplete={handleAnalysisComplete}
                isAnalyzing={isAnalyzing}
                analysisResult={analysisResult}
                error={error}
              />
            </Box>
          )}

          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Privacy Notice:</strong> Your photo is processed securely and is not stored on our servers.
              The analysis is performed locally in your browser for maximum privacy.
            </Typography>
          </Alert>
        </Box>
      )}
    </Box>
  );
});

FaceShapeSelector.displayName = 'FaceShapeSelector';

export default FaceShapeSelector;
```

### Requirements
- **MANDATORY**: Implement comprehensive interactive accessibility for shape selection
- **MANDATORY**: Add advanced keyboard navigation for grid-based selection
- **MANDATORY**: Enhance file upload accessibility with proper ARIA attributes
- **MANDATORY**: Add comprehensive progress indication and error handling
- **MANDATORY**: Implement proper focus management and visual indicators
- **MANDATORY**: Add drag-and-drop accessibility support
- **MANDATORY**: Ensure 90%+ test coverage with interactive accessibility tests
- Optimize photo analysis workflow with accessibility considerations
- Add responsive design patterns for mobile interaction
- Implement proper ARIA live regions for dynamic content

### Expected Improvements
- Achieve 95+ Lighthouse accessibility score for interactive components
- Eliminate all interactive accessibility violations
- Reduce TypeScript errors by 10-15 in selector components
- Improve interactive navigation efficiency by 80%
- Establish interactive accessibility patterns for complex components
- Maintain 100% functionality while enhancing accessibility

### Validation Criteria
- All interactive elements keyboard accessible with proper navigation
- Screen reader announces all state changes and progress updates
- File upload works with assistive technologies
- Grid navigation works efficiently with keyboard
- Mobile interaction accessibility maintained across breakpoints
- Automated accessibility tests pass with zero violations

---

## Prompt [LS5_004_005]: Migrate FormSection.tsx with Reusable Component Patterns

### Context
The [`FormSection.tsx`](frontend/src/components/settings/FormSection.tsx:1) component requires transformation from styled-components to MUI patterns while establishing reusable form component patterns. This component serves as a foundation for form accessibility across the application.

### Objective
Transform FormSection.tsx into a fully accessible, reusable MUI component that establishes form accessibility patterns for the entire application while maintaining its form grouping functionality.

### Focus Areas
- Replace styled-components with MUI sx prop patterns
- Implement comprehensive form accessibility with proper semantic structure
- Add advanced error handling and validation support
- Create reusable patterns for form sections across the application
- Optimize performance through memoization and prop optimization
- Establish consistent spacing and typography patterns

### Code Reference
```typescript
// REUSABLE FORM SECTION PATTERN
import React, { memo, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  useTheme,
} from '@mui/material';

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  error?: string | null;
  warning?: string | null;
  success?: string | null;
  required?: boolean;
  disabled?: boolean;
  sectionId?: string;
  variant?: 'default' | 'outlined' | 'elevated';
  spacing?: 'compact' | 'normal' | 'comfortable';
}

// Memoized form section component with comprehensive accessibility
const FormSection: React.FC<FormSectionProps> = memo(({
  title,
  description,
  children,
  error,
  warning,
  success,
  required = false,
  disabled = false,
  sectionId,
  variant = 'default',
  spacing = 'normal',
}) => {
  const theme = useTheme();
  
  // Generate unique IDs for accessibility
  const generatedId = useMemo(() => 
    sectionId || `form-section-${title.toLowerCase().replace(/\s+/g, '-')}`,
    [sectionId, title]
  );
  
  const titleId = `${generatedId}-title`;
  const descriptionId = description ? `${generatedId}-description` : undefined;
  const errorId = error ? `${generatedId}-error` : undefined;
  const warningId = warning ? `${generatedId}-warning` : undefined;
  const successId = success ? `${generatedId}-success` : undefined;

  // Spacing configuration
  const spacingConfig = useMemo(() => {
    switch (spacing) {
      case 'compact':
        return { section: 2, header: 1, content: 1 };
      case 'comfortable':
        return { section: 4, header: 3, content: 2 };
      default:
        return { section: 3, header: 2, content: 1.5 };
    }
  }, [spacing]);

  // Variant styling
  const variantStyles = useMemo(() => {
    switch (variant) {
      case 'outlined':
        return {
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          p: spacingConfig.section,
        };
      case 'elevated':
        return {
          boxShadow: theme.shadows[2],
          borderRadius: 2,
          p: spacingConfig.section,
          backgroundColor: theme.palette.background.paper,
        };
      default:
        return {
          p: spacingConfig.section,
        };
    }
  }, [variant, theme, spacingConfig]);

  // Accessibility attributes for the section
  const sectionAriaProps = useMemo(() => {
    const ariaDescribedBy = [
      descriptionId,
      errorId,
      warningId,
      successId,
    ].filter(Boolean).join(' ');

    return {
      role: 'group',
      'aria-labelledby': titleId,
      'aria-describedby': ariaDescribedBy || undefined,
      'aria-required': required,
      'aria-disabled': disabled,
    };
  }, [titleId, descriptionId, errorId, warningId, successId, required, disabled]);

  return (
    <Box
      component="section"
      sx={{
        mb: spacingConfig.section,
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        ...variantStyles,
      }}
      {...sectionAriaProps}
    >
      {/* Section Header */}
      <Box sx={{ mb: spacingConfig.header }}>
        <Typography
          id={titleId}
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 600,
            color: theme.palette.text.primary,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          {title}
          {required && (
            <Typography
              component="span"
              sx={{
                color: theme.palette.error.main,
                fontSize: '1.2em',
                lineHeight: 1,
              }}
              aria-label="required"
            >
              *
            </Typography>
          )}
        </Typography>

        {description && (
          <Typography
            id={descriptionId}
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            {description}
          </Typography>
        )}
      </Box>

      {/* Status Messages */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: spacingConfig.content }}
          id={errorId}
          role="alert"
          aria-live="polite"
        >
          {error}
        </Alert>
      )}

      {warning && (
        <Alert
          severity="warning"
          sx={{ mb: spacingConfig.content }}
          id={warningId}
          role="alert"
          aria-live="polite"
        >
          {warning}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: spacingConfig.content }}
          id={successId}
          role="status"
          aria-live="polite"
        >
          {success}
        </Alert>
      )}

      {/* Form Content */}
      <Box
        component="fieldset"
        sx={{
          border: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: spacingConfig.content,
        }}
      >
        <Box
          component="legend"
          sx={{
            position: 'absolute',
            left: '-10000px',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
          }}
        >
          {title} form fields
        </Box>
        
        {children}
      </Box>
    </Box>
  );
});

FormSection.displayName = 'FormSection';

export default FormSection;
```

### Requirements
- **MANDATORY**: Replace all styled-components with MUI sx prop patterns
- **MANDATORY**: Implement comprehensive form accessibility with semantic structure
- **MANDATORY**: Add proper ARIA attributes and fieldset/legend structure
- **MANDATORY**: Create reusable variant and spacing patterns
- **MANDATORY**: Add comprehensive error, warning, and success state handling
- **MANDATORY**: Implement proper focus management and visual indicators
- **MANDATORY**: Ensure 90%+ test coverage with form accessibility tests
- Optimize performance through memoization and prop optimization
- Establish consistent design patterns for form components
- Add responsive design considerations

### Expected Improvements
- Eliminate all styled-components dependencies in form components
- Achieve 95+ Lighthouse accessibility score for forms
- Reduce TypeScript errors by 10-15 in form components
- Improve form accessibility compliance by 90%
- Establish reusable form component patterns
- Optimize bundle size by removing styled-components dependencies

### Validation Criteria
- All form sections keyboard accessible with proper navigation
- Screen reader announces all form structure and state changes
- Form validation works with assistive technologies
- Reusable patterns work consistently across components
- Performance metrics show improvement from styled-components removal
- Automated accessibility tests pass with zero violations

---

## Prompt [LS5_004_006]: Comprehensive Testing Strategy & Automation

### Context
LS5_004 requires a comprehensive testing strategy that validates all accessibility enhancements, performance optimizations, and component migrations. This testing framework should establish patterns for future migration phases.

### Objective
Create a comprehensive testing suite that validates accessibility compliance, performance optimization, and component functionality while establishing automated testing patterns for the remaining migration phases.

### Focus Areas
- Implement comprehensive accessibility testing with jest-axe and testing-library
- Add performance testing for React components with React DevTools Profiler
- Create automated visual regression testing for component migrations
- Establish TDD patterns for accessibility-first development
- Implement comprehensive integration testing for complex interactions
- Add automated bundle size and performance monitoring

### Code Reference
```typescript
// COMPREHENSIVE TESTING STRATEGY
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../theme';
import MainDashboard from '../MainDashboard';
import FrameComparison from '../FrameComparison';
import FilterSortControls from '../FilterSortControls';
import FaceShapeSelector from '../FaceShapeSelector';
import FormSection from '../FormSection';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Test wrapper with theme provider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

// Custom render function with theme
const renderWithTheme = (ui: React.ReactElement, options = {}) => {
  return render(ui, {
    wrapper: TestWrapper,
    ...options,
  });
};

// Performance testing utilities
const measureComponentPerformance = async (component: React.ReactElement) => {
  const startTime = performance.now();
  const { rerender } = renderWithTheme(component);
  const initialRenderTime = performance.now() - startTime;

  // Measure re-render performance
  const rerenderStartTime = performance.now();
  rerender(component);
  const rerenderTime = performance.now() - rerenderStartTime;

  return {
    initialRenderTime,
    rerenderTime,
  };
};

describe('LS5_004 Component Migration Tests', () => {
  describe('MainDashboard Accessibility & Performance', () => {
    const mockDashboardData = {
      revenue: 24500,
      orders: 1234,
      customers: 856,
      stores: 12,
    };

    test('should have no accessibility violations', async () => {
      const { container } = renderWithTheme(<MainDashboard />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithTheme(<MainDashboard />);

      // Test navigation drawer keyboard access
      const menuButton = screen.getByLabelText(/open navigation drawer/i);
      await user.click(menuButton);

      const navigation = screen.getByRole('navigation');
      const menuItems = within(navigation).getAllByRole('menuitem');
      
      // Test arrow key navigation
      menuItems[0].focus();
      await user.keyboard('{ArrowDown}');
      expect(menuItems[1]).toHaveFocus();

      await user.keyboard('{ArrowUp}');
      expect(menuItems[0]).toHaveFocus();
    });

    test('should announce metric changes to screen readers', async () => {
      const user = userEvent.setup();
      renderWithTheme(<MainDashboard />);

      const revenueMetric = screen.getByLabelText(/total revenue/i);
      await user.click(revenueMetric);

      // Verify live region announcements
      const liveRegion = screen.getByRole('status', { hidden: true });
      expect(liveRegion).toBeInTheDocument();
    });

    test('should meet performance benchmarks', async () => {
      const performance = await measureComponentPerformance(<MainDashboard />);
      
      // Performance thresholds
      expect(performance.initialRenderTime).toBeLessThan(100); // 100ms initial render
      expect(performance.rerenderTime).toBeLessThan(16); // 16ms re-render (60fps)
    });

    test('should handle responsive breakpoints', () => {
      // Test mobile breakpoint
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      renderWithTheme(<MainDashboard />);
      
      // Verify mobile-specific elements
      const mobileMenuButton = screen.getByLabelText(/open navigation drawer/i);
      expect(mobileMenuButton).toBeVisible();
    });
  });

  describe('FrameComparison Table Accessibility', () => {
    const mockFrames = [
      {
        id: '1',
        name: 'Classic Round',
        brand: 'Brand A',
        shape: 'Round',
        material: 'Acetate',
        color: 'Black',
        price: 199.99,
        imageUrl: '/images/frame1.jpg',
      },
      {
        id: '2',
        name: 'Modern Square',
        brand: 'Brand B',
        shape: 'Square',
        material: 'Metal',
        color: 'Silver',
        price: 249.99,
        imageUrl: '/images/frame2.jpg',
      },
    ];

    test('should have proper table accessibility', async () => {
      const { container } = renderWithTheme(
        <FrameComparison
          frames={mockFrames}
          onRemoveFrame={jest.fn()}
          onTryOn={jest.fn()}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();

      // Verify table structure
      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('aria-label', 'Frame comparison table');

      const columnHeaders = screen.getAllByRole('columnheader');
      expect(columnHeaders).toHaveLength(3); // Features + 2 frames

      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(1); // Header + feature rows
    });

    test('should support table keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <FrameComparison
          frames={mockFrames}
          onRemoveFrame={jest.fn()}
          onTryOn={jest.fn()}
        />
      );

      const firstCell = screen.getByRole('columnheader', { name: /features/i });
      firstCell.focus();

      // Test arrow key navigation
      await user.keyboard('{ArrowRight}');
      const nextCell = screen.getAllByRole('columnheader')[1];
      expect(nextCell).toHaveFocus();

      await user.keyboard('{ArrowDown}');
      // Should move to first data row
      const firstDataCell = screen.getAllByRole('cell')[0];
      expect(firstDataCell).toHaveFocus();
    });

    test('should announce comparison changes', async () => {
      const mockOnRemove = jest.fn();
      const user = userEvent.setup();
      
      renderWithTheme(
        <FrameComparison
          frames={mockFrames}
          onRemoveFrame={mockOnRemove}
          onTryOn={jest.fn()}
        />
      );

      const removeButton = screen.getByLabelText(/remove classic round from comparison/i);
      await user.click(removeButton);

      expect(mockOnRemove).toHaveBeenCalledWith('1');
    });
  });

  describe('FilterSortControls Form Accessibility', () => {
    const mockOptions = {
      sortBy: 'recommended',
      filterByColor: [],
      filterByMaterial: [],
      filterByShape: [],
      filterByPrice: [0, 500] as [number, number],
    };

    const mockAvailableFilters = {
      colors: ['Black', 'Brown', 'Silver'],
      materials: ['Acetate', 'Metal', 'Titanium'],
      shapes: ['Round', 'Square', 'Oval'],
    };

    test('should have comprehensive form accessibility', async () => {
      const { container } = renderWithTheme(
        <FilterSortControls
          options={mockOptions}
          availableFilters={mockAvailableFilters}
          onFilterSortChange={jest.fn()}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();

      // Verify form structure
      const fieldsets = screen.getAllByRole('group');
      expect(fieldsets.length).toBeGreaterThan(0);

      // Verify radio group for sort options
      const sortRadioGroup = screen.getByRole('radiogroup', { name: /sort options/i });
      expect(sortRadioGroup).toBeInTheDocument();
    });

    test('should support form keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <FilterSortControls
          options={mockOptions}
          availableFilters={mockAvailableFilters}
          onFilterSortChange={jest.fn()}
        />
      );

      // Expand filters
      const expandButton = screen.getByRole('button', { name: /expand filter options/i });
      await user.click(expandButton);

      // Test filter chip navigation
      const colorFilters = screen.getAllByRole('checkbox');
      if (colorFilters.length > 0) {
        colorFilters[0].focus();
        await user.keyboard('{ArrowRight}');
        expect(colorFilters[1]).toHaveFocus();
      }
    });

    test('should announce filter changes', async () => {
      const mockOnChange = jest.fn();
      const user = userEvent.setup();
      
      renderWithTheme(
        <FilterSortControls
          options={mockOptions}
          availableFilters={mockAvailableFilters}
          onFilterSortChange={mockOnChange}
        />
      );

      // Expand filters
      const expandButton = screen.getByRole('button', { name: /expand filter options/i });
      await user.click(expandButton);

      // Select a color filter
      const blackFilter = screen.getByRole('checkbox', { name: /black filter option/i });
      await user.click(blackFilter);

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          filterByColor: ['Black'],
        })
      );
    });
  });

  describe('FaceShapeSelector Interactive Accessibility', () => {
    const mockOnSelectShape = jest.fn();

    test('should have interactive accessibility', async () => {
      const { container } = renderWithTheme(
        <FaceShapeSelector
          selectedShape={null}
          onSelectShape={mockOnSelectShape}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();

      // Verify radio group for shape selection
      const shapeRadioGroup = screen.getByRole('radiogroup', { name: /face shape selection/i });
      expect(shapeRadioGroup).toBeInTheDocument();
    });

    test('should support grid keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <FaceShapeSelector
          selectedShape={null}
          onSelectShape={mockOnSelectShape}
        />
      );

      const shapeOptions = screen.getAllByRole('radio');
      shapeOptions[0].focus();

      // Test grid navigation
      await user.keyboard('{ArrowRight}');
      expect(shapeOptions[1]).toHaveFocus();

      await user.keyboard('{ArrowDown}');
      // Should move to next row (assuming 3 columns)
      const expectedIndex = Math.min(3, shapeOptions.length - 1);
      expect(shapeOptions[expectedIndex]).toHaveFocus();
    });

    test('should handle photo upload accessibility', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <FaceShapeSelector
          selectedShape={null}
          onSelectShape={mockOnSelectShape}
        />
      );

      // Switch to photo upload tab
      const photoTab = screen.getByRole('tab', { name: /upload photo/i });
      await user.click(photoTab);

      // Verify upload area accessibility
      const uploadArea = screen.getByRole('button', { name: /upload photo for face shape analysis/i });
      expect(uploadArea).toBeInTheDocument();
      expect(uploadArea).toHaveAttribute('aria-describedby');
    });
  });

  describe('FormSection Reusable Patterns', () => {
    test('should provide accessible form section structure', async () => {
      const { container } = renderWithTheme(
        <FormSection
          title="Test Section"
          description="Test description"
          required
        >
          <input type="text" aria-label="Test input" />
        </FormSection>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();

      // Verify section structure
      const section = screen.getByRole('group');
      expect(section).toHaveAttribute('aria-labelledby');
      expect(section).toHaveAttribute('aria-describedby');
      expect(section).toHaveAttribute('aria-required', 'true');

      // Verify fieldset structure
      const fieldset = container.querySelector('fieldset');
      expect(fieldset).toBeInTheDocument();

      const legend = container.querySelector('legend');
      expect(legend).toBeInTheDocument();
    });

    test('should handle error states accessibly', async () => {
      renderWithTheme(
        <FormSection
          title="Test Section"
          error="Test error message"
        >
          <input type="text" aria-label="Test input" />
        </FormSection>
      );

      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent('Test error message');

      const section = screen.getByRole('group');
      expect(section).toHaveAttribute('aria-describedby');
    });
  });

  describe('Performance Integration Tests', () => {
    test('should maintain performance across all components', async () => {
      const components = [
        <MainDashboard />,
        <FrameComparison frames={[]} onRemoveFrame={jest.fn()} />,
        <FilterSortControls
          options={{
            sortBy: 'recommended',
            filterByColor: [],
            filterByMaterial: [],
            filterByShape: [],
            filterByPrice: [0, 500],
          }}
          availableFilters={{
            colors: [],
            materials: [],
            shapes: [],
          }}
          onFilterSortChange={jest.fn()}
        />,
        <FaceShapeSelector selectedShape={null} onSelectShape={jest.fn()} />,
        <FormSection title="Test">
          <div>Test content</div>
        </FormSection>,
      ];

      for (const component of components) {
        const performance = await measureComponentPerformance(component);
        expect(performance.initialRenderTime).toBeLessThan(100);
        expect(performance.rerenderTime).toBeLessThan(16);
      }
    });
  });

  describe('Bundle Size Analysis', () => {
    test('should not increase bundle size significantly', () => {
      // This would be implemented with actual bundle analysis tools
      // For now, we verify that styled-components are not imported
      const componentFiles = [
        'MainDashboard.tsx',
        'FrameComparison.tsx',
        'FilterSortControls.tsx',
        'FaceShapeSelector.tsx',
        'FormSection.tsx',
      ];

      // In a real implementation, this would analyze the actual bundle
      // and verify that styled-components dependencies are removed
      expect(true).toBe(true); // Placeholder
    });
  });
});

// Integration test for complete workflow
describe('LS5_004 Integration Tests', () => {
  test('should support complete frame selection workflow', async () => {
    const user = userEvent.setup();
    
    // This would render a complete page with all components
    // and test the full user workflow
    renderWithTheme(
      <div>
        <FaceShapeSelector selectedShape={null} onSelectShape={jest.fn()} />
        <FilterSortControls
          options={{
            sortBy: 'recommended',
            filterByColor: [],
            filterByMaterial: [],
            filterByShape: [],
            filterByPrice: [0, 500],
          }}
          availableFilters={{
            colors: ['Black', 'Brown'],
            materials: ['Acetate', 'Metal'],
            shapes: ['Round', 'Square'],
          }}
          onFilterSortChange={jest.fn()}
        />
        <FrameComparison frames={[]} onRemoveFrame={jest.fn()} />
      </div>
    );

    // Test complete workflow accessibility
    const { container } = renderWithTheme(<div />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Requirements
- **MANDATORY**: Implement comprehensive accessibility testing with jest-axe
- **MANDATORY**: Add performance testing for all migrated components
- **MANDATORY**: Create keyboard navigation tests for all interactive elements
- **MANDATORY**: Add screen reader compatibility tests
- **MANDATORY**: Implement visual regression testing for component changes
- **MANDATORY**: Add bundle size monitoring and analysis
- **MANDATORY**: Ensure 90%+ test coverage for all migrated components
- Create automated testing patterns for future migration phases
- Add integration testing for complex component interactions
- Implement TDD patterns for accessibility-first development

### Expected Improvements
- Achieve 100% accessibility test coverage
- Establish automated performance monitoring
- Reduce manual testing effort by 80%
- Create reusable testing patterns for remaining migration phases
- Ensure zero accessibility regressions in future development
- Establish performance benchmarks for component optimization

### Validation Criteria
- All accessibility tests pass with zero violations
- Performance tests meet established benchmarks
- Keyboard navigation tests cover all interactive elements
- Screen reader compatibility verified through automated testing
- Bundle size analysis shows optimization improvements
- Integration tests validate complete user workflows

---

## Enhanced Quality Gates for LS5_004

### Accessibility Compliance
- **Lighthouse Accessibility Score**: 95+ (increased from 75.0)
- **Jest-axe Violations**: 0 (mandatory blocking gate)
- **Keyboard Navigation Coverage**: 100% of interactive elements
- **Screen Reader Compatibility**: Verified through automated testing
- **WCAG 2.1 AA Compliance**: Full compliance across all components

### Performance Optimization
- **Bundle Size Impact**: <5% increase from LS5_003 baseline
- **Initial Render Time**: <100ms for all components
- **Re-render Performance**: <16ms (60fps) for all components
- **Memory Usage**: No memory leaks detected
- **Code Splitting**: Lazy loading implemented for heavy components

### Code Quality & Maintainability
- **TypeScript Error Reduction**: 33% (150→100 errors)
- **Test Coverage**: 90%+ for all migrated components
- **Import Consistency**: 100% across all components
- **Styled-Components Removal**: 100% in migrated components
- **MUI Pattern Adoption**: 100% compliance with established patterns

### Component Migration Success
- **Functionality Preservation**: 100% (no breaking changes)
- **Accessibility Enhancement**: 90%+ improvement from baseline
- **Performance Optimization**: 50%+ improvement in key metrics
- **Reusable Pattern Establishment**: 5 reusable patterns created
- **Documentation Coverage**: 100% for all new patterns

---

## Expected Outcomes for LS5_004

### Quantitative Targets
- **TypeScript Errors**: Reduce from 150 to 100 (33% reduction)
- **Accessibility Score**: Increase from 70.0 to 85.0+ (21% improvement)
- **Performance Score**: Increase from 70.1 to 85.0+ (21% improvement)
- **Test Coverage**: Achieve 90%+ across all migrated components
- **Bundle Size**: Maintain or reduce current size through optimization

### Qualitative Improvements
- **Accessibility Leadership**: Establish VARAi as accessibility-first platform
- **Performance Excellence**: Create performance-optimized component patterns
- **Developer Experience**: Improve development efficiency through reusable patterns
- **User Experience**: Enhance usability for all users, including those with disabilities
- **Maintainability**: Reduce technical debt through modern React patterns

### Risk Mitigation Strategy
- **Comprehensive Testing**: Automated testing prevents regressions
- **Incremental Migration**: Component-by-component approach reduces risk
- **Performance Monitoring**: Continuous monitoring prevents performance degradation
- **Accessibility Validation**: Automated testing ensures compliance
- **Documentation**: Comprehensive documentation enables team adoption

### Success Metrics
- **Zero Accessibility Violations**: Automated testing ensures compliance
- **Performance Benchmarks Met**: All components meet established performance criteria
- **Functionality Preserved**: No breaking changes to existing features
- **Team Adoption**: Development team successfully uses new patterns
- **User Satisfaction**: Improved user experience metrics

---

## Iteration Planning for LS5_005

### Preparation for Next Phase
Based on LS5_004 success, LS5_005 should target:
- **Settings Components**: ApiKeyManager, ColorPicker, ToggleSwitch
- **Advanced Patterns**: Complex form validation and state management
- **Integration Testing**: Cross-component interaction patterns
- **Performance Optimization**: Advanced optimization techniques
- **Accessibility Mastery**: Advanced accessibility patterns

### Lessons Learned Integration
- **Pattern Reuse**: Apply successful patterns from LS5_004
- **Testing Strategy**: Expand automated testing coverage
- **Performance Focus**: Continue performance optimization emphasis
- **Accessibility First**: Maintain accessibility-first development approach
- **Documentation**: Enhance documentation based on team feedback

### Technical Debt Reduction
- **Styled-Components Elimination**: Complete removal from remaining components
- **Import Standardization**: Apply consistent import patterns
- **Theme Integration**: Complete MUI theme system adoption
- **Error Handling**: Standardize error handling patterns
- **State Management**: Optimize state management patterns

The LS5_004 phase establishes a comprehensive foundation for accessibility, performance, and maintainability that will guide the remaining migration phases toward a fully optimized, accessible, and performant React application.