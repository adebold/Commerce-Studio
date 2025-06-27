/**
 * Similar Styles Component
 * 
 * This component displays frames with similar styles to a selected frame.
 */

import React from 'react';
import styled from '@emotion/styled';
import { Typography, Card } from '../../../src/design-system';
import { Frame } from '../../types/recommendations';

// Props interface
export interface SimilarStylesComponentProps {
  frames: Frame[];
  onSelect: (frameId: string) => void;
  title?: string;
}

// Styled components
const SimilarStylesContainer = styled.div`
  margin: ${({ theme }) => theme.spacing.spacing[24]} 0;
`;

const SimilarStylesHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
`;

const SimilarStylesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: ${({ theme }) => theme.spacing.spacing[16]};
  
  ${({ theme }) => theme.breakpoints.up('md')} {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
`;

const SimilarStyleCard = styled(Card)`
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
  }
`;

const SimilarStyleImage = styled.img`
  width: 100%;
  height: 120px;
  object-fit: contain;
  background-color: ${({ theme }) => theme.colors.neutral[50]};
  border-radius: ${({ theme }) => theme.spacing.spacing[4]};
`;

/**
 * Similar Styles Component
 */
export const SimilarStylesComponent: React.FC<SimilarStylesComponentProps> = ({
  frames,
  onSelect,
  title = 'Similar Styles You Might Like',
}) => {
  if (!frames || frames.length === 0) {
    return null;
  }
  
  return (
    <SimilarStylesContainer>
      <SimilarStylesHeader>
        <Typography variant="h5" gutterBottom={false}>
          {title}
        </Typography>
      </SimilarStylesHeader>
      
      <SimilarStylesGrid>
        {frames.map((frame) => (
          <SimilarStyleCard 
            key={frame.id} 
            variant="outlined" 
            hoverable 
            onClick={() => onSelect(frame.id)}
          >
            <Card.Content>
              <SimilarStyleImage 
                src={frame.image_url} 
                alt={frame.name} 
              />
              <Typography 
                variant="body2" 
                style={{ fontWeight: 500, marginTop: '8px' }}
                truncate
              >
                {frame.name}
              </Typography>
              <Typography 
                variant="caption" 
                muted
                truncate
              >
                {frame.brand}
              </Typography>
              <Typography 
                variant="body2" 
                style={{ fontWeight: 600, marginTop: '4px' }}
              >
                ${frame.price.toFixed(2)}
              </Typography>
            </Card.Content>
          </SimilarStyleCard>
        ))}
      </SimilarStylesGrid>
    </SimilarStylesContainer>
  );
};

export default SimilarStylesComponent;