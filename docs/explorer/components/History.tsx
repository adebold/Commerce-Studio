import React from 'react';
import styled from '@emotion/styled';
import { Card, Typography, Button } from '../../../frontend/src/design-system/components';
import { HttpMethod } from './RequestMethod';

// History item interface
export interface HistoryItem {
  id: string;
  timestamp: number;
  method: HttpMethod;
  url: string;
  status?: number;
  responseTime?: number;
  successful?: boolean;
}

interface HistoryProps {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

const HistoryContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.spacing[16]};
  max-height: 400px;
  overflow-y: auto;
`;

const HistoryList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const HistoryItemContainer = styled.li<{ $successful?: boolean }>`
  padding: ${({ theme }) => theme.spacing.spacing[12]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral[200]};
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.neutral[100]};
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  ${({ $successful, theme }) => $successful !== undefined && `
    border-left: 3px solid ${$successful ? theme.colors.success.main : theme.colors.error.main};
  `}
`;

const MethodBadge = styled.span<{ $method: HttpMethod }>`
  display: inline-block;
  padding: ${({ theme }) => `${theme.spacing.spacing[2]} ${theme.spacing.spacing[6]}`};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  margin-right: ${({ theme }) => theme.spacing.spacing[8]};
  min-width: 50px;
  text-align: center;
  
  background-color: ${({ $method }) => {
    switch ($method) {
      case HttpMethod.GET: return '#61affe';
      case HttpMethod.POST: return '#49cc90';
      case HttpMethod.PUT: return '#fca130';
      case HttpMethod.DELETE: return '#f93e3e';
      case HttpMethod.PATCH: return '#50e3c2';
      case HttpMethod.HEAD: return '#9012fe';
      case HttpMethod.OPTIONS: return '#0d5aa7';
      default: return '#eeeeee';
    }
  }};
  
  color: white;
`;

const StatusBadge = styled.span<{ $status?: number }>`
  display: inline-block;
  padding: ${({ theme }) => `${theme.spacing.spacing[2]} ${theme.spacing.spacing[6]}`};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  margin-left: ${({ theme }) => theme.spacing.spacing[8]};
  
  ${({ $status, theme }) => {
    if (!$status) return `
      background-color: ${theme.colors.neutral[200]};
      color: ${theme.colors.neutral[700]};
    `;
    
    if ($status >= 200 && $status < 300) return `
      background-color: ${theme.colors.success.light};
      color: ${theme.colors.success.dark};
    `;
    
    if ($status >= 300 && $status < 400) return `
      background-color: ${theme.colors.info.light};
      color: ${theme.colors.info.dark};
    `;
    
    if ($status >= 400 && $status < 500) return `
      background-color: ${theme.colors.warning.light};
      color: ${theme.colors.warning.dark};
    `;
    
    return `
      background-color: ${theme.colors.error.light};
      color: ${theme.colors.error.dark};
    `;
  }}
`;

const HistoryItemUrl = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-top: ${({ theme }) => theme.spacing.spacing[4]};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ theme }) => theme.colors.neutral[700]};
`;

const HistoryItemTime = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.neutral[600]};
  margin-top: ${({ theme }) => theme.spacing.spacing[4]};
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

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
`;

/**
 * History Component
 * 
 * Displays a history of API requests and allows users to select and reuse them.
 */
export const History: React.FC<HistoryProps> = ({
  items,
  onSelect,
  onClear
}) => {
  // Format timestamp to readable date
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <Card>
      <Card.Content>
        <HeaderContainer>
          <Typography variant="h5">Request History</Typography>
          {items.length > 0 && (
            <Button 
              variant="tertiary" 
              size="small" 
              onClick={onClear}
            >
              Clear History
            </Button>
          )}
        </HeaderContainer>
        
        {items.length > 0 ? (
          <HistoryContainer>
            <HistoryList>
              {items.map((item) => (
                <HistoryItemContainer 
                  key={item.id} 
                  onClick={() => onSelect(item)}
                  $successful={item.successful}
                >
                  <div>
                    <MethodBadge $method={item.method}>
                      {item.method}
                    </MethodBadge>
                    {item.status && (
                      <StatusBadge $status={item.status}>
                        {item.status}
                      </StatusBadge>
                    )}
                    {item.responseTime && (
                      <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>
                        {item.responseTime} ms
                      </span>
                    )}
                  </div>
                  
                  <HistoryItemUrl>{item.url}</HistoryItemUrl>
                  <HistoryItemTime>{formatTimestamp(item.timestamp)}</HistoryItemTime>
                </HistoryItemContainer>
              ))}
            </HistoryList>
          </HistoryContainer>
        ) : (
          <EmptyState>
            <Typography variant="body1" gutterBottom>
              No request history
            </Typography>
            <Typography variant="body2">
              Your API request history will appear here
            </Typography>
          </EmptyState>
        )}
      </Card.Content>
    </Card>
  );
};

export default History;