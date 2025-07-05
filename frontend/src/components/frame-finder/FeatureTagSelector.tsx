import React from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../design-system/components/Typography/Typography';
import { Card } from '../../design-system/components/Card/Card';

// Styled components
const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.spacing[8]};
  margin-top: ${({ theme }) => theme.spacing.spacing[16]};
`;

const FeatureTag = styled.div<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing.spacing[8]} ${theme.spacing.spacing[12]}`};
  border-radius: 20px;
  background-color: ${({ theme, isSelected }) => 
    isSelected ? theme.colors.primary[500] : theme.colors.neutral[100]};
  color: ${({ theme, isSelected }) => 
    isSelected ? theme.colors.common.white : theme.colors.neutral[800]};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    background-color: ${({ theme, isSelected }) => 
      isSelected ? theme.colors.primary[600] : theme.colors.neutral[200]};
    transform: translateY(-2px);
  }
`;

const TagIcon = styled.span`
  margin-right: ${({ theme }) => theme.spacing.spacing[8]};
  font-size: 1.2em;
`;

const CategoriesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.spacing[24]};
`;

const CategorySection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
`;

const FeatureInfoCard = styled(Card)`
  margin-top: ${({ theme }) => theme.spacing.spacing[16]};
`;

// Feature data
const featureCategories = [
  {
    id: 'material',
    name: 'Material Features',
    features: [
      { id: 'lightweight', name: 'Lightweight', icon: '🪶', description: 'Frames that are designed to be light and comfortable for all-day wear.' },
      { id: 'flexible', name: 'Flexible', icon: '🔄', description: 'Frames made with flexible materials that can bend without breaking.' },
      { id: 'hypoallergenic', name: 'Hypoallergenic', icon: '✨', description: 'Made from materials that are less likely to cause allergic reactions.' },
      { id: 'eco-friendly', name: 'Eco-Friendly', icon: '🌱', description: 'Frames made from sustainable or recycled materials.' },
      { id: 'scratch-resistant', name: 'Scratch Resistant', icon: '🛡️', description: 'Materials that are more resistant to scratches and daily wear.' }
    ]
  },
  {
    id: 'style',
    name: 'Style Features',
    features: [
      { id: 'minimalist', name: 'Minimalist', icon: '◻️', description: 'Clean, simple designs with minimal embellishments.' },
      { id: 'vintage', name: 'Vintage', icon: '🕰️', description: 'Classic designs inspired by styles from past decades.' },
      { id: 'bold', name: 'Bold', icon: '💯', description: 'Statement frames with distinctive shapes or colors.' },
      { id: 'rimless', name: 'Rimless', icon: '👓', description: 'Frames with no rim around the lenses for a subtle look.' },
      { id: 'decorative', name: 'Decorative', icon: '✨', description: 'Frames with decorative elements like patterns or embellishments.' }
    ]
  },
  {
    id: 'comfort',
    name: 'Comfort Features',
    features: [
      { id: 'adjustable-nose-pads', name: 'Adjustable Nose Pads', icon: '👃', description: 'Nose pads that can be adjusted for a custom fit.' },
      { id: 'spring-hinges', name: 'Spring Hinges', icon: '🔄', description: 'Hinges with springs that provide flexibility and durability.' },
      { id: 'anti-slip', name: 'Anti-Slip', icon: '🚫', description: 'Features that prevent frames from slipping down your nose.' },
      { id: 'low-pressure', name: 'Low Pressure', icon: '☁️', description: 'Designed to minimize pressure points for extended comfort.' },
      { id: 'wide-fit', name: 'Wide Fit', icon: '↔️', description: 'Frames designed for wider face shapes.' }
    ]
  },
  {
    id: 'lens',
    name: 'Lens Features',
    features: [
      { id: 'blue-light-filtering', name: 'Blue Light Filtering', icon: '💻', description: 'Lenses that filter blue light from digital screens.' },
      { id: 'polarized', name: 'Polarized', icon: '☀️', description: 'Reduces glare from reflective surfaces like water or snow.' },
      { id: 'photochromic', name: 'Photochromic', icon: '🔆', description: 'Lenses that darken in sunlight and clear indoors.' },
      { id: 'anti-reflective', name: 'Anti-Reflective', icon: '✨', description: 'Reduces reflections on the lens surface.' },
      { id: 'uv-protection', name: 'UV Protection', icon: '🛡️', description: 'Protects eyes from harmful UV rays.' }
    ]
  }
];

// Component props
interface FeatureTagSelectorProps {
  selectedFeatures: string[];
  onFeatureChange: (features: string[]) => void;
}

/**
 * FeatureTagSelector Component
 * 
 * A component for selecting specific frame features in the Frame Finder questionnaire.
 */
const FeatureTagSelector: React.FC<FeatureTagSelectorProps> = ({
  selectedFeatures,
  onFeatureChange
}) => {
  const [selectedFeatureInfo, setSelectedFeatureInfo] = React.useState<{
    name: string;
    description: string;
  } | null>(null);

  // Toggle feature selection
  const toggleFeature = (featureId: string) => {
    const updatedFeatures = selectedFeatures.includes(featureId)
      ? selectedFeatures.filter(id => id !== featureId)
      : [...selectedFeatures, featureId];
    
    onFeatureChange(updatedFeatures);
  };

  // Show feature info
  const showFeatureInfo = (feature: { name: string; description: string }) => {
    setSelectedFeatureInfo(feature);
  };

  // Get all features as a flat array
  const getAllFeatures = () => {
    return featureCategories.flatMap(category => category.features);
  };

  // Find feature by ID
  const findFeatureById = (featureId: string) => {
    return getAllFeatures().find(feature => feature.id === featureId);
  };

  return (
    <div>
      <Typography variant="body1" gutterBottom>
        Select features that are important to you:
      </Typography>
      
      <CategoriesContainer>
        {featureCategories.map(category => (
          <CategorySection key={category.id}>
            <Typography variant="h6" gutterBottom>
              {category.name}
            </Typography>
            
            <TagsContainer>
              {category.features.map(feature => (
                <FeatureTag
                  key={feature.id}
                  isSelected={selectedFeatures.includes(feature.id)}
                  onClick={() => toggleFeature(feature.id)}
                  onMouseEnter={() => showFeatureInfo(feature)}
                  onMouseLeave={() => setSelectedFeatureInfo(null)}
                >
                  <TagIcon>{feature.icon}</TagIcon>
                  {feature.name}
                </FeatureTag>
              ))}
            </TagsContainer>
          </CategorySection>
        ))}
      </CategoriesContainer>
      
      {selectedFeatureInfo && (
        <FeatureInfoCard variant="outlined">
          <Card.Content>
            <Typography variant="body2" gutterBottom>
              <strong>{selectedFeatureInfo.name}</strong>
            </Typography>
            <Typography variant="caption" muted>
              {selectedFeatureInfo.description}
            </Typography>
          </Card.Content>
        </FeatureInfoCard>
      )}
      
      {selectedFeatures.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <Typography variant="body2" gutterBottom>
            Selected Features:
          </Typography>
          <TagsContainer>
            {selectedFeatures.map(featureId => {
              const feature = findFeatureById(featureId);
              return feature ? (
                <FeatureTag
                  key={featureId}
                  isSelected={true}
                  onClick={() => toggleFeature(featureId)}
                >
                  <TagIcon>{feature.icon}</TagIcon>
                  {feature.name}
                </FeatureTag>
              ) : null;
            })}
          </TagsContainer>
        </div>
      )}
    </div>
  );
};

export default FeatureTagSelector;