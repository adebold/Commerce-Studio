import { 
  merchantOnboardingAnalytics, 
  OnboardingStep, 
  DropOffReason,
  fetchOnboardingMetrics
} from '../merchant-onboarding-analytics';

// Mock fetch for testing fetchOnboardingMetrics
global.fetch = jest.fn();

describe('Merchant Onboarding Analytics', () => {
  // Spy on console.log to verify tracking calls
  const consoleLogSpy = jest.spyOn(console, 'log');
  // Spy on console.error to verify error logging
  const consoleErrorSpy = jest.spyOn(console, 'error');
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset fetch mock
    (global.fetch as jest.Mock).mockReset();
  });
  
  describe('MerchantOnboardingAnalytics', () => {
    it('should initialize with a session ID', () => {
      // Access private sessionId via type assertion with a specific interface
      interface AnalyticsWithPrivateFields {
        sessionId: string;
      }
      const sessionId = (merchantOnboardingAnalytics as unknown as AnalyticsWithPrivateFields).sessionId;
      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe('string');
      expect(sessionId.length).toBeGreaterThan(0);
    });
    
    it('should track onboarding start event on init', () => {
      merchantOnboardingAnalytics.init('merchant-123');
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Tracking merchant onboarding event:',
        expect.objectContaining({
          merchantId: 'merchant-123',
          step: OnboardingStep.START,
          sessionId: expect.any(String)
        })
      );
    });
    
    it('should track platform selection', () => {
      merchantOnboardingAnalytics.setPlatform('shopify');
      merchantOnboardingAnalytics.trackEvent(OnboardingStep.PLATFORM_SELECTION, 'completed');
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Tracking merchant onboarding event:',
        expect.objectContaining({
          platform: 'shopify',
          step: OnboardingStep.PLATFORM_SELECTION,
          completionStatus: 'completed'
        })
      );
    });
    
    it('should track time spent on steps', () => {
      // Mock Date.now to control timestamps
      const originalDateNow = Date.now;
      const mockDateNow = jest.fn();
      
      try {
        // First call to start the step
        mockDateNow.mockReturnValueOnce(1000);
        Date.now = mockDateNow;
        merchantOnboardingAnalytics.trackEvent(OnboardingStep.ACCOUNT_SETUP);
        
        // Second call to complete the step (500ms later)
        mockDateNow.mockReturnValueOnce(1500);
        Date.now = mockDateNow;
        merchantOnboardingAnalytics.trackEvent(OnboardingStep.ACCOUNT_SETUP, 'completed');
        
        expect(consoleLogSpy).toHaveBeenLastCalledWith(
          'Tracking merchant onboarding event:',
          expect.objectContaining({
            step: OnboardingStep.ACCOUNT_SETUP,
            completionStatus: 'completed',
            timeSpent: 500 // 1500 - 1000 = 500ms
          })
        );
      } finally {
        // Restore original Date.now
        Date.now = originalDateNow;
      }
    });
    
    it('should track drop-off events', () => {
      merchantOnboardingAnalytics.trackDropOff(
        OnboardingStep.INTEGRATION_SETUP,
        DropOffReason.COMPLEXITY,
        'Too many configuration options'
      );
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Tracking merchant onboarding event:',
        expect.objectContaining({
          step: OnboardingStep.INTEGRATION_SETUP,
          completionStatus: 'abandoned',
          metadata: {
            dropOffReason: DropOffReason.COMPLEXITY,
            dropOffDetails: 'Too many configuration options'
          }
        })
      );
    });
    
    it('should track error events', () => {
      merchantOnboardingAnalytics.trackError(
        OnboardingStep.STORE_CONFIGURATION,
        'API connection failed',
        { statusCode: 500 }
      );
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Tracking merchant onboarding event:',
        expect.objectContaining({
          step: OnboardingStep.STORE_CONFIGURATION,
          completionStatus: 'error',
          errorDetails: 'API connection failed',
          metadata: { statusCode: 500 }
        })
      );
    });
    
    it('should track feedback', () => {
      merchantOnboardingAnalytics.trackFeedback({
        rating: 4,
        comments: 'Good experience overall',
        improvementSuggestions: 'Could use more help text',
        wouldRecommend: true
      });
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Tracking merchant onboarding feedback:',
        expect.objectContaining({
          rating: 4,
          comments: 'Good experience overall',
          improvementSuggestions: 'Could use more help text',
          wouldRecommend: true,
          sessionId: expect.any(String),
          timestamp: expect.any(Number)
        })
      );
    });
    
    it('should track onboarding completion with total time', () => {
      // Mock Date.now to control timestamps
      const originalDateNow = Date.now;
      const mockDateNow = jest.fn();
      
      try {
        // Start time
        mockDateNow.mockReturnValueOnce(1000);
        Date.now = mockDateNow;
        merchantOnboardingAnalytics.trackEvent(OnboardingStep.START);
        
        // Completion time (60 seconds later)
        mockDateNow.mockReturnValueOnce(61000);
        Date.now = mockDateNow;
        merchantOnboardingAnalytics.trackEvent(OnboardingStep.COMPLETE);
        
        expect(consoleLogSpy).toHaveBeenCalledWith(
          'Tracking merchant onboarding completion:',
          expect.objectContaining({
            totalTimeMs: 60000, // 61000 - 1000 = 60000ms
            stepTimes: expect.objectContaining({
              [OnboardingStep.START]: 1000,
              [OnboardingStep.COMPLETE]: 61000
            })
          })
        );
      } finally {
        // Restore original Date.now
        Date.now = originalDateNow;
      }
    });
  });
  
  describe('fetchOnboardingMetrics', () => {
    it('should fetch metrics from the API', async () => {
      // Mock successful response
      const mockResponse = {
        startCount: 100,
        completionCount: 75,
        completionRate: 0.75,
        averageTimeToComplete: 15, // minutes
        stepCompletionRates: {
          [OnboardingStep.START]: 1.0,
          [OnboardingStep.PLATFORM_SELECTION]: 0.95,
          [OnboardingStep.ACCOUNT_SETUP]: 0.9,
          [OnboardingStep.STORE_CONFIGURATION]: 0.85,
          [OnboardingStep.INTEGRATION_SETUP]: 0.8,
          [OnboardingStep.FINAL_VERIFICATION]: 0.78,
          [OnboardingStep.COMPLETE]: 0.75,
          [OnboardingStep.APP_INSTALLATION]: 0.7,
          [OnboardingStep.PRODUCT_CONFIGURATION]: 0.65,
          [OnboardingStep.WIDGET_PLACEMENT]: 0.6,
          [OnboardingStep.FIRST_TRY_ON]: 0.5,
          [OnboardingStep.FIRST_RECOMMENDATION]: 0.45
        },
        dropOffPoints: {
          [OnboardingStep.PLATFORM_SELECTION]: 5,
          [OnboardingStep.ACCOUNT_SETUP]: 5,
          [OnboardingStep.STORE_CONFIGURATION]: 5,
          [OnboardingStep.INTEGRATION_SETUP]: 5,
          [OnboardingStep.FINAL_VERIFICATION]: 2,
          [OnboardingStep.APP_INSTALLATION]: 5,
          [OnboardingStep.PRODUCT_CONFIGURATION]: 5,
          [OnboardingStep.WIDGET_PLACEMENT]: 5,
          [OnboardingStep.FIRST_TRY_ON]: 10,
          [OnboardingStep.FIRST_RECOMMENDATION]: 5
        },
        platformDistribution: {
          shopify: 40,
          magento: 20,
          woocommerce: 25,
          bigcommerce: 10,
          custom: 5
        },
        feedbackScore: 4.2
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });
      
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-04-30');
      const result = await fetchOnboardingMetrics(startDate, endDate);
      
      // Verify fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/analytics/merchant-onboarding',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          })
        }
      );
      
      // Verify result matches mock response
      expect(result).toEqual(mockResponse);
    });
    
    it('should handle API errors', async () => {
      // Mock error response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error'
      });
      
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-04-30');
      
      // Expect the function to throw an error
      await expect(fetchOnboardingMetrics(startDate, endDate)).rejects.toThrow(
        'Failed to fetch onboarding metrics: Internal Server Error'
      );
    });
    
    it('should handle network errors', async () => {
      // Mock network error
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-04-30');
      
      // Make sure console.error is properly mocked
      consoleErrorSpy.mockClear();
      
      // Expect the function to throw an error
      await expect(fetchOnboardingMetrics(startDate, endDate)).rejects.toThrow('Network error');
      
      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching onboarding metrics:',
        expect.any(Error)
      );
    });
  });
});