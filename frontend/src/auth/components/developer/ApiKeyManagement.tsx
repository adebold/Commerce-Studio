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
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
  VisibilityOff as HideIcon
} from '@mui/icons-material';
import { SelectChangeEvent } from '@mui/material/Select';
import { useAuth } from '../../hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  createdAt: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
  ipWhitelist: string[];
}

interface ApiKeyFormData {
  name: string;
  scopes: string[];
  expiresInDays: number | null;
  ipWhitelist: string;
}

interface ApiKeyManagementProps {
  canManage: boolean;
}

const ApiKeyManagement: React.FC<ApiKeyManagementProps> = ({ canManage }) => {
  const { getAuthenticatedRequest } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  const [newKeyDetails, setNewKeyDetails] = useState<{ key: string; prefix: string } | null>(null);
  const [formData, setFormData] = useState<ApiKeyFormData>({
    name: '',
    scopes: ['read_only'],
    expiresInDays: 90,
    ipWhitelist: ''
  });
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [showFullKey, setShowFullKey] = useState(false);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const request = getAuthenticatedRequest();
      const response = await request.get('/api/developer/api-keys');
      setApiKeys(response.data);
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
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
      scopes: ['read_only'],
      expiresInDays: 90,
      ipWhitelist: ''
    });
  };

  const handleDeleteDialogOpen = (keyId: string) => {
    setSelectedKeyId(keyId);
    setOpenDeleteDialog(true);
  };

  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
    setSelectedKeyId(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleScopeChange = (e: SelectChangeEvent<string[]>) => {
    setFormData({
      ...formData,
      scopes: e.target.value as string[]
    });
  };

  const handleExpiryChange = (e: SelectChangeEvent<number>) => {
    const value = Number(e.target.value);
    setFormData({
      ...formData,
      expiresInDays: value === 0 ? null : value
    });
  };

  const handleCreateApiKey = async () => {
    try {
      const request = getAuthenticatedRequest();
      const response = await request.post('/api/developer/api-keys', {
        name: formData.name,
        scopes: formData.scopes,
        expiresInDays: formData.expiresInDays,
        ipWhitelist: formData.ipWhitelist ? formData.ipWhitelist.split(',').map(ip => ip.trim()) : []
      });

      setNewKeyDetails({
        key: response.data.key,
        prefix: response.data.prefix
      });
      
      await fetchApiKeys();
      handleCreateDialogClose();
    } catch (error) {
      console.error('Error creating API key:', error);
    }
  };

  const handleDeleteApiKey = async () => {
    if (!selectedKeyId) return;

    try {
      const request = getAuthenticatedRequest();
      await request.delete(`/api/developer/api-keys/${selectedKeyId}`);
      await fetchApiKeys();
      handleDeleteDialogClose();
    } catch (error) {
      console.error('Error deleting API key:', error);
    }
  };

  const handleRotateApiKey = async (keyId: string) => {
    try {
      const request = getAuthenticatedRequest();
      const response = await request.post(`/api/developer/api-keys/${keyId}/rotate`);
      
      setNewKeyDetails({
        key: response.data.key,
        prefix: response.data.prefix
      });
      
      await fetchApiKeys();
    } catch (error) {
      console.error('Error rotating API key:', error);
    }
  };

  const handleCopyKey = () => {
    if (newKeyDetails) {
      navigator.clipboard.writeText(newKeyDetails.key);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
    }
  };

  const getScopeLabel = (scope: string): string => {
    switch (scope) {
      case 'read_only':
        return 'Read Only';
      case 'write':
        return 'Read & Write';
      case 'admin':
        return 'Admin';
      case 'analytics':
        return 'Analytics';
      case 'recommendations':
        return 'Recommendations';
      case 'virtual_try_on':
        return 'Virtual Try-On';
      case 'product_catalog':
        return 'Product Catalog';
      case 'user_data':
        return 'User Data';
      case 'webhooks':
        return 'Webhooks';
      default:
        return scope;
    }
  };

  const getScopeColor = (scope: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (scope) {
      case 'read_only':
        return 'info';
      case 'write':
        return 'warning';
      case 'admin':
        return 'error';
      case 'analytics':
        return 'success';
      case 'recommendations':
        return 'primary';
      case 'virtual_try_on':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">API Keys</Typography>
        {canManage && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateDialogOpen}
          >
            Create API Key
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Prefix</TableCell>
              <TableCell>Scopes</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Expires</TableCell>
              <TableCell>Last Used</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Loading...</TableCell>
              </TableRow>
            ) : apiKeys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">No API keys found</TableCell>
              </TableRow>
            ) : (
              apiKeys
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((key) => (
                  <TableRow key={key.id}>
                    <TableCell>{key.name}</TableCell>
                    <TableCell>{key.prefix}...</TableCell>
                    <TableCell>
                      {key.scopes.map((scope) => (
                        <Chip
                          key={scope}
                          label={getScopeLabel(scope)}
                          size="small"
                          color={getScopeColor(scope)}
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(key.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      {key.expiresAt
                        ? formatDistanceToNow(new Date(key.expiresAt), { addSuffix: true })
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      {key.lastUsedAt
                        ? formatDistanceToNow(new Date(key.lastUsedAt), { addSuffix: true })
                        : 'Never used'}
                    </TableCell>
                    <TableCell>
                      {canManage && (
                        <>
                          <Tooltip title="Rotate API Key">
                            <IconButton
                              size="small"
                              onClick={() => handleRotateApiKey(key.id)}
                            >
                              <RefreshIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete API Key">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteDialogOpen(key.id)}
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
          count={apiKeys.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Create API Key Dialog */}
      <Dialog open={openCreateDialog} onClose={handleCreateDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New API Key</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="API Key Name"
            type="text"
            fullWidth
            value={formData.name}
            onChange={handleInputChange}
            required
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="scopes-label">Scopes</InputLabel>
            <Select
              labelId="scopes-label"
              multiple
              value={formData.scopes}
              onChange={handleScopeChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip 
                      key={value} 
                      label={getScopeLabel(value)} 
                      color={getScopeColor(value)}
                      size="small" 
                    />
                  ))}
                </Box>
              )}
            >
              <MenuItem value="read_only">Read Only</MenuItem>
              <MenuItem value="write">Read & Write</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="analytics">Analytics</MenuItem>
              <MenuItem value="recommendations">Recommendations</MenuItem>
              <MenuItem value="virtual_try_on">Virtual Try-On</MenuItem>
              <MenuItem value="product_catalog">Product Catalog</MenuItem>
              <MenuItem value="user_data">User Data</MenuItem>
              <MenuItem value="webhooks">Webhooks</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="expiry-label">Expires In</InputLabel>
            <Select
              labelId="expiry-label"
              value={formData.expiresInDays === null ? 0 : formData.expiresInDays}
              onChange={handleExpiryChange}
            >
              <MenuItem value={0}>Never</MenuItem>
              <MenuItem value={30}>30 days</MenuItem>
              <MenuItem value={90}>90 days</MenuItem>
              <MenuItem value={180}>180 days</MenuItem>
              <MenuItem value={365}>1 year</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            margin="dense"
            name="ipWhitelist"
            label="IP Whitelist (comma separated)"
            type="text"
            fullWidth
            value={formData.ipWhitelist}
            onChange={handleInputChange}
            helperText="Leave empty to allow all IPs"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateDialogClose}>Cancel</Button>
          <Button 
            onClick={handleCreateApiKey} 
            variant="contained" 
            disabled={!formData.name || formData.scopes.length === 0}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete API Key Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleDeleteDialogClose}>
        <DialogTitle>Delete API Key</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this API key? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteApiKey} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* New API Key Dialog */}
      <Dialog open={!!newKeyDetails} maxWidth="md" fullWidth>
        <DialogTitle>Your New API Key</DialogTitle>
        <DialogContent>
          <DialogContentText color="error" sx={{ mb: 2 }}>
            This is the only time your full API key will be shown. Please copy it now and store it securely.
          </DialogContentText>
          
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ mr: 1 }}>
                  API Key:
                </Typography>
                <Box sx={{ flex: 1, fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                  {showFullKey 
                    ? newKeyDetails?.key 
                    : `${newKeyDetails?.prefix}...${newKeyDetails?.key.slice(-4)}`}
                </Box>
                <IconButton onClick={() => setShowFullKey(!showFullKey)} size="small" sx={{ ml: 1 }}>
                  {showFullKey ? <HideIcon /> : <ViewIcon />}
                </IconButton>
                <IconButton onClick={handleCopyKey} size="small">
                  <CopyIcon />
                </IconButton>
              </Box>
              {showCopiedMessage && (
                <Typography variant="caption" color="success.main">
                  Copied to clipboard!
                </Typography>
              )}
            </CardContent>
          </Card>
          
          <Typography variant="body2">
            Use this key to authenticate your API requests. Include it in the Authorization header:
          </Typography>
          <Box sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1, mt: 1 }}>
            Authorization: Bearer {newKeyDetails?.key.slice(0, 10)}...
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewKeyDetails(null)} variant="contained">
            I've Saved My API Key
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApiKeyManagement;