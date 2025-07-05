/**
 * Quick View Modal Component
 * 
 * This component displays a modal with quick view information for a frame.
 */

import React from 'react';
import styled from '@emotion/styled';
import { Typography, Button } from '../../../src/design-system';
import { Frame } from '../../types/recommendations';
import { FeedbackControls } from './FeedbackControls';

// Props interface
export interface QuickViewModalProps {
  frame: Frame;
  open: boolean;
  onClose: () => void;
  onSelect: (frameId: string) => void;
  onTryOn: (frameId: string) => void;
  onFeedback: (frameId: string, liked: boolean) => void;
  onSaveForLater: (frameId: string) => void;
  matchScore?: number;
  matchReason?: string;
}

// Styled components
const ModalOverlay = styled.div<{ open: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${({ open }) => (open ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${({ theme }) => theme.spacing.spacing[16]};
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: ${({ theme }) => theme.spacing.spacing[8]};
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${({ theme }) => theme.shadows.elevation[3]};
  display: flex;
  flex-direction: column;
  
  ${({ theme }) => theme.breakpoints.down('md')} {
    max-width: 100%;
    height: auto;
    max-height: 90vh;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => `${theme.spacing.spacing[16]} ${theme.spacing.spacing[24]}`};
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral[100]};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.neutral[500]};
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.neutral[100]};
    color: ${({ theme }) => theme.colors.neutral[800]};
  }
`;

const ModalBody = styled.div`
  display: flex;
  padding: ${({ theme }) => theme.spacing.spacing[24]};
  
  ${({ theme }) => theme.breakpoints.down('md')} {
    flex-direction: column;
  }
`;

const ImageSection = styled.div`
  flex: 0 0 50%;
  padding-right: ${({ theme }) => theme.spacing.spacing[24]};
  
  ${({ theme }) => theme.breakpoints.down('md')} {
    flex: 1;
    padding-right: 0;
    padding-bottom: ${({ theme }) => theme.spacing.spacing[24]};
  }
`;

const FrameImage = styled.img`
  width: 100%;
  height: 300px;
  object-fit: contain;
  background-color: ${({ theme }) => theme.colors.neutral[50]};
  border-radius: ${({ theme }) => theme.spacing.spacing[8]};
`;

const DetailsSection = styled.div`
  flex: 1;
`;

const MatchBadge = styled.div<{ score: number }>`
  display: inline-block;
  padding: ${({ theme }) => `${theme.spacing.spacing[4]} ${theme.spacing.spacing[8]}`};
  border-radius: ${({ theme }) => theme.spacing.spacing[4]};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
  background-color: ${({ theme, score }) => {
    if (score >= 0.9) return theme.colors.semantic.success.light;
    if (score >= 0.7) return theme.colors.primary[100];
    return theme.colors.neutral[100];
  }};
  color: ${({ theme, score }) => {
    if (score >= 0.9) return theme.colors.semantic.success.dark;
    if (score >= 0.7) return theme.colors.primary[800];
    return theme.colors.neutral[800];
  }};
`;

const FrameSpecs = styled.div`
  margin: ${({ theme }) => `${theme.spacing.spacing[16]} 0`};
  padding: ${({ theme }) => theme.spacing.spacing[16]};
  background-color: ${({ theme }) => theme.colors.neutral[50]};
  border-radius: ${({ theme }) => theme.spacing.spacing[8]};
`;

const SpecRow = styled.div`
  display: flex;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[8]};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SpecLabel = styled.div`
  flex: 0 0 120px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.neutral[600]};
`;

const SpecValue = styled.div`
  flex: 1;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.spacing[8]};
  margin: ${({ theme }) => theme.spacing.spacing[16]} 0;
`;

const Tag = styled.span`
  background-color: ${({ theme }) => theme.colors.neutral[100]};
  color: ${({ theme }) => theme.colors.neutral[800]};
  padding: ${({ theme }) => `${theme.spacing.spacing[4]} ${theme.spacing.spacing[8]}`};
  border-radius: ${({ theme }) => theme.spacing.spacing[4]};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.spacing[12]};
  margin-top: ${({ theme }) => theme.spacing.spacing[24]};
  
  ${({ theme }) => theme.breakpoints.down('sm')} {
    flex-direction: column;
  }
`;

const MatchReason = styled.div`
  margin-top: ${({ theme }) => theme.spacing.spacing[16]};
  padding: ${({ theme }) => theme.spacing.spacing[16]};
  background-color: ${({ theme }) => theme.colors.primary[50]};
  border-radius: ${({ theme }) => theme.spacing.spacing[8]};
`;

/**
 * Quick View Modal Component
 */
export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  frame,
  open,
  onClose,
  onSelect,
  onTryOn,
  onFeedback,
  onSaveForLater,
  matchScore = 0.85,
  matchReason = "This frame complements your style preferences and face shape.",
}) => {
  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);
  
  // Close modal when clicking outside
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  if (!frame) {
    return null;
  }
  
  return (
    <ModalOverlay open={open} onClick={handleOverlayClick}>
      <ModalContent>
        <ModalHeader>
          <Typography variant="h5" gutterBottom={false}>
            Quick View
          </Typography>
          <CloseButton onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </CloseButton>
        </ModalHeader>
        
        <ModalBody>
          <ImageSection>
            <FrameImage src={frame.image_url} alt={frame.name} />
          </ImageSection>
          
          <DetailsSection>
            <MatchBadge score={matchScore}>
              {Math.round(matchScore * 100)}% Match
            </MatchBadge>
            
            <Typography variant="h4" gutterBottom>
              {frame.name}
            </Typography>
            
            <Typography variant="h6" gutterBottom>
              {frame.brand}
            </Typography>
            
            <Typography variant="h5" style={{ color: '#4b5563', marginTop: '8px' }}>
              ${frame.price.toFixed(2)}
            </Typography>
            
            <TagsContainer>
              <Tag>{frame.style}</Tag>
              <Tag>{frame.material}</Tag>
              <Tag>{frame.color}</Tag>
            </TagsContainer>
            
            <FrameSpecs>
              <Typography variant="body2" style={{ fontWeight: 600, marginBottom: '12px' }}>
                Frame Specifications
              </Typography>
              
              <SpecRow>
                <SpecLabel>Style</SpecLabel>
                <SpecValue>{frame.style}</SpecValue>
              </SpecRow>
              
              <SpecRow>
                <SpecLabel>Material</SpecLabel>
                <SpecValue>{frame.material}</SpecValue>
              </SpecRow>
              
              <SpecRow>
                <SpecLabel>Color</SpecLabel>
                <SpecValue>{frame.color}</SpecValue>
              </SpecRow>
            </FrameSpecs>
            
            <MatchReason>
              <Typography variant="body2" style={{ fontWeight: 600, marginBottom: '4px' }}>
                Why This Works For You
              </Typography>
              <Typography variant="body2">
                {matchReason}
              </Typography>
            </MatchReason>
            
            <FeedbackControls 
              frameId={frame.id}
              onLike={() => onFeedback(frame.id, true)}
              onDislike={() => onFeedback(frame.id, false)}
              onSaveForLater={() => onSaveForLater(frame.id)}
            />
            
            <ActionButtons>
              <Button 
                variant="primary" 
                size="large" 
                fullWidth
                onClick={() => {
                  onSelect(frame.id);
                  onClose();
                }}
              >
                View Details
              </Button>
              <Button 
                variant="secondary" 
                size="large" 
                fullWidth
                onClick={() => {
                  onTryOn(frame.id);
                  onClose();
                }}
              >
                Try On
              </Button>
            </ActionButtons>
          </DetailsSection>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default QuickViewModal;