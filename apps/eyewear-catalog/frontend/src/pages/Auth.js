import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Card,
  Button,
  Banner,
  Spinner,
  Stack,
  TextContainer,
  Heading,
  Image
} from '@shopify/polaris';
import axios from 'axios';

function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for authentication
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  // Handle OAuth callback
  useEffect(() => {
    const handleCallback = async () => {
      // Get query parameters from URL
      const params = new URLSearchParams(location.search);
      const shop = params.get('shop');
      const code = params.get('code');
      const hmac = params.get('hmac');
      const state = params.get('state');
      
      // Check if this is an OAuth callback
      if (shop && code && hmac) {
        try {
          setIsAuthenticating(true);
          setError(null);
          
          // Complete OAuth flow
          const response = await axios.get('/auth/callback', {
            params: { shop, code, hmac, state }
          });
          
          if (response.data && response.data.success) {
            // Store session in localStorage
            localStorage.setItem('shopify_session', JSON.stringify({
              shop: response.data.shop,
              timestamp: new Date().getTime()
            }));
            
            // Redirect to dashboard
            navigate('/');
          } else {
            setError('Authentication failed. Please try again.');
            setIsAuthenticating(false);
          }
        } catch (err) {
          console.error('Authentication error:', err);
          setError('Authentication failed. ' + (err.response?.data?.message || 'Please try again.'));
          setIsAuthenticating(false);
        }
      }
    };
    
    handleCallback();
  }, [location, navigate]);
  
  // Login with Shopify
  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get Shopify authorization URL
      const response = await axios.get('/auth/shopify-url');
      
      if (response.data && response.data.url) {
        // Redirect to Shopify for authentication
        window.location.href = response.data.url;
      } else {
        throw new Error('Invalid authentication response');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Authentication failed. Please try again.');
      setLoading(false);
    }
  };
  
  // Show authenticating state
  if (isAuthenticating) {
    return (
      <Card sectioned>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <Stack vertical spacing="tight" alignment="center">
            <Spinner size="large" />
            <p>Completing authentication...</p>
          </Stack>
        </div>
      </Card>
    );
  }
  
  return (
    <Card sectioned>
      <div style={{ padding: '2rem', maxWidth: '400px' }}>
        <Stack vertical spacing="loose">
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <Image
              source="https://cdn.shopify.com/s/files/applications/eyewear_catalog_icon.png"
              alt="Eyewear Catalog"
              width={80}
            />
            
            <TextContainer>
              <Heading>Eyewear Catalog</Heading>
              <p>Sync eyewear products to your Shopify store</p>
            </TextContainer>
          </div>
          
          {error && (
            <Banner status="critical" title="Error">
              <p>{error}</p>
            </Banner>
          )}
          
          <div style={{ textAlign: 'center' }}>
            <Button 
              primary 
              size="large" 
              loading={loading} 
              onClick={handleLogin}
            >
              Login with Shopify
            </Button>
            
            <div style={{ marginTop: '1rem' }}>
              <p style={{ fontSize: '0.8rem', color: '#637381' }}>
                By logging in, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </Stack>
      </div>
    </Card>
  );
}

export default Auth;