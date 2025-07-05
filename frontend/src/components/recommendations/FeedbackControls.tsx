/**
 * Feedback Controls Component
 * 
 * This component provides controls for users to give feedback on frame recommendations.
 */

import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../../src/design-system';

// Props interface
export interface FeedbackControlsProps {
  frameId: string;
  onLike: () => void;
  onDislike: () => void;
  onSaveForLater: () => void;
  initialLiked?: boolean | null;
  initialSaved?: boolean;
}

// Styled components
const FeedbackContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: ${({ theme }) => theme.spacing.spacing[16]} 0;
  padding: ${({ theme }) => theme.spacing.spacing[8]} 0;
  border-top: 1px solid ${({ theme }) => theme.colors.neutral[100]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral[100]};
`;

const FeedbackGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.spacing[8]};
`;

const FeedbackButton = styled.button<{ active?: boolean; negative?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme, active, negative }) => 
    active 
      ? negative 
        ? theme.colors.semantic.error.light 
        : theme.colors.semantic.success.light
      : theme.colors.neutral[50]};
  color: ${({ theme, active, negative }) => 
    active 
      ? negative 
        ? theme.colors.semantic.error.main 
        : theme.colors.semantic.success.main
      : theme.colors.neutral[700]};
  border: 1px solid ${({ theme, active, negative }) => 
    active 
      ? negative 
        ? theme.colors.semantic.error.main 
        : theme.colors.semantic.success.main
      : theme.colors.neutral[200]};
  border-radius: 50%;
  width: 36px;
  height: 36px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme, negative }) => 
      negative 
        ? theme.colors.semantic.error.light 
        : theme.colors.semantic.success.light};
    border-color: ${({ theme, negative }) => 
      negative 
        ? theme.colors.semantic.error.main 
        : theme.colors.semantic.success.main};
  }
`;

const SaveButton = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme, active }) => 
    active ? theme.colors.primary[50] : 'transparent'};
  color: ${({ theme, active }) => 
    active ? theme.colors.primary[500] : theme.colors.neutral[700]};
  border: none;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  padding: ${({ theme }) => `${theme.spacing.spacing[4]} ${theme.spacing.spacing[8]}`};
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary[50]};
    color: ${({ theme }) => theme.colors.primary[500]};
  }
`;

/**
 * Feedback Controls Component
 */
export const FeedbackControls: React.FC<FeedbackControlsProps> = ({
  // frameId is used for identification but not directly in the component
  onLike,
  onDislike,
  onSaveForLater,
  initialLiked = null,
  initialSaved = false,
}) => {
  const [liked, setLiked] = useState<boolean | null>(initialLiked);
  const [saved, setSaved] = useState<boolean>(initialSaved);
  
  const handleLike = () => {
    const newLiked = liked === true ? null : true;
    setLiked(newLiked);
    if (newLiked === true) {
      onLike();
    }
  };
  
  const handleDislike = () => {
    const newLiked = liked === false ? null : false;
    setLiked(newLiked);
    if (newLiked === false) {
      onDislike();
    }
  };
  
  const handleSaveForLater = () => {
    const newSaved = !saved;
    setSaved(newSaved);
    if (newSaved) {
      onSaveForLater();
    }
  };
  
  return (
    <FeedbackContainer>
      <FeedbackGroup>
        <Typography variant="body2" muted>
          Feedback:
        </Typography>
        <FeedbackButton 
          active={liked === true} 
          onClick={handleLike}
          aria-label="Like"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </FeedbackButton>
        <FeedbackButton 
          active={liked === false} 
          negative 
          onClick={handleDislike}
          aria-label="Dislike"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </FeedbackButton>
      </FeedbackGroup>
      
      <SaveButton 
        active={saved} 
        onClick={handleSaveForLater}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18" style={{ marginRight: '4px' }}>
          <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
        </svg>
        {saved ? 'Saved' : 'Save for Later'}
      </SaveButton>
    </FeedbackContainer>
  );
};

export default FeedbackControls;