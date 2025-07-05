import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Button } from '../../design-system/components/Button/Button';
import { Typography } from '../../design-system/components/Typography/Typography';
import { Card } from '../../design-system/components/Card/Card';

// Mock data for frames
export interface Frame {
  id: string;
  name: string;
  brand: string;
  price: number;
  color: string;
  material: string;
  shape: string;
  imageUrl: string;
}

const mockFrames: Frame[] = [
  {
    id: 'frame-1',
    name: 'Aviator Classic',
    brand: 'RayBan',
    price: 149.99,
    color: 'Gold',
    material: 'Metal',
    shape: 'Aviator',
    imageUrl: '/images/frames/aviator-classic.jpg'
  },
  {
    id: 'frame-2',
    name: 'Wayfarer',
    brand: 'RayBan',
    price: 139.99,
    color: 'Black',
    material: 'Acetate',
    shape: 'Square',
    imageUrl: '/images/frames/wayfarer.jpg'
  },
  {
    id: 'frame-3',
    name: 'Round Metal',
    brand: 'RayBan',
    price: 159.99,
    color: 'Silver',
    material: 'Metal',
    shape: 'Round',
    imageUrl: '/images/frames/round-metal.jpg'
  },
  {
    id: 'frame-4',
    name: 'Clubmaster',
    brand: 'RayBan',
    price: 169.99,
    color: 'Tortoise',
    material: 'Mixed',
    shape: 'Browline',
    imageUrl: '/images/frames/clubmaster.jpg'
  },
  {
    id: 'frame-5',
    name: 'Justin Classic',
    brand: 'RayBan',
    price: 129.99,
    color: 'Black',
    material: 'Propionate',
    shape: 'Rectangle',
    imageUrl: '/images/frames/justin-classic.jpg'
  },
  {
    id: 'frame-6',
    name: 'Erika',
    brand: 'RayBan',
    price: 139.99,
    color: 'Brown',
    material: 'Nylon',
    shape: 'Round',
    imageUrl: '/images/frames/erika.jpg'
  }
];

// Styled components
const SelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.spacing[16]};
  margin-bottom: ${({ theme }) => theme.spacing.spacing[24]};
  flex-wrap: wrap;
`;

const FilterButton = styled(Button)<{ isActive?: boolean }>`
  opacity: ${({ isActive }) => (isActive ? 1 : 0.7)};
  min-width: 80px;
`;

const FramesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: ${({ theme }) => theme.spacing.spacing[16]};
  margin-bottom: ${({ theme }) => theme.spacing.spacing[24]};
`;

const FrameCard = styled(Card)<{ isSelected?: boolean }>`
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: 2px solid ${({ theme, isSelected }) => 
    isSelected ? theme.colors.primary[500] : 'transparent'};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.effects.hover};
  }
`;

const FrameImage = styled.img`
  width: 100%;
  height: 120px;
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

// Component props
interface FrameSelectorProps {
  onFrameSelect: (frame: Frame) => void;
}

/**
 * FrameSelector Component
 * 
 * A component for browsing and selecting eyewear frames.
 */
const FrameSelector: React.FC<FrameSelectorProps> = ({ onFrameSelect }) => {
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  // Filter options
  const shapes = Array.from(new Set(mockFrames.map(frame => frame.shape)));
  const materials = Array.from(new Set(mockFrames.map(frame => frame.material)));
  
  // Filtered frames
  const filteredFrames = activeFilter 
    ? mockFrames.filter(frame => frame.shape === activeFilter || frame.material === activeFilter)
    : mockFrames;
  
  // Handle frame selection
  const handleFrameSelect = (frame: Frame) => {
    setSelectedFrame(frame);
    onFrameSelect(frame);
  };
  
  // Handle filter selection
  const handleFilterSelect = (filter: string) => {
    setActiveFilter(activeFilter === filter ? null : filter);
  };

  return (
    <SelectorContainer>
      <Card variant="outlined">
        <Card.Header title="Select Your Frames" />
        <Card.Content>
          <FiltersContainer>
            <Typography variant="body2" muted style={{ alignSelf: 'center' }}>
              Filter by:
            </Typography>
            
            {shapes.map(shape => (
              <FilterButton
                key={`shape-${shape}`}
                variant="secondary"
                size="small"
                isActive={activeFilter === shape}
                onClick={() => handleFilterSelect(shape)}
              >
                {shape}
              </FilterButton>
            ))}
            
            {materials.map(material => (
              <FilterButton
                key={`material-${material}`}
                variant="secondary"
                size="small"
                isActive={activeFilter === material}
                onClick={() => handleFilterSelect(material)}
              >
                {material}
              </FilterButton>
            ))}
          </FiltersContainer>
          
          <FramesGrid>
            {filteredFrames.map(frame => (
              <FrameCard 
                key={frame.id}
                variant="elevated"
                elevation={1}
                isSelected={selectedFrame?.id === frame.id}
                onClick={() => handleFrameSelect(frame)}
              >
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
                  <Typography variant="body2">
                    <PriceTag>${frame.price.toFixed(2)}</PriceTag>
                  </Typography>
                </FrameInfo>
              </FrameCard>
            ))}
          </FramesGrid>
          
          {selectedFrame && (
            <Button 
              variant="primary" 
              fullWidth
              onClick={() => onFrameSelect(selectedFrame)}
            >
              Try On {selectedFrame.name}
            </Button>
          )}
        </Card.Content>
      </Card>
    </SelectorContainer>
  );
};

export default FrameSelector;