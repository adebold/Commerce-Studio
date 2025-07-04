import React from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../../frontend/src/design-system/components/Typography/Typography';

interface Annotation {
  x: number;
  y: number;
  text: string;
}

interface ConfigScreenshotProps {
  title: string;
  description?: string;
  imageSrc: string;
  altText: string;
  annotations?: Annotation[];
}

const ScreenshotContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[32]};
`;

const ImageContainer = styled.div`
  position: relative;
  margin: ${({ theme }) => theme.spacing.spacing[16]} 0;
  border: 1px solid ${({ theme }) => theme.colors.neutral[300]};
  border-radius: 4px;
  overflow: hidden;
`;

const Screenshot = styled.img`
  max-width: 100%;
  display: block;
`;

const AnnotationMarker = styled.div<{ x: number; y: number }>`
  position: absolute;
  left: ${props => `${props.x}%`};
  top: ${props => `${props.y}%`};
  width: 24px;
  height: 24px;
  background-color: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transform: translate(-50%, -50%);
  z-index: 1;
`;

const AnnotationsList = styled.div`
  margin-top: ${({ theme }) => theme.spacing.spacing[16]};
`;

const AnnotationItem = styled.div`
  display: flex;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[8]};
`;

const AnnotationNumber = styled.div`
  width: 24px;
  height: 24px;
  background-color: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
  margin-right: ${({ theme }) => theme.spacing.spacing[12]};
  flex-shrink: 0;
`;

const AnnotationText = styled.div`
  flex: 1;
`;

/**
 * ConfigScreenshot Component
 * 
 * A component for displaying configuration screenshots with optional annotations.
 */
const ConfigScreenshot: React.FC<ConfigScreenshotProps> = ({ 
  title, 
  description, 
  imageSrc, 
  altText, 
  annotations = [] 
}) => {
  return (
    <ScreenshotContainer>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>
      
      {description && (
        <Typography variant="body1" gutterBottom>
          {description}
        </Typography>
      )}
      
      <ImageContainer>
        <Screenshot src={imageSrc} alt={altText} />
        
        {annotations.map((annotation, index) => (
          <AnnotationMarker 
            key={index} 
            x={annotation.x} 
            y={annotation.y}
          >
            {index + 1}
          </AnnotationMarker>
        ))}
      </ImageContainer>
      
      {annotations.length > 0 && (
        <AnnotationsList>
          {annotations.map((annotation, index) => (
            <AnnotationItem key={index}>
              <AnnotationNumber>{index + 1}</AnnotationNumber>
              <AnnotationText>
                <Typography variant="body2">
                  {annotation.text}
                </Typography>
              </AnnotationText>
            </AnnotationItem>
          ))}
        </AnnotationsList>
      )}
    </ScreenshotContainer>
  );
};

export default ConfigScreenshot;