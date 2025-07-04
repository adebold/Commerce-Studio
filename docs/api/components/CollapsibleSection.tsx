import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../../frontend/src/design-system/components/Typography/Typography';
import { Card } from '../../../frontend/src/design-system/components/Card/Card';

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const SectionContainer = styled(Card)`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
  overflow: hidden;
`;

const SectionHeader = styled.div<{ isOpen: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.spacing[16]};
  cursor: pointer;
  background-color: ${({ theme, isOpen }) => 
    isOpen ? theme.colors.primary[50] : theme.colors.common.white
  };
  border-bottom: ${({ theme, isOpen }) => 
    isOpen ? `1px solid ${theme.colors.neutral[200]}` : 'none'
  };
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary[50]};
  }
`;

const SectionTitle = styled(Typography)`
  font-weight: ${({ theme }) => theme.typography.fontWeight.semiBold};
  color: ${({ theme }) => theme.colors.primary[700]};
`;

const ToggleIcon = styled.div<{ isOpen: boolean }>`
  width: 20px;
  height: 20px;
  position: relative;
  
  &:before,
  &:after {
    content: '';
    position: absolute;
    background-color: ${({ theme }) => theme.colors.primary[500]};
    transition: transform 0.25s ease-out;
  }
  
  /* Horizontal line */
  &:before {
    top: 9px;
    left: 0;
    width: 100%;
    height: 2px;
  }
  
  /* Vertical line */
  &:after {
    top: 0;
    left: 9px;
    width: 2px;
    height: 100%;
    transform: ${({ isOpen }) => isOpen ? 'scaleY(0)' : 'scaleY(1)'};
  }
`;

const SectionContent = styled.div<{ isOpen: boolean }>`
  padding: ${({ theme, isOpen }) => 
    isOpen ? theme.spacing.spacing[16] : '0 ' + theme.spacing.spacing[16]
  };
  max-height: ${({ isOpen }) => isOpen ? '2000px' : '0'};
  opacity: ${({ isOpen }) => isOpen ? 1 : 0};
  transition: max-height 0.5s ease, opacity 0.3s ease, padding 0.3s ease;
  overflow: hidden;
`;

/**
 * CollapsibleSection Component
 * 
 * A section that can be expanded or collapsed to show or hide its content.
 */
export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  defaultOpen = false,
  children
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleSection = () => {
    setIsOpen(!isOpen);
  };

  return (
    <SectionContainer variant="outlined">
      <SectionHeader isOpen={isOpen} onClick={toggleSection}>
        <SectionTitle variant="h6">{title}</SectionTitle>
        <ToggleIcon isOpen={isOpen} />
      </SectionHeader>
      <SectionContent isOpen={isOpen}>
        {children}
      </SectionContent>
    </SectionContainer>
  );
};

export default CollapsibleSection;