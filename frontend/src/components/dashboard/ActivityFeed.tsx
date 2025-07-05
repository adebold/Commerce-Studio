import React from 'react';
import { Box, CircularProgress, Avatar, Typography } from '@mui/material';

interface ActivityFeedProps {
  loading?: boolean;
}

interface ActivityItem {
  id: string;
  type: 'order' | 'customer' | 'product' | 'integration';
  title: string;
  description: string;
  timestamp: Date;
  user?: {
    name: string;
    avatar?: string;
  };
}

const ActivityContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.spacing[16]};
  max-height: 300px;
  overflow-y: auto;
`;

const ActivityItemContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.spacing[12]};
  padding-bottom: ${({ theme }) => theme.spacing.spacing[12]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral[100]};
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const ActivityIcon = styled.div<{ type: ActivityItem['type'] }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, type }) => {
    switch (type) {
      case 'order': return theme.colors.semantic.success.light;
      case 'customer': return theme.colors.semantic.info.light;
      case 'product': return theme.colors.semantic.warning.light;
      case 'integration': return theme.colors.primary[100];
      default: return theme.colors.neutral[100];
    }
  }};
  color: ${({ theme, type }) => {
    switch (type) {
      case 'order': return theme.colors.semantic.success.dark;
      case 'customer': return theme.colors.semantic.info.dark;
      case 'product': return theme.colors.semantic.warning.dark;
      case 'integration': return theme.colors.primary[700];
      default: return theme.colors.neutral[800];
    }
  }};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const TimeStamp = styled(Typography)`
  color: ${({ theme }) => theme.colors.neutral[500]};
`;

// Mock data for activity feed
const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'order',
    title: 'New Order Received',
    description: 'Order #12345 for $249.99 was placed',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    user: {
      name: 'John Smith',
      avatar: '',
    },
  },
  {
    id: '2',
    type: 'customer',
    title: 'New Customer Registered',
    description: 'jane.doe@example.com created an account',
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
  },
  {
    id: '3',
    type: 'product',
    title: 'Product Stock Update',
    description: 'Classic Frames inventory updated to 24 units',
    timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
  },
  {
    id: '4',
    type: 'integration',
    title: 'Shopify Integration Updated',
    description: 'API connection refreshed successfully',
    timestamp: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
  },
  {
    id: '5',
    type: 'order',
    title: 'Order Shipped',
    description: 'Order #12340 was shipped via Express Delivery',
    timestamp: new Date(Date.now() - 1000 * 60 * 240), // 4 hours ago
    user: {
      name: 'Sarah Johnson',
      avatar: '',
    },
  },
];

const ActivityFeed: React.FC<ActivityFeedProps> = ({ loading = false }) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <CircularProgress />
      </Box>
    );
  }

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'order': return '$';
      case 'customer': return 'C';
      case 'product': return 'P';
      case 'integration': return 'I';
      default: return '•';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Recent Activity</Typography>
        <Typography variant="body2" color="textSecondary">Today</Typography>
      </Box>
      
      <ActivityContainer>
        {mockActivities.map((activity) => (
          <ActivityItemContainer key={activity.id}>
            {activity.user?.avatar ? (
              <Avatar src={activity.user.avatar} alt={activity.user.name} />
            ) : (
              <ActivityIcon type={activity.type}>
                {getActivityIcon(activity.type)}
              </ActivityIcon>
            )}
            <ActivityContent>
              <Typography variant="body1" gutterBottom>
                {activity.title}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {activity.description}
              </Typography>
              <TimeStamp variant="caption">
                {formatTimeAgo(activity.timestamp)}
              </TimeStamp>
            </ActivityContent>
          </ActivityItemContainer>
        ))}
      </ActivityContainer>
    </Box>
  );
};

export default ActivityFeed;