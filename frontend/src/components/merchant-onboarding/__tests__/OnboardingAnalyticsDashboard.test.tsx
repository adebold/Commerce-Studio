import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OnboardingAnalyticsDashboard from '../OnboardingAnalyticsDashboard';
import { 
  fetchOnboardingMetrics, 
  OnboardingStep 
} from '../../../services/merchant-onboarding-analytics';

// Mock the merchant-onboarding-analytics module
jest.mock('../../../services/merchant-onboarding-analytics', () => ({
  fetchOnboardingMetrics: jest.fn(),
  OnboardingStep: {
    START: 'onboarding_start',
    PLATFORM_SELECTION: 'platform_selection',
    ACCOUNT_SETUP: 'account_setup',
    STORE_CONFIGURATION: 'store_configuration',
    INTEGRATION_SETUP: 'integration_setup',
    FINAL_VERIFICATION: 'final_verification',
    COMPLETE: 'onboarding_complete',
    APP_INSTALLATION: 'app_installation',
    PRODUCT_CONFIGURATION: 'product_configuration',
    WIDGET_PLACEMENT: 'widget_placement',
    FIRST_TRY_ON: 'first_try_on',
    FIRST_RECOMMENDATION: 'first_recommendation'
  }
}));

// Mock recharts to avoid rendering issues in tests
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    BarChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="bar-chart">{children}</div>
    ),
    PieChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="pie-chart">{children}</div>
    ),
    LineChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="line-chart">{children}</div>
    ),
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
    Bar: () => <div data-testid="bar" />,
    Pie: () => <div data-testid="pie" />,
    Cell: () => <div data-testid="cell" />
  };
});

// Mock data for testing
const mockMetrics = {
  startCount: 100,
  completionCount: 75,
  completionRate: 0.75,
  averageTimeToComplete: 15, // minutes
  stepCompletionRates: {
    [OnboardingStep.START]: 1.0,
    [OnboardingStep.PLATFORM_SELECTION]: 0.95,
    [OnboardingStep.ACCOUNT_SETUP]: 0.9,
    [OnboardingStep.STORE_CONFIGURATION]: 0.85,
    [OnboardingStep.INTEGRATION_SETUP]: 0.8,
    [OnboardingStep.FINAL_VERIFICATION]: 0.78,
    [OnboardingStep.COMPLETE]: 0.75,
    [OnboardingStep.APP_INSTALLATION]: 0.7,
    [OnboardingStep.PRODUCT_CONFIGURATION]: 0.65,
    [OnboardingStep.WIDGET_PLACEMENT]: 0.6,
    [OnboardingStep.FIRST_TRY_ON]: 0.5,
    [OnboardingStep.FIRST_RECOMMENDATION]: 0.45
  },
  dropOffPoints: {
    [OnboardingStep.PLATFORM_SELECTION]: 5,
    [OnboardingStep.ACCOUNT_SETUP]: 5,
    [OnboardingStep.STORE_CONFIGURATION]: 5,
    [OnboardingStep.INTEGRATION_SETUP]: 5,
    [OnboardingStep.FINAL_VERIFICATION]: 2,
    [OnboardingStep.APP_INSTALLATION]: 5,
    [OnboardingStep.PRODUCT_CONFIGURATION]: 5,
    [OnboardingStep.WIDGET_PLACEMENT]: 5,
    [OnboardingStep.FIRST_TRY_ON]: 10,
    [OnboardingStep.FIRST_RECOMMENDATION]: 5
  },
  platformDistribution: {
    shopify: 40,
    magento: 20,
    woocommerce: 25,
    bigcommerce: 10,
    custom: 5
  },
  feedbackScore: 4.2
};

describe('OnboardingAnalyticsDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetchOnboardingMetrics as jest.Mock).mockResolvedValue(mockMetrics);
  });

  it('renders loading state initially', async () => {
    render(<OnboardingAnalyticsDashboard />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders dashboard with metrics after loading', async () => {
    render(<OnboardingAnalyticsDashboard />);
    
    // Wait for loading to complete with a longer timeout
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Check for key metrics
    expect(screen.getByText('Started Onboarding')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument(); // startCount
    expect(screen.getByText('Completed Onboarding')).toBeInTheDocument();
    expect(screen.getByText('75')).toBeInTheDocument(); // completionCount
    expect(screen.getByText('Completion Rate')).toBeInTheDocument();
    expect(screen.getByText('75.0%')).toBeInTheDocument(); // completionRate
    expect(screen.getByText('Avg. Time to Complete')).toBeInTheDocument();
    expect(screen.getByText('15.0 min')).toBeInTheDocument(); // averageTimeToComplete
    
    // Check for charts
    expect(screen.getByText('Step Completion Rates')).toBeInTheDocument();
    expect(screen.getByText('Platform Distribution')).toBeInTheDocument();
    expect(screen.getByText('Top Drop-off Points')).toBeInTheDocument();
    
    // Check for feedback score
    expect(screen.getByText('Merchant Feedback')).toBeInTheDocument();
    expect(screen.getByText('4.2')).toBeInTheDocument(); // feedbackScore
    expect(screen.getByText('Very Good')).toBeInTheDocument(); // feedback label
  });

  it('handles date range changes', async () => {
    render(<OnboardingAnalyticsDashboard />);
    
    // Wait for loading to complete with a longer timeout
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Change date range
    const dateRangeSelect = screen.getByLabelText('Date Range');
    userEvent.click(dateRangeSelect);
    
    // Wait for dropdown to appear and select "Last 7 Days" with a longer timeout
    await waitFor(() => {
      const option = screen.getByText('Last 7 Days');
      userEvent.click(option);
    }, { timeout: 2000 });
    
    // Verify fetchOnboardingMetrics was called with new date range
    expect(fetchOnboardingMetrics).toHaveBeenCalledTimes(2);
    
    // The second call should have dates 7 days apart
    const [secondCallStartDate, secondCallEndDate] = (fetchOnboardingMetrics as jest.Mock).mock.calls[1];
    const daysDifference = Math.round((secondCallEndDate - secondCallStartDate) / (1000 * 60 * 60 * 24));
    expect(daysDifference).toBe(7);
  });

  it('handles error state', async () => {
    // Mock an error response
    (fetchOnboardingMetrics as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch data'));
    
    render(<OnboardingAnalyticsDashboard />);
    
    // Wait for error message to appear with a longer timeout
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch data')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('handles empty metrics', async () => {
    // Mock a null response
    (fetchOnboardingMetrics as jest.Mock).mockResolvedValueOnce(null);
    
    render(<OnboardingAnalyticsDashboard />);
    
    // Wait for info message to appear with a longer timeout
    await waitFor(() => {
      expect(screen.getByText('No onboarding metrics available for the selected date range.')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('renders with custom title', async () => {
    render(<OnboardingAnalyticsDashboard title="Custom Dashboard Title" />);
    
    // Wait for loading to complete with a longer timeout
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    expect(screen.getByText('Custom Dashboard Title')).toBeInTheDocument();
  });
});