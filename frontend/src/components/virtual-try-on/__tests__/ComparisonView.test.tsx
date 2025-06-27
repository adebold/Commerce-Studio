import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../../../design-system/ThemeProvider';
import ComparisonView from '../ComparisonView';
import { Frame } from '../FrameSelector';

describe('ComparisonView', () => {
  const mockUserImage = 'data:image/png;base64,test-image-data';
  const mockFrames: Frame[] = [
    {
      id: 'frame-1',
      name: 'Test Frame 1',
      brand: 'Test Brand',
      price: 99.99,
      color: 'Black',
      material: 'Metal',
      shape: 'Round',
      imageUrl: '/test-frame-1.jpg'
    },
    {
      id: 'frame-2',
      name: 'Test Frame 2',
      brand: 'Test Brand',
      price: 129.99,
      color: 'Gold',
      material: 'Metal',
      shape: 'Aviator',
      imageUrl: '/test-frame-2.jpg'
    }
  ];
  
  const mockSelectFrame = jest.fn();
  const mockAddFrame = jest.fn();
  const mockClose = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders the component with frames', () => {
    render(
      <ThemeProvider>
        <ComparisonView 
          userImage={mockUserImage} 
          frames={mockFrames}
          onSelectFrame={mockSelectFrame}
          onAddFrame={mockAddFrame}
          onClose={mockClose}
        />
      </ThemeProvider>
    );
    
    expect(screen.getByText('Compare Frames')).toBeInTheDocument();
    expect(screen.getByText('Back to Try-On')).toBeInTheDocument();
    
    // Frame information should be displayed
    expect(screen.getByText('Test Frame 1')).toBeInTheDocument();
    expect(screen.getByText('Test Frame 2')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('$129.99')).toBeInTheDocument();
    
    // User images should be displayed
    const userImages = screen.getAllByAltText('Your photo');
    expect(userImages.length).toBe(2);
    expect(userImages[0].getAttribute('src')).toBe(mockUserImage);
    expect(userImages[1].getAttribute('src')).toBe(mockUserImage);
    
    // Frame overlays should be displayed
    const frameOverlays = screen.getAllByAltText(/Test Frame/);
    expect(frameOverlays.length).toBe(2);
    expect(frameOverlays[0].getAttribute('src')).toBe('/test-frame-1.jpg');
    expect(frameOverlays[1].getAttribute('src')).toBe('/test-frame-2.jpg');
    
    // Add frame option should be displayed (since we have less than 4 frames)
    expect(screen.getByText('Add Frame to Compare')).toBeInTheDocument();
  });
  
  it('renders a message when no frames are provided', () => {
    render(
      <ThemeProvider>
        <ComparisonView 
          userImage={mockUserImage} 
          frames={[]}
          onSelectFrame={mockSelectFrame}
          onAddFrame={mockAddFrame}
          onClose={mockClose}
        />
      </ThemeProvider>
    );
    
    expect(screen.getByText('Compare Frames')).toBeInTheDocument();
    expect(screen.getByText('No frames selected for comparison. Add frames to compare them side by side.')).toBeInTheDocument();
  });
  
  it('calls onSelectFrame when a frame is selected', () => {
    render(
      <ThemeProvider>
        <ComparisonView 
          userImage={mockUserImage} 
          frames={mockFrames}
          onSelectFrame={mockSelectFrame}
          onAddFrame={mockAddFrame}
          onClose={mockClose}
        />
      </ThemeProvider>
    );
    
    // Click the Select button for the first frame
    const selectButtons = screen.getAllByText('Select');
    fireEvent.click(selectButtons[0]);
    
    expect(mockSelectFrame).toHaveBeenCalledWith(mockFrames[0]);
    
    // The button should now say "Selected"
    expect(screen.getByText('Selected')).toBeInTheDocument();
  });
  
  it('calls onAddFrame when Add Frame button is clicked', () => {
    render(
      <ThemeProvider>
        <ComparisonView 
          userImage={mockUserImage} 
          frames={mockFrames}
          onSelectFrame={mockSelectFrame}
          onAddFrame={mockAddFrame}
          onClose={mockClose}
        />
      </ThemeProvider>
    );
    
    fireEvent.click(screen.getByText('Add Frame to Compare'));
    expect(mockAddFrame).toHaveBeenCalled();
  });
  
  it('calls onClose when Back to Try-On button is clicked', () => {
    render(
      <ThemeProvider>
        <ComparisonView 
          userImage={mockUserImage} 
          frames={mockFrames}
          onSelectFrame={mockSelectFrame}
          onAddFrame={mockAddFrame}
          onClose={mockClose}
        />
      </ThemeProvider>
    );
    
    // There are two "Back to Try-On" buttons, one in the header and one at the bottom
    const backButtons = screen.getAllByText('Back to Try-On');
    fireEvent.click(backButtons[0]);
    
    expect(mockClose).toHaveBeenCalled();
  });
  
  it('calls onSelectFrame and onClose when Continue with Selected Frame is clicked', () => {
    render(
      <ThemeProvider>
        <ComparisonView 
          userImage={mockUserImage} 
          frames={mockFrames}
          onSelectFrame={mockSelectFrame}
          onAddFrame={mockAddFrame}
          onClose={mockClose}
        />
      </ThemeProvider>
    );
    
    // First select a frame
    const selectButtons = screen.getAllByText('Select');
    fireEvent.click(selectButtons[0]);
    
    // Clear the mock to check the next call
    mockSelectFrame.mockClear();
    
    // Click the Continue button
    fireEvent.click(screen.getByText('Continue with Selected Frame'));
    
    expect(mockSelectFrame).toHaveBeenCalledWith(mockFrames[0]);
    expect(mockClose).toHaveBeenCalled();
  });
  
  it('disables Continue button when no frame is selected', () => {
    render(
      <ThemeProvider>
        <ComparisonView 
          userImage={mockUserImage} 
          frames={mockFrames}
          onSelectFrame={mockSelectFrame}
          onAddFrame={mockAddFrame}
          onClose={mockClose}
        />
      </ThemeProvider>
    );
    
    // The Continue button should be disabled
    const continueButton = screen.getByText('Continue with Selected Frame');
    expect(continueButton.closest('button')).toBeDisabled();
  });
  
  it('handles frame image loading errors', () => {
    render(
      <ThemeProvider>
        <ComparisonView 
          userImage={mockUserImage} 
          frames={mockFrames}
          onSelectFrame={mockSelectFrame}
          onAddFrame={mockAddFrame}
          onClose={mockClose}
        />
      </ThemeProvider>
    );
    
    // Get the frame overlay images
    const frameOverlays = screen.getAllByAltText(/Test Frame/);
    
    // Simulate an error on the first image
    fireEvent.error(frameOverlays[0]);
    
    // The image should have its src set to the fallback URL
    expect(frameOverlays[0].getAttribute('src')).toBe('https://via.placeholder.com/400x200?text=Frame+Overlay');
  });
  
  it('does not show Add Frame option when 4 frames are provided', () => {
    const fourFrames = [
      ...mockFrames,
      {
        id: 'frame-3',
        name: 'Test Frame 3',
        brand: 'Test Brand',
        price: 149.99,
        color: 'Silver',
        material: 'Metal',
        shape: 'Rectangle',
        imageUrl: '/test-frame-3.jpg'
      },
      {
        id: 'frame-4',
        name: 'Test Frame 4',
        brand: 'Test Brand',
        price: 159.99,
        color: 'Tortoise',
        material: 'Acetate',
        shape: 'Square',
        imageUrl: '/test-frame-4.jpg'
      }
    ];
    
    render(
      <ThemeProvider>
        <ComparisonView 
          userImage={mockUserImage} 
          frames={fourFrames}
          onSelectFrame={mockSelectFrame}
          onAddFrame={mockAddFrame}
          onClose={mockClose}
        />
      </ThemeProvider>
    );
    
    // Add frame option should not be displayed
    expect(screen.queryByText('Add Frame to Compare')).not.toBeInTheDocument();
  });
});