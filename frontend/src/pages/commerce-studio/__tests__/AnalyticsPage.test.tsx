import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AnalyticsPage from '../AnalyticsPage';
import { analyticsService } from '../../../services/analytics';

// Mock the analytics service
jest.mock('../../../services/analytics', () => ({
  analyticsService: {
    getConversionFunnel: jest.fn(),
    getProductEngagementHeatmap: jest.fn(),
    getCohortAnalysis: jest.fn(),
    getABTestResults: jest.fn(),
    getMockConversionFunnel: jest.fn(),
    getMockHeatmapData: jest.fn(),
    getMockCohortData: jest.fn(),
    getMockABTestData: jest.fn()
  }
}));

// Mock Material UI components that might cause issues in tests
jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    CircularProgress: () => <div data-testid="loading-spinner">Loading...</div>
  };
});

describe('AnalyticsPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Setup default mock implementations
    (analyticsService.getConversionFunnel as jest.Mock).mockResolvedValue({
      stages: [
        { name: 'Product View', count: 10000, conversionRate: 1.0 },
        { name: 'Add to Cart', count: 3500, conversionRate: 0.35 },
        { name: 'Purchase', count: 1500, conversionRate: 0.43 }
      ],
      totalEntries: 10000,
      overallConversionRate: 0.15
    });
    
    (analyticsService.getProductEngagementHeatmap as jest.Mock).mockResolvedValue({
      productId: 'product-1',
      productName: 'Test Product',
      engagementScores: [[10, 20], [30, 40]],
      maxScore: 40
    });
    
    (analyticsService.getCohortAnalysis as jest.Mock).mockResolvedValue({
      cohorts: [
        {
          name: 'Jan 2025',
          size: 1200,
          retentionRates: [1.0, 0.65, 0.48]
        }
      ],
      periods: ['Week 0', 'Week 1', 'Week 2']
    });
    
    (analyticsService.getABTestResults as jest.Mock).mockResolvedValue([
      {
        testId: 'test-1',
        testName: 'Test A/B Test',
        variants: [
          { name: 'Control', users: 5000, conversions: 250, conversionRate: 0.05 },
          { name: 'Variant A', users: 5000, conversions: 300, conversionRate: 0.06 }
        ],
        startDate: '2025-03-01',
        endDate: '2025-03-15',
        status: 'completed',
        winner: 'Variant A',
        confidenceLevel: 0.95
      }
    ]);
  });
  
  it('renders the analytics dashboard title', () => {
    render(
      <MemoryRouter>
        <AnalyticsPage />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
  });
  
  it('shows loading state initially', () => {
    render(
      <MemoryRouter>
        <AnalyticsPage />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
  
  it('fetches and displays conversion funnel data', async () => {
    render(
      <MemoryRouter>
        <AnalyticsPage />
      </MemoryRouter>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(analyticsService.getConversionFunnel).toHaveBeenCalled();
    });
    
    // Check that the conversion funnel title is displayed
    await waitFor(() => {
      expect(screen.getByText('Customer Conversion Funnel')).toBeInTheDocument();
    });
  });
  
  it('changes tab and fetches appropriate data', async () => {
    render(
      <MemoryRouter>
        <AnalyticsPage />
      </MemoryRouter>
    );
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(analyticsService.getConversionFunnel).toHaveBeenCalled();
    });
    
    // Click on the Product Engagement tab
    const productEngagementTab = screen.getByText('Product Engagement');
    userEvent.click(productEngagementTab);
    
    // Check that the appropriate data is fetched
    await waitFor(() => {
      expect(analyticsService.getProductEngagementHeatmap).toHaveBeenCalled();
    });
  });
  
  it('updates data when date range changes', async () => {
    render(
      <MemoryRouter>
        <AnalyticsPage />
      </MemoryRouter>
    );
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(analyticsService.getConversionFunnel).toHaveBeenCalledTimes(1);
    });
    
    // Find the date range selector and change to a preset range
    const presetRangeSelect = screen.getByLabelText('Preset Range');
    userEvent.click(presetRangeSelect);
    
    // Select "Last 7 Days" option when it appears in the dropdown
    await waitFor(() => {
      const option = screen.getByText('Last 7 Days');
      userEvent.click(option);
    });
    
    // Check that data is fetched again with new date range
    await waitFor(() => {
      expect(analyticsService.getConversionFunnel).toHaveBeenCalledTimes(2);
    });
  });
});