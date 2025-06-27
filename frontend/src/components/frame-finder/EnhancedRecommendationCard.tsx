import React, { useState } from 'react';
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

const QuickViewModal = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.colors.common.white};
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.spacing[24]};
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.neutral[500]};
  
  &:hover {
    color: ${({ theme }) => theme.colors.neutral[800]};
  }
`;

const ModalGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.spacing[24]};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ModalImageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LargeFrameImage = styled.img`
  max-width: 100%;
  height: 300px;
  object-fit: contain;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
`;

const ModalInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const RecommendationReason = styled.div`
  margin-top: ${({ theme }) => theme.spacing.spacing[16]};
  padding: ${({ theme }) => theme.spacing.spacing[16]};
  background-color: ${({ theme }) => theme.colors.primary[50]};
  border-radius: 8px;
  border-left: 4px solid ${({ theme }) => theme.colors.primary[500]};
`;

const ReasonIcon = styled.span`
  margin-right: ${({ theme }) => theme.spacing.spacing[8]};
  font-size: 1.2em;
`;

const ReasonsList = styled.ul`
  margin-top: ${({ theme }) => theme.spacing.spacing[8]};
  padding-left: ${({ theme }) => theme.spacing.spacing[16]};
`;

const ReasonItem = styled.li`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[4]};
`;

const CompareButton = styled.button`
  position: absolute;
  top: 8px;
  left: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.common.white};
  color: ${({ theme }) => theme.colors.neutral[500]};
  border: 1px solid ${({ theme }) => theme.colors.neutral[300]};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  z-index: 1;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.neutral[100]};
  }
`;

const CompatibilityScore = styled.div<{ score: number }>`
  position: absolute;
  top: 8px;
  right: 48px;
  background-color: ${({ theme, score }) => {
    if (score >= 90) return theme.colors.primary[500];
    if (score >= 70) return theme.colors.primary[400];
    if (score >= 50) return theme.colors.secondary[500];
    return theme.colors.secondary[700];
  }};
  color: ${({ theme }) => theme.colors.common.white};
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: bold;
  z-index: 1;
`;

// Component props
interface EnhancedRecommendationCardProps {
  frame: Frame;
  isFavorite: boolean;
  compatibilityScore: number;
  faceShape: string | null;
  selectedFeatures: string[];
  onToggleFavorite: (frame: Frame) => void;
  onTryOn?: (frame: Frame) => void;
  onAddToCompare?: (frame: Frame) => void;
  isInCompare?: boolean;
}

/**
 * EnhancedRecommendationCard Component
 * 
 * An enhanced card component for displaying frame recommendations with
 * explanations of why they were recommended.
 */
const EnhancedRecommendationCard: React.FC<EnhancedRecommendationCardProps> = ({
  frame,
  isFavorite,
  compatibilityScore,
  faceShape,
  selectedFeatures,
  onToggleFavorite,
  onTryOn,
  onAddToCompare,
  isInCompare = false
}) => {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  
  // Generate recommendation reasons based on user preferences
  const generateRecommendationReasons = () => {
    const reasons = [];
    
    // Face shape compatibility
    if (faceShape) {
      const faceShapeCompatibility: Record<string, string[]> = {
        'round': ['Square', 'Rectangle', 'Aviator', 'Cat Eye'],
        'square': ['Round', 'Oval', 'Browline'],
        'oval': ['Aviator', 'Square', 'Rectangle', 'Round', 'Oversized'],
        'heart': ['Round', 'Oval', 'Browline', 'Cat Eye'],
        'diamond': ['Oval', 'Browline', 'Cat Eye'],
        'oblong': ['Round', 'Square', 'Oversized']
      };
      
      const compatibleShapes = faceShapeCompatibility[faceShape.toLowerCase()] || [];
      
      if (compatibleShapes.includes(frame.shape)) {
        reasons.push(`${frame.shape} frames complement your ${faceShape} face shape`);
      }
    }
    
    // Color preferences
    if (selectedFeatures.includes('lightweight') && frame.material === 'Titanium') {
      reasons.push('Titanium material provides a lightweight feel');
    }
    
    if (selectedFeatures.includes('flexible') && 
        (frame.material === 'Nylon' || frame.material === 'Propionate')) {
      reasons.push(`${frame.material} offers excellent flexibility`);
    }
    
    if (selectedFeatures.includes('eco-friendly') && frame.material === 'Acetate') {
      reasons.push('Acetate is a more eco-friendly material option');
    }
    
    // Add generic reasons if we don't have enough specific ones
    if (reasons.length < 2) {
      reasons.push(`${frame.brand} is known for quality craftsmanship`);
    }
    
    if (reasons.length < 3) {
      reasons.push(`${frame.shape} shape is currently trending`);
    }
    
    return reasons;
  };
  
  const recommendationReasons = generateRecommendationReasons();
  
  return (
    <>
      <CardContainer variant="elevated" elevation={1} isFavorite={isFavorite}>
        <FavoriteButton 
          isFavorite={isFavorite}
          onClick={() => onToggleFavorite(frame)}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? '♥' : '♡'}
        </FavoriteButton>
        
        {onAddToCompare && (
          <CompareButton
            onClick={() => onAddToCompare(frame)}
            aria-label={isInCompare ? "Remove from comparison" : "Add to comparison"}
          >
            {isInCompare ? '✓' : '⊕'}
          </CompareButton>
        )}
        
        <CompatibilityScore score={compatibilityScore}>
          {compatibilityScore}%
        </CompatibilityScore>
        
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
            <Button 
              variant="secondary" 
              size="small"
              fullWidth
              onClick={() => setIsQuickViewOpen(true)}
            >
              Quick View
            </Button>
            
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
          </ActionButtons>
        </FrameInfo>
      </CardContainer>
      
      {/* Quick View Modal */}
      <QuickViewModal isOpen={isQuickViewOpen} onClick={() => setIsQuickViewOpen(false)}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <CloseButton onClick={() => setIsQuickViewOpen(false)}>×</CloseButton>
          
          <ModalGrid>
            <ModalImageContainer>
              <LargeFrameImage 
                src={frame.imageUrl} 
                alt={frame.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=Frame';
                }}
              />
              
              <ActionButtons style={{ width: '100%' }}>
                {onTryOn && (
                  <Button 
                    variant="primary" 
                    fullWidth
                    onClick={() => {
                      onTryOn(frame);
                      setIsQuickViewOpen(false);
                    }}
                  >
                    Virtual Try On
                  </Button>
                )}
                
                <Button 
                  variant={isFavorite ? 'secondary' : 'primary'}
                  fullWidth
                  onClick={() => onToggleFavorite(frame)}
                >
                  {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </Button>
              </ActionButtons>
            </ModalImageContainer>
            
            <ModalInfoContainer>
              <Typography variant="h4" gutterBottom>
                {frame.name}
              </Typography>
              
              <Typography variant="h6" gutterBottom>
                {frame.brand}
              </Typography>
              
              <Typography variant="h5" gutterBottom>
                <PriceTag>${frame.price.toFixed(2)}</PriceTag>
              </Typography>
              
              <Typography variant="body1" gutterBottom style={{ marginTop: '16px' }}>
                <strong>Shape:</strong> {frame.shape}
              </Typography>
              
              <Typography variant="body1" gutterBottom>
                <strong>Material:</strong> {frame.material}
              </Typography>
              
              <Typography variant="body1" gutterBottom>
                <strong>Color:</strong> {frame.color}
              </Typography>
              
              <RecommendationReason>
                <Typography variant="body1" gutterBottom>
                  <ReasonIcon>💡</ReasonIcon>
                  <strong>Why We Recommend This Frame</strong>
                </Typography>
                
                <ReasonsList>
                  {recommendationReasons.map((reason, index) => (
                    <ReasonItem key={index}>
                      <Typography variant="body2">
                        {reason}
                      </Typography>
                    </ReasonItem>
                  ))}
                </ReasonsList>
                
                <Typography variant="body2" style={{ marginTop: '8px' }}>
                  <strong>Compatibility Score:</strong> {compatibilityScore}%
                </Typography>
              </RecommendationReason>
              
              {onAddToCompare && (
                <Button 
                  variant={isInCompare ? 'secondary' : 'primary'}
                  style={{ marginTop: '16px' }}
                  onClick={() => onAddToCompare(frame)}
                >
                  {isInCompare ? 'Remove from Comparison' : 'Add to Comparison'}
                </Button>
              )}
            </ModalInfoContainer>
          </ModalGrid>
        </ModalContent>
      </QuickViewModal>
    </>
  );
};

export default EnhancedRecommendationCard;