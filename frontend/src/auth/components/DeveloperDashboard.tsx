import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Box, Container, Tab, Tabs, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import ApiKeyManagement from './developer/ApiKeyManagement';
import OAuthClientManagement from './developer/OAuthClientManagement';
import UsageAnalytics from './developer/UsageAnalytics';
import DocumentationPanel from './developer/DocumentationPanel';

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
      id={`developer-tabpanel-${index}`}
      aria-labelledby={`developer-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: theme.typography.fontWeightRegular,
  fontSize: theme.typography.pxToRem(15),
  marginRight: theme.spacing(1),
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightMedium,
  },
}));

const DeveloperDashboard: React.FC = () => {
  const { isAuthenticated, hasPermission } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [canManageApiKeys, setCanManageApiKeys] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      if (isAuthenticated) {
        const hasApiKeyPermission = await hasPermission('manage_tenant_api_keys');
        setCanManageApiKeys(hasApiKeyPermission);
      }
    };

    checkPermissions();
  }, [isAuthenticated, hasPermission]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!isAuthenticated) {
    return (
      <Container>
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Developer Dashboard
          </Typography>
          <Typography variant="body1">
            Please sign in to access the developer dashboard.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Developer Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Manage your API keys, OAuth clients, and monitor API usage
        </Typography>

        <Box sx={{ width: '100%', mt: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <StyledTabs value={tabValue} onChange={handleTabChange} aria-label="developer dashboard tabs">
              <StyledTab label="API Keys" />
              <StyledTab label="OAuth Clients" />
              <StyledTab label="Usage Analytics" />
              <StyledTab label="Documentation" />
            </StyledTabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <ApiKeyManagement canManage={canManageApiKeys} />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <OAuthClientManagement canManage={canManageApiKeys} />
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <UsageAnalytics />
          </TabPanel>
          
          <TabPanel value={tabValue} index={3}>
            <DocumentationPanel />
          </TabPanel>
        </Box>
      </Box>
    </Container>
  );
};

export default DeveloperDashboard;