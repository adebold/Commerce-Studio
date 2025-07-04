import React from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../../frontend/src/design-system/components/Typography/Typography';

interface HttpStatusCodeProps {
  code: number;
  name: string;
  description: string;
}

const StatusContainer = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
  padding: ${({ theme }) => theme.spacing.spacing[16]};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  background-color: ${({ theme }) => theme.colors.neutral[50]};
  border-left: 4px solid ${({ theme, code }) => {
    if (code >= 200 && code < 300) {
      return theme.colors.semantic.success.main;
    } else if (code >= 300 && code < 400) {
      return theme.colors.semantic.info.main;
    } else if (code >= 400 && code < 500) {
      return theme.colors.semantic.warning.main;
    } else {
      return theme.colors.semantic.error.main;
    }
  }};
`;

const StatusCode = styled.div<{ code: number }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: ${({ theme }) => theme.spacing.spacing[16]};
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  color: ${({ theme }) => theme.colors.common.white};
  background-color: ${({ theme, code }) => {
    if (code >= 200 && code < 300) {
      return theme.colors.semantic.success.main;
    } else if (code >= 300 && code < 400) {
      return theme.colors.semantic.info.main;
    } else if (code >= 400 && code < 500) {
      return theme.colors.semantic.warning.main;
    } else {
      return theme.colors.semantic.error.main;
    }
  }};
`;

const StatusContent = styled.div`
  flex: 1;
`;

/**
 * HttpStatusCode Component
 * 
 * Displays an HTTP status code with its name and description.
 */
export const HttpStatusCode: React.FC<HttpStatusCodeProps> = ({ code, name, description }) => {
  return (
    <StatusContainer code={code}>
      <StatusCode code={code}>{code}</StatusCode>
      <StatusContent>
        <Typography variant="h6" gutterBottom>
          {name}
        </Typography>
        <Typography variant="body2">
          {description}
        </Typography>
      </StatusContent>
    </StatusContainer>
  );
};

export default HttpStatusCode;