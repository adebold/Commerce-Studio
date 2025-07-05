import React from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../design-system';

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const SectionContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[32]};
`;

const SectionHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
`;

const SectionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.spacing[16]};
`;

/**
 * FormSection Component
 * 
 * A component for grouping form fields with a title and optional description.
 */
const FormSection: React.FC<FormSectionProps> = ({ title, description, children }) => {
  return (
    <SectionContainer>
      <SectionHeader>
        <Typography variant="h4" gutterBottom>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="neutral.600">
            {description}
          </Typography>
        )}
      </SectionHeader>
      <SectionContent>
        {children}
      </SectionContent>
    </SectionContainer>
  );
};

export default FormSection;