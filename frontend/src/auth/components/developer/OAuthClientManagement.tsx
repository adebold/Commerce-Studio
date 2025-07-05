import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { 
  Add as AddIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

interface OAuthClient {
  id: string;
  name: string;
  clientId: string;
  clientType: 'confidential' | 'public';
  redirectUris: string[];
  allowedGrantTypes: string[];
  allowedScopes: string[];
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  isActive: boolean;
}

interface OAuthClientFormData {
  name: string;
  clientType: 'confidential' | 'public';
  redirectUris: string;
  allowedGrantTypes: string[];
  allowedScopes: string[];
  websiteUrl: string;
  privacyPolicyUrl: string;
  termsOfServiceUrl: string;
  contactEmail: string;
}

interface OAuthClientManagementProps {
  canManage: boolean;
}

const OAuthClientManagement: React.FC<OAuthClientManagementProps> = ({ canManage }) => {
  const { getAuthenticatedRequest } = useAuth();
  const [clients, setClients] = useState<OAuthClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [newClientDetails, setNewClientDetails] = useState<{ clientId: string; clientSecret: string | null } | null>(null);
  const [showFullSecret, setShowFullSecret] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [formData, setFormData] = useState<OAuthClientFormData>({
    name: '',
    clientType: 'confidential',
    redirectUris: '',
    allowedGrantTypes: ['authorization_code'],
    allowedScopes: ['profile', 'email'],
    websiteUrl: '',
    privacyPolicyUrl: '',
    termsOfServiceUrl: '',
    contactEmail: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchClients = async () => {
    try {
      setLoading(true);
      const request = getAuthenticatedRequest();
      const response = await request.get('/api/developer/oauth/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching OAuth clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCreateDialogOpen = () => {
    setOpenCreateDialog(true);
  };

  const handleCreateDialogClose = () => {
    setOpenCreateDialog(false);
    setFormData({
      name: '',
      clientType: 'confidential',
      redirectUris: '',
      allowedGrantTypes: ['authorization_code'],
      allowedScopes: ['profile', 'email'],
      websiteUrl: '',
      privacyPolicyUrl: '',
      termsOfServiceUrl: '',
      contactEmail: ''
    });
    setFormErrors({});
  };

  const handleDeleteDialogOpen = (clientId: string) => {
    setSelectedClientId(clientId);
    setOpenDeleteDialog(true);
  };

  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
    setSelectedClientId(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const handleGrantTypeChange = (event: SelectChangeEvent<string[]>) => {
    setFormData({
      ...formData,
      allowedGrantTypes: event.target.value as string[]
    });
  };

  const handleScopeChange = (event: SelectChangeEvent<string[]>) => {
    setFormData({
      ...formData,
      allowedScopes: event.target.value as string[]
    });
  };

  const handleClientTypeChange = (event: SelectChangeEvent<'confidential' | 'public'>) => {
    setFormData({
      ...formData,
      clientType: event.target.value as 'confidential' | 'public'
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.redirectUris.trim()) {
      errors.redirectUris = 'At least one redirect URI is required';
    } else {
      // Validate each URI
      const uris = formData.redirectUris.split(',').map(uri => uri.trim());
      for (const uri of uris) {
        try {
          new URL(uri);
        } catch (e) {
          errors.redirectUris = 'Invalid URI format. URIs must be absolute with protocol (e.g., https://example.com/callback)';
          break;
        }
      }
    }
    
    if (formData.allowedGrantTypes.length === 0) {
      errors.allowedGrantTypes = 'At least one grant type is required';
    }
    
    if (formData.allowedScopes.length === 0) {
      errors.allowedScopes = 'At least one scope is required';
    }
    
    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      errors.contactEmail = 'Invalid email format';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateClient = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      const request = getAuthenticatedRequest();
      const response = await request.post('/api/developer/oauth/clients', {
        name: formData.name,
        clientType: formData.clientType,
        redirectUris: formData.redirectUris.split(',').map(uri => uri.trim()),
        allowedGrantTypes: formData.allowedGrantTypes,
        allowedScopes: formData.allowedScopes,
        websiteUrl: formData.websiteUrl || undefined,
        privacyPolicyUrl: formData.privacyPolicyUrl || undefined,
        termsOfServiceUrl: formData.termsOfServiceUrl || undefined,
        contactEmail: formData.contactEmail || undefined
      });

      setNewClientDetails({
        clientId: response.data.clientId,
        clientSecret: response.data.clientSecret
      });
      
      await fetchClients();
      handleCreateDialogClose();
    } catch (error) {
      console.error('Error creating OAuth client:', error);
    }
  };

  const handleDeleteClient = async () => {
    if (!selectedClientId) return;

    try {
      const request = getAuthenticatedRequest();
      await request.delete(`/api/developer/oauth/clients/${selectedClientId}`);
      await fetchClients();
      handleDeleteDialogClose();
    } catch (error) {
      console.error('Error deleting OAuth client:', error);
    }
  };

  const handleResetClientSecret = async (clientId: string) => {
    try {
      const request = getAuthenticatedRequest();
      const response = await request.post(`/api/developer/oauth/clients/${clientId}/reset-secret`);
      
      setNewClientDetails({
        clientId: response.data.clientId,
        clientSecret: response.data.clientSecret
      });
      
      await fetchClients();
    } catch (error) {
      console.error('Error resetting client secret:', error);
    }
  };

  const handleCopySecret = () => {
    if (newClientDetails?.clientSecret) {
      navigator.clipboard.writeText(newClientDetails.clientSecret);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
    }
  };

  const handleCopyClientId = () => {
    if (newClientDetails?.clientId) {
      navigator.clipboard.writeText(newClientDetails.clientId);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
    }
  };

  const getGrantTypeLabel = (grantType: string): string => {
    switch (grantType) {
      case 'authorization_code':
        return 'Authorization Code';
      case 'client_credentials':
        return 'Client Credentials';
      case 'implicit':
        return 'Implicit';
      case 'refresh_token':
        return 'Refresh Token';
      default:
        return grantType;
    }
  };

  const getScopeLabel = (scope: string): string => {
    switch (scope) {
      case 'profile':
        return 'Profile';
      case 'email':
        return 'Email';
      case 'products:read':
        return 'Products (Read)';
      case 'products:write':
        return 'Products (Write)';
      case 'analytics:read':
        return 'Analytics';
      case 'recommendations:read':
        return 'Recommendations';
      case 'virtual-try-on:read':
        return 'Virtual Try-On';
      case 'users:read':
        return 'Users (Read)';
      case 'users:write':
        return 'Users (Write)';
      case 'admin':
        return 'Admin';
      default:
        return scope;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">OAuth Clients</Typography>
        {canManage && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateDialogOpen}
          >
            Register OAuth Client
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Client ID</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Grant Types</TableCell>
              <TableCell>Scopes</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Loading...</TableCell>
              </TableRow>
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">No OAuth clients found</TableCell>
              </TableRow>
            ) : (
              clients
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>{client.name}</TableCell>
                    <TableCell>{client.clientId.substring(0, 8)}...</TableCell>
                    <TableCell>
                      <Chip 
                        label={client.clientType === 'confidential' ? 'Confidential' : 'Public'} 
                        color={client.clientType === 'confidential' ? 'primary' : 'secondary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {client.allowedGrantTypes.map((grantType) => (
                        <Chip
                          key={grantType}
                          label={getGrantTypeLabel(grantType)}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </TableCell>
                    <TableCell>
                      {client.allowedScopes.map((scope) => (
                        <Chip
                          key={scope}
                          label={getScopeLabel(scope)}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={client.isActive ? 'Active' : 'Inactive'} 
                        color={client.isActive ? 'success' : 'error'}
                        size="small"
                      />
                      {client.isVerified && (
                        <Chip 
                          label="Verified" 
                          color="info"
                          size="small"
                          sx={{ ml: 0.5 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {canManage && (
                        <>
                          <Tooltip title="Edit Client">
                            <IconButton size="small">
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          {client.clientType === 'confidential' && (
                            <Tooltip title="Reset Client Secret">
                              <IconButton
                                size="small"
                                onClick={() => handleResetClientSecret(client.id)}
                              >
                                <RefreshIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Delete Client">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteDialogOpen(client.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={clients.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Create OAuth Client Dialog */}
      <Dialog open={openCreateDialog} onClose={handleCreateDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Register OAuth Client</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Client Name"
                fullWidth
                value={formData.name}
                onChange={handleInputChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="client-type-label">Client Type</InputLabel>
                <Select
                  labelId="client-type-label"
                  value={formData.clientType}
                  onChange={handleClientTypeChange}
                  label="Client Type"
                >
                  <MenuItem value="confidential">Confidential (with secret)</MenuItem>
                  <MenuItem value="public">Public (no secret)</MenuItem>
                </Select>
                <FormHelperText>
                  {formData.clientType === 'confidential' 
                    ? 'For server-side applications that can securely store a client secret' 
                    : 'For client-side applications (browser, mobile) that cannot securely store secrets'}
                </FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.allowedGrantTypes}>
                <InputLabel id="grant-types-label">Grant Types</InputLabel>
                <Select
                  labelId="grant-types-label"
                  multiple
                  value={formData.allowedGrantTypes}
                  onChange={handleGrantTypeChange}
                  label="Grant Types"
                >
                  <MenuItem value="authorization_code">Authorization Code</MenuItem>
                  <MenuItem value="client_credentials">Client Credentials</MenuItem>
                  <MenuItem value="implicit">Implicit</MenuItem>
                  <MenuItem value="refresh_token">Refresh Token</MenuItem>
                </Select>
                <FormHelperText error={!!formErrors.allowedGrantTypes}>
                  {formErrors.allowedGrantTypes || 'Select the OAuth 2.0 grant types your application will use'}
                </FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="redirectUris"
                label="Redirect URIs"
                fullWidth
                value={formData.redirectUris}
                onChange={handleInputChange}
                error={!!formErrors.redirectUris}
                helperText={formErrors.redirectUris || 'Comma-separated list of allowed redirect URIs (e.g., https://example.com/callback)'}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth error={!!formErrors.allowedScopes}>
                <InputLabel id="scopes-label">Scopes</InputLabel>
                <Select
                  labelId="scopes-label"
                  multiple
                  value={formData.allowedScopes}
                  onChange={handleScopeChange}
                  label="Scopes"
                >
                  <MenuItem value="profile">Profile</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="products:read">Products (Read)</MenuItem>
                  <MenuItem value="products:write">Products (Write)</MenuItem>
                  <MenuItem value="analytics:read">Analytics</MenuItem>
                  <MenuItem value="recommendations:read">Recommendations</MenuItem>
                  <MenuItem value="virtual-try-on:read">Virtual Try-On</MenuItem>
                  <MenuItem value="users:read">Users (Read)</MenuItem>
                  <MenuItem value="users:write">Users (Write)</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
                <FormHelperText error={!!formErrors.allowedScopes}>
                  {formErrors.allowedScopes || 'Select the scopes your application will request'}
                </FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Additional Information (Optional)
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="websiteUrl"
                label="Website URL"
                fullWidth
                value={formData.websiteUrl}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="contactEmail"
                label="Contact Email"
                fullWidth
                value={formData.contactEmail}
                onChange={handleInputChange}
                error={!!formErrors.contactEmail}
                helperText={formErrors.contactEmail}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="privacyPolicyUrl"
                label="Privacy Policy URL"
                fullWidth
                value={formData.privacyPolicyUrl}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="termsOfServiceUrl"
                label="Terms of Service URL"
                fullWidth
                value={formData.termsOfServiceUrl}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateDialogClose}>Cancel</Button>
          <Button 
            onClick={handleCreateClient} 
            variant="contained"
          >
            Register Client
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete OAuth Client Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleDeleteDialogClose}>
        <DialogTitle>Delete OAuth Client</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this OAuth client? This action cannot be undone and will invalidate any tokens issued to this client.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteClient} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Client Credentials Dialog */}
      <Dialog open={!!newClientDetails} maxWidth="md" fullWidth>
        <DialogTitle>OAuth Client Credentials</DialogTitle>
        <DialogContent>
          <DialogContentText color="error" sx={{ mb: 2 }}>
            {newClientDetails?.clientSecret 
              ? 'This is the only time your client secret will be shown. Please copy it now and store it securely.'
              : 'Your OAuth client has been registered successfully.'}
          </DialogContentText>
          
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mr: 1, minWidth: 100 }}>
                  Client ID:
                </Typography>
                <Box sx={{ flex: 1, fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                  {newClientDetails?.clientId}
                </Box>
                <IconButton onClick={handleCopyClientId} size="small">
                  <CopyIcon />
                </IconButton>
              </Box>
              
              {newClientDetails?.clientSecret && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="subtitle2" sx={{ mr: 1, minWidth: 100 }}>
                    Client Secret:
                  </Typography>
                  <Box sx={{ flex: 1, fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                    {showFullSecret 
                      ? newClientDetails.clientSecret 
                      : `${newClientDetails.clientSecret.substring(0, 8)}...${newClientDetails.clientSecret.slice(-4)}`}
                  </Box>
                  <IconButton onClick={() => setShowFullSecret(!showFullSecret)} size="small" sx={{ ml: 1 }}>
                    {showFullSecret ? <HideIcon /> : <ViewIcon />}
                  </IconButton>
                  <IconButton onClick={handleCopySecret} size="small">
                    <CopyIcon />
                  </IconButton>
                </Box>
              )}
              
              {showCopiedMessage && (
                <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                  Copied to clipboard!
                </Typography>
              )}
            </CardContent>
          </Card>
          
          <Typography variant="subtitle2" gutterBottom>
            Next Steps:
          </Typography>
          <Typography variant="body2" paragraph>
            1. Use these credentials to authenticate your application with the VARAi API.
          </Typography>
          <Typography variant="body2" paragraph>
            2. Refer to the documentation for implementation details for your selected grant types.
          </Typography>
          <Typography variant="body2">
            3. Ensure your redirect URIs are correctly configured in your application.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewClientDetails(null)} variant="contained">
            I've Saved My Credentials
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OAuthClientManagement;