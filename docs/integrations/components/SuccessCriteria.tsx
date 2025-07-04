import React from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../../frontend/src/design-system/components/Typography/Typography';

interface Criterion {
  title: string;
  description: string;
  status?: 'success' | 'warning' | 'error' | 'info';
}

interface SuccessCriteriaProps {
  title: string;
  description?: string;
  criteria: Criterion[];
}

const CriteriaContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[32]};
`;

const CriteriaList = styled.div`
  margin-top: ${({ theme }) => theme.spacing.spacing[16]};
`;

const CriterionContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
  padding: ${({ theme }) => theme.spacing.spacing[16]};
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.neutral[50]};
  border-left: 4px solid ${({ theme }) => theme.colors.primary.main};
`;

const CriterionHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[8]};
`;

const StatusIndicator = styled.div<{ status?: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: ${({ theme }) => theme.spacing.spacing[12]};
  background-color: ${({ theme, status }) => {
    switch (status) {
      case 'success':
        return theme.colors.success.main;
      case 'warning':
        return theme.colors.warning.main;
      case 'error':
        return theme.colors.error.main;
      case 'info':
        return theme.colors.info.main;
      default:
        return theme.colors.neutral[400];
    }
  }};
`;

const StatusLabel = styled.span<{ status?: string }>`
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  margin-left: ${({ theme }) => theme.spacing.spacing[8]};
  background-color: ${({ theme, status }) => {
    switch (status) {
      case 'success':
        return theme.colors.success[100];
      case 'warning':
        return theme.colors.warning[100];
      case 'error':
        return theme.colors.error[100];
      case 'info':
        return theme.colors.info[100];
      default:
        return theme.colors.neutral[100];
    }
  }};
  color: ${({ theme, status }) => {
    switch (status) {
      case 'success':
        return theme.colors.success.main;
      case 'warning':
        return theme.colors.warning.main;
      case 'error':
        return theme.colors.error.main;
      case 'info':
        return theme.colors.info.main;
      default:
        return theme.colors.neutral[700];
    }
  }};
`;

const getStatusText = (status?: string) => {
  switch (status) {
    case 'success':
      return 'Passed';
    case 'warning':
      return 'Warning';
    case 'error':
      return 'Failed';
    case 'info':
      return 'Info';
    default:
      return 'Not Tested';
  }
};

/**
 * SuccessCriteria Component
 * 
 * A component for displaying integration success criteria with status indicators.
 */
const SuccessCriteria: React.FC<SuccessCriteriaProps> = ({ title, description, criteria }) => {
  return (
    <CriteriaContainer>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>
      
      {description && (
        <Typography variant="body1" gutterBottom>
          {description}
        </Typography>
      )}
      
      <CriteriaList>
        {criteria.map((criterion, index) => (
          <CriterionContainer key={index}>
            <CriterionHeader>
              <StatusIndicator status={criterion.status} />
              <Typography variant="h6" style={{ margin: 0 }}>
                {criterion.title}
              </Typography>
              <StatusLabel status={criterion.status}>
                {getStatusText(criterion.status)}
              </StatusLabel>
            </CriterionHeader>
            
            <Typography variant="body2">
              {criterion.description}
            </Typography>
          </CriterionContainer>
        ))}
      </CriteriaList>
    </CriteriaContainer>
  );
};

export default SuccessCriteria;