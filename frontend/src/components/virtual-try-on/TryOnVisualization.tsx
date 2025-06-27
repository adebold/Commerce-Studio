import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { Button } from '../../design-system/components/Button/Button';
import { Typography } from '../../design-system/components/Typography/Typography';
import { Card } from '../../design-system/components/Card/Card';
import { Frame } from './FrameSelector';

// Styled components
const VisualizationContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
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

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.spacing[16]};
  margin-bottom: ${({ theme }) => theme.spacing.spacing[24]};
`;

const ControlRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.spacing[16]};
`;

const ControlLabel = styled(Typography)`
  min-width: 100px;
`;

const SliderContainer = styled.div`
  flex: 1;
`;

const StyledSlider = styled.input`
  width: 100%;
  height: 4px;
  background: ${({ theme }) => theme.colors.neutral[300]};
  border-radius: 2px;
  appearance: none;
  outline: none;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary[500]};
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary[500]};
    cursor: pointer;
    border: none;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.spacing[16]};
  margin-top: ${({ theme }) => theme.spacing.spacing[16]};
`;

// Component props
interface TryOnVisualizationProps {
  userImage: string;
  selectedFrame: Frame | null;
  onSave?: () => void;
  onShare?: () => void;
  onCompare?: () => void;
}

/**
 * TryOnVisualization Component
 * 
 * A component for visualizing virtual try-on of eyewear frames.
 */
const TryOnVisualization: React.FC<TryOnVisualizationProps> = ({
  userImage,
  selectedFrame,
  onSave,
  onShare,
  onCompare
}) => {
  const [scale, setScale] = useState(1);
  const [xPosition, setXPosition] = useState(0);
  const [yPosition, setYPosition] = useState(0);
  const [rotation, setRotation] = useState(0);
  const visualizationRef = useRef<HTMLDivElement>(null);
  
  // Reset controls when frame changes
  useEffect(() => {
    setScale(1);
    setXPosition(0);
    setYPosition(0);
    setRotation(0);
  }, [selectedFrame]);
  
  // Handle frame adjustments
  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScale(parseFloat(e.target.value));
  };
  
  const handleXPositionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setXPosition(parseFloat(e.target.value));
  };
  
  const handleYPositionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYPosition(parseFloat(e.target.value));
  };
  
  const handleRotationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRotation(parseFloat(e.target.value));
  };
  
  // Calculate frame overlay style
  const frameOverlayStyle = {
    transform: `
      translate(${xPosition}%, ${yPosition}%) 
      scale(${scale}) 
      rotate(${rotation}deg)
    `,
  };
  
  return (
    <VisualizationContainer>
      <Card variant="outlined">
        <Card.Header title="Virtual Try-On" />
        <Card.Content>
          <VisualizationArea ref={visualizationRef}>
            <BaseImage src={userImage} alt="Your photo" />
            {selectedFrame && (
              <FrameOverlay 
                src={selectedFrame.imageUrl} 
                alt={selectedFrame.name}
                style={frameOverlayStyle}
                onError={(e) => {
                  // Fallback for missing images
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Frame+Overlay';
                }}
              />
            )}
          </VisualizationArea>
          
          {selectedFrame ? (
            <>
              <Typography variant="body1" gutterBottom>
                Adjust the fit of your {selectedFrame.name}
              </Typography>
              
              <ControlsContainer>
                <ControlRow>
                  <ControlLabel variant="body2">Size</ControlLabel>
                  <SliderContainer>
                    <StyledSlider 
                      type="range" 
                      min="0.7" 
                      max="1.3" 
                      step="0.01" 
                      value={scale} 
                      onChange={handleScaleChange} 
                    />
                  </SliderContainer>
                </ControlRow>
                
                <ControlRow>
                  <ControlLabel variant="body2">Horizontal</ControlLabel>
                  <SliderContainer>
                    <StyledSlider 
                      type="range" 
                      min="-20" 
                      max="20" 
                      step="0.5" 
                      value={xPosition} 
                      onChange={handleXPositionChange} 
                    />
                  </SliderContainer>
                </ControlRow>
                
                <ControlRow>
                  <ControlLabel variant="body2">Vertical</ControlLabel>
                  <SliderContainer>
                    <StyledSlider 
                      type="range" 
                      min="-20" 
                      max="20" 
                      step="0.5" 
                      value={yPosition} 
                      onChange={handleYPositionChange} 
                    />
                  </SliderContainer>
                </ControlRow>
                
                <ControlRow>
                  <ControlLabel variant="body2">Rotation</ControlLabel>
                  <SliderContainer>
                    <StyledSlider 
                      type="range" 
                      min="-10" 
                      max="10" 
                      step="0.5" 
                      value={rotation} 
                      onChange={handleRotationChange} 
                    />
                  </SliderContainer>
                </ControlRow>
              </ControlsContainer>
              
              <ActionButtons>
                {onSave && (
                  <Button variant="secondary" onClick={onSave}>
                    Save
                  </Button>
                )}
                
                {onShare && (
                  <Button variant="secondary" onClick={onShare}>
                    Share
                  </Button>
                )}
                
                {onCompare && (
                  <Button variant="primary" onClick={onCompare}>
                    Compare with Other Frames
                  </Button>
                )}
              </ActionButtons>
            </>
          ) : (
            <Typography variant="body1" muted align="center">
              Select a frame to see how it looks on you
            </Typography>
          )}
        </Card.Content>
      </Card>
    </VisualizationContainer>
  );
};

export default TryOnVisualization;