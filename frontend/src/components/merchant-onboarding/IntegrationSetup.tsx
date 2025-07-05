import React, { useState } from 'react';
import { 
  Typography, 
  Box, 
  TextField, 
  Grid,
  Paper,
  Switch,
  FormControlLabel,
  FormGroup,
  Divider,
  InputAdornment,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ColorLensIcon from '@mui/icons-material/ColorLens';

interface ColorScheme {
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

interface IntegrationSetupProps {
  platform: string;
  apiKey: string;
  apiSecret: string;
  enableVirtualTryOn: boolean;
  enableRecommendations: boolean;
  enableFaceShapeDetection: boolean;
  enableStyleScoring: boolean;
  enableProductComparison: boolean;
  enableCustomerMeasurements: boolean;
  widgetPlacement: string;
  widgetStyle: string;
  colorScheme: ColorScheme;
  onInputChange: (field: string, value: string | boolean | ColorScheme) => void;
}

const IntegrationSetup: React.FC<IntegrationSetupProps> = ({ 
  platform,
  apiKey,
  apiSecret,
  enableVirtualTryOn,
  enableRecommendations,
  enableFaceShapeDetection,
  enableStyleScoring,
  enableProductComparison,
  enableCustomerMeasurements,
  widgetPlacement,
  widgetStyle,
  colorScheme,
  onInputChange
}) => {
  const [showApiSecret, setShowApiSecret] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const handleToggleApiSecretVisibility = () => {
    setShowApiSecret(!showApiSecret);
  };

  const handleColorChange = (colorType: keyof ColorScheme, value: string) => {
    onInputChange('colorScheme', {
      ...colorScheme,
      [colorType]: value
    });
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Platform-specific API credential help
  const getApiCredentialHelp = () => {
    switch (platform) {
      case 'shopify':
        return {
          keyLabel: "Shopify API Key",
          keyHelp: "Create a private app in your Shopify admin to get your API key",
          secretLabel: "Shopify API Secret",
          secretHelp: "The API secret from your Shopify private app"
        };
      case 'magento':
        return {
          keyLabel: "Magento Integration Token",
          keyHelp: "Create an integration in your Magento admin to get your token",
          secretLabel: "Magento Secret Key",
          secretHelp: "The secret key for your Magento integration"
        };
      case 'woocommerce':
        return {
          keyLabel: "WooCommerce Consumer Key",
          keyHelp: "Create API keys in WooCommerce > Settings > Advanced > REST API",
          secretLabel: "WooCommerce Consumer Secret",
          secretHelp: "The consumer secret from your WooCommerce REST API keys"
        };
      case 'bigcommerce':
        return {
          keyLabel: "BigCommerce API Token",
          keyHelp: "Create API credentials in your BigCommerce admin under Advanced Settings > API Accounts",
          secretLabel: "BigCommerce Client Secret",
          secretHelp: "The client secret from your BigCommerce API account"
        };
      case 'custom':
        return {
          keyLabel: "API Key",
          keyHelp: "Your custom platform API key",
          secretLabel: "API Secret",
          secretHelp: "Your custom platform API secret"
        };
      default:
        return {
          keyLabel: "API Key",
          keyHelp: "Your platform API key",
          secretLabel: "API Secret",
          secretHelp: "Your platform API secret"
        };
    }
  };

  const apiHelp = getApiCredentialHelp();

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Configure Your Integration
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Set up your VARAi integration with your {platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : 'e-commerce'} store.
      </Typography>
      
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        variant="fullWidth" 
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="API Credentials" />
        <Tab label="Features" />
        <Tab label="Appearance" />
      </Tabs>
      
      {activeTab === 0 && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            API Credentials
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            These credentials allow VARAi to securely connect to your store.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label={apiHelp.keyLabel}
                variant="outlined"
                fullWidth
                required
                value={apiKey}
                onChange={(e) => onInputChange('apiKey', e.target.value)}
                placeholder="Enter your API key"
                helperText={apiHelp.keyHelp}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title={apiHelp.keyHelp}>
                        <IconButton edge="end" size="small">
                          <HelpOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
                data-testid="api-key-input"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label={apiHelp.secretLabel}
                variant="outlined"
                fullWidth
                required
                type={showApiSecret ? 'text' : 'password'}
                value={apiSecret}
                onChange={(e) => onInputChange('apiSecret', e.target.value)}
                placeholder="Enter your API secret"
                helperText={apiHelp.secretHelp}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle api secret visibility"
                        onClick={handleToggleApiSecretVisibility}
                        edge="end"
                      >
                        {showApiSecret ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                data-testid="api-secret-input"
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Note:</strong> You can find these credentials in your {platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : 'e-commerce'} admin panel. 
              If you don't have them yet, you'll need to create them before proceeding.
            </Typography>
          </Box>
        </Paper>
      )}
      
      {activeTab === 1 && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Features Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select which VARAi features you want to enable for your store.
          </Typography>
          
          <FormGroup>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={enableVirtualTryOn}
                      onChange={(e) => onInputChange('enableVirtualTryOn', e.target.checked)}
                      color="primary"
                      data-testid="virtual-try-on-switch"
                    />
                  }
                  label="Virtual Try-On"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                  Allow customers to virtually try on eyewear frames
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={enableRecommendations}
                      onChange={(e) => onInputChange('enableRecommendations', e.target.checked)}
                      color="primary"
                      data-testid="recommendations-switch"
                    />
                  }
                  label="AI Recommendations"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                  Show personalized frame recommendations to customers
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={enableFaceShapeDetection}
                      onChange={(e) => onInputChange('enableFaceShapeDetection', e.target.checked)}
                      color="primary"
                      data-testid="face-shape-switch"
                    />
                  }
                  label="Face Shape Detection"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                  Analyze customer face shape for better recommendations
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={enableStyleScoring}
                      onChange={(e) => onInputChange('enableStyleScoring', e.target.checked)}
                      color="primary"
                      data-testid="style-scoring-switch"
                    />
                  }
                  label="Style Scoring"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                  Rate how well frames match customer style preferences
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={enableProductComparison}
                      onChange={(e) => onInputChange('enableProductComparison', e.target.checked)}
                      color="primary"
                      data-testid="product-comparison-switch"
                    />
                  }
                  label="Product Comparison"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                  Allow customers to compare multiple frames side by side
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={enableCustomerMeasurements}
                      onChange={(e) => onInputChange('enableCustomerMeasurements', e.target.checked)}
                      color="primary"
                      data-testid="customer-measurements-switch"
                    />
                  }
                  label="Customer Measurements"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                  Capture and store customer facial measurements for better fit
                </Typography>
              </Grid>
            </Grid>
          </FormGroup>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Widget Configuration
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="widget-placement-label">Widget Placement</InputLabel>
                <Select
                  labelId="widget-placement-label"
                  id="widget-placement"
                  value={widgetPlacement}
                  onChange={(e) => onInputChange('widgetPlacement', e.target.value)}
                  label="Widget Placement"
                  data-testid="widget-placement-select"
                >
                  <MenuItem value="product_page">Product Page</MenuItem>
                  <MenuItem value="cart_page">Cart Page</MenuItem>
                  <MenuItem value="floating">Floating Button</MenuItem>
                  <MenuItem value="navigation">Navigation Menu</MenuItem>
                  <MenuItem value="custom">Custom Position</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="widget-style-label">Widget Style</InputLabel>
                <Select
                  labelId="widget-style-label"
                  id="widget-style"
                  value={widgetStyle}
                  onChange={(e) => onInputChange('widgetStyle', e.target.value)}
                  label="Widget Style"
                  data-testid="widget-style-select"
                >
                  <MenuItem value="floating">Floating Button</MenuItem>
                  <MenuItem value="embedded">Embedded Widget</MenuItem>
                  <MenuItem value="modal">Modal Dialog</MenuItem>
                  <MenuItem value="sidebar">Sidebar Panel</MenuItem>
                  <MenuItem value="minimal">Minimal Button</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {activeTab === 2 && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Appearance Customization
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Customize the look and feel of the VARAi widgets to match your brand.
          </Typography>
          
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="color-scheme-content"
              id="color-scheme-header"
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ColorLensIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Color Scheme</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Primary Color"
                    variant="outlined"
                    fullWidth
                    value={colorScheme.primary}
                    onChange={(e) => handleColorChange('primary', e.target.value)}
                    placeholder="#3C64F4"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '4px',
                              bgcolor: colorScheme.primary,
                              border: '1px solid #e0e0e0'
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    data-testid="primary-color-input"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Secondary Color"
                    variant="outlined"
                    fullWidth
                    value={colorScheme.secondary}
                    onChange={(e) => handleColorChange('secondary', e.target.value)}
                    placeholder="#FF5C35"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '4px',
                              bgcolor: colorScheme.secondary,
                              border: '1px solid #e0e0e0'
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    data-testid="secondary-color-input"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Background Color"
                    variant="outlined"
                    fullWidth
                    value={colorScheme.background}
                    onChange={(e) => handleColorChange('background', e.target.value)}
                    placeholder="#FFFFFF"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '4px',
                              bgcolor: colorScheme.background,
                              border: '1px solid #e0e0e0'
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    data-testid="background-color-input"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Text Color"
                    variant="outlined"
                    fullWidth
                    value={colorScheme.text}
                    onChange={(e) => handleColorChange('text', e.target.value)}
                    placeholder="#333333"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '4px',
                              bgcolor: colorScheme.text,
                              border: '1px solid #e0e0e0'
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    data-testid="text-color-input"
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Preview:</strong> The colors you select will be applied to all VARAi widgets on your store.
                </Typography>
                <Box 
                  sx={{ 
                    mt: 2, 
                    p: 2, 
                    bgcolor: colorScheme.background, 
                    borderRadius: 1,
                    border: '1px solid #e0e0e0',
                    color: colorScheme.text
                  }}
                >
                  <Typography variant="subtitle1" sx={{ color: colorScheme.primary, mb: 1 }}>
                    Widget Header
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    This is how your widget text will appear to customers.
                  </Typography>
                  <Box 
                    sx={{ 
                      display: 'inline-block',
                      px: 2, 
                      py: 1, 
                      bgcolor: colorScheme.primary,
                      color: '#fff',
                      borderRadius: 1
                    }}
                  >
                    Primary Button
                  </Box>
                  <Box 
                    sx={{ 
                      display: 'inline-block',
                      px: 2, 
                      py: 1, 
                      bgcolor: colorScheme.secondary,
                      color: '#fff',
                      borderRadius: 1,
                      ml: 2
                    }}
                  >
                    Secondary Button
                  </Box>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Paper>
      )}
    </Box>
  );
};

export default IntegrationSetup;