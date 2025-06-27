/**
 * Trending Styles Component
 * 
 * This component displays trending eyewear styles in the user's region.
 */

import React from 'react';
import styled from '@emotion/styled';
import { Typography, Card } from '../../../src/design-system';
import { Frame } from '../../types/recommendations';

// Props interface
export interface TrendingStylesComponentProps {
  frames: Frame[];
  onSelect: (frameId: string) => void;
  region: string;
  trendingData?: {
    percentageIncrease: number;
    timeFrame: string;
  };
}

// Styled components
const TrendingContainer = styled.div`
  margin: ${({ theme }) => theme.spacing.spacing[32]} 0;
`;

const TrendingHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
  
  ${({ theme }) => theme.breakpoints.down('sm')} {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing.spacing[8]};
  }
`;

const TrendingBadge = styled.span`
  display: inline-flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.semantic.success.light};
  color: ${({ theme }) => theme.colors.semantic.success.dark};
  padding: ${({ theme }) => `${theme.spacing.spacing[4]} ${theme.spacing.spacing[8]}`};
  border-radius: ${({ theme }) => theme.spacing.spacing[4]};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  margin-left: ${({ theme }) => theme.spacing.spacing[8]};
  
  svg {
    margin-right: ${({ theme }) => theme.spacing.spacing[4]};
  }
  
  ${({ theme }) => theme.breakpoints.down('sm')} {
    margin-left: 0;
    margin-top: ${({ theme }) => theme.spacing.spacing[4]};
  }
`;

const TrendingBanner = styled.div`
  background-color: ${({ theme }) => `${theme.colors.primary[50]}`};
  border-radius: ${({ theme }) => theme.spacing.spacing[8]};
  padding: ${({ theme }) => theme.spacing.spacing[16]};
  margin-bottom: ${({ theme }) => theme.spacing.spacing[24]};
  display: flex;
  align-items: center;
  
  ${({ theme }) => theme.breakpoints.down('sm')} {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const TrendingIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${({ theme }) => theme.spacing.spacing[16]};
  flex-shrink: 0;
  
  ${({ theme }) => theme.breakpoints.down('sm')} {
    margin-bottom: ${({ theme }) => theme.spacing.spacing[12]};
  }
`;

const TrendingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: ${({ theme }) => theme.spacing.spacing[24]};
`;

const TrendingCard = styled(Card)`
  cursor: pointer;
  transition: transform 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-4px);
  }
`;

const TrendingImage = styled.img`
  width: 100%;
  height: 180px;
  object-fit: contain;
  background-color: ${({ theme }) => theme.colors.neutral[50]};
  border-radius: ${({ theme }) => theme.spacing.spacing[4]};
`;

const TrendingTag = styled.span`
  position: absolute;
  top: ${({ theme }) => theme.spacing.spacing[12]};
  right: ${({ theme }) => theme.spacing.spacing[12]};
  display: inline-block;
  padding: ${({ theme }) => `${theme.spacing.spacing[4]} ${theme.spacing.spacing[8]}`};
  border-radius: ${({ theme }) => theme.spacing.spacing[4]};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  background-color: ${({ theme }) => theme.colors.primary[500]};
  color: white;
  z-index: 1;
`;

const TrendingStats = styled.div`
  display: flex;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.spacing[8]};
  
  svg {
    color: ${({ theme }) => theme.colors.semantic.success.main};
    margin-right: ${({ theme }) => theme.spacing.spacing[4]};
  }
`;

/**
 * Trending Styles Component
 */
export const TrendingStylesComponent: React.FC<TrendingStylesComponentProps> = ({
  frames,
  onSelect,
  region,
  trendingData = {
    percentageIncrease: 32,
    timeFrame: 'this month'
  },
}) => {
  if (!frames || frames.length === 0) {
    return null;
  }
  
  return (
    <TrendingContainer>
      <TrendingHeader>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="h4" gutterBottom={false}>
            Trending in {region}
          </Typography>
          <TrendingBadge>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
            {trendingData.percentageIncrease}% Increase
          </TrendingBadge>
        </div>
      </TrendingHeader>
      
      <TrendingBanner>
        <TrendingIcon>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </TrendingIcon>
        <div>
          <Typography variant="body1" style={{ fontWeight: 500 }}>
            Stay on trend with the most popular styles in your area
          </Typography>
          <Typography variant="body2" muted>
            These frames have seen a {trendingData.percentageIncrease}% increase in popularity {trendingData.timeFrame} in {region}.
          </Typography>
        </div>
      </TrendingBanner>
      
      <TrendingGrid>
        {frames.map((frame) => (
          <TrendingCard 
            key={frame.id} 
            variant="elevated" 
            elevation={1}
            hoverable 
            onClick={() => onSelect(frame.id)}
          >
            <Card.Content>
              <TrendingTag>Trending</TrendingTag>
              <TrendingImage 
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
              <TrendingStats>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
                <Typography 
                  variant="body2" 
                  style={{ color: '#22c55e', fontWeight: 500 }}
                >
                  {Math.round(30 + Math.random() * 40)}% increase in popularity
                </Typography>
              </TrendingStats>
            </Card.Content>
          </TrendingCard>
        ))}
      </TrendingGrid>
    </TrendingContainer>
  );
};

export default TrendingStylesComponent;