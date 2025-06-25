import { VirtualTryOn } from '../../lib/virtual-try-on';
import { ApiClient } from '../../lib/api-client';
import { FaceShape } from '../../lib/types';

// Mock ApiClient
jest.mock('../../lib/api-client');

describe('VirtualTryOn', () => {
  let virtualTryOn: VirtualTryOn;
  let mockApiClient: jest.Mocked<ApiClient>;
  let mockContainer: HTMLElement;
  let mockVideo: HTMLVideoElement;
  let mockCanvas: HTMLCanvasElement;
  let mockContext: CanvasRenderingContext2D;
  let mockStream: MediaStream;
  
  beforeEach(() => {
    // Create a mock ApiClient
    mockApiClient = new ApiClient({
      clientId: 'test-client-id',
      accessToken: 'test-access-token',
      storeHash: 'test-store-hash',
      varaiApiKey: 'process.env.APIKEY_2525'
    }) as jest.Mocked<ApiClient>;
    
    // Mock ApiClient methods
    mockApiClient.getVirtualTryOnModel = jest.fn().mockResolvedValue({
      id: 'model-123',
      url: 'https://example.com/model.glb'
    });
    
    mockApiClient.detectFaceShape = jest.fn().mockResolvedValue('oval' as FaceShape);
    
    mockApiClient.trackEvent = jest.fn().mockResolvedValue(undefined);
    
    mockApiClient.getProduct = jest.fn().mockResolvedValue({
      id: 123,
      name: 'Test Product',
      sku: 'TEST-123',
      price: 99.99,
      brand: 'Test Brand',
      images: [],
      customFields: {
        varai_face_shape_compatibility: 'oval,round'
      }
    });
    
    // Create mock DOM elements
    mockContainer = document.createElement('div');
    mockVideo = document.createElement('video') as HTMLVideoElement;
    mockCanvas = document.createElement('canvas');
    mockContext = {
      drawImage: jest.fn(),
    } as unknown as CanvasRenderingContext2D;
    
    // Mock canvas getContext
    mockCanvas.getContext = jest.fn().mockReturnValue(mockContext);
    
    // Mock video properties
    Object.defineProperty(mockVideo, 'videoWidth', { value: 1280 });
    Object.defineProperty(mockVideo, 'videoHeight', { value: 720 });
    
    // Mock canvas toDataURL
    mockCanvas.toDataURL = jest.fn().mockReturnValue('data:image/jpeg;base64,test-image-data');
    
    // Mock MediaStream
    mockStream = {
      getTracks: jest.fn().mockReturnValue([
        { stop: jest.fn() }
      ])
    } as unknown as MediaStream;
    
    // Mock navigator.mediaDevices
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: jest.fn().mockResolvedValue(mockStream)
      },
      writable: true
    });
    
    // Mock document.createElement
    document.createElement = jest.fn().mockImplementation((tag) => {
      if (tag === 'video') return mockVideo;
      if (tag === 'canvas') return mockCanvas;
      if (tag === 'div') return document.createElement('div');
      if (tag === 'button') return document.createElement('button');
      return document.createElement(tag);
    });
    
    // Create VirtualTryOn instance
    virtualTryOn = new VirtualTryOn(mockApiClient);
  });
  
  describe('initialize', () => {
    test('should initialize virtual try-on', async () => {
      const onSuccess = jest.fn();
      const onError = jest.fn();
      const onCapture = jest.fn();
      const onFaceShapeDetected = jest.fn();
      
      await virtualTryOn.initialize({
        container: mockContainer,
        productId: 123,
        onSuccess,
        onError,
        onCapture,
        onFaceShapeDetected,
        detectFaceShape: true,
        enableMeasurements: true
      });
      
      // Check that container was set up
      expect(mockContainer.innerHTML).not.toBe('');
      
      // Check that model was loaded
      expect(mockApiClient.getVirtualTryOnModel).toHaveBeenCalledWith(123);
      
      // Check that camera was initialized
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
      
      // Check that video was set up
      expect(mockVideo.srcObject).toBe(mockStream);
      
      // Check that onSuccess was called
      expect(onSuccess).toHaveBeenCalled();
    });
    
    test('should handle initialization errors', async () => {
      const onSuccess = jest.fn();
      const onError = jest.fn();
      
      // Mock getUserMedia to throw an error
      (navigator.mediaDevices.getUserMedia as jest.Mock).mockRejectedValue(new Error('Camera access denied'));
      
      await virtualTryOn.initialize({
        container: mockContainer,
        productId: 123,
        onSuccess,
        onError
      });
      
      // Check that onError was called with the error
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
      
      // Check that onSuccess was not called
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });
  
  describe('capture', () => {
    test('should capture photo from video', async () => {
      const onCapture = jest.fn();
      
      await virtualTryOn.initialize({
        container: mockContainer,
        productId: 123,
        onCapture
      });
      
      // Get the capture method
      const captureMethod = (virtualTryOn as any).capture.bind(virtualTryOn);
      
      // Call capture
      const imageData = captureMethod();
      
      // Check that canvas was set up correctly
      expect(mockCanvas.width).toBe(1280);
      expect(mockCanvas.height).toBe(720);
      
      // Check that drawImage was called
      expect(mockContext.drawImage).toHaveBeenCalledWith(mockVideo, 0, 0);
      
      // Check that toDataURL was called
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg');
      
      // Check that the image data was returned
      expect(imageData).toBe('data:image/jpeg;base64,test-image-data');
      
      // Check that a custom event was dispatched
      expect(mockContainer.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'varai-capture',
          detail: { imageData: 'data:image/jpeg;base64,test-image-data' }
        })
      );
    });
  });
  
  describe('detectFaceShape', () => {
    test('should detect face shape from captured image', async () => {
      const onFaceShapeDetected = jest.fn();
      
      await virtualTryOn.initialize({
        container: mockContainer,
        productId: 123,
        onFaceShapeDetected,
        detectFaceShape: true
      });
      
      // Mock capture method
      (virtualTryOn as any).capture = jest.fn().mockReturnValue('data:image/jpeg;base64,test-image-data');
      
      // Get the detectFaceShape method
      const detectFaceShapeMethod = (virtualTryOn as any).detectFaceShape.bind(virtualTryOn);
      
      // Call detectFaceShape
      await detectFaceShapeMethod();
      
      // Check that capture was called
      expect((virtualTryOn as any).capture).toHaveBeenCalled();
      
      // Check that detectFaceShape API was called
      expect(mockApiClient.detectFaceShape).toHaveBeenCalledWith('data:image/jpeg;base64,test-image-data');
      
      // Check that face shape was set
      expect((virtualTryOn as any).faceShape).toBe('oval');
      
      // Check that onFaceShapeDetected was called
      expect(onFaceShapeDetected).toHaveBeenCalledWith('oval');
      
      // Check that trackEvent was called
      expect(mockApiClient.trackEvent).toHaveBeenCalledWith({
        event_type: 'face_shape_detected',
        product_id: 123,
        face_shape: 'oval'
      });
    });
    
    test('should update UI with face shape compatibility', async () => {
      // Create a mock face shape value element
      const mockFaceShapeValue = document.createElement('span');
      mockFaceShapeValue.className = 'varai-face-shape-value';
      
      // Create a mock compatibility element
      const mockCompatibilityElement = document.createElement('div');
      mockCompatibilityElement.className = 'varai-face-shape-compatibility';
      
      // Add elements to container
      mockContainer.querySelector = jest.fn().mockImplementation((selector) => {
        if (selector === '.varai-face-shape-value') return mockFaceShapeValue;
        if (selector === '.varai-face-shape-compatibility') return mockCompatibilityElement;
        return null;
      });
      
      await virtualTryOn.initialize({
        container: mockContainer,
        productId: 123,
        detectFaceShape: true
      });
      
      // Mock capture method
      (virtualTryOn as any).capture = jest.fn().mockReturnValue('data:image/jpeg;base64,test-image-data');
      
      // Get the detectFaceShape method
      const detectFaceShapeMethod = (virtualTryOn as any).detectFaceShape.bind(virtualTryOn);
      
      // Call detectFaceShape
      await detectFaceShapeMethod();
      
      // Check that face shape value was updated
      expect(mockFaceShapeValue.textContent).toBe('oval');
      
      // Check that compatibility element was updated
      expect(mockCompatibilityElement.innerHTML).toContain('This frame is compatible with your face shape');
    });
  });
  
  describe('saveMeasurements', () => {
    test('should save facial measurements', async () => {
      await virtualTryOn.initialize({
        container: mockContainer,
        productId: 123,
        enableMeasurements: true
      });
      
      // Get the saveMeasurements method
      const saveMeasurementsMethod = (virtualTryOn as any).saveMeasurements.bind(virtualTryOn);
      
      // Call saveMeasurements
      await saveMeasurementsMethod();
      
      // Check that measurements were set
      expect((virtualTryOn as any).measurements).toEqual({
        face_width: 140,
        face_height: 200,
        temple_to_temple: 145,
        pupillary_distance: 62,
        bridge_width: 20
      });
    });
  });
  
  describe('switchCamera', () => {
    test('should switch camera mode', async () => {
      await virtualTryOn.initialize({
        container: mockContainer,
        productId: 123
      });
      
      // Check initial camera mode
      expect((virtualTryOn as any).settings.mode).toBe('front');
      
      // Get the switchCamera method
      const switchCameraMethod = (virtualTryOn as any).switchCamera.bind(virtualTryOn);
      
      // Call switchCamera
      await switchCameraMethod();
      
      // Check that camera mode was switched
      expect((virtualTryOn as any).settings.mode).toBe('rear');
      
      // Check that stream tracks were stopped
      expect(mockStream.getTracks()[0].stop).toHaveBeenCalled();
      
      // Check that getUserMedia was called with new mode
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          video: expect.objectContaining({
            facingMode: 'environment'
          })
        })
      );
    });
  });
  
  describe('cleanup', () => {
    test('should clean up resources', async () => {
      await virtualTryOn.initialize({
        container: mockContainer,
        productId: 123
      });
      
      // Call cleanup
      virtualTryOn.cleanup();
      
      // Check that stream tracks were stopped
      expect(mockStream.getTracks()[0].stop).toHaveBeenCalled();
      
      // Check that video srcObject was cleared
      expect(mockVideo.srcObject).toBeNull();
      
      // Check that container was cleared
      expect(mockContainer.innerHTML).toBe('');
      
      // Check that properties were reset
      expect((virtualTryOn as any).video).toBeNull();
      expect((virtualTryOn as any).canvas).toBeNull();
      expect((virtualTryOn as any).stream).toBeNull();
      expect((virtualTryOn as any).model).toBeNull();
      expect((virtualTryOn as any).faceShape).toBeNull();
      expect((virtualTryOn as any).measurements).toEqual({});
    });
  });
  
  describe('getFaceShape', () => {
    test('should return detected face shape', async () => {
      await virtualTryOn.initialize({
        container: mockContainer,
        productId: 123,
        detectFaceShape: true
      });
      
      // Set face shape
      (virtualTryOn as any).faceShape = 'oval';
      
      // Get face shape
      const faceShape = virtualTryOn.getFaceShape();
      
      // Check that face shape was returned
      expect(faceShape).toBe('oval');
    });
  });
  
  describe('getMeasurements', () => {
    test('should return saved measurements', async () => {
      await virtualTryOn.initialize({
        container: mockContainer,
        productId: 123,
        enableMeasurements: true
      });
      
      // Set measurements
      (virtualTryOn as any).measurements = {
        face_width: 140,
        face_height: 200
      };
      
      // Get measurements
      const measurements = virtualTryOn.getMeasurements();
      
      // Check that measurements were returned
      expect(measurements).toEqual({
        face_width: 140,
        face_height: 200
      });
    });
  });
});