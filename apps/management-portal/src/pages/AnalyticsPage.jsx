import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Grid,
  Box,
  Paper,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  Stack,
  Button,
  Divider
} from '@mui/material';
import {
  Refresh,
  Download,
  Dashboard,
  SmartToy,
  TrendingUp,
  Public,
  Assessment
} from '@mui/icons-material';

// Redux actions and selectors
import {
  fetchGlobalMetrics,
  fetchTenantMetrics,
  fetchRecommendationMetrics,
  fetchConversionFunnels,
  setDateRange,
  selectGlobalMetrics,
  selectTenantMetrics,
  selectRecommendationMetrics,
  selectConversionFunnels,
  selectDateRange,
  selectAnalyticsStatus,
  selectAnalyticsError,
  selectLastUpdated
} from '../store/analyticsSlice';

// Components
import MetricCard from '../components/MetricCard';
import DateRangePicker from '../components/DateRangePicker';

// Tab panel component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AnalyticsPage = () => {
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = useState(0);

  // Redux selectors
  const globalMetrics = useSelector(selectGlobalMetrics);
  const tenantMetrics = useSelector(selectTenantMetrics);
  const recommendationMetrics = useSelector(selectRecommendationMetrics);
  const conversionFunnels = useSelector(selectConversionFunnels);
  const dateRange = useSelector(selectDateRange);
  const status = useSelector(selectAnalyticsStatus);
  const error = useSelector(selectAnalyticsError);
  const lastUpdated = useSelector(selectLastUpdated);

  // Load data on component mount and when date range changes
  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = () => {
    dispatch(fetchGlobalMetrics(dateRange));
    dispatch(fetchTenantMetrics(dateRange));
    dispatch(fetchRecommendationMetrics(dateRange));
    dispatch(fetchConversionFunnels(dateRange));
  };

  const handleDateRangeChange = (newRange) => {
    dispatch(setDateRange(newRange));
  };

  const handleRefresh = () => {
    loadAnalyticsData();
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const isLoading = status === 'loading';

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Analytics Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Comprehensive analytics powered by our Advanced Recommendation Engine and AI features
        </Typography>

        {/* Controls */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <DateRangePicker
              startDate={dateRange.start}
              endDate={dateRange.end}
              onDateRangeChange={handleDateRangeChange}
              disabled={isLoading}
            />
            {lastUpdated && (
              <Typography variant="caption" color="text.secondary">
                Last updated: {new Date(lastUpdated).toLocaleString()}
              </Typography>
            )}
          </Stack>
          
          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={isLoading}
              size="small"
            >
              Refresh
            </Button>
            <Button
              startIcon={<Download />}
              variant="outlined"
              size="small"
            >
              Export
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Analytics Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab 
            icon={<Dashboard />} 
            label="Overview" 
            iconPosition="start"
          />
          <Tab 
            icon={<SmartToy />} 
            label="AI & Recommendations" 
            iconPosition="start"
          />
          <Tab 
            icon={<TrendingUp />} 
            label="Conversion Funnels" 
            iconPosition="start"
          />
          <Tab 
            icon={<Public />} 
            label="European Markets" 
            iconPosition="start"
          />
          <Tab 
            icon={<Assessment />} 
            label="Tenant Performance" 
            iconPosition="start"
          />
        </Tabs>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Global Metrics Row */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Platform Overview
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Total Revenue"
                value={globalMetrics.totalRevenue}
                previousValue={globalMetrics.totalRevenue * 0.85} // Mock previous value
                formatType="currency"
                type="revenue"
                color="primary"
                isLoading={isLoading}
                tooltip="Total revenue across all tenants and stores"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Total Orders"
                value={globalMetrics.totalOrders}
                previousValue={globalMetrics.totalOrders * 0.9}
                formatType="number"
                type="orders"
                color="success"
                isLoading={isLoading}
                tooltip="Total number of completed orders"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Active Tenants"
                value={globalMetrics.activeTenants}
                previousValue={globalMetrics.activeTenants - 2}
                formatType="number"
                type="users"
                color="info"
                isLoading={isLoading}
                tooltip="Number of active tenant stores"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Conversion Rate"
                value={globalMetrics.conversionRate}
                previousValue={globalMetrics.conversionRate - 0.5}
                formatType="percentage"
                type="analytics"
                color="warning"
                isLoading={isLoading}
                tooltip="Overall platform conversion rate"
              />
            </Grid>

            {/* Secondary Metrics */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Performance Metrics
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <MetricCard
                title="Average Order Value"
                value={globalMetrics.averageOrderValue}
                previousValue={globalMetrics.averageOrderValue * 0.95}
                formatType="currency"
                type="revenue"
                size="small"
                isLoading={isLoading}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <MetricCard
                title="New Customers"
                value={globalMetrics.newCustomers}
                previousValue={globalMetrics.newCustomers * 0.8}
                formatType="number"
                type="users"
                size="small"
                isLoading={isLoading}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <MetricCard
                title="AI Feature Usage"
                value={globalMetrics.aiFeatureUsage}
                previousValue={globalMetrics.aiFeatureUsage - 5}
                formatType="percentage"
                type="ai"
                size="small"
                isLoading={isLoading}
                additionalInfo="Face analysis, VTO, and recommendations"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* AI & Recommendations Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Advanced Recommendation Engine Performance
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Analytics from our ML-powered recommendation system with ethical demographic analysis
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Total Recommendations"
                value={recommendationMetrics.totalRecommendations}
                previousValue={recommendationMetrics.totalRecommendations * 0.9}
                formatType="number"
                type="recommendations"
                color="primary"
                isLoading={isLoading}
                tooltip="Total recommendations generated by ML pipeline"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Click-Through Rate"
                value={recommendationMetrics.recommendationClickRate}
                previousValue={recommendationMetrics.recommendationClickRate - 2}
                formatType="percentage"
                type="analytics"
                color="success"
                isLoading={isLoading}
                tooltip="Users clicking on AI-generated recommendations"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Conversion from Recommendations"
                value={recommendationMetrics.conversionFromRecommendations}
                previousValue={recommendationMetrics.conversionFromRecommendations - 1.5}
                formatType="percentage"
                type="revenue"
                color="warning"
                isLoading={isLoading}
                tooltip="Purchases resulting from recommendations"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="ML Model Accuracy"
                value={recommendationMetrics.mlModelAccuracy}
                previousValue={recommendationMetrics.mlModelAccuracy - 1}
                formatType="percentage"
                type="ai"
                color="info"
                isLoading={isLoading}
                tooltip="Current ML model prediction accuracy"
              />
            </Grid>

            {/* Ethical AI Metrics */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Ethical AI & Privacy Metrics
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <MetricCard
                title="Demographic Opt-In Rate"
                value={recommendationMetrics.demographicOptInRate}
                previousValue={recommendationMetrics.demographicOptInRate - 3}
                formatType="percentage"
                type="users"
                color="success"
                isLoading={isLoading}
                tooltip="Users providing explicit consent for demographic analysis"
                additionalInfo="GDPR-compliant ethical AI implementation"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <MetricCard
                title="Recommendation Score"
                value={recommendationMetrics.averageRecommendationScore}
                previousValue={recommendationMetrics.averageRecommendationScore - 0.05}
                formatType="decimal"
                type="ai"
                color="info"
                isLoading={isLoading}
                tooltip="Average confidence score of recommendations"
                additionalInfo="Based on hybrid ML model output"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Conversion Funnels Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                AI-Enhanced Customer Journey
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Conversion funnel showing impact of face analysis, VTO, and recommendations
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <MetricCard
                title="Site Visits"
                value={conversionFunnels.visits}
                formatType="number"
                type="views"
                size="small"
                showTrend={false}
                isLoading={isLoading}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <MetricCard
                title="Face Analysis Use"
                value={conversionFunnels.faceAnalysisUse}
                formatType="number"
                type="ai"
                size="small"
                showTrend={false}
                isLoading={isLoading}
                additionalInfo={`${((conversionFunnels.faceAnalysisUse / conversionFunnels.visits) * 100).toFixed(1)}% of visits`}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <MetricCard
                title="Virtual Try-On"
                value={conversionFunnels.virtualTryOn}
                formatType="number"
                type="ai"
                size="small"
                showTrend={false}
                isLoading={isLoading}
                additionalInfo={`${((conversionFunnels.virtualTryOn / conversionFunnels.faceAnalysisUse) * 100).toFixed(1)}% conversion`}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <MetricCard
                title="Recommendations"
                value={conversionFunnels.recommendations}
                formatType="number"
                type="recommendations"
                size="small"
                showTrend={false}
                isLoading={isLoading}
                additionalInfo={`${((conversionFunnels.recommendations / conversionFunnels.visits) * 100).toFixed(1)}% engagement`}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <MetricCard
                title="Cart Additions"
                value={conversionFunnels.cartAdditions}
                formatType="number"
                type="orders"
                size="small"
                showTrend={false}
                isLoading={isLoading}
                additionalInfo={`${((conversionFunnels.cartAdditions / conversionFunnels.recommendations) * 100).toFixed(1)}% from recs`}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <MetricCard
                title="Purchases"
                value={conversionFunnels.purchases}
                formatType="number"
                type="revenue"
                size="small"
                showTrend={false}
                isLoading={isLoading}
                additionalInfo={`${((conversionFunnels.purchases / conversionFunnels.visits) * 100).toFixed(1)}% overall conversion`}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* European Markets Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                European Market Performance
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Multi-language platform performance across European markets
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  European Market Analytics
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Detailed European market data will be populated with real analytics data
                </Typography>
                <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
                  <Chip label="Netherlands (NL)" color="primary" variant="outlined" />
                  <Chip label="Germany (DE)" color="primary" variant="outlined" />
                  <Chip label="Spain (ES)" color="primary" variant="outlined" />
                  <Chip label="Portugal (PT)" color="primary" variant="outlined" />
                  <Chip label="France (FR)" color="primary" variant="outlined" />
                  <Chip label="Ireland (IE)" color="primary" variant="outlined" />
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tenant Performance Tab */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Tenant Store Performance
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Individual tenant analytics and performance comparison
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  Tenant Analytics Table
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Detailed tenant-by-tenant performance metrics will be displayed here
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Including revenue, orders, AI feature usage, and recommendation performance per tenant
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default AnalyticsPage;