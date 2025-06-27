import React from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  Paper,
  Divider,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
// Using custom icon components instead of MUI icons
const IconWrapper = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: 60,
      height: 60,
      borderRadius: '50%',
      bgcolor: 'primary.light',
      color: 'primary.main',
      mb: 2
    }}
  >
    {children}
  </Box>
);

const CustomerLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleGetStarted = () => {
    navigate('/recommendations');
  };

  const handleVirtualTryOn = () => {
    navigate('/virtual-try-on');
  };

  const handleBrowseFrames = () => {
    navigate('/frames');
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          bgcolor: theme.palette.primary.main,
          color: 'white',
          pt: 12,
          pb: 8,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
                Find Your Perfect Frames
              </Typography>
              <Typography variant="h5" paragraph>
                AI-powered eyewear recommendations tailored to your face shape and style
              </Typography>
              <Typography variant="body1" paragraph sx={{ mb: 4, opacity: 0.9 }}>
                Our advanced technology analyzes your facial features to recommend the most flattering frames for your unique look.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  size="large"
                  onClick={handleGetStarted}
                  sx={{ 
                    px: 4, 
                    py: 1.5, 
                    borderRadius: 2,
                    fontSize: '1.1rem'
                  }}
                >
                  Get Recommendations
                </Button>
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  size="large"
                  onClick={handleVirtualTryOn}
                  sx={{ 
                    px: 4, 
                    py: 1.5, 
                    borderRadius: 2,
                    fontSize: '1.1rem'
                  }}
                >
                  Virtual Try-On
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                component="img" 
                src="/images/eyewear-hero.jpg" 
                alt="Person wearing stylish glasses" 
                sx={{ 
                  width: '100%', 
                  borderRadius: 4,
                  boxShadow: 3,
                  transform: { xs: 'none', md: 'rotate(-3deg)' }
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" align="center" fontWeight="bold" gutterBottom>
          How It Works
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" paragraph sx={{ mb: 6, maxWidth: 800, mx: 'auto' }}>
          Our AI-powered platform makes finding the perfect eyewear simple and fun
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                <IconWrapper>
                  <Typography variant="h4" fontWeight="bold">1</Typography>
                </IconWrapper>
              </Box>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h5" component="h3" gutterBottom fontWeight="bold">
                  1. Face Analysis
                </Typography>
                <Typography variant="body2">
                  Upload a photo or use your webcam to analyze your face shape and features
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                <IconWrapper>
                  <Typography variant="h4" fontWeight="bold">2</Typography>
                </IconWrapper>
              </Box>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h5" component="h3" gutterBottom fontWeight="bold">
                  2. Style Matching
                </Typography>
                <Typography variant="body2">
                  Our AI matches your features with frames that complement your unique look
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                <IconWrapper>
                  <Typography variant="h4" fontWeight="bold">3</Typography>
                </IconWrapper>
              </Box>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h5" component="h3" gutterBottom fontWeight="bold">
                  3. Virtual Try-On
                </Typography>
                <Typography variant="body2">
                  See how frames look on your face with our realistic virtual try-on technology
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                <IconWrapper>
                  <Typography variant="h4" fontWeight="bold">4</Typography>
                </IconWrapper>
              </Box>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h5" component="h3" gutterBottom fontWeight="bold">
                  4. Purchase
                </Typography>
                <Typography variant="body2">
                  Customize your lenses and purchase your perfect frames with confidence
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Featured Frames Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" align="center" fontWeight="bold" gutterBottom>
            Featured Frames
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
            Browse our collection of popular eyewear styles
          </Typography>

          <Grid container spacing={3}>
            {[
              {
                id: 'frame-1',
                name: 'Classic Rectangle',
                brand: 'Ray-Ban',
                price: 149.99,
                image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
              },
              {
                id: 'frame-2',
                name: 'Modern Round',
                brand: 'Warby Parker',
                price: 95.00,
                image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
              },
              {
                id: 'frame-3',
                name: 'Premium Cat-Eye',
                brand: 'Gucci',
                price: 299.99,
                image: 'https://images.unsplash.com/photo-1513146581-976d6fdb6879?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
              },
              {
                id: 'frame-4',
                name: 'Sport Performance',
                brand: 'Oakley',
                price: 189.99,
                image: 'https://images.unsplash.com/photo-1587400416320-26efb29b43d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
              }
            ].map((frame) => (
              <Grid item xs={12} sm={6} md={3} key={frame.id}>
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
                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                      ${frame.price.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={handleBrowseFrames}
              sx={{ px: 4, py: 1.5, borderRadius: 2 }}
            >
              Browse All Frames
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Virtual Try-On CTA Section */}
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 4, md: 6 }, 
            borderRadius: 4, 
            background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.dark})`,
            color: 'white',
            textAlign: 'center'
          }}
        >
          <Typography variant="h3" component="h2" fontWeight="bold" gutterBottom>
            Virtual Try-On
          </Typography>
          <Typography variant="h6" paragraph sx={{ mb: 4, opacity: 0.9 }}>
            See how frames look on your face before you buy
          </Typography>
          <Button 
            variant="contained" 
            color="secondary" 
            size="large"
            onClick={handleVirtualTryOn}
            sx={{ 
              px: 4, 
              py: 1.5, 
              borderRadius: 2,
              fontSize: '1.1rem'
            }}
          >
            Try Frames Now
          </Button>
        </Paper>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: 'background.paper', py: 6, mt: 'auto' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                EyewearML
              </Typography>
              <Typography variant="body2" color="text.secondary">
                AI-powered eyewear recommendations and virtual try-on technology.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Quick Links
              </Typography>
              <Typography 
                variant="body2" 
                component="a" 
                href="/recommendations" 
                sx={{ display: 'block', mb: 1, color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
              >
                Get Recommendations
              </Typography>
              <Typography 
                variant="body2" 
                component="a" 
                href="/virtual-try-on" 
                sx={{ display: 'block', mb: 1, color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
              >
                Virtual Try-On
              </Typography>
              <Typography 
                variant="body2" 
                component="a" 
                href="/frames" 
                sx={{ display: 'block', mb: 1, color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
              >
                Browse Frames
              </Typography>
              <Typography 
                variant="body2" 
                component="a" 
                href="/face-shape-guide" 
                sx={{ display: 'block', color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
              >
                Face Shape Guide
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Customer Support
              </Typography>
              <Typography 
                variant="body2" 
                component="a" 
                href="/contact" 
                sx={{ display: 'block', mb: 1, color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
              >
                Contact Us
              </Typography>
              <Typography 
                variant="body2" 
                component="a" 
                href="/faq" 
                sx={{ display: 'block', mb: 1, color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
              >
                FAQ
              </Typography>
              <Typography 
                variant="body2" 
                component="a" 
                href="/shipping" 
                sx={{ display: 'block', mb: 1, color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
              >
                Shipping & Returns
              </Typography>
              <Typography 
                variant="body2" 
                component="a" 
                href="/privacy" 
                sx={{ display: 'block', color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
              >
                Privacy Policy
              </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4 }} />
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} EyewearML. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default CustomerLandingPage;