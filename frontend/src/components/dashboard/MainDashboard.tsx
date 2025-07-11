import React, { memo, useMemo, useCallback, useState, useEffect, Suspense, lazy } from 'react';
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
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Store as StoreIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  ShoppingCart as ShoppingCartIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Recommend as RecommendIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// For now, we'll use the existing chart components directly
// TODO: Create separate lazy-loaded chart components for better performance

const drawerWidth = 280;

// Types for better TypeScript support
interface DashboardData {
  revenue: number;
  orders: number;
  customers: number;
  stores: number;
}

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  active: boolean;
  id: string;
}

interface DashboardMetricCardProps {
  title: string;
  value: string;
  icon?: React.ComponentType<any>;
  color?: string;
  isLoading?: boolean;
  error?: string | null;
  onClick?: () => void;
}

interface NavigationDrawerProps {
  menuItems: MenuItem[];
  onItemClick: (item: MenuItem) => void;
  activeItem: string;
  mode: 'light' | 'dark';
  onThemeToggle: () => void;
}

interface MainDashboardProps {
  onNavigate?: (section: string) => void;
}

// Sample data for charts - moved to constants for better performance
const SALES_DATA = [
  { name: 'Jan', sales: 4000, orders: 240 },
  { name: 'Feb', sales: 3000, orders: 198 },
  { name: 'Mar', sales: 5000, orders: 320 },
  { name: 'Apr', sales: 4500, orders: 278 },
  { name: 'May', sales: 6000, orders: 389 },
  { name: 'Jun', sales: 5500, orders: 349 },
];

const CATEGORY_DATA = [
  { name: 'Eyewear', value: 45, color: '#6366f1' },
  { name: 'Accessories', value: 25, color: '#8b5cf6' },
  { name: 'Frames', value: 20, color: '#06b6d4' },
  { name: 'Lenses', value: 10, color: '#10b981' },
];

const RECENT_ORDERS = [
  { id: '#12345', customer: 'John Doe', amount: '$299.99', status: 'Completed', time: '2 hours ago' },
  { id: '#12346', customer: 'Jane Smith', amount: '$199.99', status: 'Processing', time: '4 hours ago' },
  { id: '#12347', customer: 'Mike Johnson', amount: '$399.99', status: 'Shipped', time: '6 hours ago' },
  { id: '#12348', customer: 'Sarah Wilson', amount: '$149.99', status: 'Pending', time: '8 hours ago' },
];

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
        <Alert severity="error">
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
const MainDashboard: React.FC<MainDashboardProps> = memo(({ onNavigate }) => {
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
    { text: 'Recommendations', icon: <RecommendIcon />, active: false, id: 'recommendations' },
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
    if (onNavigate) {
      onNavigate(item.id);
    } else {
      console.log('Navigate to:', item.id);
    }
  }, [onNavigate]);

  const handleMetricClick = useCallback((metricType: string) => {
    // Handle metric drill-down
    console.log('Drill down into:', metricType);
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'Processing': return 'warning';
      case 'Shipped': return 'info';
      case 'Pending': return 'default';
      default: return 'default';
    }
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
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }} role="region" aria-label="Dashboard metrics">
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
        <Grid container spacing={3} sx={{ mb: 4 }} role="region" aria-label="Dashboard charts">
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3, height: 400 }} role="region" aria-labelledby="sales-chart-title">
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }} id="sales-chart-title">
                Sales Overview
              </Typography>
              <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={300} />}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={SALES_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
                    <YAxis stroke={theme.palette.text.secondary} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 8,
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sales" 
                      stroke={theme.palette.primary.main} 
                      strokeWidth={3}
                      dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Suspense>
            </Paper>
          </Grid>
          
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, height: 400 }} role="region" aria-labelledby="categories-chart-title">
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }} id="categories-chart-title">
                Product Categories
              </Typography>
              <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={200} />}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={CATEGORY_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {CATEGORY_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Suspense>
              <Box sx={{ mt: 2 }} role="list" aria-label="Category legend">
                {CATEGORY_DATA.map((item) => (
                  <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', mb: 1 }} role="listitem">
                    <Box sx={{ width: 12, height: 12, bgcolor: item.color, borderRadius: '50%', mr: 1 }} aria-hidden="true" />
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {item.value}%
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Recent Orders */}
        <Paper sx={{ p: 3 }} role="region" aria-labelledby="recent-orders-title">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }} id="recent-orders-title">
              Recent Orders
            </Typography>
            <Button variant="outlined" size="small" aria-label="View all orders">
              View All
            </Button>
          </Box>
          
          <Box sx={{ overflowX: 'auto' }} role="table" aria-label="Recent orders table">
            {RECENT_ORDERS.map((order, index) => (
              <Box key={order.id} role="row">
                <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
                  <Box sx={{ flex: 1 }} role="cell">
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {order.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.customer}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, textAlign: 'center' }} role="cell">
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {order.amount}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, textAlign: 'center' }} role="cell">
                    <Chip 
                      label={order.status} 
                      color={getStatusColor(order.status) as any}
                      size="small"
                      aria-label={`Order status: ${order.status}`}
                    />
                  </Box>
                  <Box sx={{ flex: 1, textAlign: 'right' }} role="cell">
                    <Typography variant="body2" color="text.secondary">
                      {order.time}
                    </Typography>
                  </Box>
                </Box>
                {index < RECENT_ORDERS.length - 1 && <Divider />}
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Quick Actions */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }} role="region" aria-label="Quick actions">
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
            aria-label="View analytics"
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