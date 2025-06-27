import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Breadcrumbs, 
  Link, 
  Divider,
  Tab,
  Tabs
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import OnboardingAnalyticsDashboard from '../../components/merchant-onboarding/OnboardingAnalyticsDashboard';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`onboarding-analytics-tabpanel-${index}`}
      aria-labelledby={`onboarding-analytics-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `onboarding-analytics-tab-${index}`,
    'aria-controls': `onboarding-analytics-tabpanel-${index}`,
  };
};

const MerchantOnboardingAnalyticsPage: React.FC = () => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link component={RouterLink} to="/admin" color="inherit">
          Dashboard
        </Link>
        <Link component={RouterLink} to="/admin/analytics" color="inherit">
          Analytics
        </Link>
        <Typography color="text.primary">Merchant Onboarding</Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Merchant Onboarding Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track and analyze merchant onboarding performance metrics to optimize the integration process.
        </Typography>
      </Box>

      {/* Main Content */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="onboarding analytics tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Overview" {...a11yProps(0)} />
          <Tab label="Platform Comparison" {...a11yProps(1)} />
          <Tab label="Conversion Funnel" {...a11yProps(2)} />
          <Tab label="Feedback Analysis" {...a11yProps(3)} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <OnboardingAnalyticsDashboard title="Onboarding Overview" />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Platform Comparison
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Compare onboarding metrics across different e-commerce platforms to identify platform-specific optimization opportunities.
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          {/* Platform comparison dashboard would be implemented here */}
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Platform comparison dashboard will be implemented in a future update.
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Onboarding Conversion Funnel
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Detailed analysis of the merchant onboarding funnel, showing conversion rates between each step.
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          {/* Conversion funnel dashboard would be implemented here */}
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Conversion funnel dashboard will be implemented in a future update.
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Merchant Feedback Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Detailed analysis of merchant feedback collected during and after the onboarding process.
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          {/* Feedback analysis dashboard would be implemented here */}
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Feedback analysis dashboard will be implemented in a future update.
            </Typography>
          </Box>
        </TabPanel>
      </Paper>

      {/* Additional Information */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          About Merchant Onboarding Analytics
        </Typography>
        <Typography variant="body2" paragraph>
          The Merchant Onboarding Analytics dashboard provides comprehensive insights into how merchants interact with the VARAi integration process. Use these metrics to identify bottlenecks, optimize the onboarding flow, and improve merchant satisfaction.
        </Typography>
        <Typography variant="body2" paragraph>
          Key metrics include:
        </Typography>
        <ul>
          <li>
            <Typography variant="body2">
              <strong>Completion Rate:</strong> Percentage of merchants who complete the entire onboarding process
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Drop-off Points:</strong> Steps where merchants most frequently abandon the onboarding process
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Time to Complete:</strong> Average time taken to complete the onboarding process
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Platform Distribution:</strong> Breakdown of merchants by e-commerce platform
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Feedback Score:</strong> Average rating from merchant feedback
            </Typography>
          </li>
        </ul>
        <Typography variant="body2">
          For more information on how to interpret and act on these metrics, refer to the <Link component={RouterLink} to="/admin/documentation/merchant-onboarding">Merchant Onboarding Documentation</Link>.
        </Typography>
      </Paper>
    </Container>
  );
};

export default MerchantOnboardingAnalyticsPage;