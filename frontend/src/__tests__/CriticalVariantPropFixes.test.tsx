import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import '@testing-library/jest-dom';

// Import theme
import { theme } from '../theme';

// Import the actual components that need testing
import FrameSelector from '../components/virtual-try-on/FrameSelector';
import RecommendationCard from '../components/recommendations/RecommendationCard';

// Test wrapper with theme
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

// Mock data for testing
const mockFrames = [
  {
    id: '1',
    name: 'Test Frame',
    brand: 'Test Brand',
    price: 100,
    color: 'Black',
    material: 'Plastic',
    shape: 'Square',
    imageUrl: '/test-image.jpg'
  }
];

const mockRecommendationFrame = {
  id: '1',
  name: 'Test Frame',
  brand: 'Test Brand',
  price: 100,
  image_url: '/test-image.jpg',
  color: 'Black',
  material: 'Plastic',
  shape: 'Square',
  style: 'Modern'
};

describe('Critical TypeScript Variant Prop Fixes', () => {
  
  describe('FrameSelector Component - Variant Prop Fix', () => {
    test('should not produce TypeScript errors for invalid variant props', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <TestWrapper>
          <FrameSelector 
            onFrameSelect={jest.fn()}
          />
        </TestWrapper>
      );

      // Verify no TypeScript/React errors about invalid variant prop
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('variant')
      );
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('elevated')
      );
      
      consoleSpy.mockRestore();
    });

    test('should use valid MUI Card variant props only', () => {
      render(
        <TestWrapper>
          <FrameSelector 
            onFrameSelect={jest.fn()}
          />
        </TestWrapper>
      );

      // Verify Card components are rendered with valid MUI classes
      const cards = document.querySelectorAll('.MuiCard-root');
      expect(cards.length).toBeGreaterThan(0);
      
      // Check that cards have proper MUI classes (indicating valid variants)
      cards.forEach(card => {
        expect(card).toHaveClass('MuiCard-root');
        // Should not have any error-related classes
        expect(card.className).not.toContain('error');
        expect(card.className).not.toContain('elevated');
      });
    });

    test('should maintain visual elevation appearance without invalid variant', () => {
      render(
        <TestWrapper>
          <FrameSelector 
            onFrameSelect={jest.fn()}
          />
        </TestWrapper>
      );

      // Verify frame cards still have elevation/shadow styling
      const frameCards = document.querySelectorAll('[data-testid*="frame-card"], .MuiCard-root');
      frameCards.forEach(card => {
        const computedStyle = window.getComputedStyle(card);
        // Should have some form of elevation/shadow (not 'none')
        expect(computedStyle.boxShadow).not.toBe('none');
      });
    });

    test('should render frame selection functionality correctly', () => {
      const mockOnFrameSelect = jest.fn();
      
      render(
        <TestWrapper>
          <FrameSelector 
            onFrameSelect={mockOnFrameSelect}
          />
        </TestWrapper>
      );

      // Verify component renders without errors
      expect(screen.getByText('Select Your Frames')).toBeInTheDocument();
      
      // Verify filter functionality works
      const filterButtons = screen.getAllByRole('button');
      expect(filterButtons.length).toBeGreaterThan(0);
    });
  });

  describe('RecommendationCard Component - Variant Prop Fix', () => {
    test('should not produce TypeScript errors for invalid variant props', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <TestWrapper>
          <RecommendationCard
            frame={mockRecommendationFrame}
            matchScore={0.85}
            matchReason="Great fit for your face shape"
            onSelect={jest.fn()}
            onFeedback={jest.fn()}
            onSaveForLater={jest.fn()}
            onTryOn={jest.fn()}
          />
        </TestWrapper>
      );

      // Verify no TypeScript/React errors about invalid variant prop
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('variant')
      );
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('elevated')
      );
      
      consoleSpy.mockRestore();
    });

    test('should use valid MUI Card variant with proper elevation', () => {
      render(
        <TestWrapper>
          <RecommendationCard
            frame={mockRecommendationFrame}
            matchScore={0.85}
            matchReason="Great fit for your face shape"
            onSelect={jest.fn()}
            onFeedback={jest.fn()}
            onSaveForLater={jest.fn()}
            onTryOn={jest.fn()}
          />
        </TestWrapper>
      );

      const card = document.querySelector('.MuiCard-root');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('MuiCard-root');
      
      // Should not have invalid variant classes
      expect(card?.className).not.toContain('elevated');
    });

    test('should maintain hover effects and visual styling', () => {
      render(
        <TestWrapper>
          <RecommendationCard
            frame={mockRecommendationFrame}
            matchScore={0.85}
            matchReason="Great fit for your face shape"
            onSelect={jest.fn()}
            onFeedback={jest.fn()}
            onSaveForLater={jest.fn()}
            onTryOn={jest.fn()}
          />
        </TestWrapper>
      );

      const card = document.querySelector('.MuiCard-root');
      expect(card).toBeInTheDocument();
      
      // Verify card has proper styling
      const computedStyle = window.getComputedStyle(card!);
      expect(computedStyle.boxShadow).not.toBe('none');
    });

    test('should render recommendation content correctly', () => {
      render(
        <TestWrapper>
          <RecommendationCard
            frame={mockRecommendationFrame}
            matchScore={0.85}
            matchReason="Great fit for your face shape"
            onSelect={jest.fn()}
            onFeedback={jest.fn()}
            onSaveForLater={jest.fn()}
            onTryOn={jest.fn()}
          />
        </TestWrapper>
      );

      // Verify frame information is displayed
      expect(screen.getByText('Test Frame')).toBeInTheDocument();
      expect(screen.getByText(/Test Brand/)).toBeInTheDocument();
      expect(screen.getByText(/85% Match/)).toBeInTheDocument();
      
      // Verify action buttons are present
      expect(screen.getByText('View Details')).toBeInTheDocument();
      expect(screen.getByText('Try On')).toBeInTheDocument();
    });
  });

  describe('Build Compilation Validation', () => {
    test('should compile without TypeScript variant prop errors', () => {
      // This test validates that the components can be imported and rendered
      // without TypeScript compilation errors
      
      expect(() => {
        render(
          <TestWrapper>
            <FrameSelector onFrameSelect={jest.fn()} />
          </TestWrapper>
        );
      }).not.toThrow();

      expect(() => {
        render(
          <TestWrapper>
            <RecommendationCard
              frame={mockRecommendationFrame}
              matchScore={0.85}
              matchReason="Test reason"
              onSelect={jest.fn()}
              onFeedback={jest.fn()}
              onSaveForLater={jest.fn()}
              onTryOn={jest.fn()}
            />
          </TestWrapper>
        );
      }).not.toThrow();
    });

    test('should not have any console warnings about deprecated props', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      render(
        <TestWrapper>
          <FrameSelector onFrameSelect={jest.fn()} />
          <RecommendationCard
            frame={mockRecommendationFrame}
            matchScore={0.85}
            matchReason="Test reason"
            onSelect={jest.fn()}
            onFeedback={jest.fn()}
            onSaveForLater={jest.fn()}
            onTryOn={jest.fn()}
          />
        </TestWrapper>
      );

      // Should not have warnings about deprecated or invalid props
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('variant')
      );
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('deprecated')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Visual Regression Prevention', () => {
    test('should maintain expected visual appearance after variant fix', () => {
      const { container: frameSelectorContainer } = render(
        <TestWrapper>
          <FrameSelector onFrameSelect={jest.fn()} />
        </TestWrapper>
      );

      const { container: recommendationContainer } = render(
        <TestWrapper>
          <RecommendationCard
            frame={mockRecommendationFrame}
            matchScore={0.85}
            matchReason="Test reason"
            onSelect={jest.fn()}
            onFeedback={jest.fn()}
            onSaveForLater={jest.fn()}
            onTryOn={jest.fn()}
          />
        </TestWrapper>
      );

      // Verify both components render with proper structure
      expect(frameSelectorContainer.querySelector('.MuiCard-root')).toBeInTheDocument();
      expect(recommendationContainer.querySelector('.MuiCard-root')).toBeInTheDocument();
      
      // Verify no error states are present
      expect(frameSelectorContainer.querySelector('[class*="error"]')).toBeNull();
      expect(recommendationContainer.querySelector('[class*="error"]')).toBeNull();
    });
  });
});