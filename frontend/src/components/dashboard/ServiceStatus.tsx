import { Paper, Typography, Grid, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import type { ServiceStatus } from '../../services/metrics';

interface ServiceStatusProps {
  status: ServiceStatus;
  loading?: boolean;
}

const StatusIndicator = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isActive'
})<{ isActive: boolean }>(({ theme, isActive }) => ({
  width: 12,
  height: 12,
  borderRadius: '50%',
  backgroundColor: isActive ? theme.palette.success.main : theme.palette.error.main,
  marginRight: theme.spacing(1),
}));

const ServiceItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const statusLabels = {
  nvidiaApi: 'NVIDIA API',
  deepseekApi: 'DeepSeek API',
  database: 'Database',
  pipeline: 'Data Pipeline',
};

export default function ServiceStatus({ status }: ServiceStatusProps) {
  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Service Status
      </Typography>
      <Grid container spacing={2}>
        {Object.entries(status).map(([key, value]) => (
          <Grid item xs={6} key={key}>
            <ServiceItem>
              <StatusIndicator isActive={value} />
              <Typography variant="body2">
                {statusLabels[key as keyof ServiceStatus]}
              </Typography>
            </ServiceItem>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}
