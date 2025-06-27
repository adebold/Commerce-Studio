import React, { useState, useRef } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button, 
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const VirtualTryOnPage: React.FC = () => {
  const navigate = useNavigate();
  const [isCapturing, setIsCapturing] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCapturing(false);
    }
  };

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
        stopCamera();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTryOn = async () => {
    if (!image) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, we would send the image to the server for processing
      // For now, just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to recommendations page after processing
      navigate('/recommendations');
    } catch (err) {
      console.error('Error processing image:', err);
      setError('Failed to process your image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setError(null);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Virtual Try-On
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Take a photo or upload an image to see how different frames look on your face.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Capture or Upload Your Photo
            </Typography>
            
            {!image ? (
              <>
                {isCapturing ? (
                  <Box sx={{ mb: 3 }}>
                    <Box 
                      sx={{ 
                        width: '100%', 
                        borderRadius: 2, 
                        overflow: 'hidden',
                        mb: 2
                      }}
                    >
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        style={{ width: '100%', borderRadius: 8 }}
                      />
                    </Box>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={captureImage}
                      sx={{ mr: 2 }}
                    >
                      Take Photo
                    </Button>
                    <Button 
                      variant="outlined" 
                      onClick={stopCamera}
                    >
                      Cancel
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={startCamera}
                      fullWidth
                      sx={{ py: 1.5 }}
                    >
                      Use Camera
                    </Button>
                    <Typography variant="body2" align="center" sx={{ my: 1 }}>
                      or
                    </Typography>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      sx={{ py: 1.5 }}
                    >
                      Upload Photo
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleFileUpload}
                      />
                    </Button>
                  </Box>
                )}
              </>
            ) : (
              <Box sx={{ mb: 3 }}>
                <Box 
                  component="img" 
                  src={image} 
                  alt="Your photo" 
                  sx={{ 
                    width: '100%', 
                    borderRadius: 2,
                    mb: 2
                  }}
                />
                <Button 
                  variant="outlined" 
                  onClick={handleReset}
                >
                  Take Another Photo
                </Button>
              </Box>
            )}

            <Typography variant="body2" color="text.secondary">
              Your photo will only be used for the virtual try-on experience and won't be stored permanently.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Try On Frames
            </Typography>
            
            {!image ? (
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  py: 8
                }}
              >
                <Typography variant="body1" color="text.secondary" align="center" paragraph>
                  Take or upload a photo to see how frames look on your face.
                </Typography>
                <Box 
                  component="img" 
                  src="/images/try-on-placeholder.jpg" 
                  alt="Virtual try-on placeholder" 
                  sx={{ 
                    maxWidth: '80%', 
                    opacity: 0.7
                  }}
                />
              </Box>
            ) : (
              <Box>
                <Typography variant="body1" paragraph>
                  Your photo is ready for virtual try-on! Click the button below to see how different frames look on your face.
                </Typography>
                
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  onClick={handleTryOn}
                  disabled={loading}
                  sx={{ py: 1.5, mb: 2 }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
                      Processing...
                    </>
                  ) : (
                    'Try On Frames Now'
                  )}
                </Button>
                
                <Typography variant="body2" color="text.secondary">
                  We'll analyze your face shape and features to recommend the most flattering frames for you.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Hidden canvas for capturing images */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Container>
  );
};

export default VirtualTryOnPage;