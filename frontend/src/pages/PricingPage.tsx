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
  Toolbar,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';

const PricingPage: React.FC = () => {
  const plans = [
    {
      name: 'Starter',
      price: '$99',
      period: '/month',
      description: 'Perfect for small businesses getting started',
      features: [
        'Up to 1,000 products',
        'Basic AI recommendations',
        'Email support',
        'Standard analytics',
        'API access'
      ],
      popular: false
    },
    {
      name: 'Professional',
      price: '$299',
      period: '/month',
      description: 'Ideal for growing businesses',
      features: [
        'Up to 10,000 products',
        'Advanced AI recommendations',
        'Virtual try-on technology',
        'Priority support',
        'Advanced analytics',
        'Custom integrations'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large-scale operations',
      features: [
        'Unlimited products',
        'Full AI suite',
        'Dedicated support',
        'Custom development',
        'SLA guarantees',
        'White-label options'
      ],
      popular: false
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
            <Link to="/pricing" style={{ textDecoration: 'none', color: '#1d1d1f', fontWeight: 600 }}>Pricing</Link>
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
            Pricing
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            Choose the perfect plan for your business
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {plans.map((plan, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  position: 'relative',
                  border: plan.popular ? '2px solid #0A2463' : '1px solid #e0e0e0'
                }}
              >
                {plan.popular && (
                  <Chip 
                    label="Most Popular" 
                    color="primary" 
                    sx={{ 
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: '#0A2463'
                    }}
                  />
                )}
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h4" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                    {plan.name}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h3" component="span" sx={{ fontWeight: 700, color: '#0A2463' }}>
                      {plan.price}
                    </Typography>
                    <Typography variant="h6" component="span" color="text.secondary">
                      {plan.period}
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    {plan.description}
                  </Typography>
                  
                  <List sx={{ mb: 4 }}>
                    {plan.features.map((feature, featureIndex) => (
                      <ListItem key={featureIndex} sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary={`✓ ${feature}`}
                          sx={{ textAlign: 'left' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                  
                  <Button 
                    variant={plan.popular ? "contained" : "outlined"}
                    fullWidth
                    size="large"
                    sx={{ 
                      backgroundColor: plan.popular ? '#0A2463' : 'transparent',
                      borderColor: '#0A2463',
                      color: plan.popular ? 'white' : '#0A2463',
                      '&:hover': {
                        backgroundColor: '#0A2463',
                        color: 'white'
                      }
                    }}
                  >
                    {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
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

export default PricingPage;