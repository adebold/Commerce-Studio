import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Divider, 
  Skeleton,
  Button,
  Chip
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

interface Report {
  id: string;
  title: string;
  date: string;
  type: string;
  status: string;
  description: string;
  metrics: {
    name: string;
    value: string;
  }[];
}

// Mock data for report detail
const mockReportData: Record<string, Report> = {
  '1': {
    id: '1',
    title: 'Monthly Analysis',
    date: '2025-03-01',
    type: 'Monthly',
    status: 'Completed',
    description: 'Comprehensive monthly analysis of virtual try-on accuracy and user satisfaction metrics.',
    metrics: [
      { name: 'Accuracy Rate', value: '94.3%' },
      { name: 'User Satisfaction', value: '4.6/5' },
      { name: 'Conversion Rate', value: '8.2%' },
      { name: 'Average Session Duration', value: '3m 42s' }
    ]
  },
  '2': {
    id: '2',
    title: 'Weekly Metrics',
    date: '2025-03-10',
    type: 'Weekly',
    status: 'Completed',
    description: 'Weekly performance metrics showing key indicators for virtual try-on engagement.',
    metrics: [
      { name: 'Total Try-ons', value: '1,287' },
      { name: 'Unique Users', value: '843' },
      { name: 'Peak Usage Time', value: '2PM-5PM' },
      { name: 'Most Popular Frames', value: 'Aviator' }
    ]
  },
  '3': {
    id: '3',
    title: 'Performance Review',
    date: '2025-03-15',
    type: 'Quarterly',
    status: 'Pending',
    description: 'Quarterly performance review for Q1 2025, showing comprehensive metrics across all key performance indicators.',
    metrics: [
      { name: 'Overall Growth', value: '23.7%' },
      { name: 'Return Rate', value: '3.2%' },
      { name: 'New User Acquisition', value: '6,752' },
      { name: 'Revenue Impact', value: '+18.9%' }
    ]
  }
};

const ReportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate an API call to fetch report details
    const fetchReport = async () => {
      setLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (id && mockReportData[id]) {
        setReport(mockReportData[id]);
      }
      setLoading(false);
    };

    fetchReport();
  }, [id]);

  const handleBack = () => {
    navigate('/reports');
  };

  if (loading) {
    return (
      <Box>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Back to Reports
        </Button>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={120} sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={200} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={200} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (!report) {
    return (
      <Box>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Back to Reports
        </Button>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" component="h1" color="error">
            Report Not Found
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            The report you're looking for could not be found or has been removed.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={handleBack}
        sx={{ mb: 2 }}
      >
        Back to Reports
      </Button>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            {report.title}
          </Typography>
          <Chip 
            label={report.status} 
            color={report.status === 'Completed' ? 'success' : 'warning'} 
          />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Date:</strong> {new Date(report.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Type:</strong> {report.type}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Report ID:</strong> {report.id}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="body1" paragraph>
          {report.description}
        </Typography>
      </Paper>
      
      <Typography variant="h5" component="h2" gutterBottom>
        Key Metrics
      </Typography>
      
      <Grid container spacing={3}>
        {report.metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {metric.name}
              </Typography>
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                {metric.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ReportDetail;
