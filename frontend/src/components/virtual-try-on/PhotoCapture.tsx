import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { Button } from '../../design-system/components/Button/Button';
import { Typography } from '../../design-system/components/Typography/Typography';
import { Card } from '../../design-system/components/Card/Card';

// Styled components
const CaptureContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
  background-color: ${({ theme }) => theme.colors.neutral[100]};
  aspect-ratio: 4/3;
`;

const StyledVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const StyledCanvas = styled.canvas`
  display: none;
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.spacing[16]};
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
`;

const OrDivider = styled.div`
  display: flex;
  align-items: center;
  margin: ${({ theme }) => `${theme.spacing.spacing[16]} 0`};
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid ${({ theme }) => theme.colors.neutral[300]};
  }
  
  span {
    margin: 0 ${({ theme }) => theme.spacing.spacing[16]};
    color: ${({ theme }) => theme.colors.neutral[600]};
  }
`;

const FileInputContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
`;

// Component props
interface PhotoCaptureProps {
  onPhotoCapture: (imageData: string) => void;
}

/**
 * PhotoCapture Component
 * 
 * A component for capturing photos using the device camera or uploading from files.
 */
const PhotoCapture: React.FC<PhotoCaptureProps> = ({ onPhotoCapture }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up video stream when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Start the camera
  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please make sure you have granted camera permissions.');
    }
  };

  // Stop the camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCapturing(false);
    }
  };

  // Capture an image from the video stream
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/png');
        setImage(imageDataUrl);
        onPhotoCapture(imageDataUrl);
        stopCamera();
      }
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImage(result);
        onPhotoCapture(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset the component
  const handleReset = () => {
    setImage(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <CaptureContainer>
      <Card variant="outlined">
        <Card.Header title="Capture or Upload Your Photo" />
        <Card.Content>
          {error && (
            <Typography color="semantic.error.main" gutterBottom>
              {error}
            </Typography>
          )}

          {!image ? (
            <>
              {isCapturing ? (
                <VideoContainer>
                  <StyledVideo 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                  />
                </VideoContainer>
              ) : (
                <VideoContainer>
                  <Typography 
                    variant="body1" 
                    align="center" 
                    muted
                    style={{ 
                      position: 'absolute', 
                      top: '50%', 
                      left: '50%', 
                      transform: 'translate(-50%, -50%)' 
                    }}
                  >
                    Camera preview will appear here
                  </Typography>
                </VideoContainer>
              )}

              {isCapturing ? (
                <ButtonContainer>
                  <Button 
                    variant="primary" 
                    onClick={captureImage}
                  >
                    Take Photo
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={stopCamera}
                  >
                    Cancel
                  </Button>
                </ButtonContainer>
              ) : (
                <>
                  <Button 
                    variant="primary" 
                    onClick={startCamera}
                    fullWidth
                  >
                    Use Camera
                  </Button>
                  
                  <OrDivider>
                    <Typography variant="body2" component="span">or</Typography>
                  </OrDivider>
                  
                  <FileInputContainer>
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleFileUpload}
                      ref={fileInputRef}
                    />
                    <Button
                      variant="secondary"
                      onClick={handleUploadClick}
                      fullWidth
                    >
                      Upload Photo
                    </Button>
                  </FileInputContainer>
                </>
              )}
            </>
          ) : (
            <>
              <VideoContainer>
                <StyledImage src={image} alt="Your photo" />
              </VideoContainer>
              <ButtonContainer>
                <Button 
                  variant="secondary" 
                  onClick={handleReset}
                >
                  Take Another Photo
                </Button>
              </ButtonContainer>
            </>
          )}

          <Typography variant="body2" muted>
            Your photo will only be used for the virtual try-on experience and won't be stored permanently.
          </Typography>
        </Card.Content>
      </Card>
      
      {/* Hidden canvas for capturing images */}
      <StyledCanvas ref={canvasRef} />
    </CaptureContainer>
  );
};

export default PhotoCapture;