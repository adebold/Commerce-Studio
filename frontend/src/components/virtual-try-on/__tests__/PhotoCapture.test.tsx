import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../../../design-system/ThemeProvider';
import PhotoCapture from '../PhotoCapture';

// Mock navigator.mediaDevices
const mockGetUserMedia = jest.fn();
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia
  },
  writable: true
});

// Mock stream and video element
const mockStream = {
  getTracks: () => [{ stop: jest.fn() }]
};

// Mock canvas context
const mockDrawImage = jest.fn();
const mockToDataURL = jest.fn().mockReturnValue('test-image-data');
const mockGetContext = jest.fn().mockReturnValue({
  drawImage: mockDrawImage
});

// Mock canvas element
HTMLCanvasElement.prototype.getContext = mockGetContext;
HTMLCanvasElement.prototype.toDataURL = mockToDataURL;

describe('PhotoCapture', () => {
  const onPhotoCaptureMock = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserMedia.mockResolvedValue(mockStream);
  });
  
  it('renders the component with initial state', () => {
    render(
      <ThemeProvider>
        <PhotoCapture onPhotoCapture={onPhotoCaptureMock} />
      </ThemeProvider>
    );
    
    // Use more specific queries to find elements
    expect(screen.getByText('Capture or Upload Your Photo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Use Camera' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload Photo' })).toBeInTheDocument();
  });
  
  it('starts camera when "Use Camera" button is clicked', async () => {
    render(
      <ThemeProvider>
        <PhotoCapture onPhotoCapture={onPhotoCaptureMock} />
      </ThemeProvider>
    );
    
    fireEvent.click(screen.getByText('Use Camera'));
    
    expect(mockGetUserMedia).toHaveBeenCalledWith({
      video: { facingMode: 'user', width: 640, height: 480 }
    });
    
    // Wait for camera to start
    await screen.findByRole('button', { name: 'Take Photo' });
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });
  
  it('shows error message when camera access fails', async () => {
    mockGetUserMedia.mockRejectedValueOnce(new Error('Camera access denied'));
    
    render(
      <ThemeProvider>
        <PhotoCapture onPhotoCapture={onPhotoCaptureMock} />
      </ThemeProvider>
    );
    
    fireEvent.click(screen.getByText('Use Camera'));
    
    // Wait for error message
    await screen.findByText(/Unable to access camera/i);
  });
  
  it('captures photo when "Take Photo" button is clicked', async () => {
    // Mock video element properties
    Object.defineProperty(HTMLVideoElement.prototype, 'videoWidth', { value: 640 });
    Object.defineProperty(HTMLVideoElement.prototype, 'videoHeight', { value: 480 });
    
    render(
      <ThemeProvider>
        <PhotoCapture onPhotoCapture={onPhotoCaptureMock} />
      </ThemeProvider>
    );
    
    // Start camera
    fireEvent.click(screen.getByText('Use Camera'));
    await screen.findByRole('button', { name: 'Take Photo' });
    
    // Take photo
    fireEvent.click(screen.getByRole('button', { name: 'Take Photo' }));
    
    expect(mockDrawImage).toHaveBeenCalled();
    expect(mockToDataURL).toHaveBeenCalledWith('image/png');
    expect(onPhotoCaptureMock).toHaveBeenCalledWith('test-image-data');
    
    // Check that we're back to the image view
    expect(screen.getByRole('button', { name: 'Take Another Photo' })).toBeInTheDocument();
  });
  
  it('stops camera when "Cancel" button is clicked', async () => {
    render(
      <ThemeProvider>
        <PhotoCapture onPhotoCapture={onPhotoCaptureMock} />
      </ThemeProvider>
    );
    
    // Start camera
    fireEvent.click(screen.getByText('Use Camera'));
    await screen.findByRole('button', { name: 'Take Photo' });
    
    // Cancel
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    
    // Check that we're back to the initial state
    expect(screen.getByRole('button', { name: 'Use Camera' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload Photo' })).toBeInTheDocument();
  });
  
  it('handles file upload', () => {
    render(
      <ThemeProvider>
        <PhotoCapture onPhotoCapture={onPhotoCaptureMock} />
      </ThemeProvider>
    );
    
    // Create a mock file
    const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
    
    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      onload: null,
      result: 'test-image-data'
    };
    
    // Replace FileReader with mock
    global.FileReader = jest.fn(() => mockFileReader) as unknown as typeof FileReader;
    
    // Get the hidden file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    // Trigger file selection
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Simulate FileReader onload
    if (mockFileReader.onload) {
      (mockFileReader.onload as EventListener)({ target: mockFileReader } as unknown as Event);
    }
    
    expect(onPhotoCaptureMock).toHaveBeenCalledWith('test-image-data');
  });
  
  it('allows taking another photo', async () => {
    render(
      <ThemeProvider>
        <PhotoCapture onPhotoCapture={onPhotoCaptureMock} />
      </ThemeProvider>
    );
    
    // Start camera
    fireEvent.click(screen.getByText('Use Camera'));
    await screen.findByRole('button', { name: 'Take Photo' });
    
    // Take photo
    fireEvent.click(screen.getByRole('button', { name: 'Take Photo' }));
    
    // Take another photo
    fireEvent.click(screen.getByRole('button', { name: 'Take Another Photo' }));
    
    // Check that we're back to the initial state
    expect(screen.getByRole('button', { name: 'Use Camera' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload Photo' })).toBeInTheDocument();
  });
});