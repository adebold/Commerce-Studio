import React from 'react';
import { Container, Typography, Paper, Grid, Box, Divider, Card, CardContent, CardMedia, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const FitConsultationPage = () => {
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
        Fit Consultation
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
        Our AI analyzes how frames fit your face and provides detailed feedback on sizing, alignment, and comfort
      </Typography>
      
      <Grid container spacing={5}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 4, borderRadius: 2, backgroundColor: '#f8fafc', height: '100%' }}>
            <Typography variant="h5" component="h2" gutterBottom>
              How It Works
            </Typography>
            <Typography paragraph>
              Our advanced computer vision algorithms analyze images of you wearing frames to provide detailed fit analysis and recommendations:
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleOutlineIcon sx={{ color: '#2563eb' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Frame Alignment Analysis" 
                  secondary="We detect if frames sit correctly on your face, checking for level positioning and proper bridge fit."
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <CheckCircleOutlineIcon sx={{ color: '#2563eb' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Size Compatibility" 
                  secondary="Our AI measures your face proportions and compares them to frame dimensions to determine optimal sizing."
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <CheckCircleOutlineIcon sx={{ color: '#2563eb' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Pressure Point Detection" 
                  secondary="We identify potential pressure points that might cause discomfort during extended wear."
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <CheckCircleOutlineIcon sx={{ color: '#2563eb' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Adjustment Recommendations" 
                  secondary="Based on our analysis, we'll suggest specific adjustments to improve fit and comfort."
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
            <CardMedia
              component="img"
              height="300"
              image="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgNTAwIDMwMCI+PHJlY3Qgd2lkdGg9IjUwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNmOGZhZmMiLz48Y2lyY2xlIGN4PSIyNTAiIGN5PSIxMjAiIHI9IjgwIiBmaWxsPSIjZWZmNmZmIiBzdHJva2U9IiMyNTYzZWIiIHN0cm9rZS13aWR0aD0iMiIvPjxlbGxpcHNlIGN4PSIyNTAiIGN5PSIxNzAiIHJ4PSIxMDAiIHJ5PSI2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNjQ3NDhiIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1kYXNoYXJyYXk9IjUgNSIvPjxsaW5lIHgxPSIxNzAiIHkxPSIxMjAiIHgyPSIzMzAiIHkyPSIxMjAiIHN0cm9rZT0iIzI1NjNlYiIgc3Ryb2tlLXdpZHRoPSIzIi8+PHJlY3QgeD0iMTcwIiB5PSIxMDAiIHdpZHRoPSIzMCIgaGVpZ2h0PSI0MCIgcng9IjUiIHJ5PSI1IiBmaWxsPSIjZWZmNmZmIiBzdHJva2U9IiMyNTYzZWIiIHN0cm9rZS13aWR0aD0iMiIvPjxyZWN0IHg9IjMwMCIgeT0iMTAwIiB3aWR0aD0iMzAiIGhlaWdodD0iNDAiIHJ4PSI1IiByeT0iNSIgZmlsbD0iI2VmZjZmZiIgc3Ryb2tlPSIjMjU2M2ViIiBzdHJva2Utd2lkdGg9IjIiLz48bGluZSB4MT0iMjIwIiB5MT0iODAiIHgyPSIyMjAiIHkyPSIxNjAiIHN0cm9rZT0iIzY0NzQ4YiIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2UtZGFzaGFycmF5PSIzIDMiLz48bGluZSB4MT0iMjgwIiB5MT0iODAiIHgyPSIyODAiIHkyPSIxNjAiIHN0cm9rZT0iIzY0NzQ4YiIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2UtZGFzaGFycmF5PSIzIDMiLz48dGV4dCB4PSIyNTAiIHk9IjIyMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjQ3NDhiIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5GaXQgQW5hbHlzaXMgVmlzdWFsaXphdGlvbjwvdGV4dD48L3N2Zz4="
              alt="Fit Analysis Illustration"
            />
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Benefits of Proper Fit
              </Typography>
              <Typography paragraph color="text.secondary">
                Eyewear that fits correctly not only looks better but also provides optimal vision correction and comfort. Our consultation helps with:
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    ✓ Enhanced Comfort
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Eliminate pressure points and discomfort
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    ✓ Better Vision
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Proper alignment for optimal lens performance
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    ✓ Improved Longevity
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Reduced stress on frame components
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    ✓ Better Appearance
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Frames that complement your features
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 6 }} />
      
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Coming Soon: Virtual Fitting Room
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 700, mx: 'auto' }}>
          Our upcoming virtual fitting room will allow you to try on frames from the comfort of home and receive instant fit analysis and recommendations.
        </Typography>
      </Box>
    </Container>
  );
};

export default FitConsultationPage;
