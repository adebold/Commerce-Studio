import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  CircularProgress,
  Pagination
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Mock frame data type
interface Frame {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  style: string;
  material: string;
  color: string;
  faceShapes: string[];
}

// Mock frames data
const mockFrames: Frame[] = [
  {
    id: 'frame-1',
    name: 'Classic Rectangle Frame',
    brand: 'Ray-Ban',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    style: 'classic',
    material: 'acetate',
    color: 'black',
    faceShapes: ['oval', 'round', 'heart']
  },
  {
    id: 'frame-2',
    name: 'Modern Round Frame',
    brand: 'Warby Parker',
    price: 95.00,
    image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    style: 'minimal',
    material: 'metal',
    color: 'gold',
    faceShapes: ['square', 'oval', 'diamond']
  },
  {
    id: 'frame-3',
    name: 'Premium Cat-Eye Frame',
    brand: 'Gucci',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1513146581-976d6fdb6879?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    style: 'luxury',
    material: 'acetate',
    color: 'tortoise',
    faceShapes: ['heart', 'oval', 'diamond']
  },
  {
    id: 'frame-4',
    name: 'Sport Performance Frame',
    brand: 'Oakley',
    price: 189.99,
    image: 'https://images.unsplash.com/photo-1587400416320-26efb29b43d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    style: 'sporty',
    material: 'nylon',
    color: 'black',
    faceShapes: ['square', 'oval', 'oblong']
  },
  {
    id: 'frame-5',
    name: 'Rimless Titanium Frame',
    brand: 'Calvin Klein',
    price: 219.99,
    image: 'https://images.unsplash.com/photo-1633621623555-acfaac1721ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    style: 'minimalist',
    material: 'titanium',
    color: 'silver',
    faceShapes: ['oval', 'round', 'square']
  },
  {
    id: 'frame-6',
    name: 'Vintage Aviator Frame',
    brand: 'Ray-Ban',
    price: 159.99,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    style: 'classic',
    material: 'metal',
    color: 'gold',
    faceShapes: ['heart', 'oval', 'square']
  },
  {
    id: 'frame-7',
    name: 'Oversized Square Frame',
    brand: 'Prada',
    price: 279.99,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    style: 'luxury',
    material: 'acetate',
    color: 'black',
    faceShapes: ['round', 'oval']
  },
  {
    id: 'frame-8',
    name: 'Thin Metal Frame',
    brand: 'Tom Ford',
    price: 249.99,
    image: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    style: 'minimal',
    material: 'metal',
    color: 'silver',
    faceShapes: ['oval', 'heart', 'diamond']
  }
];

// Available filter options
const brands = ['All', 'Ray-Ban', 'Warby Parker', 'Gucci', 'Oakley', 'Calvin Klein', 'Prada', 'Tom Ford'];
const styles = ['All', 'classic', 'minimal', 'luxury', 'sporty', 'minimalist'];
const materials = ['All', 'acetate', 'metal', 'nylon', 'titanium'];
const faceShapes = ['All', 'oval', 'round', 'square', 'heart', 'diamond', 'oblong'];

const FramesPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [filteredFrames, setFilteredFrames] = useState<Frame[]>([]);
  
  // Filter states
  const [brandFilter, setBrandFilter] = useState('All');
  const [styleFilter, setStyleFilter] = useState('All');
  const [materialFilter, setMaterialFilter] = useState('All');
  const [faceShapeFilter, setFaceShapeFilter] = useState('All');
  
  // Pagination
  const [page, setPage] = useState(1);
  const framesPerPage = 6;

  // Fetch frames data
  useEffect(() => {
    const fetchFrames = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        // In a real app, we would fetch data from an API
        setFrames(mockFrames);
      } catch (error) {
        console.error('Error fetching frames:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFrames();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...frames];
    
    if (brandFilter !== 'All') {
      result = result.filter(frame => frame.brand === brandFilter);
    }
    
    if (styleFilter !== 'All') {
      result = result.filter(frame => frame.style === styleFilter);
    }
    
    if (materialFilter !== 'All') {
      result = result.filter(frame => frame.material === materialFilter);
    }
    
    if (faceShapeFilter !== 'All') {
      result = result.filter(frame => frame.faceShapes.includes(faceShapeFilter.toLowerCase()));
    }
    
    setFilteredFrames(result);
    setPage(1); // Reset to first page when filters change
  }, [frames, brandFilter, styleFilter, materialFilter, faceShapeFilter]);

  // Handle filter changes
  const handleBrandChange = (event: SelectChangeEvent) => {
    setBrandFilter(event.target.value);
  };
  
  const handleStyleChange = (event: SelectChangeEvent) => {
    setStyleFilter(event.target.value);
  };
  
  const handleMaterialChange = (event: SelectChangeEvent) => {
    setMaterialFilter(event.target.value);
  };
  
  const handleFaceShapeChange = (event: SelectChangeEvent) => {
    setFaceShapeFilter(event.target.value);
  };

  // Handle pagination
  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Calculate pagination
  const pageCount = Math.ceil(filteredFrames.length / framesPerPage);
  const displayedFrames = filteredFrames.slice(
    (page - 1) * framesPerPage,
    page * framesPerPage
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Browse Frames
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Find the perfect frames for your face shape and style preferences.
        </Typography>
      </Box>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel id="brand-filter-label">Brand</InputLabel>
            <Select
              labelId="brand-filter-label"
              id="brand-filter"
              value={brandFilter}
              label="Brand"
              onChange={handleBrandChange}
            >
              {brands.map(brand => (
                <MenuItem key={brand} value={brand}>{brand}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel id="style-filter-label">Style</InputLabel>
            <Select
              labelId="style-filter-label"
              id="style-filter"
              value={styleFilter}
              label="Style"
              onChange={handleStyleChange}
            >
              {styles.map(style => (
                <MenuItem key={style} value={style}>{style.charAt(0).toUpperCase() + style.slice(1)}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel id="material-filter-label">Material</InputLabel>
            <Select
              labelId="material-filter-label"
              id="material-filter"
              value={materialFilter}
              label="Material"
              onChange={handleMaterialChange}
            >
              {materials.map(material => (
                <MenuItem key={material} value={material}>{material.charAt(0).toUpperCase() + material.slice(1)}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel id="face-shape-filter-label">Face Shape</InputLabel>
            <Select
              labelId="face-shape-filter-label"
              id="face-shape-filter"
              value={faceShapeFilter}
              label="Face Shape"
              onChange={handleFaceShapeChange}
            >
              {faceShapes.map(shape => (
                <MenuItem key={shape} value={shape}>{shape.charAt(0).toUpperCase() + shape.slice(1)}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Results */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredFrames.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" gutterBottom>
            No frames found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your filters to see more results.
          </Typography>
        </Box>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Showing {displayedFrames.length} of {filteredFrames.length} frames
          </Typography>
          
          <Grid container spacing={3}>
            {displayedFrames.map((frame) => (
              <Grid item xs={12} sm={6} md={4} key={frame.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    borderRadius: 3,
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6,
                      cursor: 'pointer'
                    }
                  }}
                  onClick={() => navigate(`/frames/${frame.id}`)}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={frame.image}
                    alt={frame.name}
                    sx={{ objectFit: 'contain', p: 2, bgcolor: 'rgba(0,0,0,0.02)' }}
                  />
                  <CardContent>
                    <Typography variant="h6" component="div" fontWeight="bold">
                      {frame.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {frame.brand}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', my: 1 }}>
                      <Chip 
                        label={frame.style.charAt(0).toUpperCase() + frame.style.slice(1)} 
                        size="small" 
                        sx={{ bgcolor: 'rgba(0,0,0,0.05)', color: 'text.primary' }} 
                      />
                      <Chip 
                        label={frame.material.charAt(0).toUpperCase() + frame.material.slice(1)} 
                        size="small" 
                        sx={{ bgcolor: 'rgba(0,0,0,0.05)', color: 'text.primary' }} 
                      />
                      <Chip 
                        label={frame.color.charAt(0).toUpperCase() + frame.color.slice(1)} 
                        size="small" 
                        sx={{ bgcolor: 'rgba(0,0,0,0.05)', color: 'text.primary' }} 
                      />
                    </Box>
                    
                    <Typography variant="h6" color="primary.main" fontWeight="bold" sx={{ mt: 1 }}>
                      ${frame.price.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Pagination */}
          {pageCount > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={pageCount} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default FramesPage;