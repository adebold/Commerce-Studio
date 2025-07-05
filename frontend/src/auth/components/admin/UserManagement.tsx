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
  Pagination
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  status: string;
  lastLoginAt?: string;
}

interface UserManagementProps {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const UserManagement: React.FC<UserManagementProps> = ({ isLoading, setIsLoading }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openInviteDialog, setOpenInviteDialog] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<{id: string; name: string}[]>([]);
  
  // Form state
  const [formEmail, setFormEmail] = useState('');
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formRoles, setFormRoles] = useState<string[]>([]);
  
  // We'll use the current user's tenant ID in actual API calls
  const { user: currentUser } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const tenantId = currentUser?.tenantId;
  
  // Fetch users on component mount and when page changes
  useEffect(() => {
    fetchUsers();
  }, [page]);
  
  // Fetch available roles on component mount
  useEffect(() => {
    fetchRoles();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // This would be replaced with an actual API call
      // For example:
      // const response = await fetch(`/api/tenants/${user?.tenantId}/users?page=${page}&pageSize=10`);
      // const data = await response.json();
      // setUsers(data.data);
      // setTotalPages(data.pagination.totalPages);
      
      // Mock data for demonstration
      setTimeout(() => {
        const mockUsers: User[] = [
          {
            id: '1',
            email: 'admin@example.com',
            firstName: 'Admin',
            lastName: 'User',
            roles: ['tenant_admin'],
            status: 'active',
            lastLoginAt: new Date().toISOString()
          },
          {
            id: '2',
            email: 'manager@example.com',
            firstName: 'Manager',
            lastName: 'User',
            roles: ['tenant_manager'],
            status: 'active',
            lastLoginAt: new Date().toISOString()
          },
          {
            id: '3',
            email: 'viewer@example.com',
            firstName: 'Viewer',
            lastName: 'User',
            roles: ['viewer'],
            status: 'active',
            lastLoginAt: new Date().toISOString()
          }
        ];
        
        setUsers(mockUsers);
        setTotalPages(1);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching users:', error);
      setIsLoading(false);
    }
  };
  
  const fetchRoles = async () => {
    try {
      // This would be replaced with an actual API call
      // For example:
      // const response = await fetch(`/api/tenants/${user?.tenantId}/roles`);
      // const data = await response.json();
      // setAvailableRoles(data.data);
      
      // Mock data for demonstration
      const mockRoles = [
        { id: 'tenant_admin', name: 'Tenant Admin' },
        { id: 'tenant_manager', name: 'Tenant Manager' },
        { id: 'client_admin', name: 'Client Admin' },
        { id: 'client_manager', name: 'Client Manager' },
        { id: 'brand_manager', name: 'Brand Manager' },
        { id: 'viewer', name: 'Viewer' }
      ];
      
      setAvailableRoles(mockRoles);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };
  
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormEmail(user.email);
    setFormFirstName(user.firstName || '');
    setFormLastName(user.lastName || '');
    setFormRoles(user.roles);
    setOpenEditDialog(true);
  };
  
  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };
  
  const handleInviteUser = () => {
    setFormEmail('');
    setFormFirstName('');
    setFormLastName('');
    setFormRoles([]);
    setOpenInviteDialog(true);
  };
  
  const handleRoleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setFormRoles(typeof value === 'string' ? value.split(',') : value);
  };
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  
  const handleSaveEdit = async () => {
    try {
      setIsLoading(true);
      
      // This would be replaced with an actual API call
      // For example:
      // await fetch(`/api/tenants/${user?.tenantId}/users/${selectedUser?.id}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     firstName: formFirstName,
      //     lastName: formLastName,
      //     roles: formRoles
      //   })
      // });
      
      // Mock update for demonstration
      setTimeout(() => {
        setUsers(users.map(u => 
          u.id === selectedUser?.id 
            ? { 
                ...u, 
                firstName: formFirstName, 
                lastName: formLastName, 
                roles: formRoles 
              } 
            : u
        ));
        
        setOpenEditDialog(false);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error updating user:', error);
      setIsLoading(false);
    }
  };
  
  const handleConfirmDelete = async () => {
    try {
      setIsLoading(true);
      
      // This would be replaced with an actual API call
      // For example:
      // await fetch(`/api/tenants/${user?.tenantId}/users/${selectedUser?.id}`, {
      //   method: 'DELETE'
      // });
      
      // Mock delete for demonstration
      setTimeout(() => {
        setUsers(users.filter(u => u.id !== selectedUser?.id));
        setOpenDeleteDialog(false);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error deleting user:', error);
      setIsLoading(false);
    }
  };
  
  const handleInviteSubmit = async () => {
    try {
      setIsLoading(true);
      
      // This would be replaced with an actual API call
      // For example:
      // await fetch(`/api/tenants/${user?.tenantId}/users/invite`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     email: formEmail,
      //     firstName: formFirstName,
      //     lastName: formLastName,
      //     roles: formRoles
      //   })
      // });
      
      // Mock invite for demonstration
      setTimeout(() => {
        const newUser: User = {
          id: `new-${Date.now()}`,
          email: formEmail,
          firstName: formFirstName,
          lastName: formLastName,
          roles: formRoles,
          status: 'pending'
        };
        
        setUsers([...users, newUser]);
        setOpenInviteDialog(false);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error inviting user:', error);
      setIsLoading(false);
    }
  };
  
  const getRoleName = (roleId: string): string => {
    const role = availableRoles.find(r => r.id === roleId);
    return role ? role.name : roleId;
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">User Management</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleInviteUser}
        >
          Invite User
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Roles</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Login</TableCell>
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
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>
                    {user.roles.map(role => (
                      <Chip 
                        key={role} 
                        label={getRoleName(role)} 
                        size="small" 
                        sx={{ mr: 0.5, mb: 0.5 }} 
                      />
                    ))}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.status} 
                      color={user.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditUser(user)} size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteUser(user)} size="small" color="error">
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
      
      {/* Edit User Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            disabled
          />
          <TextField
            margin="dense"
            label="First Name"
            type="text"
            fullWidth
            value={formFirstName}
            onChange={(e) => setFormFirstName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Last Name"
            type="text"
            fullWidth
            value={formLastName}
            onChange={(e) => setFormLastName(e.target.value)}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="roles-select-label">Roles</InputLabel>
            <Select
              labelId="roles-select-label"
              multiple
              value={formRoles}
              onChange={handleRoleChange}
              label="Roles"
            >
              {availableRoles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete User Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the user {selectedUser?.email}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Invite User Dialog */}
      <Dialog open={openInviteDialog} onClose={() => setOpenInviteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Invite User</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            required
          />
          <TextField
            margin="dense"
            label="First Name"
            type="text"
            fullWidth
            value={formFirstName}
            onChange={(e) => setFormFirstName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Last Name"
            type="text"
            fullWidth
            value={formLastName}
            onChange={(e) => setFormLastName(e.target.value)}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="invite-roles-select-label">Roles</InputLabel>
            <Select
              labelId="invite-roles-select-label"
              multiple
              value={formRoles}
              onChange={handleRoleChange}
              label="Roles"
              required
            >
              {availableRoles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInviteDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleInviteSubmit} 
            variant="contained" 
            color="primary" 
            disabled={isLoading || !formEmail || formRoles.length === 0}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Send Invitation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};