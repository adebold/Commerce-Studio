import React from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../design-system/components/Typography/Typography';
import { Button } from '../../design-system/components/Button/Button';
import { Card } from '../../design-system/components/Card/Card';
import { Frame } from '../../components/virtual-try-on';

// Styled components
const ComparisonContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.spacing[24]};
`;

const ComparisonGrid = styled.div`
  display: grid;
  grid-template-columns: 200px repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.spacing[16]};
  margin-top: ${({ theme }) => theme.spacing.spacing[16]};
  overflow-x: auto;
  
  @media (max-width: 768px) {
    grid-template-columns: 150px repeat(auto-fit, minmax(150px, 1fr));
  }
`;

const FeatureColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.spacing[16]};
`;

const FrameColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.spacing[16]};
  align-items: center;
  position: relative;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.neutral[200]};
  color: ${({ theme }) => theme.colors.neutral[700]};
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.neutral[300]};
  }
`;

const FrameImage = styled.img`
  width: 100%;
  height: 120px;
  object-fit: contain;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[8]};
`;

const FeatureRow = styled.div`
  display: flex;
  align-items: center;
  min-height: 48px;
  padding: ${({ theme }) => theme.spacing.spacing[8]};
  background-color: ${({ theme }) => theme.colors.neutral[50]};
  border-radius: 4px;
  
  &:nth-of-type(odd) {
    background-color: ${({ theme }) => theme.colors.neutral[100]};
  }
`;

const FeatureCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: ${({ theme }) => theme.spacing.spacing[8]};
  text-align: center;
  
  &:nth-of-type(odd) {
    background-color: ${({ theme }) => theme.colors.neutral[50]};
  }
`;

const HeaderCell = styled.div`
  font-weight: bold;
  padding: ${({ theme }) => theme.spacing.spacing[8]};
  text-align: center;
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.spacing[24]};
  background-color: ${({ theme }) => theme.colors.neutral[50]};
  border-radius: 8px;
  margin-top: ${({ theme }) => theme.spacing.spacing[16]};
  text-align: center;
`;

// Component props
interface FrameComparisonProps {
  frames: Frame[];
  onRemoveFrame: (frameId: string) => void;
  onTryOn?: (frame: Frame) => void;
}

/**
 * FrameComparison Component
 * 
 * A component for comparing multiple frames side by side.
 */
const FrameComparison: React.FC<FrameComparisonProps> = ({
  frames,
  onRemoveFrame,
  onTryOn
}) => {
  // Features to compare
  const features = [
    { id: 'brand', name: 'Brand' },
    { id: 'shape', name: 'Shape' },
    { id: 'material', name: 'Material' },
    { id: 'color', name: 'Color' },
    { id: 'price', name: 'Price' }
  ];
  
  // Get feature value for a frame
  const getFeatureValue = (frame: Frame, featureId: string) => {
    switch (featureId) {
      case 'brand':
        return frame.brand;
      case 'shape':
        return frame.shape;
      case 'material':
        return frame.material;
      case 'color':
        return frame.color;
      case 'price':
        return `$${frame.price.toFixed(2)}`;
      default:
        return '';
    }
  };
  
  if (frames.length === 0) {
    return (
      <EmptyStateContainer>
        <Typography variant="h6" gutterBottom>
          No frames to compare
        </Typography>
        <Typography variant="body2" muted>
          Add frames to comparison by clicking the compare button on frame cards.
        </Typography>
      </EmptyStateContainer>
    );
  }
  
  return (
    <ComparisonContainer>
      <Card variant="outlined">
        <Card.Header title="Frame Comparison" />
        <Card.Content>
          <Typography variant="body2" muted gutterBottom>
            Compare up to 4 frames side by side to help you make the best choice.
          </Typography>
          
          <ComparisonGrid>
            {/* Feature names column */}
            <FeatureColumn>
              <HeaderCell>
                <Typography variant="body2">Features</Typography>
              </HeaderCell>
              
              {features.map(feature => (
                <FeatureRow key={feature.id}>
                  <Typography variant="body2">{feature.name}</Typography>
                </FeatureRow>
              ))}
              
              <FeatureRow>
                <Typography variant="body2">Actions</Typography>
              </FeatureRow>
            </FeatureColumn>
            
            {/* Frame columns */}
            {frames.map(frame => (
              <FrameColumn key={frame.id}>
                <HeaderCell>
                  <RemoveButton 
                    onClick={() => onRemoveFrame(frame.id)}
                    aria-label="Remove from comparison"
                  >
                    ×
                  </RemoveButton>
                  
                  <FrameImage 
                    src={frame.imageUrl} 
                    alt={frame.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Frame';
                    }}
                  />
                  
                  <Typography variant="body2" truncate>
                    {frame.name}
                  </Typography>
                </HeaderCell>
                
                {features.map(feature => (
                  <FeatureCell key={`${frame.id}-${feature.id}`}>
                    <Typography variant="body2">
                      {getFeatureValue(frame, feature.id)}
                    </Typography>
                  </FeatureCell>
                ))}
                
                <FeatureCell>
                  {onTryOn && (
                    <Button 
                      variant="primary" 
                      size="small"
                      onClick={() => onTryOn(frame)}
                    >
                      Try On
                    </Button>
                  )}
                </FeatureCell>
              </FrameColumn>
            ))}
          </ComparisonGrid>
        </Card.Content>
      </Card>
    </ComparisonContainer>
  );
};

export default FrameComparison;