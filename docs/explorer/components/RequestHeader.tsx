import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Card, Typography, Input, Button } from '../../../frontend/src/design-system/components';

// Header interface
export interface RequestHeaderItem {
  id: string;
  name: string;
  value: string;
  enabled: boolean;
}

// Common headers for autocomplete
const COMMON_HEADERS = [
  'Accept',
  'Accept-Encoding',
  'Accept-Language',
  'Authorization',
  'Cache-Control',
  'Content-Type',
  'Content-Length',
  'Cookie',
  'Host',
  'Origin',
  'Referer',
  'User-Agent',
  'X-API-Key',
  'X-Requested-With'
];

interface RequestHeaderProps {
  headers: RequestHeaderItem[];
  onChange: (headers: RequestHeaderItem[]) => void;
}

const HeaderContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[8]};
  gap: ${({ theme }) => theme.spacing.spacing[8]};
`;

const Checkbox = styled.input`
  margin-right: ${({ theme }) => theme.spacing.spacing[8]};
  width: 18px;
  height: 18px;
`;

const SuggestionsContainer = styled.div`
  position: relative;
`;

const Suggestions = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  list-style: none;
  padding: 0;
  margin: 0;
  background-color: ${({ theme }) => theme.colors.neutral.white};
  border: 1px solid ${({ theme }) => theme.colors.neutral[300]};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  box-shadow: ${({ theme }) => theme.shadows.effects.dropdown};
  max-height: 200px;
  overflow-y: auto;
`;

const SuggestionItem = styled.li`
  padding: ${({ theme }) => `${theme.spacing.spacing[8]} ${theme.spacing.spacing[12]}`};
  cursor: pointer;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.neutral[100]};
  }
`;

const CommonHeadersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.spacing[8]};
  margin-top: ${({ theme }) => theme.spacing.spacing[16]};
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
`;

const CommonHeaderChip = styled.div`
  background-color: ${({ theme }) => theme.colors.neutral[100]};
  border: 1px solid ${({ theme }) => theme.colors.neutral[300]};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  padding: ${({ theme }) => `${theme.spacing.spacing[4]} ${theme.spacing.spacing[8]}`};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: pointer;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.neutral[200]};
  }
`;

/**
 * RequestHeader Component
 * 
 * Allows users to configure HTTP headers for API requests.
 */
export const RequestHeader: React.FC<RequestHeaderProps> = ({
  headers,
  onChange
}) => {
  const [newHeaderName, setNewHeaderName] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Add a new header
  const handleAddHeader = () => {
    if (!newHeaderName.trim()) return;
    
    const newHeader: RequestHeaderItem = {
      id: `header-${Date.now()}`,
      name: newHeaderName,
      value: '',
      enabled: true
    };
    
    onChange([...headers, newHeader]);
    setNewHeaderName('');
  };
  
  // Update a header
  const handleUpdateHeader = (id: string, field: 'name' | 'value' | 'enabled', value: any) => {
    const updatedHeaders = headers.map(header => 
      header.id === id ? { ...header, [field]: value } : header
    );
    onChange(updatedHeaders);
  };
  
  // Remove a header
  const handleRemoveHeader = (id: string) => {
    const updatedHeaders = headers.filter(header => header.id !== id);
    onChange(updatedHeaders);
  };
  
  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: string) => {
    setNewHeaderName(suggestion);
    setShowSuggestions(false);
  };
  
  // Filter suggestions based on input
  const filteredSuggestions = COMMON_HEADERS.filter(header => 
    header.toLowerCase().includes(newHeaderName.toLowerCase()) && 
    !headers.some(h => h.name.toLowerCase() === header.toLowerCase())
  );
  
  // Add a common header
  const handleAddCommonHeader = (headerName: string) => {
    if (headers.some(h => h.name.toLowerCase() === headerName.toLowerCase())) {
      return;
    }
    
    const newHeader: RequestHeaderItem = {
      id: `header-${Date.now()}`,
      name: headerName,
      value: '',
      enabled: true
    };
    
    onChange([...headers, newHeader]);
  };
  
  // Get unused common headers
  const unusedCommonHeaders = COMMON_HEADERS.filter(header => 
    !headers.some(h => h.name.toLowerCase() === header.toLowerCase())
  );

  return (
    <Card>
      <Card.Content>
        <Typography variant="h5" gutterBottom>Request Headers</Typography>
        <Typography variant="body2" gutterBottom>
          Configure HTTP headers to send with your request.
        </Typography>
        
        {unusedCommonHeaders.length > 0 && (
          <>
            <Typography variant="body2" gutterBottom style={{ marginTop: '16px' }}>
              Common Headers:
            </Typography>
            <CommonHeadersContainer>
              {unusedCommonHeaders.slice(0, 8).map(header => (
                <CommonHeaderChip 
                  key={header} 
                  onClick={() => handleAddCommonHeader(header)}
                >
                  {header}
                </CommonHeaderChip>
              ))}
            </CommonHeadersContainer>
          </>
        )}
        
        <HeaderContainer>
          {headers.map((header) => (
            <HeaderRow key={header.id}>
              <Checkbox
                type="checkbox"
                checked={header.enabled}
                onChange={(e) => handleUpdateHeader(header.id, 'enabled', e.target.checked)}
              />
              <Input
                placeholder="Header name"
                value={header.name}
                onChange={(e) => handleUpdateHeader(header.id, 'name', e.target.value)}
                style={{ flex: 1 }}
              />
              <Input
                placeholder="Value"
                value={header.value}
                onChange={(e) => handleUpdateHeader(header.id, 'value', e.target.value)}
                style={{ flex: 1 }}
              />
              <Button
                variant="tertiary"
                onClick={() => handleRemoveHeader(header.id)}
                aria-label="Remove header"
              >
                Remove
              </Button>
            </HeaderRow>
          ))}
          
          <HeaderRow>
            <SuggestionsContainer style={{ flex: 1 }}>
              <Input
                placeholder="New header name"
                value={newHeaderName}
                onChange={(e) => setNewHeaderName(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                fullWidth
              />
              {showSuggestions && filteredSuggestions.length > 0 && (
                <Suggestions>
                  {filteredSuggestions.map(suggestion => (
                    <SuggestionItem 
                      key={suggestion}
                      onMouseDown={() => handleSelectSuggestion(suggestion)}
                    >
                      {suggestion}
                    </SuggestionItem>
                  ))}
                </Suggestions>
              )}
            </SuggestionsContainer>
            <Button
              variant="secondary"
              onClick={handleAddHeader}
              disabled={!newHeaderName.trim()}
            >
              Add Header
            </Button>
          </HeaderRow>
        </HeaderContainer>
      </Card.Content>
    </Card>
  );
};

export default RequestHeader;