import { Analytics } from '../../lib/analytics';
import { ApiClient } from '../../lib/api-client';
import { FaceShape } from '../../lib/types';

// Mock ApiClient
jest.mock('../../lib/api-client');

describe('Analytics', () => {
  let analytics: Analytics;
  let mockApiClient: jest.Mocked<ApiClient>;
  
  beforeEach(() => {
    // Create a mock ApiClient
    mockApiClient = new ApiClient({
      clientId: 'test-client-id',
      accessToken: 'test-access-token',
      storeHash: 'test-store-hash',
      varaiApiKey: 'process.env.APIKEY_2517'
    }) as jest.Mocked<ApiClient>;
    
    // Mock trackEvent method
    mockApiClient.trackEvent = jest.fn().mockResolvedValue(undefined);
    mockApiClient.getAnalyticsDashboard = jest.fn().mockResolvedValue({
      metrics: {
        views: 1000,
        try_ons: 500
      }
    });
    
    // Create Analytics instance
    analytics = new Analytics(mockApiClient, {
      enabled: true,
      ga4MeasurementId: 'G-TEST123',
      trackProductViews: true,
      trackTryOns: true,
      trackRecommendations: true,
      trackFaceShapeDetection: true,
      trackStyleScoreViews: true,
      trackProductComparisons: true
    });
    
    // Mock document methods
    document.querySelector = jest.fn();
    document.querySelectorAll = jest.fn().mockReturnValue([]);
    document.addEventListener = jest.fn();
    
    // Mock window.gtag
    (window as any).gtag = jest.fn();
    
    // Mock document.createElement and appendChild
    const mockScript = {
      async: false,
      src: '',
      onload: null as (() => void) | null
    };
    
    document.createElement = jest.fn().mockImplementation((tag) => {
      if (tag === 'script') {
        return mockScript;
      }
      return {};
    });
    
    document.head.appendChild = jest.fn().mockImplementation((element) => {
      if (element === mockScript && mockScript.onload) {
        // Simulate script load
        setTimeout(() => mockScript.onload!(), 0);
      }
      return element;
    });
  });
  
  describe('initialize', () => {
    test('should initialize analytics and load GA4 script', async () => {
      await analytics.initialize();
      
      // Check that GA4 script was loaded
      expect(document.createElement).toHaveBeenCalledWith('script');
      expect(document.head.appendChild).toHaveBeenCalled();
      
      // Check that gtag was initialized
      expect(window.dataLayer).toBeDefined();
      expect((window as any).gtag).toBeDefined();
    });
    
    test('should not initialize if disabled', async () => {
      analytics = new Analytics(mockApiClient, {
        enabled: false
      });
      
      await analytics.initialize();
      
      // Check that GA4 script was not loaded
      expect(document.createElement).not.toHaveBeenCalledWith('script');
    });
  });
  
  describe('trackEvent', () => {
    test('should track event in VARAi and GA4', async () => {
      await analytics.trackEvent({
        event_type: 'view_item',
        product_id: 123
      });
      
      // Check that event was tracked in VARAi
      expect(mockApiClient.trackEvent).toHaveBeenCalledWith({
        event_type: 'view_item',
        product_id: 123
      });
      
      // Check that event was tracked in GA4
      expect((window as any).gtag).toHaveBeenCalledWith(
        'event',
        'view_item',
        expect.objectContaining({
          product_id: 123
        })
      );
    });
    
    test('should include additional data in GA4 event', async () => {
      await analytics.trackEvent({
        event_type: 'face_shape_detected',
        product_id: 123,
        face_shape: 'oval' as FaceShape,
        custom_data: {
          test_key: 'process.env.ANALYTICS_SECRET_1'
        }
      });
      
      // Check that event was tracked in GA4 with additional data
      expect((window as any).gtag).toHaveBeenCalledWith(
        'event',
        'face_shape_detected',
        expect.objectContaining({
          product_id: 123,
          face_shape: 'oval',
          test_key: 'process.env.ANALYTICS_SECRET_1'
        })
      );
    });
    
    test('should not track if disabled', async () => {
      analytics = new Analytics(mockApiClient, {
        enabled: false
      });
      
      await analytics.trackEvent({
        event_type: 'view_item',
        product_id: 123
      });
      
      // Check that event was not tracked
      expect(mockApiClient.trackEvent).not.toHaveBeenCalled();
      expect((window as any).gtag).not.toHaveBeenCalled();
    });
  });
  
  describe('initializeProductViewTracking', () => {
    test('should track product view when product element exists', async () => {
      // Mock document.querySelector to return a product element
      (document.querySelector as jest.Mock).mockReturnValue({
        getAttribute: jest.fn().mockReturnValue('123')
      });
      
      // Call initialize to set up event listeners
      await analytics.initialize();
      
      // Check that trackEvent was called with the right event
      expect(mockApiClient.trackEvent).toHaveBeenCalledWith({
        event_type: 'view_item',
        product_id: 123
      });
    });
  });
  
  describe('initializeTryOnTracking', () => {
    test('should set up event listener for try-on button clicks', async () => {
      // Call initialize to set up event listeners
      await analytics.initialize();
      
      // Check that document.addEventListener was called
      expect(document.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
      
      // Simulate a click on a try-on button
      const clickHandler = (document.addEventListener as jest.Mock).mock.calls.find(
        call => call[0] === 'click'
      )[1];
      
      // Create a mock event with a try-on button
      const mockEvent = {
        target: {
          closest: jest.fn().mockImplementation((selector) => {
            if (selector === '.varai-try-on-button') {
              return {
                closest: jest.fn().mockImplementation((selector) => {
                  if (selector === '[data-product-id]') {
                    return {
                      getAttribute: jest.fn().mockReturnValue('123')
                    };
                  }
                  return null;
                })
              };
            }
            return null;
          })
        }
      };
      
      // Call the click handler
      clickHandler(mockEvent);
      
      // Check that trackEvent was called with the right event
      expect(mockApiClient.trackEvent).toHaveBeenCalledWith({
        event_type: 'try_on',
        product_id: 123
      });
    });
  });
  
  describe('initializeRecommendationTracking', () => {
    test('should track recommendation impressions', async () => {
      // Mock document.querySelectorAll to return recommendation elements
      (document.querySelectorAll as jest.Mock).mockReturnValue([
        {
          getAttribute: jest.fn().mockImplementation((attr) => {
            if (attr === 'data-product-id') return '123';
            if (attr === 'data-recommendation-type') return 'similar';
            if (attr === 'data-recommendation-score') return '0.95';
            return null;
          })
        }
      ]);
      
      // Call initialize to set up event listeners
      await analytics.initialize();
      
      // Check that trackEvent was called with the right event
      expect(mockApiClient.trackEvent).toHaveBeenCalledWith({
        event_type: 'view_recommendation',
        product_id: 123,
        recommendation_data: {
          type: 'similar',
          score: 0.95
        }
      });
    });
  });
  
  describe('initializeFaceShapeTracking', () => {
    test('should track face shape detection events', async () => {
      // Call initialize to set up event listeners
      await analytics.initialize();
      
      // Simulate a face shape detection event
      const event = new CustomEvent('varai-face-shape-detected', {
        detail: {
          faceShape: 'oval',
          productId: 123
        }
      });
      
      document.dispatchEvent(event);
      
      // Check that trackEvent was called with the right event
      expect(mockApiClient.trackEvent).toHaveBeenCalledWith({
        event_type: 'face_shape_detected',
        product_id: 123,
        face_shape: 'oval'
      });
    });
  });
  
  describe('getDashboardData', () => {
    test('should get analytics dashboard data', async () => {
      const dashboardData = await analytics.getDashboardData();
      
      // Check that getAnalyticsDashboard was called
      expect(mockApiClient.getAnalyticsDashboard).toHaveBeenCalled();
      
      // Check that the dashboard data was returned
      expect(dashboardData).toEqual({
        metrics: {
          views: 1000,
          try_ons: 500
        }
      });
    });
    
    test('should handle errors', async () => {
      // Mock getAnalyticsDashboard to throw an error
      mockApiClient.getAnalyticsDashboard = jest.fn().mockRejectedValue(new Error('API error'));
      
      // Mock console.error to avoid test output
      console.error = jest.fn();
      
      const dashboardData = await analytics.getDashboardData();
      
      // Check that getAnalyticsDashboard was called
      expect(mockApiClient.getAnalyticsDashboard).toHaveBeenCalled();
      
      // Check that null was returned
      expect(dashboardData).toBeNull();
      
      // Check that the error was logged
      expect(console.error).toHaveBeenCalledWith(
        'Failed to get analytics dashboard data:',
        expect.any(Error)
      );
    });
  });
});