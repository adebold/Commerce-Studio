import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Link,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InsightsIcon from '@mui/icons-material/Insights';
import StorefrontIcon from '@mui/icons-material/Storefront';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const LandingPage: React.FC = () => {
  const theme = useTheme();

  return (
    <Box sx={{ 
      bgcolor: 'background.default',
      minHeight: '100vh',
    }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          bgcolor: theme.palette.primary.main, 
          color: 'white',
          pt: 10,
          pb: 6
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
                EyewearML Platform
              </Typography>
              <Typography variant="h5" paragraph>
                Revolutionize Your Eyewear Business with AI-Powered Recommendations
              </Typography>
              <Typography variant="body1" paragraph sx={{ mb: 4 }}>
                Our cutting-edge platform uses machine learning to help customers find the perfect frames for their face shape, style preferences, and prescription needs.
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  size="large"
                  component={RouterLink}
                  to="/login"
                >
                  Sign In
                </Button>
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  size="large" 
                  component="a"
                  href="/demo"
                  target="_blank"
                >
                  Try Demo Store
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box 
                component="img" 
                src="/images/landing-hero.jpg" 
                alt="EyewearML Platform" 
                sx={{ 
                  width: '100%', 
                  borderRadius: 2,
                  boxShadow: 10
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" align="center" gutterBottom fontWeight="bold">
          Platform Benefits
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
          Transform your optical business with our innovative ML-powered features
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', mb: 2 }}>
                  <VisibilityIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h5" component="h3" fontWeight="bold">
                    Virtual Try-On
                  </Typography>
                </Box>
                <Typography variant="body1">
                  Let customers try frames virtually using their webcam or uploaded photos. Our advanced face mapping technology ensures accurate placement and sizing.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', mb: 2 }}>
                  <InsightsIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h5" component="h3" fontWeight="bold">
                    AI Recommendations
                  </Typography>
                </Box>
                <Typography variant="body1">
                  Our ML algorithms analyze face shape, skin tone, and style preferences to recommend the most flattering frames for each customer, increasing conversion rates.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', mb: 2 }}>
                  <StorefrontIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h5" component="h3" fontWeight="bold">
                    Custom Storefront
                  </Typography>
                </Box>
                <Typography variant="body1">
                  Integrate our technology into your existing e-commerce site or use our ready-made storefront solution with your branding and inventory.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', mb: 2 }}>
                  <TrendingUpIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h5" component="h3" fontWeight="bold">
                    Analytics Dashboard
                  </Typography>
                </Box>
                <Typography variant="body1">
                  Gain valuable insights into customer preferences, popular styles, and conversion metrics to optimize your inventory and marketing strategies.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', mb: 2 }}>
                  <DirectionsWalkIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h5" component="h3" fontWeight="bold">
                    Customer Journey
                  </Typography>
                </Box>
                <Typography variant="body1">
                  Follow the complete customer journey from initial browsing to purchase decision, with detailed funnels and touchpoint analysis.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', mb: 2 }}>
                  <AccountCircleIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h5" component="h3" fontWeight="bold">
                    RBAC System
                  </Typography>
                </Box>
                <Typography variant="body1">
                  Our robust Role-Based Access Control system ensures that your team members have appropriate access levels to platform features and customer data.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="md">
          <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
            Ready to transform your eyewear business?
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" paragraph>
            Join leading optical retailers who have increased sales by up to 35% with our platform.
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              component={RouterLink}
              to="/register"
              sx={{ mr: 2 }}
            >
              Sign Up Now
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              size="large"
              component="a"
              href="/demo"
              target="_blank"
            >
              Try Demo Store
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: theme.palette.grey[900], color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                EyewearML
              </Typography>
              <Typography variant="body2">
                The leading AI-powered platform for eyewear retailers and e-commerce businesses.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Resources
              </Typography>
              <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>Documentation</Link>
              <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>API Reference</Link>
              <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>Blog</Link>
              <Link href="#" color="inherit" display="block">Case Studies</Link>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Company
              </Typography>
              <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>About Us</Link>
              <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>Contact</Link>
              <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>Privacy Policy</Link>
              <Link href="#" color="inherit" display="block">Terms of Service</Link>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4, bgcolor: 'rgba(255,255,255,0.1)' }} />
          <Typography variant="body2" align="center">
            © {new Date().getFullYear()} EyewearML. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
