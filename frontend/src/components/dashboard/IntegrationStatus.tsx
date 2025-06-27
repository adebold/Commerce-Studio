import React from 'react';
import { Box, CircularProgress, Chip, Typography } from '@mui/material';
import { CommerceAppMetrics } from '../../types/commerce';

interface IntegrationStatusProps {
  loading?: boolean;
}

const StatusContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.spacing[16]};
`;

const IntegrationItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.spacing[12]};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  background-color: ${({ theme }) => theme.colors.neutral[50]};
  border: 1px solid ${({ theme }) => theme.colors.neutral[200]};
`;

const IntegrationInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.spacing[12]};
`;

const IntegrationLogo = styled.div<{ platform: string }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, platform }) => {
    switch (platform) {
      case 'shopify': return '#96bf48';
      case 'woocommerce': return '#7f54b3';
      case 'bigcommerce': return '#34313f';
      case 'magento': return '#f26322';
      default: return theme.colors.neutral[300];
    }
  }};
  color: white;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
`;

const MetricsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.spacing[16]};
  margin-top: ${({ theme }) => theme.spacing.spacing[8]};
`;

const MetricItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatusChip = styled(Chip)<{ status: 'online' | 'offline' | 'maintenance' }>`
  background-color: ${({ theme, status }) => {
    switch (status) {
      case 'online': return theme.colors.semantic.success.light;
      case 'offline': return theme.colors.semantic.error.light;
      case 'maintenance': return theme.colors.semantic.warning.light;
      default: return theme.colors.neutral[100];
    }
  }};
  color: ${({ theme, status }) => {
    switch (status) {
      case 'online': return theme.colors.semantic.success.dark;
      case 'offline': return theme.colors.semantic.error.dark;
      case 'maintenance': return theme.colors.semantic.warning.dark;
      default: return theme.colors.neutral[800];
    }
  }};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

// Mock data for integration status
const mockIntegrations: Record<string, CommerceAppMetrics> = {
  shopify: {
    deploymentStatus: 'online',
    apiResponseTime: 150,
    errorRate: 0.01,
    activeUsers: 1200,
    lastDeployment: new Date(),
    buildStatus: 'success'
  },
  woocommerce: {
    deploymentStatus: 'online',
    apiResponseTime: 180,
    errorRate: 0.02,
    activeUsers: 800,
    lastDeployment: new Date(),
    buildStatus: 'success'
  },
  bigcommerce: {
    deploymentStatus: 'offline',
    apiResponseTime: 165,
    errorRate: 0.015,
    activeUsers: 600,
    lastDeployment: new Date(),
    buildStatus: 'in_progress'
  },
  magento: {
    deploymentStatus: 'online',
    apiResponseTime: 200,
    errorRate: 0.025,
    activeUsers: 400,
    lastDeployment: new Date(),
    buildStatus: 'success'
  }
};

const IntegrationStatus: React.FC<IntegrationStatusProps> = ({ loading = false }) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <CircularProgress />
      </Box>
    );
  }

  const getPlatformName = (key: string): string => {
    switch (key) {
      case 'shopify': return 'Shopify';
      case 'woocommerce': return 'WooCommerce';
      case 'bigcommerce': return 'BigCommerce';
      case 'magento': return 'Magento';
      default: return key;
    }
  };

  const getPlatformInitial = (key: string): string => {
    return key.charAt(0).toUpperCase();
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Integration Status</Typography>
        <Typography variant="body2" color="textSecondary">Real-time</Typography>
      </Box>
      
      <StatusContainer>
        {Object.entries(mockIntegrations).map(([platform, metrics]) => (
          <IntegrationItem key={platform}>
            <IntegrationInfo>
              <IntegrationLogo platform={platform}>
                {getPlatformInitial(platform)}
              </IntegrationLogo>
              <div>
                <Typography variant="h6">{getPlatformName(platform)}</Typography>
                <MetricsContainer>
                  <MetricItem>
                    <Typography variant="caption" color="textSecondary">Response</Typography>
                    <Typography variant="body2">{metrics.apiResponseTime}ms</Typography>
                  </MetricItem>
                  <MetricItem>
                    <Typography variant="caption" color="textSecondary">Error Rate</Typography>
                    <Typography variant="body2">{(metrics.errorRate * 100).toFixed(1)}%</Typography>
                  </MetricItem>
                  <MetricItem>
                    <Typography variant="caption" color="textSecondary">Users</Typography>
                    <Typography variant="body2">{metrics.activeUsers.toLocaleString()}</Typography>
                  </MetricItem>
                </MetricsContainer>
              </div>
            </IntegrationInfo>
            <StatusChip 
              label={metrics.deploymentStatus.toUpperCase()} 
              status={metrics.deploymentStatus === 'error' ? 'offline' : metrics.deploymentStatus as 'online' | 'offline' | 'maintenance'}
              size="small"
            />
          </IntegrationItem>
        ))}
      </StatusContainer>
    </Box>
  );
};

export default IntegrationStatus;