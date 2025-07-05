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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StorefrontIcon from '@mui/icons-material/Storefront';
import InventoryIcon from '@mui/icons-material/Inventory';
import InsightsIcon from '@mui/icons-material/Insights';
import SyncIcon from '@mui/icons-material/Sync';

const SkuGeniePage = () => {
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
        SKU Genie: Multi-Channel Sales
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
        Manage inventory across all your sales channels with real-time synchronization and AI-powered optimization
      </Typography>
      
      <Box 
        sx={{ 
          position: 'relative', 
          mb: 8, 
          p: 4, 
          borderRadius: 3, 
          backgroundColor: '#f0f9ff',
          overflow: 'hidden'
        }}
      >
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600, position: 'relative', zIndex: 2 }}>
              Unify Your Online & In-Store Experience
            </Typography>
            <Typography paragraph sx={{ fontSize: '1.1rem', position: 'relative', zIndex: 2 }}>
              SKU Genie seamlessly connects your brick-and-mortar inventory with e-commerce platforms, ensuring perfect synchronization across all customer touchpoints.
            </Typography>
            
            <List sx={{ position: 'relative', zIndex: 2 }}>
              <ListItem>
                <ListItemIcon><SyncIcon sx={{ color: '#2563eb' }} /></ListItemIcon>
                <ListItemText 
                  primary="Real-time inventory synchronization" 
                  secondary="Changes reflect across all channels immediately" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><StorefrontIcon sx={{ color: '#2563eb' }} /></ListItemIcon>
                <ListItemText 
                  primary="Multi-channel support" 
                  secondary="Connect Shopify, WooCommerce, Amazon, and in-store POS" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><InsightsIcon sx={{ color: '#2563eb' }} /></ListItemIcon>
                <ListItemText 
                  primary="Intelligent analytics" 
                  secondary="Sales data across all channels in one dashboard" 
                />
              </ListItem>
            </List>
            
            <Box sx={{ mt: 4, display: 'flex', gap: 2, position: 'relative', zIndex: 2 }}>
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
              >
                Request Demo
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
              >
                Learn More
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6} sx={{ position: 'relative', zIndex: 2 }}>
            <Box 
              component="img"
              src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgNDAwIDMwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNmMGY5ZmYiIGZpbGwtb3BhY2l0eT0iMCIvPjxwYXRoIGQ9Ik0yODAgMTIwdjEyMGgtMjQwdi0xMjBoMjQweiIgZmlsbD0id2hpdGUiIHN0cm9rZT0iIzI1NjNlYiIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBhdGggZD0iTTMwMCA4MHYxMjBoLTI0MHYtMTIwaDI0MHoiIGZpbGw9IndoaXRlIiBzdHJva2U9IiMyNTYzZWIiIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik0zNjAgNDB2MTIwaC0yNDB2LTEyMGgyNDB6IiBmaWxsPSJ3aGl0ZSIgc3Ryb2tlPSIjMjU2M2ViIiBzdHJva2Utd2lkdGg9IjIiLz48cGF0aCBkPSJNMzIwIDYwdjgwaDIwMHYtODBoLTIwMHoiIGZpbGw9IndoaXRlIiBzdHJva2U9IiMyNTYzZWIiIHN0cm9rZS13aWR0aD0iMiIvPjxjaXJjbGUgY3g9IjE3MCIgY3k9IjgwIiByPSIxMCIgZmlsbD0iIzI1NjNlYiIvPjxjaXJjbGUgY3g9IjE1MCIgY3k9IjEyMCIgcj0iMTAiIGZpbGw9IiMyNTYzZWIiLz48Y2lyY2xlIGN4PSIzNjAiIGN5PSI5MCIgcj0iMTAiIGZpbGw9IiMyNTYzZWIiLz48Y2lyY2xlIGN4PSIxMzAiIGN5PSIxNjAiIHI9IjEwIiBmaWxsPSIjMjU2M2ViIi8+PHBhdGggZD0iTTE3MCA4MGwyMC00MCIgc3Ryb2tlPSIjMjU2M2ViIiBzdHJva2Utd2lkdGg9IjIiLz48cGF0aCBkPSJNMTUwIDEyMGw2MC02MCIgc3Ryb2tlPSIjMjU2M2ViIiBzdHJva2Utd2lkdGg9IjIiLz48cGF0aCBkPSJNMzYwIDkwbDQwLTQwIiBzdHJva2U9IiMyNTYzZWIiIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik0xNzAgODBsMTMwIDEwIiBzdHJva2U9IiMyNTYzZWIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWRhc2hhcnJheT0iNSA1Ii8+PHBhdGggZD0iTTE1MCAxMjBsMjEwLTMwIiBzdHJva2U9IiMyNTYzZWIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWRhc2hhcnJheT0iNSA1Ii8+PHBhdGggZD0iTTEzMCAxNjBsMjMwLTcwIiBzdHJva2U9IiMyNTYzZWIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWRhc2hhcnJheT0iNSA1Ii8+PHRleHQgeD0iMTU1IiB5PSIxMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzMzMyI+SW4tU3RvcmU8L3RleHQ+PHRleHQgeD0iMzMwIiB5PSIxMTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzMzMyI+V2ViIFN0b3JlPC90ZXh0Pjx0ZXh0IHg9IjI4MCIgeT0iNzAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzMzMyI+TWFya2V0cGxhY2VzPC90ZXh0Pjx0ZXh0IHg9IjEzMCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiMzMzMiPlBPUzwvdGV4dD48dGV4dCB4PSIzODAiIHk9IjkwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiMzMzMiPlNLVSBHZW5pZTwvdGV4dD48L3N2Zz4="
              alt="SKU Genie Multi-Channel Illustration"
              sx={{ 
                width: '100%', 
                maxHeight: '350px',
                objectFit: 'contain',
                borderRadius: 2
              }}
            />
          </Grid>
        </Grid>
      </Box>
      
      <Typography
        variant="h4"
        component="h2"
        sx={{
          fontWeight: 600,
          mb: 4,
          textAlign: 'center',
        }}
      >
        Key Features
      </Typography>
      
      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ backgroundColor: '#2563eb', height: 8, width: '100%', position: 'absolute', top: 0 }}></Box>
            <CardContent sx={{ pt: 4 }}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                <InventoryIcon sx={{ fontSize: 40, color: '#2563eb' }} />
              </Box>
              <Typography variant="h5" component="h3" textAlign="center" gutterBottom>
                Inventory Management
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph textAlign="center">
                Centralized inventory control across all channels with real-time updates and synchronization.
              </Typography>
              <List>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: '36px' }}>
                    <CheckCircleIcon fontSize="small" sx={{ color: '#2563eb' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Auto stock adjustments" 
                    primaryTypographyProps={{ fontSize: '0.9rem' }}
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: '36px' }}>
                    <CheckCircleIcon fontSize="small" sx={{ color: '#2563eb' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Low stock alerts" 
                    primaryTypographyProps={{ fontSize: '0.9rem' }}
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: '36px' }}>
                    <CheckCircleIcon fontSize="small" sx={{ color: '#2563eb' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Batch inventory updates" 
                    primaryTypographyProps={{ fontSize: '0.9rem' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ backgroundColor: '#8b5cf6', height: 8, width: '100%', position: 'absolute', top: 0 }}></Box>
            <CardContent sx={{ pt: 4 }}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                <StorefrontIcon sx={{ fontSize: 40, color: '#8b5cf6' }} />
              </Box>
              <Typography variant="h5" component="h3" textAlign="center" gutterBottom>
                Channel Integration
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph textAlign="center">
                Connect seamlessly with major e-commerce platforms, marketplaces, and in-store POS systems.
              </Typography>
              <List>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: '36px' }}>
                    <CheckCircleIcon fontSize="small" sx={{ color: '#8b5cf6' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Native API connections" 
                    primaryTypographyProps={{ fontSize: '0.9rem' }}
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: '36px' }}>
                    <CheckCircleIcon fontSize="small" sx={{ color: '#8b5cf6' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Automated listing creation" 
                    primaryTypographyProps={{ fontSize: '0.9rem' }}
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: '36px' }}>
                    <CheckCircleIcon fontSize="small" sx={{ color: '#8b5cf6' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Cross-channel promotions" 
                    primaryTypographyProps={{ fontSize: '0.9rem' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ backgroundColor: '#10b981', height: 8, width: '100%', position: 'absolute', top: 0 }}></Box>
            <CardContent sx={{ pt: 4 }}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                <InsightsIcon sx={{ fontSize: 40, color: '#10b981' }} />
              </Box>
              <Typography variant="h5" component="h3" textAlign="center" gutterBottom>
                Analytics & Insights
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph textAlign="center">
                Comprehensive sales and inventory reporting with AI-driven forecasting.
              </Typography>
              <List>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: '36px' }}>
                    <CheckCircleIcon fontSize="small" sx={{ color: '#10b981' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Cross-channel performance" 
                    primaryTypographyProps={{ fontSize: '0.9rem' }}
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: '36px' }}>
                    <CheckCircleIcon fontSize="small" sx={{ color: '#10b981' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Demand forecasting" 
                    primaryTypographyProps={{ fontSize: '0.9rem' }}
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: '36px' }}>
                    <CheckCircleIcon fontSize="small" sx={{ color: '#10b981' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Customizable dashboards" 
                    primaryTypographyProps={{ fontSize: '0.9rem' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ backgroundColor: '#f59e0b', height: 8, width: '100%', position: 'absolute', top: 0 }}></Box>
            <CardContent sx={{ pt: 4 }}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                <SyncIcon sx={{ fontSize: 40, color: '#f59e0b' }} />
              </Box>
              <Typography variant="h5" component="h3" textAlign="center" gutterBottom>
                Synchronization
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph textAlign="center">
                Real-time updates across all sales channels with robust conflict resolution.
              </Typography>
              <List>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: '36px' }}>
                    <CheckCircleIcon fontSize="small" sx={{ color: '#f59e0b' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Bidirectional syncing" 
                    primaryTypographyProps={{ fontSize: '0.9rem' }}
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: '36px' }}>
                    <CheckCircleIcon fontSize="small" sx={{ color: '#f59e0b' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Error handling" 
                    primaryTypographyProps={{ fontSize: '0.9rem' }}
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: '36px' }}>
                    <CheckCircleIcon fontSize="small" sx={{ color: '#f59e0b' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Offline capabilities" 
                    primaryTypographyProps={{ fontSize: '0.9rem' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Divider sx={{ mb: 6 }} />
      
      <Grid container spacing={5} alignItems="center" sx={{ mb: 6 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
            Supported Platforms
          </Typography>
          <Typography paragraph>
            SKU Genie integrates with all major e-commerce platforms, marketplaces, and point-of-sale systems, providing a true omnichannel experience.
          </Typography>
          
          <Box sx={{ my: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              E-Commerce Platforms
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              <Chip label="Shopify" sx={{ bgcolor: '#95bf47', color: 'white' }} />
              <Chip label="WooCommerce" sx={{ bgcolor: '#96588a', color: 'white' }} />
              <Chip label="Magento" sx={{ bgcolor: '#f26322', color: 'white' }} />
              <Chip label="BigCommerce" sx={{ bgcolor: '#12a0c7', color: 'white' }} />
              <Chip label="Squarespace" sx={{ bgcolor: '#000000', color: 'white' }} />
            </Box>
            
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Marketplaces
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              <Chip label="Amazon" sx={{ bgcolor: '#ff9900', color: 'white' }} />
              <Chip label="eBay" sx={{ bgcolor: '#e53238', color: 'white' }} />
              <Chip label="Walmart" sx={{ bgcolor: '#0071ce', color: 'white' }} />
              <Chip label="Etsy" sx={{ bgcolor: '#f27224', color: 'white' }} />
            </Box>
            
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              POS Systems
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip label="Square" sx={{ bgcolor: '#3e4348', color: 'white' }} />
              <Chip label="Lightspeed" sx={{ bgcolor: '#85754e', color: 'white' }} />
              <Chip label="Shopify POS" sx={{ bgcolor: '#95bf47', color: 'white' }} />
              <Chip label="Vend" sx={{ bgcolor: '#4ea79b', color: 'white' }} />
              <Chip label="OfficeMate" sx={{ bgcolor: '#007bff', color: 'white' }} />
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 4, bgcolor: '#f8fafc', borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Integration Process
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  backgroundColor: '#2563eb', 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}>
                  1
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>Connect Your Platforms</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Set up API connections to your e-commerce, marketplace, and POS systems
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  backgroundColor: '#2563eb', 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}>
                  2
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>Configure Sync Settings</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Decide what data to sync and how often updates should occur
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  backgroundColor: '#2563eb', 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}>
                  3
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>Map Your Products</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create relationships between products across different channels
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  backgroundColor: '#2563eb', 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}>
                  4
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>Go Live</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Start syncing inventory and sales data across all channels
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ mt: 4, textAlign: 'center' }}>
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
              >
                Schedule Integration
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SkuGeniePage;
