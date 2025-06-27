import React from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Grid,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  Button
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import SettingsIcon from '@mui/icons-material/Settings';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import DownloadIcon from '@mui/icons-material/Download';

interface ColorScheme {
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

interface OnboardingData {
  platform: string;
  storeUrl: string;
  apiKey: string;
  apiSecret: string;
  storeId: string;
  storeName: string;
  email: string;
  password: string;
  confirmPassword: string;
  enableVirtualTryOn: boolean;
  enableRecommendations: boolean;
  enableFaceShapeDetection: boolean;
  enableStyleScoring: boolean;
  enableProductComparison: boolean;
  enableCustomerMeasurements: boolean;
  widgetPlacement: string;
  widgetStyle: string;
  colorScheme: ColorScheme;
}

interface FinalVerificationProps {
  onboardingData: OnboardingData;
}

const FinalVerification: React.FC<FinalVerificationProps> = ({ onboardingData }) => {
  const getPlatformDisplayName = (platform: string): string => {
    switch (platform) {
      case 'shopify': return 'Shopify';
      case 'magento': return 'Magento';
      case 'woocommerce': return 'WooCommerce';
      case 'bigcommerce': return 'BigCommerce';
      case 'custom': return 'Custom Integration';
      default: return platform;
    }
  };

  const getWidgetPlacementDisplayName = (placement: string): string => {
    switch (placement) {
      case 'product_page': return 'Product Page';
      case 'cart_page': return 'Cart Page';
      case 'floating': return 'Floating Button';
      case 'navigation': return 'Navigation Menu';
      case 'custom': return 'Custom Position';
      default: return placement;
    }
  };

  const getWidgetStyleDisplayName = (style: string): string => {
    switch (style) {
      case 'floating': return 'Floating Button';
      case 'embedded': return 'Embedded Widget';
      case 'modal': return 'Modal Dialog';
      case 'sidebar': return 'Sidebar Panel';
      case 'minimal': return 'Minimal Button';
      default: return style;
    }
  };

  const getNextSteps = (): string[] => {
    switch (onboardingData.platform) {
      case 'shopify':
        return [
          'Install the VARAi app from the Shopify App Store',
          'Configure product attributes for eyewear items',
          'Add the VARAi widget to your product template',
          'Test the integration on your storefront'
        ];
      case 'magento':
        return [
          'Install the VARAi extension from Magento Marketplace',
          'Configure the extension with your API credentials',
          'Map product attributes for eyewear items',
          'Add the VARAi widget to your product pages',
          'Clear cache and test the integration'
        ];
      case 'woocommerce':
        return [
          'Install the VARAi plugin from WordPress Plugin Directory',
          'Activate the plugin in your WordPress admin',
          'Configure the plugin with your API credentials',
          'Add the VARAi shortcode to your product template',
          'Test the integration on your store'
        ];
      case 'bigcommerce':
        return [
          'Install the VARAi app from the BigCommerce App Marketplace',
          'Configure the app with your API credentials',
          'Add the VARAi script to your store theme',
          'Test the integration on your storefront'
        ];
      case 'custom':
        return [
          'Implement the VARAi API endpoints in your platform',
          'Add the VARAi JavaScript SDK to your store',
          'Configure the SDK with your API credentials',
          'Implement the widget UI in your product pages',
          'Test the integration thoroughly'
        ];
      default:
        return [
          'Complete platform-specific integration steps',
          'Configure your product data',
          'Add the VARAi widget to your store',
          'Test the integration'
        ];
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Verify Your Integration Details
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Please review your integration details before completing the onboarding process.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <StorefrontIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Store Information</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <List dense disablePadding>
              <ListItem>
                <ListItemText 
                  primary="Platform" 
                  secondary={getPlatformDisplayName(onboardingData.platform)}
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Store Name" 
                  secondary={onboardingData.storeName}
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Store URL" 
                  secondary={onboardingData.storeUrl}
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItem>
              {onboardingData.storeId && (
                <ListItem>
                  <ListItemText 
                    primary="Store ID" 
                    secondary={onboardingData.storeId}
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AccountCircleIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Account Information</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <List dense disablePadding>
              <ListItem>
                <ListItemText 
                  primary="Email" 
                  secondary={onboardingData.email}
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="API Key" 
                  secondary={onboardingData.apiKey ? '••••••••' + onboardingData.apiKey.slice(-4) : 'Not provided'}
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="API Secret" 
                  secondary="••••••••••••••••"
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SettingsIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Feature Configuration</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <FeatureChip 
                  label="Virtual Try-On" 
                  enabled={onboardingData.enableVirtualTryOn} 
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FeatureChip 
                  label="AI Recommendations" 
                  enabled={onboardingData.enableRecommendations} 
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FeatureChip 
                  label="Face Shape Detection" 
                  enabled={onboardingData.enableFaceShapeDetection} 
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FeatureChip 
                  label="Style Scoring" 
                  enabled={onboardingData.enableStyleScoring} 
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FeatureChip 
                  label="Product Comparison" 
                  enabled={onboardingData.enableProductComparison} 
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FeatureChip 
                  label="Customer Measurements" 
                  enabled={onboardingData.enableCustomerMeasurements} 
                />
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <IntegrationInstructionsIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Widget Configuration</Typography>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Widget Placement
                </Typography>
                <Typography variant="body2">
                  {getWidgetPlacementDisplayName(onboardingData.widgetPlacement)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Widget Style
                </Typography>
                <Typography variant="body2">
                  {getWidgetStyleDisplayName(onboardingData.widgetStyle)}
                </Typography>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ColorLensIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Color Scheme</Typography>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '4px', 
                      bgcolor: onboardingData.colorScheme.primary,
                      border: '1px solid #e0e0e0',
                      mb: 1
                    }} 
                  />
                  <Typography variant="caption">Primary</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '4px', 
                      bgcolor: onboardingData.colorScheme.secondary,
                      border: '1px solid #e0e0e0',
                      mb: 1
                    }} 
                  />
                  <Typography variant="caption">Secondary</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '4px', 
                      bgcolor: onboardingData.colorScheme.background,
                      border: '1px solid #e0e0e0',
                      mb: 1
                    }} 
                  />
                  <Typography variant="caption">Background</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '4px', 
                      bgcolor: onboardingData.colorScheme.text,
                      border: '1px solid #e0e0e0',
                      mb: 1
                    }} 
                  />
                  <Typography variant="caption">Text</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CheckCircleOutlineIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Next Steps</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Alert severity="info" sx={{ mb: 3 }}>
              After completing the onboarding process, you'll need to follow these steps to finish setting up VARAi on your store:
            </Alert>
            
            <List>
              {getNextSteps().map((step, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={step} />
                </ListItem>
              ))}
            </List>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                sx={{ mr: 2 }}
              >
                Download Integration Guide
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

interface FeatureChipProps {
  label: string;
  enabled: boolean;
}

const FeatureChip: React.FC<FeatureChipProps> = ({ label, enabled }) => (
  <Chip
    label={label}
    color={enabled ? 'primary' : 'default'}
    variant={enabled ? 'filled' : 'outlined'}
    sx={{ 
      width: '100%', 
      justifyContent: 'flex-start',
      opacity: enabled ? 1 : 0.7
    }}
  />
);

export default FinalVerification;