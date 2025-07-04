import React from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../../frontend/src/design-system/components/Typography/Typography';

interface ChecklistItem {
  text: string;
  description?: string;
  isRequired?: boolean;
}

interface ChecklistProps {
  title: string;
  description?: string;
  items: ChecklistItem[];
}

const ChecklistContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[32]};
`;

const ItemsContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.spacing[16]};
`;

const ChecklistItemContainer = styled.div`
  display: flex;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
  padding-bottom: ${({ theme }) => theme.spacing.spacing[16]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral[200]};
  
  &:last-child {
    border-bottom: none;
  }
`;

const CheckboxContainer = styled.div`
  margin-right: ${({ theme }) => theme.spacing.spacing[16]};
  flex-shrink: 0;
`;

const Checkbox = styled.div`
  width: 24px;
  height: 24px;
  border: 2px solid ${({ theme }) => theme.colors.primary.main};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary[50]};
  }
`;

const ItemContent = styled.div`
  flex: 1;
`;

const ItemHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[4]};
`;

const RequiredBadge = styled.span`
  background-color: ${({ theme }) => theme.colors.error.main};
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: ${({ theme }) => theme.spacing.spacing[8]};
`;

/**
 * Checklist Component
 * 
 * A component for displaying integration checklists with optional descriptions.
 */
const Checklist: React.FC<ChecklistProps> = ({ title, description, items }) => {
  return (
    <ChecklistContainer>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>
      
      {description && (
        <Typography variant="body1" gutterBottom>
          {description}
        </Typography>
      )}
      
      <ItemsContainer>
        {items.map((item, index) => (
          <ChecklistItemContainer key={index}>
            <CheckboxContainer>
              <Checkbox />
            </CheckboxContainer>
            
            <ItemContent>
              <ItemHeader>
                <Typography variant="h6" style={{ margin: 0 }}>
                  {item.text}
                </Typography>
                
                {item.isRequired && (
                  <RequiredBadge>Required</RequiredBadge>
                )}
              </ItemHeader>
              
              {item.description && (
                <Typography variant="body2" color="neutral.600">
                  {item.description}
                </Typography>
              )}
            </ItemContent>
          </ChecklistItemContainer>
        ))}
      </ItemsContainer>
    </ChecklistContainer>
  );
};

export default Checklist;