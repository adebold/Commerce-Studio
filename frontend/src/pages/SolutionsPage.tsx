import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  AppBar,
  Toolbar
} from '@mui/material';

const SolutionsPage: React.FC = () => {
  const solutions = [
    {
      title: 'E-commerce Optimization',
      description: 'Complete solution for optimizing your online store with AI-powered recommendations and analytics.',
      features: ['Conversion Rate Optimization', 'Customer Journey Analysis', 'Product Recommendations'],
      icon: '🛒'
    },
    {
      title: 'Fashion & Eyewear',
      description: 'Specialized solutions for fashion and eyewear retailers with virtual try-on technology.',
      features: ['Virtual Try-On', 'Face Shape Analysis', 'Style Matching'],
      icon: '👓'
    },
    {
      title: 'Enterprise Integration',
      description: 'Enterprise-grade solutions with custom integrations and dedicated support.',
      features: ['Custom APIs', 'Dedicated Support', 'SLA Guarantees'],
      icon: '🏢'
    }
  ];

  return (
    <>
      <AppBar position="fixed" sx={{ backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#0A2463', fontSize: '1.5rem', fontWeight: 700 }}>
            VARAi
          </Link>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Link to="/products" style={{ textDecoration: 'none', color: '#1d1d1f' }}>Products</Link>
            <Link to="/solutions" style={{ textDecoration: 'none', color: '#1d1d1f', fontWeight: 600 }}>Solutions</Link>
            <Link to="/pricing" style={{ textDecoration: 'none', color: '#1d1d1f' }}>Pricing</Link>
            <Link to="/contact" style={{ textDecoration: 'none', color: '#1d1d1f' }}>Contact</Link>
            <Button component={Link} to="/login" variant="contained" sx={{ backgroundColor: '#0A2463' }}>
              Login
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        pt: 15,
        pb: 8,
        textAlign: 'center'
      }}>
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Solutions
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            Tailored solutions for your business needs
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {solutions.map((solution, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h2" sx={{ mb: 2 }}>
                    {solution.icon}
                  </Typography>
                  <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                    {solution.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {solution.description}
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    {solution.features.map((feature, featureIndex) => (
                      <Typography key={featureIndex} variant="body2" sx={{ mb: 1 }}>
                        ✓ {feature}
                      </Typography>
                    ))}
                  </Box>
                  <Button variant="outlined" fullWidth>
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
};

export default SolutionsPage;