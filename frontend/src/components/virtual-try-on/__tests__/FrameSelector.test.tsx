import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../../../design-system/ThemeProvider';
import FrameSelector from '../FrameSelector';

// Mock image error handler
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('FrameSelector', () => {
  const onFrameSelectMock = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders the component with frame options', () => {
    render(
      <ThemeProvider>
        <FrameSelector onFrameSelect={onFrameSelectMock} />
      </ThemeProvider>
    );
    
    expect(screen.getByText('Select Your Frames')).toBeInTheDocument();
    expect(screen.getByText('Filter by:')).toBeInTheDocument();
    
    // Check that frame cards are rendered
    expect(screen.getByText('Aviator Classic')).toBeInTheDocument();
    expect(screen.getByText('Wayfarer')).toBeInTheDocument();
    expect(screen.getByText('Round Metal')).toBeInTheDocument();
  });
  
  it('allows selecting a frame', () => {
    render(
      <ThemeProvider>
        <FrameSelector onFrameSelect={onFrameSelectMock} />
      </ThemeProvider>
    );
    
    // Click on a frame
    fireEvent.click(screen.getByText('Aviator Classic'));
    
    // Check that the onFrameSelect callback was called with the correct frame
    expect(onFrameSelectMock).toHaveBeenCalledWith(expect.objectContaining({
      id: 'frame-1',
      name: 'Aviator Classic',
      brand: 'RayBan'
    }));
    
    // Check that the "Try On" button appears with the selected frame name
    expect(screen.getByText('Try On Aviator Classic')).toBeInTheDocument();
  });
  
  it('filters frames by shape', () => {
    render(
      <ThemeProvider>
        <FrameSelector onFrameSelect={onFrameSelectMock} />
      </ThemeProvider>
    );
    
    // Click on the "Round" filter
    fireEvent.click(screen.getByText('Round'));
    
    // Check that only round frames are shown
    expect(screen.getByText('Round Metal')).toBeInTheDocument();
    expect(screen.getByText('Erika')).toBeInTheDocument();
    expect(screen.queryByText('Wayfarer')).not.toBeInTheDocument();
    expect(screen.queryByText('Aviator Classic')).not.toBeInTheDocument();
  });
  
  it('filters frames by material', () => {
    render(
      <ThemeProvider>
        <FrameSelector onFrameSelect={onFrameSelectMock} />
      </ThemeProvider>
    );
    
    // Click on the "Metal" filter
    fireEvent.click(screen.getByText('Metal'));
    
    // Check that only metal frames are shown
    expect(screen.getByText('Aviator Classic')).toBeInTheDocument();
    expect(screen.getByText('Round Metal')).toBeInTheDocument();
    expect(screen.queryByText('Wayfarer')).not.toBeInTheDocument();
    expect(screen.queryByText('Erika')).not.toBeInTheDocument();
  });
  
  it('toggles filters when clicked again', () => {
    render(
      <ThemeProvider>
        <FrameSelector onFrameSelect={onFrameSelectMock} />
      </ThemeProvider>
    );
    
    // Click on the "Round" filter
    fireEvent.click(screen.getByText('Round'));
    
    // Check that only round frames are shown
    expect(screen.getByText('Round Metal')).toBeInTheDocument();
    expect(screen.queryByText('Wayfarer')).not.toBeInTheDocument();
    
    // Click on the "Round" filter again to toggle it off
    fireEvent.click(screen.getByText('Round'));
    
    // Check that all frames are shown again
    expect(screen.getByText('Round Metal')).toBeInTheDocument();
    expect(screen.getByText('Wayfarer')).toBeInTheDocument();
    expect(screen.getByText('Aviator Classic')).toBeInTheDocument();
  });
  
  it('handles image loading errors', () => {
    render(
      <ThemeProvider>
        <FrameSelector onFrameSelect={onFrameSelectMock} />
      </ThemeProvider>
    );
    
    // Get all frame images
    const images = document.querySelectorAll('img');
    
    // Simulate an error on the first image
    fireEvent.error(images[0]);
    
    // The image should have its src set to the fallback URL
    expect(images[0].getAttribute('src')).toBe('https://via.placeholder.com/150?text=Frame');
  });
  
  it('calls onFrameSelect when the Try On button is clicked', () => {
    render(
      <ThemeProvider>
        <FrameSelector onFrameSelect={onFrameSelectMock} />
      </ThemeProvider>
    );
    
    // Click on a frame
    fireEvent.click(screen.getByText('Aviator Classic'));
    
    // Clear the mock to check the next call
    onFrameSelectMock.mockClear();
    
    // Click the Try On button
    fireEvent.click(screen.getByText('Try On Aviator Classic'));
    
    // Check that onFrameSelect was called again with the same frame
    expect(onFrameSelectMock).toHaveBeenCalledWith(expect.objectContaining({
      id: 'frame-1',
      name: 'Aviator Classic'
    }));
  });
});