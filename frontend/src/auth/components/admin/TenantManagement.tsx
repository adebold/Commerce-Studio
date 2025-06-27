import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  CircularProgress,
  Pagination,
  Grid
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon,
  Pause as SuspendIcon,
  PlayArrow as ActivateIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

interface Tenant {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'suspended' | 'pending' | 'archived';
  plan?: string;
  billingEmail?: string;
  technicalContactEmail?: string;
  maxUsers?: number;
  createdAt: string;
  updatedAt: string;
  settings: {
    ssoEnabled: boolean;
    mfaEnabled?: boolean;
    mfaRequired?: boolean;
  };
}

interface TenantManagementProps {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const TenantManagement: React.FC<TenantManagementProps> = ({ isLoading, setIsLoading }) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  
  // Form state
  const [formName, setFormName] = useState('');
  const [formDomain, setFormDomain] = useState('');
  const [formPlan, setFormPlan] = useState('');
  const [formBillingEmail, setFormBillingEmail] = useState('');
  const [formTechnicalEmail, setFormTechnicalEmail] = useState('');
  const [formMaxUsers, setFormMaxUsers] = useState<number | ''>('');
  const [formSsoEnabled, setFormSsoEnabled] = useState(false);
  const [formMfaEnabled, setFormMfaEnabled] = useState(false);
  const [formMfaRequired, setFormMfaRequired] = useState(false);
  
  // We'll use the current user's permissions in actual API calls
  const { user: currentUser } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const canManageTenants = currentUser?.permissions?.includes('manage_tenants');
  
  // Fetch tenants on component mount and when page changes
  useEffect(() => {
    fetchTenants();
  }, [page]);
  
  const fetchTenants = async () => {
    try {
      setIsLoading(true);
      
      // Mock data for demonstration
      setTimeout(() => {
        const mockTenants: Tenant[] = [
          {
            id: 'tenant-1',
            name: 'Acme Corporation',
            domain: 'acme.varai.ai',
            status: 'active',
            plan: 'enterprise',
            billingEmail: 'billing@acme.com',
            technicalContactEmail: 'tech@acme.com',
            maxUsers: 100,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            settings: {
              ssoEnabled: true,
              mfaEnabled: true,
              mfaRequired: false
            }
          },
          {
            id: 'tenant-2',
            name: 'Globex Industries',
            domain: 'globex.varai.ai',
            status: 'active',
            plan: 'professional',
            billingEmail: 'billing@globex.com',
            technicalContactEmail: 'tech@globex.com',
            maxUsers: 50,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            settings: {
              ssoEnabled: false,
              mfaEnabled: true,
              mfaRequired: true
            }
          },
          {
            id: 'tenant-3',
            name: 'Initech LLC',
            domain: 'initech.varai.ai',
            status: 'suspended',
            plan: 'starter',
            billingEmail: 'billing@initech.com',
            technicalContactEmail: 'tech@initech.com',
            maxUsers: 10,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            settings: {
              ssoEnabled: false,
              mfaEnabled: false,
              mfaRequired: false
            }
          }
        ];
        
        setTenants(mockTenants);
        setTotalPages(1);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      setIsLoading(false);
    }
  };
  
  const handleEditTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setFormName(tenant.name);
    setFormDomain(tenant.domain);
    setFormPlan(tenant.plan || '');
    setFormBillingEmail(tenant.billingEmail || '');
    setFormTechnicalEmail(tenant.technicalContactEmail || '');
    setFormMaxUsers(tenant.maxUsers || '');
    setFormSsoEnabled(tenant.settings.ssoEnabled);
    setFormMfaEnabled(tenant.settings.mfaEnabled || false);
    setFormMfaRequired(tenant.settings.mfaRequired || false);
    setOpenEditDialog(true);
  };
  
  const handleDeleteTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setOpenDeleteDialog(true);
  };
  
  const handleCreateTenant = () => {
    setFormName('');
    setFormDomain('');
    setFormPlan('starter');
    setFormBillingEmail('');
    setFormTechnicalEmail('');
    setFormMaxUsers(10);
    setFormSsoEnabled(false);
    setFormMfaEnabled(false);
    setFormMfaRequired(false);
    setOpenCreateDialog(true);
  };
  
  const handleSuspendTenant = async (tenant: Tenant) => {
    try {
      setIsLoading(true);
      
      // Mock update for demonstration
      setTimeout(() => {
        setTenants(tenants.map(t => 
          t.id === tenant.id 
            ? { ...t, status: 'suspended', updatedAt: new Date().toISOString() } 
            : t
        ));
        
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error suspending tenant:', error);
      setIsLoading(false);
    }
  };
  
  const handleActivateTenant = async (tenant: Tenant) => {
    try {
      setIsLoading(true);
      
      // Mock update for demonstration
      setTimeout(() => {
        setTenants(tenants.map(t => 
          t.id === tenant.id 
            ? { ...t, status: 'active', updatedAt: new Date().toISOString() } 
            : t
        ));
        
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error activating tenant:', error);
      setIsLoading(false);
    }
  };
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  
  const handleSaveEdit = async () => {
    try {
      setIsLoading(true);
      
      // Mock update for demonstration
      setTimeout(() => {
        setTenants(tenants.map(t => 
          t.id === selectedTenant?.id 
            ? { 
                ...t, 
                name: formName,
                domain: formDomain,
                plan: formPlan,
                billingEmail: formBillingEmail,
                technicalContactEmail: formTechnicalEmail,
                maxUsers: typeof formMaxUsers === 'number' ? formMaxUsers : undefined,
                settings: {
                  ...t.settings,
                  ssoEnabled: formSsoEnabled,
                  mfaEnabled: formMfaEnabled,
                  mfaRequired: formMfaRequired
                },
                updatedAt: new Date().toISOString()
              } 
            : t
        ));
        
        setOpenEditDialog(false);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error updating tenant:', error);
      setIsLoading(false);
    }
  };
  
  const handleConfirmDelete = async () => {
    try {
      setIsLoading(true);
      
      // Mock delete for demonstration
      setTimeout(() => {
        setTenants(tenants.filter(t => t.id !== selectedTenant?.id));
        setOpenDeleteDialog(false);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error deleting tenant:', error);
      setIsLoading(false);
    }
  };
  
  const handleCreateSubmit = async () => {
    try {
      setIsLoading(true);
      
      // Mock create for demonstration
      setTimeout(() => {
        const newTenant: Tenant = {
          id: `tenant-${Date.now()}`,
          name: formName,
          domain: formDomain,
          status: 'active',
          plan: formPlan,
          billingEmail: formBillingEmail,
          technicalContactEmail: formTechnicalEmail,
          maxUsers: typeof formMaxUsers === 'number' ? formMaxUsers : undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          settings: {
            ssoEnabled: formSsoEnabled,
            mfaEnabled: formMfaEnabled,
            mfaRequired: formMfaRequired
          }
        };
        
        setTenants([...tenants, newTenant]);
        setOpenCreateDialog(false);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error creating tenant:', error);
      setIsLoading(false);
    }
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Organization Management</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleCreateTenant}
        >
          Create Organization
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Domain</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Users</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : tenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No organizations found
                </TableCell>
              </TableRow>
            ) : (
              tenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell>{tenant.name}</TableCell>
                  <TableCell>{tenant.domain}</TableCell>
                  <TableCell>
                    <Chip 
                      label={tenant.plan ? tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1) : 'Free'} 
                      color={tenant.plan === 'enterprise' ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)} 
                      color={
                        tenant.status === 'active' ? 'success' : 
                        tenant.status === 'suspended' ? 'warning' : 
                        tenant.status === 'pending' ? 'info' : 'error'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{tenant.maxUsers || 'Unlimited'}</TableCell>
                  <TableCell>{new Date(tenant.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditTenant(tenant)} size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    {tenant.status === 'active' ? (
                      <IconButton onClick={() => handleSuspendTenant(tenant)} size="small" color="warning">
                        <SuspendIcon fontSize="small" />
                      </IconButton>
                    ) : (
                      <IconButton onClick={() => handleActivateTenant(tenant)} size="small" color="success">
                        <ActivateIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton onClick={() => handleDeleteTenant(tenant)} size="small" color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange} 
            color="primary" 
          />
        </Box>
      )}
      
      {/* Edit Tenant Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Organization</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                label="Name"
                type="text"
                fullWidth
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                label="Domain"
                type="text"
                fullWidth
                value={formDomain}
                onChange={(e) => setFormDomain(e.target.value)}
                required
                helperText={`${formDomain}.varai.ai`}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                label="Plan"
                type="text"
                fullWidth
                value={formPlan}
                onChange={(e) => setFormPlan(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                label="Billing Email"
                type="email"
                fullWidth
                value={formBillingEmail}
                onChange={(e) => setFormBillingEmail(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                label="Technical Contact Email"
                type="email"
                fullWidth
                value={formTechnicalEmail}
                onChange={(e) => setFormTechnicalEmail(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                label="Max Users"
                type="number"
                fullWidth
                value={formMaxUsers}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormMaxUsers(value === '' ? '' : Number(value));
                }}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Security Settings
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  SSO Enabled:
                </Typography>
                <Chip 
                  label={formSsoEnabled ? 'Enabled' : 'Disabled'} 
                  color={formSsoEnabled ? 'success' : 'default'}
                  onClick={() => setFormSsoEnabled(!formSsoEnabled)}
                  sx={{ cursor: 'pointer' }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  MFA Enabled:
                </Typography>
                <Chip 
                  label={formMfaEnabled ? 'Enabled' : 'Disabled'} 
                  color={formMfaEnabled ? 'success' : 'default'}
                  onClick={() => setFormMfaEnabled(!formMfaEnabled)}
                  sx={{ cursor: 'pointer' }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  MFA Required:
                </Typography>
                <Chip 
                  label={formMfaRequired ? 'Required' : 'Optional'} 
                  color={formMfaRequired ? 'warning' : 'default'}
                  onClick={() => setFormMfaRequired(!formMfaRequired)}
                  sx={{ cursor: 'pointer' }}
                  disabled={!formMfaEnabled}
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveEdit} 
            variant="contained" 
            color="primary" 
            disabled={isLoading || !formName || !formDomain}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Tenant Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Organization</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the organization "{selectedTenant?.name}"? This action cannot be undone and will remove all associated data.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Create Tenant Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Organization</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                label="Name"
                type="text"
                fullWidth
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                label="Domain"
                type="text"
                fullWidth
                value={formDomain}
                onChange={(e) => setFormDomain(e.target.value)}
                required
                helperText={`${formDomain}.varai.ai`}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                label="Plan"
                type="text"
                fullWidth
                value={formPlan}
                onChange={(e) => setFormPlan(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                label="Billing Email"
                type="email"
                fullWidth
                value={formBillingEmail}
                onChange={(e) => setFormBillingEmail(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                label="Technical Contact Email"
                type="email"
                fullWidth
                value={formTechnicalEmail}
                onChange={(e) => setFormTechnicalEmail(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                label="Max Users"
                type="number"
                fullWidth
                value={formMaxUsers}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormMaxUsers(value === '' ? '' : Number(value));
                }}
                inputProps={{ min: 1 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateSubmit} 
            variant="contained" 
            color="primary" 
            disabled={isLoading || !formName || !formDomain}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};