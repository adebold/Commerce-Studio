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
  Divider
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const RetailIntegrationsPage = () => {
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
        Retail PMS Integrations
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
        Integrate VARAi's AI eyewear solutions with your optical practice management system for streamlined operations
      </Typography>
      
      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ backgroundColor: '#007bff', height: 12 }}></Box>
            <CardContent sx={{ flexGrow: 1, p: 3 }}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                OfficeMate Integration
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Seamlessly connect VARAi with Eyefinity's OfficeMate to synchronize patient data, frame inventory, and order management.
              </Typography>
              <List>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: '36px' }}>
                    <CheckCircleIcon sx={{ color: '#2563eb' }} />
                  </ListItemIcon>
                  <ListItemText primary="Patient profile integration" />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: '36px' }}>
                    <CheckCircleIcon sx={{ color: '#2563eb' }} />
                  </ListItemIcon>
                  <ListItemText primary="Real-time inventory sync" />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: '36px' }}>
                    <CheckCircleIcon sx={{ color: '#2563eb' }} />
                  </ListItemIcon>
                  <ListItemText primary="Automated order processing" />
                </ListItem>
              </List>
              <Box sx={{ mt: 3, textAlign: 'right' }}>
                <Button variant="outlined" sx={{ 
                  borderColor: '#2563eb',
                  color: '#2563eb',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#1d4ed8',
                    backgroundColor: 'rgba(37, 99, 235, 0.05)'
                  }
                }}>
                  Learn More
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ backgroundColor: '#6b21a8', height: 12 }}></Box>
            <CardContent sx={{ flexGrow: 1, p: 3 }}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                My Vision Express
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Integrate with My Vision Express to enhance appointment management, billing, and customer experiences with our AI recommendations.
              </Typography>
              <List>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: '36px' }}>
                    <CheckCircleIcon sx={{ color: '#2563eb' }} />
                  </ListItemIcon>
                  <ListItemText primary="Scheduling integration" />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: '36px' }}>
                    <CheckCircleIcon sx={{ color: '#2563eb' }} />
                  </ListItemIcon>
                  <ListItemText primary="Billing system sync" />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: '36px' }}>
                    <CheckCircleIcon sx={{ color: '#2563eb' }} />
                  </ListItemIcon>
                  <ListItemText primary="Prescription data access" />
                </ListItem>
              </List>
              <Box sx={{ mt: 3, textAlign: 'right' }}>
                <Button variant="outlined" sx={{ 
                  borderColor: '#2563eb',
                  color: '#2563eb',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#1d4ed8',
                    backgroundColor: 'rgba(37, 99, 235, 0.05)'
                  }
                }}>
                  Learn More
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ backgroundColor: '#047857', height: 12 }}></Box>
            <CardContent sx={{ flexGrow: 1, p: 3 }}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                Compulink Advantage
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Connect to Compulink's Eyecare Advantage system to streamline clinical workflows and enhance patient experiences with AI recommendations.
              </Typography>
              <List>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: '36px' }}>
                    <CheckCircleIcon sx={{ color: '#2563eb' }} />
                  </ListItemIcon>
                  <ListItemText primary="EHR system integration" />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: '36px' }}>
                    <CheckCircleIcon sx={{ color: '#2563eb' }} />
                  </ListItemIcon>
                  <ListItemText primary="Seamless patient records" />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: '36px' }}>
                    <CheckCircleIcon sx={{ color: '#2563eb' }} />
                  </ListItemIcon>
                  <ListItemText primary="Clinical workflow optimization" />
                </ListItem>
              </List>
              <Box sx={{ mt: 3, textAlign: 'right' }}>
                <Button variant="outlined" sx={{ 
                  borderColor: '#2563eb',
                  color: '#2563eb',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#1d4ed8',
                    backgroundColor: 'rgba(37, 99, 235, 0.05)'
                  }
                }}>
                  Learn More
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Box sx={{ mb: 8, textAlign: 'center' }}>
        <Divider sx={{ mb: 5 }} />
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontWeight: 600,
            mb: 3,
          }}
        >
          Key Integration Benefits
        </Typography>
        
        <Typography variant="body1" paragraph sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
          Our integrations with leading practice management systems create a seamless workflow between your clinical operations and AI-powered eyewear recommendations.
        </Typography>
        
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={6} lg={3}>
            <Paper elevation={0} sx={{ p: 3, height: '100%', backgroundColor: '#f8fafc', borderRadius: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mb: 2
              }}>
                <Box component="span" sx={{ 
                  fontSize: '2.5rem', 
                  fontWeight: 700, 
                  color: '#2563eb' 
                }}>360°</Box>
              </Box>
              <Typography variant="h6" gutterBottom align="center">Patient View</Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Get a comprehensive view of each patient, combining clinical data with frame preferences and style history.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <Paper elevation={0} sx={{ p: 3, height: '100%', backgroundColor: '#f8fafc', borderRadius: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mb: 2
              }}>
                <Box component="span" sx={{ 
                  fontSize: '2.5rem', 
                  fontWeight: 700, 
                  color: '#2563eb' 
                }}>+40%</Box>
              </Box>
              <Typography variant="h6" gutterBottom align="center">Operational Efficiency</Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Save time on manual data entry and inventory management with automated synchronization.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <Paper elevation={0} sx={{ p: 3, height: '100%', backgroundColor: '#f8fafc', borderRadius: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mb: 2
              }}>
                <Box component="span" sx={{ 
                  fontSize: '2.5rem', 
                  fontWeight: 700, 
                  color: '#2563eb' 
                }}>+28%</Box>
              </Box>
              <Typography variant="h6" gutterBottom align="center">Conversion Rate</Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Increase frame sales with personalized AI recommendations informed by clinical data.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <Paper elevation={0} sx={{ p: 3, height: '100%', backgroundColor: '#f8fafc', borderRadius: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mb: 2
              }}>
                <Box component="span" sx={{ 
                  fontSize: '2.5rem', 
                  fontWeight: 700, 
                  color: '#2563eb' 
                }}>24/7</Box>
              </Box>
              <Typography variant="h6" gutterBottom align="center">Technical Support</Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Our dedicated integration team ensures smooth setup and ongoing technical assistance.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      
      <Box sx={{ p: 5, backgroundColor: '#f0f9ff', borderRadius: 3, mb: 4 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={7}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
              Ready to enhance your practice management system?
            </Typography>
            <Typography paragraph sx={{ mb: 4 }}>
              Our integration specialists will work with your team to ensure a smooth connection between your existing practice management system and our AI platform. Schedule a consultation to learn more about our integration process.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
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
                Schedule Integration Call
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
                Download Integration Guide
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={5}>
            <Box 
              component="img"
              src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgNDAwIDMwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNmMGY5ZmYiLz48cmVjdCB4PSIxMDAiIHk9IjUwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgcng9IjUiIHJ5PSI1IiBmaWxsPSJ3aGl0ZSIgc3Ryb2tlPSIjMTZhMzRhIiBzdHJva2Utd2lkdGg9IjIiLz48cmVjdCB4PSIyMDAiIHk9IjE1MCIgd2lkdGg9IjE1MCIgaGVpZ2h0PSIxMDAiIHJ4PSI1IiByeT0iNSIgZmlsbD0id2hpdGUiIHN0cm9rZT0iIzI1NjNlYiIgc3Ryb2tlLXdpZHRoPSIyIi8+PHJlY3QgeD0iNTAiIHk9IjE1MCIgd2lkdGg9IjE1MCIgaGVpZ2h0PSIxMDAiIHJ4PSI1IiByeT0iNSIgZmlsbD0id2hpdGUiIHN0cm9rZT0iI2Q5N3NjZiIgc3Ryb2tlLXdpZHRoPSIyIi8+PGxpbmUgeDE9IjIwMCIgeTE9IjEwMCIgeDI9IjI1MCIgeTI9IjE1MCIgc3Ryb2tlPSIjMjU2M2ViIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1kYXNoYXJyYXk9IjUgNSIvPjxsaW5lIHgxPSIyMDAiIHkxPSIxMDAiIHgyPSIxNTAiIHkyPSIxNTAiIHN0cm9rZT0iI2Q5N3NjZiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtZGFzaGFycmF5PSI1IDUiLz48dGV4dCB4PSIyMDAiIHk9IjEwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjMTZhMzRhIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5QTVMgU3lzdGVtPC90ZXh0Pjx0ZXh0IHg9IjEyNSIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiNkOTdzY2YiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPkNsaW5pY2FsIERhdGE8L3RleHQ+PHRleHQgeD0iMjc1IiB5PSIyMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzI1NjNlYiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+QUkgUmVjb21tZW5kYXRpb25zPC90ZXh0PjwvdW1sOnN2Zz4="
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

export default RetailIntegrationsPage;
