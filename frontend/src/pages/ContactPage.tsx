import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  AppBar,
  Toolbar,
  TextField
} from '@mui/material';

const ContactPage: React.FC = () => {
  return (
    <>
      <AppBar position="fixed" sx={{ backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#0A2463', fontSize: '1.5rem', fontWeight: 700 }}>
            VARAi
          </Link>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Link to="/products" style={{ textDecoration: 'none', color: '#1d1d1f' }}>Products</Link>
            <Link to="/solutions" style={{ textDecoration: 'none', color: '#1d1d1f' }}>Solutions</Link>
            <Link to="/pricing" style={{ textDecoration: 'none', color: '#1d1d1f' }}>Pricing</Link>
            <Link to="/contact" style={{ textDecoration: 'none', color: '#1d1d1f', fontWeight: 600 }}>Contact</Link>
            <Button component={Link} to="/login" variant="contained" sx={{ backgroundColor: '#0A2463' }}>
              Login
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        pt: 15,
        pb: 8,
        textAlign: 'center'
      }}>
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Contact Us
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            Get in touch with our team
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={6}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              Send us a message
            </Typography>
            <Box component="form" sx={{ mt: 3 }}>
              <TextField fullWidth label="Name" margin="normal" />
              <TextField fullWidth label="Email" type="email" margin="normal" />
              <TextField fullWidth label="Company" margin="normal" />
              <TextField 
                fullWidth 
                label="Message" 
                multiline 
                rows={4} 
                margin="normal" 
              />
              <Button 
                variant="contained" 
                size="large" 
                sx={{ mt: 3, backgroundColor: '#0A2463' }}
              >
                Send Message
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              Get in touch
            </Typography>
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>📧 Email</Typography>
                    <Typography>contact@varai.com</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>📞 Phone</Typography>
                    <Typography>+1 (555) 123-4567</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>🏢 Office</Typography>
                    <Typography>
                      123 Innovation Drive<br />
                      San Francisco, CA 94105
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default ContactPage;