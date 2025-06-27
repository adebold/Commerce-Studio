/**
 * Recommendation Card Component
 * 
 * This component displays a frame recommendation with details and actions.
 */

import React from 'react';
import styled from '@emotion/styled';
import { Typography, Card, Button } from '../../../src/design-system';
import { Frame } from '../../types/recommendations';
import { FeedbackControls } from './FeedbackControls';
import { StyleExplanationComponent } from './StyleExplanationComponent';

// Props interface
export interface RecommendationCardProps {
  frame: Frame;
  matchScore: number;
  matchReason: string;
  onSelect: (frameId: string) => void;
  onFeedback: (frameId: string, liked: boolean) => void;
  onSaveForLater: (frameId: string) => void;
  onTryOn: (frameId: string) => void;
}

// Styled components
const StyledCard = styled(Card)`
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.elevation[3]};
  }
`;

const CardImageContainer = styled.div`
  position: relative;
  height: 220px;
  background-color: ${({ theme }) => theme.colors.neutral[50]};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const CardImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
  
  ${StyledCard}:hover & {
    transform: scale(1.05);
  }
`;

const MatchBadge = styled.div<{ score: number }>`
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: ${({ theme, score }) => {
    if (score >= 0.9) return theme.colors.semantic.success.main;
    if (score >= 0.7) return theme.colors.primary[500];
    return theme.colors.neutral[600];
  }};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semiBold};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
`;

const CardActions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing.spacing[16]};
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.spacing[8]};
  margin: ${({ theme }) => theme.spacing.spacing[12]} 0;
`;

const Tag = styled.span`
  background-color: ${({ theme }) => theme.colors.neutral[100]};
  color: ${({ theme }) => theme.colors.neutral[800]};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

/**
 * Recommendation Card Component
 */
export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  frame,
  matchScore,
  matchReason,
  onSelect,
  onFeedback,
  onSaveForLater,
  onTryOn,
}) => {
  return (
    <StyledCard variant="elevated" elevation={1}>
      <CardImageContainer onClick={() => onSelect(frame.id)}>
        <CardImage src={frame.image_url} alt={frame.name} />
        <MatchBadge score={matchScore}>
          {Math.round(matchScore * 100)}% Match
        </MatchBadge>
      </CardImageContainer>
      
      <Card.Content>
        <Typography variant="h5" gutterBottom>
          {frame.name}
        </Typography>
        
        <Typography variant="body2" muted>
          {frame.brand} • ${frame.price.toFixed(2)}
        </Typography>
        
        <TagsContainer>
          <Tag>{frame.style}</Tag>
          <Tag>{frame.material}</Tag>
          <Tag>{frame.color}</Tag>
        </TagsContainer>
        
        <StyleExplanationComponent reason={matchReason} />
        
        <FeedbackControls 
          frameId={frame.id}
          onLike={() => onFeedback(frame.id, true)}
          onDislike={() => onFeedback(frame.id, false)}
          onSaveForLater={() => onSaveForLater(frame.id)}
        />
        
        <CardActions>
          <Button 
            variant="secondary" 
            size="small" 
            onClick={() => onSelect(frame.id)}
          >
            View Details
          </Button>
          <Button 
            variant="primary" 
            size="small" 
            onClick={() => onTryOn(frame.id)}
          >
            Try On
          </Button>
        </CardActions>
      </Card.Content>
    </StyledCard>
  );
};

export default RecommendationCard;