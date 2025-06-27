import React, { useState } from 'react';
import { Container, Box, Typography, Paper, Button, Stepper, Step, StepLabel, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Define the onboarding steps
const steps = ['Face Shape', 'Style Preferences', 'Color Preferences'];

// Dummy data for face shapes, styles, and colors
const faceShapes = [
  { id: 'oval', name: 'Oval', image: 'https://www.eyebuydirect.com/blog/wp-content/uploads/2018/05/Oval-1.png' },
  { id: 'round', name: 'Round', image: 'https://www.eyebuydirect.com/blog/wp-content/uploads/2018/05/Round-1.png' },
  { id: 'square', name: 'Square', image: 'https://www.eyebuydirect.com/blog/wp-content/uploads/2018/05/Square-1.png' },
  { id: 'heart', name: 'Heart', image: 'https://www.eyebuydirect.com/blog/wp-content/uploads/2018/05/Heart-1.png' },
  { id: 'diamond', name: 'Diamond', image: 'https://www.eyebuydirect.com/blog/wp-content/uploads/2018/05/Diamond-1.png' },
  { id: 'oblong', name: 'Oblong', image: 'https://www.eyebuydirect.com/blog/wp-content/uploads/2018/05/Oblong-1.png' },
];

const styles = [
  { id: 'minimal', name: 'Minimal', image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjciLz48cmVjdCB4PSI2MCIgeT0iNzAiIHdpZHRoPSI4MCIgaGVpZ2h0PSIzMCIgcng9IjEwIiByeT0iMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwNzFlMyIgc3Ryb2tlLXdpZHRoPSIzIi8+PGNpcmNsZSBjeD0iNjAiIGN5PSI4NSIgcj0iMTAiIGZpbGw9IiMwMDcxZTMiLz48Y2lyY2xlIGN4PSIxNDAiIGN5PSI4NSIgcj0iMTAiIGZpbGw9IiMwMDcxZTMiLz48cGF0aCBkPSJNNzAgODVoNjAiIHN0cm9rZT0iIzAwNzFlMyIgc3Ryb2tlLXdpZHRoPSIzIi8+PC9zdmc+' },
  { id: 'classic', name: 'Classic', image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjciLz48cmVjdCB4PSI0MCIgeT0iNzAiIHdpZHRoPSIxMjAiIGhlaWdodD0iMzUiIHJ4PSI1IiByeT0iNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDA3MWUzIiBzdHJva2Utd2lkdGg9IjMiLz48Y2lyY2xlIGN4PSI0NSIgY3k9Ijg3LjUiIHI9IjEyLjUiIGZpbGw9IiMwMDcxZTMiLz48Y2lyY2xlIGN4PSIxNTUiIGN5PSI4Ny41IiByPSIxMi41IiBmaWxsPSIjMDA3MWUzIi8+PC9zdmc+' },
  { id: 'retro', name: 'Retro', image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjciLz48cmVjdCB4PSI1MCIgeT0iNjUiIHdpZHRoPSIxMDAiIGhlaWdodD0iNDAiIHJ4PSIyMCIgcnk9IjIwIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDcxZTMiIHN0cm9rZS13aWR0aD0iMyIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iODUiIHI9IjE1IiBmaWxsPSIjMDA3MWUzIi8+PGNpcmNsZSBjeD0iMTUwIiBjeT0iODUiIHI9IjE1IiBmaWxsPSIjMDA3MWUzIi8+PC9zdmc+' },
  { id: 'modern', name: 'Modern', image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjciLz48cmVjdCB4PSI0MCIgeT0iNzAiIHdpZHRoPSIxMjAiIGhlaWdodD0iMzAiIHJ4PSIxNSIgcnk9IjE1IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDcxZTMiIHN0cm9rZS13aWR0aD0iMSIvPjxjaXJjbGUgY3g9IjQwIiBjeT0iODUiIHI9IjEwIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDcxZTMiIHN0cm9rZS13aWR0aD0iMSIvPjxjaXJjbGUgY3g9IjE2MCIgY3k9Ijg1IiByPSIxMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDA3MWUzIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=' },
];

const colors = [
  { id: 'black', name: 'Black', color: '#000000' },
  { id: 'gold', name: 'Gold', color: '#D4AF37' },
  { id: 'silver', name: 'Silver', color: '#C0C0C0' },
  { id: 'tortoise', name: 'Tortoise', color: '#8B4513' },
  { id: 'blue', name: 'Blue', color: '#0000FF' },
  { id: 'red', name: 'Red', color: '#FF0000' },
];

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [selections, setSelections] = useState({
    faceShape: '',
    style: '',
    color: ''
  });

  const handleSelection = (type: 'faceShape' | 'style' | 'color', id: string) => {
    setSelections({
      ...selections,
      [type]: id
    });
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Last step, save selections and redirect to recommendations
      console.log('Onboarding complete with selections:', selections);
      navigate('/recommendations');
    } else {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const renderFaceShapeStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Your Face Shape
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Choose the face shape that best matches yours. This helps us find frames that complement your features.
      </Typography>
      <Grid container spacing={3}>
        {faceShapes.map((shape) => (
          <Grid item xs={6} sm={4} key={shape.id}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                cursor: 'pointer',
                border: selections.faceShape === shape.id ? '2px solid #0071e3' : '2px solid transparent',
                backgroundColor: selections.faceShape === shape.id ? 'rgba(0, 113, 227, 0.05)' : 'white',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease'
                }
              }}
              onClick={() => handleSelection('faceShape', shape.id)}
              className="face-shape-option"
              data-shape={shape.id}
            >
              <Box
                component="img"
                src={shape.image}
                alt={shape.name}
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 1,
                  mb: 1
                }}
              />
              <Typography align="center" variant="subtitle1" fontWeight={500}>
                {shape.name}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderStyleStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Choose Your Style Preferences
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Select the style that best represents your personal aesthetic.
      </Typography>
      <Grid container spacing={3}>
        {styles.map((style) => (
          <Grid item xs={6} sm={3} key={style.id}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                cursor: 'pointer',
                border: selections.style === style.id ? '2px solid #0071e3' : '2px solid transparent',
                backgroundColor: selections.style === style.id ? 'rgba(0, 113, 227, 0.05)' : 'white',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease'
                }
              }}
              onClick={() => handleSelection('style', style.id)}
              className="style-option"
              data-style={style.id}
            >
              <Box
                component="img"
                src={style.image}
                alt={style.name}
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 1,
                  mb: 1
                }}
              />
              <Typography align="center" variant="subtitle1" fontWeight={500}>
                {style.name}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderColorStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Your Color Preferences
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Choose the frame color you prefer or wear most often.
      </Typography>
      <Grid container spacing={3}>
        {colors.map((color) => (
          <Grid item xs={6} sm={4} key={color.id}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                cursor: 'pointer',
                border: selections.color === color.id ? '2px solid #0071e3' : '2px solid transparent',
                backgroundColor: selections.color === color.id ? 'rgba(0, 113, 227, 0.05)' : 'white',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease'
                }
              }}
              onClick={() => handleSelection('color', color.id)}
              className="color-option"
              data-color={color.id}
            >
              <Box
                sx={{
                  width: '100%',
                  height: 60,
                  backgroundColor: color.color,
                  borderRadius: 1,
                  mb: 1
                }}
              />
              <Typography align="center" variant="subtitle1" fontWeight={500}>
                {color.name}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderFaceShapeStep();
      case 1:
        return renderStyleStep();
      case 2:
        return renderColorStep();
      default:
        return 'Unknown step';
    }
  };

  const isNextDisabled = () => {
    switch (activeStep) {
      case 0:
        return !selections.faceShape;
      case 1:
        return !selections.style;
      case 2:
        return !selections.color;
      default:
        return false;
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, mb: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
            Complete Your Profile
          </Typography>
          
          <Stepper activeStep={activeStep} sx={{ mb: 5 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          <Box sx={{ mb: 4 }}>
            {getStepContent(activeStep)}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
              sx={{ borderRadius: '28px', px: 3 }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={isNextDisabled()}
              sx={{ borderRadius: '28px', px: 3 }}
            >
              {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default OnboardingPage;
