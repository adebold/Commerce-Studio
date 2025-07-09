import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, LinearProgress } from '@mui/material';
import { fetchProvisioningStatus } from '../store/provisioningSlice';

function ProvisioningStatus({ jobId }) {
  const dispatch = useDispatch();
  const job = useSelector((state) => state.provisioning.jobs[jobId]);

  useEffect(() => {
    if (jobId && job?.status !== 'completed' && job?.status !== 'failed') {
      const interval = setInterval(() => {
        dispatch(fetchProvisioningStatus(jobId));
      }, 5000); // Poll every 5 seconds

      return () => clearInterval(interval);
    }
  }, [jobId, job, dispatch]);

  if (!job) {
    return null;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">Provisioning Status</Typography>
      <Typography>Status: {job.status}</Typography>
      <LinearProgress variant="determinate" value={job.progress || 0} />
      <Box
        component="pre"
        sx={{
          mt: 2,
          p: 1,
          border: '1px solid #eee',
          maxHeight: '200px',
          overflowY: 'auto',
          bgcolor: '#f5f5f5',
        }}
      >
        {job.logs?.join('\n')}
      </Box>
    </Box>
  );
}

export default ProvisioningStatus;