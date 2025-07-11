import React from 'react';
import { ProgressBar, Stack, TextStyle, Spinner } from '@shopify/polaris';

/**
 * Displays sync progress information with a progress bar
 * and current status details
 */
function SyncProgressBar({ syncStatus }) {
  // Return nothing if no sync status is provided
  if (!syncStatus) {
    return null;
  }
  
  // Return nothing if sync is not in progress
  if (!['initializing', 'in_progress'].includes(syncStatus.status)) {
    return null;
  }
  
  // Calculate progress percentage
  const calculateProgress = () => {
    if (syncStatus.status === 'initializing') {
      return 0;
    }
    
    const { stats } = syncStatus;
    
    if (!stats || !stats.total || stats.total === 0) {
      return 0;
    }
    
    const progress = (stats.processed / stats.total) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };
  
  // Get status message
  const getStatusMessage = () => {
    if (syncStatus.status === 'initializing') {
      return 'Initializing sync process...';
    }
    
    const { stats, currentBrand, currentProduct } = syncStatus;
    
    if (!stats) {
      return 'Processing...';
    }
    
    let message = `Processing ${stats.processed || 0} of ${stats.total || '?'} products`;
    
    if (currentBrand) {
      message += ` - Brand: ${currentBrand}`;
    }
    
    if (currentProduct) {
      message += ` - Current: ${currentProduct.title || 'Unknown product'}`;
    }
    
    return message;
  };
  
  // Get progress statistics
  const getProgressStats = () => {
    const { stats } = syncStatus;
    
    if (!stats) {
      return null;
    }
    
    return (
      <Stack distribution="equalSpacing" spacing="tight">
        <Stack.Item>
          <TextStyle variation="subdued">
            Processed: {stats.processed || 0}
          </TextStyle>
        </Stack.Item>
        <Stack.Item>
          <TextStyle variation="positive">
            Imported: {stats.imported || 0}
          </TextStyle>
        </Stack.Item>
        <Stack.Item>
          <TextStyle variation="strong">
            Updated: {stats.updated || 0}
          </TextStyle>
        </Stack.Item>
        <Stack.Item>
          <TextStyle variation="subdued">
            Skipped: {stats.skipped || 0}
          </TextStyle>
        </Stack.Item>
        {stats.failed > 0 && (
          <Stack.Item>
            <TextStyle variation="negative">
              Failed: {stats.failed}
            </TextStyle>
          </Stack.Item>
        )}
      </Stack>
    );
  };
  
  const progress = calculateProgress();
  
  return (
    <div style={{ marginTop: '1rem' }}>
      <Stack vertical spacing="tight">
        <Stack alignment="center" spacing="tight">
          {progress === 0 && <Spinner size="small" />}
          <Stack.Item fill>
            <TextStyle>{getStatusMessage()}</TextStyle>
          </Stack.Item>
          <Stack.Item>
            <TextStyle>{progress.toFixed(0)}%</TextStyle>
          </Stack.Item>
        </Stack>
        
        <ProgressBar progress={progress} size="small" />
        
        <div style={{ marginTop: '0.5rem' }}>
          {getProgressStats()}
        </div>
      </Stack>
    </div>
  );
}

export default SyncProgressBar;