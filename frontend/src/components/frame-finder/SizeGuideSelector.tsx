import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../design-system/components/Typography/Typography';
import { Button } from '../../design-system/components/Button/Button';
import { Card } from '../../design-system/components/Card/Card';

// Styled components
const SizeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.spacing[24]};
`;

const SizeSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
`;

const SizeOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.spacing[8]};
  margin-top: ${({ theme }) => theme.spacing.spacing[8]};
`;

const SizeGuideContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.spacing[24]};
  padding: ${({ theme }) => theme.spacing.spacing[16]};
  background-color: ${({ theme }) => theme.colors.neutral[50]};
  border-radius: 8px;
`;

const GuideImage = styled.img`
  max-width: 100%;
  height: auto;
  margin: ${({ theme }) => theme.spacing.spacing[16]} 0;
  border-radius: 4px;
`;

const MeasurementDiagram = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  margin-top: ${({ theme }) => theme.spacing.spacing[16]};
`;

const DiagramImage = styled.img`
  width: 100%;
  height: auto;
  border-radius: 4px;
`;

const MeasurementPoint = styled.div<{ top: string; left: string }>`
  position: absolute;
  top: ${({ top }) => top};
  left: ${({ left }) => left};
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary[500]};
  color: ${({ theme }) => theme.colors.common.white};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  
  &:hover {
    transform: scale(1.2);
    z-index: 10;
  }
`;

const MeasurementTooltip = styled.div<{ isVisible: boolean }>`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: ${({ theme }) => theme.colors.common.white};
  border: 1px solid ${({ theme }) => theme.colors.neutral[300]};
  border-radius: 4px;
  padding: ${({ theme }) => theme.spacing.spacing[8]};
  width: 150px;
  box-shadow: ${({ theme }) => theme.shadows.effects.hover};
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  visibility: ${({ isVisible }) => (isVisible ? 'visible' : 'hidden')};
  transition: all 0.2s ease-in-out;
  z-index: 20;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 6px;
    border-style: solid;
    border-color: ${({ theme }) => theme.colors.common.white} transparent transparent transparent;
  }
`;

const SizeComparisonTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: ${({ theme }) => theme.spacing.spacing[16]};
  
  th, td {
    padding: ${({ theme }) => theme.spacing.spacing[8]};
    text-align: center;
    border: 1px solid ${({ theme }) => theme.colors.neutral[300]};
  }
  
  th {
    background-color: ${({ theme }) => theme.colors.neutral[100]};
    font-weight: 600;
  }
  
  tr:nth-of-type(even) {
    background-color: ${({ theme }) => theme.colors.neutral[50]};
  }
`;

// Size data
const frameSizes = [
  { id: 'extra-small', name: 'Extra Small', width: '125-129mm', bridge: '14-16mm', temple: '135-140mm' },
  { id: 'small', name: 'Small', width: '130-134mm', bridge: '16-18mm', temple: '140-145mm' },
  { id: 'medium', name: 'Medium', width: '135-139mm', bridge: '18-20mm', temple: '145-150mm' },
  { id: 'large', name: 'Large', width: '140-144mm', bridge: '20-22mm', temple: '150-155mm' },
  { id: 'extra-large', name: 'Extra Large', width: '145mm+', bridge: '22mm+', temple: '155mm+' }
];

// Measurement points
const measurementPoints = [
  { id: 1, name: 'Frame Width', top: '50%', left: '50%', description: 'The total width of the frame from temple to temple.' },
  { id: 2, name: 'Bridge Width', top: '40%', left: '50%', description: 'The distance between the lenses, where the frame sits on your nose.' },
  { id: 3, name: 'Temple Length', top: '30%', left: '80%', description: 'The length of the arms that extend over your ears.' },
  { id: 4, name: 'Lens Height', top: '60%', left: '30%', description: 'The vertical height of the lens.' },
  { id: 5, name: 'Lens Width', top: '50%', left: '30%', description: 'The horizontal width of the lens.' }
];

// Component props
interface SizeGuideSelectorProps {
  selectedSizes: {
    frameWidth: string | null;
    templeLength: string | null;
    bridgeWidth: string | null;
  };
  onSizeChange: (sizes: {
    frameWidth: string | null;
    templeLength: string | null;
    bridgeWidth: string | null;
  }) => void;
}

/**
 * SizeGuideSelector Component
 * 
 * A component for selecting frame sizes with visual guides in the Frame Finder questionnaire.
 */
const SizeGuideSelector: React.FC<SizeGuideSelectorProps> = ({
  selectedSizes,
  onSizeChange
}) => {
  const [showGuide, setShowGuide] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);
  
  // Handle size selection
  const handleSizeChange = (type: 'frameWidth' | 'templeLength' | 'bridgeWidth', value: string) => {
    const updatedSizes = {
      ...selectedSizes,
      [type]: selectedSizes[type] === value ? null : value
    };
    
    onSizeChange(updatedSizes);
  };
  
  // Toggle tooltip visibility
  const toggleTooltip = (pointId: number) => {
    setActiveTooltip(activeTooltip === pointId ? null : pointId);
  };

  return (
    <SizeContainer>
      <Typography variant="body1" gutterBottom>
        Select your preferred frame size measurements:
      </Typography>
      
      <Button 
        variant="secondary" 
        size="small" 
        onClick={() => setShowGuide(!showGuide)}
        style={{ alignSelf: 'flex-start' }}
      >
        {showGuide ? 'Hide Size Guide' : 'Show Size Guide'}
      </Button>
      
      {showGuide && (
        <SizeGuideContainer>
          <Typography variant="h6" gutterBottom>
            How to Measure Your Frame Size
          </Typography>
          
          <Typography variant="body2" gutterBottom>
            Understanding frame measurements helps you find the perfect fit. Look for these measurements on your current frames, usually printed on the inside of the temple arm.
          </Typography>
          
          <MeasurementDiagram>
            <DiagramImage src="/images/frame-measurements-diagram.png" alt="Frame measurements diagram" />
            
            {measurementPoints.map(point => (
              <React.Fragment key={point.id}>
                <MeasurementPoint 
                  top={point.top} 
                  left={point.left}
                  onClick={() => toggleTooltip(point.id)}
                >
                  {point.id}
                </MeasurementPoint>
                
                <MeasurementTooltip isVisible={activeTooltip === point.id}>
                  <Typography variant="body2" gutterBottom>
                    <strong>{point.name}</strong>
                  </Typography>
                  <Typography variant="caption" muted>
                    {point.description}
                  </Typography>
                </MeasurementTooltip>
              </React.Fragment>
            ))}
          </MeasurementDiagram>
          
          <Typography variant="h6" style={{ marginTop: '24px' }} gutterBottom>
            Size Comparison Chart
          </Typography>
          
          <SizeComparisonTable>
            <thead>
              <tr>
                <th>Size</th>
                <th>Frame Width</th>
                <th>Bridge Width</th>
                <th>Temple Length</th>
              </tr>
            </thead>
            <tbody>
              {frameSizes.map(size => (
                <tr key={size.id}>
                  <td>{size.name}</td>
                  <td>{size.width}</td>
                  <td>{size.bridge}</td>
                  <td>{size.temple}</td>
                </tr>
              ))}
            </tbody>
          </SizeComparisonTable>
          
          <GuideImage src="/images/frame-size-comparison.png" alt="Frame size comparison" />
        </SizeGuideContainer>
      )}
      
      <SizeSection>
        <Typography variant="body2" gutterBottom>
          Frame Width
        </Typography>
        <SizeOptions>
          {frameSizes.map(size => (
            <Button
              key={`width-${size.id}`}
              variant={selectedSizes.frameWidth === size.id ? 'primary' : 'secondary'}
              size="small"
              onClick={() => handleSizeChange('frameWidth', size.id)}
            >
              {size.name} ({size.width})
            </Button>
          ))}
        </SizeOptions>
      </SizeSection>
      
      <SizeSection>
        <Typography variant="body2" gutterBottom>
          Bridge Width
        </Typography>
        <SizeOptions>
          {frameSizes.map(size => (
            <Button
              key={`bridge-${size.id}`}
              variant={selectedSizes.bridgeWidth === size.id ? 'primary' : 'secondary'}
              size="small"
              onClick={() => handleSizeChange('bridgeWidth', size.id)}
            >
              {size.name} ({size.bridge})
            </Button>
          ))}
        </SizeOptions>
      </SizeSection>
      
      <SizeSection>
        <Typography variant="body2" gutterBottom>
          Temple Length
        </Typography>
        <SizeOptions>
          {frameSizes.map(size => (
            <Button
              key={`temple-${size.id}`}
              variant={selectedSizes.templeLength === size.id ? 'primary' : 'secondary'}
              size="small"
              onClick={() => handleSizeChange('templeLength', size.id)}
            >
              {size.name} ({size.temple})
            </Button>
          ))}
        </SizeOptions>
      </SizeSection>
      
      <Card variant="outlined">
        <Card.Content>
          <Typography variant="body2" gutterBottom>
            <strong>Tip:</strong> If you already have frames that fit well, check the measurements printed on the inside of the temple arm. They're usually displayed as three numbers, like 52□18-145, which represent lens width, bridge width, and temple length in millimeters.
          </Typography>
        </Card.Content>
      </Card>
    </SizeContainer>
  );
};

export default SizeGuideSelector;