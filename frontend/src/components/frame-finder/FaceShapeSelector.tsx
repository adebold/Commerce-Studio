import React, { useState, useRef } from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../design-system/components/Typography/Typography';
import { Button } from '../../design-system/components/Button/Button';
import { Card } from '../../design-system/components/Card/Card';

// Styled components
const ShapesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: ${({ theme }) => theme.spacing.spacing[16]};
  margin-top: ${({ theme }) => theme.spacing.spacing[16]};
`;

const ShapeCard = styled.div<{ isSelected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.spacing[16]};
  border-radius: 8px;
  border: 2px solid ${({ theme, isSelected }) => 
    isSelected ? theme.colors.primary[500] : theme.colors.neutral[300]};
  background-color: ${({ theme, isSelected }) => 
    isSelected ? theme.colors.primary[50] : theme.colors.common.white};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    border-color: ${({ theme, isSelected }) => 
      isSelected ? theme.colors.primary[600] : theme.colors.primary[300]};
    transform: translateY(-2px);
  }
`;

const ShapeImage = styled.div<{ shape: string }>`
  width: 100px;
  height: 100px;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[8]};
  background-color: ${({ theme }) => theme.colors.neutral[200]};
  mask-image: ${({ shape }) => `url('/images/face-shapes/${shape.toLowerCase()}.svg')`};
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  background-color: ${({ theme }) => theme.colors.primary[500]};
  
  /* Fallback for browsers that don't support mask-image */
  @supports not (mask-image: url('')) {
    background-image: ${({ shape }) => `url('/images/face-shapes/${shape.toLowerCase()}.png')`};
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }
`;

const ShapeInfo = styled.div`
  text-align: center;
`;

const SelectorTabs = styled.div`
  display: flex;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral[200]};
`;

const Tab = styled.button<{ isActive: boolean }>`
  padding: ${({ theme }) => `${theme.spacing.spacing[8]} ${theme.spacing.spacing[16]}`};
  background: none;
  border: none;
  border-bottom: 2px solid ${({ theme, isActive }) => 
    isActive ? theme.colors.primary[500] : 'transparent'};
  color: ${({ theme, isActive }) => 
    isActive ? theme.colors.primary[500] : theme.colors.neutral[700]};
  font-weight: ${({ isActive }) => isActive ? 600 : 400};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary[500]};
  }
`;

const PhotoUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.spacing[16]};
  margin-top: ${({ theme }) => theme.spacing.spacing[16]};
`;

const UploadBox = styled.div`
  width: 100%;
  max-width: 400px;
  height: 200px;
  border: 2px dashed ${({ theme }) => theme.colors.neutral[300]};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary[500]};
    background-color: ${({ theme }) => theme.colors.primary[50]};
  }
`;

const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  object-fit: contain;
`;

const HiddenInput = styled.input`
  display: none;
`;

const DetectionResult = styled(Card)`
  width: 100%;
  max-width: 400px;
  margin-top: ${({ theme }) => theme.spacing.spacing[16]};
`;

const GuideContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.spacing[24]};
  padding: ${({ theme }) => theme.spacing.spacing[16]};
  background-color: ${({ theme }) => theme.colors.neutral[50]};
  border-radius: 8px;
`;

const GuideGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: ${({ theme }) => theme.spacing.spacing[16]};
  margin-top: ${({ theme }) => theme.spacing.spacing[16]};
`;

const GuideItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const GuideImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[8]};
`;

// Face shape data
const faceShapes = [
  {
    id: 'oval',
    name: 'Oval',
    description: 'Balanced proportions with a slightly wider forehead than jaw',
    guide: 'Versatile shape that works with most frame styles'
  },
  {
    id: 'round',
    name: 'Round',
    description: 'Similar width and length with soft angles',
    guide: 'Angular frames add definition and make your face appear longer'
  },
  {
    id: 'square',
    name: 'Square',
    description: 'Strong jawline with similar width and length',
    guide: 'Round or oval frames soften angular features'
  },
  {
    id: 'heart',
    name: 'Heart',
    description: 'Wider forehead and cheekbones with a narrow chin',
    guide: 'Frames wider at the bottom balance your proportions'
  },
  {
    id: 'diamond',
    name: 'Diamond',
    description: 'Narrow forehead and jawline with wide cheekbones',
    guide: 'Cat-eye or oval frames complement your cheekbones'
  },
  {
    id: 'oblong',
    name: 'Oblong',
    description: 'Longer than wide with a straight cheek line',
    guide: 'Wider frames with decorative temples add width'
  },
];

// Component props
interface FaceShapeSelectorProps {
  selectedShape: string | null;
  onSelectShape: (shape: string) => void;
}

/**
 * FaceShapeSelector Component
 * 
 * A component for selecting face shape in the Frame Finder questionnaire.
 * Allows manual selection or AI-assisted detection from a photo.
 */
const FaceShapeSelector: React.FC<FaceShapeSelectorProps> = ({
  selectedShape,
  onSelectShape
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'photo'>('manual');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedShape, setDetectedShape] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
        analyzePhoto();
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Simulate photo analysis (in a real app, this would call an API)
  const analyzePhoto = () => {
    setIsAnalyzing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Randomly select a face shape for demo purposes
      // In a real app, this would be determined by ML analysis
      const shapes = faceShapes.map(shape => shape.id);
      const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
      
      setDetectedShape(randomShape);
      setIsAnalyzing(false);
    }, 2000);
  };

  // Apply detected shape
  const applyDetectedShape = () => {
    if (detectedShape) {
      onSelectShape(detectedShape);
      setActiveTab('manual'); // Switch back to manual tab to show selection
    }
  };

  // Reset photo upload
  const resetPhoto = () => {
    setPhotoPreview(null);
    setDetectedShape(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <SelectorTabs>
        <Tab 
          isActive={activeTab === 'manual'} 
          onClick={() => setActiveTab('manual')}
        >
          Manual Selection
        </Tab>
        <Tab 
          isActive={activeTab === 'photo'} 
          onClick={() => setActiveTab('photo')}
        >
          Upload Photo
        </Tab>
      </SelectorTabs>
      
      {activeTab === 'manual' ? (
        <>
          <Typography variant="body1" gutterBottom>
            Select the face shape that most closely resembles yours:
          </Typography>
          
          <ShapesContainer>
            {faceShapes.map((shape) => (
              <ShapeCard
                key={shape.id}
                isSelected={selectedShape === shape.id}
                onClick={() => onSelectShape(shape.id)}
              >
                <ShapeImage shape={shape.id} />
                <ShapeInfo>
                  <Typography variant="body2" gutterBottom>
                    {shape.name}
                  </Typography>
                  <Typography variant="caption" muted>
                    {shape.description}
                  </Typography>
                </ShapeInfo>
              </ShapeCard>
            ))}
          </ShapesContainer>
          
          <Button 
            variant="secondary" 
            size="small" 
            onClick={() => setShowGuide(!showGuide)}
            style={{ marginTop: '16px' }}
          >
            {showGuide ? 'Hide Face Shape Guide' : 'Show Face Shape Guide'}
          </Button>
          
          {showGuide && (
            <GuideContainer>
              <Typography variant="h6" gutterBottom>
                How to Determine Your Face Shape
              </Typography>
              
              <Typography variant="body2" gutterBottom>
                Look at your face in a mirror and consider these characteristics:
              </Typography>
              
              <GuideGrid>
                {faceShapes.map((shape) => (
                  <GuideItem key={shape.id}>
                    <GuideImage src={`/images/face-shapes/${shape.id}-guide.png`} alt={shape.name} />
                    <Typography variant="body2" gutterBottom>
                      {shape.name}
                    </Typography>
                    <Typography variant="caption" muted>
                      {shape.guide}
                    </Typography>
                  </GuideItem>
                ))}
              </GuideGrid>
            </GuideContainer>
          )}
        </>
      ) : (
        <PhotoUploadContainer>
          <Typography variant="body1" gutterBottom>
            Upload a front-facing photo to automatically detect your face shape:
          </Typography>
          
          <HiddenInput 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*"
          />
          
          {!photoPreview ? (
            <UploadBox onClick={handleUploadClick}>
              <Typography variant="body2" gutterBottom>
                Click to upload a photo
              </Typography>
              <Typography variant="caption" muted>
                For best results, use a well-lit photo with your face clearly visible
              </Typography>
            </UploadBox>
          ) : (
            <>
              <PreviewImage src={photoPreview} alt="Face preview" />
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="secondary" size="small" onClick={resetPhoto}>
                  Upload Different Photo
                </Button>
              </div>
              
              {isAnalyzing ? (
                <Typography variant="body2">
                  Analyzing your face shape...
                </Typography>
              ) : detectedShape && (
                <DetectionResult variant="outlined">
                  <Card.Content>
                    <Typography variant="h6" gutterBottom>
                      Analysis Results
                    </Typography>
                    
                    <Typography variant="body1" gutterBottom>
                      Your detected face shape is: <strong>{faceShapes.find(s => s.id === detectedShape)?.name}</strong>
                    </Typography>
                    
                    <Typography variant="body2" muted gutterBottom>
                      {faceShapes.find(s => s.id === detectedShape)?.description}
                    </Typography>
                    
                    <Button 
                      variant="primary" 
                      onClick={applyDetectedShape}
                      style={{ marginTop: '8px' }}
                    >
                      Use This Shape
                    </Button>
                  </Card.Content>
                </DetectionResult>
              )}
            </>
          )}
          
          <Typography variant="caption" muted style={{ textAlign: 'center' }}>
            Your photo is processed securely and is not stored on our servers.
          </Typography>
        </PhotoUploadContainer>
      )}
    </div>
  );
};

export default FaceShapeSelector;