import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Container,
  Menu,
  MenuItem,
  IconButton,
  Divider
} from '@mui/material';
import { RBAC, useAuth } from './auth/AuthProvider';
import { Role } from '../services/auth';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DashboardIcon from '@mui/icons-material/Dashboard';

// Navigation component with dropdown menus
const NavigationMenu: React.FC = () => {
  const { isAuthenticated, logout, userContext } = useAuth();
  const location = useLocation();

  // State for dropdown menus
  const [integrationsAnchorEl, setIntegrationsAnchorEl] = useState<null | HTMLElement>(null);
  const [appStoreAnchorEl, setAppStoreAnchorEl] = useState<null | HTMLElement>(null);
  const [aiPlatformAnchorEl, setAiPlatformAnchorEl] = useState<null | HTMLElement>(null);
  const [dashboardAnchorEl, setDashboardAnchorEl] = useState<null | HTMLElement>(null);

  // Functions to handle dropdown open/close
  const handleIntegrationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setIntegrationsAnchorEl(event.currentTarget);
  };

  const handleIntegrationsClose = () => {
    setIntegrationsAnchorEl(null);
  };

  const handleAppStoreOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAppStoreAnchorEl(event.currentTarget);
  };

  const handleAppStoreClose = () => {
    setAppStoreAnchorEl(null);
  };

  const handleAiPlatformOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAiPlatformAnchorEl(event.currentTarget);
  };

  const handleAiPlatformClose = () => {
    setAiPlatformAnchorEl(null);
  };

  const handleDashboardOpen = (event: React.MouseEvent<HTMLElement>) => {
    setDashboardAnchorEl(event.currentTarget);
  };

  const handleDashboardClose = () => {
    setDashboardAnchorEl(null);
  };

  // Check if current path matches
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.85)', 
        backdropFilter: 'blur(8px)',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        color: '#333'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ py: 0.5 }}>
          <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              <Link to="/" style={{ color: '#333', textDecoration: 'none' }}>
                VARAi Commerce Studio
              </Link>
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              gap: 2,
              mx: 'auto', 
              pl: 2
            }}>
              <Button 
                sx={{ 
                  color: isActive('/') ? '#2563eb' : '#333', 
                  fontWeight: 500,
                  textTransform: 'none',
                  fontSize: '0.95rem'
                }} 
                component={Link} 
                to="/"
              >
                Home
              </Button>

              {/* Integrations Dropdown */}
              <Box>
                <Button 
                  sx={{ 
                    color: (
                      isActive('/commerce-integrations') || 
                      isActive('/retail-integrations') || 
                      isActive('/sku-genie')
                    ) ? '#2563eb' : '#333', 
                    fontWeight: 500,
                    textTransform: 'none',
                    fontSize: '0.95rem'
                  }} 
                  onClick={handleIntegrationsOpen}
                  endIcon={<KeyboardArrowDownIcon />}
                >
                  Integrations
                </Button>
                <Menu
                  anchorEl={integrationsAnchorEl}
                  open={Boolean(integrationsAnchorEl)}
                  onClose={handleIntegrationsClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                  }}
                  PaperProps={{
                    elevation: 2,
                    sx: { minWidth: '220px', mt: 1, borderRadius: 1 }
                  }}
                >
                  <MenuItem 
                    onClick={handleIntegrationsClose} 
                    component={Link}
                    to="/commerce-integrations"
                    sx={{ fontWeight: isActive('/commerce-integrations') ? 600 : 400 }}
                  >
                    E-commerce Integrations
                  </MenuItem>
                  <MenuItem 
                    onClick={handleIntegrationsClose} 
                    component={Link}
                    to="/retail-integrations"
                    sx={{ fontWeight: isActive('/retail-integrations') ? 600 : 400 }}
                  >
                    Retail PMS Integrations
                  </MenuItem>
                  <Divider sx={{ my: 1 }} />
                  <MenuItem 
                    onClick={handleIntegrationsClose} 
                    component={Link}
                    to="/sku-genie"
                    sx={{ fontWeight: isActive('/sku-genie') ? 600 : 400 }}
                  >
                    SKU Genie: Multi-Channel Sales
                  </MenuItem>
                </Menu>
              </Box>

              {/* App Store Dropdown */}
              <Box>
                <Button 
                  sx={{ 
                    color: (
                      isActive('/frame-finder') || 
                      isActive('/style-recommendations') || 
                      isActive('/fit-consultation')
                    ) ? '#2563eb' : '#333', 
                    fontWeight: 500,
                    textTransform: 'none',
                    fontSize: '0.95rem'
                  }} 
                  onClick={handleAppStoreOpen}
                  endIcon={<KeyboardArrowDownIcon />}
                >
                  App Store
                </Button>
                <Menu
                  anchorEl={appStoreAnchorEl}
                  open={Boolean(appStoreAnchorEl)}
                  onClose={handleAppStoreClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                  }}
                  PaperProps={{
                    elevation: 2,
                    sx: { minWidth: '220px', mt: 1, borderRadius: 1 }
                  }}
                >
                  <MenuItem 
                    onClick={handleAppStoreClose} 
                    component={Link}
                    to="/frame-finder"
                    sx={{ fontWeight: isActive('/frame-finder') ? 600 : 400 }}
                  >
                    Frame Finder
                  </MenuItem>
                  <MenuItem 
                    onClick={handleAppStoreClose} 
                    component={Link}
                    to="/style-recommendations"
                    sx={{ fontWeight: isActive('/style-recommendations') ? 600 : 400 }}
                  >
                    Style Recommendations
                  </MenuItem>
                  <MenuItem 
                    onClick={handleAppStoreClose} 
                    component={Link}
                    to="/fit-consultation"
                    sx={{ fontWeight: isActive('/fit-consultation') ? 600 : 400 }}
                  >
                    Fit Consultation
                  </MenuItem>
                  <Divider sx={{ my: 1 }} />
                  <MenuItem 
                    onClick={handleAppStoreClose} 
                    component={Link}
                    to="/app-store"
                    sx={{ fontWeight: isActive('/app-store') ? 600 : 400 }}
                  >
                    View All Apps
                  </MenuItem>
                </Menu>
              </Box>

              {/* AI Platform Dropdown */}
              <Box>
                <Button 
                  sx={{ 
                    color: (
                      isActive('/ai-technology') || 
                      isActive('/api-documentation') || 
                      isActive('/case-studies')
                    ) ? '#2563eb' : '#333', 
                    fontWeight: 500,
                    textTransform: 'none',
                    fontSize: '0.95rem'
                  }} 
                  onClick={handleAiPlatformOpen}
                  endIcon={<KeyboardArrowDownIcon />}
                >
                  AI Platform
                </Button>
                <Menu
                  anchorEl={aiPlatformAnchorEl}
                  open={Boolean(aiPlatformAnchorEl)}
                  onClose={handleAiPlatformClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                  }}
                  PaperProps={{
                    elevation: 2,
                    sx: { minWidth: '220px', mt: 1, borderRadius: 1 }
                  }}
                >
                  <MenuItem 
                    onClick={handleAiPlatformClose} 
                    component={Link}
                    to="/ai-technology"
                    sx={{ fontWeight: isActive('/ai-technology') ? 600 : 400 }}
                  >
                    AI Technology Overview
                  </MenuItem>
                  <MenuItem 
                    onClick={handleAiPlatformClose} 
                    component={Link}
                    to="/api-documentation"
                    sx={{ fontWeight: isActive('/api-documentation') ? 600 : 400 }}
                  >
                    API & Documentation
                  </MenuItem>
                </Menu>
              </Box>
              
              <RBAC resourceType="solutions">
                <Button 
                  sx={{ 
                    color: isActive('/solutions') ? '#2563eb' : '#333', 
                    fontWeight: 500,
                    textTransform: 'none',
                    fontSize: '0.95rem'
                  }} 
                  component={Link} 
                  to="/solutions"
                >
                  Solutions
                </Button>
              </RBAC>
              
              <RBAC resourceType="pricing">
                <Button 
                  sx={{ 
                    color: isActive('/pricing') ? '#2563eb' : '#333', 
                    fontWeight: 500,
                    textTransform: 'none',
                    fontSize: '0.95rem'
                  }} 
                  component={Link} 
                  to="/pricing"
                >
                  Pricing
                </Button>
              </RBAC>
            </Box>

            <Box>
              {isAuthenticated ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton
                    size="medium"
                    edge="end"
                    aria-label="account of current user"
                    color="inherit"
                    onClick={handleDashboardOpen}
                    sx={{ mr: 1 }}
                  >
                    <DashboardIcon />
                  </IconButton>
                  <Menu
                    anchorEl={dashboardAnchorEl}
                    open={Boolean(dashboardAnchorEl)}
                    onClose={handleDashboardClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    PaperProps={{
                      elevation: 2,
                      sx: { minWidth: '220px', mt: 1, borderRadius: 1 }
                    }}
                  >
                    <Box sx={{ px: 2, py: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Signed in as
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {userContext?.role}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    {userContext?.role === Role.SUPER_ADMIN && (
                      <MenuItem 
                        onClick={handleDashboardClose} 
                        component={Link}
                        to="/super-admin-dashboard"
                      >
                        Admin Dashboard
                      </MenuItem>
                    )}
                    {userContext?.role === Role.CLIENT_ADMIN && (
                      <MenuItem 
                        onClick={handleDashboardClose} 
                        component={Link}
                        to="/client-admin-dashboard"
                      >
                        Client Dashboard
                      </MenuItem>
                    )}
                    {userContext?.role === Role.BRAND_MANAGER && (
                      <MenuItem 
                        onClick={handleDashboardClose} 
                        component={Link}
                        to="/brand-manager-dashboard"
                      >
                        Brand Dashboard
                      </MenuItem>
                    )}
                    {userContext?.role === Role.VIEWER && (
                      <MenuItem 
                        onClick={handleDashboardClose} 
                        component={Link}
                        to="/viewer-dashboard"
                      >
                        Viewer Dashboard
                      </MenuItem>
                    )}
                    <MenuItem 
                      onClick={handleDashboardClose} 
                      component={Link}
                      to="/settings"
                    >
                      Account Settings
                    </MenuItem>
                    <Divider sx={{ my: 1 }} />
                    <MenuItem 
                      onClick={() => {
                        handleDashboardClose();
                        logout();
                      }}
                    >
                      Sign Out
                    </MenuItem>
                  </Menu>
                  
                  <Button 
                    variant="outlined"
                    sx={{
                      borderRadius: 4,
                      px: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: '#2563eb',
                      color: '#2563eb',
                      '&:hover': {
                        borderColor: '#1d4ed8',
                        backgroundColor: 'rgba(37, 99, 235, 0.05)'
                      }
                    }}
                    component={Link}
                    to={userContext?.role ? `/${userContext.role.replace('_', '-')}-dashboard` : '/'}
                  >
                    Dashboard
                  </Button>
                </Box>
              ) : (
                <Button 
                  variant="outlined"
                  component={Link} 
                  to="/auth"
                  sx={{
                    borderRadius: 4,
                    px: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: '#2563eb',
                    color: '#2563eb',
                    '&:hover': {
                      borderColor: '#1d4ed8',
                      backgroundColor: 'rgba(37, 99, 235, 0.05)'
                    }
                  }}
                >
                  Login
                </Button>
              )}
            </Box>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default NavigationMenu;
