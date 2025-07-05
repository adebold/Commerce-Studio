import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Stack,
  Divider,
  AppBar,
  Toolbar,
  Link,
  Rating,
  TextField,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  Psychology,
  ConnectWithoutContact,
  Analytics,
  Star,
  ArrowForward,
  CheckCircle,
  Store,
  Facebook,
  Google,
  LinkedIn,
  Twitter,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

// Landing page data
const heroData = {
  headline: "Transform Your Eyewear Business with AI",
  subheadline: "The complete platform for frame matching, virtual try-on, and commerce integration. Join thousands of brands revolutionizing the eyewear industry.",
  primaryCTA: "Start Free Trial",
  secondaryCTA: "Watch Demo"
};

const features = [
  {
    id: 'ai-matching',
    title: 'AI-Powered Frame Matching',
    description: 'Advanced machine learning algorithms analyze face shapes and personal style to recommend the perfect frames for every customer.',
    icon: <Psychology sx={{ fontSize: 48 }} />,
    benefits: ['99% accuracy rate', 'Real-time recommendations', 'Personalized styling']
  },
  {
    id: 'virtual-tryon',
    title: 'Virtual Try-On Technology',
    description: 'Cutting-edge AR technology lets customers try on frames virtually with photorealistic rendering and accurate fit visualization.',
    icon: <Visibility sx={{ fontSize: 48 }} />,
    benefits: ['Photorealistic rendering', 'Accurate fit detection', 'Mobile optimized']
  },
  {
    id: 'commerce-integration',
    title: 'Commerce Platform Integration',
    description: 'Seamlessly integrate with Shopify, WooCommerce, Magento, and more. Deploy in minutes with our pre-built connectors.',
    icon: <ConnectWithoutContact sx={{ fontSize: 48 }} />,
    benefits: ['One-click deployment', '50+ integrations', 'Real-time sync']
  },
  {
    id: 'analytics-insights',
    title: 'Analytics & Insights',
    description: 'Comprehensive analytics dashboard with conversion tracking, customer insights, and performance optimization recommendations.',
    icon: <Analytics sx={{ fontSize: 48 }} />,
    benefits: ['Real-time analytics', 'Conversion optimization', 'Customer insights']
  }
];

const integrations = [
  { name: 'Shopify', logo: '🛒', category: 'ecommerce', isPopular: true },
  { name: 'WooCommerce', logo: '🛍️', category: 'ecommerce', isPopular: true },
  { name: 'Magento', logo: '🏪', category: 'ecommerce', isPopular: false },
  { name: 'Salesforce', logo: '☁️', category: 'crm', isPopular: true },
  { name: 'HubSpot', logo: '🎯', category: 'marketing', isPopular: false },
  { name: 'Google Analytics', logo: '📊', category: 'analytics', isPopular: true },
  { name: 'Facebook Pixel', logo: '📱', category: 'marketing', isPopular: false },
  { name: 'Klaviyo', logo: '📧', category: 'email', isPopular: false }
];

const testimonials = [
  {
    id: 1,
    customerName: 'Sarah Chen',
    customerTitle: 'E-commerce Director',
    companyName: 'VisionCraft Eyewear',
    quote: 'VARAi transformed our online sales. Virtual try-on increased our conversion rate by 340% and reduced returns by 60%. The AI recommendations are incredibly accurate.',
    rating: 5,
    metrics: { improvement: '340% conversion increase', timeframe: '3 months' }
  },
  {
    id: 2,
    customerName: 'Michael Rodriguez',
    customerTitle: 'Founder & CEO',
    companyName: 'Modern Frames Co.',
    quote: 'The integration was seamless and the results were immediate. Our customers love the virtual try-on feature, and our sales team has better insights than ever.',
    rating: 5,
    metrics: { improvement: '250% engagement boost', timeframe: '2 months' }
  },
  {
    id: 3,
    customerName: 'Emily Watson',
    customerTitle: 'Digital Marketing Manager',
    companyName: 'Optical Excellence',
    quote: 'VARAi\'s analytics helped us understand our customers better. We optimized our inventory and increased customer satisfaction significantly.',
    rating: 5,
    metrics: { improvement: '180% satisfaction score', timeframe: '4 months' }
  }
];

const pricingTiers = [
  {
    id: 'starter',
    name: 'Starter',
    price: { monthly: 0, yearly: 0 },
    features: [
      'Up to 100 products',
      'Basic AI recommendations',
      'Standard virtual try-on',
      'Email support',
      'Basic analytics'
    ],
    limitations: ['Limited customization', 'Standard support'],
    isPopular: false,
    ctaText: 'Start Free'
  },
  {
    id: 'professional',
    name: 'Professional',
    price: { monthly: 299, yearly: 2990 },
    features: [
      'Up to 10,000 products',
      'Advanced AI matching',
      'Premium virtual try-on',
      'Priority support',
      'Advanced analytics',
      'Custom branding',
      'API access'
    ],
    isPopular: true,
    ctaText: 'Start Trial'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: { monthly: 999, yearly: 9990 },
    features: [
      'Unlimited products',
      'Custom AI training',
      'White-label solution',
      'Dedicated support',
      'Custom integrations',
      'Advanced security',
      'SLA guarantee'
    ],
    isPopular: false,
    ctaText: 'Contact Sales'
  }
];

const LandingPage: React.FC = () => {
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#ffffff' }}>
      {/* Navigation */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          <Link
            to="/"
            component={RouterLink}
            style={{
              textDecoration: 'none',
              color: '#000000',
              fontSize: '1.5rem',
              fontWeight: 700,
              letterSpacing: '-0.02em'
            }}
          >
            VARAi Commerce Studio
          </Link>
          <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <Link
              to="/products"
              component={RouterLink}
              style={{
                textDecoration: 'none',
                color: '#000000',
                fontSize: '1rem',
                fontWeight: 500,
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = '#666666'}
              onMouseLeave={(e) => e.target.style.color = '#000000'}
            >
              Products
            </Link>
            <Link
              to="/solutions"
              component={RouterLink}
              style={{
                textDecoration: 'none',
                color: '#000000',
                fontSize: '1rem',
                fontWeight: 500,
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = '#666666'}
              onMouseLeave={(e) => e.target.style.color = '#000000'}
            >
              Solutions
            </Link>
            <Link
              to="/pricing"
              component={RouterLink}
              style={{
                textDecoration: 'none',
                color: '#000000',
                fontSize: '1rem',
                fontWeight: 500,
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = '#666666'}
              onMouseLeave={(e) => e.target.style.color = '#000000'}
            >
              Pricing
            </Link>
            <Link
              to="/contact"
              component={RouterLink}
              style={{
                textDecoration: 'none',
                color: '#000000',
                fontSize: '1rem',
                fontWeight: 500,
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = '#666666'}
              onMouseLeave={(e) => e.target.style.color = '#000000'}
            >
              Contact
            </Link>
            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              sx={{
                backgroundColor: '#0A2463',
                color: '#ffffff',
                fontWeight: 600,
                px: 3,
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#082050',
                  boxShadow: '0 4px 12px rgba(10, 36, 99, 0.3)'
                }
              }}
            >
              Login
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          backgroundColor: '#ffffff',
          pt: 16,
          pb: 16
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4.5rem' },
                fontWeight: 700,
                mb: 4,
                color: '#000000',
                letterSpacing: '-0.02em',
                lineHeight: { xs: 1.1, md: 1.05 },
                maxWidth: '900px',
                mx: 'auto'
              }}
            >
              {heroData.headline}
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: '#666666',
                mb: 6,
                maxWidth: '700px',
                mx: 'auto',
                lineHeight: 1.5,
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                fontWeight: 400
              }}
            >
              {heroData.subheadline}
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              justifyContent="center"
              alignItems="center"
            >
              <Button
                variant="contained"
                size="large"
                component={RouterLink}
                to="/register"
                sx={{
                  backgroundColor: '#0A2463',
                  color: '#ffffff',
                  px: 5,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  textTransform: 'none',
                  boxShadow: '0 4px 16px rgba(10, 36, 99, 0.3)',
                  '&:hover': {
                    backgroundColor: '#082050',
                    boxShadow: '0 6px 20px rgba(10, 36, 99, 0.4)',
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {heroData.primaryCTA}
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={RouterLink}
                to="/demo"
                sx={{
                  color: '#000000',
                  borderColor: '#000000',
                  px: 5,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  textTransform: 'none',
                  borderWidth: '2px',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    borderColor: '#000000',
                    borderWidth: '2px'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {heroData.secondaryCTA}
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Key Features Section */}
      <Box sx={{ py: 12, bgcolor: '#ffffff' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" sx={{ mb: 2, fontWeight: 700, color: '#000000', fontSize: { xs: '2rem', md: '2.5rem' } }}>
              Platform Features
            </Typography>
            <Typography variant="h6" sx={{ maxWidth: '600px', mx: 'auto', color: '#666666', fontSize: '1.1rem', fontWeight: 400 }}>
              Everything you need to transform your eyewear business with cutting-edge AI technology
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {features.map((feature) => (
              <Grid item xs={12} md={6} key={feature.id}>
                <Card
                  sx={{
                    height: '100%',
                    p: 3,
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8]
                    }
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ color: 'primary.main', mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                      {feature.description}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {feature.benefits.map((benefit, index) => (
                        <Chip
                          key={index}
                          label={benefit}
                          size="small"
                          variant="outlined"
                          sx={{ borderRadius: 1 }}
                        />
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Integration Showcase */}
      <Box sx={{ py: 12, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" sx={{ mb: 2, fontWeight: 700, color: '#000000', fontSize: { xs: '2rem', md: '2.5rem' } }}>
              Seamless Integrations
            </Typography>
            <Typography variant="h6" sx={{ maxWidth: '600px', mx: 'auto', color: '#666666', fontSize: '1.1rem', fontWeight: 400 }}>
              Connect with your existing tools and platforms in minutes
            </Typography>
          </Box>
          <Grid container spacing={3} justifyContent="center">
            {integrations.map((integration) => (
              <Grid item xs={6} sm={4} md={3} key={integration.name}>
                <Card
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[4]
                    }
                  }}
                >
                  {integration.isPopular && (
                    <Chip
                      label="Popular"
                      size="small"
                      color="primary"
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: 8,
                        fontSize: '0.7rem'
                      }}
                    />
                  )}
                  <Typography variant="h3" sx={{ mb: 1 }}>
                    {integration.logo}
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {integration.name}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              variant="outlined"
              size="large"
              endIcon={<ArrowForward />}
              component={RouterLink}
              to="/integrations"
              sx={{ textTransform: 'none' }}
            >
              View All Integrations
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: 12, bgcolor: '#ffffff' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" sx={{ mb: 2, fontWeight: 700, color: '#000000', fontSize: { xs: '2rem', md: '2.5rem' } }}>
              Customer Success Stories
            </Typography>
            <Typography variant="h6" sx={{ maxWidth: '600px', mx: 'auto', color: '#666666', fontSize: '1.1rem', fontWeight: 400 }}>
              See how leading eyewear brands are transforming their business with VARAi
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {testimonials.map((testimonial) => (
              <Grid item xs={12} md={4} key={testimonial.id}>
                <Card
                  sx={{
                    height: '100%',
                    p: 3,
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                    <Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic', lineHeight: 1.6 }}>
                      "{testimonial.quote}"
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {testimonial.customerName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {testimonial.customerName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.customerTitle}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.companyName}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        borderRadius: 2,
                        textAlign: 'center'
                      }}
                    >
                      <Typography variant="h6" fontWeight={600}>
                        {testimonial.metrics.improvement}
                      </Typography>
                      <Typography variant="body2">
                        in {testimonial.metrics.timeframe}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Pricing Plans Section */}
      <Box sx={{ py: 12, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" sx={{ mb: 2, fontWeight: 700, color: '#000000', fontSize: { xs: '2rem', md: '2.5rem' } }}>
              Choose Your Plan
            </Typography>
            <Typography variant="h6" sx={{ maxWidth: '600px', mx: 'auto', color: '#666666', fontSize: '1.1rem', fontWeight: 400 }}>
              Start free and scale as you grow. No hidden fees, cancel anytime.
            </Typography>
          </Box>
          <Grid container spacing={4} justifyContent="center">
            {pricingTiers.map((tier) => (
              <Grid item xs={12} md={4} key={tier.id}>
                <Card
                  sx={{
                    height: '100%',
                    p: 3,
                    borderRadius: 3,
                    border: tier.isPopular
                      ? `2px solid ${theme.palette.primary.main}`
                      : `1px solid ${theme.palette.divider}`,
                    position: 'relative',
                    transform: tier.isPopular ? 'scale(1.05)' : 'none'
                  }}
                >
                  {tier.isPopular && (
                    <Chip
                      label="Most Popular"
                      color="primary"
                      sx={{
                        position: 'absolute',
                        top: -12,
                        left: '50%',
                        transform: 'translateX(-50%)'
                      }}
                    />
                  )}
                  <CardContent sx={{ p: 0 }}>
                    <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
                      {tier.name}
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h3" component="span" fontWeight={700}>
                        ${tier.price.monthly}
                      </Typography>
                      <Typography variant="body1" component="span" color="text.secondary">
                        /month
                      </Typography>
                    </Box>
                    <Stack spacing={2} sx={{ mb: 4 }}>
                      {tier.features.map((feature, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                          <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                          <Typography variant="body2">{feature}</Typography>
                        </Box>
                      ))}
                    </Stack>
                    <Button
                      variant={tier.isPopular ? 'contained' : 'outlined'}
                      fullWidth
                      size="large"
                      sx={{ textTransform: 'none', py: 1.5 }}
                    >
                      {tier.ctaText}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Sign-Up Section */}
      <Box
        sx={{
          py: 12,
          bgcolor: 'primary.main',
          color: 'primary.contrastText'
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h2" sx={{ mb: 2, fontWeight: 600 }}>
              Ready to Transform Your Business?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Join thousands of eyewear brands already using VARAi to increase sales and customer satisfaction
            </Typography>
            <Box
              component="form"
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                maxWidth: '500px',
                mx: 'auto',
                mb: 4
              }}
            >
              <TextField
                placeholder="Enter your email"
                variant="outlined"
                fullWidth
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1
                  }
                }}
              />
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'secondary.main',
                  color: 'secondary.contrastText',
                  px: 4,
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: 'secondary.dark'
                  }
                }}
              >
                Start Free Trial
              </Button>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              No credit card required • 14-day free trial • Cancel anytime
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 8, bgcolor: '#ffffff', borderTop: '1px solid #e5e5e7' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                VARAi Commerce Studio
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                The leading AI-powered platform for the eyewear industry. Transform your business with virtual try-on, frame matching, and commerce integration.
              </Typography>
              <Stack direction="row" spacing={1}>
                <IconButton size="small" sx={{ color: 'text.secondary' }}>
                  <Twitter />
                </IconButton>
                <IconButton size="small" sx={{ color: 'text.secondary' }}>
                  <LinkedIn />
                </IconButton>
                <IconButton size="small" sx={{ color: 'text.secondary' }}>
                  <Facebook />
                </IconButton>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Product
              </Typography>
              <Stack spacing={1}>
                <Link href="/features" color="text.secondary" underline="hover">Features</Link>
                <Link href="/integrations" color="text.secondary" underline="hover">Integrations</Link>
                <Link href="/pricing" color="text.secondary" underline="hover">Pricing</Link>
                <Link href="/api" color="text.secondary" underline="hover">API</Link>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Company
              </Typography>
              <Stack spacing={1}>
                <Link href="/about" color="text.secondary" underline="hover">About</Link>
                <Link href="/careers" color="text.secondary" underline="hover">Careers</Link>
                <Link href="/blog" color="text.secondary" underline="hover">Blog</Link>
                <Link href="/contact" color="text.secondary" underline="hover">Contact</Link>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Support
              </Typography>
              <Stack spacing={1}>
                <Link href="/help" color="text.secondary" underline="hover">Help Center</Link>
                <Link href="/docs" color="text.secondary" underline="hover">Documentation</Link>
                <Link href="/status" color="text.secondary" underline="hover">Status</Link>
                <Link href="/community" color="text.secondary" underline="hover">Community</Link>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Legal
              </Typography>
              <Stack spacing={1}>
                <Link href="/privacy" color="text.secondary" underline="hover">Privacy</Link>
                <Link href="/terms" color="text.secondary" underline="hover">Terms</Link>
                <Link href="/security" color="text.secondary" underline="hover">Security</Link>
                <Link href="/cookies" color="text.secondary" underline="hover">Cookies</Link>
              </Stack>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="body2" color="text.secondary">
              © 2024 VARAi Commerce Studio. All rights reserved.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Made with ❤️ for the eyewear industry
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;