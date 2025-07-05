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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  CircularProgress,
  Pagination,
  FormControlLabel,
  Switch
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isCustom: boolean;
  scope: 'system' | 'tenant' | 'client' | 'brand';
  createdAt: string;
  updatedAt: string;
}

interface RoleManagementProps {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const RoleManagement: React.FC<RoleManagementProps> = ({ isLoading, setIsLoading }) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  
  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPermissions, setFormPermissions] = useState<string[]>([]);
  const [formScope, setFormScope] = useState<'tenant' | 'client' | 'brand'>('tenant');
  
  // We'll use the current user's tenant ID in actual API calls
  const { user: currentUser } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const tenantId = currentUser?.tenantId;
  
  // Fetch roles on component mount and when page changes
  useEffect(() => {
    fetchRoles();
  }, [page]);
  
  // Fetch available permissions on component mount
  useEffect(() => {
    fetchPermissions();
  }, []);
  
  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      
      // This would be replaced with an actual API call
      // For example:
      // const response = await fetch(`/api/tenants/${tenantId}/roles?page=${page}&pageSize=10`);
      // const data = await response.json();
      // setRoles(data.data);
      // setTotalPages(data.pagination.totalPages);
      
      // Mock data for demonstration
      setTimeout(() => {
        const mockRoles: Role[] = [
          {
            id: 'tenant_admin',
            name: 'Tenant Admin',
            description: 'Full access to all tenant resources',
            permissions: [
              'manage_tenant_settings',
              'manage_tenant_users',
              'manage_tenant_billing',
              'manage_tenant_api_keys',
              'manage_clients',
              'manage_client_users',
              'customize_reports',
              'manage_brands',
              'view_brand_analytics',
              'view_reports',
              'view_recommendations',
              'manage_profile'
            ],
            isCustom: false,
            scope: 'tenant',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'tenant_manager',
            name: 'Tenant Manager',
            description: 'Manage tenant resources but cannot modify tenant settings',
            permissions: [
              'manage_clients',
              'manage_client_users',
              'customize_reports',
              'manage_brands',
              'view_brand_analytics',
              'view_reports',
              'view_recommendations',
              'manage_profile'
            ],
            isCustom: false,
            scope: 'tenant',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'custom_role',
            name: 'Custom Role',
            description: 'A custom role with limited permissions',
            permissions: [
              'view_reports',
              'view_recommendations',
              'manage_profile'
            ],
            isCustom: true,
            scope: 'tenant',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        
        setRoles(mockRoles);
        setTotalPages(1);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setIsLoading(false);
    }
  };
  
  const fetchPermissions = async () => {
    try {
      // This would be replaced with an actual API call
      // For example:
      // const response = await fetch(`/api/permissions`);
      // const data = await response.json();
      // setAvailablePermissions(data);
      
      // Mock data for demonstration
      const mockPermissions: Permission[] = [
        {
          id: 'manage_tenant_settings',
          name: 'Manage Tenant Settings',
          description: 'Can modify tenant settings',
          category: 'Tenant'
        },
        {
          id: 'manage_tenant_users',
          name: 'Manage Tenant Users',
          description: 'Can manage tenant users',
          category: 'Tenant'
        },
        {
          id: 'manage_tenant_billing',
          name: 'Manage Tenant Billing',
          description: 'Can manage tenant billing',
          category: 'Tenant'
        },
        {
          id: 'manage_tenant_api_keys',
          name: 'Manage Tenant API Keys',
          description: 'Can manage tenant API keys',
          category: 'Tenant'
        },
        {
          id: 'manage_clients',
          name: 'Manage Clients',
          description: 'Can manage clients',
          category: 'Client'
        },
        {
          id: 'manage_client_users',
          name: 'Manage Client Users',
          description: 'Can manage client users',
          category: 'Client'
        },
        {
          id: 'customize_reports',
          name: 'Customize Reports',
          description: 'Can customize reports',
          category: 'Reports'
        },
        {
          id: 'manage_brands',
          name: 'Manage Brands',
          description: 'Can manage brands',
          category: 'Brand'
        },
        {
          id: 'view_brand_analytics',
          name: 'View Brand Analytics',
          description: 'Can view brand analytics',
          category: 'Brand'
        },
        {
          id: 'view_reports',
          name: 'View Reports',
          description: 'Can view reports',
          category: 'Reports'
        },
        {
          id: 'view_recommendations',
          name: 'View Recommendations',
          description: 'Can view recommendations',
          category: 'Recommendations'
        },
        {
          id: 'manage_profile',
          name: 'Manage Profile',
          description: 'Can manage own profile',
          category: 'User'
        }
      ];
      
      setAvailablePermissions(mockPermissions);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };
  
  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setFormName(role.name);
    setFormDescription(role.description);
    setFormPermissions(role.permissions);
    setFormScope(role.scope as 'tenant' | 'client' | 'brand');
    setOpenEditDialog(true);
  };
  
  const handleDeleteRole = (role: Role) => {
    setSelectedRole(role);
    setOpenDeleteDialog(true);
  };
  
  const handleCreateRole = () => {
    setFormName('');
    setFormDescription('');
    setFormPermissions([]);
    setFormScope('tenant');
    setOpenCreateDialog(true);
  };
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePermissionChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setFormPermissions(typeof value === 'string' ? value.split(',') : value);
  };
  
  const handleScopeChange = (event: SelectChangeEvent<'tenant' | 'client' | 'brand'>) => {
    setFormScope(event.target.value as 'tenant' | 'client' | 'brand');
  };
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  
  const handleSaveEdit = async () => {
    try {
      setIsLoading(true);
      
      // This would be replaced with an actual API call
      // For example:
      // await fetch(`/api/tenants/${tenantId}/roles/${selectedRole?.id}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     name: formName,
      //     description: formDescription,
      //     permissions: formPermissions,
      //     scope: formScope
      //   })
      // });
      
      // Mock update for demonstration
      setTimeout(() => {
        setRoles(roles.map(r => 
          r.id === selectedRole?.id 
            ? { 
                ...r, 
                name: formName, 
                description: formDescription, 
                permissions: formPermissions,
                scope: formScope,
                updatedAt: new Date().toISOString()
              } 
            : r
        ));
        
        setOpenEditDialog(false);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error updating role:', error);
      setIsLoading(false);
    }
  };
  
  const handleConfirmDelete = async () => {
    try {
      setIsLoading(true);
      
      // This would be replaced with an actual API call
      // For example:
      // await fetch(`/api/tenants/${tenantId}/roles/${selectedRole?.id}`, {
      //   method: 'DELETE'
      // });
      
      // Mock delete for demonstration
      setTimeout(() => {
        setRoles(roles.filter(r => r.id !== selectedRole?.id));
        setOpenDeleteDialog(false);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error deleting role:', error);
      setIsLoading(false);
    }
  };
  
  const handleCreateSubmit = async () => {
    try {
      setIsLoading(true);
      
      // This would be replaced with an actual API call
      // For example:
      // const response = await fetch(`/api/tenants/${tenantId}/roles`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     name: formName,
      //     description: formDescription,
      //     permissions: formPermissions,
      //     scope: formScope
      //   })
      // });
      // const data = await response.json();
      
      // Mock create for demonstration
      setTimeout(() => {
        const newRole: Role = {
          id: `custom-${Date.now()}`,
          name: formName,
          description: formDescription,
          permissions: formPermissions,
          isCustom: true,
          scope: formScope,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setRoles([...roles, newRole]);
        setOpenCreateDialog(false);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error creating role:', error);
      setIsLoading(false);
    }
  };
  
  const getPermissionName = (permissionId: string): string => {
    const permission = availablePermissions.find(p => p.id === permissionId);
    return permission ? permission.name : permissionId;
  };
  
  const getPermissionsByCategory = () => {
    const categories: Record<string, Permission[]> = {};
    
    availablePermissions.forEach(permission => {
      if (!categories[permission.category]) {
        categories[permission.category] = [];
      }
      categories[permission.category].push(permission);
    });
    
    return categories;
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Role Management</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleCreateRole}
        >
          Create Role
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Permissions</TableCell>
              <TableCell>Scope</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No roles found
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>{role.name}</TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>
                    {role.permissions.length > 3 ? (
                      <>
                        {role.permissions.slice(0, 3).map(permission => (
                          <Chip 
                            key={permission} 
                            label={getPermissionName(permission)} 
                            size="small" 
                            sx={{ mr: 0.5, mb: 0.5 }} 
                          />
                        ))}
                        <Chip 
                          label={`+${role.permissions.length - 3} more`} 
                          size="small" 
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }} 
                        />
                      </>
                    ) : (
                      role.permissions.map(permission => (
                        <Chip 
                          key={permission} 
                          label={getPermissionName(permission)} 
                          size="small" 
                          sx={{ mr: 0.5, mb: 0.5 }} 
                        />
                      ))
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={role.scope.charAt(0).toUpperCase() + role.scope.slice(1)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={role.isCustom ? 'Custom' : 'Default'} 
                      color={role.isCustom ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      onClick={() => handleEditRole(role)} 
                      size="small"
                      disabled={!role.isCustom}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDeleteRole(role)} 
                      size="small" 
                      color="error"
                      disabled={!role.isCustom}
                    >
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
      
      {/* Edit Role Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Role</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            multiline
            rows={2}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="scope-select-label">Scope</InputLabel>
            <Select
              labelId="scope-select-label"
              value={formScope}
              onChange={handleScopeChange}
              label="Scope"
            >
              <MenuItem value="tenant">Tenant</MenuItem>
              <MenuItem value="client">Client</MenuItem>
              <MenuItem value="brand">Brand</MenuItem>
            </Select>
          </FormControl>
          
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            Permissions
          </Typography>
          
          {Object.entries(getPermissionsByCategory()).map(([category, permissions]) => (
            <Box key={category} sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {category}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {permissions.map(permission => (
                  <FormControlLabel
                    key={permission.id}
                    control={
                      <Switch
                        checked={formPermissions.includes(permission.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormPermissions([...formPermissions, permission.id]);
                          } else {
                            setFormPermissions(formPermissions.filter(p => p !== permission.id));
                          }
                        }}
                      />
                    }
                    label={permission.name}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveEdit} 
            variant="contained" 
            color="primary" 
            disabled={isLoading || !formName || formPermissions.length === 0}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Role Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Role</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the role "{selectedRole?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Create Role Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Role</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            multiline
            rows={2}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="create-scope-select-label">Scope</InputLabel>
            <Select
              labelId="create-scope-select-label"
              value={formScope}
              onChange={handleScopeChange}
              label="Scope"
            >
              <MenuItem value="tenant">Tenant</MenuItem>
              <MenuItem value="client">Client</MenuItem>
              <MenuItem value="brand">Brand</MenuItem>
            </Select>
          </FormControl>
          
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            Permissions
          </Typography>
          
          {Object.entries(getPermissionsByCategory()).map(([category, permissions]) => (
            <Box key={category} sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {category}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {permissions.map(permission => (
                  <FormControlLabel
                    key={permission.id}
                    control={
                      <Switch
                        checked={formPermissions.includes(permission.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormPermissions([...formPermissions, permission.id]);
                          } else {
                            setFormPermissions(formPermissions.filter(p => p !== permission.id));
                          }
                        }}
                      />
                    }
                    label={permission.name}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateSubmit} 
            variant="contained" 
            color="primary" 
            disabled={isLoading || !formName || formPermissions.length === 0}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};