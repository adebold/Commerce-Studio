import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../../../design-system/ThemeProvider';
import QuickViewModal from '../QuickViewModal';
import { Frame } from '../../../types/recommendations';

// Mock theme provider to wrap our component
const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {ui}
    </ThemeProvider>
  );
};

// Mock data for testing
const mockFrame: Frame = {
  id: 'frame-1',
  name: 'Classic Rectangle Frame',
  brand: 'Ray-Ban',
  style: 'classic',
  material: 'acetate',
  color: 'black',
  price: 149.99,
  image_url: '/test-image.jpg',
};

// Mock the FeedbackControls component
jest.mock('../FeedbackControls', () => {
  return {
    FeedbackControls: ({ onLike, onDislike, onSaveForLater }: {
      onLike: () => void;
      onDislike: () => void;
      onSaveForLater: () => void;
    }) => (
      <div data-testid="feedback-controls">
        <button onClick={() => onLike()} data-testid="like-button">Like</button>
        <button onClick={() => onDislike()} data-testid="dislike-button">Dislike</button>
        <button onClick={() => onSaveForLater()} data-testid="save-button">Save</button>
      </div>
    ),
  };
});

describe('QuickViewModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSelect = jest.fn();
  const mockOnTryOn = jest.fn();
  const mockOnFeedback = jest.fn();
  const mockOnSaveForLater = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly when open', () => {
    renderWithTheme(
      <QuickViewModal
        frame={mockFrame}
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        onTryOn={mockOnTryOn}
        onFeedback={mockOnFeedback}
        onSaveForLater={mockOnSaveForLater}
        matchScore={0.85}
        matchReason="This frame complements your style preferences and face shape."
      />
    );

    // Check if the modal title is rendered
    expect(screen.getByText('Quick View')).toBeInTheDocument();

    // Check if the frame details are rendered
    expect(screen.getByText('Classic Rectangle Frame')).toBeInTheDocument();
    expect(screen.getByText('Ray-Ban')).toBeInTheDocument();
    expect(screen.getByText('$149.99')).toBeInTheDocument();

    // Check if the match score is rendered
    expect(screen.getByText('85% Match')).toBeInTheDocument();

    // Check if the match reason is rendered
    expect(screen.getByText('This frame complements your style preferences and face shape.')).toBeInTheDocument();

    // Check if the frame specifications are rendered
    expect(screen.getByText('Frame Specifications')).toBeInTheDocument();
    expect(screen.getByText('Style')).toBeInTheDocument();
    expect(screen.getByText('Material')).toBeInTheDocument();
    expect(screen.getByText('Color')).toBeInTheDocument();
    expect(screen.getAllByText('classic')[0]).toBeInTheDocument();
    expect(screen.getAllByText('acetate')[0]).toBeInTheDocument();
    expect(screen.getAllByText('black')[0]).toBeInTheDocument();

    // Check if the action buttons are rendered
    expect(screen.getByText('View Details')).toBeInTheDocument();
    expect(screen.getByText('Try On')).toBeInTheDocument();
  });

  test('does not render when closed', () => {
    const { container } = renderWithTheme(
      <QuickViewModal
        frame={mockFrame}
        open={false}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        onTryOn={mockOnTryOn}
        onFeedback={mockOnFeedback}
        onSaveForLater={mockOnSaveForLater}
      />
    );

    // The modal should not be visible when open is false
    expect(container.firstChild).toHaveStyle('display: none');
  });

  test('calls onClose when close button is clicked', () => {
    renderWithTheme(
      <QuickViewModal
        frame={mockFrame}
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        onTryOn={mockOnTryOn}
        onFeedback={mockOnFeedback}
        onSaveForLater={mockOnSaveForLater}
      />
    );

    // Find and click the close button
    const closeButton = screen.getByRole('button', { name: /close/i }) || 
                        document.querySelector('button:has(svg)');
    
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalled();
    } else {
      throw new Error('Could not find close button');
    }
  });

  test('calls onClose when clicking outside the modal', () => {
    renderWithTheme(
      <QuickViewModal
        frame={mockFrame}
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        onTryOn={mockOnTryOn}
        onFeedback={mockOnFeedback}
        onSaveForLater={mockOnSaveForLater}
      />
    );

    // Find the overlay and click it
    const overlay = document.querySelector('[data-testid="modal-overlay"]') || 
                    document.querySelector('div[role="dialog"]') ||
                    document.querySelector('div:first-child');
    
    if (overlay) {
      fireEvent.click(overlay);
      expect(mockOnClose).toHaveBeenCalled();
    } else {
      throw new Error('Could not find modal overlay');
    }
  });

  test('calls onSelect when View Details button is clicked', () => {
    renderWithTheme(
      <QuickViewModal
        frame={mockFrame}
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        onTryOn={mockOnTryOn}
        onFeedback={mockOnFeedback}
        onSaveForLater={mockOnSaveForLater}
      />
    );

    // Find and click the View Details button
    const viewDetailsButton = screen.getByText('View Details');
    fireEvent.click(viewDetailsButton);
    
    expect(mockOnSelect).toHaveBeenCalledWith('frame-1');
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('calls onTryOn when Try On button is clicked', () => {
    renderWithTheme(
      <QuickViewModal
        frame={mockFrame}
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        onTryOn={mockOnTryOn}
        onFeedback={mockOnFeedback}
        onSaveForLater={mockOnSaveForLater}
      />
    );

    // Find and click the Try On button
    const tryOnButton = screen.getByText('Try On');
    fireEvent.click(tryOnButton);
    
    expect(mockOnTryOn).toHaveBeenCalledWith('frame-1');
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('calls onFeedback when feedback controls are used', () => {
    renderWithTheme(
      <QuickViewModal
        frame={mockFrame}
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        onTryOn={mockOnTryOn}
        onFeedback={mockOnFeedback}
        onSaveForLater={mockOnSaveForLater}
      />
    );

    // Find and click the Like button in the mocked FeedbackControls
    const likeButton = screen.getByTestId('like-button');
    fireEvent.click(likeButton);
    
    expect(mockOnFeedback).toHaveBeenCalledWith('frame-1', true);
    
    // Find and click the Dislike button in the mocked FeedbackControls
    const dislikeButton = screen.getByTestId('dislike-button');
    fireEvent.click(dislikeButton);
    
    expect(mockOnFeedback).toHaveBeenCalledWith('frame-1', false);
  });

  test('calls onSaveForLater when save button is clicked', () => {
    renderWithTheme(
      <QuickViewModal
        frame={mockFrame}
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        onTryOn={mockOnTryOn}
        onFeedback={mockOnFeedback}
        onSaveForLater={mockOnSaveForLater}
      />
    );

    // Find and click the Save button in the mocked FeedbackControls
    const saveButton = screen.getByTestId('save-button');
    fireEvent.click(saveButton);
    
    expect(mockOnSaveForLater).toHaveBeenCalledWith('frame-1');
  });
});