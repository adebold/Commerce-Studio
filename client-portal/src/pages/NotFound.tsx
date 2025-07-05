import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh' 
    }}>
      <Paper sx={{ p: 5, maxWidth: 500, textAlign: 'center' }}>
        <Typography variant="h1" sx={{ fontSize: 100, fontWeight: 'bold', color: 'primary.main' }}>
          404
        </Typography>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Page Not Found
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/')}
          sx={{ mr: 2 }}
        >
          Go to Dashboard
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </Paper>
    </Box>
  );
};

export default NotFound;
