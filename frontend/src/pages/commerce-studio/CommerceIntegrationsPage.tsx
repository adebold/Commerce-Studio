import React from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const CommerceIntegrationsPage = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
      <Typography
        variant="h3"
        component="h1"
        sx={{
          fontWeight: 700,
          fontSize: { xs: '2rem', md: '3rem' },
          letterSpacing: '-0.022em',
          mb: 2,
          textAlign: 'center',
        }}
      >
        E-commerce Integrations
      </Typography>
      
      <Typography
        variant="h6"
        sx={{
          fontWeight: 400,
          color: 'text.secondary',
          maxWidth: '800px',
          mx: 'auto',
          mb: 5,
          textAlign: 'center',
        }}
      >
        Seamlessly integrate VARAi's powerful AI-driven eyewear solutions into your e-commerce store
      </Typography>
      
      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia
              component="img"
              height="200"
              image="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgNTAwIDIwMCI+PHJlY3Qgd2lkdGg9IjUwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiM5NWJmNDciLz48cmVjdCB4PSIxNTAiIHk9IjcwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjYwIiByeD0iNSIgcnk9IjUiIGZpbGw9IndoaXRlIi8+PHRleHQgeD0iMjUwIiB5PSIxMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiM5NWJmNDciIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPlNIT1BJRlk8L3RleHQ+PC9zdmc+"
              alt="Shopify Integration"
            />
            <CardContent sx={{ flexGrow: 1, p: 3 }}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                Shopify Integration
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Add our AI-powered eyewear recommendation app to your Shopify store and boost conversion rates with personalized frame suggestions.
              </Typography>
              <List>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: '36px' }}>
                    <CheckCircleIcon sx={{ color: '#2563eb' }} />
                  </ListItemIcon>
                  <ListItemText primary="Easy installation via Shopify App Store" />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: '36px' }}>
                    <CheckCircleIcon sx={{ color: '#2563eb' }} />
                  </ListItemIcon>
                  <ListItemText primary="Automatic inventory synchronization" />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: '36px' }}>
                    <CheckCircleIcon sx={{ color: '#2563eb' }} />
                  </ListItemIcon>
                  <ListItemText primary="Customizable widget styles to match your brand" />
                </ListItem>
              </List>
              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Button variant="outlined" sx={{ 
                  borderColor: '#2563eb',
                  color: '#2563eb',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#1d4ed8',
                    backgroundColor: 'rgba(37, 99, 235, 0.05)'
                  }
                }}>
                  View Documentation
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia
              component="img"
              height="200"
              image="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgNTAwIDIwMCI+PHJlY3Qgd2lkdGg9IjUwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiM5NjU4OGEiLz48cmVjdCB4PSIxNTAiIHk9IjcwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjYwIiByeD0iNSIgcnk9IjUiIGZpbGw9IndoaXRlIi8+PHRleHQgeD0iMjUwIiB5PSIxMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiM5NjU4OGEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPldPT0NPTU1FUkNFPC90ZXh0Pjwvc3ZnPg=="
              alt="WooCommerce Integration"
            />
            <CardContent sx={{ flexGrow: 1, p: 3 }}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                WooCommerce Integration
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Integrate our Frame Finder and style recommendation tools directly into your WordPress site with our WooCommerce plugin.
              </Typography>
              <List>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: '36px' }}>
                    <CheckCircleIcon sx={{ color: '#2563eb' }} />
                  </ListItemIcon>
                  <ListItemText primary="Simple WP plugin installation" />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: '36px' }}>
                    <CheckCircleIcon sx={{ color: '#2563eb' }} />
                  </ListItemIcon>
                  <ListItemText primary="Compatible with major WooCommerce themes" />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: '36px' }}>
                    <CheckCircleIcon sx={{ color: '#2563eb' }} />
                  </ListItemIcon>
                  <ListItemText primary="Shortcodes for custom placement" />
                </ListItem>
              </List>
              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Button variant="outlined" sx={{ 
                  borderColor: '#2563eb',
                  color: '#2563eb',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#1d4ed8',
                    backgroundColor: 'rgba(37, 99, 235, 0.05)'
                  }
                }}>
                  View Documentation
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Box sx={{ mb: 8 }}>
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontWeight: 600,
            mb: 4,
            textAlign: 'center',
          }}
        >
          How Our E-commerce Integration Works
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, height: '100%', backgroundColor: '#f8fafc', borderRadius: 2 }}>
              <Box sx={{ 
                width: 60, 
                height: 60, 
                borderRadius: '50%', 
                backgroundColor: '#eff6ff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mb: 2,
                color: '#2563eb',
                fontWeight: 'bold',
                fontSize: '1.5rem'
              }}>
                1
              </Box>
              <Typography variant="h6" gutterBottom>Install the Plugin</Typography>
              <Typography variant="body2" color="text.secondary">
                Install our plugin through your e-commerce platform's app store or via direct download. Configuration takes just minutes.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, height: '100%', backgroundColor: '#f8fafc', borderRadius: 2 }}>
              <Box sx={{ 
                width: 60, 
                height: 60, 
                borderRadius: '50%', 
                backgroundColor: '#eff6ff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mb: 2,
                color: '#2563eb',
                fontWeight: 'bold',
                fontSize: '1.5rem'
              }}>
                2
              </Box>
              <Typography variant="h6" gutterBottom>Sync Your Inventory</Typography>
              <Typography variant="body2" color="text.secondary">
                Our platform automatically syncs with your product catalog, categorizing and analyzing your eyewear inventory.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, height: '100%', backgroundColor: '#f8fafc', borderRadius: 2 }}>
              <Box sx={{ 
                width: 60, 
                height: 60, 
                borderRadius: '50%', 
                backgroundColor: '#eff6ff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mb: 2,
                color: '#2563eb',
                fontWeight: 'bold',
                fontSize: '1.5rem'
              }}>
                3
              </Box>
              <Typography variant="h6" gutterBottom>Customize & Deploy</Typography>
              <Typography variant="body2" color="text.secondary">
                Set up widgets on your product pages, configure styling options, and launch AI-powered recommendations to your customers.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      
      <Box sx={{ mb: 6, p: 4, backgroundColor: '#f8fafc', borderRadius: 2 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
              Ready to integrate?
            </Typography>
            <Typography paragraph>
              Our platform offers the easiest integration in the industry. You don't need to be a developer to get started—our team handles the technical aspects, ensuring a smooth setup.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#2563eb',
                  '&:hover': {
                    backgroundColor: '#1d4ed8',
                  },
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  py: 1
                }}
                component="a"
                href="/admin/merchant-onboarding"
              >
                Start Onboarding
              </Button>
              <Button
                variant="outlined"
                sx={{
                  borderColor: '#2563eb',
                  color: '#2563eb',
                  '&:hover': {
                    borderColor: '#1d4ed8',
                    backgroundColor: 'rgba(37, 99, 235, 0.05)'
                  },
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  mr: 2
                }}
              >
                Contact Sales
              </Button>
              <Button
                variant="outlined"
                sx={{
                  borderColor: '#2563eb',
                  color: '#2563eb',
                  '&:hover': {
                    borderColor: '#1d4ed8',
                    backgroundColor: 'rgba(37, 99, 235, 0.05)'
                  },
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  py: 1
                }}
                component="a"
                href="/admin/merchant-onboarding-analytics"
              >
                View Analytics
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box 
              component="img"
              src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgNTAwIDMwMCI+PHJlY3Qgd2lkdGg9IjUwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNlZmY2ZmYiLz48cmVjdCB4PSI1MCIgeT0iNTAiIHdpZHRoPSIxODAiIGhlaWdodD0iMjAwIiBmaWxsPSJ3aGl0ZSIgc3Ryb2tlPSIjZTVlN2ViIiBzdHJva2Utd2lkdGg9IjIiLz48cmVjdCB4PSIyNzAiIHk9IjUwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjIwMCIgZmlsbD0id2hpdGUiIHN0cm9rZT0iI2U1ZTdlYiIgc3Ryb2tlLXdpZHRoPSIyIi8+PGxpbmUgeDE9IjExMCIgeTE9IjgwIiB4Mj0iMTcwIiB5Mj0iODAiIHN0cm9rZT0iIzJjNmJlZCIgc3Ryb2tlLXdpZHRoPSIyIi8+PGxpbmUgeDE9IjExMCIgeTE9IjEwMCIgeDI9IjE1MCIgeTI9IjEwMCIgc3Ryb2tlPSIjMjU2M2ViIiBzdHJva2Utd2lkdGg9IjIiLz48bGluZSB4MT0iMTEwIiB5MT0iMTIwIiB4Mj0iMTYwIiB5Mj0iMTIwIiBzdHJva2U9IiMyNTYzZWIiIHN0cm9rZS13aWR0aD0iMiIvPjxjaXJjbGUgY3g9IjgwIiBjeT0iMTEwIiByPSIyMCIgZmlsbD0iI2U1ZTdlYiIvPjxyZWN0IHg9IjkwIiB5PSIxNTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMzAiIHJ4PSI1IiByeT0iNSIgZmlsbD0iIzI1NjNlYiIvPjxsaW5lIHgxPSIzMzAiIHkxPSI4MCIgeDI9IjM5MCIgeTI9IjgwIiBzdHJva2U9IiMyNTYzZWIiIHN0cm9rZS13aWR0aD0iMiIvPjxsaW5lIHgxPSIzMzAiIHkxPSIxMDAiIHgyPSIzNzAiIHkyPSIxMDAiIHN0cm9rZT0iIzI1NjNlYiIgc3Ryb2tlLXdpZHRoPSIyIi8+PGxpbmUgeDE9IjMzMCIgeTE9IjEyMCIgeDI9IjM4MCIgeTI9IjEyMCIgc3Ryb2tlPSIjMjU2M2ViIiBzdHJva2Utd2lkdGg9IjIiLz48Y2lyY2xlIGN4PSIzMDAiIGN5PSIxMTAiIHI9IjIwIiBmaWxsPSIjZTVlN2ViIi8+PHJlY3QgeD0iMzEwIiB5PSIxNTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMzAiIHJ4PSI1IiByeT0iNSIgZmlsbD0iIzI1NjNlYiIvPjxsaW5lIHgxPSIyMzAiIHkxPSIxNTAiIHgyPSIyNzAiIHkyPSIxNTAiIHN0cm9rZT0iIzI1NjNlYiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtZGFzaGFycmF5PSI1LDUiLz48cG9seWdvbiBwb2ludHM9IjI1Miw2NyAyMzAsMTMzIDI3MCwxMzMiIGZpbGw9IiMyNTYzZWIiLz48L3N2Zz4="
              alt="Integration Diagram"
              sx={{ 
                width: '100%', 
                maxHeight: '300px',
                objectFit: 'contain',
                borderRadius: 2
              }}
            />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default CommerceIntegrationsPage;
