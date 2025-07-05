import React from 'react';
import { render, screen } from '@testing-library/react';
import ConversionFunnel from '../ConversionFunnel';
import { ConversionFunnelData } from '../../../../services/analytics';

// Mock the recharts library
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    FunnelChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="funnel-chart">{children}</div>
    ),
    Funnel: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="funnel">{children}</div>
    ),
    LabelList: () => <div data-testid="label-list" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Cell: () => <div data-testid="cell" />
  };
});

describe('ConversionFunnel', () => {
  const mockData: ConversionFunnelData = {
    stages: [
      { name: 'Product View', count: 10000, conversionRate: 1.0 },
      { name: 'Add to Cart', count: 3500, conversionRate: 0.35 },
      { name: 'Checkout', count: 2200, conversionRate: 0.63 },
      { name: 'Payment', count: 1800, conversionRate: 0.82 },
      { name: 'Purchase Complete', count: 1500, conversionRate: 0.83 }
    ],
    totalEntries: 10000,
    overallConversionRate: 0.15
  };

  it('renders the funnel chart with the provided data', () => {
    render(<ConversionFunnel data={mockData} />);
    
    // Check that the chart components are rendered
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('funnel-chart')).toBeInTheDocument();
    expect(screen.getByTestId('funnel')).toBeInTheDocument();
    
    // Check that the title is rendered
    expect(screen.getByText('Conversion Funnel')).toBeInTheDocument();
    
    // Check that the overall conversion rate is displayed
    expect(screen.getByText('Overall Conversion Rate: 15.0%')).toBeInTheDocument();
  });

  it('renders with a custom title', () => {
    const customTitle = 'Custom Funnel Title';
    render(<ConversionFunnel data={mockData} title={customTitle} />);
    
    expect(screen.getByText(customTitle)).toBeInTheDocument();
  });

  it('renders a loading state when loading prop is true', () => {
    render(<ConversionFunnel data={mockData} loading={true} />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByTestId('funnel-chart')).not.toBeInTheDocument();
  });

  it('renders with custom height', () => {
    const customHeight = 600;
    const { container } = render(<ConversionFunnel data={mockData} height={customHeight} />);
    
    // Find the Paper component which should have the height style
    const paperElement = container.querySelector('[class*="MuiPaper-root"]');
    expect(paperElement).toHaveStyle(`height: ${customHeight}px`);
  });

  it('renders with custom colors', () => {
    const customColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];
    render(<ConversionFunnel data={mockData} colors={customColors} />);
    
    // We can't easily test the actual colors applied, but we can verify the component renders
    expect(screen.getByTestId('funnel')).toBeInTheDocument();
  });
});