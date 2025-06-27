/**
 * Complementary Styles Component
 * 
 * This component displays frame recommendations that complement the user's existing purchases.
 */

import React from 'react';
import styled from '@emotion/styled';
import { Typography, Card } from '../../../src/design-system';
import { Frame } from '../../types/recommendations';

// Props interface
export interface ComplementaryStylesComponentProps {
  existingFrame: Frame;
  complementaryFrames: Frame[];
  onSelect: (frameId: string) => void;
  complementaryReason?: string;
}

// Styled components
const ComplementaryContainer = styled.div`
  margin: ${({ theme }) => theme.spacing.spacing[32]} 0;
`;

const ComplementaryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
  
  ${({ theme }) => theme.breakpoints.down('sm')} {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing.spacing[8]};
  }
`;

const ComplementarySection = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.spacing[24]};
  margin-bottom: ${({ theme }) => theme.spacing.spacing[24]};
  
  ${({ theme }) => theme.breakpoints.down('md')} {
    flex-direction: column;
  }
`;

const ExistingFrameCard = styled(Card)`
  flex: 0 0 300px;
  
  ${({ theme }) => theme.breakpoints.down('md')} {
    flex: 1;
  }
`;

const ExistingFrameImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: contain;
  background-color: ${({ theme }) => theme.colors.neutral[50]};
  border-radius: ${({ theme }) => theme.spacing.spacing[4]};
`;

const ExistingFrameLabel = styled.div`
  background-color: ${({ theme }) => theme.colors.primary[100]};
  color: ${({ theme }) => theme.colors.primary[800]};
  padding: ${({ theme }) => `${theme.spacing.spacing[4]} ${theme.spacing.spacing[8]}`};
  border-radius: ${({ theme }) => theme.spacing.spacing[4]};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  display: inline-block;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[8]};
`;

const ComplementaryInfo = styled.div`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.neutral[50]};
  border-radius: ${({ theme }) => theme.spacing.spacing[8]};
  padding: ${({ theme }) => theme.spacing.spacing[16]};
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const ComplementaryIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[12]};
`;

const ComplementaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: ${({ theme }) => theme.spacing.spacing[24]};
`;

const ComplementaryCard = styled(Card)`
  cursor: pointer;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
  }
`;

const ComplementaryImage = styled.img`
  width: 100%;
  height: 180px;
  object-fit: contain;
  background-color: ${({ theme }) => theme.colors.neutral[50]};
  border-radius: ${({ theme }) => theme.spacing.spacing[4]};
`;

const ComplementaryTag = styled.span`
  display: inline-block;
  padding: ${({ theme }) => `${theme.spacing.spacing[2]} ${theme.spacing.spacing[8]}`};
  border-radius: ${({ theme }) => theme.spacing.spacing[4]};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  margin-bottom: ${({ theme }) => theme.spacing.spacing[8]};
  background-color: ${({ theme }) => theme.colors.primary[100]};
  color: ${({ theme }) => theme.colors.primary[800]};
`;

/**
 * Complementary Styles Component
 */
export const ComplementaryStylesComponent: React.FC<ComplementaryStylesComponentProps> = ({
  existingFrame,
  complementaryFrames,
  onSelect,
  complementaryReason = "These frames complement your existing purchase with different styles for various occasions.",
}) => {
  if (!complementaryFrames || complementaryFrames.length === 0) {
    return null;
  }
  
  return (
    <ComplementaryContainer>
      <ComplementaryHeader>
        <Typography variant="h4" gutterBottom={false}>
          Complete Your Collection
        </Typography>
      </ComplementaryHeader>
      
      <ComplementarySection>
        <ExistingFrameCard variant="elevated" elevation={1}>
          <Card.Content>
            <ExistingFrameLabel>Your Purchase</ExistingFrameLabel>
            <ExistingFrameImage 
              src={existingFrame.image_url} 
              alt={existingFrame.name} 
            />
            <Typography 
              variant="h6" 
              gutterBottom
              style={{ marginTop: '12px' }}
            >
              {existingFrame.name}
            </Typography>
            <Typography variant="body2" muted>
              {existingFrame.brand} • ${existingFrame.price.toFixed(2)}
            </Typography>
          </Card.Content>
        </ExistingFrameCard>
        
        <ComplementaryInfo>
          <ComplementaryIcon>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </ComplementaryIcon>
          <Typography variant="h5" gutterBottom>
            Perfect Pairings
          </Typography>
          <Typography variant="body1">
            {complementaryReason}
          </Typography>
        </ComplementaryInfo>
      </ComplementarySection>
      
      <ComplementaryGrid>
        {complementaryFrames.map((frame) => (
          <ComplementaryCard 
            key={frame.id} 
            variant="elevated" 
            elevation={1}
            hoverable 
            onClick={() => onSelect(frame.id)}
          >
            <Card.Content>
              <ComplementaryTag>
                Complementary Style
              </ComplementaryTag>
              <ComplementaryImage 
                src={frame.image_url} 
                alt={frame.name} 
              />
              <Typography 
                variant="h6" 
                gutterBottom
                style={{ marginTop: '12px' }}
              >
                {frame.name}
              </Typography>
              <Typography variant="body2" muted>
                {frame.brand} • ${frame.price.toFixed(2)}
              </Typography>
              <Typography 
                variant="body2" 
                style={{ marginTop: '8px' }}
              >
                Pairs well with your {existingFrame.style} {existingFrame.name}.
              </Typography>
            </Card.Content>
          </ComplementaryCard>
        ))}
      </ComplementaryGrid>
    </ComplementaryContainer>
  );
};

export default ComplementaryStylesComponent;