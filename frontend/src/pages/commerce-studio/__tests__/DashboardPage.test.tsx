import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../../../design-system';
import DashboardPage from '../DashboardPage';
import { metricsService } from '../../../services/metrics';

// Mock the components used in DashboardPage
jest.mock('../../../components/dashboard/SalesChart', () => ({
  __esModule: true,
  default: ({ timePeriod }: { timePeriod: string }) => (
    <div data-testid="sales-chart">Sales Chart: {timePeriod}</div>
  ),
}));

jest.mock('../../../components/dashboard/ProductPerformance', () => ({
  __esModule: true,
  default: () => <div data-testid="product-performance">Product Performance</div>,
}));

jest.mock('../../../components/dashboard/CustomerEngagement', () => ({
  __esModule: true,
  default: () => <div data-testid="customer-engagement">Customer Engagement</div>,
}));

jest.mock('../../../components/dashboard/IntegrationStatus', () => ({
  __esModule: true,
  default: () => <div data-testid="integration-status">Integration Status</div>,
}));

jest.mock('../../../components/dashboard/ActivityFeed', () => ({
  __esModule: true,
  default: () => <div data-testid="activity-feed">Activity Feed</div>,
}));

jest.mock('../../../components/dashboard/MetricCard', () => ({
  __esModule: true,
  default: ({ title, value }: { title: string; value: string }) => (
    <div data-testid={`metric-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      {title}: {value}
    </div>
  ),
}));

// Mock the metrics service
jest.mock('../../../services/metrics', () => ({
  metricsService: {
    getMockData: jest.fn(),
  },
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    // Setup mock data
    (metricsService.getMockData as jest.Mock).mockReturnValue({
      ml: {
        modelAccuracy: 0.89,
      },
      business: {
        conversionRate: 0.12,
        uniqueUsers: 2500,
        activeIntegrations: 8,
      },
      system: {},
      pipeline: {},
      api: {},
      status: {},
    });
  });

  it('renders the dashboard page with all sections', () => {
    render(
      <ThemeProvider>
        <DashboardPage />
      </ThemeProvider>
    );

    // Check for main heading
    expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();

    // Check for KPI section
    expect(screen.getByText('Key Performance Indicators')).toBeInTheDocument();
    expect(screen.getByTestId('metric-card-conversion-rate')).toBeInTheDocument();
    expect(screen.getByTestId('metric-card-active-users')).toBeInTheDocument();
    expect(screen.getByTestId('metric-card-active-integrations')).toBeInTheDocument();
    expect(screen.getByTestId('metric-card-model-accuracy')).toBeInTheDocument();

    // Check for chart components
    expect(screen.getByText('Sales Overview')).toBeInTheDocument();
    expect(screen.getByTestId('sales-chart')).toBeInTheDocument();
    expect(screen.getByTestId('product-performance')).toBeInTheDocument();
    expect(screen.getByTestId('customer-engagement')).toBeInTheDocument();
    expect(screen.getByTestId('integration-status')).toBeInTheDocument();
    expect(screen.getByTestId('activity-feed')).toBeInTheDocument();
  });

  it('displays the correct time period tabs', () => {
    render(
      <ThemeProvider>
        <DashboardPage />
      </ThemeProvider>
    );

    expect(screen.getByText('Daily')).toBeInTheDocument();
    expect(screen.getByText('Weekly')).toBeInTheDocument();
    expect(screen.getByText('Monthly')).toBeInTheDocument();
  });
});