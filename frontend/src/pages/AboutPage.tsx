/**
 * About page component
 * Provides information about the company and platform
 */

import React from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PsychologyIcon from '@mui/icons-material/Psychology';
import GroupIcon from '@mui/icons-material/Group';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const AboutPage: React.FC = () => {
  const theme = useTheme();

  const stats = [
    { label: 'Happy Customers', value: '50,000+', icon: <GroupIcon /> },
    { label: 'Frames Analyzed', value: '1M+', icon: <VisibilityIcon /> },
    { label: 'AI Accuracy', value: '98.5%', icon: <PsychologyIcon /> },
    { label: 'Success Rate', value: '95%', icon: <TrendingUpIcon /> },
  ];

  const teamMembers = [
    {
      name: 'Dr. Sarah Chen',
      role: 'Chief Technology Officer',
      expertise: 'Computer Vision & AI',
      avatar: '/avatars/sarah-chen.jpg',
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Head of Product',
      expertise: 'UX Design & Strategy',
      avatar: '/avatars/marcus-rodriguez.jpg',
    },
    {
      name: 'Dr. Emily Watson',
      role: 'Lead Data Scientist',
      expertise: 'Machine Learning',
      avatar: '/avatars/emily-watson.jpg',
    },
    {
      name: 'James Kim',
      role: 'Engineering Manager',
      expertise: 'Full-Stack Development',
      avatar: '/avatars/james-kim.jpg',
    },
  ];

  const values = [
    {
      title: 'Innovation',
      description: 'We leverage cutting-edge AI and computer vision technology to revolutionize how people discover and try on eyewear.',
    },
    {
      title: 'Accessibility',
      description: 'Our platform is designed to be inclusive and accessible to everyone, regardless of their technical expertise or physical abilities.',
    },
    {
      title: 'Privacy',
      description: 'We prioritize user privacy and data security, ensuring that personal information and photos are handled with the utmost care.',
    },
    {
      title: 'Quality',
      description: 'We maintain the highest standards in our AI algorithms, user experience, and customer service to deliver exceptional results.',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: theme.palette.primary.main,
              mb: 3,
            }}
          >
            About EyewearML
          </Typography>
          
          <Typography
            variant="h5"
            sx={{
              color: theme.palette.text.secondary,
              maxWidth: 800,
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            We're revolutionizing the eyewear industry with AI-powered face shape analysis and personalized recommendations, making it easier than ever to find the perfect frames.
          </Typography>
        </Box>

        {/* Stats Section */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Card
                sx={{
                  textAlign: 'center',
                  p: 3,
                  height: '100%',
                  background: `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.primary.main}10)`,
                }}
              >
                <Box sx={{ color: theme.palette.primary.main, mb: 2 }}>
                  {React.cloneElement(stat.icon, { sx: { fontSize: 40 } })}
                </Box>
                <Typography
                  variant="h4"
                  component="div"
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                    mb: 1,
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontWeight: 500,
                  }}
                >
                  {stat.label}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Mission Section */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              textAlign: 'center',
              mb: 4,
            }}
          >
            Our Mission
          </Typography>
          
          <Card sx={{ p: 6, backgroundColor: theme.palette.grey[50] }}>
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.text.primary,
                lineHeight: 1.8,
                textAlign: 'center',
                fontSize: '1.25rem',
              }}
            >
              To democratize access to personalized eyewear recommendations through advanced AI technology, 
              helping millions of people worldwide find frames that not only improve their vision but also 
              enhance their confidence and personal style.
            </Typography>
          </Card>
        </Box>

        {/* Values Section */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              textAlign: 'center',
              mb: 6,
            }}
          >
            Our Values
          </Typography>
          
          <Grid container spacing={4}>
            {values.map((value, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ height: '100%', p: 3 }}>
                  <CardContent>
                    <Typography
                      variant="h5"
                      component="h3"
                      gutterBottom
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.primary.main,
                        mb: 2,
                      }}
                    >
                      {value.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: theme.palette.text.secondary,
                        lineHeight: 1.7,
                      }}
                    >
                      {value.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Team Section */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              textAlign: 'center',
              mb: 6,
            }}
          >
            Meet Our Team
          </Typography>
          
          <Grid container spacing={4}>
            {teamMembers.map((member, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ textAlign: 'center', p: 3, height: '100%' }}>
                  <Avatar
                    src={member.avatar}
                    alt={member.name}
                    sx={{
                      width: 100,
                      height: 100,
                      mx: 'auto',
                      mb: 2,
                      backgroundColor: theme.palette.primary.light,
                      fontSize: '2rem',
                      fontWeight: 600,
                    }}
                  >
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                  
                  <Typography
                    variant="h6"
                    component="h3"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                    }}
                  >
                    {member.name}
                  </Typography>
                  
                  <Typography
                    variant="body1"
                    sx={{
                      color: theme.palette.primary.main,
                      fontWeight: 500,
                      mb: 1,
                    }}
                  >
                    {member.role}
                  </Typography>
                  
                  <Chip
                    label={member.expertise}
                    variant="outlined"
                    size="small"
                    sx={{
                      borderColor: theme.palette.primary.light,
                      color: theme.palette.primary.main,
                    }}
                  />
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Technology Section */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              mb: 4,
            }}
          >
            Powered by Advanced Technology
          </Typography>
          
          <Card sx={{ p: 6, backgroundColor: theme.palette.primary.main, color: 'white' }}>
            <Typography
              variant="h6"
              sx={{
                lineHeight: 1.8,
                fontSize: '1.25rem',
                mb: 3,
              }}
            >
              Our platform combines state-of-the-art computer vision, machine learning, and augmented reality 
              technologies to deliver accurate face shape analysis and personalized eyewear recommendations.
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
              {['Computer Vision', 'Machine Learning', 'Augmented Reality', 'Deep Learning', 'Cloud Computing'].map((tech, index) => (
                <Chip
                  key={index}
                  label={tech}
                  variant="outlined"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                />
              ))}
            </Box>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default AboutPage;