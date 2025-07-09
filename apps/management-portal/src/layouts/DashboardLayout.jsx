import React from 'react';
import { Outlet, Link as RouterLink } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Drawer, List, ListItem,
  ListItemIcon, ListItemText, Box, CssBaseline
} from '@mui/material';
import {
  Dashboard as DashboardIcon, People as PeopleIcon,
  AddBusiness as AddBusinessIcon, BarChart as BarChartIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const navItems = [
  { text: 'Tenants', icon: <PeopleIcon />, path: '/tenants' },
  { text: 'Provisioning', icon: <AddBusinessIcon />, path: '/provisioning' },
  { text: 'Analytics', icon: <BarChartIcon />, path: '/analytics' },
];

function DashboardLayout() {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Commerce Studio Management Portal
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {navItems.map((item) => (
              <ListItem button component={RouterLink} to={item.path} key={item.text}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

export default DashboardLayout;