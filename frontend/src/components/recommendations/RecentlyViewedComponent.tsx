/**
 * Recently Viewed Component
 * 
 * This component displays frames that the user has recently viewed.
 */

import React from 'react';
import styled from '@emotion/styled';
import { Typography, Card } from '../../../src/design-system';
import { Frame } from '../../types/recommendations';

// Props interface
export interface RecentlyViewedComponentProps {
  frames: Frame[];
  onSelect: (frameId: string) => void;
  title?: string;
}

// Styled components
const RecentlyViewedContainer = styled.div`
  margin: ${({ theme }) => theme.spacing.spacing[24]} 0;
  padding-top: ${({ theme }) => theme.spacing.spacing[16]};
  border-top: 1px solid ${({ theme }) => theme.colors.neutral[200]};
`;

const RecentlyViewedHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
`;

const RecentlyViewedScroll = styled.div`
  display: flex;
  overflow-x: auto;
  gap: ${({ theme }) => theme.spacing.spacing[16]};
  padding: ${({ theme }) => theme.spacing.spacing[4]} 0;
  
  /* Hide scrollbar but allow scrolling */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
`;

const RecentlyViewedItem = styled(Card)`
  flex: 0 0 auto;
  width: 160px;
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
  }
  
  ${({ theme }) => theme.breakpoints.up('md')} {
    width: 180px;
  }
`;

const RecentlyViewedImage = styled.img`
  width: 100%;
  height: 100px;
  object-fit: contain;
  background-color: ${({ theme }) => theme.colors.neutral[50]};
  border-radius: ${({ theme }) => theme.spacing.spacing[4]};
`;

/**
 * Recently Viewed Component
 */
export const RecentlyViewedComponent: React.FC<RecentlyViewedComponentProps> = ({
  frames,
  onSelect,
  title = 'Recently Viewed',
}) => {
  if (!frames || frames.length === 0) {
    return null;
  }
  
  return (
    <RecentlyViewedContainer>
      <RecentlyViewedHeader>
        <Typography variant="h5" gutterBottom={false}>
          {title}
        </Typography>
      </RecentlyViewedHeader>
      
      <RecentlyViewedScroll>
        {frames.map((frame) => (
          <RecentlyViewedItem 
            key={frame.id} 
            variant="outlined" 
            hoverable 
            onClick={() => onSelect(frame.id)}
          >
            <Card.Content>
              <RecentlyViewedImage 
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
            </Card.Content>
          </RecentlyViewedItem>
        ))}
      </RecentlyViewedScroll>
    </RecentlyViewedContainer>
  );
};

export default RecentlyViewedComponent;