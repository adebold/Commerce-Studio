import React, { useState, useEffect, useCallback } from 'react';
import { 
  Page, 
  Layout, 
  Card, 
  Button, 
  Banner, 
  SkeletonBodyText, 
  SkeletonDisplayText,
  TextContainer,
  Stack,
  Badge,
  Heading,
  TextStyle,
  DataTable,
  EmptyState
} from '@shopify/polaris';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../providers/ApiProvider';
import { formatDistanceToNow } from 'date-fns';
import StatusIndicator from '../components/StatusIndicator';
import SyncProgressBar from '../components/SyncProgressBar';

function Dashboard() {
  const { apiClient } = useApi();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncStats, setSyncStats] = useState(null);
  const [syncJobs, setSyncJobs] = useState([]);
  const [error, setError] = useState(null);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get sync status
      const statusResponse = await apiClient.get('/api/sync/status');
      setSyncStatus(statusResponse.data);
      
      // Get sync statistics
      const statsResponse = await apiClient.get('/api/sync/stats');
      setSyncStats(statsResponse.data);
      
      // Get recent sync jobs
      const jobsResponse = await apiClient.get('/api/sync/history', { 
        params: { limit: 5 } 
      });
      setSyncJobs(jobsResponse.data.jobs || []);
      
      setLoading(false);
    } catch (err) {
      setError('Error loading dashboard data. Please try again.');
      setLoading(false);
      console.error('Dashboard data fetch error:', err);
    }
  }, [apiClient]);
  
  // Start a new sync
  const handleStartSync = useCallback(async () => {
    try {
      await apiClient.post('/api/sync/start');
      // Refetch data to show updated status
      fetchDashboardData();
    } catch (err) {
      setError('Error starting sync. Please try again.');
      console.error('Start sync error:', err);
    }
  }, [apiClient, fetchDashboardData]);
  
  // Cancel running sync
  const handleCancelSync = useCallback(async () => {
    try {
      await apiClient.post('/api/sync/cancel');
      // Refetch data to show updated status
      fetchDashboardData();
    } catch (err) {
      setError('Error cancelling sync. Please try again.');
      console.error('Cancel sync error:', err);
    }
  }, [apiClient, fetchDashboardData]);
  
  // Navigate to settings
  const handleGoToSettings = useCallback(() => {
    navigate('/settings');
  }, [navigate]);
  
  // Navigate to products
  const handleGoToProducts = useCallback(() => {
    navigate('/products');
  }, [navigate]);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} (${formatDistanceToNow(date, { addSuffix: true })})`;
  };
  
  // Load data on component mount
  useEffect(() => {
    fetchDashboardData();
    
    // Set up polling for status updates if sync is running
    let interval;
    if (syncStatus && ['initializing', 'in_progress'].includes(syncStatus.status)) {
      interval = setInterval(fetchDashboardData, 5000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchDashboardData, syncStatus]);
  
  // Render loading state
  if (loading && !syncStatus) {
    return (
      <Page title="Dashboard">
        <Layout>
          <Layout.Section>
            <Card sectioned>
              <SkeletonDisplayText size="small" />
              <SkeletonBodyText />
            </Card>
          </Layout.Section>
          <Layout.Section secondary>
            <Card sectioned>
              <SkeletonDisplayText size="small" />
              <SkeletonBodyText />
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }
  
  // Determine sync status display
  const getSyncStatusDisplay = () => {
    if (!syncStatus) {
      return (
        <Banner title="No sync information available">
          <p>Start your first sync to import products from the eyewear database.</p>
        </Banner>
      );
    }
    
    const isRunning = ['initializing', 'in_progress'].includes(syncStatus.status);
    
    return (
      <Card sectioned>
        <Stack>
          <Stack.Item fill>
            <Heading>Sync Status</Heading>
          </Stack.Item>
          <Stack.Item>
            <StatusIndicator status={syncStatus.status} />
          </Stack.Item>
        </Stack>
        
        {isRunning && (
          <>
            <SyncProgressBar syncStatus={syncStatus} />
            <div style={{ marginTop: '1rem' }}>
              <Button onClick={handleCancelSync} destructive>Cancel Sync</Button>
            </div>
          </>
        )}
        
        {syncStatus.status === 'completed' && (
          <TextContainer>
            <p>
              Last sync completed {formatDate(syncStatus.completedAt)}.
              {syncStatus.stats && (
                <span> Processed {syncStatus.stats.processed} products 
                ({syncStatus.stats.imported} imported, {syncStatus.stats.updated} updated).</span>
              )}
            </p>
            <div style={{ marginTop: '1rem' }}>
              <Button onClick={handleStartSync} primary>Start New Sync</Button>
            </div>
          </TextContainer>
        )}
        
        {(syncStatus.status === 'error' || syncStatus.status === 'cancelled') && (
          <TextContainer>
            <p>
              {syncStatus.status === 'error' ? 'Sync failed' : 'Sync cancelled'} {formatDate(syncStatus.updatedAt)}.
              {syncStatus.error && <div style={{ color: 'var(--p-text-critical)' }}>{syncStatus.error.message}</div>}
            </p>
            <div style={{ marginTop: '1rem' }}>
              <Button onClick={handleStartSync} primary>Retry Sync</Button>
            </div>
          </TextContainer>
        )}
        
        {!isRunning && syncStatus.status !== 'completed' && 
          syncStatus.status !== 'error' && syncStatus.status !== 'cancelled' && (
          <div style={{ marginTop: '1rem' }}>
            <Button onClick={handleStartSync} primary>Start Sync</Button>
          </div>
        )}
      </Card>
    );
  };
  
  // Render scheduled sync information
  const getScheduledSyncInfo = () => {
    if (!syncStats || !syncStats.lastSyncJob || !syncStats.lastSyncJob.options) {
      return null;
    }
    
    const settings = syncStats.lastSyncJob.options;
    
    if (!settings.cronExpression) {
      return null;
    }
    
    return (
      <Card sectioned title="Scheduled Sync">
        <TextContainer>
          <p>
            <TextStyle>Schedule: </TextStyle>
            <code>{settings.cronExpression}</code>
          </p>
          <p>
            <Button onClick={handleGoToSettings}>Manage Schedule</Button>
          </p>
        </TextContainer>
      </Card>
    );
  };
  
  // Render statistics cards
  const getStatisticsCards = () => {
    if (!syncStats) {
      return (
        <Card sectioned title="Product Statistics">
          <SkeletonBodyText />
        </Card>
      );
    }
    
    return (
      <Card sectioned title="Product Statistics">
        <Stack distribution="fillEvenly">
          <Stack.Item>
            <TextContainer>
              <Heading>Total</Heading>
              <p><TextStyle variation="strong">{syncStats.total || 0}</TextStyle> products</p>
            </TextContainer>
          </Stack.Item>
          <Stack.Item>
            <TextContainer>
              <Heading>Imported</Heading>
              <p><TextStyle variation="strong">{syncStats.imported || 0}</TextStyle> products</p>
            </TextContainer>
          </Stack.Item>
          <Stack.Item>
            <TextContainer>
              <Heading>Updated</Heading>
              <p><TextStyle variation="strong">{syncStats.updated || 0}</TextStyle> products</p>
            </TextContainer>
          </Stack.Item>
          <Stack.Item>
            <TextContainer>
              <Heading>Errors</Heading>
              <p><TextStyle variation="strong">{syncStats.error || 0}</TextStyle> products</p>
            </TextContainer>
          </Stack.Item>
        </Stack>
        
        <div style={{ marginTop: '1rem' }}>
          <Button onClick={handleGoToProducts}>View Products</Button>
        </div>
      </Card>
    );
  };
  
  // Render recent sync jobs
  const getRecentSyncJobs = () => {
    if (syncJobs.length === 0) {
      return (
        <Card sectioned title="Recent Sync Activity">
          <EmptyState
            heading="No sync jobs yet"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <p>Start your first sync to see the history here.</p>
          </EmptyState>
        </Card>
      );
    }
    
    const rows = syncJobs.map(job => [
      formatDate(job.startedAt),
      <StatusIndicator status={job.status} />,
      job.stats?.processed || 0,
      job.stats?.imported || 0,
      job.stats?.updated || 0,
      job.errors?.length || 0
    ]);
    
    return (
      <Card sectioned title="Recent Sync Activity">
        <DataTable
          columnContentTypes={['text', 'text', 'numeric', 'numeric', 'numeric', 'numeric']}
          headings={['Date', 'Status', 'Processed', 'Imported', 'Updated', 'Errors']}
          rows={rows}
        />
        
        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
          <Button onClick={() => navigate('/history')}>View Full History</Button>
        </div>
      </Card>
    );
  };
  
  return (
    <Page 
      title="Eyewear Catalog Dashboard"
      primaryAction={{
        content: 'Start Sync',
        onAction: handleStartSync,
        disabled: syncStatus && ['initializing', 'in_progress'].includes(syncStatus.status)
      }}
    >
      {error && (
        <Layout.Section>
          <Banner status="critical" title="Error">
            <p>{error}</p>
          </Banner>
        </Layout.Section>
      )}
      
      <Layout>
        <Layout.Section>
          {getSyncStatusDisplay()}
          {getRecentSyncJobs()}
        </Layout.Section>
        
        <Layout.Section secondary>
          {getStatisticsCards()}
          {getScheduledSyncInfo()}
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export default Dashboard;