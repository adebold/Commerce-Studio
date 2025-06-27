/**
 * Style Explanation Component
 * 
 * This component displays an explanation of why a particular frame is recommended for the user.
 */

import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../../src/design-system';

// Props interface
export interface StyleExplanationComponentProps {
  reason: string;
  expanded?: boolean;
}

// Styled components
const ExplanationContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.primary[50]};
  border-radius: ${({ theme }) => theme.spacing.spacing[8]};
  padding: ${({ theme }) => theme.spacing.spacing[12]};
  margin: ${({ theme }) => theme.spacing.spacing[16]} 0;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
`;

const ExplanationHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[8]};
`;

const ExplanationIcon = styled.div`
  width: 20px;
  height: 20px;
  margin-right: ${({ theme }) => theme.spacing.spacing[8]};
  color: ${({ theme }) => theme.colors.primary[500]};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ExplanationContent = styled.div<{ expanded: boolean }>`
  max-height: ${({ expanded }) => (expanded ? '200px' : '80px')};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary[500]};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  padding: 0;
  margin-top: ${({ theme }) => theme.spacing.spacing[8]};
  cursor: pointer;
  text-align: right;
  width: 100%;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary[700]};
    text-decoration: underline;
  }
`;

/**
 * Style Explanation Component
 */
export const StyleExplanationComponent: React.FC<StyleExplanationComponentProps> = ({
  reason,
  expanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <ExplanationContainer>
      <ExplanationHeader>
        <ExplanationIcon>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-4h2v2h-2zm0-10h2v8h-2z" />
          </svg>
        </ExplanationIcon>
        <Typography variant="body2" color="primary.700" style={{ fontWeight: 600 }}>
          Why This Works For You
        </Typography>
      </ExplanationHeader>
      
      <ExplanationContent expanded={isExpanded}>
        <Typography variant="body2">
          {reason}
        </Typography>
      </ExplanationContent>
      
      <ExpandButton onClick={toggleExpanded}>
        {isExpanded ? 'Show Less' : 'Read More'}
      </ExpandButton>
    </ExplanationContainer>
  );
};

export default StyleExplanationComponent;