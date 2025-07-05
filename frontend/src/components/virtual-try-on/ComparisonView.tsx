import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Button } from '../../design-system/components/Button/Button';
import { Typography } from '../../design-system/components/Typography/Typography';
import { Card } from '../../design-system/components/Card/Card';
import { Frame } from './FrameSelector';

// Styled components
const ComparisonContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ComparisonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.spacing[24]};
  margin-bottom: ${({ theme }) => theme.spacing.spacing[24]};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ComparisonItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const VisualizationArea = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 4/3;
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
  background-color: ${({ theme }) => theme.colors.neutral[100]};
`;

const BaseImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const FrameOverlay = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
`;

const FrameInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.spacing[4]};
`;

const FrameActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.spacing[8]};
  margin-top: ${({ theme }) => theme.spacing.spacing[8]};
`;

const PriceTag = styled.span`
  color: ${({ theme }) => theme.colors.primary[600]};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semiBold};
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing.spacing[24]};
`;

// Component props
interface ComparisonViewProps {
  userImage: string;
  frames: Frame[];
  onSelectFrame: (frame: Frame) => void;
  onAddFrame: () => void;
  onClose: () => void;
}

/**
 * ComparisonView Component
 * 
 * A component for comparing different eyewear frames side by side.
 */
const ComparisonView: React.FC<ComparisonViewProps> = ({
  userImage,
  frames,
  onSelectFrame,
  onAddFrame,
  onClose
}) => {
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);
  
  // Handle frame selection
  const handleSelectFrame = (frame: Frame) => {
    setSelectedFrameId(frame.id);
    onSelectFrame(frame);
  };
  
  return (
    <ComparisonContainer>
      <Card variant="outlined">
        <Card.Header 
          title="Compare Frames" 
          action={
            <Button 
              variant="tertiary" 
              size="small" 
              onClick={onClose}
            >
              Back to Try-On
            </Button>
          }
        />
        <Card.Content>
          {frames.length > 0 ? (
            <>
              <ComparisonGrid>
                {frames.map(frame => (
                  <ComparisonItem key={frame.id}>
                    <VisualizationArea>
                      <BaseImage src={userImage} alt="Your photo" />
                      <FrameOverlay 
                        src={frame.imageUrl} 
                        alt={frame.name}
                        onError={(e) => {
                          // Fallback for missing images
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Frame+Overlay';
                        }}
                      />
                    </VisualizationArea>
                    
                    <FrameInfo>
                      <Typography variant="body1" truncate>
                        {frame.name}
                      </Typography>
                      <Typography variant="body2" muted>
                        {frame.brand} • {frame.color} • {frame.material}
                      </Typography>
                      <Typography variant="body1">
                        <PriceTag>${frame.price.toFixed(2)}</PriceTag>
                      </Typography>
                      
                      <FrameActions>
                        <Button 
                          variant={selectedFrameId === frame.id ? "primary" : "secondary"}
                          size="small"
                          onClick={() => handleSelectFrame(frame)}
                        >
                          {selectedFrameId === frame.id ? "Selected" : "Select"}
                        </Button>
                      </FrameActions>
                    </FrameInfo>
                  </ComparisonItem>
                ))}
                
                {frames.length < 4 && (
                  <ComparisonItem>
                    <VisualizationArea 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        border: '2px dashed #ccc'
                      }}
                    >
                      <Button 
                        variant="secondary" 
                        onClick={onAddFrame}
                      >
                        Add Frame to Compare
                      </Button>
                    </VisualizationArea>
                  </ComparisonItem>
                )}
              </ComparisonGrid>
              
              <Typography variant="body2" muted gutterBottom>
                Compare different frames side by side to find your perfect match. 
                You can add up to 4 frames for comparison.
              </Typography>
              
              <ActionButtons>
                <Button 
                  variant="secondary" 
                  onClick={onClose}
                >
                  Back to Try-On
                </Button>
                
                <Button 
                  variant="primary" 
                  disabled={!selectedFrameId}
                  onClick={() => {
                    const selectedFrame = frames.find(f => f.id === selectedFrameId);
                    if (selectedFrame) {
                      onSelectFrame(selectedFrame);
                      onClose();
                    }
                  }}
                >
                  Continue with Selected Frame
                </Button>
              </ActionButtons>
            </>
          ) : (
            <Typography variant="body1" align="center" muted>
              No frames selected for comparison. Add frames to compare them side by side.
            </Typography>
          )}
        </Card.Content>
      </Card>
    </ComparisonContainer>
  );
};

export default ComparisonView;