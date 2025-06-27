import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, CardActions, Button, Box, List, ListItem, ListItemIcon, ListItemText, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { commerceStudioService, PricingPlan } from '../../services/commerce-studio';

// Styled components
const PricingCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const PricingPage: React.FC = () => {
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPricingPlans = async () => {
      try {
        setLoading(true);
        const data = await commerceStudioService.getPricingPlans();
        setPricingPlans(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching pricing plans:', err);
        setError('Failed to load pricing plans. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPricingPlans();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '2rem', md: '3rem' },
            letterSpacing: '-0.022em',
            mb: 3,
          }}
        >
          Pricing
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 400,
            color: 'text.secondary',
            maxWidth: '800px',
          }}
        >
          Choose the pricing plan that best fits your needs
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: 'center', my: 4, color: 'error.main' }}>
          <Typography variant="h6">{error}</Typography>
        </Box>
      ) : (
        <Grid container spacing={4} alignItems="stretch">
          {pricingPlans.map((plan) => (
            <Grid item xs={12} md={4} key={plan.id}>
              <PricingCard>
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                    {plan.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                    <Typography variant="h3" component="span" sx={{ fontWeight: 700 }}>
                      {plan.price}
                    </Typography>
                    <Typography variant="subtitle1" component="span" sx={{ ml: 1, color: 'text.secondary' }}>
                      {plan.period}
                    </Typography>
                  </Box>
                  <Typography color="text.secondary" paragraph>
                    {plan.description}
                  </Typography>
                  <List sx={{ mt: 2 }}>
                    {plan.features.map((feature, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircleOutlineIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Button
                    fullWidth
                    variant={plan.buttonVariant}
                    color="primary"
                    size="large"
                  >
                    {plan.buttonText}
                  </Button>
                </CardActions>
                <Box sx={{ p: 3, pt: 0 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    <strong>Relevant to:</strong> {plan.relevantTo}
                  </Typography>
                </Box>
              </PricingCard>
            </Grid>
          ))}
        </Grid>
      )}

      <Box sx={{ mt: 8, p: 4, bgcolor: '#f5f5f7', borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Need a custom solution?
        </Typography>
        <Typography paragraph>
          Contact our sales team to discuss your specific requirements and get a customized quote.
        </Typography>
        <Button variant="contained" color="primary">
          Contact Sales
        </Button>
      </Box>
    </Container>
  );
};

export default PricingPage;