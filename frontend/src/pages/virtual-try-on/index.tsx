import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../design-system/components/Typography/Typography';
import { 
  PhotoCapture, 
  FrameSelector, 
  TryOnVisualization, 
  ComparisonView,
  Frame
} from '../../components/virtual-try-on';

// Styled components
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.spacing.spacing[32]} ${theme.spacing.spacing[16]}`};
  
  @media (min-width: 768px) {
    padding: ${({ theme }) => `${theme.spacing.spacing[48]} ${theme.spacing.spacing[24]}`};
  }
`;

const PageHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[32]};
`;

const ContentContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.spacing[32]};
  
  @media (min-width: 992px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.spacing[24]};
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.spacing[24]};
`;

/**
 * VirtualTryOnPage Component
 * 
 * The main page for the Virtual Try-On experience.
 */
const VirtualTryOnPage: React.FC = () => {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null);
  const [comparisonFrames, setComparisonFrames] = useState<Frame[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  
  // Handle photo capture
  const handlePhotoCapture = (imageData: string) => {
    setUserImage(imageData);
  };
  
  // Handle frame selection
  const handleFrameSelect = (frame: Frame) => {
    setSelectedFrame(frame);
    
    // Add to comparison if not already there
    if (!comparisonFrames.some(f => f.id === frame.id)) {
      setComparisonFrames(prev => {
        // Limit to 4 frames
        const newFrames = [...prev, frame];
        if (newFrames.length > 4) {
          return newFrames.slice(1);
        }
        return newFrames;
      });
    }
  };
  
  // Handle comparison view
  const handleCompare = () => {
    setShowComparison(true);
  };
  
  // Handle adding frame to comparison
  const handleAddFrameToCompare = () => {
    setShowComparison(false);
  };
  
  // Handle save functionality
  const handleSave = () => {
    // In a real app, this would save the image to the user's account or download it
    alert('Image saved successfully!');
  };
  
  // Handle share functionality
  const handleShare = () => {
    // In a real app, this would open a share dialog
    alert('Sharing functionality would open here!');
  };
  
  return (
    <PageContainer>
      <PageHeader>
        <Typography variant="h3" gutterBottom>
          Virtual Try-On
        </Typography>
        <Typography variant="body1" muted>
          Try on different eyewear frames virtually to find your perfect match. 
          Take a photo or upload an image to get started.
        </Typography>
      </PageHeader>
      
      {showComparison && userImage ? (
        <ComparisonView 
          userImage={userImage}
          frames={comparisonFrames}
          onSelectFrame={handleFrameSelect}
          onAddFrame={handleAddFrameToCompare}
          onClose={() => setShowComparison(false)}
        />
      ) : (
        <ContentContainer>
          <LeftColumn>
            {!userImage ? (
              <PhotoCapture onPhotoCapture={handlePhotoCapture} />
            ) : (
              <TryOnVisualization 
                userImage={userImage}
                selectedFrame={selectedFrame}
                onSave={handleSave}
                onShare={handleShare}
                onCompare={handleCompare}
              />
            )}
          </LeftColumn>
          
          <RightColumn>
            {userImage && (
              <FrameSelector onFrameSelect={handleFrameSelect} />
            )}
          </RightColumn>
        </ContentContainer>
      )}
    </PageContainer>
  );
};

export default VirtualTryOnPage;