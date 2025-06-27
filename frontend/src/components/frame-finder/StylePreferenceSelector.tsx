import React from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../design-system/components/Typography/Typography';
import { Button } from '../../design-system/components/Button/Button';
import { Card } from '../../design-system/components/Card/Card';

// Styled components
const SectionContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[24]};
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: ${({ theme }) => theme.spacing.spacing[8]};
  margin-top: ${({ theme }) => theme.spacing.spacing[8]};
`;

const ColorOption = styled.div<{ color: string; isSelected: boolean }>`
  width: 100%;
  height: 40px;
  background-color: ${({ color }) => color};
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid ${({ theme, isSelected }) => 
    isSelected ? theme.colors.primary[500] : 'transparent'};
  transition: all 0.2s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.effects.hover};
  }
`;

const OptionButton = styled(Button)<{ isSelected: boolean }>`
  opacity: ${({ isSelected }) => (isSelected ? 1 : 0.7)};
  transition: all 0.2s ease-in-out;
  
  &:hover {
    opacity: 1;
  }
`;

// Color mapping
const colorOptions = [
  { id: 'Black', value: '#000000', textColor: '#FFFFFF' },
  { id: 'Brown', value: '#8B4513', textColor: '#FFFFFF' },
  { id: 'Tortoise', value: '#704214', textColor: '#FFFFFF' },
  { id: 'Gold', value: '#FFD700', textColor: '#000000' },
  { id: 'Silver', value: '#C0C0C0', textColor: '#000000' },
  { id: 'Blue', value: '#0000FF', textColor: '#FFFFFF' },
  { id: 'Red', value: '#FF0000', textColor: '#FFFFFF' },
  { id: 'Green', value: '#008000', textColor: '#FFFFFF' },
  { id: 'Purple', value: '#800080', textColor: '#FFFFFF' },
  { id: 'Clear', value: '#F5F5F5', textColor: '#000000' },
];

// Material options
const materialOptions = [
  'Acetate',
  'Metal',
  'Titanium',
  'Plastic',
  'Nylon',
  'Wood',
  'Mixed',
  'Carbon Fiber',
  'Propionate'
];

// Shape options
const shapeOptions = [
  'Round',
  'Square',
  'Rectangle',
  'Oval',
  'Cat Eye',
  'Aviator',
  'Browline',
  'Oversized',
  'Hexagonal',
  'Geometric'
];

// Component props
interface StylePreferenceSelectorProps {
  selectedPreferences: {
    colors: string[];
    materials: string[];
    shapes: string[];
  };
  onPreferenceChange: (preferences: {
    colors: string[];
    materials: string[];
    shapes: string[];
  }) => void;
}

/**
 * StylePreferenceSelector Component
 * 
 * A component for selecting style preferences in the Frame Finder questionnaire.
 */
const StylePreferenceSelector: React.FC<StylePreferenceSelectorProps> = ({
  selectedPreferences,
  onPreferenceChange
}) => {
  // Toggle color selection
  const toggleColor = (color: string) => {
    const updatedColors = selectedPreferences.colors.includes(color)
      ? selectedPreferences.colors.filter(c => c !== color)
      : [...selectedPreferences.colors, color];
    
    onPreferenceChange({
      ...selectedPreferences,
      colors: updatedColors
    });
  };
  
  // Toggle material selection
  const toggleMaterial = (material: string) => {
    const updatedMaterials = selectedPreferences.materials.includes(material)
      ? selectedPreferences.materials.filter(m => m !== material)
      : [...selectedPreferences.materials, material];
    
    onPreferenceChange({
      ...selectedPreferences,
      materials: updatedMaterials
    });
  };
  
  // Toggle shape selection
  const toggleShape = (shape: string) => {
    const updatedShapes = selectedPreferences.shapes.includes(shape)
      ? selectedPreferences.shapes.filter(s => s !== shape)
      : [...selectedPreferences.shapes, shape];
    
    onPreferenceChange({
      ...selectedPreferences,
      shapes: updatedShapes
    });
  };
  
  return (
    <div>
      <SectionContainer>
        <Card variant="outlined">
          <Card.Header title="Frame Colors" />
          <Card.Content>
            <Typography variant="body2" muted gutterBottom>
              Select one or more colors you prefer for your frames:
            </Typography>
            
            <OptionsGrid>
              {colorOptions.map(color => (
                <div key={color.id} style={{ textAlign: 'center' }}>
                  <ColorOption
                    color={color.value}
                    isSelected={selectedPreferences.colors.includes(color.id)}
                    onClick={() => toggleColor(color.id)}
                  >
                    <Typography 
                      variant="caption" 
                      style={{ color: color.textColor, fontWeight: 'bold' }}
                    >
                      {selectedPreferences.colors.includes(color.id) ? '✓' : ''}
                    </Typography>
                  </ColorOption>
                  <Typography variant="caption" style={{ marginTop: '4px', display: 'block' }}>
                    {color.id}
                  </Typography>
                </div>
              ))}
            </OptionsGrid>
          </Card.Content>
        </Card>
      </SectionContainer>
      
      <SectionContainer>
        <Card variant="outlined">
          <Card.Header title="Frame Materials" />
          <Card.Content>
            <Typography variant="body2" muted gutterBottom>
              Select one or more materials you prefer:
            </Typography>
            
            <OptionsGrid>
              {materialOptions.map(material => (
                <OptionButton
                  key={material}
                  variant={selectedPreferences.materials.includes(material) ? 'primary' : 'secondary'}
                  size="small"
                  isSelected={selectedPreferences.materials.includes(material)}
                  onClick={() => toggleMaterial(material)}
                >
                  {material}
                </OptionButton>
              ))}
            </OptionsGrid>
          </Card.Content>
        </Card>
      </SectionContainer>
      
      <SectionContainer>
        <Card variant="outlined">
          <Card.Header title="Frame Shapes" />
          <Card.Content>
            <Typography variant="body2" muted gutterBottom>
              Select one or more frame shapes you prefer:
            </Typography>
            
            <OptionsGrid>
              {shapeOptions.map(shape => (
                <OptionButton
                  key={shape}
                  variant={selectedPreferences.shapes.includes(shape) ? 'primary' : 'secondary'}
                  size="small"
                  isSelected={selectedPreferences.shapes.includes(shape)}
                  onClick={() => toggleShape(shape)}
                >
                  {shape}
                </OptionButton>
              ))}
            </OptionsGrid>
          </Card.Content>
        </Card>
      </SectionContainer>
    </div>
  );
};

export default StylePreferenceSelector;