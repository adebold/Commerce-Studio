import { Box, Container, Typography, Grid, Paper, Button, Card, CardContent, CardMedia } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// Styled components
const FeatureCard = styled(Card)(() => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.12)',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2), // Using theme here
  borderRadius: 24,
  padding: '10px 24px',
  fontWeight: 600,
}));

const HeroSection = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(12, 2),
  background: 'linear-gradient(45deg, #f5f5f7 30%, #ffffff 90%)',
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(6),
}));

function Home() {
  const navigate = useNavigate();
  
  const handleFrameFinderClick = () => {
    console.log('Frame Finder clicked');
    // Navigate to the frame finder page we created
    navigate('/frame-finder');
  };
  
  const handleViewDemoClick = () => {
    console.log('View Demo clicked');
    // For now, navigate to products page as an example
    navigate('/products');
  };
  
  const handleLearnMoreClick = () => {
    console.log('Learn More clicked');
    // Navigate to solutions page
    navigate('/solutions');
  };
  
  const handleLaunchTesterClick = () => {
    console.log('Launch Tester clicked');
    // Navigate to auth if not logged in
    navigate('/auth');
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <HeroSection>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '2rem', md: '3rem' },
            letterSpacing: '-0.022em',
            mb: 3,
          }}
        >
          Welcome to Eyewear ML
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 400,
            color: 'text.secondary',
            maxWidth: '800px',
            mx: 'auto',
            mb: 5,
          }}
        >
          AI-powered eyewear analysis and recommendation platform for finding the perfect frames
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <ActionButton
              variant="contained"
              color="secondary"
              size="large"
              onClick={handleFrameFinderClick}
            >
              Try Frame Finder
            </ActionButton>
          </Grid>
          <Grid item>
            <ActionButton
              variant="outlined"
              color="secondary"
              size="large"
              onClick={handleViewDemoClick}
            >
              View Demo
            </ActionButton>
          </Grid>
        </Grid>
      </HeroSection>

      <Typography
        variant="h4"
        component="h2"
        sx={{
          fontWeight: 600,
          mb: 4,
          textAlign: 'center',
        }}
      >
        Our Features
      </Typography>

      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12} md={4}>
          <FeatureCard>
            <CardMedia
              component="img"
              height="200"
              image="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjciLz48cmVjdCB4PSI2MCIgeT0iNzAiIHdpZHRoPSI4MCIgaGVpZ2h0PSIzMCIgcng9IjEwIiByeT0iMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwNzFlMyIgc3Ryb2tlLXdpZHRoPSIzIi8+PGNpcmNsZSBjeD0iNjAiIGN5PSI4NSIgcj0iMTAiIGZpbGw9IiMwMDcxZTMiLz48Y2lyY2xlIGN4PSIxNDAiIGN5PSI4NSIgcj0iMTAiIGZpbGw9IiMwMDcxZTMiLz48cGF0aCBkPSJNNzAgODVoNjAiIHN0cm9rZT0iIzAwNzFlMyIgc3Ryb2tlLXdpZHRoPSIzIi8+PC9zdmc+"
              alt="Frame Finder"
              sx={{ 
                objectFit: 'contain',
                backgroundColor: '#f5f5f7',
              }}
            />
            <CardContent sx={{ flexGrow: 1, p: 3 }}>
              <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                Frame Finder
              </Typography>
              <Typography color="text.secondary">
                Upload a photo of frames you like and our AI will find similar styles and recommend alternatives based on your preferences.
              </Typography>
            </CardContent>
          </FeatureCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <FeatureCard>
            <CardMedia
              component="img"
              height="200"
              image="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjciLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iMzAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwNzFlMyIgc3Ryb2tlLXdpZHRoPSIzIi8+PHJlY3QgeD0iNjUiIHk9IjEyMCIgd2lkdGg9IjcwIiBoZWlnaHQ9IjIwIiByeD0iNSIgcnk9IjUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwNzFlMyIgc3Ryb2tlLXdpZHRoPSIzIi8+PHJlY3QgeD0iNzUiIHk9IjE1MCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjIwIiByeD0iNSIgcnk9IjUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwNzFlMyIgc3Ryb2tlLXdpZHRoPSIzIi8+PC9zdmc+"
              alt="Style Recommendations"
              sx={{ 
                objectFit: 'contain',
                backgroundColor: '#f5f5f7',
              }}
            />
            <CardContent sx={{ flexGrow: 1, p: 3 }}>
              <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                Style Recommendations
              </Typography>
              <Typography color="text.secondary">
                Get personalized eyewear recommendations based on your face shape, style preferences, and previous purchases.
              </Typography>
            </CardContent>
          </FeatureCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <FeatureCard>
            <CardMedia
              component="img"
              height="200"
              image="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjciLz48cmVjdCB4PSI0MCIgeT0iNzAiIHdpZHRoPSIxMjAiIGhlaWdodD0iODAiIHJ4PSI1IiByeT0iNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDA3MWUzIiBzdHJva2Utd2lkdGg9IjMiLz48bGluZSB4MT0iNDAiIHkxPSI5MCIgeDI9IjE2MCIgeTI9IjkwIiBzdHJva2U9IiMwMDcxZTMiIHN0cm9rZS13aWR0aD0iMyIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iODAiIHI9IjMiIGZpbGw9IiMwMDcxZTMiLz48Y2lyY2xlIGN4PSI2MCIgY3k9IjgwIiByPSIzIiBmaWxsPSIjMDA3MWUzIi8+PGNpcmNsZSBjeD0iNzAiIGN5PSI4MCIgcj0iMyIgZmlsbD0iIzAwNzFlMyIvPjwvc3ZnPg=="
              alt="Virtual Try-On"
              sx={{ 
                objectFit: 'contain',
                backgroundColor: '#f5f5f7',
              }}
            />
            <CardContent sx={{ flexGrow: 1, p: 3 }}>
              <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                Fit Consultation
              </Typography>
              <Typography color="text.secondary">
                Our AI analyzes how frames fit your face and provides detailed feedback on sizing, alignment, and comfort.
              </Typography>
            </CardContent>
          </FeatureCard>
        </Grid>
      </Grid>

      <Paper 
        elevation={0} 
        sx={{ 
          p: 6, 
          backgroundColor: '#f5f5f7', 
          borderRadius: 3,
          mb: 8,
        }}
      >
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 600,
                mb: 2,
              }}
            >
              AI-Powered Analysis
            </Typography>
            <Typography variant="body1" paragraph>
              Our machine learning models analyze thousands of eyewear frames and facial characteristics to provide highly accurate recommendations.
            </Typography>
            <Typography variant="body1" paragraph>
              We continuously train our models with new data to improve recommendation quality and keep up with the latest eyewear trends.
            </Typography>
            <ActionButton
              variant="contained"
              color="secondary"
              onClick={handleLearnMoreClick}
            >
              Learn About Our Technology
            </ActionButton>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box 
              component="img" 
              src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgNDAwIDMwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNmNWY1ZjciLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxNTAiIHI9IjUwIiBmaWxsPSJyZ2JhKDAsIDExMywgMjI3LCAwLjEpIiBzdHJva2U9IiMwMDcxZTMiIHN0cm9rZS13aWR0aD0iMiIvPjxjaXJjbGUgY3g9IjMwMCIgY3k9IjE1MCIgcj0iNTAiIGZpbGw9InJnYmEoMCwgMTEzLCAyMjcsIDAuMSkiIHN0cm9rZT0iIzAwNzFlMyIgc3Ryb2tlLXdpZHRoPSIyIi8+PGxpbmUgeDE9IjEwMCIgeTE9IjE1MCIgeDI9IjMwMCIgeTI9IjE1MCIgc3Ryb2tlPSIjMDA3MWUzIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1kYXNoYXJyYXk9IjUgNSIvPjxjaXJjbGUgY3g9IjIwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0icmdiYSgwLCAxMTMsIDIyNywgMC4xKSIgc3Ryb2tlPSIjMDA3MWUzIiBzdHJva2Utd2lkdGg9IjIiLz48bGluZSB4MT0iMTAwIiB5MT0iMTUwIiB4Mj0iMjAwIiB5Mj0iODAiIHN0cm9rZT0iIzAwNzFlMyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtZGFzaGFycmF5PSI1IDUiLz48bGluZSB4MT0iMzAwIiB5MT0iMTUwIiB4Mj0iMjAwIiB5Mj0iODAiIHN0cm9rZT0iIzAwNzFlMyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtZGFzaGFycmF5PSI1IDUiLz48Y2lyY2xlIGN4PSIyMDAiIGN5PSIyMjAiIHI9IjQwIiBmaWxsPSJyZ2JhKDAsIDExMywgMjI3LCAwLjEpIiBzdHJva2U9IiMwMDcxZTMiIHN0cm9rZS13aWR0aD0iMiIvPjxsaW5lIHgxPSIxMDAiIHkxPSIxNTAiIHgyPSIyMDAiIHkyPSIyMjAiIHN0cm9rZT0iIzAwNzFlMyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtZGFzaGFycmF5PSI1IDUiLz48bGluZSB4MT0iMzAwIiB5MT0iMTUwIiB4Mj0iMjAwIiB5Mj0iMjIwIiBzdHJva2U9IiMwMDcxZTMiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWRhc2hhcnJheT0iNSA1Ii8+PGxpbmUgeDE9IjIwMCIgeTE9IjgwIiB4Mj0iMjAwIiB5Mj0iMjIwIiBzdHJva2U9IiMwMDcxZTMiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWRhc2hhcnJheT0iNSA1Ii8+PC9zdmc+" 
              alt="AI Technology Visualization"
              sx={{ 
                width: '100%', 
                height: 'auto',
                borderRadius: 2,
                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.05)'
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontWeight: 600,
            mb: 3,
          }}
        >
          Ready to Get Started?
        </Typography>
        <Typography
          variant="body1"
          sx={{
            maxWidth: '700px',
            mx: 'auto',
            mb: 4,
            color: 'text.secondary',
          }}
        >
          Try our eyewear analysis tools today and discover frames that perfectly match your style and preferences.
        </Typography>
        <ActionButton
          variant="contained"
          color="secondary"
          size="large"
          onClick={handleLaunchTesterClick}
        >
          Launch Tester
        </ActionButton>
      </Box>
    </Container>
  );
}

export default Home;
