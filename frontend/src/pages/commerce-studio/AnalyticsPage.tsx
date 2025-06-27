import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Button,
  Card,
  CardContent,
  CardActionArea
} from '@mui/material';
import DateRangeSelector from '../../components/analytics/filters/DateRangeSelector';
import ConversionFunnel from '../../components/analytics/charts/ConversionFunnel';
import HeatmapChart from '../../components/analytics/charts/HeatmapChart';
import CohortAnalysisChart from '../../components/analytics/charts/CohortAnalysisChart';
import ABTestChart from '../../components/analytics/charts/ABTestChart';
import ReportExport from '../../components/analytics/reports/ReportExport';
import { 
  analyticsService, 
  AnalyticsFilters,
  ConversionFunnelData,
  HeatmapData,
  CohortData,
  ABTestData
} from '../../services/analytics';

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
};

const a11yProps = (index: number) => {
  return {
    id: `analytics-tab-${index}`,
    'aria-controls': `analytics-tabpanel-${index}`,
  };
};

const AnalyticsPage: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: {
      startDate: (() => {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date.toISOString().split('T')[0];
      })(),
      endDate: new Date().toISOString().split('T')[0]
    }
  });
  
  // Analytics data states
  const [conversionData, setConversionData] = useState<ConversionFunnelData | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const [cohortData, setCohortData] = useState<CohortData | null>(null);
  const [abTestData, setAbTestData] = useState<ABTestData[] | null>(null);
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };
  
  // Handle date range change
  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setFilters({
      ...filters,
      dateRange: {
        startDate,
        endDate
      }
    });
  };
  
  // Fetch analytics data based on filters
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch data for the active tab to minimize unnecessary API calls
        switch (tabIndex) {
          case 0: { // Conversion Funnel
            const data = await analyticsService.getConversionFunnel(filters);
            setConversionData(data);
            break;
          }
          case 1: { // Product Engagement
            const data = await analyticsService.getProductEngagementHeatmap('product-1', filters);
            setHeatmapData(data);
            break;
          }
          case 2: { // Cohort Analysis
            const data = await analyticsService.getCohortAnalysis(filters);
            setCohortData(data);
            break;
          }
          case 3: { // A/B Testing
            const data = await analyticsService.getABTestResults(undefined, filters);
            setAbTestData(data);
            break;
          }
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [tabIndex, filters]);
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Analytics Dashboard
        </Typography>
        <ReportExport reportName={`Analytics Report - ${filters.dateRange.startDate} to ${filters.dateRange.endDate}`} />
      </Box>
      
      <DateRangeSelector
        startDate={filters.dateRange.startDate}
        endDate={filters.dateRange.endDate}
        onChange={handleDateRangeChange}
      />
      
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabIndex} 
          onChange={handleTabChange} 
          aria-label="analytics tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Conversion Funnel" {...a11yProps(0)} />
          <Tab label="Product Engagement" {...a11yProps(1)} />
          <Tab label="Cohort Analysis" {...a11yProps(2)} />
          <Tab label="A/B Testing" {...a11yProps(3)} />
          <Tab label="Reports & Dashboards" {...a11yProps(4)} />
        </Tabs>
        
        <TabPanel value={tabIndex} index={0}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            conversionData && (
              <ConversionFunnel 
                data={conversionData} 
                title="Customer Conversion Funnel"
                height={500}
              />
            )
          )}
        </TabPanel>
        
        <TabPanel value={tabIndex} index={1}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            heatmapData && (
              <HeatmapChart 
                data={heatmapData}
                height={500}
              />
            )
          )}
        </TabPanel>
        
        <TabPanel value={tabIndex} index={2}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            cohortData && (
              <CohortAnalysisChart 
                data={cohortData}
                height={600}
              />
            )
          )}
        </TabPanel>
        
        <TabPanel value={tabIndex} index={3}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            abTestData && abTestData.length > 0 ? (
              <Grid container spacing={3}>
                {abTestData.map((test) => (
                  <Grid item xs={12} key={test.testId}>
                    <ABTestChart 
                      data={test}
                      height={400}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', p: 4 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No A/B tests found for the selected date range
                </Typography>
                <Button variant="outlined" sx={{ mt: 2 }}>
                  Create New A/B Test
                </Button>
              </Box>
            )
          )}
        </TabPanel>
        
        <TabPanel value={tabIndex} index={4}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Analytics Reports
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Access specialized analytics dashboards and reports
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <Card sx={{ height: '100%' }}>
                <CardActionArea
                  component="a"
                  href="/admin/merchant-onboarding-analytics"
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div" gutterBottom>
                      Merchant Onboarding Analytics
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Track and analyze merchant onboarding performance metrics to optimize the integration process.
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6} lg={4}>
              <Card sx={{ height: '100%' }}>
                <CardActionArea sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div" gutterBottom>
                      Custom Report Builder
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create custom reports by selecting metrics, dimensions, and visualizations.
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default AnalyticsPage;