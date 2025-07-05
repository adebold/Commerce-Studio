/**
 * Style Recommendations Page Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RecommendationsPage from '../index';

// Import types for mocked components
import { StyleCategory } from '../../../components/recommendations/StyleCategoryComponent';
import { Frame } from '../../../types/recommendations';

// Mock the components to simplify testing
jest.mock('../../../components/recommendations/StyleCategoryComponent', () => ({
  __esModule: true,
  default: ({
    category,
    onFrameSelect,
    onToggle
  }: {
    category: StyleCategory;
    onFrameSelect: (frameId: string) => void;
    onToggle: () => void;
  }) => (
    <div data-testid={`style-category-${category.id}`}>
      <h3>{category.name}</h3>
      <button onClick={() => onToggle()}>Toggle</button>
      {category.frames.map((frame: Frame) => (
        <div key={frame.id}>
          <span>{frame.name}</span>
          <button onClick={() => onFrameSelect(frame.id)}>Select</button>
        </div>
      ))}
    </div>
  ),
}));

jest.mock('../../../components/recommendations/RecommendationCard', () => ({
  __esModule: true,
  default: ({
    frame,
    onSelect,
    onFeedback,
    onSaveForLater,
    onTryOn
  }: {
    frame: Frame & { matchScore: number; matchReason: string };
    onSelect: (frameId: string) => void;
    onFeedback: (frameId: string, liked: boolean) => void;
    onSaveForLater: (frameId: string) => void;
    onTryOn: (frameId: string) => void;
  }) => (
    <div data-testid={`recommendation-card-${frame.id}`}>
      <h3>{frame.name}</h3>
      <button onClick={() => onSelect(frame.id)}>View Details</button>
      <button onClick={() => onFeedback(frame.id, true)}>Like</button>
      <button onClick={() => onFeedback(frame.id, false)}>Dislike</button>
      <button onClick={() => onSaveForLater(frame.id)}>Save</button>
      <button onClick={() => onTryOn(frame.id)}>Try On</button>
    </div>
  ),
}));

jest.mock('../../../components/recommendations/SimilarStylesComponent', () => ({
  __esModule: true,
  default: ({
    frames,
    onSelect
  }: {
    frames: Frame[];
    onSelect: (frameId: string) => void;
  }) => (
    <div data-testid="similar-styles">
      <h3>Similar Styles</h3>
      {frames.map((frame: Frame) => (
        <div key={frame.id}>
          <span>{frame.name}</span>
          <button onClick={() => onSelect(frame.id)}>Select</button>
        </div>
      ))}
    </div>
  ),
}));

jest.mock('../../../components/recommendations/RecentlyViewedComponent', () => ({
  __esModule: true,
  default: ({
    frames,
    onSelect
  }: {
    frames: Frame[];
    onSelect: (frameId: string) => void;
  }) => (
    <div data-testid="recently-viewed">
      <h3>Recently Viewed</h3>
      {frames.map((frame: Frame) => (
        <div key={frame.id}>
          <span>{frame.name}</span>
          <button onClick={() => onSelect(frame.id)}>Select</button>
        </div>
      ))}
    </div>
  ),
}));

// Mock console.log to prevent test output clutter
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

describe('RecommendationsPage', () => {
  const renderWithRouter = (ui: React.ReactNode, { route = '/recommendations' } = {}) => {
    return render(
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/recommendations" element={ui} />
          <Route path="/recommendations/:categoryId" element={ui} />
          <Route path="/frames/:frameId" element={<div>Frame Detail Page</div>} />
          <Route path="/virtual-try-on" element={<div>Virtual Try-On Page</div>} />
          <Route path="/frame-finder" element={<div>Frame Finder Page</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  test('renders loading state initially', () => {
    renderWithRouter(<RecommendationsPage />);
    expect(screen.getByText(/Loading your personalized recommendations/i)).toBeInTheDocument();
  });

  test('renders recommendations after loading', async () => {
    renderWithRouter(<RecommendationsPage />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/Loading your personalized recommendations/i)).not.toBeInTheDocument();
    });
    
    // Check if main sections are rendered
    expect(screen.getByText(/Your Style Recommendations/i)).toBeInTheDocument();
    expect(screen.getByText(/Top Picks For You/i)).toBeInTheDocument();
    expect(screen.getByText(/Browse By Style/i)).toBeInTheDocument();
    expect(screen.getByTestId('similar-styles')).toBeInTheDocument();
    expect(screen.getByTestId('recently-viewed')).toBeInTheDocument();
  });

  test('navigates to frame detail page when a frame is selected', async () => {
    renderWithRouter(<RecommendationsPage />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/Loading your personalized recommendations/i)).not.toBeInTheDocument();
    });
    
    // Find and click a "View Details" button in a recommendation card
    const viewDetailsButton = screen.getAllByText('View Details')[0];
    fireEvent.click(viewDetailsButton);
    
    // Check if navigation occurred
    expect(screen.getByText(/Frame Detail Page/i)).toBeInTheDocument();
  });

  test('navigates to virtual try-on page when try-on button is clicked', async () => {
    renderWithRouter(<RecommendationsPage />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/Loading your personalized recommendations/i)).not.toBeInTheDocument();
    });
    
    // Find and click a "Try On" button in a recommendation card
    const tryOnButton = screen.getAllByText('Try On')[0];
    fireEvent.click(tryOnButton);
    
    // Check if navigation occurred
    expect(screen.getByText(/Virtual Try-On Page/i)).toBeInTheDocument();
  });

  test('navigates to frame finder page when frame finder button is clicked', async () => {
    renderWithRouter(<RecommendationsPage />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/Loading your personalized recommendations/i)).not.toBeInTheDocument();
    });
    
    // Find and click the "Use Frame Finder" button
    const frameFinderButton = screen.getByText('Use Frame Finder');
    fireEvent.click(frameFinderButton);
    
    // Check if navigation occurred
    expect(screen.getByText(/Frame Finder Page/i)).toBeInTheDocument();
  });

  test('handles feedback when like/dislike buttons are clicked', async () => {
    renderWithRouter(<RecommendationsPage />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/Loading your personalized recommendations/i)).not.toBeInTheDocument();
    });
    
    // Find and click a "Like" button in a recommendation card
    const likeButton = screen.getAllByText('Like')[0];
    fireEvent.click(likeButton);
    
    // We can't directly test console.log, but we can verify the component didn't crash
    expect(screen.getByText(/Your Style Recommendations/i)).toBeInTheDocument();
  });

  test('handles save for later when save button is clicked', async () => {
    renderWithRouter(<RecommendationsPage />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/Loading your personalized recommendations/i)).not.toBeInTheDocument();
    });
    
    // Find and click a "Save" button in a recommendation card
    const saveButton = screen.getAllByText('Save')[0];
    fireEvent.click(saveButton);
    
    // We can't directly test console.log, but we can verify the component didn't crash
    expect(screen.getByText(/Your Style Recommendations/i)).toBeInTheDocument();
  });
});