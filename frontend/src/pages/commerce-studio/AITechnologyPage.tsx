import React from 'react';
import { Container, Typography, Paper, Grid, Box, Divider, Card, CardContent, CardMedia, List, ListItem, ListItemText } from '@mui/material';

const AITechnologyPage = () => {
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
        AI Technology
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
        Our machine learning models analyze thousands of eyewear frames and facial characteristics to provide highly accurate recommendations
      </Typography>
      
      <Grid container spacing={5} sx={{ mb: 6 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 4, borderRadius: 2, backgroundColor: '#f8fafc', height: '100%' }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ color: '#2563eb', fontWeight: 600 }}>
              Our AI Approach
            </Typography>
            <Typography paragraph>
              At Eyewear ML, we've developed proprietary machine learning algorithms that power our eyewear analysis and recommendation platform. Our technology includes:
            </Typography>
            
            <List>
              <ListItem>
                <ListItemText 
                  primary={<Typography variant="h6">Computer Vision</Typography>} 
                  secondary="Advanced image processing algorithms that analyze frame shapes, styles, and features with high precision."
                />
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary={<Typography variant="h6">Facial Recognition</Typography>} 
                  secondary="Precise facial feature detection to determine face shape, proportions, and key measurement points for optimal frame fit."
                />
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary={<Typography variant="h6">Recommendation Engine</Typography>} 
                  secondary="Sophisticated matching algorithms that analyze thousands of frames to find the perfect matches based on your preferences and face characteristics."
                />
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary={<Typography variant="h6">Continuous Learning</Typography>} 
                  secondary="Our models continuously improve by analyzing user feedback and preferences, resulting in increasingly accurate recommendations over time."
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
            <CardMedia
              component="img"
              height="260"
              image="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgNjAwIDQwMCI+PHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiNmOGZhZmMiLz48Y2lyY2xlIGN4PSIxNTAiIGN5PSIyMDAiIHI9IjgwIiBmaWxsPSIjZWZmNmZmIiBzdHJva2U9IiMyNTYzZWIiIHN0cm9rZS13aWR0aD0iMiIvPjxjaXJjbGUgY3g9IjQ1MCIgY3k9IjIwMCIgcj0iODAiIGZpbGw9IiNlZmY2ZmYiIHN0cm9rZT0iIzI1NjNlYiIgc3Ryb2tlLXdpZHRoPSIyIi8+PGNpcmNsZSBjeD0iMzAwIiBjeT0iMTIwIiByPSI4MCIgZmlsbD0iI2VmZjZmZiIgc3Ryb2tlPSIjMjU2M2ViIiBzdHJva2Utd2lkdGg9IjIiLz48Y2lyY2xlIGN4PSIzMDAiIGN5PSIyODAiIHI9IjgwIiBmaWxsPSIjZWZmNmZmIiBzdHJva2U9IiMyNTYzZWIiIHN0cm9rZS13aWR0aD0iMiIvPjxsaW5lIHgxPSIxNTAiIHkxPSIyMDAiIHgyPSIzMDAiIHkyPSIxMjAiIHN0cm9rZT0iIzI1NjNlYiIgc3Ryb2tlLXdpZHRoPSIyIi8+PGxpbmUgeDE9IjMwMCIgeTE9IjEyMCIgeDI9IjQ1MCIgeTI9IjIwMCIgc3Ryb2tlPSIjMjU2M2ViIiBzdHJva2Utd2lkdGg9IjIiLz48bGluZSB4MT0iNDUwIiB5MT0iMjAwIiB4Mj0iMzAwIiB5Mj0iMjgwIiBzdHJva2U9IiMyNTYzZWIiIHN0cm9rZS13aWR0aD0iMiIvPjxsaW5lIHgxPSIzMDAiIHkxPSIyODAiIHgyPSIxNTAiIHkyPSIyMDAiIHN0cm9rZT0iIzI1NjNlYiIgc3Ryb2tlLXdpZHRoPSIyIi8+PHRleHQgeD0iMTUwIiB5PSIyMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY0NzQ4YiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+Q29tcHV0ZXIgVmlzaW9uPC90ZXh0Pjx0ZXh0IHg9IjQ1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NDc0OGIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPkZhY2lhbCBBbmFseXNpczwvdGV4dD48dGV4dCB4PSIzMDAiIHk9IjEyMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjQ3NDhiIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5NYWNoaW5lIExlYXJuaW5nPC90ZXh0Pjx0ZXh0IHg9IjMwMCIgeT0iMjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NDc0OGIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPlJlY29tbWVuZGF0aW9uIEVuZ2luZTwvdGV4dD48L3N2Zz4="
              alt="AI Technology Ecosystem"
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 600 }}>
                AI-Powered Analysis Pipeline
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Our integrated AI system processes images, analyzes facial features, matches with thousands of frame styles, and generates personalized recommendations in real-time. The interconnected components create a seamless experience from image upload to perfect eyewear matches.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Typography
        variant="h4"
        component="h2"
        sx={{
          fontWeight: 600,
          mb: 4,
          textAlign: 'center',
        }}
      >
        Key Technology Features
      </Typography>
      
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 3, height: '100%', backgroundColor: '#f8fafc', borderRadius: 2 }}>
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
              01
            </Box>
            <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
              Precision Measurements
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Our AI can determine facial measurements with remarkable precision, identifying over 68 facial landmarks to calculate optimal frame dimensions relative to your unique features.
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 3, height: '100%', backgroundColor: '#f8fafc', borderRadius: 2 }}>
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
              02
            </Box>
            <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
              Style Classification
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Our system can categorize frames into detailed style classifications, recognizing subtle differences between thousands of frame styles, shapes, and design elements.
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 3, height: '100%', backgroundColor: '#f8fafc', borderRadius: 2 }}>
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
              03
            </Box>
            <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
              Personalized Learning
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Our recommendation algorithms adapt to your preferences over time, learning from your selections and feedback to provide increasingly tailored suggestions with each interaction.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 6 }} />
      
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Data Security & Privacy
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 700, mx: 'auto', mb: 2 }}>
          We prioritize your data privacy and security. All facial analysis is performed on-device when possible, and we never store facial recognition data without explicit permission. Images uploaded for analysis are processed securely and can be deleted at your request.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Learn more about our privacy practices in our Privacy Policy.
        </Typography>
      </Box>
    </Container>
  );
};

export default AITechnologyPage;
