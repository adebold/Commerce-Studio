import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Chip,
  Button,
  Paper,
  Skeleton,
  Alert,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
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
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardService, type DashboardMetrics, type SalesData, type ProductPerformanceData, type CustomerEngagementData, type ActivityItem, type IntegrationStatus } from '../../services/dashboard';

const drawerWidth = 280;

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<any>;
  color: string;
  trend?: number;
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, color, trend, loading }) => {
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="text" width="40%" height={24} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            {trend && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: trend > 0 ? 'success.main' : 'error.main',
                  fontWeight: 600,
                  mt: 0.5,
                  display: 'block'
                }}
              >
                {trend > 0 ? '+' : ''}{trend.toFixed(1)}% from last month
              </Typography>
            )}
          </Box>
          <Icon sx={{ fontSize: 40, color, opacity: 0.8 }} />
        </Box>
      </CardContent>
    </Card>
  );
};

interface SalesChartProps {
  data: SalesData[];
  loading: boolean;
  period: 'daily' | 'weekly' | 'monthly';
}

const SalesChart: React.FC<SalesChartProps> = ({ data, loading, period }) => {
  if (loading) {
    return <Skeleton variant="rectangular" width="100%" height={300} />;
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Sales Overview - {period.charAt(0).toUpperCase() + period.slice(1)}
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis />
          <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            name="Revenue" 
            stroke="#2563eb" 
            strokeWidth={3}
            dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="orders" 
            name="Orders" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

interface ProductPerformanceChartProps {
  data: ProductPerformanceData[];
  loading: boolean;
}

const ProductPerformanceChart: React.FC<ProductPerformanceChartProps> = ({ data, loading }) => {
  if (loading) {
    return <Skeleton variant="rectangular" width="100%" height={300} />;
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Top Performing Products
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="sales" name="Sales" fill="#2563eb" />
          <Bar dataKey="views" name="Views" fill="#93c5fd" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

interface CustomerEngagementChartProps {
  data: CustomerEngagementData[];
  loading: boolean;
}

const CustomerEngagementChart: React.FC<CustomerEngagementChartProps> = ({ data, loading }) => {
  if (loading) {
    return <Skeleton variant="rectangular" width="100%" height={300} />;
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Customer Engagement
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [`${value}%`, 'Engagement']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

interface ActivityFeedProps {
  activities: ActivityItem[];
  loading: boolean;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, loading }) => {
  if (loading) {
    return (
      <Box>
        {[...Array(5)].map((_, i) => (
          <Box key={i} sx={{ mb: 2 }}>
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" />
          </Box>
        ))}
      </Box>
    );
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'order': return 'success';
      case 'customer': return 'info';
      case 'product': return 'warning';
      case 'bopis': return 'secondary';
      case 'integration': return 'primary';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Recent Activity
      </Typography>
      <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
        {activities.slice(0, 10).map((activity) => (
          <Box key={activity.id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {activity.title}
              </Typography>
              <Chip 
                label={activity.type.toUpperCase()} 
                size="small" 
                color={getActivityColor(activity.type) as any}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {activity.description}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatTimeAgo(activity.timestamp)}
              {activity.user && ` • by ${activity.user.name}`}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

interface IntegrationStatusProps {
  integrations: IntegrationStatus[];
  loading: boolean;
}

const IntegrationStatusComponent: React.FC<IntegrationStatusProps> = ({ integrations, loading }) => {
  if (loading) {
    return (
      <Box>
        {[...Array(4)].map((_, i) => (
          <Box key={i} sx={{ mb: 2 }}>
            <Skeleton variant="rectangular" width="100%" height={60} />
          </Box>
        ))}
      </Box>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'success';
      case 'offline': return 'error';
      case 'maintenance': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Integration Status
      </Typography>
      {integrations.map((integration) => (
        <Paper key={integration.platform} sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6">{integration.platform}</Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Response: {integration.responseTime}ms
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Error Rate: {(integration.errorRate * 100).toFixed(1)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Users: {integration.activeUsers.toLocaleString()}
                </Typography>
              </Box>
            </Box>
            <Chip 
              label={integration.status.toUpperCase()} 
              color={getStatusColor(integration.status) as any}
              size="small"
            />
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

const EnhancedDashboard: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timePeriod, setTimePeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  
  // Data state
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [productData, setProductData] = useState<ProductPerformanceData[]>([]);
  const [engagementData, setEngagementData] = useState<CustomerEngagementData[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);

  // Menu items
  const menuItems = useMemo(() => [
    { text: 'Dashboard', icon: <DashboardIcon />, active: true, id: 'dashboard' },
    { text: 'Stores', icon: <StoreIcon />, active: false, id: 'stores' },
    { text: 'Analytics', icon: <AnalyticsIcon />, active: false, id: 'analytics' },
    { text: 'Orders', icon: <ShoppingCartIcon />, active: false, id: 'orders' },
    { text: 'Customers', icon: <PeopleIcon />, active: false, id: 'customers' },
    { text: 'Settings', icon: <SettingsIcon />, active: false, id: 'settings' },
  ], []);

  // Load dashboard data
  const loadDashboardData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [
        metricsData,
        salesResponse,
        productResponse,
        engagementResponse,
        activitiesResponse,
        integrationsResponse
      ] = await Promise.all([
        dashboardService.getDashboardMetrics(),
        dashboardService.getSalesData(timePeriod),
        dashboardService.getProductPerformance(),
        dashboardService.getCustomerEngagement(),
        dashboardService.getActivityFeed(),
        dashboardService.getIntegrationStatus()
      ]);

      setMetrics(metricsData);
      setSalesData(salesResponse);
      setProductData(productResponse);
      setEngagementData(engagementResponse);
      setActivities(activitiesResponse);
      setIntegrations(integrationsResponse);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Effects
  useEffect(() => {
    loadDashboardData();
  }, [timePeriod]);

  // Event handlers
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleRefresh = () => {
    loadDashboardData(true);
  };

  const handleTimePeriodChange = (period: 'daily' | 'weekly' | 'monthly') => {
    setTimePeriod(period);
  };

  // Drawer content
  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
          VARAi Studio
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Commerce Platform
        </Typography>
      </Box>
      
      <List sx={{ flex: 1, px: 2, py: 1 }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              backgroundColor: item.active ? theme.palette.primary.main : 'transparent',
              color: item.active ? theme.palette.primary.contrastText : theme.palette.text.primary,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: item.active ? theme.palette.primary.dark : theme.palette.action.hover,
              },
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
            {user?.avatar || <AccountCircleIcon />}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {user?.name || 'User'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.role?.replace('_', ' ').toUpperCase() || 'USER'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

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
          
          <Typography variant="h6" noWrap component="h1" sx={{ flexGrow: 1 }}>
            Dashboard Overview
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              color="inherit"
              onClick={handleRefresh}
              disabled={refreshing}
              aria-label="Refresh dashboard"
            >
              <RefreshIcon sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            </IconButton>
            <IconButton color="inherit" aria-label="View notifications">
              <NotificationsIcon />
            </IconButton>
            <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
              {user?.avatar || <AccountCircleIcon />}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
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
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8, // Account for AppBar height
        }}
      >
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Welcome back, {user?.name || 'User'}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening with your commerce studio today.
          </Typography>
        </Box>

        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Total Revenue"
              value={metrics ? `$${metrics.totalRevenue.toLocaleString()}` : '$0'}
              icon={TrendingUpIcon}
              color={theme.palette.primary.main}
              trend={8.2}
              loading={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Total Orders"
              value={metrics ? metrics.totalOrders.toLocaleString() : '0'}
              icon={ShoppingCartIcon}
              color={theme.palette.secondary.main}
              trend={12.5}
              loading={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Active Customers"
              value={metrics ? metrics.activeCustomers.toLocaleString() : '0'}
              icon={PeopleIcon}
              color={theme.palette.info.main}
              trend={5.7}
              loading={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Active Stores"
              value={metrics ? metrics.activeStores.toString() : '0'}
              icon={StoreIcon}
              color={theme.palette.success.main}
              loading={loading}
            />
          </Grid>
        </Grid>

        {/* Sales Chart */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Sales Overview</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {(['daily', 'weekly', 'monthly'] as const).map((period) => (
                  <Button
                    key={period}
                    size="small"
                    variant={timePeriod === period ? 'contained' : 'outlined'}
                    onClick={() => handleTimePeriodChange(period)}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </Button>
                ))}
              </Box>
            </Box>
            <SalesChart data={salesData} loading={loading} period={timePeriod} />
          </CardContent>
        </Card>

        {/* Charts Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} lg={8}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <ProductPerformanceChart data={productData} loading={loading} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <CustomerEngagementChart data={engagementData} loading={loading} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Activity and Integration Status */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <ActivityFeed activities={activities} loading={loading} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <IntegrationStatusComponent integrations={integrations} loading={loading} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Add spinning animation for refresh icon */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Box>
  );
};

export default EnhancedDashboard;