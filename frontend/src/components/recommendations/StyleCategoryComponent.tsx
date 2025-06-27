/**
 * Style Category Component
 * 
 * This component displays a style category with a title, description, and frames.
 */

import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Typography, Card, Button } from '../../../src/design-system';
import { Frame } from '../../types/recommendations';

// Style category interface
export interface StyleCategory {
  id: string;
  name: string;
  description: string;
  frames: Frame[];
}

// Props interface
export interface StyleCategoryComponentProps {
  category: StyleCategory;
  onFrameSelect: (frameId: string) => void;
  active?: boolean;
  onToggle?: () => void;
}

// Styled components
const CategoryContainer = styled.div<{ active?: boolean }>`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[32]};
  transition: all 0.3s ease;
`;

const CategoryHeader = styled.div<{ active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.spacing[16]};
  background-color: ${({ theme, active }) => 
    active ? theme.colors.primary[50] : theme.colors.neutral[50]};
  border-radius: ${({ theme }) => theme.spacing.spacing[8]};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary[100]};
  }
`;

const CategoryContent = styled.div<{ active?: boolean }>`
  display: ${({ active }) => (active ? 'block' : 'none')};
  padding: ${({ theme }) => theme.spacing.spacing[16]} 0;
`;

const FramesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.spacing[24]};
  margin-top: ${({ theme }) => theme.spacing.spacing[24]};
`;

const FrameCard = styled(Card)`
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
  }
`;

/**
 * Style Category Component
 */
export const StyleCategoryComponent: React.FC<StyleCategoryComponentProps> = ({
  category,
  onFrameSelect,
  active = false,
  onToggle,
}) => {
  const [isActive, setIsActive] = useState(active);
  
  const handleToggle = () => {
    const newState = !isActive;
    setIsActive(newState);
    if (onToggle) {
      onToggle();
    }
  };
  
  return (
    <CategoryContainer active={isActive}>
      <CategoryHeader active={isActive} onClick={handleToggle}>
        <div>
          <Typography variant="h4" gutterBottom={false}>
            {category.name}
          </Typography>
        </div>
        <Button 
          variant="tertiary" 
          size="small"
        >
          {isActive ? 'Hide' : 'Show'}
        </Button>
      </CategoryHeader>
      
      <CategoryContent active={isActive}>
        <Typography variant="body1" gutterBottom>
          {category.description}
        </Typography>
        
        <FramesGrid>
          {category.frames.map((frame) => (
            <FrameCard 
              key={frame.id} 
              hoverable 
              clickable 
              onClick={() => onFrameSelect(frame.id)}
            >
              <Card.Content>
                <img 
                  src={frame.image_url} 
                  alt={frame.name} 
                  style={{ 
                    width: '100%', 
                    height: '180px', 
                    objectFit: 'contain',
                    marginBottom: '16px',
                    backgroundColor: 'rgba(0,0,0,0.03)',
                    borderRadius: '4px'
                  }} 
                />
                <Typography variant="h6" gutterBottom>
                  {frame.name}
                </Typography>
                <Typography variant="body2" muted>
                  {frame.brand} • ${frame.price.toFixed(2)}
                </Typography>
              </Card.Content>
            </FrameCard>
          ))}
        </FramesGrid>
      </CategoryContent>
    </CategoryContainer>
  );
};

export default StyleCategoryComponent;