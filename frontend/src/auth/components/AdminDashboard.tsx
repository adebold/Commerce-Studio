import React, { useState } from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  Typography, 
  Paper, 
  Container,
  Button,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { UserManagement } from './admin/UserManagement';
import { RoleManagement } from './admin/RoleManagement';
import { TenantManagement } from './admin/TenantManagement';
import { OrganizationSettings } from './admin/OrganizationSettings';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `admin-tab-${index}`,
    'aria-controls': `admin-tabpanel-${index}`,
  };
};

export const AdminDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user, hasPermission } = useAuth();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Check if user has admin permissions
  const canManageUsers = hasPermission('manage_tenant_users');
  const canManageRoles = hasPermission('manage_tenant_settings');
  const canManageTenants = hasPermission('manage_tenants');
  const canManageSettings = hasPermission('manage_tenant_settings');

  if (!user) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // If user doesn't have any admin permissions, show access denied
  if (!canManageUsers && !canManageRoles && !canManageTenants && !canManageSettings) {
    return (
      <Container maxWidth="lg">
        <Paper sx={{ p: 4, mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1" paragraph>
            You don't have permission to access the admin dashboard.
          </Typography>
          <Button variant="contained" color="primary" href="/">
            Return to Home
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper sx={{ mt: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="admin dashboard tabs"
          >
            {canManageUsers && <Tab label="Users" {...a11yProps(0)} />}
            {canManageRoles && <Tab label="Roles" {...a11yProps(1)} />}
            {canManageTenants && <Tab label="Organizations" {...a11yProps(2)} />}
            {canManageSettings && <Tab label="Settings" {...a11yProps(3)} />}
          </Tabs>
        </Box>

        {canManageUsers && (
          <TabPanel value={tabValue} index={0}>
            <UserManagement isLoading={isLoading} setIsLoading={setIsLoading} />
          </TabPanel>
        )}

        {canManageRoles && (
          <TabPanel value={tabValue} index={1}>
            <RoleManagement isLoading={isLoading} setIsLoading={setIsLoading} />
          </TabPanel>
        )}

        {canManageTenants && (
          <TabPanel value={tabValue} index={2}>
            <TenantManagement isLoading={isLoading} setIsLoading={setIsLoading} />
          </TabPanel>
        )}

        {canManageSettings && (
          <TabPanel value={tabValue} index={3}>
            <OrganizationSettings isLoading={isLoading} setIsLoading={setIsLoading} />
          </TabPanel>
        )}
      </Paper>
    </Container>
  );
};