import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Card, Typography, Input, Button } from '../../../frontend/src/design-system/components';
import { GridContainer, GridItem } from '../../../frontend/src/design-system/components/Layout/ResponsiveGrid';

// Query parameter interface
export interface QueryParam {
  id: string;
  name: string;
  value: string;
  description?: string;
  enabled: boolean;
}

interface QueryParameterProps {
  parameters: QueryParam[];
  onChange: (parameters: QueryParam[]) => void;
  baseUrl: string;
  endpoint: string;
}

const ParameterContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
`;

const ParameterRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[8]};
  gap: ${({ theme }) => theme.spacing.spacing[8]};
`;

const QueryPreview = styled.div`
  background-color: ${({ theme }) => theme.colors.neutral[100]};
  padding: ${({ theme }) => theme.spacing.spacing[12]};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  font-family: monospace;
  word-break: break-all;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
  border: 1px solid ${({ theme }) => theme.colors.neutral[300]};
`;

const Checkbox = styled.input`
  margin-right: ${({ theme }) => theme.spacing.spacing[8]};
  width: 18px;
  height: 18px;
`;

/**
 * QueryParameter Component
 * 
 * Allows users to configure query parameters for API requests.
 */
export const QueryParameter: React.FC<QueryParameterProps> = ({
  parameters,
  onChange,
  baseUrl,
  endpoint
}) => {
  const [newParamName, setNewParamName] = useState('');
  
  // Add a new parameter
  const handleAddParameter = () => {
    if (!newParamName.trim()) return;
    
    const newParam: QueryParam = {
      id: `query-${Date.now()}`,
      name: newParamName,
      value: '',
      enabled: true
    };
    
    onChange([...parameters, newParam]);
    setNewParamName('');
  };
  
  // Update a parameter
  const handleUpdateParameter = (id: string, field: 'name' | 'value' | 'enabled', value: any) => {
    const updatedParams = parameters.map(param => 
      param.id === id ? { ...param, [field]: value } : param
    );
    onChange(updatedParams);
  };
  
  // Remove a parameter
  const handleRemoveParameter = (id: string) => {
    const updatedParams = parameters.filter(param => param.id !== id);
    onChange(updatedParams);
  };
  
  // Generate query string preview
  const generateQueryString = () => {
    const enabledParams = parameters.filter(param => param.enabled && param.name);
    
    if (enabledParams.length === 0) {
      return '';
    }
    
    const queryString = enabledParams
      .map(param => `${encodeURIComponent(param.name)}=${encodeURIComponent(param.value || '')}`)
      .join('&');
    
    return `?${queryString}`;
  };
  
  // Generate full URL with query parameters
  const generateFullUrl = () => {
    const queryString = generateQueryString();
    return `${baseUrl}${endpoint}${queryString}`;
  };

  return (
    <Card>
      <Card.Content>
        <Typography variant="h5" gutterBottom>Query Parameters</Typography>
        <Typography variant="body2" gutterBottom>
          Configure parameters that will be added to the URL as a query string.
        </Typography>
        
        {parameters.length > 0 && (
          <>
            <Typography variant="body2" gutterBottom style={{ marginTop: '16px' }}>
              Query String Preview:
            </Typography>
            <QueryPreview>
              {generateQueryString() || '(No query parameters)'}
            </QueryPreview>
            
            <Typography variant="body2" gutterBottom>
              Full URL Preview:
            </Typography>
            <QueryPreview>
              {generateFullUrl()}
            </QueryPreview>
          </>
        )}
        
        <ParameterContainer>
          {parameters.map((param) => (
            <ParameterRow key={param.id}>
              <Checkbox
                type="checkbox"
                checked={param.enabled}
                onChange={(e) => handleUpdateParameter(param.id, 'enabled', e.target.checked)}
              />
              <Input
                placeholder="Parameter name"
                value={param.name}
                onChange={(e) => handleUpdateParameter(param.id, 'name', e.target.value)}
                style={{ flex: 1 }}
              />
              <Input
                placeholder="Value"
                value={param.value}
                onChange={(e) => handleUpdateParameter(param.id, 'value', e.target.value)}
                style={{ flex: 1 }}
              />
              <Button
                variant="tertiary"
                onClick={() => handleRemoveParameter(param.id)}
                aria-label="Remove parameter"
              >
                Remove
              </Button>
            </ParameterRow>
          ))}
          
          <ParameterRow>
            <Input
              placeholder="New parameter name"
              value={newParamName}
              onChange={(e) => setNewParamName(e.target.value)}
              style={{ flex: 1 }}
            />
            <Button
              variant="secondary"
              onClick={handleAddParameter}
              disabled={!newParamName.trim()}
            >
              Add Parameter
            </Button>
          </ParameterRow>
        </ParameterContainer>
      </Card.Content>
    </Card>
  );
};

export default QueryParameter;