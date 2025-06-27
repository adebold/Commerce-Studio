import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button, 
  Grid,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Divider,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PhotoCapture from '../components/contact-lens-try-on/PhotoCapture';
import LensSelector from '../components/contact-lens-try-on/LensSelector';
import LensVisualization from '../components/contact-lens-try-on/LensVisualization';
import ComparisonView from '../components/contact-lens-try-on/ComparisonView';
import { api } from '../services/api';

// Types
interface IrisAnalysis {
  iris_color: {
    dominant_color: string;
    rgb: number[];
    confidence: number;
    heterochromia?: boolean;
    secondary_color?: string;
  };
  iris_measurements: {
    average_diameter_pixels: number;
    average_diameter_mm: number;
    size_ratio: number;
  };
  iris_patterns: {
    texture: string;
    structure: string;
    density: string;
    confidence: number;
  };
  confidence_score: number;
}

interface LensOption {
  id: string;
  name: string;
  preview_url: string;
  category: string;
}

interface LensType {
  id: string;
  name: string;
  description: string;
  opacity_range: [number, number];
}

interface LensOptions {
  colors: LensOption[];
  types: LensType[];
}

interface TryOnResult {
  image_url: string;
  lens_color: string;
  lens_type: string;
  opacity: number;
  original_iris_color: string;
  confidence_score: number;
}

const ContactLensTryOnPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State for the stepper
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Upload Photo', 'Select Lenses', 'Try On', 'Compare'];
  
  // State for photo capture
  const [image, setImage] = useState<string | null>(null);
  const [imageId, setImageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for iris analysis
  const [irisAnalysis, setIrisAnalysis] = useState<IrisAnalysis | null>(null);
  
  // State for lens selection
  const [lensOptions, setLensOptions] = useState<LensOptions | null>(null);
  const [selectedLensColor, setSelectedLensColor] = useState<string>('');
  const [selectedLensType, setSelectedLensType] = useState<string>('natural');
  const [opacity, setOpacity] = useState<number>(0.8);
  const [lightingCondition, setLightingCondition] = useState<string>('indoor');
  
  // State for try-on results
  const [tryOnResult, setTryOnResult] = useState<TryOnResult | null>(null);
  
  // State for comparison
  const [comparisonResults, setComparisonResults] = useState<TryOnResult[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  
  // Fetch lens options on component mount
  useEffect(() => {
    const fetchLensOptions = async () => {
      try {
        const response = await api.get('/api/contact-lens-try-on/options');
        setLensOptions(response.data);
        
        // Set default selections
        if (response.data.colors.length > 0) {
          setSelectedLensColor(response.data.colors[0].id);
        }
        if (response.data.types.length > 0) {
          setSelectedLensType(response.data.types[0].id);
          setOpacity(response.data.types[0].opacity_range[0]);
        }
      } catch (err) {
        console.error('Error fetching lens options:', err);
        setError('Failed to load lens options. Please try again.');
      }
    };
    
    fetchLensOptions();
  }, []);
  
  // Handle photo upload
  const handlePhotoCapture = async (imageData: string) => {
    setImage(imageData);
    setLoading(true);
    setError(null);
    
    try {
      // Convert base64 to blob
      const response = await fetch(imageData);
      const blob = await response.blob();
      
      // Create form data
      const formData = new FormData();
      formData.append('file', blob, 'user-photo.jpg');
      
      // Upload image
      const uploadResponse = await api.post('/api/contact-lens-try-on/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Set image ID and iris analysis
      setImageId(uploadResponse.data.image_id);
      setIrisAnalysis({
        iris_color: uploadResponse.data.iris_color,
        iris_measurements: uploadResponse.data.iris_measurements,
        iris_patterns: uploadResponse.data.iris_patterns,
        confidence_score: uploadResponse.data.confidence_score
      });
      
      // Move to next step
      setActiveStep(1);
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setError(err.response?.data?.detail || 'Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle lens selection
  const handleLensSelect = (colorId: string, typeId: string, opacityValue: number) => {
    setSelectedLensColor(colorId);
    setSelectedLensType(typeId);
    setOpacity(opacityValue);
  };
  
  // Handle try-on
  const handleTryOn = async () => {
    if (!imageId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/api/contact-lens-try-on/apply', {
        image_id: imageId,
        lens_color: selectedLensColor,
        lens_type: selectedLensType,
        opacity: opacity,
        lighting_condition: lightingCondition
      });
      
      setTryOnResult(response.data);
      setActiveStep(2);
    } catch (err: any) {
      console.error('Error applying contact lens:', err);
      setError(err.response?.data?.detail || 'Failed to apply contact lens. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle adding to comparison
  const handleAddToComparison = () => {
    if (tryOnResult && !comparisonResults.some(r => r.lens_color === tryOnResult.lens_color && r.lens_type === tryOnResult.lens_type)) {
      setComparisonResults([...comparisonResults, tryOnResult]);
    }
  };
  
  // Handle viewing comparison
  const handleViewComparison = () => {
    setShowComparison(true);
    setActiveStep(3);
  };
  
  // Handle going back from comparison
  const handleBackFromComparison = () => {
    setShowComparison(false);
    setActiveStep(2);
  };
  
  // Handle selecting a lens from comparison
  const handleSelectFromComparison = (result: TryOnResult) => {
    setTryOnResult(result);
    setSelectedLensColor(result.lens_color);
    setSelectedLensType(result.lens_type);
    setOpacity(result.opacity);
    setShowComparison(false);
    setActiveStep(2);
  };
  
  // Handle reset
  const handleReset = () => {
    setImage(null);
    setImageId(null);
    setIrisAnalysis(null);
    setTryOnResult(null);
    setComparisonResults([]);
    setShowComparison(false);
    setActiveStep(0);
  };
  
  // Render content based on active step
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <PhotoCapture 
            onPhotoCapture={handlePhotoCapture} 
            loading={loading}
          />
        );
      case 1:
        return (
          <LensSelector 
            lensOptions={lensOptions}
            selectedLensColor={selectedLensColor}
            selectedLensType={selectedLensType}
            opacity={opacity}
            lightingCondition={lightingCondition}
            irisAnalysis={irisAnalysis}
            onLensSelect={handleLensSelect}
            onLightingChange={setLightingCondition}
            onOpacityChange={setOpacity}
            onTryOn={handleTryOn}
            loading={loading}
          />
        );
      case 2:
        return (
          <LensVisualization 
            tryOnResult={tryOnResult}
            originalImage={image}
            onAddToComparison={handleAddToComparison}
            onViewComparison={handleViewComparison}
            onTryDifferent={() => setActiveStep(1)}
            comparisonCount={comparisonResults.length}
          />
        );
      case 3:
        return (
          <ComparisonView 
            results={comparisonResults}
            originalImage={image}
            onSelect={handleSelectFromComparison}
            onBack={handleBackFromComparison}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Contact Lens Virtual Try-On
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Try on different contact lens colors and styles to find your perfect look.
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Divider sx={{ mb: 4 }} />
      
      {renderStepContent()}
      
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          variant="outlined" 
          onClick={() => activeStep > 0 ? setActiveStep(activeStep - 1) : navigate('/')}
          disabled={loading}
        >
          {activeStep === 0 ? 'Back to Home' : 'Previous Step'}
        </Button>
        
        {activeStep > 0 && (
          <Button 
            variant="outlined" 
            color="secondary"
            onClick={handleReset}
            disabled={loading}
          >
            Start Over
          </Button>
        )}
      </Box>
    </Container>
  );
};

export default ContactLensTryOnPage;