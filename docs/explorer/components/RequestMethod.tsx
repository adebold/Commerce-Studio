import React from 'react';
import styled from '@emotion/styled';
import { Card, Typography, Button } from '../../../frontend/src/design-system/components';

// HTTP methods
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS'
}

// Method colors for visual distinction
const methodColors = {
  [HttpMethod.GET]: '#61affe',
  [HttpMethod.POST]: '#49cc90',
  [HttpMethod.PUT]: '#fca130',
  [HttpMethod.DELETE]: '#f93e3e',
  [HttpMethod.PATCH]: '#50e3c2',
  [HttpMethod.HEAD]: '#9012fe',
  [HttpMethod.OPTIONS]: '#0d5aa7'
};

interface RequestMethodProps {
  selectedMethod: HttpMethod;
  onChange: (method: HttpMethod) => void;
}

const MethodContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.spacing[8]};
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
`;

const MethodButton = styled(Button)<{ $method: HttpMethod; $isSelected: boolean }>`
  background-color: ${({ $method, $isSelected }) => 
    $isSelected ? methodColors[$method] : 'transparent'};
  color: ${({ $method, $isSelected, theme }) => 
    $isSelected ? theme.colors.neutral.white : methodColors[$method]};
  border: 1px solid ${({ $method }) => methodColors[$method]};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  min-width: 80px;
  
  &:hover:not(:disabled) {
    background-color: ${({ $method, $isSelected }) => 
      $isSelected ? methodColors[$method] : `${methodColors[$method]}22`};
    border-color: ${({ $method }) => methodColors[$method]};
  }
`;

/**
 * RequestMethod Component
 * 
 * Allows users to select an HTTP method for API requests.
 */
export const RequestMethod: React.FC<RequestMethodProps> = ({ 
  selectedMethod, 
  onChange 
}) => {
  return (
    <Card>
      <Card.Content>
        <Typography variant="h5" gutterBottom>HTTP Method</Typography>
        <Typography variant="body2" gutterBottom>
          Select the HTTP method for your request:
        </Typography>
        
        <MethodContainer>
          {Object.values(HttpMethod).map((method) => (
            <MethodButton
              key={method}
              $method={method}
              $isSelected={selectedMethod === method}
              onClick={() => onChange(method)}
              size="small"
            >
              {method}
            </MethodButton>
          ))}
        </MethodContainer>
      </Card.Content>
    </Card>
  );
};

export default RequestMethod;