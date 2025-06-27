import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import theme from '../../../design-system/theme';
import TrendingStylesComponent from '../TrendingStylesComponent';
import { Frame } from '../../../types/recommendations';

// Mock theme provider to wrap our component
const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {ui}
    </ThemeProvider>
  );
};

// Mock data for testing
const mockFrames: Frame[] = [
  {
    id: 'frame-1',
    name: 'Trendy Frame',
    brand: 'Ray-Ban',
    style: 'trendy',
    material: 'acetate',
    color: 'black',
    price: 149.99,
    image_url: '/test-image-1.jpg',
  },
  {
    id: 'frame-2',
    name: 'Fashion Frame',
    brand: 'Gucci',
    style: 'fashion',
    material: 'metal',
    color: 'gold',
    price: 299.99,
    image_url: '/test-image-2.jpg',
  },
];

describe('TrendingStylesComponent', () => {
  const mockOnSelect = jest.fn();
  const mockRegion = 'New York';
  const mockTrendingData = {
    percentageIncrease: 32,
    timeFrame: 'this month'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly with trending data', () => {
    renderWithTheme(
      <TrendingStylesComponent
        frames={mockFrames}
        onSelect={mockOnSelect}
        region={mockRegion}
        trendingData={mockTrendingData}
      />
    );

    // Check if the component renders the title correctly
    expect(screen.getByText(`Trending in ${mockRegion}`)).toBeInTheDocument();

    // Check if the trending badge is rendered
    expect(screen.getByText('32% Increase')).toBeInTheDocument();

    // Check if the banner text is rendered
    expect(screen.getByText('Stay on trend with the most popular styles in your area')).toBeInTheDocument();
    expect(screen.getByText(`These frames have seen a 32% increase in popularity this month in ${mockRegion}.`)).toBeInTheDocument();

    // Check if all frames are rendered
    expect(screen.getByText('Trendy Frame')).toBeInTheDocument();
    expect(screen.getByText('Fashion Frame')).toBeInTheDocument();

    // Check if the brand and price information is displayed
    expect(screen.getByText('Ray-Ban • $149.99')).toBeInTheDocument();
    expect(screen.getByText('Gucci • $299.99')).toBeInTheDocument();

    // Check if the trending tag is displayed
    expect(screen.getAllByText('Trending').length).toBe(2);
  });

  test('renders correctly with different region', () => {
    renderWithTheme(
      <TrendingStylesComponent
        frames={mockFrames}
        onSelect={mockOnSelect}
        region="London"
        trendingData={mockTrendingData}
      />
    );

    // Check if the component renders the title with the correct region
    expect(screen.getByText('Trending in London')).toBeInTheDocument();
    expect(screen.getByText('These frames have seen a 32% increase in popularity this month in London.')).toBeInTheDocument();
  });

  test('renders correctly with different trending data', () => {
    renderWithTheme(
      <TrendingStylesComponent
        frames={mockFrames}
        onSelect={mockOnSelect}
        region={mockRegion}
        trendingData={{
          percentageIncrease: 45,
          timeFrame: 'this week'
        }}
      />
    );

    // Check if the component renders the trending data correctly
    expect(screen.getByText('45% Increase')).toBeInTheDocument();
    expect(screen.getByText(`These frames have seen a 45% increase in popularity this week in ${mockRegion}.`)).toBeInTheDocument();
  });

  test('calls onSelect when a frame is clicked', () => {
    renderWithTheme(
      <TrendingStylesComponent
        frames={mockFrames}
        onSelect={mockOnSelect}
        region={mockRegion}
        trendingData={mockTrendingData}
      />
    );

    // Find and click the first frame
    const firstFrame = screen.getByText('Trendy Frame').closest('div[role="button"]') || 
                       screen.getByText('Trendy Frame').closest('button');
    
    if (firstFrame) {
      fireEvent.click(firstFrame);
      expect(mockOnSelect).toHaveBeenCalledWith('frame-1');
    } else {
      throw new Error('Could not find clickable element for the frame');
    }
  });

  test('does not render when frames array is empty', () => {
    const { container } = renderWithTheme(
      <TrendingStylesComponent
        frames={[]}
        onSelect={mockOnSelect}
        region={mockRegion}
        trendingData={mockTrendingData}
      />
    );

    // The component should not render anything when frames array is empty
    expect(container.firstChild).toBeNull();
  });

  test('renders with default trending data when not provided', () => {
    renderWithTheme(
      <TrendingStylesComponent
        frames={mockFrames}
        onSelect={mockOnSelect}
        region={mockRegion}
      />
    );

    // Check if the component renders with default trending data
    expect(screen.getByText('32% Increase')).toBeInTheDocument();
    expect(screen.getByText(`These frames have seen a 32% increase in popularity this month in ${mockRegion}.`)).toBeInTheDocument();
  });

  test('renders trending stats for each frame', () => {
    renderWithTheme(
      <TrendingStylesComponent
        frames={mockFrames}
        onSelect={mockOnSelect}
        region={mockRegion}
        trendingData={mockTrendingData}
      />
    );

    // Check if each frame has a trending stats section
    const trendingStats = screen.getAllByText(/% increase in popularity/);
    expect(trendingStats.length).toBe(2);
  });
});