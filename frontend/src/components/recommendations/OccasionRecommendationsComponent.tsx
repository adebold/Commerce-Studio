/**
 * Occasion Recommendations Component
 * 
 * This component displays frame recommendations based on different occasions (formal, casual, sport).
 */

import React from 'react';
import styled from '@emotion/styled';
import { Typography, Card } from '../../../src/design-system';
import { Frame } from '../../types/recommendations';

// Props interface
export interface OccasionRecommendationsComponentProps {
  frames: Record<string, Frame[]>;
  onSelect: (frameId: string) => void;
  activeOccasion?: string;
  onOccasionChange?: (occasion: string) => void;
}

// Styled components
const OccasionContainer = styled.div`
  margin: ${({ theme }) => theme.spacing.spacing[32]} 0;
`;

const OccasionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
  
  ${({ theme }) => theme.breakpoints.down('sm')} {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing.spacing[12]};
  }
`;

const OccasionTabs = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.spacing[8]};
  margin-bottom: ${({ theme }) => theme.spacing.spacing[24]};
  
  ${({ theme }) => theme.breakpoints.down('sm')} {
    width: 100%;
    overflow-x: auto;
    padding-bottom: ${({ theme }) => theme.spacing.spacing[8]};
  }
`;

const OccasionTab = styled.button<{ active?: boolean }>`
  padding: ${({ theme }) => `${theme.spacing.spacing[8]} ${theme.spacing.spacing[16]}`};
  border-radius: ${({ theme }) => theme.spacing.spacing[4]};
  background-color: ${({ theme, active }) => active ? theme.colors.primary[500] : theme.colors.neutral[100]};
  color: ${({ theme, active }) => active ? 'white' : theme.colors.neutral[800]};
  border: none;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background-color: ${({ theme, active }) => active ? theme.colors.primary[600] : theme.colors.neutral[200]};
  }
`;

const OccasionDescription = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[24]};
  padding: ${({ theme }) => theme.spacing.spacing[16]};
  background-color: ${({ theme }) => theme.colors.neutral[50]};
  border-radius: ${({ theme }) => theme.spacing.spacing[8]};
`;

const OccasionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: ${({ theme }) => theme.spacing.spacing[24]};
`;

const OccasionCard = styled(Card)`
  cursor: pointer;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
  }
`;

const OccasionImage = styled.img`
  width: 100%;
  height: 180px;
  object-fit: contain;
  background-color: ${({ theme }) => theme.colors.neutral[50]};
  border-radius: ${({ theme }) => theme.spacing.spacing[4]};
`;

const OccasionTag = styled.span<{ occasion: string }>`
  display: inline-block;
  padding: ${({ theme }) => `${theme.spacing.spacing[2]} ${theme.spacing.spacing[8]}`};
  border-radius: ${({ theme }) => theme.spacing.spacing[4]};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  margin-bottom: ${({ theme }) => theme.spacing.spacing[8]};
  background-color: ${({ theme, occasion }) => {
    switch (occasion) {
      case 'formal':
        return theme.colors.primary[100];
      case 'casual':
        return theme.colors.neutral[100];
      case 'sport':
        return theme.colors.semantic.success.light;
      default:
        return theme.colors.neutral[100];
    }
  }};
  color: ${({ theme, occasion }) => {
    switch (occasion) {
      case 'formal':
        return theme.colors.primary[800];
      case 'casual':
        return theme.colors.neutral[800];
      case 'sport':
        return theme.colors.semantic.success.dark;
      default:
        return theme.colors.neutral[800];
    }
  }};
`;

// Helper function to get occasion description
const getOccasionDescription = (occasion: string): string => {
  switch (occasion) {
    case 'formal':
      return 'Sophisticated frames perfect for business meetings, weddings, and formal events. These styles project professionalism and elegance.';
    case 'casual':
      return 'Versatile frames for everyday wear. These comfortable styles work well for social outings, casual workplaces, and daily activities.';
    case 'sport':
      return 'Durable, functional frames designed for active lifestyles. These styles offer enhanced grip, impact resistance, and performance features.';
    default:
      return '';
  }
};

/**
 * Occasion Recommendations Component
 */
export const OccasionRecommendationsComponent: React.FC<OccasionRecommendationsComponentProps> = ({
  frames,
  onSelect,
  activeOccasion = 'formal',
  onOccasionChange,
}) => {
  const [currentOccasion, setCurrentOccasion] = React.useState(activeOccasion);
  
  const handleOccasionChange = (occasion: string) => {
    setCurrentOccasion(occasion);
    if (onOccasionChange) {
      onOccasionChange(occasion);
    }
  };
  
  const occasions = Object.keys(frames);
  
  if (occasions.length === 0) {
    return null;
  }
  
  const currentFrames = frames[currentOccasion] || [];
  
  return (
    <OccasionContainer>
      <OccasionHeader>
        <Typography variant="h4" gutterBottom={false}>
          Frames by Occasion
        </Typography>
      </OccasionHeader>
      
      <OccasionTabs>
        {occasions.map((occasion) => (
          <OccasionTab 
            key={occasion}
            active={currentOccasion === occasion}
            onClick={() => handleOccasionChange(occasion)}
          >
            {occasion.charAt(0).toUpperCase() + occasion.slice(1)}
          </OccasionTab>
        ))}
      </OccasionTabs>
      
      <OccasionDescription>
        <Typography variant="body1">
          {getOccasionDescription(currentOccasion)}
        </Typography>
      </OccasionDescription>
      
      <OccasionGrid>
        {currentFrames.map((frame) => (
          <OccasionCard 
            key={frame.id} 
            variant="elevated" 
            elevation={1}
            hoverable 
            onClick={() => onSelect(frame.id)}
          >
            <Card.Content>
              <OccasionTag occasion={currentOccasion}>
                {currentOccasion.charAt(0).toUpperCase() + currentOccasion.slice(1)}
              </OccasionTag>
              <OccasionImage 
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
                Ideal for {currentOccasion} occasions with its {frame.style.toLowerCase()} style.
              </Typography>
            </Card.Content>
          </OccasionCard>
        ))}
      </OccasionGrid>
    </OccasionContainer>
  );
};

export default OccasionRecommendationsComponent;