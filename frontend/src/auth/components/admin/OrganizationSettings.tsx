import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Divider,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  CardHeader,
  Alert,
  Snackbar,
  InputAdornment,
  Chip
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

interface OrganizationSettingsProps {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  passwordExpiryDays: number;
  preventPasswordReuse: number;
}

interface BrandingSettings {
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  faviconUrl: string;
}

interface SecuritySettings {
  ssoEnabled: boolean;
  mfaEnabled: boolean;
  mfaRequired: boolean;
  sessionTimeoutMinutes: number;
  allowedDomains: string[];
}

export const OrganizationSettings: React.FC<OrganizationSettingsProps> = ({ isLoading, setIsLoading }) => {
  // Organization details
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [billingEmail, setBillingEmail] = useState('');
  const [technicalEmail, setTechnicalEmail] = useState('');
  
  // Password policy
  const [passwordPolicy, setPasswordPolicy] = useState<PasswordPolicy>({
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    passwordExpiryDays: 90,
    preventPasswordReuse: 5
  });
  
  // Branding settings
  const [branding, setBranding] = useState<BrandingSettings>({
    logoUrl: '',
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
    faviconUrl: ''
  });
  
  // Security settings
  const [security, setSecurity] = useState<SecuritySettings>({
    ssoEnabled: false,
    mfaEnabled: false,
    mfaRequired: false,
    sessionTimeoutMinutes: 60,
    allowedDomains: []
  });
  
  // New domain to add
  const [newDomain, setNewDomain] = useState('');
  
  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  
  // We'll use the current user's tenant ID in actual API calls
  const { user: currentUser } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const tenantId = currentUser?.tenantId;
  
  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);
  
  const loadSettings = async () => {
    try {
      setIsLoading(true);
      
      // This would be replaced with actual API calls
      // For example:
      // const tenantResponse = await fetch(`/api/tenants/${tenantId}`);
      // const tenantData = await tenantResponse.json();
      // const passwordPolicyResponse = await fetch(`/api/tenants/${tenantId}/password-policy`);
      // const passwordPolicyData = await passwordPolicyResponse.json();
      // etc.
      
      // Mock data for demonstration
      setTimeout(() => {
        setName('Acme Corporation');
        setDomain('acme.varai.ai');
        setBillingEmail('billing@acme.com');
        setTechnicalEmail('tech@acme.com');
        
        setPasswordPolicy({
          minLength: 10,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true,
          passwordExpiryDays: 90,
          preventPasswordReuse: 5
        });
        
        setBranding({
          logoUrl: 'https://example.com/logo.png',
          primaryColor: '#007bff',
          secondaryColor: '#6c757d',
          faviconUrl: 'https://example.com/favicon.ico'
        });
        
        setSecurity({
          ssoEnabled: true,
          mfaEnabled: true,
          mfaRequired: false,
          sessionTimeoutMinutes: 60,
          allowedDomains: ['acme.com', 'acmecorp.com']
        });
        
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error loading settings:', error);
      setIsLoading(false);
      showNotification('Failed to load settings', 'error');
    }
  };
  
  const saveOrganizationDetails = async () => {
    try {
      setIsLoading(true);
      
      // This would be replaced with an actual API call
      // For example:
      // await fetch(`/api/tenants/${tenantId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     name,
      //     domain,
      //     billingEmail,
      //     technicalContactEmail: technicalEmail
      //   })
      // });
      
      // Mock update for demonstration
      setTimeout(() => {
        setIsLoading(false);
        showNotification('Organization details saved successfully', 'success');
      }, 500);
    } catch (error) {
      console.error('Error saving organization details:', error);
      setIsLoading(false);
      showNotification('Failed to save organization details', 'error');
    }
  };
  
  const savePasswordPolicy = async () => {
    try {
      setIsLoading(true);
      
      // This would be replaced with an actual API call
      // For example:
      // await fetch(`/api/tenants/${tenantId}/password-policy`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(passwordPolicy)
      // });
      
      // Mock update for demonstration
      setTimeout(() => {
        setIsLoading(false);
        showNotification('Password policy saved successfully', 'success');
      }, 500);
    } catch (error) {
      console.error('Error saving password policy:', error);
      setIsLoading(false);
      showNotification('Failed to save password policy', 'error');
    }
  };
  
  const saveBrandingSettings = async () => {
    try {
      setIsLoading(true);
      
      // This would be replaced with an actual API call
      // For example:
      // await fetch(`/api/tenants/${tenantId}/branding`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(branding)
      // });
      
      // Mock update for demonstration
      setTimeout(() => {
        setIsLoading(false);
        showNotification('Branding settings saved successfully', 'success');
      }, 500);
    } catch (error) {
      console.error('Error saving branding settings:', error);
      setIsLoading(false);
      showNotification('Failed to save branding settings', 'error');
    }
  };
  
  const saveSecuritySettings = async () => {
    try {
      setIsLoading(true);
      
      // This would be replaced with an actual API call
      // For example:
      // await fetch(`/api/tenants/${tenantId}/security`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(security)
      // });
      
      // Mock update for demonstration
      setTimeout(() => {
        setIsLoading(false);
        showNotification('Security settings saved successfully', 'success');
      }, 500);
    } catch (error) {
      console.error('Error saving security settings:', error);
      setIsLoading(false);
      showNotification('Failed to save security settings', 'error');
    }
  };
  
  const handlePasswordPolicyChange = (field: keyof PasswordPolicy, value: boolean | number) => {
    setPasswordPolicy({
      ...passwordPolicy,
      [field]: value
    });
  };
  
  const handleBrandingChange = (field: keyof BrandingSettings, value: string) => {
    setBranding({
      ...branding,
      [field]: value
    });
  };
  
  const handleSecurityChange = (field: keyof SecuritySettings, value: boolean | number | string[]) => {
    setSecurity({
      ...security,
      [field]: value
    });
  };
  
  const addAllowedDomain = () => {
    if (newDomain && !security.allowedDomains.includes(newDomain)) {
      handleSecurityChange('allowedDomains', [...security.allowedDomains, newDomain]);
      setNewDomain('');
    }
  };
  
  const removeAllowedDomain = (domain: string) => {
    handleSecurityChange(
      'allowedDomains',
      security.allowedDomains.filter(d => d !== domain)
    );
  };
  
  const showNotification = (message: string, severity: 'success' | 'error') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };
  
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Organization Settings
      </Typography>
      
      <Grid container spacing={3}>
        {/* Organization Details */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Organization Details" />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Organization Name"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Domain"
                    fullWidth
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">.varai.ai</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Billing Email"
                    fullWidth
                    type="email"
                    value={billingEmail}
                    onChange={(e) => setBillingEmail(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Technical Contact Email"
                    fullWidth
                    type="email"
                    value={technicalEmail}
                    onChange={(e) => setTechnicalEmail(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={saveOrganizationDetails}
                      disabled={isLoading}
                    >
                      {isLoading ? <CircularProgress size={24} /> : 'Save'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Password Policy */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Password Policy" />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Minimum Password Length"
                    fullWidth
                    type="number"
                    value={passwordPolicy.minLength}
                    onChange={(e) => handlePasswordPolicyChange('minLength', Number(e.target.value))}
                    inputProps={{ min: 6 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={passwordPolicy.requireUppercase}
                        onChange={(e) => handlePasswordPolicyChange('requireUppercase', e.target.checked)}
                      />
                    }
                    label="Require Uppercase Letters"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={passwordPolicy.requireLowercase}
                        onChange={(e) => handlePasswordPolicyChange('requireLowercase', e.target.checked)}
                      />
                    }
                    label="Require Lowercase Letters"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={passwordPolicy.requireNumbers}
                        onChange={(e) => handlePasswordPolicyChange('requireNumbers', e.target.checked)}
                      />
                    }
                    label="Require Numbers"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={passwordPolicy.requireSpecialChars}
                        onChange={(e) => handlePasswordPolicyChange('requireSpecialChars', e.target.checked)}
                      />
                    }
                    label="Require Special Characters"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Password Expiry (Days)"
                    fullWidth
                    type="number"
                    value={passwordPolicy.passwordExpiryDays}
                    onChange={(e) => handlePasswordPolicyChange('passwordExpiryDays', Number(e.target.value))}
                    inputProps={{ min: 0 }}
                    helperText="0 = Never expires"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Prevent Password Reuse (Count)"
                    fullWidth
                    type="number"
                    value={passwordPolicy.preventPasswordReuse}
                    onChange={(e) => handlePasswordPolicyChange('preventPasswordReuse', Number(e.target.value))}
                    inputProps={{ min: 0 }}
                    helperText="0 = No restriction"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={savePasswordPolicy}
                      disabled={isLoading}
                    >
                      {isLoading ? <CircularProgress size={24} /> : 'Save'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Security Settings" />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={security.ssoEnabled}
                        onChange={(e) => handleSecurityChange('ssoEnabled', e.target.checked)}
                      />
                    }
                    label="Enable Single Sign-On (SSO)"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={security.mfaEnabled}
                        onChange={(e) => handleSecurityChange('mfaEnabled', e.target.checked)}
                      />
                    }
                    label="Enable Multi-Factor Authentication (MFA)"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={security.mfaRequired}
                        onChange={(e) => handleSecurityChange('mfaRequired', e.target.checked)}
                        disabled={!security.mfaEnabled}
                      />
                    }
                    label="Require MFA for All Users"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Session Timeout (Minutes)"
                    fullWidth
                    type="number"
                    value={security.sessionTimeoutMinutes}
                    onChange={(e) => handleSecurityChange('sessionTimeoutMinutes', Number(e.target.value))}
                    inputProps={{ min: 5 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Allowed Email Domains
                  </Typography>
                  <Box sx={{ display: 'flex', mb: 1 }}>
                    <TextField
                      label="Domain"
                      size="small"
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                      sx={{ flexGrow: 1, mr: 1 }}
                    />
                    <Button
                      variant="contained"
                      onClick={addAllowedDomain}
                      disabled={!newDomain}
                    >
                      Add
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {security.allowedDomains.map((domain) => (
                      <Chip
                        key={domain}
                        label={domain}
                        onDelete={() => removeAllowedDomain(domain)}
                      />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={saveSecuritySettings}
                      disabled={isLoading}
                    >
                      {isLoading ? <CircularProgress size={24} /> : 'Save'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Branding Settings */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Branding Settings" />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Logo URL"
                    fullWidth
                    value={branding.logoUrl}
                    onChange={(e) => handleBrandingChange('logoUrl', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Favicon URL"
                    fullWidth
                    value={branding.faviconUrl}
                    onChange={(e) => handleBrandingChange('faviconUrl', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Primary Color
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1,
                        bgcolor: branding.primaryColor,
                        mr: 2,
                        border: '1px solid #ccc'
                      }}
                    />
                    <TextField
                      fullWidth
                      value={branding.primaryColor}
                      onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Secondary Color
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1,
                        bgcolor: branding.secondaryColor,
                        mr: 2,
                        border: '1px solid #ccc'
                      }}
                    />
                    <TextField
                      fullWidth
                      value={branding.secondaryColor}
                      onChange={(e) => handleBrandingChange('secondaryColor', e.target.value)}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={saveBrandingSettings}
                      disabled={isLoading}
                    >
                      {isLoading ? <CircularProgress size={24} /> : 'Save'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
