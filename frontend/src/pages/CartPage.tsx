import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Button, Grid, Divider, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Mock cart item type
interface CartItem {
  id: string;
  frameId: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  lensType: string;
  lensPrice: number;
  coatings: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}

// Mock cart data
const mockCartItems: CartItem[] = [
  {
    id: 'cart-item-1',
    frameId: 'frame-123',
    name: 'Classic Rectangle Frame',
    brand: 'Ray-Ban',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    lensType: 'Blue Light Filtering',
    lensPrice: 49.99,
    coatings: [
      {
        id: 'anti-glare',
        name: 'Anti-Glare',
        price: 29.99
      }
    ]
  }
];

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => {
    const itemTotal = item.price + item.lensPrice + 
      item.coatings.reduce((acc, coating) => acc + coating.price, 0);
    return total + itemTotal;
  }, 0);
  
  const tax = subtotal * 0.07; // 7% tax rate
  const shipping = cartItems.length > 0 ? 5.99 : 0;
  const total = subtotal + tax + shipping;

  // Fetch cart data
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        // For demo, use mock data
        setCartItems(mockCartItems);
      } catch (error) {
        console.error('Error fetching cart:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handleRemoveItem = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
    setSnackbarMessage('Item removed from cart');
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleCheckout = () => {
    // Navigate to checkout page
    navigate('/checkout');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Your Cart
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {cartItems.length > 0 
            ? `You have ${cartItems.length} item${cartItems.length !== 1 ? 's' : ''} in your cart.`
            : 'Your cart is empty.'}
        </Typography>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <Typography>Loading your cart...</Typography>
        </Box>
      ) : cartItems.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Looks like you haven't added any frames to your cart yet.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/recommendations')}
            sx={{ mt: 2, borderRadius: 28, px: 3 }}
          >
            Browse Frames
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          {/* Cart Items */}
          <Grid item xs={12} md={8}>
            <Paper elevation={1} sx={{ p: 0, borderRadius: 2, overflow: 'hidden' }}>
              {cartItems.map((item, index) => (
                <Box key={item.id} className="cart-item">
                  <Grid container sx={{ p: 3 }}>
                    <Grid item xs={12} sm={3}>
                      <Box
                        component="img"
                        src={item.image}
                        alt={item.name}
                        sx={{
                          width: '100%',
                          height: 'auto',
                          borderRadius: 2,
                          objectFit: 'contain',
                          bgcolor: 'rgba(0,0,0,0.03)'
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ pl: { xs: 0, sm: 3 }, pt: { xs: 2, sm: 0 } }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {item.brand}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" gutterBottom>
                          <Box component="span" sx={{ fontWeight: 500 }}>Lenses:</Box> {item.lensType} (+${item.lensPrice.toFixed(2)})
                        </Typography>
                        
                        {item.coatings.length > 0 && (
                          <Typography variant="body2">
                            <Box component="span" sx={{ fontWeight: 500 }}>Coatings:</Box>
                            {item.coatings.map((coating, i) => (
                              <Box component="span" key={coating.id}>
                                {' '}{coating.name} (+${coating.price.toFixed(2)})
                                {i < item.coatings.length - 1 ? ',' : ''}
                              </Box>
                            ))}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={3} sx={{ mt: { xs: 2, sm: 0 }, textAlign: { xs: 'left', sm: 'right' } }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        ${(item.price + item.lensPrice + item.coatings.reduce((acc, c) => acc + c.price, 0)).toFixed(2)}
                      </Typography>
                      <Button
                        variant="text"
                        color="error"
                        onClick={() => handleRemoveItem(item.id)}
                        sx={{ mt: 1, textTransform: 'none' }}
                      >
                        Remove
                      </Button>
                    </Grid>
                  </Grid>
                  {index < cartItems.length - 1 && <Divider />}
                </Box>
              ))}
            </Paper>
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Order Summary
              </Typography>

              <Box sx={{ my: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                  </Typography>
                  <Typography variant="body2">
                    ${subtotal.toFixed(2)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Shipping
                  </Typography>
                  <Typography variant="body2">
                    ${shipping.toFixed(2)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Tax
                  </Typography>
                  <Typography variant="body2">
                    ${tax.toFixed(2)}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Total
                </Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  ${total.toFixed(2)}
                </Typography>
              </Box>
              
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                onClick={handleCheckout}
                sx={{ py: 1.5, borderRadius: 28 }}
              >
                Checkout
              </Button>
              
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                sx={{ mt: 2, py: 1.5, borderRadius: 28 }}
                onClick={() => navigate('/recommendations')}
              >
                Continue Shopping
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CartPage;
