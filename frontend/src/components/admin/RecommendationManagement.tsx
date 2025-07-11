import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  Button,
  Tabs,
  Tab,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingIcon,
  Visibility as ViewIcon,
  Compare as CompareIcon,
  TestTube as TestIcon,
  Save as SaveIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';
import { recommendationService } from '../../services/recommendation-service';
import { recommendationManagementService, RecommendationConfig, ServiceStatus, AnalyticsData } from '../../services/recommendation-management.service';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`recommendation-tabpanel-${index}`}
      aria-labelledby={`recommendation-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}


const RecommendationManagement: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [config, setConfig] = useState<RecommendationConfig>({
    trendingEnabled: true,
    recentlyViewedEnabled: true,
    similarProductsEnabled: true,
    trendingTimeFrame: 'week',
    maxRecommendations: 10,
    cacheEnabled: true,
    cacheTtl: 3600,
    minScore: 0.5,
    enableAnalytics: true,
  });
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>({
    trending: 'active',
    recentlyViewed: 'active',
    similarProducts: 'active',
  });
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalRecommendations: 0,
    clickThroughRate: 0,
    conversionRate: 0,
    popularCategories: [],
    performanceMetrics: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testProductId, setTestProductId] = useState('');

  const theme = useTheme();

  const loadConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load configuration and analytics data from API
      const [configData, statusData, analyticsData] = await Promise.all([
        recommendationManagementService.getConfiguration(),
        recommendationManagementService.getServiceStatus(),
        recommendationManagementService.getAnalytics()
      ]);
      
      setConfig(configData);
      setServiceStatus(statusData);
      setAnalyticsData(analyticsData);
    } catch (error) {
      console.error('Failed to load configuration:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  }, []);

  const handleConfigChange = useCallback((key: keyof RecommendationConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handleServiceToggle = useCallback(async (service: keyof ServiceStatus) => {
    try {
      const currentStatus = serviceStatus[service];
      const action = currentStatus === 'active' ? 'stop' : 'start';
      
      await recommendationManagementService.toggleService(service, action);
      
      // Update local state
      setServiceStatus(prev => ({
        ...prev,
        [service]: prev[service] === 'active' ? 'paused' : 'active',
      }));
    } catch (error) {
      console.error(`Failed to toggle service ${service}:`, error);
    }
  }, [serviceStatus]);

  const handleSaveConfig = useCallback(async () => {
    setSaveStatus('saving');
    try {
      await recommendationManagementService.saveConfiguration(config);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  }, [config]);

  const handleRefreshAnalytics = useCallback(() => {
    loadConfig();
  }, [loadConfig]);

  const handleTestRecommendations = useCallback(async () => {
    if (!testProductId) return;
    
    setIsLoading(true);
    try {
      const results = await recommendationManagementService.testRecommendations(testProductId, ['trending', 'similar']);
      setTestResults(results.map(result => ({
        type: result.testType,
        products: result.results.map(r => r.product)
      })));
    } catch (error) {
      console.error('Test failed:', error);
      // Fallback to direct service calls
      try {
        const fallbackResults = await Promise.all([
          recommendationService.getTrendingProducts('Eyewear', 5),
          recommendationService.getSimilarProducts(testProductId, 5),
        ]);
        
        setTestResults([
          { type: 'Trending', products: fallbackResults[0] },
          { type: 'Similar', products: fallbackResults[1] },
        ]);
      } catch (fallbackError) {
        console.error('Fallback test also failed:', fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  }, [testProductId]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'active': return theme.palette.success.main;
      case 'paused': return theme.palette.warning.main;
      case 'error': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  }, [theme]);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'active': return <PlayIcon />;
      case 'paused': return <PauseIcon />;
      case 'error': return <ErrorIcon />;
      default: return <PlayIcon />;
    }
  }, []);

  const configurationTab = useMemo(() => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Service Configuration
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.trendingEnabled}
                    onChange={(e) => handleConfigChange('trendingEnabled', e.target.checked)}
                  />
                }
                label="Enable Trending Products"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={config.recentlyViewedEnabled}
                    onChange={(e) => handleConfigChange('recentlyViewedEnabled', e.target.checked)}
                  />
                }
                label="Enable Recently Viewed"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={config.similarProductsEnabled}
                    onChange={(e) => handleConfigChange('similarProductsEnabled', e.target.checked)}
                  />
                }
                label="Enable Similar Products"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={config.enableAnalytics}
                    onChange={(e) => handleConfigChange('enableAnalytics', e.target.checked)}
                  />
                }
                label="Enable Analytics Tracking"
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Algorithm Settings
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Trending Time Frame</InputLabel>
                <Select
                  value={config.trendingTimeFrame}
                  onChange={(e) => handleConfigChange('trendingTimeFrame', e.target.value)}
                >
                  <MenuItem value="hour">Last Hour</MenuItem>
                  <MenuItem value="day">Last Day</MenuItem>
                  <MenuItem value="week">Last Week</MenuItem>
                  <MenuItem value="month">Last Month</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                label="Max Recommendations"
                type="number"
                value={config.maxRecommendations}
                onChange={(e) => handleConfigChange('maxRecommendations', parseInt(e.target.value))}
                InputProps={{ inputProps: { min: 1, max: 50 } }}
              />
              
              <TextField
                label="Minimum Score (0-1)"
                type="number"
                value={config.minScore}
                onChange={(e) => handleConfigChange('minScore', parseFloat(e.target.value))}
                InputProps={{ inputProps: { min: 0, max: 1, step: 0.1 } }}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Cache Configuration
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.cacheEnabled}
                    onChange={(e) => handleConfigChange('cacheEnabled', e.target.checked)}
                  />
                }
                label="Enable Caching"
              />
              {config.cacheEnabled && (
                <TextField
                  label="Cache TTL (seconds)"
                  type="number"
                  value={config.cacheTtl}
                  onChange={(e) => handleConfigChange('cacheTtl', parseInt(e.target.value))}
                  InputProps={{ inputProps: { min: 60, max: 86400 } }}
                  helperText="Time to live for cached recommendations"
                />
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={saveStatus === 'saving' ? <CircularProgress size={20} /> : <SaveIcon />}
            onClick={handleSaveConfig}
            disabled={saveStatus === 'saving'}
          >
            {saveStatus === 'saving' ? 'Saving...' : 'Save Configuration'}
          </Button>
          {saveStatus === 'success' && (
            <Alert severity="success" sx={{ alignItems: 'center' }}>
              Configuration saved successfully!
            </Alert>
          )}
          {saveStatus === 'error' && (
            <Alert severity="error" sx={{ alignItems: 'center' }}>
              Failed to save configuration
            </Alert>
          )}
        </Box>
      </Grid>
    </Grid>
  ), [config, saveStatus, handleConfigChange, handleSaveConfig]);

  const analyticsTab = useMemo(() => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Analytics Overview</Typography>
          <Button
            startIcon={<RefreshIcon />}
            onClick={handleRefreshAnalytics}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </Box>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h4" color="primary">
              {analyticsData.totalRecommendations.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Recommendations
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h4" color="primary">
              {analyticsData.clickThroughRate}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Click-through Rate
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h4" color="primary">
              {analyticsData.conversionRate}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Conversion Rate
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h4" color="primary">
              {analyticsData.popularCategories.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Categories
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Popular Categories
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {analyticsData.popularCategories.map((category, index) => (
                <Box key={category.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ minWidth: 100 }}>
                    {category.name}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(category.count / analyticsData.popularCategories[0]?.count) * 100}
                    sx={{ flexGrow: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {category.count}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Service Performance
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Service</TableCell>
                    <TableCell align="right">Avg Response (ms)</TableCell>
                    <TableCell align="right">Success Rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analyticsData.performanceMetrics.map((metric) => (
                    <TableRow key={metric.service}>
                      <TableCell>{metric.service}</TableCell>
                      <TableCell align="right">{metric.avgResponseTime}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${metric.successRate}%`}
                          size="small"
                          color={metric.successRate > 98 ? 'success' : 'warning'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  ), [analyticsData, isLoading, handleRefreshAnalytics]);

  const servicesTab = useMemo(() => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Service Status & Controls
        </Typography>
      </Grid>
      
      {Object.entries(serviceStatus).map(([serviceName, status]) => (
        <Grid item xs={12} md={4} key={serviceName}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: getStatusColor(status),
                    }}
                  />
                  <Typography variant="h6">
                    {serviceName.charAt(0).toUpperCase() + serviceName.slice(1).replace(/([A-Z])/g, ' $1')}
                  </Typography>
                </Box>
                <Tooltip title={status === 'active' ? 'Pause Service' : 'Start Service'}>
                  <IconButton
                    onClick={() => handleServiceToggle(serviceName as keyof ServiceStatus)}
                    color={status === 'active' ? 'success' : 'primary'}
                  >
                    {getStatusIcon(status)}
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Status: {status.charAt(0).toUpperCase() + status.slice(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last updated: {new Date().toLocaleTimeString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  ), [serviceStatus, getStatusColor, getStatusIcon, handleServiceToggle]);

  const testingTab = useMemo(() => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Test Recommendations
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              <TextField
                label="Test Product ID"
                value={testProductId}
                onChange={(e) => setTestProductId(e.target.value)}
                placeholder="Enter product ID to test similar products"
                sx={{ flexGrow: 1 }}
              />
              <Button
                variant="contained"
                startIcon={<TestIcon />}
                onClick={() => setTestDialogOpen(true)}
                disabled={!testProductId || isLoading}
              >
                Run Test
              </Button>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Test the recommendation algorithms with real data to verify they're working correctly.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  ), [testProductId, isLoading]);

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Recommendation Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            icon={<TrendingIcon />}
            label="Trending"
            color={serviceStatus.trending === 'active' ? 'success' : 'default'}
            size="small"
          />
          <Chip
            icon={<ViewIcon />}
            label="Recently Viewed"
            color={serviceStatus.recentlyViewed === 'active' ? 'success' : 'default'}
            size="small"
          />
          <Chip
            icon={<CompareIcon />}
            label="Similar Products"
            color={serviceStatus.similarProducts === 'active' ? 'success' : 'default'}
            size="small"
          />
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="recommendation management tabs">
          <Tab
            label="Configuration"
            icon={<SettingsIcon />}
            iconPosition="start"
            id="recommendation-tab-0"
            aria-controls="recommendation-tabpanel-0"
          />
          <Tab
            label="Analytics"
            icon={<AnalyticsIcon />}
            iconPosition="start"
            id="recommendation-tab-1"
            aria-controls="recommendation-tabpanel-1"
          />
          <Tab
            label="Services"
            icon={<PlayIcon />}
            iconPosition="start"
            id="recommendation-tab-2"
            aria-controls="recommendation-tabpanel-2"
          />
          <Tab
            label="Testing"
            icon={<TestIcon />}
            iconPosition="start"
            id="recommendation-tab-3"
            aria-controls="recommendation-tabpanel-3"
          />
        </Tabs>
      </Box>

      <TabPanel value={currentTab} index={0}>
        {configurationTab}
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        {analyticsTab}
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        {servicesTab}
      </TabPanel>

      <TabPanel value={currentTab} index={3}>
        {testingTab}
      </TabPanel>

      {/* Test Dialog */}
      <Dialog
        open={testDialogOpen}
        onClose={() => setTestDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Test Recommendation Results</DialogTitle>
        <DialogContent>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : testResults.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {testResults.map((result, index) => (
                <Box key={index}>
                  <Typography variant="h6" gutterBottom>
                    {result.type} Products
                  </Typography>
                  <Grid container spacing={2}>
                    {result.products.slice(0, 3).map((product: any, idx: number) => (
                      <Grid item xs={12} sm={4} key={idx}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle2" gutterBottom>
                              {product.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {product.brand} - ${product.price}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {product.shape} • {product.material}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                  {index < testResults.length - 1 && <Divider sx={{ my: 2 }} />}
                </Box>
              ))}
            </Box>
          ) : (
            <Typography>No test results available. Click "Run Test" to generate results.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestDialogOpen(false)}>Close</Button>
          <Button
            onClick={handleTestRecommendations}
            variant="contained"
            disabled={!testProductId || isLoading}
          >
            Run Test
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RecommendationManagement;