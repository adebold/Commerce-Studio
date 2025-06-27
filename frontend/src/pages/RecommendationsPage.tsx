import React, { useEffect, useState } from 'react';
import { Container, Grid, Typography, Box, Card, CardContent, CardMedia, Chip, Paper, CircularProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

// Types for our recommendation data
interface FrameRecommendation {
  id: string;
  name: string;
  brand: string;
  manufacturer: string;
  price: number;
  imageUrl: string;
  style: string;
  material: string;
  color: string;
  matchScore: number;
  matchReason: string;
}

// Mock data for recommendations
const mockRecommendations: FrameRecommendation[] = [
  {
    id: 'frame-1',
    name: 'Classic Rectangle Frame',
    brand: 'Ray-Ban',
    manufacturer: 'Luxottica Group',
    price: 149.99,
    imageUrl: 'https://images.unsplash.com/photo-1577803645773-f96470509666?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    style: 'classic',
    material: 'acetate',
    color: 'black',
    matchScore: 0.92,
    matchReason: 'This frame complements your oval face shape with its balanced proportions and classic style.'
  },
  {
    id: 'frame-2',
    name: 'Modern Round Frame',
    brand: 'Warby Parker',
    manufacturer: 'Warby Parker',
    price: 95.00,
    imageUrl: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    style: 'minimal',
    material: 'metal',
    color: 'gold',
    matchScore: 0.85,
    matchReason: 'The minimal style you preferred is perfectly captured in this sleek frame design.'
  },
  {
    id: 'frame-3',
    name: 'Premium Cat-Eye Frame',
    brand: 'Gucci',
    manufacturer: 'Kering',
    price: 299.99,
    imageUrl: 'https://images.unsplash.com/photo-1513146581-976d6fdb6879?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    style: 'luxury',
    material: 'acetate',
    color: 'tortoise',
    matchScore: 0.78,
    matchReason: 'This glamorous frame offers a luxury aesthetic that elevates your style preferences.'
  },
  {
    id: 'frame-4',
    name: 'Sport Performance Frame',
    brand: 'Oakley',
    manufacturer: 'Luxottica Group',
    price: 189.99,
    imageUrl: 'https://images.unsplash.com/photo-1587400416320-26efb29b43d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    style: 'sporty',
    material: 'nylon',
    color: 'black',
    matchScore: 0.75,
    matchReason: 'For an active lifestyle, these durable frames offer both style and performance.'
  },
  {
    id: 'frame-5',
    name: 'Rimless Titanium Frame',
    brand: 'Calvin Klein',
    manufacturer: 'Marcolin',
    price: 219.99,
    imageUrl: 'https://images.unsplash.com/photo-1633621623555-acfaac1721ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    style: 'minimalist',
    material: 'titanium',
    color: 'silver',
    matchScore: 0.72,
    matchReason: 'The subtle elegance of these frames aligns with your preference for minimalist aesthetics.'
  },
  {
    id: 'frame-6',
    name: 'Vintage Aviator Frame',
    brand: 'Ray-Ban',
    manufacturer: 'Luxottica Group',
    price: 159.99,
    imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    style: 'classic',
    material: 'metal',
    color: 'gold',
    matchScore: 0.70,
    matchReason: 'These iconic frames offer a timeless look that never goes out of style.'
  }
];


const RecommendationsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<FrameRecommendation[]>([]);
  const [personalized, setPersonalized] = useState(false);

  // Initialize based on URL path - check if this is a personalized recommendations page
  useEffect(() => {
    setPersonalized(location.pathname.includes('/personalized'));
    
    // Simulate API call to fetch recommendations
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        
        // In a real app, we would fetch data from an API
        // For now, just use mock data with a delay to simulate a network request
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setRecommendations(mockRecommendations);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [location.pathname]);

  const handleSelectFrame = (frameId: string) => {
    navigate(`/frames/${frameId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Header section */}
      <Box sx={{ mb: 5, textAlign: 'center' }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 700 }}
        >
          {personalized ? 'Your Personalized Recommendations' : 'Recommended Frames For You'}
        </Typography>
        
        <Typography
          variant="body1"
          sx={{ color: 'text.secondary', maxWidth: '800px', mx: 'auto', mb: 2 }}
        >
          {personalized 
            ? "Based on your previous orders and preferences, we think you'll love these frames."
            : "Based on your face shape and style preferences, we've selected frames that will complement your features."}
        </Typography>
        
        {personalized && (
          <Box 
            className="personalization-indicator"
            sx={{ 
              display: 'inline-block', 
              py: 1, 
              px: 2, 
              borderRadius: 2, 
              bgcolor: 'rgba(0, 113, 227, 0.1)', 
              color: 'primary.main',
              mb: 3
            }}
          >
            <Typography variant="body2" fontWeight={500}>
              Based on your history • Personalized for you
            </Typography>
          </Box>
        )}
      </Box>

      {/* Content section */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {recommendations.map((frame) => (
            <Grid item xs={12} sm={6} md={4} key={frame.id}>
              <Card 
                className="recommendation-item"
                sx={{ 
                  height: '100%', 
                  borderRadius: 2,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                    cursor: 'pointer'
                  }
                }}
                onClick={() => handleSelectFrame(frame.id)}
              >
                <CardMedia
                  component="img"
                  height="220"
                  image={frame.imageUrl}
                  alt={frame.name}
                  sx={{ 
                    objectFit: 'contain',
                    bgcolor: 'rgba(0,0,0,0.04)',
                    p: 2
                  }}
                />
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 0 }}>
                      {frame.name}
                    </Typography>
                    <Box component="span" sx={{ 
                      backgroundColor: 'primary.main', 
                      color: 'white',
                      px: 1.5, 
                      py: 0.5,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: 5,
                      display: 'inline-block'
                    }}>
                      {Math.round(frame.matchScore * 100)}% Match
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {frame.brand} • ${frame.price.toFixed(2)}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                    <Chip 
                      label={frame.style} 
                      size="small" 
                      sx={{ bgcolor: 'rgba(0,0,0,0.05)', color: 'text.primary' }} 
                    />
                    <Chip 
                      label={frame.material} 
                      size="small" 
                      sx={{ bgcolor: 'rgba(0,0,0,0.05)', color: 'text.primary' }} 
                    />
                    <Chip 
                      label={frame.color} 
                      size="small" 
                      sx={{ bgcolor: 'rgba(0,0,0,0.05)', color: 'text.primary' }} 
                    />
                  </Box>
                  
                  <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {frame.matchReason}
                    </Typography>
                  </Paper>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default RecommendationsPage;
