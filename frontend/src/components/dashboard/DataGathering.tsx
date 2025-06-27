import { useState, useEffect } from 'react';
import { getScrapingStats, getScrapeLogs, triggerScrape, testApiConnection } from '../../services/scraping';
import type { ScrapingStats, ScrapeLog } from '../../services/scraping';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Snackbar,
  Card,
  CardContent
} from '@mui/material';
import MetricCard from './MetricCard';

const DataGathering = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState(false);
  const [scrapingStats, setScrapingStats] = useState<ScrapingStats>({
    total_scrapes: 0,
    avg_content_success_rate: 0,
    avg_image_success_rate: 0,
    total_items_processed: 0
  });
  const [scrapeLogs, setScrapeLogs] = useState<ScrapeLog[]>([]);

  const fetchScrapingStats = async () => {
    try {
      const stats = await getScrapingStats();
      setScrapingStats(stats);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch scraping stats';
      console.error('Failed to fetch scraping stats:', errorMessage);
      setError(errorMessage);
      return false;
    }
  };

  const fetchScrapeLogs = async () => {
    try {
      const logs = await getScrapeLogs();
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setScrapeLogs(logs);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch scrape logs';
      console.error('Failed to fetch scrape logs:', errorMessage);
      setError(errorMessage);
      return false;
    }
  };

  const handleTriggerScrape = async () => {
    if (connectionError) {
      setError('Cannot trigger scrape: No connection to backend server');
      return;
    }

    setIsLoading(true);
    try {
      const response = await triggerScrape();
      console.log('Scrape triggered:', response);
      await Promise.all([fetchScrapingStats(), fetchScrapeLogs()]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to trigger scrape';
      console.error('Failed to trigger scrape:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const retryConnection = async () => {
    setIsLoading(true);
    setError(null);
    await initializeData();
  };

  const initializeData = async () => {
    console.log('Initializing Data Gathering dashboard...');
    
    try {
      // Test API connection
      console.log('Testing API connection...');
      const isConnected = await testApiConnection();
      if (!isConnected) {
        setConnectionError(true);
        throw new Error('Cannot connect to backend server. Please ensure the server is running.');
      }
      setConnectionError(false);
      
      // Fetch initial data
      console.log('Fetching initial data...');
      const [statsSuccess, logsSuccess] = await Promise.all([
        fetchScrapingStats(),
        fetchScrapeLogs()
      ]);
      
      if (statsSuccess && logsSuccess) {
        console.log('Initial data fetch successful');
        setIsInitialized(true);
      } else {
        throw new Error('Failed to fetch initial data');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize data';
      console.error('Initialization error:', errorMessage);
      setError(errorMessage);
      setIsInitialized(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeData();
  }, []);

  const handleCloseError = () => {
    setError(null);
  };

  if (isLoading && !isInitialized) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (connectionError) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Card>
          <CardContent>
            <Typography variant="h6" color="error" gutterBottom>
              Connection Error
            </Typography>
            <Typography variant="body1" paragraph>
              Cannot connect to backend server. Please ensure the server is running.
            </Typography>
            <Button variant="contained" onClick={retryConnection}>
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {!isInitialized && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to initialize dashboard. Please check the console for more details.
        </Alert>
      )}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Data Gathering Dashboard</Typography>
        <Button 
          variant="contained" 
          onClick={handleTriggerScrape}
          disabled={isLoading || connectionError}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {isLoading ? 'Scraping...' : 'Trigger New Scrape'}
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Scrapes"
            value={scrapingStats.total_scrapes.toString()}
            subtitle="Total number of scraping operations"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Content Success Rate"
            value={`${scrapingStats.avg_content_success_rate.toFixed(1)}%`}
            subtitle="Average success rate for content scraping"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Image Success Rate"
            value={`${scrapingStats.avg_image_success_rate.toFixed(1)}%`}
            subtitle="Average success rate for image scraping"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Items Processed"
            value={scrapingStats.total_items_processed.toString()}
            subtitle="Total number of items processed"
          />
        </Grid>
      </Grid>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Typography variant="h6" sx={{ p: 2 }}>Scraping History</Typography>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell align="right">Total Items</TableCell>
                <TableCell align="right">Content Success</TableCell>
                <TableCell align="right">Image Success</TableCell>
                <TableCell align="right">Content Rate</TableCell>
                <TableCell align="right">Image Rate</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scrapeLogs.map((log, index) => (
                <TableRow key={index}>
                  <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                  <TableCell align="right">{log.total_items}</TableCell>
                  <TableCell align="right">{log.successful_content}</TableCell>
                  <TableCell align="right">{log.successful_images}</TableCell>
                  <TableCell align="right">{`${log.content_success_rate.toFixed(1)}%`}</TableCell>
                  <TableCell align="right">{`${log.image_success_rate.toFixed(1)}%`}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default DataGathering;
