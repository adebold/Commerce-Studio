import React from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../../frontend/src/design-system/components/Typography/Typography';

interface Step {
  title: string;
  description: string;
  code?: string;
  image?: string;
}

interface StepByStepGuideProps {
  title: string;
  description?: string;
  steps: Step[];
}

const GuideContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[32]};
`;

const StepContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[24]};
  padding: ${({ theme }) => theme.spacing.spacing[16]};
  border-left: 4px solid ${({ theme }) => theme.colors.primary.main};
  background-color: ${({ theme }) => theme.colors.background.light};
  border-radius: 4px;
`;

const StepHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[8]};
`;

const StepNumber = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary.main};
  color: white;
  font-weight: bold;
  margin-right: ${({ theme }) => theme.spacing.spacing[12]};
`;

const CodeBlock = styled.pre`
  background-color: ${({ theme }) => theme.colors.neutral[800]};
  color: ${({ theme }) => theme.colors.neutral[100]};
  padding: ${({ theme }) => theme.spacing.spacing[16]};
  border-radius: 4px;
  overflow-x: auto;
  margin: ${({ theme }) => theme.spacing.spacing[16]} 0;
  font-family: 'Courier New', Courier, monospace;
`;

const ImageContainer = styled.div`
  margin: ${({ theme }) => theme.spacing.spacing[16]} 0;
  text-align: center;
`;

const Image = styled.img`
  max-width: 100%;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.neutral[300]};
`;

/**
 * StepByStepGuide Component
 * 
 * A component for displaying step-by-step integration guides with optional code snippets and images.
 */
const StepByStepGuide: React.FC<StepByStepGuideProps> = ({ title, description, steps }) => {
  return (
    <GuideContainer>
      <Typography variant="h3" gutterBottom>
        {title}
      </Typography>
      
      {description && (
        <Typography variant="body1" gutterBottom>
          {description}
        </Typography>
      )}
      
      {steps.map((step, index) => (
        <StepContainer key={index}>
          <StepHeader>
            <StepNumber>{index + 1}</StepNumber>
            <Typography variant="h5">
              {step.title}
            </Typography>
          </StepHeader>
          
          <Typography variant="body1">
            {step.description}
          </Typography>
          
          {step.code && (
            <CodeBlock>
              {step.code}
            </CodeBlock>
          )}
          
          {step.image && (
            <ImageContainer>
              <Image src={step.image} alt={`Step ${index + 1} - ${step.title}`} />
            </ImageContainer>
          )}
        </StepContainer>
      ))}
    </GuideContainer>
  );
};

export default StepByStepGuide;