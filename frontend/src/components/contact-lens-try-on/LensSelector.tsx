import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Grid,
  Card,
  CardContent,
  CardMedia,
  Tabs,
  Tab,
  Slider,
  FormControl,
  InputLabel,
  Select, SelectChangeEvent,
  MenuItem,
  Chip,
  CircularProgress,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled components
const SelectorContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(4)
}));

const LensCard = styled(Card)<{ selected?: boolean }>(({ theme, selected }) => ({
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  border: selected ? `2px solid ${theme.palette.primary.main}` : 'none',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4]
  }
}));

const ControlContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3)
}));

const SliderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2)
}));

const IrisInfoContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius
}));

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

// Component props
interface LensSelectorProps {
  lensOptions: LensOptions | null;
  selectedLensColor: string;
  selectedLensType: string;
  opacity: number;
  lightingCondition: string;
  irisAnalysis: IrisAnalysis | null;
  onLensSelect: (colorId: string, typeId: string, opacity: number) => void;
  onLightingChange: (lighting: string) => void;
  onOpacityChange: (opacity: number) => void;
  onTryOn: () => void;
  loading: boolean;
}

/**
 * LensSelector Component
 * 
 * A component for selecting contact lens options.
 */
const LensSelector: React.FC<LensSelectorProps> = ({
  lensOptions,
  selectedLensColor,
  selectedLensType,
  opacity,
  lightingCondition,
  irisAnalysis,
  onLensSelect,
  onLightingChange,
  onOpacityChange,
  onTryOn,
  loading
}) => {
  const [tabValue, setTabValue] = useState<number>(0);
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle lens color selection
  const handleLensColorSelect = (colorId: string) => {
    onLensSelect(colorId, selectedLensType, opacity);
  };
  
  // Handle lens type selection
  const handleLensTypeSelect = (event: SelectChangeEvent) => {
    const typeId = event.target.value as string;
    const selectedType = lensOptions?.types.find(type => type.id === typeId);
    
    if (selectedType) {
      // Set opacity to the middle of the range for the selected type
      const newOpacity = (selectedType.opacity_range[0] + selectedType.opacity_range[1]) / 2;
      onLensSelect(selectedLensColor, typeId, newOpacity);
    }
  };
  
  // Handle opacity change
  const handleOpacityChange = (_event: Event, value: number | number[]) => {
    onOpacityChange(value as number);
  };
  
  // Get selected lens color name
  const getSelectedLensColorName = () => {
    const selectedColor = lensOptions?.colors.find(color => color.id === selectedLensColor);
    return selectedColor?.name || 'Unknown';
  };
  
  // Get selected lens type
  const getSelectedLensType = () => {
    return lensOptions?.types.find(type => type.id === selectedLensType);
  };
  
  // Get natural lens colors
  const getNaturalLensColors = () => {
    return lensOptions?.colors.filter(color => color.category === 'natural') || [];
  };
  
  // Get fashion lens colors
  const getFashionLensColors = () => {
    return lensOptions?.colors.filter(color => color.category === 'fashion') || [];
  };
  
  // Format RGB color
  const formatRgbColor = (rgb: number[]) => {
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  };
  
  // Render lens color cards
  const renderLensColorCards = (colors: LensOption[]) => {
    return colors.map(color => (
      <Grid item xs={6} sm={4} md={3} key={color.id}>
        <LensCard 
          selected={selectedLensColor === color.id}
          onClick={() => handleLensColorSelect(color.id)}
        >
          <CardMedia
            component="img"
            height="140"
            image={color.preview_url}
            alt={color.name}
            sx={{ objectFit: 'cover' }}
          />
          <CardContent>
            <Typography variant="body2" component="div" align="center">
              {color.name}
            </Typography>
          </CardContent>
        </LensCard>
      </Grid>
    ));
  };
  
  return (
    <SelectorContainer elevation={1}>
      <Typography variant="h6" gutterBottom>
        Select Your Contact Lenses
      </Typography>
      
      {irisAnalysis && (
        <IrisInfoContainer>
          <Typography variant="subtitle2" gutterBottom>
            Your Eye Analysis
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                Natural Eye Color: <strong>{irisAnalysis.iris_color.dominant_color}</strong>
                {irisAnalysis.iris_color.heterochromia && (
                  <Chip 
                    size="small" 
                    label="Heterochromia Detected" 
                    color="primary" 
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>
              <Box 
                sx={{ 
                  width: 24, 
                  height: 24, 
                  bgcolor: formatRgbColor(irisAnalysis.iris_color.rgb),
                  borderRadius: '50%',
                  display: 'inline-block',
                  ml: 1,
                  border: '1px solid #ccc'
                }} 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                Iris Pattern: <strong>{irisAnalysis.iris_patterns.texture} {irisAnalysis.iris_patterns.structure}</strong>
              </Typography>
            </Grid>
          </Grid>
        </IrisInfoContainer>
      )}
      
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange}
        sx={{ mb: 2, mt: 3 }}
        centered
      >
        <Tab label="Natural Colors" />
        <Tab label="Fashion Colors" />
      </Tabs>
      
      <Box sx={{ mb: 4 }}>
        {tabValue === 0 ? (
          <Grid container spacing={2}>
            {renderLensColorCards(getNaturalLensColors())}
          </Grid>
        ) : (
          <Grid container spacing={2}>
            {renderLensColorCards(getFashionLensColors())}
          </Grid>
        )}
      </Box>
      
      <Divider sx={{ my: 3 }} />
      
      <ControlContainer>
        <Typography variant="subtitle2" gutterBottom>
          Lens Properties
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="lens-type-label">Lens Type</InputLabel>
              <Select
                labelId="lens-type-label"
                value={selectedLensType}
                label="Lens Type"
                onChange={handleLensTypeSelect}
                disabled={loading}
              >
                {lensOptions?.types.map(type => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              {getSelectedLensType()?.description}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="lighting-label">Lighting Condition</InputLabel>
              <Select
                labelId="lighting-label"
                value={lightingCondition}
                label="Lighting Condition"
                onChange={(e) => onLightingChange(e.target.value as string)}
                disabled={loading}
              >
                <MenuItem value="indoor">Indoor</MenuItem>
                <MenuItem value="outdoor">Outdoor</MenuItem>
                <MenuItem value="dim">Dim/Low Light</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        <SliderContainer>
          <Typography variant="body2" sx={{ minWidth: 100 }}>
            Opacity:
          </Typography>
          <Box sx={{ flex: 1 }}>
            <Slider
              value={opacity}
              min={getSelectedLensType()?.opacity_range[0] || 0.6}
              max={getSelectedLensType()?.opacity_range[1] || 1.0}
              step={0.01}
              onChange={handleOpacityChange}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
              disabled={loading}
            />
          </Box>
        </SliderContainer>
      </ControlContainer>
      
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={onTryOn}
          disabled={loading || !selectedLensColor}
          sx={{ minWidth: 200 }}
        >
          {loading ? (
            <>
              <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
              Processing...
            </>
          ) : (
            `Try On ${getSelectedLensColorName()} Lenses`
          )}
        </Button>
      </Box>
    </SelectorContainer>
  );
};

export default LensSelector;