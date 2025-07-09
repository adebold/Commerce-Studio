import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

function MetricCard({ title, value, unit }) {
  return (
    <Card>
      <CardContent>
        <Typography color="textSecondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h5" component="h2">
          {value} {unit}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default MetricCard;