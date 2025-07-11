import React from 'react';
import { Badge } from '@shopify/polaris';

/**
 * Status indicator component that shows a status badge
 * with appropriate color based on status value
 */
function StatusIndicator({ status }) {
  // Handle null status
  if (!status) {
    return <Badge progress="incomplete">Unknown</Badge>;
  }
  
  // Determine badge properties based on status
  switch (status.toLowerCase()) {
    case 'initializing':
      return (
        <Badge progress="partiallyComplete">Initializing</Badge>
      );
      
    case 'in_progress':
      return (
        <Badge progress="partiallyComplete">In Progress</Badge>
      );
      
    case 'completed':
      return (
        <Badge progress="complete" status="success">Completed</Badge>
      );
      
    case 'cancelled':
      return (
        <Badge progress="incomplete">Cancelled</Badge>
      );
      
    case 'error':
      return (
        <Badge progress="incomplete" status="critical">Error</Badge>
      );
      
    case 'imported':
      return (
        <Badge progress="complete" status="success">Imported</Badge>
      );
      
    case 'updated':
      return (
        <Badge progress="complete" status="info">Updated</Badge>
      );
      
    case 'skipped':
      return (
        <Badge status="info">Skipped</Badge>
      );
      
    case 'deleted':
      return (
        <Badge status="warning">Deleted</Badge>
      );
      
    default:
      return (
        <Badge>{status}</Badge>
      );
  }
}

export default StatusIndicator;