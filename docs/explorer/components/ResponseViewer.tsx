import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Card, Typography, Button } from '../../../frontend/src/design-system/components';
import { GridContainer, GridItem } from '../../../frontend/src/design-system/components/Layout/ResponsiveGrid';

// Response interface
export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  contentType: string;
  time: number;
  size: number;
}

interface ResponseViewerProps {
  response: ApiResponse | null;
  loading: boolean;
}

const ResponseContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.spacing[16]};
`;

const StatusBadge = styled.span<{ $status: number }>`
  display: inline-block;
  padding: ${({ theme }) => `${theme.spacing.spacing[4]} ${theme.spacing.spacing[8]}`};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-left: ${({ theme }) => theme.spacing.spacing[8]};
  
  background-color: ${({ $status, theme }) => {
    if ($status >= 200 && $status < 300) return theme.colors.success.light;
    if ($status >= 300 && $status < 400) return theme.colors.info.light;
    if ($status >= 400 && $status < 500) return theme.colors.warning.light;
    if ($status >= 500) return theme.colors.error.light;
    return theme.colors.neutral[300];
  }};
  
  color: ${({ $status, theme }) => {
    if ($status >= 200 && $status < 300) return theme.colors.success.dark;
    if ($status >= 300 && $status < 400) return theme.colors.info.dark;
    if ($status >= 400 && $status < 500) return theme.colors.warning.dark;
    if ($status >= 500) return theme.colors.error.dark;
    return theme.colors.neutral[800];
  }};
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral[300]};
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
`;

const Tab = styled.button<{ $isActive: boolean }>`
  padding: ${({ theme }) => `${theme.spacing.spacing[8]} ${theme.spacing.spacing[16]}`};
  background: none;
  border: none;
  border-bottom: 2px solid ${({ $isActive, theme }) => 
    $isActive ? theme.colors.primary[500] : 'transparent'};
  color: ${({ $isActive, theme }) => 
    $isActive ? theme.colors.primary[500] : theme.colors.neutral[700]};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary[500]};
  }
  
  &:focus {
    outline: none;
    box-shadow: ${({ theme }) => theme.shadows.effects.focus};
  }
`;

const ContentViewer = styled.pre`
  background-color: ${({ theme }) => theme.colors.neutral[100]};
  padding: ${({ theme }) => theme.spacing.spacing[12]};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  overflow: auto;
  max-height: 400px;
  font-family: monospace;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  border: 1px solid ${({ theme }) => theme.colors.neutral[300]};
`;

const HeadersTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: ${({ theme }) => `${theme.spacing.spacing[8]} ${theme.spacing.spacing[12]}`};
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.neutral[200]};
  }
  
  th {
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    background-color: ${({ theme }) => theme.colors.neutral[100]};
  }
`;

const MetricsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.spacing[16]};
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
`;

const MetricItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const MetricValue = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.primary[500]};
`;

const MetricLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.neutral[600]};
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.spacing[32]};
  
  &::after {
    content: '';
    width: 40px;
    height: 40px;
    border: 4px solid ${({ theme }) => theme.colors.neutral[200]};
    border-top-color: ${({ theme }) => theme.colors.primary[500]};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.spacing[32]};
  color: ${({ theme }) => theme.colors.neutral[600]};
  text-align: center;
`;

/**
 * ResponseViewer Component
 * 
 * Displays API response details including status, headers, and body.
 */
export const ResponseViewer: React.FC<ResponseViewerProps> = ({
  response,
  loading
}) => {
  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body');
  
  // Format JSON for display
  const formatJson = (jsonString: string): string => {
    try {
      return JSON.stringify(JSON.parse(jsonString), null, 2);
    } catch {
      return jsonString;
    }
  };
  
  // Format response body based on content type
  const formatResponseBody = (body: string, contentType: string): string => {
    if (contentType.includes('application/json')) {
      return formatJson(body);
    }
    return body;
  };
  
  // Format file size
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card>
      <Card.Content>
        <Typography variant="h5" gutterBottom>Response</Typography>
        
        {loading ? (
          <LoadingIndicator />
        ) : response ? (
          <ResponseContainer>
            <div>
              <Typography variant="h6" style={{ display: 'inline' }}>
                Status:
                <StatusBadge $status={response.status}>
                  {response.status} {response.statusText}
                </StatusBadge>
              </Typography>
            </div>
            
            <MetricsContainer>
              <MetricItem>
                <MetricValue>{response.time.toFixed(0)} ms</MetricValue>
                <MetricLabel>Response Time</MetricLabel>
              </MetricItem>
              <MetricItem>
                <MetricValue>{formatSize(response.size)}</MetricValue>
                <MetricLabel>Size</MetricLabel>
              </MetricItem>
            </MetricsContainer>
            
            <TabContainer>
              <Tab 
                $isActive={activeTab === 'body'} 
                onClick={() => setActiveTab('body')}
              >
                Response Body
              </Tab>
              <Tab 
                $isActive={activeTab === 'headers'} 
                onClick={() => setActiveTab('headers')}
              >
                Response Headers
              </Tab>
            </TabContainer>
            
            {activeTab === 'body' ? (
              <ContentViewer>
                {formatResponseBody(response.body, response.contentType)}
              </ContentViewer>
            ) : (
              <HeadersTable>
                <thead>
                  <tr>
                    <th>Header</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(response.headers).map(([key, value]) => (
                    <tr key={key}>
                      <td>{key}</td>
                      <td>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </HeadersTable>
            )}
          </ResponseContainer>
        ) : (
          <EmptyState>
            <Typography variant="body1" gutterBottom>
              No response data available
            </Typography>
            <Typography variant="body2">
              Send a request to see the response here
            </Typography>
          </EmptyState>
        )}
      </Card.Content>
    </Card>
  );
};

export default ResponseViewer;