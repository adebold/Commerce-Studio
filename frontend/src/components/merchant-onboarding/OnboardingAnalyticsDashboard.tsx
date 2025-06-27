import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Divider,
  Alert
} from '@mui/material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { 
  fetchOnboardingMetrics, 
  OnboardingMetrics, 
  OnboardingStep 
} from '../../services/merchant-onboarding-analytics';

// Define colors for charts
const COLORS = ['#3C64F4', '#FF5C35', '#00A656', '#FFBF00', '#9B51E0', '#FF8888'];

// Date range options
const DATE_RANGES = [
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
  { label: 'Year to Date', value: 'ytd' },
  { label: 'All Time', value: 'all' }
];

// Step display names
const STEP_DISPLAY_NAMES: Record<OnboardingStep, string> = {
  [OnboardingStep.START]: 'Start Onboarding',
  [OnboardingStep.PLATFORM_SELECTION]: 'Platform Selection',
  [OnboardingStep.ACCOUNT_SETUP]: 'Account Setup',
  [OnboardingStep.STORE_CONFIGURATION]: 'Store Configuration',
  [OnboardingStep.INTEGRATION_SETUP]: 'Integration Setup',
  [OnboardingStep.FINAL_VERIFICATION]: 'Final Verification',
  [OnboardingStep.COMPLETE]: 'Complete Onboarding',
  [OnboardingStep.APP_INSTALLATION]: 'App Installation',
  [OnboardingStep.PRODUCT_CONFIGURATION]: 'Product Configuration',
  [OnboardingStep.WIDGET_PLACEMENT]: 'Widget Placement',
  [OnboardingStep.FIRST_TRY_ON]: 'First Try-On',
  [OnboardingStep.FIRST_RECOMMENDATION]: 'First Recommendation'
};

interface OnboardingAnalyticsDashboardProps {
  title?: string;
}

const OnboardingAnalyticsDashboard: React.FC<OnboardingAnalyticsDashboardProps> = ({ 
  title = 'Merchant Onboarding Analytics' 
}) => {
  const [dateRange, setDateRange] = useState<string>('30d');
  const [metrics, setMetrics] = useState<OnboardingMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Calculate date range
        const endDate = new Date();
        let startDate = new Date();

        switch (dateRange) {
          case '7d':
            startDate.setDate(endDate.getDate() - 7);
            break;
          case '30d':
            startDate.setDate(endDate.getDate() - 30);
            break;
          case '90d':
            startDate.setDate(endDate.getDate() - 90);
            break;
          case 'ytd':
            startDate = new Date(endDate.getFullYear(), 0, 1); // January 1st of current year
            break;
          case 'all':
            startDate = new Date(2020, 0, 1); // Use a far past date
            break;
          default:
            startDate.setDate(endDate.getDate() - 30); // Default to 30 days
        }

        const data = await fetchOnboardingMetrics(startDate, endDate);
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch onboarding metrics');
        console.error('Error fetching onboarding metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  const handleDateRangeChange = (event: SelectChangeEvent) => {
    setDateRange(event.target.value);
  };

  // Prepare data for step completion chart
  const prepareStepCompletionData = () => {
    if (!metrics) return [];

    return Object.entries(metrics.stepCompletionRates)
      .map(([step, rate]) => ({
        step: STEP_DISPLAY_NAMES[step as OnboardingStep] || step,
        rate: Math.round(rate * 100)
      }))
      .sort((entryA, entryB) => {
        // Sort by the order of steps in the enum
        const stepOrder = Object.values(OnboardingStep);
        const aIndex = stepOrder.indexOf(entryA.step as unknown as OnboardingStep);
        const bIndex = stepOrder.indexOf(entryB.step as unknown as OnboardingStep);
        return aIndex - bIndex;
      });
  };

  // Prepare data for drop-off points chart
  const prepareDropOffData = () => {
    if (!metrics) return [];

    return Object.entries(metrics.dropOffPoints)
      .map(([step, count]) => ({
        step: STEP_DISPLAY_NAMES[step as OnboardingStep] || step,
        count
      }))
      .sort((a, b) => b.count - a.count) // Sort by highest drop-off first
      .slice(0, 5); // Top 5 drop-off points
  };

  // Prepare data for platform distribution chart
  const preparePlatformData = () => {
    if (!metrics) return [];

    return Object.entries(metrics.platformDistribution)
      .map(([platform, count]) => ({
        platform: platform.charAt(0).toUpperCase() + platform.slice(1),
        count
      }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 4 }}>
        {error}
      </Alert>
    );
  }

  if (!metrics) {
    return (
      <Alert severity="info" sx={{ mb: 4 }}>
        No onboarding metrics available for the selected date range.
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" component="h2">
          {title}
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="date-range-select-label">Date Range</InputLabel>
          <Select
            labelId="date-range-select-label"
            id="date-range-select"
            value={dateRange}
            label="Date Range"
            onChange={handleDateRangeChange}
          >
            {DATE_RANGES.map((range) => (
              <MenuItem key={range.value} value={range.value}>
                {range.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Started Onboarding"
            value={metrics.startCount}
            subtitle="Total merchants"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Completed Onboarding"
            value={metrics.completionCount}
            subtitle="Total merchants"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Completion Rate"
            value={`${(metrics.completionRate * 100).toFixed(1)}%`}
            subtitle="Of started onboardings"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Avg. Time to Complete"
            value={`${metrics.averageTimeToComplete.toFixed(1)} min`}
            subtitle="From start to finish"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Step Completion Rates */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Step Completion Rates
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Percentage of merchants who complete each step of the onboarding process
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={prepareStepCompletionData()}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="step" angle={-45} textAnchor="end" height={80} />
                  <YAxis tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Completion Rate']} />
                  <Bar dataKey="rate" fill="#3C64F4" name="Completion Rate" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Platform Distribution */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Platform Distribution
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Breakdown of merchants by e-commerce process.env.ONBOARDINGANALYTICSDASHBOARD_SECRET_2
            </Typography>
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={preparePlatformData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="process.env.ONBOARDINGANALYTICSDASHBOARD_SECRET_2"
                  >
                    {preparePlatformData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [value, props.payload.process.env.ONBOARDINGANALYTICSDASHBOARD_SECRET_2]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Top Drop-off Points */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Drop-off Points
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Steps where merchants most frequently abandon the onboarding process
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={prepareDropOffData()}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="step" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#FF5C35" name="Drop-offs" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Feedback Score */}
      <Box sx={{ mt: 4, mb: 2 }}>
        <Divider />
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Merchant Feedback
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  position: 'relative',
                  display: 'inline-flex',
                  mr: 3
                }}
              >
                <CircularProgress
                  variant="determinate"
                  value={(metrics.feedbackScore / 5) * 100}
                  size={80}
                  thickness={5}
                  sx={{ color: getFeedbackColor(metrics.feedbackScore) }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h5" component="div" color="text.secondary">
                    {metrics.feedbackScore.toFixed(1)}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="h6">
                  {getFeedbackLabel(metrics.feedbackScore)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average rating from merchant feedback
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" component="div" sx={{ mb: 1 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    </CardContent>
  </Card>
);

// Helper function to get color based on feedback score
const getFeedbackColor = (score: number): string => {
  if (score >= 4.5) return '#00A656'; // Excellent - Green
  if (score >= 4.0) return '#4CAF50'; // Very Good - Light Green
  if (score >= 3.5) return '#FFBF00'; // Good - Yellow
  if (score >= 3.0) return '#FF9800'; // Average - Orange
  return '#FF5C35'; // Below Average - Red
};

// Helper function to get label based on feedback score
const getFeedbackLabel = (score: number): string => {
  if (score >= 4.5) return 'Excellent';
  if (score >= 4.0) return 'Very Good';
  if (score >= 3.5) return 'Good';
  if (score >= 3.0) return 'Average';
  return 'Needs Improvement';
};

export default OnboardingAnalyticsDashboard;