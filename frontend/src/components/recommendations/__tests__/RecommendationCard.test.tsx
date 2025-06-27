/**
 * Recommendation Card Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RecommendationCard from '../RecommendationCard';
import { ThemeProvider } from '../../../design-system';

// Mock the StyleExplanationComponent and FeedbackControls
jest.mock('../StyleExplanationComponent', () => ({
  __esModule: true,
  default: ({ reason }: { reason: string }) => (
    <div data-testid="style-explanation">{reason}</div>
  ),
}));

jest.mock('../FeedbackControls', () => ({
  __esModule: true,
  default: ({ 
    onLike, 
    onDislike, 
    onSaveForLater 
  }: { 
    onLike: () => void; 
    onDislike: () => void; 
    onSaveForLater: () => void;
  }) => (
    <div data-testid="feedback-controls">
      <button onClick={onLike}>Like</button>
      <button onClick={onDislike}>Dislike</button>
      <button onClick={onSaveForLater}>Save</button>
    </div>
  ),
}));

describe('RecommendationCard', () => {
  const mockFrame = {
    id: 'frame-1',
    name: 'Test Frame',
    brand: 'Test Brand',
    style: 'classic',
    material: 'acetate',
    color: 'black',
    price: 149.99,
    image_url: 'https://example.com/frame.jpg',
  };

  const mockMatchScore = 0.92;
  const mockMatchReason = 'This frame complements your face shape.';
  
  const mockHandlers = {
    onSelect: jest.fn(),
    onFeedback: jest.fn(),
    onSaveForLater: jest.fn(),
    onTryOn: jest.fn(),
  };

  const renderComponent = () => {
    return render(
      <ThemeProvider>
        <RecommendationCard
          frame={mockFrame}
          matchScore={mockMatchScore}
          matchReason={mockMatchReason}
          onSelect={mockHandlers.onSelect}
          onFeedback={mockHandlers.onFeedback}
          onSaveForLater={mockHandlers.onSaveForLater}
          onTryOn={mockHandlers.onTryOn}
        />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders frame information correctly', () => {
    renderComponent();
    
    expect(screen.getByText('Test Frame')).toBeInTheDocument();
    expect(screen.getByText(/Test Brand/)).toBeInTheDocument();
    expect(screen.getByText(/\$149.99/)).toBeInTheDocument();
    expect(screen.getByText('classic')).toBeInTheDocument();
    expect(screen.getByText('acetate')).toBeInTheDocument();
    expect(screen.getByText('black')).toBeInTheDocument();
    expect(screen.getByText('92% Match')).toBeInTheDocument();
  });

  test('displays match reason in StyleExplanationComponent', () => {
    renderComponent();
    
    expect(screen.getByTestId('style-explanation')).toHaveTextContent(mockMatchReason);
  });

  test('calls onSelect when clicking on the image container', () => {
    renderComponent();
    
    const imageContainer = screen.getByAltText('Test Frame').closest('div');
    fireEvent.click(imageContainer!);
    
    expect(mockHandlers.onSelect).toHaveBeenCalledWith(mockFrame.id);
  });

  test('calls onSelect when clicking on View Details button', () => {
    renderComponent();
    
    const viewDetailsButton = screen.getByText('View Details');
    fireEvent.click(viewDetailsButton);
    
    expect(mockHandlers.onSelect).toHaveBeenCalledWith(mockFrame.id);
  });

  test('calls onTryOn when clicking on Try On button', () => {
    renderComponent();
    
    const tryOnButton = screen.getByText('Try On');
    fireEvent.click(tryOnButton);
    
    expect(mockHandlers.onTryOn).toHaveBeenCalledWith(mockFrame.id);
  });

  test('calls onFeedback with correct parameters when feedback is given', () => {
    renderComponent();
    
    const likeButton = screen.getByText('Like');
    fireEvent.click(likeButton);
    
    expect(mockHandlers.onFeedback).toHaveBeenCalledWith(mockFrame.id, true);
    
    const dislikeButton = screen.getByText('Dislike');
    fireEvent.click(dislikeButton);
    
    expect(mockHandlers.onFeedback).toHaveBeenCalledWith(mockFrame.id, false);
  });

  test('calls onSaveForLater when clicking Save button', () => {
    renderComponent();
    
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    expect(mockHandlers.onSaveForLater).toHaveBeenCalledWith(mockFrame.id);
  });
});