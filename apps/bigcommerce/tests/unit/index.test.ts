import { initialize, loadScript, addRecommendations, addTryOnButton, addProductComparison, addStyleScore, addFaceShapeCompatibility, version } from '../../lib/index';
import { ApiClient } from '../../lib/api-client';
import { Analytics } from '../../lib/analytics';
import { VirtualTryOn } from '../../lib/virtual-try-on';

// Mock dependencies
jest.mock('../../lib/api-client');
jest.mock('../../lib/analytics');
jest.mock('../../lib/virtual-try-on');

describe('Public API', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock document.createElement
    document.createElement = jest.fn().mockImplementation((tag) => {
      if (tag === 'script') {
        return {
          async: false,
          src: '',
          onload: null,
          onerror: null
        };
      }
      if (tag === 'button') {
        return {
          className: '',
          setAttribute: jest.fn(),
          textContent: ''
        };
      }
      return document.createElement(tag);
    });
    
    // Mock document.head.appendChild
    document.head.appendChild = jest.fn().mockImplementation((element) => {
      if (element.onload) {
        // Simulate script load
        setTimeout(() => element.onload(), 0);
      }
      return element;
    });
  });
  
  describe('initialize', () => {
    test('should initialize ApiClient, Analytics, and return API object', () => {
      const config = {
        clientId: 'test-client-id',
        accessToken: 'test-access-token',
        storeHash: 'test-store-hash',
        varaiApiKey: 'process.env.APIKEY_2521',
        ga4MeasurementId: 'G-TEST123',
        trackFaceShapeDetection: true,
        trackStyleScoreViews: true,
        trackProductComparisons: true
      };
      
      const api = initialize(config);
      
      // Check that ApiClient was initialized with the right config
      expect(ApiClient).toHaveBeenCalledWith(config);
      
      // Check that Analytics was initialized with the right config
      expect(Analytics).toHaveBeenCalledWith(
        expect.any(ApiClient),
        expect.objectContaining({
          enabled: true,
          ga4MeasurementId: 'G-TEST123',
          trackProductViews: true,
          trackTryOns: true,
          trackRecommendations: true,
          trackFaceShapeDetection: true,
          trackStyleScoreViews: true,
          trackProductComparisons: true
        })
      );
      
      // Check that the API object has the right properties
      expect(api).toHaveProperty('apiClient');
      expect(api).toHaveProperty('analytics');
      expect(api).toHaveProperty('VirtualTryOn');
    });
    
    test('should initialize VirtualTryOn when called', () => {
      const config = {
        clientId: 'test-client-id',
        accessToken: 'test-access-token',
        storeHash: 'test-store-hash',
        varaiApiKey: 'process.env.APIKEY_2521'
      };
      
      const api = initialize(config);
      
      // Create a mock container
      const container = document.createElement('div');
      
      // Call VirtualTryOn
      api.VirtualTryOn({
        container,
        productId: 123,
        onSuccess: jest.fn(),
        onError: jest.fn(),
        onCapture: jest.fn(),
        onFaceShapeDetected: jest.fn(),
        detectFaceShape: true,
        enableMeasurements: true
      });
      
      // Check that VirtualTryOn was initialized
      expect(VirtualTryOn.prototype.initialize).toHaveBeenCalledWith({
        container,
        productId: 123,
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
        onCapture: expect.any(Function),
        onFaceShapeDetected: expect.any(Function),
        detectFaceShape: true,
        enableMeasurements: true
      });
    });
  });
  
  describe('loadScript', () => {
    test('should load script and resolve when loaded', async () => {
      const promise = loadScript('test-store-hash');
      
      // Check that script was created
      expect(document.createElement).toHaveBeenCalledWith('script');
      
      // Check that script was configured correctly
      const script = (document.head.appendChild as jest.Mock).mock.calls[0][0];
      expect(script.async).toBe(true);
      expect(script.src).toBe('https://app.varai.ai/bigcommerce/assets/app.js?store=test-store-hash');
      
      // Check that script was added to head
      expect(document.head.appendChild).toHaveBeenCalledWith(script);
      
      // Wait for promise to resolve
      await promise;
    });
    
    test('should reject when script fails to load', async () => {
      // Mock document.head.appendChild to trigger onerror
      document.head.appendChild = jest.fn().mockImplementation((element) => {
        if (element.onerror) {
          // Simulate script error
          setTimeout(() => element.onerror(), 0);
        }
        return element;
      });
      
      // Call loadScript
      const promise = loadScript('test-store-hash');
      
      // Check that promise rejects
      await expect(promise).rejects.toThrow('Failed to load VARAi script');
    });
  });
  
  describe('addRecommendations', () => {
    test('should add recommendations container with data attributes', () => {
      const container = document.createElement('div');
      container.setAttribute = jest.fn();
      
      addRecommendations({
        container,
        productId: 123,
        limit: 4,
        type: 'similar',
        faceShape: 'oval',
        stylePreference: ['modern', 'sleek']
      });
      
      // Check that data attributes were set
      expect(container.setAttribute).toHaveBeenCalledWith('data-varai-recommendations', '');
      expect(container.setAttribute).toHaveBeenCalledWith('data-product-id', '123');
      expect(container.setAttribute).toHaveBeenCalledWith('data-limit', '4');
      expect(container.setAttribute).toHaveBeenCalledWith('data-type', 'similar');
      expect(container.setAttribute).toHaveBeenCalledWith('data-face-shape', 'oval');
      expect(container.setAttribute).toHaveBeenCalledWith('data-style-preference', 'modern,sleek');
      
      // Check that loading state was added
      expect(container.innerHTML).toContain('Loading recommendations');
    });
  });
  
  describe('addTryOnButton', () => {
    test('should add try-on button with data attributes', () => {
      const container = document.createElement('div');
      container.appendChild = jest.fn();
      
      addTryOnButton({
        container,
        productId: 123,
        buttonText: 'Try On Now',
        detectFaceShape: true
      });
      
      // Check that button was created
      expect(document.createElement).toHaveBeenCalledWith('button');
      
      // Get the button
      const button = (container.appendChild as jest.Mock).mock.calls[0][0];
      
      // Check that button was configured correctly
      expect(button.className).toBe('varai-try-on-button');
      expect(button.setAttribute).toHaveBeenCalledWith('data-product-id', '123');
      expect(button.setAttribute).toHaveBeenCalledWith('data-detect-face-shape', 'true');
      expect(button.textContent).toBe('Try On Now');
      
      // Check that button was added to container
      expect(container.appendChild).toHaveBeenCalledWith(button);
    });
  });
  
  describe('addProductComparison', () => {
    test('should add product comparison container with data attributes', () => {
      const container = document.createElement('div');
      container.setAttribute = jest.fn();
      
      addProductComparison({
        container,
        productIds: [123, 456, 789],
        compareAttributes: ['style', 'measurements', 'price'],
        title: 'Compare Frames'
      });
      
      // Check that data attributes were set
      expect(container.setAttribute).toHaveBeenCalledWith('data-varai-product-comparison', '');
      expect(container.setAttribute).toHaveBeenCalledWith('data-product-ids', '123,456,789');
      expect(container.setAttribute).toHaveBeenCalledWith('data-compare-attributes', 'style,measurements,price');
      
      // Check that loading state was added
      expect(container.innerHTML).toContain('Compare Frames');
      expect(container.innerHTML).toContain('Loading product comparison');
    });
  });
  
  describe('addStyleScore', () => {
    test('should add style score container with data attributes', () => {
      const container = document.createElement('div');
      container.setAttribute = jest.fn();
      
      addStyleScore({
        container,
        productId: 123,
        showDetails: true
      });
      
      // Check that data attributes were set
      expect(container.setAttribute).toHaveBeenCalledWith('data-varai-style-score', '');
      expect(container.setAttribute).toHaveBeenCalledWith('data-product-id', '123');
      expect(container.setAttribute).toHaveBeenCalledWith('data-show-details', 'true');
      
      // Check that loading state was added
      expect(container.innerHTML).toContain('Loading style score');
    });
  });
  
  describe('addFaceShapeCompatibility', () => {
    test('should add face shape compatibility container with data attributes', () => {
      const container = document.createElement('div');
      container.setAttribute = jest.fn();
      
      addFaceShapeCompatibility({
        container,
        productId: 123,
        faceShape: 'oval'
      });
      
      // Check that data attributes were set
      expect(container.setAttribute).toHaveBeenCalledWith('data-varai-face-shape-compatibility', '');
      expect(container.setAttribute).toHaveBeenCalledWith('data-product-id', '123');
      expect(container.setAttribute).toHaveBeenCalledWith('data-face-shape', 'oval');
      
      // Check that loading state was added
      expect(container.innerHTML).toContain('Loading face shape compatibility');
    });
  });
  
  describe('version', () => {
    test('should export version', () => {
      expect(version).toBe('1.0.0');
    });
  });
});