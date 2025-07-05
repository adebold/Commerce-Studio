import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Create a simple theme for testing
const testTheme = createTheme();
import PhotoCapture from '../PhotoCapture';
import LensSelector from '../LensSelector';
import LensVisualization from '../LensVisualization';
import ComparisonView from '../ComparisonView';
// No need for additional mock functions as we're using jest.fn() directly

// Mock the API service
// Mock the API service
jest.mock('../../../services/api', () => ({
  api: {
    post: jest.fn(),
    get: jest.fn()
  },
  contactLensApi: {
    uploadImage: jest.fn(),
    getLensOptions: jest.fn(),
    applyLens: jest.fn(),
    analyzeIris: jest.fn(),
    getImage: jest.fn()
  }
}));

// Helper function to wrap components with providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <ThemeProvider theme={testTheme}>
        {ui}
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe('Contact Lens Try-On Components', () => {
  // PhotoCapture component tests
  describe('PhotoCapture', () => {
    test('renders upload and camera options', () => {
      const handlePhotoCapture = jest.fn();
      renderWithProviders(<PhotoCapture onPhotoCapture={handlePhotoCapture} />);
      
      expect(screen.getByText('Capture or Upload Your Photo')).toBeInTheDocument();
      expect(screen.getByText('Use Camera')).toBeInTheDocument();
      expect(screen.getByText('Upload Photo')).toBeInTheDocument();
    });
    
    test('shows loading state when loading prop is true', () => {
      const handlePhotoCapture = jest.fn();
      renderWithProviders(<PhotoCapture onPhotoCapture={handlePhotoCapture} loading={true} />);
      
      expect(screen.getByText('Processing your photo...')).toBeInTheDocument();
    });
  });
  
  // LensSelector component tests
  describe('LensSelector', () => {
    const mockLensOptions = {
      colors: [
        { id: 'blue', name: 'Ocean Blue', preview_url: '/assets/lenses/blue_preview.jpg', category: 'natural' },
        { id: 'green', name: 'Emerald Green', preview_url: '/assets/lenses/green_preview.jpg', category: 'natural' },
        { id: 'violet', name: 'Mystic Violet', preview_url: '/assets/lenses/violet_preview.jpg', category: 'fashion' }
      ],
      types: [
        { id: 'natural', name: 'Natural', description: 'Subtle, natural-looking lenses', opacity_range: [0.6, 0.8] as [number, number] },
        { id: 'vivid', name: 'Vivid', description: 'Vibrant, noticeable lenses', opacity_range: [0.8, 0.9] as [number, number] }
      ]
    };
    
    const mockIrisAnalysis = {
      iris_color: {
        dominant_color: 'brown',
        rgb: [80, 60, 40],
        confidence: 0.9
      },
      iris_measurements: {
        average_diameter_pixels: 120,
        average_diameter_mm: 12,
        size_ratio: 1.05
      },
      iris_patterns: {
        texture: 'medium',
        structure: 'radial',
        density: 'medium',
        confidence: 0.8
      },
      confidence_score: 0.85
    };
    
    test('renders lens options and controls', () => {
      const handleLensSelect = jest.fn();
      const handleLightingChange = jest.fn();
      const handleOpacityChange = jest.fn();
      const handleTryOn = jest.fn();
      
      renderWithProviders(
        <LensSelector
          lensOptions={mockLensOptions}
          selectedLensColor="blue"
          selectedLensType="natural"
          opacity={0.7}
          lightingCondition="indoor"
          irisAnalysis={mockIrisAnalysis}
          onLensSelect={handleLensSelect}
          onLightingChange={handleLightingChange}
          onOpacityChange={handleOpacityChange}
          onTryOn={handleTryOn}
          loading={false}
        />
      );
      
      expect(screen.getByText('Select Your Contact Lenses')).toBeInTheDocument();
      expect(screen.getByText('Natural Colors')).toBeInTheDocument();
      expect(screen.getByText('Fashion Colors')).toBeInTheDocument();
      expect(screen.getByText('Lens Properties')).toBeInTheDocument();
      expect(screen.getByText('Opacity:')).toBeInTheDocument();
    });
    
    test('displays iris analysis information', () => {
      const handleLensSelect = jest.fn();
      const handleLightingChange = jest.fn();
      const handleOpacityChange = jest.fn();
      const handleTryOn = jest.fn();
      
      renderWithProviders(
        <LensSelector
          lensOptions={mockLensOptions}
          selectedLensColor="blue"
          selectedLensType="natural"
          opacity={0.7}
          lightingCondition="indoor"
          irisAnalysis={mockIrisAnalysis}
          onLensSelect={handleLensSelect}
          onLightingChange={handleLightingChange}
          onOpacityChange={handleOpacityChange}
          onTryOn={handleTryOn}
          loading={false}
        />
      );
      
      expect(screen.getByText('Your Eye Analysis')).toBeInTheDocument();
      expect(screen.getByText(/Natural Eye Color:/)).toBeInTheDocument();
      expect(screen.getByText(/brown/i)).toBeInTheDocument();
    });
  });
  
  // LensVisualization component tests
  describe('LensVisualization', () => {
    const mockTryOnResult = {
      image_url: '/api/contact-lens-try-on/image/test-id',
      lens_color: 'blue',
      lens_type: 'natural',
      opacity: 0.7,
      original_iris_color: 'brown',
      confidence_score: 0.85
    };
    
    test('renders try-on result and actions', () => {
      const handleAddToComparison = jest.fn();
      const handleViewComparison = jest.fn();
      const handleTryDifferent = jest.fn();
      
      renderWithProviders(
        <LensVisualization
          tryOnResult={mockTryOnResult}
          originalImage="data:image/png;base64,test"
          onAddToComparison={handleAddToComparison}
          onViewComparison={handleViewComparison}
          onTryDifferent={handleTryDifferent}
          comparisonCount={2}
        />
      );
      
      expect(screen.getByText('Try-On Results')).toBeInTheDocument();
      expect(screen.getByText('Lens Details')).toBeInTheDocument();
      expect(screen.getByText('Blue')).toBeInTheDocument();
      expect(screen.getByText('Natural')).toBeInTheDocument();
      expect(screen.getByText('70%')).toBeInTheDocument();
      expect(screen.getByText('Brown')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
      
      expect(screen.getByText('Add to Comparison')).toBeInTheDocument();
      expect(screen.getByText('View Comparison')).toBeInTheDocument();
      expect(screen.getByText('Try Different Lenses')).toBeInTheDocument();
    });
    
    test('shows placeholder when no result is available', () => {
      const handleAddToComparison = jest.fn();
      const handleViewComparison = jest.fn();
      const handleTryDifferent = jest.fn();
      
      renderWithProviders(
        <LensVisualization
          tryOnResult={null}
          originalImage="data:image/png;base64,test"
          onAddToComparison={handleAddToComparison}
          onViewComparison={handleViewComparison}
          onTryDifferent={handleTryDifferent}
          comparisonCount={0}
        />
      );
      
      expect(screen.getByText('No try-on results available. Please select a lens and try again.')).toBeInTheDocument();
    });
  });
  
  // ComparisonView component tests
  describe('ComparisonView', () => {
    const mockResults = [
      {
        image_url: '/api/contact-lens-try-on/image/test-id-1',
        lens_color: 'blue',
        lens_type: 'natural',
        opacity: 0.7,
        original_iris_color: 'brown',
        confidence_score: 0.85
      },
      {
        image_url: '/api/contact-lens-try-on/image/test-id-2',
        lens_color: 'green',
        lens_type: 'vivid',
        opacity: 0.85,
        original_iris_color: 'brown',
        confidence_score: 0.82
      }
    ];
    
    test('renders comparison view with results', () => {
      const handleSelect = jest.fn();
      const handleBack = jest.fn();
      
      renderWithProviders(
        <ComparisonView
          results={mockResults}
          originalImage="data:image/png;base64,test"
          onSelect={handleSelect}
          onBack={handleBack}
        />
      );
      
      expect(screen.getByText('Compare Lenses')).toBeInTheDocument();
      expect(screen.getByText('Blue')).toBeInTheDocument();
      expect(screen.getByText('Green')).toBeInTheDocument();
      expect(screen.getByText('Type: Natural')).toBeInTheDocument();
      expect(screen.getByText('Type: Vivid')).toBeInTheDocument();
      expect(screen.getAllByText('Select This Lens').length).toBe(2);
    });
    
    test('shows empty message when no results', () => {
      const handleSelect = jest.fn();
      const handleBack = jest.fn();
      
      renderWithProviders(
        <ComparisonView
          results={[]}
          originalImage="data:image/png;base64,test"
          onSelect={handleSelect}
          onBack={handleBack}
        />
      );
      
      expect(screen.getByText('No lenses added to comparison yet.')).toBeInTheDocument();
      expect(screen.getByText('Try on different lenses and add them to comparison to see them side by side.')).toBeInTheDocument();
    });
  });
});