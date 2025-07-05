import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import theme from '../../../design-system/theme';
import SeasonalRecommendationsComponent from '../SeasonalRecommendationsComponent';
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
    name: 'Summer Frame',
    brand: 'Ray-Ban',
    style: 'classic',
    material: 'acetate',
    color: 'black',
    price: 149.99,
    image_url: '/test-image-1.jpg',
  },
  {
    id: 'frame-2',
    name: 'Beach Frame',
    brand: 'Oakley',
    style: 'sporty',
    material: 'metal',
    color: 'blue',
    price: 199.99,
    image_url: '/test-image-2.jpg',
  },
];

describe('SeasonalRecommendationsComponent', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly with summer season', () => {
    renderWithTheme(
      <SeasonalRecommendationsComponent
        frames={mockFrames}
        onSelect={mockOnSelect}
        season="summer"
      />
    );

    // Check if the component renders the title correctly
    expect(screen.getByText('Summer Trending Frames')).toBeInTheDocument();

    // Check if the description is rendered
    expect(screen.getByText(/Bold, vibrant frames that stand out in the summer sun/)).toBeInTheDocument();

    // Check if all frames are rendered
    expect(screen.getByText('Summer Frame')).toBeInTheDocument();
    expect(screen.getByText('Beach Frame')).toBeInTheDocument();

    // Check if the brand and price information is displayed
    expect(screen.getByText('Ray-Ban • $149.99')).toBeInTheDocument();
    expect(screen.getByText('Oakley • $199.99')).toBeInTheDocument();

    // Check if the seasonal tag is displayed
    expect(screen.getAllByText('Summer Pick').length).toBe(2);
  });

  test('renders correctly with winter season', () => {
    renderWithTheme(
      <SeasonalRecommendationsComponent
        frames={mockFrames}
        onSelect={mockOnSelect}
        season="winter"
      />
    );

    // Check if the component renders the title correctly
    expect(screen.getByText('Winter Essential Styles')).toBeInTheDocument();

    // Check if the description is rendered
    expect(screen.getByText(/Elegant, versatile frames that work well in any winter setting/)).toBeInTheDocument();

    // Check if the seasonal tag is displayed
    expect(screen.getAllByText('Winter Pick').length).toBe(2);
  });

  test('calls onSelect when a frame is clicked', () => {
    renderWithTheme(
      <SeasonalRecommendationsComponent
        frames={mockFrames}
        onSelect={mockOnSelect}
        season="summer"
      />
    );

    // Find and click the first frame
    const firstFrame = screen.getByText('Summer Frame').closest('div[role="button"]') || 
                       screen.getByText('Summer Frame').closest('button');
    
    if (firstFrame) {
      fireEvent.click(firstFrame);
      expect(mockOnSelect).toHaveBeenCalledWith('frame-1');
    } else {
      throw new Error('Could not find clickable element for the frame');
    }
  });

  test('does not render when frames array is empty', () => {
    const { container } = renderWithTheme(
      <SeasonalRecommendationsComponent
        frames={[]}
        onSelect={mockOnSelect}
        season="summer"
      />
    );

    // The component should not render anything when frames array is empty
    expect(container.firstChild).toBeNull();
  });

  test('renders fall season correctly', () => {
    renderWithTheme(
      <SeasonalRecommendationsComponent
        frames={mockFrames}
        onSelect={mockOnSelect}
        season="fall"
      />
    );

    // Check if the component renders the title correctly
    expect(screen.getByText('Fall Fashion Favorites')).toBeInTheDocument();

    // Check if the description is rendered
    expect(screen.getByText(/Warm-toned frames with rich colors that complement the autumn palette/)).toBeInTheDocument();

    // Check if the seasonal tag is displayed
    expect(screen.getAllByText('Fall Pick').length).toBe(2);
  });

  test('renders spring season correctly', () => {
    renderWithTheme(
      <SeasonalRecommendationsComponent
        frames={mockFrames}
        onSelect={mockOnSelect}
        season="spring"
      />
    );

    // Check if the component renders the title correctly
    expect(screen.getByText('Spring Style Selection')).toBeInTheDocument();

    // Check if the description is rendered
    expect(screen.getByText(/Light, colorful frames perfect for the fresh spring season/)).toBeInTheDocument();

    // Check if the seasonal tag is displayed
    expect(screen.getAllByText('Spring Pick').length).toBe(2);
  });
});