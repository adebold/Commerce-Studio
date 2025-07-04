import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Card } from '../../../frontend/src/design-system/components/Card/Card';
import { Typography } from '../../../frontend/src/design-system/components/Typography/Typography';
import { Button } from '../../../frontend/src/design-system/components/Button/Button';
import CodeSnippet from './CodeSnippet';
import ParameterTable from './ParameterTable';

// HTTP method types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Parameter interface
export interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

// ApiEndpoint props interface
export interface ApiEndpointProps {
  method: HttpMethod;
  path: string;
  description: string;
  requestParams?: Parameter[];
  requestExample?: string;
  responseExample: string;
  authentication?: boolean;
  deprecated?: boolean;
}

const EndpointContainer = styled(Card)`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[32]};
`;

const MethodBadge = styled.span<{ method: HttpMethod }>`
  display: inline-block;
  padding: ${({ theme }) => `${theme.spacing.spacing[4]} ${theme.spacing.spacing[8]}`};
  border-radius: 4px;
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.common.white};
  background-color: ${({ theme, method }) => {
    switch (method) {
      case 'GET':
        return theme.colors.semantic.info.main;
      case 'POST':
        return theme.colors.secondary[500];
      case 'PUT':
        return theme.colors.semantic.warning.main;
      case 'DELETE':
        return theme.colors.semantic.error.main;
      case 'PATCH':
        return theme.colors.primary[700];
      default:
        return theme.colors.neutral[500];
    }
  }};
  margin-right: ${({ theme }) => theme.spacing.spacing[12]};
`;

const PathText = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  word-break: break-all;
`;

const BadgeContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.spacing[8]};
  margin-top: ${({ theme }) => theme.spacing.spacing[8]};
`;

const Badge = styled.span<{ variant?: 'info' | 'warning' }>`
  display: inline-block;
  padding: ${({ theme }) => `${theme.spacing.spacing[2]} ${theme.spacing.spacing[8]}`};
  border-radius: 4px;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  background-color: ${({ theme, variant }) => 
    variant === 'warning' 
      ? theme.colors.semantic.warning.light 
      : theme.colors.semantic.info.light
  };
  color: ${({ theme, variant }) => 
    variant === 'warning' 
      ? theme.colors.semantic.warning.dark 
      : theme.colors.semantic.info.dark
  };
`;

const SectionTitle = styled(Typography)`
  margin-top: ${({ theme }) => theme.spacing.spacing[24]};
  margin-bottom: ${({ theme }) => theme.spacing.spacing[8]};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semiBold};
`;

/**
 * ApiEndpoint Component
 * 
 * Displays an API endpoint with its method, path, description, parameters, and examples.
 */
export const ApiEndpoint: React.FC<ApiEndpointProps> = ({
  method,
  path,
  description,
  requestParams = [],
  requestExample,
  responseExample,
  authentication = true,
  deprecated = false,
}) => {
  return (
    <EndpointContainer variant="outlined">
      <Card.Header>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            <MethodBadge method={method}>{method}</MethodBadge>
            <PathText>{path}</PathText>
          </div>
          <BadgeContainer>
            {authentication && (
              <Badge>Requires Authentication</Badge>
            )}
            {deprecated && (
              <Badge variant="warning">Deprecated</Badge>
            )}
          </BadgeContainer>
        </div>
      </Card.Header>
      <Card.Content>
        <Typography variant="body1" gutterBottom>
          {description}
        </Typography>

        {requestParams.length > 0 && (
          <>
            <SectionTitle variant="h6">Request Parameters</SectionTitle>
            <ParameterTable parameters={requestParams} />
          </>
        )}

        {requestExample && (
          <>
            <SectionTitle variant="h6">Request Example</SectionTitle>
            <CodeSnippet code={requestExample} language="json" />
          </>
        )}

        <SectionTitle variant="h6">Response Example</SectionTitle>
        <CodeSnippet code={responseExample} language="json" />
      </Card.Content>
    </EndpointContainer>
  );
};

export default ApiEndpoint;