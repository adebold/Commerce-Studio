import React from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea
} from '@mui/material';

interface PlatformSelectionProps {
  selectedPlatform: string;
  onPlatformSelect: (platform: string) => void;
}

// Platform data with logos and descriptions
const platforms = [
  {
    id: 'shopify',
    name: 'Shopify',
    logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgNTAwIDIwMCI+PHJlY3Qgd2lkdGg9IjUwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiM5NWJmNDciLz48cmVjdCB4PSIxNTAiIHk9IjcwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjYwIiByeD0iNSIgcnk9IjUiIGZpbGw9IndoaXRlIi8+PHRleHQgeD0iMjUwIiB5PSIxMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiM5NWJmNDciIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPlNIT1BJRlk8L3RleHQ+PC9zdmc+',
    description: 'Integrate with Shopify to offer virtual try-on and AI-powered recommendations to your customers.',
    features: [
      'Easy installation via Shopify App Store',
      'Automatic inventory synchronization',
      'Customizable widget styles'
    ]
  },
  {
    id: 'magento',
    name: 'Magento',
    logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgNTAwIDIwMCI+PHJlY3Qgd2lkdGg9IjUwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmMjZiMmEiLz48cmVjdCB4PSIxNTAiIHk9IjcwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjYwIiByeD0iNSIgcnk9IjUiIGZpbGw9IndoaXRlIi8+PHRleHQgeD0iMjUwIiB5PSIxMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNmMjZiMmEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPk1BR0VOVE88L3RleHQ+PC9zdmc+',
    description: 'Add VARAi\'s eyewear technology to your Magento store with our powerful extension.',
    features: [
      'Seamless integration with Magento 2.x',
      'Advanced product attribute mapping',
      'Compatible with custom themes'
    ]
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgNTAwIDIwMCI+PHJlY3Qgd2lkdGg9IjUwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiM5NjU4OGEiLz48cmVjdCB4PSIxNTAiIHk9IjcwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjYwIiByeD0iNSIgcnk9IjUiIGZpbGw9IndoaXRlIi8+PHRleHQgeD0iMjUwIiB5PSIxMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiM5NjU4OGEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPldPT0NPTU1FUkNFPC90ZXh0Pjwvc3ZnPg==',
    description: 'Integrate our Frame Finder and style recommendation tools directly into your WordPress site.',
    features: [
      'Simple WP plugin installation',
      'Compatible with major WooCommerce themes',
      'Shortcodes for custom placement'
    ]
  },
  {
    id: 'bigcommerce',
    name: 'BigCommerce',
    logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgNTAwIDIwMCI+PHJlY3Qgd2lkdGg9IjUwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMzNDM0MzQiLz48cmVjdCB4PSIxNTAiIHk9IjcwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjYwIiByeD0iNSIgcnk9IjUiIGZpbGw9IndoaXRlIi8+PHRleHQgeD0iMjUwIiB5PSIxMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMzNDM0MzQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPkJJR0NPTU1FUkNFPC90ZXh0Pjwvc3ZnPg==',
    description: 'Enhance your BigCommerce store with VARAi\'s AI-powered eyewear solutions.',
    features: [
      'Quick installation through BigCommerce App Marketplace',
      'Comprehensive analytics dashboard',
      'Flexible widget placement options'
    ]
  },
  {
    id: 'custom',
    name: 'Custom Integration',
    logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgNTAwIDIwMCI+PHJlY3Qgd2lkdGg9IjUwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiM2MjYyNjIiLz48cmVjdCB4PSIxNTAiIHk9IjcwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjYwIiByeD0iNSIgcnk9IjUiIGZpbGw9IndoaXRlIi8+PHRleHQgeD0iMjUwIiB5PSIxMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiM2MjYyNjIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPkNVU1RPTTwvdGV4dD48L3N2Zz4=',
    description: 'Build a custom integration with our API for your unique e-commerce platform.',
    features: [
      'RESTful API access',
      'Comprehensive documentation',
      'Developer support'
    ]
  }
];

const PlatformSelection: React.FC<PlatformSelectionProps> = ({ selectedPlatform, onPlatformSelect }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Your E-commerce Platform
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Choose the e-commerce platform you use for your online store. We'll customize the onboarding process based on your selection.
      </Typography>
      
      <Grid container spacing={3}>
        {platforms.map((platform) => (
          <Grid item xs={12} sm={6} md={4} key={platform.id}>
            <Card 
              elevation={3}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                border: selectedPlatform === platform.id ? '2px solid #3C64F4' : '2px solid transparent',
                backgroundColor: selectedPlatform === platform.id ? 'rgba(60, 100, 244, 0.05)' : 'white',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                }
              }}
              onClick={() => onPlatformSelect(platform.id)}
              data-testid={`platform-${platform.id}`}
            >
              <CardActionArea sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={platform.logo}
                  alt={`${platform.name} logo`}
                  sx={{ objectFit: 'contain', p: 2 }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div" align="center">
                    {platform.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {platform.description}
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                    {platform.features.map((feature, index) => (
                      <Typography component="li" variant="body2" key={index} sx={{ mb: 0.5 }}>
                        {feature}
                      </Typography>
                    ))}
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PlatformSelection;