import React from 'react';
import { Container, Typography, Paper, Grid, Box, Divider, Card, CardContent, CardMedia } from '@mui/material';

const StyleRecommendationsPage = () => {
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
        Style Recommendations
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
        Get personalized eyewear recommendations based on your face shape, style preferences, and previous purchases
      </Typography>
      
      <Paper elevation={2} sx={{ p: 4, borderRadius: 2, backgroundColor: '#f8fafc', mb: 6 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Personalized Style Analysis
        </Typography>
        <Typography paragraph>
          Our AI-powered styling system analyzes your face shape, features, and personal style preferences to recommend frames that will look best on you. We take into account:
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 3 }}>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Box sx={{ 
                width: 60, 
                height: 60, 
                borderRadius: '50%', 
                backgroundColor: '#eff6ff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mb: 2,
                mx: 'auto',
                color: '#2563eb',
                fontWeight: 'bold',
                fontSize: '1.5rem'
              }}>
                1
              </Box>
              <Typography variant="h6" gutterBottom>Face Shape</Typography>
              <Typography variant="body2" color="text.secondary">
                Different frame shapes complement different face shapes. We identify your face shape and suggest compatible frames.
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Box sx={{ 
                width: 60, 
                height: 60, 
                borderRadius: '50%', 
                backgroundColor: '#eff6ff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mb: 2,
                mx: 'auto',
                color: '#2563eb',
                fontWeight: 'bold',
                fontSize: '1.5rem'
              }}>
                2
              </Box>
              <Typography variant="h6" gutterBottom>Style Preferences</Typography>
              <Typography variant="body2" color="text.secondary">
                Your personal style and color preferences help us narrow down the perfect frames for your aesthetic.
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Box sx={{ 
                width: 60, 
                height: 60, 
                borderRadius: '50%', 
                backgroundColor: '#eff6ff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mb: 2,
                mx: 'auto',
                color: '#2563eb',
                fontWeight: 'bold',
                fontSize: '1.5rem'
              }}>
                3
              </Box>
              <Typography variant="h6" gutterBottom>Lifestyle Needs</Typography>
              <Typography variant="body2" color="text.secondary">
                We consider your activities, profession, and lifestyle to recommend frames that fit your daily needs.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Typography
        variant="h4"
        component="h2"
        sx={{
          fontWeight: 600,
          mb: 4,
          textAlign: 'center',
        }}
      >
        Featured Style Categories
      </Typography>
      
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: '100%', 
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
            }
          }}>
            <CardMedia
              component="img"
              height="180"
              image="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjciLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjUwIiBzdHJva2U9IiMyNTYzZWIiIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik02MCAxMDBoODAiIHN0cm9rZT0iIzI1NjNlYiIgc3Ryb2tlLXdpZHRoPSIzIi8+PC9zdmc+"
              alt="Minimal Frames"
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 600 }}>
                Minimal & Modern
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Clean lines, lightweight materials, and unobtrusive designs perfect for a contemporary, minimalist aesthetic.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: '100%', 
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
            }
          }}>
            <CardMedia
              component="img"
              height="180"
              image="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjciLz48cmVjdCB4PSI1MCIgeT0iNzAiIHdpZHRoPSIxMDAiIGhlaWdodD0iNjAiIHJ4PSIxMCIgcnk9IjEwIiBzdHJva2U9IiMyNTYzZWIiIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0ibm9uZSIvPjwvc3ZnPg=="
              alt="Bold Frames"
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 600 }}>
                Bold & Statement
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Eye-catching shapes, vibrant colors, and distinctive designs that express personality and make a statement.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            height: '100%', 
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
            }
          }}>
            <CardMedia
              component="img"
              height="180"
              image="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjciLz48bGluZSB4MT0iNTAiIHkxPSIxMDAiIHgyPSIxNTAiIHkyPSIxMDAiIHN0cm9rZT0iIzI1NjNlYiIgc3Ryb2tlLXdpZHRoPSIzIi8+PGNpcmNsZSBjeD0iNTAiIGN5PSIxMDAiIHI9IjEwIiBmaWxsPSIjMjU2M2ViIi8+PGNpcmNsZSBjeD0iMTUwIiBjeT0iMTAwIiByPSIxMCIgZmlsbD0iIzI1NjNlYiIvPjwvc3ZnPg=="
              alt="Classic Frames"
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 600 }}>
                Classic & Timeless
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enduring shapes and designs that transcend trends, offering versatility and timeless style for any occasion.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 6 }} />
      
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Coming Soon: Personal Style Quiz
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 700, mx: 'auto' }}>
          Take our comprehensive style quiz to receive a personalized eyewear profile and curated recommendations tailored specifically to your preferences and needs.
        </Typography>
      </Box>
    </Container>
  );
};

export default StyleRecommendationsPage;
