import React from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../design-system/components/Typography/Typography';
import { Card } from '../../design-system/components/Card/Card';
import { Button } from '../../design-system/components/Button/Button';
import { Frame } from '../../components/virtual-try-on';

// Styled components
const CardContainer = styled(Card)<{ isFavorite: boolean }>`
  position: relative;
  transition: all 0.2s ease-in-out;
  border: 2px solid ${({ theme, isFavorite }) => 
    isFavorite ? theme.colors.primary[500] : 'transparent'};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.effects.hover};
  }
`;

const FrameImage = styled.img`
  width: 100%;
  height: 160px;
  object-fit: contain;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[8]};
`;

const FrameInfo = styled.div`
  padding: ${({ theme }) => theme.spacing.spacing[8]};
`;

const PriceTag = styled.span`
  color: ${({ theme }) => theme.colors.primary[600]};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semiBold};
`;

const FavoriteButton = styled.button<{ isFavorite: boolean }>`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ theme, isFavorite }) => 
    isFavorite ? theme.colors.primary[500] : theme.colors.common.white};
  color: ${({ theme, isFavorite }) => 
    isFavorite ? theme.colors.common.white : theme.colors.neutral[500]};
  border: 1px solid ${({ theme }) => theme.colors.neutral[300]};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  z-index: 1;
  
  &:hover {
    background-color: ${({ theme, isFavorite }) => 
      isFavorite ? theme.colors.primary[600] : theme.colors.neutral[100]};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.spacing[8]};
  margin-top: ${({ theme }) => theme.spacing.spacing[8]};
`;

const FrameAttributes = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
  margin-bottom: 8px;
`;

const AttributeTag = styled.span`
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.neutral[100]};
  color: ${({ theme }) => theme.colors.neutral[700]};
`;

// Component props
interface RecommendationCardProps {
  frame: Frame;
  isFavorite: boolean;
  onToggleFavorite: (frame: Frame) => void;
  onTryOn?: (frame: Frame) => void;
}

/**
 * RecommendationCard Component
 * 
 * A card component for displaying frame recommendations.
 */
const RecommendationCard: React.FC<RecommendationCardProps> = ({
  frame,
  isFavorite,
  onToggleFavorite,
  onTryOn
}) => {
  return (
    <CardContainer variant="elevated" elevation={1} isFavorite={isFavorite}>
      <FavoriteButton 
        isFavorite={isFavorite}
        onClick={() => onToggleFavorite(frame)}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        {isFavorite ? '♥' : '♡'}
      </FavoriteButton>
      
      <FrameImage 
        src={frame.imageUrl} 
        alt={frame.name}
        onError={(e) => {
          // Fallback for missing images
          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Frame';
        }}
      />
      
      <FrameInfo>
        <Typography variant="body2" truncate>
          {frame.name}
        </Typography>
        
        <Typography variant="caption" muted>
          {frame.brand}
        </Typography>
        
        <FrameAttributes>
          <AttributeTag>{frame.shape}</AttributeTag>
          <AttributeTag>{frame.material}</AttributeTag>
          <AttributeTag>{frame.color}</AttributeTag>
        </FrameAttributes>
        
        <Typography variant="body2">
          <PriceTag>${frame.price.toFixed(2)}</PriceTag>
        </Typography>
        
        <ActionButtons>
          {onTryOn && (
            <Button 
              variant="primary" 
              size="small"
              fullWidth
              onClick={() => onTryOn(frame)}
            >
              Try On
            </Button>
          )}
          
          <Button 
            variant="secondary" 
            size="small"
            fullWidth
          >
            Details
          </Button>
        </ActionButtons>
      </FrameInfo>
    </CardContainer>
  );
};

export default RecommendationCard;