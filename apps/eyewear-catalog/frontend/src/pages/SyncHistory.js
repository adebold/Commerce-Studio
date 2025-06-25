import React, { useState, useEffect, useCallback } from 'react';
import {
  Page,
  Layout,
  Card,
  DataTable,
  Pagination,
  TextStyle,
  Badge,
  Button,
  Banner,
  Modal,
  SkeletonBodyText,
  Stack,
  Link
} from '@shopify/polaris';
import { useApi } from '../providers/ApiProvider';
import { formatDistanceToNow } from 'date-fns';
import StatusIndicator from '../components/StatusIndicator';

function SyncHistory() {
  const { apiClient } = useApi();
  
  // State for sync jobs
  const [loading, setLoading] = useState(true);
  const [syncJobs, setSyncJobs] = useState([]);
  const [error, setError] = useState(null);
  
  // State for pagination
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 0,
    totalItems: 0,
    hasPrevious: false,
    hasNext: false
  });
  
  // State for job details modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  
  // Fetch sync jobs
  const fetchSyncJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch jobs
      const response = await apiClient.get('/api/sync/history', {
        params: {
          page: pagination.page,
          limit: 10
        }
      });
      
      setSyncJobs(response.data.jobs || []);
      
      // Update pagination
      setPagination({
        page: response.data.pagination?.page || 1,
        totalPages: response.data.pagination?.pages || 1,
        totalItems: response.data.pagination?.total || 0,
        hasPrevious: (response.data.pagination?.page || 1) > 1,
        hasNext: (response.data.pagination?.page || 1) < (response.data.pagination?.pages || 1)
      });
      
      setLoading(false);
    } catch (err) {
      setError('Error loading sync history. Please try again.');
      setLoading(false);
      console.error('Sync history fetch error:', err);
    }
  }, [apiClient, pagination.page]);
  
  // Handle pagination change
  const handlePaginationChange = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);
  
  // Show job details
  const handleShowDetails = useCallback((jobId) => {
    const job = syncJobs.find(job => job.jobId === jobId);
    
    if (job) {
      setSelectedJob(job);
      setDetailsModalOpen(true);
    }
  }, [syncJobs]);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()} (${formatDistanceToNow(date, { addSuffix: true })})`;
  };
  
  // Calculate duration
  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return 'N/A';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationMs = end - start;
    
    if (durationMs < 0) return 'N/A';
    
    // Format duration
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };
  
  // Load data on component mount
  useEffect(() => {
    fetchSyncJobs();
  }, [fetchSyncJobs]);
  
  // Prepare data table rows
  const rows = syncJobs.map(job => [
    job.jobId,
    formatDate(job.startedAt),
    <StatusIndicator status={job.status} />,
    job.stats?.processed || 0,
    job.stats?.imported || 0,
    job.stats?.updated || 0,
    job.errors?.length || 0,
    <Button size="slim" onClick={() => handleShowDetails(job.jobId)}>
      View Details
    </Button>
  ]);
  
  // Render loading state
  if (loading && syncJobs.length === 0) {
    return (
      <Page title="Sync History">
        <Card sectioned>
          <SkeletonBodyText />
        </Card>
      </Page>
    );
  }
  
  return (
    <Page 
      title="Sync History"
      breadcrumbs={[{ content: 'Dashboard', url: '/' }]}
    >
      {error && (
        <Layout.Section>
          <Banner status="critical" title="Error">
            <p>{error}</p>
          </Banner>
        </Layout.Section>
      )}
      
      <Card>
        {syncJobs.length === 0 ? (
          <Card.Section>
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <TextStyle variation="subdued">No sync history found</TextStyle>
            </div>
          </Card.Section>
        ) : (
          <>
            <DataTable
              columnContentTypes={[
                'text',
                'text',
                'text',
                'numeric',
                'numeric',
                'numeric',
                'numeric',
                'text'
              ]}
              headings={[
                'Job ID',
                'Date',
                'Status',
                'Processed',
                'Imported',
                'Updated',
                'Errors',
                'Actions'
              ]}
              rows={rows}
            />
            
            <div style={{ padding: '16px', textAlign: 'center' }}>
              <Pagination
                hasPrevious={pagination.hasPrevious}
                onPrevious={() => handlePaginationChange(pagination.page - 1)}
                hasNext={pagination.hasNext}
                onNext={() => handlePaginationChange(pagination.page + 1)}
              />
              <div style={{ marginTop: '8px' }}>
                <TextStyle variation="subdued">
                  Showing {syncJobs.length} of {pagination.totalItems} sync jobs
                </TextStyle>
              </div>
            </div>
          </>
        )}
      </Card>
      
      {/* Job Details Modal */}
      <Modal
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="Sync Job Details"
        large
      >
        {selectedJob && (
          <Modal.Section>
            <Card sectioned title="Overview">
              <Stack distribution="fillEvenly">
                <Stack.Item>
                  <TextStyle variation="strong">Job ID</TextStyle>
                  <p>{selectedJob.jobId}</p>
                </Stack.Item>
                <Stack.Item>
                  <TextStyle variation="strong">Status</TextStyle>
                  <p><StatusIndicator status={selectedJob.status} /></p>
                </Stack.Item>
                <Stack.Item>
                  <TextStyle variation="strong">Start Time</TextStyle>
                  <p>{formatDate(selectedJob.startedAt)}</p>
                </Stack.Item>
                <Stack.Item>
                  <TextStyle variation="strong">End Time</TextStyle>
                  <p>{formatDate(selectedJob.completedAt)}</p>
                </Stack.Item>
                <Stack.Item>
                  <TextStyle variation="strong">Duration</TextStyle>
                  <p>{calculateDuration(selectedJob.startedAt, selectedJob.completedAt || selectedJob.updatedAt)}</p>
                </Stack.Item>
              </Stack>
            </Card>
            
            <Card sectioned title="Statistics">
              <DataTable
                columnContentTypes={['text', 'numeric']}
                headings={['Metric', 'Value']}
                rows={[
                  ['Total Processed', selectedJob.stats?.processed || 0],
                  ['Imported', selectedJob.stats?.imported || 0],
                  ['Updated', selectedJob.stats?.updated || 0],
                  ['Skipped', selectedJob.stats?.skipped || 0],
                  ['Failed', selectedJob.stats?.failed || 0],
                  ['Total Brands', selectedJob.stats?.totalBrands || 0],
                  ['Processed Brands', selectedJob.stats?.processedBrands || 0]
                ]}
              />
            </Card>
            
            {selectedJob.errors && selectedJob.errors.length > 0 && (
              <Card sectioned title="Errors">
                <DataTable
                  columnContentTypes={['text', 'text', 'text', 'text']}
                  headings={['Type', 'ID', 'Name', 'Error']}
                  rows={selectedJob.errors.map(error => [
                    error.type || 'Unknown',
                    error.productId || error.brandId || 'N/A',
                    error.productTitle || error.brandName || 'N/A',
                    error.message || 'Unknown error'
                  ])}
                />
              </Card>
            )}
            
            {selectedJob.error && (
              <Banner status="critical" title="Job Error">
                <p>{selectedJob.error.message}</p>
                {selectedJob.error.stack && (
                  <details>
                    <summary>Error Details</summary>
                    <pre style={{ whiteSpace: 'pre-wrap' }}>{selectedJob.error.stack}</pre>
                  </details>
                )}
              </Banner>
            )}
            
            <div style={{ marginTop: '1rem', textAlign: 'right' }}>
              <Button onClick={() => setDetailsModalOpen(false)}>Close</Button>
            </div>
          </Modal.Section>
        )}
      </Modal>
    </Page>
  );
}

export default SyncHistory;