import React from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../design-system/components/Typography/Typography';
import { Frame } from '../../components/virtual-try-on';
import RecommendationCard from './RecommendationCard';

// Styled components
const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: ${({ theme }) => theme.spacing.spacing[16]};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.spacing[32]};
  background-color: ${({ theme }) => theme.colors.neutral[100]};
  border-radius: 8px;
  margin-top: ${({ theme }) => theme.spacing.spacing[16]};
`;

// Component props
interface ResultsGridProps {
  frames: Frame[];
  favoriteFrames: Frame[];
  onToggleFavorite: (frame: Frame) => void;
  onTryOn?: (frame: Frame) => void;
}

/**
 * ResultsGrid Component
 * 
 * A grid component for displaying frame recommendations.
 */
const ResultsGrid: React.FC<ResultsGridProps> = ({
  frames,
  favoriteFrames,
  onToggleFavorite,
  onTryOn
}) => {
  if (frames.length === 0) {
    return (
      <EmptyState>
        <Typography variant="h5" gutterBottom>
          No frames found
        </Typography>
        <Typography variant="body1" muted>
          Try adjusting your filters to see more options.
        </Typography>
      </EmptyState>
    );
  }
  
  return (
    <GridContainer>
      {frames.map(frame => (
        <RecommendationCard
          key={frame.id}
          frame={frame}
          isFavorite={favoriteFrames.some(f => f.id === frame.id)}
          onToggleFavorite={onToggleFavorite}
          onTryOn={onTryOn}
        />
      ))}
    </GridContainer>
  );
};

export default ResultsGrid;