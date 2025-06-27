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

const ResourcesPage: React.FC = () => {
  const resources = [
    {
      title: 'API Documentation',
      description: 'Complete API reference and integration guides',
      icon: '📚',
      type: 'Documentation'
    },
    {
      title: 'Developer Guides',
      description: 'Step-by-step tutorials and best practices',
      icon: '👨‍💻',
      type: 'Tutorial'
    },
    {
      title: 'Case Studies',
      description: 'Real-world success stories from our clients',
      icon: '📊',
      type: 'Case Study'
    },
    {
      title: 'Webinars',
      description: 'Live and recorded sessions on AI commerce',
      icon: '🎥',
      type: 'Video'
    },
    {
      title: 'White Papers',
      description: 'In-depth research on e-commerce trends',
      icon: '📄',
      type: 'Research'
    },
    {
      title: 'Support Center',
      description: 'Help articles and troubleshooting guides',
      icon: '🆘',
      type: 'Support'
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
            <Link to="/solutions" style={{ textDecoration: 'none', color: '#1d1d1f' }}>Solutions</Link>
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
            Resources
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            Everything you need to succeed with VARAi
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {resources.map((resource, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h2" sx={{ mb: 2 }}>
                    {resource.icon}
                  </Typography>
                  <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                    {resource.title}
                  </Typography>
                  <Typography variant="body2" color="primary" sx={{ mb: 2, fontWeight: 600 }}>
                    {resource.type}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {resource.description}
                  </Typography>
                  <Button variant="outlined" fullWidth>
                    Explore
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

export default ResourcesPage;