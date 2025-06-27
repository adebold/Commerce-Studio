import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../../../design-system/ThemeProvider';
import TryOnVisualization from '../TryOnVisualization';
import { Frame } from '../FrameSelector';

describe('TryOnVisualization', () => {
  const mockUserImage = 'data:image/png;base64,test-image-data';
  const mockFrame: Frame = {
    id: 'frame-1',
    name: 'Test Frame',
    brand: 'Test Brand',
    price: 99.99,
    color: 'Black',
    material: 'Metal',
    shape: 'Round',
    imageUrl: '/test-frame.jpg'
  };
  
  const mockSave = jest.fn();
  const mockShare = jest.fn();
  const mockCompare = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders the component with user image but no frame', () => {
    render(
      <ThemeProvider>
        <TryOnVisualization 
          userImage={mockUserImage} 
          selectedFrame={null}
          onSave={mockSave}
          onShare={mockShare}
          onCompare={mockCompare}
        />
      </ThemeProvider>
    );
    
    expect(screen.getByText('Virtual Try-On')).toBeInTheDocument();
    expect(screen.getByText('Select a frame to see how it looks on you')).toBeInTheDocument();
    
    // User image should be displayed
    const userImage = screen.getByAltText('Your photo');
    expect(userImage).toBeInTheDocument();
    expect(userImage.getAttribute('src')).toBe(mockUserImage);
    
    // No frame overlay should be present
    expect(screen.queryByAltText('Test Frame')).not.toBeInTheDocument();
  });
  
  it('renders the component with user image and selected frame', () => {
    render(
      <ThemeProvider>
        <TryOnVisualization 
          userImage={mockUserImage} 
          selectedFrame={mockFrame}
          onSave={mockSave}
          onShare={mockShare}
          onCompare={mockCompare}
        />
      </ThemeProvider>
    );
    
    expect(screen.getByText('Virtual Try-On')).toBeInTheDocument();
    expect(screen.getByText(`Adjust the fit of your ${mockFrame.name}`)).toBeInTheDocument();
    
    // User image should be displayed
    const userImage = screen.getByAltText('Your photo');
    expect(userImage).toBeInTheDocument();
    expect(userImage.getAttribute('src')).toBe(mockUserImage);
    
    // Frame overlay should be displayed
    const frameOverlay = screen.getByAltText(mockFrame.name);
    expect(frameOverlay).toBeInTheDocument();
    expect(frameOverlay.getAttribute('src')).toBe(mockFrame.imageUrl);
    
    // Control sliders should be displayed
    expect(screen.getByText('Size')).toBeInTheDocument();
    expect(screen.getByText('Horizontal')).toBeInTheDocument();
    expect(screen.getByText('Vertical')).toBeInTheDocument();
    expect(screen.getByText('Rotation')).toBeInTheDocument();
    
    // Action buttons should be displayed
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Share')).toBeInTheDocument();
    expect(screen.getByText('Compare with Other Frames')).toBeInTheDocument();
  });
  
  it('calls onSave when Save button is clicked', () => {
    render(
      <ThemeProvider>
        <TryOnVisualization 
          userImage={mockUserImage} 
          selectedFrame={mockFrame}
          onSave={mockSave}
          onShare={mockShare}
          onCompare={mockCompare}
        />
      </ThemeProvider>
    );
    
    fireEvent.click(screen.getByText('Save'));
    expect(mockSave).toHaveBeenCalled();
  });
  
  it('calls onShare when Share button is clicked', () => {
    render(
      <ThemeProvider>
        <TryOnVisualization 
          userImage={mockUserImage} 
          selectedFrame={mockFrame}
          onSave={mockSave}
          onShare={mockShare}
          onCompare={mockCompare}
        />
      </ThemeProvider>
    );
    
    fireEvent.click(screen.getByText('Share'));
    expect(mockShare).toHaveBeenCalled();
  });
  
  it('calls onCompare when Compare button is clicked', () => {
    render(
      <ThemeProvider>
        <TryOnVisualization 
          userImage={mockUserImage} 
          selectedFrame={mockFrame}
          onSave={mockSave}
          onShare={mockShare}
          onCompare={mockCompare}
        />
      </ThemeProvider>
    );
    
    fireEvent.click(screen.getByText('Compare with Other Frames'));
    expect(mockCompare).toHaveBeenCalled();
  });
  
  it('handles frame image loading errors', () => {
    render(
      <ThemeProvider>
        <TryOnVisualization 
          userImage={mockUserImage} 
          selectedFrame={mockFrame}
          onSave={mockSave}
          onShare={mockShare}
          onCompare={mockCompare}
        />
      </ThemeProvider>
    );
    
    // Get the frame overlay image
    const frameOverlay = screen.getByAltText(mockFrame.name);
    
    // Simulate an error on the image
    fireEvent.error(frameOverlay);
    
    // The image should have its src set to the fallback URL
    expect(frameOverlay.getAttribute('src')).toBe('https://via.placeholder.com/400x200?text=Frame+Overlay');
  });
  
  it('allows adjusting frame size with slider', () => {
    render(
      <ThemeProvider>
        <TryOnVisualization 
          userImage={mockUserImage} 
          selectedFrame={mockFrame}
          onSave={mockSave}
          onShare={mockShare}
          onCompare={mockCompare}
        />
      </ThemeProvider>
    );
    
    // Get the size slider
    const sizeSlider = screen.getAllByRole('slider')[0];
    
    // Change the slider value
    fireEvent.change(sizeSlider, { target: { value: '1.2' } });
    
    // Get the frame overlay
    const frameOverlay = screen.getByAltText(mockFrame.name);
    
    // Check that the transform style includes the new scale
    expect(frameOverlay.style.transform).toContain('scale(1.2)');
  });
  
  it('allows adjusting frame position with sliders', () => {
    render(
      <ThemeProvider>
        <TryOnVisualization 
          userImage={mockUserImage} 
          selectedFrame={mockFrame}
          onSave={mockSave}
          onShare={mockShare}
          onCompare={mockCompare}
        />
      </ThemeProvider>
    );
    
    // Get the horizontal and vertical sliders
    const horizontalSlider = screen.getAllByRole('slider')[1];
    const verticalSlider = screen.getAllByRole('slider')[2];
    
    // Change the slider values
    fireEvent.change(horizontalSlider, { target: { value: '10' } });
    fireEvent.change(verticalSlider, { target: { value: '5' } });
    
    // Get the frame overlay
    const frameOverlay = screen.getByAltText(mockFrame.name);
    
    // Check that the transform style includes the new position
    expect(frameOverlay.style.transform).toContain('translate(10%, 5%)');
  });
  
  it('allows adjusting frame rotation with slider', () => {
    render(
      <ThemeProvider>
        <TryOnVisualization 
          userImage={mockUserImage} 
          selectedFrame={mockFrame}
          onSave={mockSave}
          onShare={mockShare}
          onCompare={mockCompare}
        />
      </ThemeProvider>
    );
    
    // Get the rotation slider
    const rotationSlider = screen.getAllByRole('slider')[3];
    
    // Change the slider value
    fireEvent.change(rotationSlider, { target: { value: '5' } });
    
    // Get the frame overlay
    const frameOverlay = screen.getByAltText(mockFrame.name);
    
    // Check that the transform style includes the new rotation
    expect(frameOverlay.style.transform).toContain('rotate(5deg)');
  });
});