import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Grid, 
  Typography, 
  Box, 
  Paper, 
  Button, 
  Divider,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  FormControlLabel,
  Checkbox
} from '@mui/material';

// Mock data for a single frame
interface FrameDetail {
  id: string;
  name: string;
  brand: string;
  manufacturer: string;
  price: number;
  images: string[];
  description: string;
  features: string[];
  specifications: {
    frameMaterial: string;
    frameStyle: string;
    frameColor: string;
    frameShape: string;
    bridgeWidth: string;
    templeLength: string;
    lensWidth: string;
    lensHeight: string;
  };
  compatibleFaceShapes: string[];
}

// Mock data for lens options
interface LensOption {
  id: string;
  name: string;
  description: string;
  price: number;
}

// Mock data for coating options
interface CoatingOption {
  id: string;
  name: string;
  description: string;
  price: number;
}

// Mock data
const mockFrame: FrameDetail = {
  id: 'frame-123',
  name: 'Classic Rectangle Frame',
  brand: 'Ray-Ban',
  manufacturer: 'Luxottica Group',
  price: 149.99,
  images: [
    'https://images.unsplash.com/photo-1577803645773-f96470509666?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1513146581-976d6fdb6879?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
  ],
  description: 'Classic rectangular frames with a timeless design that suits most face shapes. The balanced proportions provide comfort and style for everyday wear.',
  features: [
    'Lightweight acetate construction',
    'Adjustable nose pads for comfort',
    'Durable hinges for long-lasting wear',
    'UV protective lenses'
  ],
  specifications: {
    frameMaterial: 'Acetate',
    frameStyle: 'Full-rim',
    frameColor: 'Black',
    frameShape: 'Rectangle',
    bridgeWidth: '20mm',
    templeLength: '145mm',
    lensWidth: '52mm',
    lensHeight: '38mm'
  },
  compatibleFaceShapes: ['Oval', 'Round', 'Heart', 'Square']
};

const lensOptions: LensOption[] = [
  {
    id: 'standard',
    name: 'Standard',
    description: 'Clear lenses with no tint or special features',
    price: 0
  },
  {
    id: 'blue-light',
    name: 'Blue Light Filtering',
    description: 'Reduces exposure to blue light from digital screens',
    price: 49.99
  },
  {
    id: 'transitions',
    name: 'Transitions',
    description: 'Automatically darkens in sunlight and clear indoors',
    price: 79.99
  },
  {
    id: 'progressive',
    name: 'Progressive',
    description: 'Multifocal lenses with no visible line',
    price: 129.99
  }
];

const coatingOptions: CoatingOption[] = [
  {
    id: 'anti-glare',
    name: 'Anti-Glare',
    description: 'Reduces reflections and improves clarity',
    price: 29.99
  },
  {
    id: 'scratch-resistant',
    name: 'Scratch Resistant',
    description: 'Adds durability and protects against scratches',
    price: 19.99
  },
  {
    id: 'uv-protection',
    name: 'UV Protection',
    description: 'Blocks harmful UV rays',
    price: 24.99
  }
];

const FrameDetailPage: React.FC = () => {
  const { frameId } = useParams<{ frameId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [frame, setFrame] = useState<FrameDetail | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedLens, setSelectedLens] = useState<string>('standard');
  const [selectedCoatings, setSelectedCoatings] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // Fetch frame data
  useEffect(() => {
    const fetchFrameDetails = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        // In a real app, we would fetch data based on the frameId
        // For now, just use the mock data
        setFrame(mockFrame);
        setTotalPrice(mockFrame.price);
      } catch (error) {
        console.error('Error fetching frame details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (frameId) {
      fetchFrameDetails();
    }
  }, [frameId]);

  // Update total price when selections change
  useEffect(() => {
    if (!frame) return;

    let total = frame.price;
    
    // Add lens price
    const selectedLensOption = lensOptions.find(lens => lens.id === selectedLens);
    if (selectedLensOption) {
      total += selectedLensOption.price;
    }
    
    // Add coating prices
    selectedCoatings.forEach(coatingId => {
      const coating = coatingOptions.find(c => c.id === coatingId);
      if (coating) {
        total += coating.price;
      }
    });
    
    setTotalPrice(total);
  }, [frame, selectedLens, selectedCoatings]);

  const handleLensChange = (_: React.MouseEvent<HTMLElement>, newLens: string) => {
    if (newLens !== null) {
      setSelectedLens(newLens);
    }
  };

  const handleCoatingChange = (coatingId: string) => {
    setSelectedCoatings(prev => {
      if (prev.includes(coatingId)) {
        return prev.filter(id => id !== coatingId);
      } else {
        return [...prev, coatingId];
      }
    });
  };

  const handleAddToCart = () => {
    // In a real app, we would add the item to the cart
    // For now, just show a confirmation and navigate to the cart
    console.log('Adding to cart:', {
      frame,
      lens: lensOptions.find(lens => lens.id === selectedLens),
      coatings: coatingOptions.filter(coating => selectedCoatings.includes(coating.id))
    });
    
    // Navigate to cart page
    navigate('/cart');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!frame) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Typography variant="h5" align="center">
          Frame not found.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Grid container spacing={4}>
        {/* Left column - Images */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, mb: 2 }}>
            <Box
              component="img"
              src={frame.images[selectedImage]}
              alt={frame.name}
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 1,
                mb: 2
              }}
            />
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
              {frame.images.map((image, index) => (
                <Box
                  key={index}
                  component="img"
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  sx={{
                    width: 70,
                    height: 70,
                    objectFit: 'cover',
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: selectedImage === index ? '2px solid #0071e3' : '2px solid transparent',
                    '&:hover': {
                      opacity: 0.8
                    }
                  }}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </Box>
          </Paper>
          
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Description
            </Typography>
            <Typography variant="body2" paragraph color="text.secondary">
              {frame.description}
            </Typography>
            
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
              Features
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              {frame.features.map((feature, index) => (
                <Typography key={index} component="li" variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {feature}
                </Typography>
              ))}
            </Box>
            
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
              Compatible Face Shapes
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {frame.compatibleFaceShapes.map((shape) => (
                <Chip
                  key={shape}
                  label={shape}
                  sx={{ bgcolor: 'rgba(0, 113, 227, 0.1)', color: 'primary.main' }}
                />
              ))}
            </Box>
          </Paper>
        </Grid>
        
        {/* Right column - Details and customization */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              {frame.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {frame.brand} by {frame.manufacturer}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {Object.entries(frame.specifications).map(([key, value]) => (
                <Grid item xs={6} key={key}>
                  <Typography variant="body2" color="text.secondary">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {value}
                  </Typography>
                </Grid>
              ))}
            </Grid>
            
            <Divider sx={{ mb: 3 }} />
            
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Customize Your Lenses
            </Typography>
            
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500, mt: 2 }}>
              Lens Type
            </Typography>
            <ToggleButtonGroup
              value={selectedLens}
              exclusive
              onChange={handleLensChange}
              aria-label="lens options"
              sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                mb: 3,
                '& .MuiToggleButtonGroup-grouped': {
                  border: '1px solid rgba(0, 0, 0, 0.12)',
                  m: 0.5,
                  borderRadius: '4px !important',
                  flex: '1 0 calc(50% - 16px)',
                  maxWidth: 'calc(50% - 16px)',
                }
              }}
            >
              {lensOptions.map((option) => (
                <ToggleButton 
                  key={option.id} 
                  value={option.id}
                  className="lens-option"
                  data-type={option.id}
                  sx={{ 
                    textTransform: 'none',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    p: 2,
                    textAlign: 'left',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {option.name}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {option.price > 0 ? `+$${option.price.toFixed(2)}` : 'Included'}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {option.description}
                  </Typography>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500, mt: 2 }}>
              Additional Features
            </Typography>
            <Box sx={{ mb: 3 }}>
              {coatingOptions.map((option) => (
                <Paper
                  key={option.id}
                  elevation={0}
                  variant="outlined"
                  sx={{
                    p: 2,
                    mb: 1,
                    borderRadius: 1,
                    borderColor: selectedCoatings.includes(option.id) ? 'primary.main' : 'rgba(0, 0, 0, 0.12)',
                    bgcolor: selectedCoatings.includes(option.id) ? 'rgba(0, 113, 227, 0.05)' : 'transparent'
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedCoatings.includes(option.id)}
                        onChange={() => handleCoatingChange(option.id)}
                        className="coating-option"
                        data-coating={option.id}
                      />
                    }
                    label={
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {option.name}
                          </Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            +${option.price.toFixed(2)}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {option.description}
                        </Typography>
                      </Box>
                    }
                    sx={{ m: 0, width: '100%', alignItems: 'flex-start' }}
                  />
                </Paper>
              ))}
            </Box>
          </Paper>
          
          {/* Order summary */}
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Order Summary
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  {frame.name}
                </Typography>
                <Typography variant="body2">
                  ${frame.price.toFixed(2)}
                </Typography>
              </Box>
              
              {selectedLens && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    {lensOptions.find(lens => lens.id === selectedLens)?.name} Lenses
                  </Typography>
                  <Typography variant="body2">
                    ${lensOptions.find(lens => lens.id === selectedLens)?.price.toFixed(2) || '0.00'}
                  </Typography>
                </Box>
              )}
              
              {selectedCoatings.length > 0 && selectedCoatings.map(coatingId => {
                const coating = coatingOptions.find(c => c.id === coatingId);
                return coating ? (
                  <Box key={coating.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      {coating.name} Coating
                    </Typography>
                    <Typography variant="body2">
                      ${coating.price.toFixed(2)}
                    </Typography>
                  </Box>
                ) : null;
              })}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Total
              </Typography>
              <Typography variant="subtitle1" fontWeight={600}>
                ${totalPrice.toFixed(2)}
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              sx={{ py: 1.5, borderRadius: 28 }}
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
          </Paper>
        </Grid>
      </Grid>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <Button 
          variant="text" 
          color="primary"
          onClick={() => navigate('/recommendations')}
        >
          ← Back to Recommendations
        </Button>
      </Box>
    </Container>
  );
};

export default FrameDetailPage;
