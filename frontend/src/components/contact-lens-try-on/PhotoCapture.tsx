import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Grid,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled components
const CaptureContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(4)
}));

const VideoContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.grey[100],
  aspectRatio: '4/3'
}));

const StyledVideo = styled('video')({
  width: '100%',
  height: '100%',
  objectFit: 'cover'
});

const StyledCanvas = styled('canvas')({
  display: 'none'
});

const StyledImage = styled('img')(({ theme }) => ({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: theme.shape.borderRadius
}));

const ButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2)
}));

const OrDivider = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  margin: `${theme.spacing(2)} 0`,
  
  '&::before, &::after': {
    content: '""',
    flex: 1,
    borderBottom: `1px solid ${theme.palette.divider}`
  },
  
  '& span': {
    margin: `0 ${theme.spacing(2)}`,
    color: theme.palette.text.secondary
  }
}));

// Component props
interface PhotoCaptureProps {
  onPhotoCapture: (imageData: string) => void;
  loading?: boolean;
}

/**
 * PhotoCapture Component
 * 
 * A component for capturing photos using the device camera or uploading from files.
 */
const PhotoCapture: React.FC<PhotoCaptureProps> = ({ 
  onPhotoCapture,
  loading = false
}) => {
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
    <Grid container spacing={3}>
      <Grid item xs={12} md={8} sx={{ mx: 'auto' }}>
        <CaptureContainer elevation={1}>
          <Typography variant="h6" gutterBottom>
            Capture or Upload Your Photo
          </Typography>
          
          {error && (
            <Typography color="error" gutterBottom>
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
                    color="textSecondary"
                    sx={{ 
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
                    variant="contained" 
                    color="primary" 
                    onClick={captureImage}
                    disabled={loading}
                  >
                    Take Photo
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={stopCamera}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </ButtonContainer>
              ) : (
                <>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={startCamera}
                    fullWidth
                    disabled={loading}
                    sx={{ mb: 2 }}
                  >
                    Use Camera
                  </Button>
                  
                  <OrDivider>
                    <Typography variant="body2" component="span">or</Typography>
                  </OrDivider>
                  
                  <Box sx={{ mb: 2 }}>
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleFileUpload}
                      ref={fileInputRef}
                      disabled={loading}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleUploadClick}
                      fullWidth
                      disabled={loading}
                    >
                      Upload Photo
                    </Button>
                  </Box>
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
                  variant="outlined" 
                  onClick={handleReset}
                  disabled={loading}
                >
                  Take Another Photo
                </Button>
              </ButtonContainer>
            </>
          )}

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              <Typography variant="body2" color="textSecondary">
                Processing your photo...
              </Typography>
            </Box>
          )}

          <Typography variant="body2" color="textSecondary">
            Your photo will only be used for the virtual try-on experience and won't be stored permanently.
          </Typography>
        </CaptureContainer>
      </Grid>
      
      {/* Hidden canvas for capturing images */}
      <StyledCanvas ref={canvasRef} />
    </Grid>
  );
};

export default PhotoCapture;