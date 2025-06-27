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
  Chip,
  AppBar,
  Toolbar
} from '@mui/material';

const ProductsPage: React.FC = () => {
  const products = [
    {
      name: 'AI-Powered Recommendations',
      description: 'Intelligent product recommendations based on customer behavior, preferences, and purchase history.',
      features: ['Machine Learning', 'Real-time Analytics', 'Personalization', 'A/B Testing'],
      icon: '🤖'
    },
    {
      name: 'Virtual Try-On Technology',
      description: 'Advanced AR/VR technology allowing customers to virtually try products before purchase.',
      features: ['AR Integration', '3D Modeling', 'Face Detection', 'Real-time Rendering'],
      icon: '👓'
    },
    {
      name: 'Face Shape Analysis',
      description: 'Sophisticated facial analysis to recommend products that best fit customer face shapes.',
      features: ['Computer Vision', 'Shape Recognition', 'Style Matching', 'Precision Fitting'],
      icon: '📐'
    },
    {
      name: 'Commerce Studio Dashboard',
      description: 'Comprehensive analytics and management dashboard for e-commerce optimization.',
      features: ['Real-time Metrics', 'Sales Analytics', 'Customer Insights', 'Performance Tracking'],
      icon: '📊'
    },
    {
      name: 'Platform Integrations',
      description: 'Seamless integration with major e-commerce platforms and third-party services.',
      features: ['Shopify', 'Magento', 'WooCommerce', 'BigCommerce'],
      icon: '🔗'
    },
    {
      name: 'API & Developer Tools',
      description: 'Robust APIs and developer tools for custom integrations and advanced functionality.',
      features: ['RESTful APIs', 'SDKs', 'Documentation', 'Developer Support'],
      icon: '⚙️'
    }
  ];

  return (
    <>
      {/* Navigation */}
      <AppBar position="fixed" sx={{ backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#0A2463', fontSize: '1.5rem', fontWeight: 700 }}>
            VARAi
          </Link>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Link to="/products" style={{ textDecoration: 'none', color: '#1d1d1f', fontWeight: 600 }}>Products</Link>
            <Link to="/solutions" style={{ textDecoration: 'none', color: '#1d1d1f' }}>Solutions</Link>
            <Link to="/pricing" style={{ textDecoration: 'none', color: '#1d1d1f' }}>Pricing</Link>
            <Link to="/contact" style={{ textDecoration: 'none', color: '#1d1d1f' }}>Contact</Link>
            <Button component={Link} to="/login" variant="contained" sx={{ backgroundColor: '#0A2463' }}>
              Login
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        pt: 15,
        pb: 8,
        textAlign: 'center'
      }}>
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Our Products
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            Cutting-edge AI and AR solutions for modern e-commerce
          </Typography>
        </Container>
      </Box>

      {/* Products Grid */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {products.map((product, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography variant="h2" sx={{ mb: 2 }}>
                      {product.icon}
                    </Typography>
                    <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                      {product.name}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {product.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                    {product.features.map((feature, featureIndex) => (
                      <Chip 
                        key={featureIndex}
                        label={feature}
                        size="small"
                        sx={{ backgroundColor: '#f5f5f5' }}
                      />
                    ))}
                  </Box>
                  
                  <Button 
                    variant="outlined" 
                    fullWidth
                    sx={{ 
                      borderColor: '#0A2463',
                      color: '#0A2463',
                      '&:hover': {
                        backgroundColor: '#0A2463',
                        color: 'white'
                      }
                    }}
                  >
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ backgroundColor: '#f8f9fa', py: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
            Ready to Transform Your E-commerce?
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Get started with VARAi Commerce Studio today and see the difference AI can make.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button 
              component={Link}
              to="/login"
              variant="contained" 
              size="large"
              sx={{ backgroundColor: '#0A2463', px: 4 }}
            >
              Start Free Trial
            </Button>
            <Button 
              component={Link}
              to="/contact"
              variant="outlined" 
              size="large"
              sx={{ borderColor: '#0A2463', color: '#0A2463', px: 4 }}
            >
              Contact Sales
            </Button>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default ProductsPage;