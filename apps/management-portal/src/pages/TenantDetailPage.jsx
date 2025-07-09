import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Typography, Box, Paper, Button } from '@mui/material';
import { fetchTenantById, updateTenant } from '../store/tenantsSlice';
import { provisionStore } from '../store/provisioningSlice';
import TenantForm from '../components/TenantForm';
import ProvisioningStatus from '../components/ProvisioningStatus';

function TenantDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selectedTenant, status, error } = useSelector((state) => state.tenants);
  const provisioningJob = useSelector((state) => state.provisioning.jobs[selectedTenant?.provisioningJobId]);

  useEffect(() => {
    dispatch(fetchTenantById(id));
  }, [id, dispatch]);

  const handleUpdate = (formData) => {
    dispatch(updateTenant({ id, ...formData }));
  };

  const handleProvision = () => {
    dispatch(provisionStore(id));
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Tenant Details
      </Typography>
      {status === 'loading' && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {selectedTenant && (
        <Paper sx={{ p: 2 }}>
          <TenantForm tenant={selectedTenant} onSubmit={handleUpdate} />
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" onClick={handleProvision} disabled={provisioningJob?.status === 'processing'}>
              Provision Store
            </Button>
          </Box>
          {provisioningJob && <ProvisioningStatus jobId={selectedTenant.provisioningJobId} />}
        </Paper>
      )}
    </Box>
  );
}

export default TenantDetailPage;