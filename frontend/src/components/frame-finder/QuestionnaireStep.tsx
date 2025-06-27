import React from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../design-system/components/Typography/Typography';
import { Card } from '../../design-system/components/Card/Card';

// Styled components
const StepContainer = styled(Card)`
  width: 100%;
  transition: all 0.3s ease-in-out;
`;

const StepContent = styled.div`
  padding: ${({ theme }) => theme.spacing.spacing[24]};
`;

const StepHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[24]};
`;

// Component props
interface QuestionnaireStepProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

/**
 * QuestionnaireStep Component
 * 
 * A reusable component for rendering a step in the Frame Finder questionnaire.
 */
const QuestionnaireStep: React.FC<QuestionnaireStepProps> = ({
  title,
  description,
  children
}) => {
  return (
    <StepContainer variant="elevated" elevation={1}>
      <StepHeader>
        <Typography variant="h4" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" muted>
          {description}
        </Typography>
      </StepHeader>
      <StepContent>
        {children}
      </StepContent>
    </StepContainer>
  );
};

export default QuestionnaireStep;