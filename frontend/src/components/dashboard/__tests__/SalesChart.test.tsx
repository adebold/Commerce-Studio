import React from 'react';
import { render, screen } from '@testing-library/react';
import SalesChart from '../SalesChart';

// Mock Recharts components
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    LineChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="line-chart">{children}</div>
    ),
    Line: ({ dataKey, name }: { dataKey: string; name: string }) => (
      <div data-testid={`line-${dataKey}`}>Line: {name}</div>
    ),
    XAxis: () => <div data-testid="x-axis">XAxis</div>,
    YAxis: () => <div data-testid="y-axis">YAxis</div>,
    CartesianGrid: () => <div data-testid="cartesian-grid">CartesianGrid</div>,
    Tooltip: () => <div data-testid="tooltip">Tooltip</div>,
    Legend: () => <div data-testid="legend">Legend</div>,
  };
});

describe('SalesChart', () => {
  it('renders the chart with daily time period', () => {
    render(<SalesChart timePeriod="daily" />);
    
    // Check for title
    expect(screen.getByText("Today's Sales")).toBeInTheDocument();
    expect(screen.getByText("Last 24 hours")).toBeInTheDocument();
    
    // Check for chart components
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line-revenue')).toBeInTheDocument();
    expect(screen.getByTestId('line-sales')).toBeInTheDocument();
    expect(screen.getByTestId('line-orders')).toBeInTheDocument();
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  it('renders the chart with weekly time period', () => {
    render(<SalesChart timePeriod="weekly" />);
    
    expect(screen.getByText("Weekly Sales")).toBeInTheDocument();
    expect(screen.getByText("Last 7 days")).toBeInTheDocument();
  });

  it('renders the chart with monthly time period', () => {
    render(<SalesChart timePeriod="monthly" />);
    
    expect(screen.getByText("Monthly Sales")).toBeInTheDocument();
    expect(screen.getByText("Last 12 months")).toBeInTheDocument();
  });

  it('shows loading state when loading prop is true', () => {
    render(<SalesChart timePeriod="daily" loading={true} />);
    
    // CircularProgress is rendered when loading
    expect(screen.queryByText("Today's Sales")).not.toBeInTheDocument();
    expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
  });
});