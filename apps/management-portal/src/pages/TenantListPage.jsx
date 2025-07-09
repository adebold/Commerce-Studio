import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Typography, Button, Box } from '@mui/material';
import { fetchTenants, createTenant, deleteTenant } from '../store/tenantsSlice';
import TenantTable from '../components/TenantTable';
import CreateTenantDialog from '../components/CreateTenantDialog';

function TenantListPage() {
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const dispatch = useDispatch();
  const { tenants, status, error } = useSelector((state) => state.tenants);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTenants());
    }
  }, [status, dispatch]);

  const handleDeactivate = (id) => {
    dispatch(deleteTenant(id));
  };

  const handleCreate = (tenantData) => {
    dispatch(createTenant(tenantData));
    setCreateDialogOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Tenant Management</Typography>
        <Button variant="contained" onClick={() => setCreateDialogOpen(true)}>
          Create Tenant
        </Button>
      </Box>
      {status === 'loading' && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {status === 'succeeded' && <TenantTable tenants={tenants} onDeactivate={handleDeactivate} />}
      <CreateTenantDialog
        open={isCreateDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreate}
      />
    </Box>
  );
}

export default TenantListPage;