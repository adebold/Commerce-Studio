# Merchant Dashboard Component Implementation Prompt

## Context
We need to implement a monitoring dashboard component for the merchant portal in Eyewear ML. This dashboard will allow merchants to monitor the health and performance of their e-commerce platform integrations.

## Design Requirements

1. **Component Structure**
   - Create a responsive dashboard layout using Material UI components
   - Implement tabs for different integration platforms (Shopify, WooCommerce, etc.)
   - Support both light and dark mode with appropriate contrast

2. **Functionality Requirements**
   - Display real-time connection status for each integrated platform
   - Show sync history with filtering capabilities
   - Visualize error rates and API performance metrics
   - Provide direct links to troubleshooting guides when issues are detected
   - Include action buttons for manual sync and connection refresh

3. **Performance Considerations**
   - Implement efficient data fetching with React Query
   - Support real-time updates via webhook events
   - Optimize rendering performance for large datasets
   - Include skeleton loading states for better UX

4. **Accessibility Requirements**
   - Ensure WCAG 2.1 AA compliance
   - Support keyboard navigation throughout the dashboard
   - Implement appropriate ARIA attributes
   - Ensure color contrast meets accessibility standards

## API Integration

The dashboard will fetch data from these endpoints:

```typescript
// Get integration status for all platforms
GET /api/merchant/integrations

// Response structure
interface IntegrationsResponse {
  integrations: {
    platform: string;
    status: 'connected' | 'disconnected' | 'error';
    lastConnected: string;
    errorMessage?: string;
    metrics: {
      syncSuccessRate: number;
      apiResponseTime: number;
      errorRate: number;
      activeUsers: number;
    };
  }[];
}

// Get sync history for a specific platform
GET /api/merchant/integrations/{platform}/history

// Response structure
interface SyncHistoryResponse {
  history: {
    id: string;
    timestamp: string;
    operation: 'product_sync' | 'order_sync' | 'inventory_sync';
    status: 'success' | 'partial' | 'failed';
    itemsProcessed: number;
    itemsFailed: number;
    durationMs: number;
    errors?: {
      message: string;
      code: string;
      items: string[];
    }[];
  }[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
  };
}

// Trigger manual sync
POST /api/merchant/integrations/{platform}/sync

// Refresh connection
POST /api/merchant/integrations/{platform}/refresh
```

## Design System Reference

We use Material UI with our custom theme:

```typescript
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0071e3',
      light: '#4d9aea',
      dark: '#0058b0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#1d1d1f',
      light: '#444446',
      dark: '#000000',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ff3b30',
    },
    warning: {
      main: '#ff9500',
    },
    info: {
      main: '#007aff',
    },
    success: {
      main: '#34c759',
    },
    background: {
      default: '#f5f5f7',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '-0.022em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.022em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '-0.022em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '-0.022em',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: '-0.022em',
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      letterSpacing: '-0.022em',
    },
    body1: {
      fontSize: '1rem',
      letterSpacing: '-0.022em',
    },
    body2: {
      fontSize: '0.875rem',
      letterSpacing: '-0.022em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 20,
          padding: '8px 16px',
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          overflow: 'hidden',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});
```

## Component Requirements

### IntegrationStatusCard Component

```typescript
interface IntegrationStatusCardProps {
  platform: string;
  status: 'connected' | 'disconnected' | 'error';
  lastConnected: string;
  errorMessage?: string;
  metrics: {
    syncSuccessRate: number;
    apiResponseTime: number;
    errorRate: number;
    activeUsers: number;
  };
  onRefresh: () => void;
  onSync: () => void;
}
```

### SyncHistoryTable Component

```typescript
interface SyncHistoryTableProps {
  platform: string;
  history: {
    id: string;
    timestamp: string;
    operation: 'product_sync' | 'order_sync' | 'inventory_sync';
    status: 'success' | 'partial' | 'failed';
    itemsProcessed: number;
    itemsFailed: number;
    durationMs: number;
    errors?: {
      message: string;
      code: string;
      items: string[];
    }[];
  }[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
  };
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  isLoading: boolean;
}
```

### MetricsChart Component

```typescript
interface MetricsChartProps {
  platform: string;
  metric: 'syncSuccessRate' | 'apiResponseTime' | 'errorRate' | 'activeUsers';
  timeRange: '24h' | '7d' | '30d' | '90d';
  data: {
    timestamp: string;
    value: number;
  }[];
  isLoading: boolean;
}
```

## Expected Output

Please provide the complete implementation of the MerchantDashboard component and its child components:

1. Main MerchantDashboard component
2. IntegrationStatusCard component
3. SyncHistoryTable component
4. MetricsChart component
5. Any additional helper components needed

The implementation should:
- Use React hooks for state management
- Use React Query for data fetching
- Implement proper loading, error, and empty states
- Include full TypeScript type definitions
- Include comprehensive JSDoc comments
- Follow our Material UI theme guidelines

## Additional Notes

- We use React 18 with TypeScript
- We use React Query for data fetching
- We use React Router for navigation
- Error handling should include user-friendly messages
- Include appropriate unit tests for critical functionality
- The dashboard should update automatically when data changes
