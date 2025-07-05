import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Button, 
  Grid,
  TextField,
  Stack,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled components
const UploadBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.grey[300]}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  textAlign: 'center',
  backgroundColor: '#f8fafc',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  }
}));

const FrameFinderPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      
      // Generate preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          setPreviewUrl(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };
  
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const file = event.dataTransfer.files[0];
      setSelectedFile(file);
      
      // Generate preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          setPreviewUrl(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = () => {
    // Here you would handle the file submission to the backend
    console.log('Submitting file:', selectedFile);
    // For now, just show a placeholder message
    alert('Feature coming soon! Frame analysis would be performed here.');
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
      <Typography
        variant="h3"
        component="h1"
        sx={{
          fontWeight: 700,
          fontSize: { xs: '2rem', md: '3rem' },
          letterSpacing: '-0.022em',
          mb: 2,
          textAlign: 'center',
        }}
      >
        Frame Finder
      </Typography>
      
      <Typography
        variant="h6"
        sx={{
          fontWeight: 400,
          color: 'text.secondary',
          maxWidth: '800px',
          mx: 'auto',
          mb: 5,
          textAlign: 'center',
        }}
      >
        Upload a photo of eyewear frames you like, and our AI will find similar styles and recommend alternatives
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 4, borderRadius: 2, backgroundColor: '#f8fafc' }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
              Upload Your Frame Image
            </Typography>
            
            <input
              type="file"
              accept="image/*"
              id="upload-input"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            
            <label htmlFor="upload-input">
              <UploadBox
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                sx={{ mb: 3 }}
              >
                {previewUrl ? (
                  <Box>
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '200px',
                        marginBottom: '16px'
                      }} 
                    />
                    <Typography>Click or drag to change image</Typography>
                  </Box>
                ) : (
                  <>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      Drag and drop an image here, or click to select
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Supported formats: JPG, PNG, WEBP (max 10MB)
                    </Typography>
                  </>
                )}
              </UploadBox>
            </label>
            
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleSubmit}
                disabled={!selectedFile}
                sx={{
                  py: 1.5,
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  backgroundColor: '#2563eb',
                  '&:hover': {
                    backgroundColor: '#1d4ed8',
                  },
                  '&:disabled': {
                    backgroundColor: '#64748b',
                    opacity: 0.7
                  }
                }}
              >
                Find Similar Frames
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 4, borderRadius: 2, height: '100%', backgroundColor: '#f8fafc' }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
              Frame Preferences (Optional)
            </Typography>
            
            <Stack spacing={3}>
              <TextField
                label="Preferred Brand(s)"
                variant="outlined"
                placeholder="e.g., Ray-Ban, Warby Parker, Gucci"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#2563eb',
                    },
                  },
                }}
              />
              
              <FormControl fullWidth variant="outlined">
                <InputLabel id="frame-style-label">Frame Style</InputLabel>
                <Select
                  labelId="frame-style-label"
                  id="frame-style"
                  label="Frame Style"
                  defaultValue=""
                  sx={{
                    height: '56px',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#2563eb',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#2563eb',
                    },
                  }}
                >
                  <MenuItem value="" disabled><em>Select a style</em></MenuItem>
                  <MenuItem value="round">Round</MenuItem>
                  <MenuItem value="square">Square</MenuItem>
                  <MenuItem value="cat-eye">Cat Eye</MenuItem>
                  <MenuItem value="aviator">Aviator</MenuItem>
                  <MenuItem value="oversized">Oversized</MenuItem>
                  <MenuItem value="rectangular">Rectangular</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth variant="outlined">
                <InputLabel id="material-label">Material Preference</InputLabel>
                <Select
                  labelId="material-label"
                  id="material-preference"
                  label="Material Preference"
                  defaultValue=""
                  sx={{
                    height: '56px',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#2563eb',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#2563eb',
                    },
                  }}
                >
                  <MenuItem value="" disabled><em>Select material</em></MenuItem>
                  <MenuItem value="acetate">Acetate</MenuItem>
                  <MenuItem value="metal">Metal</MenuItem>
                  <MenuItem value="titanium">Titanium</MenuItem>
                  <MenuItem value="plastic">Plastic</MenuItem>
                  <MenuItem value="mixed">Mixed Materials</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth variant="outlined">
                <InputLabel id="price-range-label">Price Range</InputLabel>
                <Select
                  labelId="price-range-label"
                  id="price-range"
                  label="Price Range"
                  defaultValue=""
                  sx={{
                    height: '56px',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#2563eb',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#2563eb',
                    },
                  }}
                >
                  <MenuItem value="" disabled><em>Select price range</em></MenuItem>
                  <MenuItem value="budget">Budget ($0-$100)</MenuItem>
                  <MenuItem value="mid-range">Mid-range ($100-$250)</MenuItem>
                  <MenuItem value="premium">Premium ($250-$500)</MenuItem>
                  <MenuItem value="luxury">Luxury ($500+)</MenuItem>
                </Select>
                <FormHelperText>Select a price range for your eyewear</FormHelperText>
              </FormControl>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 6 }} />
      
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          How It Works
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                1. Upload Your Image
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upload a photo of eyewear frames you like or are interested in.
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                2. AI Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Our machine learning models analyze the frame style, shape, color, and other features.
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                3. Get Recommendations
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Receive personalized recommendations for similar frames that match your preferences.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default FrameFinderPage;
