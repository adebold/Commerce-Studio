import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FrameFinderPage from '../index';
import { recommendationService } from '../../../services/recommendation-service';

// Mock the recommendation service
jest.mock('../../../services/recommendation-service', () => ({
  recommendationService: {
    getRecommendations: jest.fn().mockResolvedValue({
      frames: [
        {
          frame: {
            id: 'frame-1',
            name: 'Test Frame',
            brand: 'Test Brand',
            price: 149.99,
            color: 'Black',
            material: 'Metal',
            shape: 'Round',
            imageUrl: '/test-image.jpg'
          },
          compatibilityScore: 85,
          reasons: ['Reason 1', 'Reason 2']
        }
      ]
    }),
    savePreferences: jest.fn(),
    loadPreferences: jest.fn().mockReturnValue(null),
    trackInteraction: jest.fn()
  }
}));

// Mock the components that are used in the FrameFinderPage
jest.mock('../../../components/frame-finder', () => ({
  QuestionnaireStep: ({ children, title, description }: {
    children: React.ReactNode;
    title: string;
    description: string;
  }) => (
    <div data-testid="questionnaire-step">
      <h2>{title}</h2>
      <p>{description}</p>
      {children}
    </div>
  ),
  FaceShapeSelector: ({ onSelectShape }: {
    selectedShape: string | null;
    onSelectShape: (shape: string) => void;
  }) => (
    <div data-testid="face-shape-selector">
      <button onClick={() => onSelectShape('oval')}>Select Oval</button>
    </div>
  ),
  StylePreferenceSelector: ({ onPreferenceChange }: {
    selectedPreferences: { colors: string[]; materials: string[]; shapes: string[] };
    onPreferenceChange: (prefs: { colors: string[]; materials: string[]; shapes: string[] }) => void;
  }) => (
    <div data-testid="style-preference-selector">
      <button onClick={() => onPreferenceChange({
        colors: ['Black'],
        materials: ['Metal'],
        shapes: ['Round']
      })}>
        Select Preferences
      </button>
    </div>
  ),
  SizeGuideSelector: ({ onSizeChange }: {
    selectedSizes: { frameWidth: string | null; templeLength: string | null; bridgeWidth: string | null };
    onSizeChange: (sizes: { frameWidth: string | null; templeLength: string | null; bridgeWidth: string | null }) => void;
  }) => (
    <div data-testid="size-guide-selector">
      <button onClick={() => onSizeChange({
        frameWidth: 'medium',
        templeLength: 'medium',
        bridgeWidth: 'medium'
      })}>
        Select Sizes
      </button>
    </div>
  ),
  FeatureTagSelector: ({ onFeatureChange }: {
    selectedFeatures: string[];
    onFeatureChange: (features: string[]) => void;
  }) => (
    <div data-testid="feature-tag-selector">
      <button onClick={() => onFeatureChange(['lightweight', 'flexible'])}>
        Select Features
      </button>
    </div>
  ),
  FilterSortControls: () => <div data-testid="filter-sort-controls" />,
  EnhancedRecommendationCard: () => <div data-testid="recommendation-card" />,
  FrameComparison: () => <div data-testid="frame-comparison" />
}));

// Mock useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

describe('FrameFinderPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithRouter = (component: React.ReactNode) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  test('renders the initial face shape step', () => {
    renderWithRouter(<FrameFinderPage />);
    
    expect(screen.getByText('Frame Finder')).toBeInTheDocument();
    expect(screen.getByText("What's Your Face Shape?")).toBeInTheDocument();
    expect(screen.getByTestId('face-shape-selector')).toBeInTheDocument();
  });

  test('navigates through all steps of the questionnaire', async () => {
    renderWithRouter(<FrameFinderPage />);
    
    // Step 1: Face Shape
    fireEvent.click(screen.getByText('Select Oval'));
    fireEvent.click(screen.getByText('Next'));
    
    // Step 2: Style Preferences
    expect(screen.getByText('Style Preferences')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Select Preferences'));
    fireEvent.click(screen.getByText('Next'));
    
    // Step 3: Size & Fit
    expect(screen.getByText('Size & Fit')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Select Sizes'));
    fireEvent.click(screen.getByText('Next'));
    
    // Step 4: Features
    expect(screen.getByText('Frame Features')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Select Features'));
    fireEvent.click(screen.getByText('Next'));
    
    // Step 5: Budget
    expect(screen.getByText('Budget Range')).toBeInTheDocument();
    fireEvent.click(screen.getByText('$100 - $200'));
    fireEvent.click(screen.getByText('See Results'));
    
    // Wait for recommendations to load
    await waitFor(() => {
      expect(recommendationService.getRecommendations).toHaveBeenCalled();
      expect(screen.getByText('Your Recommended Frames')).toBeInTheDocument();
    });
  });

  test('saves user preferences', async () => {
    renderWithRouter(<FrameFinderPage />);
    
    // Complete the questionnaire
    fireEvent.click(screen.getByText('Select Oval'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Select Preferences'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Select Sizes'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Select Features'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('$100 - $200'));
    fireEvent.click(screen.getByText('See Results'));
    
    // Wait for recommendations to load
    await waitFor(() => {
      expect(screen.getByText('Your Recommended Frames')).toBeInTheDocument();
    });
    
    // Save preferences
    fireEvent.click(screen.getByText('Save My Preferences'));
    
    expect(recommendationService.savePreferences).toHaveBeenCalledWith(expect.objectContaining({
      faceShape: 'oval',
      stylePreferences: {
        colors: ['Black'],
        materials: ['Metal'],
        shapes: ['Round']
      },
      sizeAndFit: {
        frameWidth: 'medium',
        templeLength: 'medium',
        bridgeWidth: 'medium'
      },
      features: ['lightweight', 'flexible'],
      budget: {
        min: 100,
        max: 200
      }
    }));
  });

  test('tracks user interactions', async () => {
    renderWithRouter(<FrameFinderPage />);
    
    // Complete the questionnaire
    fireEvent.click(screen.getByText('Select Oval'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Select Preferences'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Select Sizes'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Select Features'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('$100 - $200'));
    fireEvent.click(screen.getByText('See Results'));
    
    // Wait for recommendations to load
    await waitFor(() => {
      expect(screen.getByText('Your Recommended Frames')).toBeInTheDocument();
    });
    
    expect(recommendationService.trackInteraction).toHaveBeenCalledWith('recommendations_generated', 'none');
  });
});