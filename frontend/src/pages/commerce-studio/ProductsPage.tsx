import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, CardMedia, Box, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { commerceStudioService, Product } from '../../services/commerce-studio';

// Styled components
const ProductCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await commerceStudioService.getProducts();
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
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
          Products
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 400,
            color: 'text.secondary',
            maxWidth: '800px',
          }}
        >
          Explore the products offered by VARAi Commerce Studio
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
          {products.map((product) => (
            <Grid item xs={12} md={6} lg={4} key={product.id}>
              <ProductCard>
                <CardMedia
                  component="img"
                  height="200"
                  image={product.image}
                  alt={product.name}
                  sx={{ 
                    objectFit: 'contain',
                    backgroundColor: '#f5f5f7',
                  }}
                />
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                    {product.name}
                  </Typography>
                  <Typography color="text.secondary" paragraph>
                    {product.description}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    <strong>Relevant to:</strong> {product.relevantTo}
                  </Typography>
                </CardContent>
              </ProductCard>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default ProductsPage;