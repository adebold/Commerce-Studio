/**
 * Seasonal Recommendations Component
 * 
 * This component displays frame recommendations based on the current season.
 */

import React from 'react';
import styled from '@emotion/styled';
import { Typography, Card } from '../../../src/design-system';
import { Frame } from '../../types/recommendations';

// Props interface
export interface SeasonalRecommendationsComponentProps {
  frames: Frame[];
  onSelect: (frameId: string) => void;
  season: 'spring' | 'summer' | 'fall' | 'winter';
}

// Styled components
const SeasonalContainer = styled.div`
  margin: ${({ theme }) => theme.spacing.spacing[32]} 0;
`;

const SeasonalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
`;

const SeasonalBanner = styled.div<{ season: string }>`
  background-color: ${({ theme, season }) => {
    switch (season) {
      case 'spring':
        return `${theme.colors.semantic.success.light}40`; // 40 is for opacity
      case 'summer':
        return `${theme.colors.semantic.warning.light}40`;
      case 'fall':
        return `${theme.colors.semantic.error.light}40`;
      case 'winter':
        return theme.colors.primary[50];
      default:
        return theme.colors.primary[50];
    }
  }};
  border-radius: ${({ theme }) => theme.spacing.spacing[8]};
  padding: ${({ theme }) => theme.spacing.spacing[16]};
  margin-bottom: ${({ theme }) => theme.spacing.spacing[24]};
`;

const SeasonalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: ${({ theme }) => theme.spacing.spacing[24]};
`;

const SeasonalCard = styled(Card)`
  cursor: pointer;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
  }
`;

const SeasonalImage = styled.img`
  width: 100%;
  height: 180px;
  object-fit: contain;
  background-color: ${({ theme }) => theme.colors.neutral[50]};
  border-radius: ${({ theme }) => theme.spacing.spacing[4]};
`;

const SeasonalTag = styled.span<{ season: string }>`
  display: inline-block;
  padding: ${({ theme }) => `${theme.spacing.spacing[2]} ${theme.spacing.spacing[8]}`};
  border-radius: ${({ theme }) => theme.spacing.spacing[4]};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  margin-bottom: ${({ theme }) => theme.spacing.spacing[8]};
  background-color: ${({ theme, season }) => {
    switch (season) {
      case 'spring':
        return theme.colors.semantic.success.light;
      case 'summer':
        return theme.colors.semantic.warning.light;
      case 'fall':
        return theme.colors.semantic.error.light;
      case 'winter':
        return theme.colors.primary[100];
      default:
        return theme.colors.primary[100];
    }
  }};
  color: ${({ theme, season }) => {
    switch (season) {
      case 'spring':
        return theme.colors.semantic.success.dark;
      case 'summer':
        return theme.colors.semantic.warning.dark;
      case 'fall':
        return theme.colors.semantic.error.dark;
      case 'winter':
        return theme.colors.primary[800];
      default:
        return theme.colors.primary[800];
    }
  }};
`;

// Helper function to get season description
const getSeasonDescription = (season: string): string => {
  switch (season) {
    case 'spring':
      return 'Light, colorful frames perfect for the fresh spring season. These styles embrace renewal and brightness.';
    case 'summer':
      return 'Bold, vibrant frames that stand out in the summer sun. These styles are perfect for beach days and outdoor activities.';
    case 'fall':
      return 'Warm-toned frames with rich colors that complement the autumn palette. These styles offer sophistication and warmth.';
    case 'winter':
      return 'Elegant, versatile frames that work well in any winter setting. These styles provide a refined look for the season.';
    default:
      return '';
  }
};

// Helper function to get season title
const getSeasonTitle = (season: string): string => {
  switch (season) {
    case 'spring':
      return 'Spring Style Selection';
    case 'summer':
      return 'Summer Trending Frames';
    case 'fall':
      return 'Fall Fashion Favorites';
    case 'winter':
      return 'Winter Essential Styles';
    default:
      return 'Seasonal Recommendations';
  }
};

/**
 * Seasonal Recommendations Component
 */
export const SeasonalRecommendationsComponent: React.FC<SeasonalRecommendationsComponentProps> = ({
  frames,
  onSelect,
  season,
}) => {
  if (!frames || frames.length === 0) {
    return null;
  }
  
  return (
    <SeasonalContainer>
      <SeasonalHeader>
        <Typography variant="h4" gutterBottom={false}>
          {getSeasonTitle(season)}
        </Typography>
      </SeasonalHeader>
      
      <SeasonalBanner season={season}>
        <Typography variant="body1">
          {getSeasonDescription(season)}
        </Typography>
      </SeasonalBanner>
      
      <SeasonalGrid>
        {frames.map((frame) => (
          <SeasonalCard 
            key={frame.id} 
            variant="elevated" 
            elevation={1}
            hoverable 
            onClick={() => onSelect(frame.id)}
          >
            <Card.Content>
              <SeasonalTag season={season}>
                {season.charAt(0).toUpperCase() + season.slice(1)} Pick
              </SeasonalTag>
              <SeasonalImage 
                src={frame.image_url} 
                alt={frame.name} 
              />
              <Typography 
                variant="h6" 
                gutterBottom
                style={{ marginTop: '12px' }}
              >
                {frame.name}
              </Typography>
              <Typography variant="body2" muted>
                {frame.brand} • ${frame.price.toFixed(2)}
              </Typography>
              <Typography 
                variant="body2" 
                style={{ marginTop: '8px' }}
              >
                Perfect for {season} with its {frame.color.toLowerCase()} {frame.material.toLowerCase()} design.
              </Typography>
            </Card.Content>
          </SeasonalCard>
        ))}
      </SeasonalGrid>
    </SeasonalContainer>
  );
};

export default SeasonalRecommendationsComponent;