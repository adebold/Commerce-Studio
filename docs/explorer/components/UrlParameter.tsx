import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Card, Typography, Input, Button } from '../../../frontend/src/design-system/components';
import { GridContainer, GridItem } from '../../../frontend/src/design-system/components/Layout/ResponsiveGrid';

// URL parameter interface
export interface UrlParam {
  id: string;
  name: string;
  value: string;
  description?: string;
}

interface UrlParameterProps {
  parameters: UrlParam[];
  onChange: (parameters: UrlParam[]) => void;
  baseUrl: string;
  endpoint: string;
  onEndpointChange: (endpoint: string) => void;
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

const UrlPreview = styled.div`
  background-color: ${({ theme }) => theme.colors.neutral[100]};
  padding: ${({ theme }) => theme.spacing.spacing[12]};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  font-family: monospace;
  word-break: break-all;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
  border: 1px solid ${({ theme }) => theme.colors.neutral[300]};
`;

const HighlightedParam = styled.span`
  color: ${({ theme }) => theme.colors.primary[500]};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

/**
 * UrlParameter Component
 * 
 * Allows users to configure URL parameters for API requests.
 */
export const UrlParameter: React.FC<UrlParameterProps> = ({
  parameters,
  onChange,
  baseUrl,
  endpoint,
  onEndpointChange
}) => {
  const [newParamName, setNewParamName] = useState('');
  
  // Add a new parameter
  const handleAddParameter = () => {
    if (!newParamName.trim()) return;
    
    const newParam: UrlParam = {
      id: `param-${Date.now()}`,
      name: newParamName,
      value: '',
    };
    
    onChange([...parameters, newParam]);
    setNewParamName('');
  };
  
  // Update a parameter
  const handleUpdateParameter = (id: string, field: 'name' | 'value', value: string) => {
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
  
  // Generate URL preview with highlighted parameters
  const generateUrlPreview = () => {
    let url = `${baseUrl}${endpoint}`;
    
    // Replace path parameters in the URL
    parameters.forEach(param => {
      const placeholder = `{${param.name}}`;
      if (url.includes(placeholder)) {
        url = url.replace(
          placeholder, 
          param.value ? `${param.value}` : placeholder
        );
      }
    });
    
    return url;
  };
  
  // Render URL with highlighted parameters
  const renderUrlWithHighlights = () => {
    let url = generateUrlPreview();
    
    // Highlight parameters in the URL
    parameters.forEach(param => {
      const placeholder = `{${param.name}}`;
      if (url.includes(placeholder)) {
        const parts = url.split(placeholder);
        url = parts.join(`<span class="highlighted">${placeholder}</span>`);
      } else if (param.value && url.includes(param.value)) {
        const parts = url.split(param.value);
        url = parts.join(`<span class="highlighted">${param.value}</span>`);
      }
    });
    
    return (
      <div dangerouslySetInnerHTML={{ 
        __html: url.replace(
          /<span class="highlighted">([^<]+)<\/span>/g, 
          (_, content) => `<span style="color: #0066cc; font-weight: bold;">${content}</span>`
        ) 
      }} />
    );
  };

  return (
    <Card>
      <Card.Content>
        <Typography variant="h5" gutterBottom>URL Configuration</Typography>
        
        <GridContainer spacing="medium">
          <GridItem xs={12}>
            <Typography variant="body2" gutterBottom>Base URL:</Typography>
            <Input
              value={baseUrl}
              disabled
              fullWidth
            />
          </GridItem>
          
          <GridItem xs={12}>
            <Typography variant="body2" gutterBottom>Endpoint:</Typography>
            <Input
              value={endpoint}
              onChange={(e) => onEndpointChange(e.target.value)}
              placeholder="/api/resource/{id}"
              fullWidth
            />
          </GridItem>
        </GridContainer>
        
        <Typography variant="body2" gutterBottom style={{ marginTop: '16px' }}>
          URL Preview:
        </Typography>
        <UrlPreview>
          {renderUrlWithHighlights()}
        </UrlPreview>
        
        <Typography variant="h6" gutterBottom>Path Parameters</Typography>
        <Typography variant="body2" gutterBottom>
          Configure parameters that appear in the URL path (e.g., {'{id}'}).
        </Typography>
        
        <ParameterContainer>
          {parameters.map((param) => (
            <ParameterRow key={param.id}>
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

export default UrlParameter;