import { Card, CardContent, Typography, Box, CircularProgress, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  loading?: boolean;
  trend?: number;
  tooltipText?: string;
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const TrendIndicator = styled(Box)<{ trend: number }>(({ theme, trend }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  color: trend > 0 ? theme.palette.success.main : theme.palette.error.main,
  marginLeft: theme.spacing(1),
}));

export default function MetricCard({ 
  title, 
  value, 
  subtitle, 
  loading = false,
  trend,
  tooltipText
}: MetricCardProps) {
  const content = (
    <StyledCard>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            <Typography variant="h4" component="div">
              {value}
              {trend !== undefined && (
                <TrendIndicator trend={trend}>
                  {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                </TrendIndicator>
              )}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {subtitle}
              </Typography>
            )}
          </>
        )}
      </CardContent>
    </StyledCard>
  );

  return tooltipText ? (
    <Tooltip title={tooltipText} arrow placement="top">
      {content}
    </Tooltip>
  ) : content;
}
