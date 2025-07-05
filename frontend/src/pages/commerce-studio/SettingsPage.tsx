import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Typography,
  Card,
  CardContent,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Container,
  Grid
} from '@mui/material';
import { settingsService } from '../../services/settings';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const settingsNavItems = [
    { path: '/settings/general', label: 'General Settings' },
    { path: '/settings/integrations', label: 'Integrations' },
    { path: '/settings/api-keys', label: 'API Keys' },
    { path: '/settings/notifications', label: 'Notifications' },
    { path: '/settings/billing', label: 'Billing & Plans' },
    { path: '/settings/team', label: 'Team Management' },
    { path: '/settings/security', label: 'Security' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Grid container spacing={3}>
        {/* Settings Sidebar */}
        <Grid item xs={12} md={3}>
          <Card sx={{ position: 'sticky', top: 24 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Settings
              </Typography>
              <List disablePadding>
                {settingsNavItems.map((item) => (
                  <ListItem key={item.path} disablePadding>
                    <ListItemButton
                      selected={isActive(item.path)}
                      onClick={() => navigate(item.path)}
                      sx={{
                        borderRadius: 1,
                        mb: 0.5,
                        '&.Mui-selected': {
                          backgroundColor: 'primary.50',
                          color: 'primary.700',
                          '&:hover': {
                            backgroundColor: 'primary.100',
                          },
                        },
                        '&:hover': {
                          backgroundColor: 'grey.100',
                        },
                      }}
                    >
                      <ListItemText primary={item.label} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Settings Content */}
        <Grid item xs={12} md={9}>
          <Box>
            <Outlet />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SettingsPage;