import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, CardMedia, Box, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { commerceStudioService, Solution } from '../../services/commerce-studio';

// Styled components
const SolutionCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const SolutionsPage: React.FC = () => {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSolutions = async () => {
      try {
        setLoading(true);
        const data = await commerceStudioService.getSolutions();
        setSolutions(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching solutions:', err);
        setError('Failed to load solutions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSolutions();
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
          Solutions
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 400,
            color: 'text.secondary',
            maxWidth: '800px',
          }}
        >
          Discover the solutions offered by VARAi Commerce Studio to transform your eyewear business
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
        <Grid container spacing={4}>
          {solutions.map((solution) => (
            <Grid item xs={12} md={6} key={solution.id}>
              <SolutionCard>
                <CardMedia
                  component="img"
                  height="200"
                  image={solution.image}
                  alt={solution.name}
                  sx={{ 
                    objectFit: 'contain',
                    backgroundColor: '#f5f5f7',
                  }}
                />
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                    {solution.name}
                  </Typography>
                  <Typography color="text.secondary" paragraph>
                    {solution.description}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    <strong>Relevant to:</strong> {solution.relevantTo}
                  </Typography>
                </CardContent>
              </SolutionCard>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default SolutionsPage;