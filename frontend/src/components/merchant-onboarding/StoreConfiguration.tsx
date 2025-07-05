import React from 'react';
import { 
  Typography, 
  Box, 
  TextField, 
  Grid,
  Paper,
  Alert,
  InputAdornment,
  Tooltip,
  IconButton
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import InfoIcon from '@mui/icons-material/Info';

interface StoreConfigurationProps {
  storeName: string;
  storeUrl: string;
  storeId: string;
  platform: string;
  onInputChange: (field: string, value: string) => void;
}

const StoreConfiguration: React.FC<StoreConfigurationProps> = ({ 
  storeName, 
  storeUrl, 
  storeId, 
  platform,
  onInputChange 
}) => {
  // Platform-specific help text
  const getPlatformSpecificHelp = () => {
    switch (platform) {
      case 'shopify':
        return {
          urlHelp: "Your Shopify store URL (e.g., your-store.myshopify.com)",
          idHelp: "Your Shopify store ID (found in your Shopify admin under Settings > General)",
          urlPlaceholder: "your-store.myshopify.com",
          idPlaceholder: "store_123456789",
          idRequired: false
        };
      case 'magento':
        return {
          urlHelp: "Your Magento store URL (e.g., store.example.com)",
          idHelp: "Your Magento store ID or view ID",
          urlPlaceholder: "store.example.com",
          idPlaceholder: "1",
          idRequired: true
        };
      case 'woocommerce':
        return {
          urlHelp: "Your WordPress site URL (e.g., example.com)",
          idHelp: "Optional: Your WooCommerce store ID if using multisite",
          urlPlaceholder: "example.com",
          idPlaceholder: "1",
          idRequired: false
        };
      case 'bigcommerce':
        return {
          urlHelp: "Your BigCommerce store URL (e.g., store.mybigcommerce.com)",
          idHelp: "Your BigCommerce store hash (found in your store's API credentials)",
          urlPlaceholder: "store.mybigcommerce.com",
          idPlaceholder: "abcdef123",
          idRequired: true
        };
      case 'custom':
        return {
          urlHelp: "Your store's URL",
          idHelp: "Optional: Your store's unique identifier",
          urlPlaceholder: "example.com",
          idPlaceholder: "store123",
          idRequired: false
        };
      default:
        return {
          urlHelp: "Your store URL",
          idHelp: "Your store ID",
          urlPlaceholder: "example.com",
          idPlaceholder: "store123",
          idRequired: false
        };
    }
  };

  const platformHelp = getPlatformSpecificHelp();

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Configure Your Store
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Provide your store details so we can connect VARAi to your {platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : 'e-commerce'} store.
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Store Name"
              variant="outlined"
              fullWidth
              required
              value={storeName}
              onChange={(e) => onInputChange('storeName', e.target.value)}
              placeholder="Your Store Name"
              helperText="The name of your store as you want it to appear in VARAi"
              data-testid="store-name-input"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Store URL"
              variant="outlined"
              fullWidth
              required
              value={storeUrl}
              onChange={(e) => onInputChange('storeUrl', e.target.value)}
              placeholder={platformHelp.urlPlaceholder}
              helperText={platformHelp.urlHelp}
              InputProps={{
                startAdornment: platform === 'shopify' || platform === 'bigcommerce' ? (
                  <InputAdornment position="start">https://</InputAdornment>
                ) : null,
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={platformHelp.urlHelp}>
                      <IconButton edge="end" size="small">
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              data-testid="store-url-input"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Store ID"
              variant="outlined"
              fullWidth
              required={platformHelp.idRequired}
              value={storeId}
              onChange={(e) => onInputChange('storeId', e.target.value)}
              placeholder={platformHelp.idPlaceholder}
              helperText={platformHelp.idHelp}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={platformHelp.idHelp}>
                      <IconButton edge="end" size="small">
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              data-testid="store-id-input"
            />
          </Grid>
        </Grid>
      </Paper>
      
      {platform && (
        <Alert 
          severity="info" 
          icon={<InfoIcon />}
          sx={{ mt: 2 }}
        >
          {getPlatformSpecificAlert(platform)}
        </Alert>
      )}
    </Box>
  );
};

const getPlatformSpecificAlert = (platform: string): string => {
  switch (platform) {
    case 'shopify':
      return "You'll need to install the VARAi app from the Shopify App Store to complete the integration.";
    case 'magento':
      return "You'll need to install our Magento extension and configure it with your API credentials.";
    case 'woocommerce':
      return "You'll need to install our WordPress plugin and activate it in your WooCommerce store.";
    case 'bigcommerce':
      return "You'll need to install the VARAi app from the BigCommerce App Marketplace to complete the integration.";
    case 'custom':
      return "You'll need to implement our API endpoints in your custom platform. Documentation will be provided.";
    default:
      return "You'll need to complete additional steps to connect your store after this onboarding process.";
  }
};

export default StoreConfiguration;