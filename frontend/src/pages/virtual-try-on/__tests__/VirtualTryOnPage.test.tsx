import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../../../design-system/ThemeProvider';
import VirtualTryOnPage from '../index';
import { Frame } from '../../../components/virtual-try-on';

// Mock the virtual try-on components
jest.mock('../../../components/virtual-try-on', () => ({
  PhotoCapture: ({ onPhotoCapture }: { onPhotoCapture: (img: string) => void }) => (
    <div data-testid="photo-capture">
      <button onClick={() => onPhotoCapture('test-image-data')}>Capture Photo</button>
    </div>
  ),
  FrameSelector: ({ onFrameSelect }: { onFrameSelect: (frame: Frame) => void }) => (
    <div data-testid="frame-selector">
      <button onClick={() => onFrameSelect({
        id: 'frame-1',
        name: 'Test Frame',
        brand: 'Test Brand',
        price: 99.99,
        color: 'Black',
        material: 'Metal',
        shape: 'Round',
        imageUrl: '/test-image.jpg'
      })}>
        Select Frame
      </button>
    </div>
  ),
  TryOnVisualization: ({ 
    userImage, 
    selectedFrame,
    onSave,
    onShare,
    onCompare
  }: { 
    userImage: string, 
    selectedFrame: Frame | null,
    onSave?: () => void,
    onShare?: () => void,
    onCompare?: () => void
  }) => (
    <div data-testid="try-on-visualization">
      <div>User Image: {userImage}</div>
      <div>Selected Frame: {selectedFrame?.name || 'None'}</div>
      {onSave && <button onClick={onSave}>Save</button>}
      {onShare && <button onClick={onShare}>Share</button>}
      {onCompare && <button onClick={onCompare}>Compare</button>}
    </div>
  ),
  ComparisonView: ({ 
    userImage, 
    frames,
    onSelectFrame,
    onAddFrame,
    onClose
  }: { 
    userImage: string, 
    frames: Frame[],
    onSelectFrame: (frame: Frame) => void,
    onAddFrame: () => void,
    onClose: () => void
  }) => (
    <div data-testid="comparison-view">
      <div>User Image: {userImage}</div>
      <div>Frames Count: {frames.length}</div>
      <button onClick={() => onSelectFrame(frames[0])}>Select First Frame</button>
      <button onClick={onAddFrame}>Add Frame</button>
      <button onClick={onClose}>Close</button>
    </div>
  )
}));

// Mock window.alert
const mockAlert = jest.fn();
window.alert = mockAlert;

describe('VirtualTryOnPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the page title and description', () => {
    render(
      <ThemeProvider>
        <VirtualTryOnPage />
      </ThemeProvider>
    );
    
    expect(screen.getByText('Virtual Try-On')).toBeInTheDocument();
    expect(screen.getByText(/Try on different eyewear frames virtually/i)).toBeInTheDocument();
  });

  it('initially shows the PhotoCapture component', () => {
    render(
      <ThemeProvider>
        <VirtualTryOnPage />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('photo-capture')).toBeInTheDocument();
    expect(screen.queryByTestId('frame-selector')).not.toBeInTheDocument();
    expect(screen.queryByTestId('try-on-visualization')).not.toBeInTheDocument();
  });

  it('shows TryOnVisualization and FrameSelector after capturing a photo', () => {
    render(
      <ThemeProvider>
        <VirtualTryOnPage />
      </ThemeProvider>
    );
    
    // Capture a photo
    fireEvent.click(screen.getByText('Capture Photo'));
    
    // Check that the components are updated
    expect(screen.queryByTestId('photo-capture')).not.toBeInTheDocument();
    expect(screen.getByTestId('frame-selector')).toBeInTheDocument();
    expect(screen.getByTestId('try-on-visualization')).toBeInTheDocument();
  });

  it('updates the TryOnVisualization when a frame is selected', async () => {
    render(
      <ThemeProvider>
        <VirtualTryOnPage />
      </ThemeProvider>
    );
    
    // Capture a photo
    fireEvent.click(screen.getByText('Capture Photo'));
    
    // Select a frame
    fireEvent.click(screen.getByText('Select Frame'));
    
    // Check that the selected frame is displayed
    await waitFor(() => {
      expect(screen.getByText('Selected Frame: Test Frame')).toBeInTheDocument();
    });
  });

  it('shows the ComparisonView when Compare button is clicked', async () => {
    render(
      <ThemeProvider>
        <VirtualTryOnPage />
      </ThemeProvider>
    );
    
    // Capture a photo
    fireEvent.click(screen.getByText('Capture Photo'));
    
    // Select a frame
    fireEvent.click(screen.getByText('Select Frame'));
    
    // Click the Compare button
    fireEvent.click(screen.getByText('Compare'));
    
    // Check that the ComparisonView is displayed
    expect(screen.getByTestId('comparison-view')).toBeInTheDocument();
    expect(screen.queryByTestId('try-on-visualization')).not.toBeInTheDocument();
    expect(screen.queryByTestId('frame-selector')).not.toBeInTheDocument();
  });

  it('returns to the main view when closing the ComparisonView', async () => {
    render(
      <ThemeProvider>
        <VirtualTryOnPage />
      </ThemeProvider>
    );
    
    // Capture a photo
    fireEvent.click(screen.getByText('Capture Photo'));
    
    // Select a frame
    fireEvent.click(screen.getByText('Select Frame'));
    
    // Click the Compare button
    fireEvent.click(screen.getByText('Compare'));
    
    // Close the ComparisonView
    fireEvent.click(screen.getByText('Close'));
    
    // Check that we're back to the main view
    expect(screen.queryByTestId('comparison-view')).not.toBeInTheDocument();
    expect(screen.getByTestId('try-on-visualization')).toBeInTheDocument();
    expect(screen.getByTestId('frame-selector')).toBeInTheDocument();
  });

  it('shows an alert when Save button is clicked', async () => {
    render(
      <ThemeProvider>
        <VirtualTryOnPage />
      </ThemeProvider>
    );
    
    // Capture a photo
    fireEvent.click(screen.getByText('Capture Photo'));
    
    // Click the Save button
    fireEvent.click(screen.getByText('Save'));
    
    // Check that the alert was shown
    expect(mockAlert).toHaveBeenCalledWith('Image saved successfully!');
  });

  it('shows an alert when Share button is clicked', async () => {
    render(
      <ThemeProvider>
        <VirtualTryOnPage />
      </ThemeProvider>
    );
    
    // Capture a photo
    fireEvent.click(screen.getByText('Capture Photo'));
    
    // Click the Share button
    fireEvent.click(screen.getByText('Share'));
    
    // Check that the alert was shown
    expect(mockAlert).toHaveBeenCalledWith('Sharing functionality would open here!');
  });
});