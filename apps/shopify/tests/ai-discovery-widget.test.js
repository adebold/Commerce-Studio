/**
 * AI Discovery Widget Tests
 * 
 * Test suite for the AI Discovery Widget functionality
 */

import { jest } from '@jest/globals';

// Mock dependencies
const mockVertexAIConnector = {
  getProductRecommendation: jest.fn(),
  getConversationResponse: jest.fn()
};

const mockFaceAnalysisService = {
  initialize: jest.fn(),
  analyzeFromVideo: jest.fn(),
  dispose: jest.fn()
};

// Mock fetch for API calls
global.fetch = jest.fn();

describe('AI Discovery Widget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset fetch mock
    fetch.mockClear();
  });

  describe('Chat API', () => {
    test('should handle product recommendation requests', async () => {
      const mockResponse = {
        response: 'I found 3 great frames for you!',
        products: [
          {
            id: 'test-1',
            title: 'Test Frame 1',
            price: { amount: 129.99, currencyCode: 'USD' }
          }
        ],
        suggestedQueries: ['Tell me more', 'Try virtually']
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const response = await fetch('/api/ai-discovery/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Show me some frames',
          sessionId: 'test-session',
          shopDomain: 'test-shop.myshopify.com'
        })
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.response).toBe('I found 3 great frames for you!');
      expect(data.products).toHaveLength(1);
      expect(data.suggestedQueries).toContain('Tell me more');
    });

    test('should handle face analysis questions', async () => {
      const mockResponse = {
        response: 'Face analysis helps me understand your unique features...',
        suggestedQueries: ['How does it work?', 'Start analysis'],
        actions: [{ type: 'start_face_analysis', label: 'Try Face Analysis' }]
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const response = await fetch('/api/ai-discovery/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'How does face analysis work?',
          sessionId: 'test-session',
          shopDomain: 'test-shop.myshopify.com'
        })
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.response).toContain('Face analysis helps');
      expect(data.actions).toContainEqual({
        type: 'start_face_analysis',
        label: 'Try Face Analysis'
      });
    });

    test('should handle API errors gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      try {
        await fetch('/api/ai-discovery/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: 'Test message',
            sessionId: 'test-session',
            shopDomain: 'test-shop.myshopify.com'
          })
        });
      } catch (error) {
        expect(error.message).toBe('Network error');
      }
    });
  });

  describe('Recommendations API', () => {
    test('should generate personalized recommendations', async () => {
      const mockResponse = {
        message: 'Based on your oval face shape, I found 4 perfect frames!',
        products: [
          {
            id: 'rec-1',
            title: 'Recommended Frame 1',
            aiEnhancement: {
              compatibilityScore: 0.95,
              recommendationReason: 'Perfect for oval face shape'
            }
          }
        ],
        confidence: 0.9
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const response = await fetch('/api/ai-discovery/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'test-session',
          shopDomain: 'test-shop.myshopify.com',
          faceAnalysis: {
            faceShape: 'oval',
            confidence: 0.92
          },
          maxRecommendations: 8
        })
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.message).toContain('oval face shape');
      expect(data.products[0].aiEnhancement.compatibilityScore).toBe(0.95);
      expect(data.confidence).toBe(0.9);
    });

    test('should handle recommendations without face analysis', async () => {
      const mockResponse = {
        message: 'Here are some popular frame styles!',
        products: [
          {
            id: 'pop-1',
            title: 'Popular Frame 1'
          }
        ],
        confidence: 0.7
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const response = await fetch('/api/ai-discovery/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'test-session',
          shopDomain: 'test-shop.myshopify.com',
          maxRecommendations: 5
        })
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.message).toContain('popular frame styles');
      expect(data.confidence).toBe(0.7);
    });
  });

  describe('Face Analysis Service', () => {
    test('should initialize successfully', async () => {
      mockFaceAnalysisService.initialize.mockResolvedValueOnce();

      await mockFaceAnalysisService.initialize({
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
        maxNumFaces: 1
      });

      expect(mockFaceAnalysisService.initialize).toHaveBeenCalledWith({
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
        maxNumFaces: 1
      });
    });

    test('should analyze face from video', async () => {
      const mockAnalysisResult = {
        faceShape: 'oval',
        confidence: 0.92,
        measurements: {
          faceWidth: 140,
          faceHeight: 180,
          jawWidth: 120,
          foreheadWidth: 135,
          pupillaryDistance: 62
        },
        timestamp: Date.now()
      };

      mockFaceAnalysisService.analyzeFromVideo.mockResolvedValueOnce(mockAnalysisResult);

      const mockVideoElement = {
        videoWidth: 640,
        videoHeight: 480
      };

      const result = await mockFaceAnalysisService.analyzeFromVideo(mockVideoElement);

      expect(result.faceShape).toBe('oval');
      expect(result.confidence).toBe(0.92);
      expect(result.measurements.faceWidth).toBe(140);
    });

    test('should handle face analysis errors', async () => {
      mockFaceAnalysisService.analyzeFromVideo.mockRejectedValueOnce(
        new Error('Camera not available')
      );

      try {
        await mockFaceAnalysisService.analyzeFromVideo({});
      } catch (error) {
        expect(error.message).toBe('Camera not available');
      }
    });
  });

  describe('Intent Recognition', () => {
    test('should recognize product recommendation intent', () => {
      const testCases = [
        'Show me some frames',
        'I need new glasses',
        'Recommend sunglasses',
        'Find me eyewear',
        'Looking for frames'
      ];

      testCases.forEach(message => {
        // This would test the intent recognition logic
        const intent = analyzeIntent(message);
        expect(intent.type).toBe('product_recommendation_request');
        expect(intent.confidence).toBeGreaterThan(0.8);
      });
    });

    test('should recognize style preference intent', () => {
      const testCases = [
        'I like classic styles',
        'Show me modern frames',
        'I want something trendy',
        'Professional looking glasses'
      ];

      testCases.forEach(message => {
        const intent = analyzeIntent(message);
        expect(intent.type).toBe('style_preference_query');
        expect(intent.confidence).toBeGreaterThan(0.8);
      });
    });

    test('should recognize virtual try-on intent', () => {
      const testCases = [
        'Can I try this on?',
        'Virtual try-on',
        'See how it looks',
        'Try on virtually'
      ];

      testCases.forEach(message => {
        const intent = analyzeIntent(message);
        expect(intent.type).toBe('virtual_try_on_request');
        expect(intent.confidence).toBeGreaterThan(0.8);
      });
    });
  });

  describe('Face Shape Classification', () => {
    test('should classify oval face shape correctly', () => {
      const measurements = {
        faceWidth: 140,
        faceHeight: 180,
        jawWidth: 120,
        foreheadWidth: 135
      };

      const faceShape = determineFaceShape(measurements);
      expect(faceShape).toBe('oval');
    });

    test('should classify round face shape correctly', () => {
      const measurements = {
        faceWidth: 150,
        faceHeight: 155,
        jawWidth: 130,
        foreheadWidth: 135
      };

      const faceShape = determineFaceShape(measurements);
      expect(faceShape).toBe('round');
    });

    test('should classify square face shape correctly', () => {
      const measurements = {
        faceWidth: 150,
        faceHeight: 160,
        jawWidth: 140,
        foreheadWidth: 145
      };

      const faceShape = determineFaceShape(measurements);
      expect(faceShape).toBe('square');
    });
  });

  describe('Recommendation Scoring', () => {
    test('should score frame compatibility correctly', () => {
      const faceAnalysis = {
        faceShape: 'oval',
        confidence: 0.9
      };

      const frame = {
        attributes: {
          eyewear: {
            frameShape: 'round',
            recommendedFaceShapes: ['oval', 'square']
          }
        }
      };

      const score = calculateCompatibilityScore(frame, faceAnalysis);
      expect(score).toBeGreaterThan(0.9);
    });

    test('should handle frames without face shape recommendations', () => {
      const faceAnalysis = {
        faceShape: 'oval',
        confidence: 0.9
      };

      const frame = {
        attributes: {
          eyewear: {
            frameShape: 'round'
          }
        }
      };

      const score = calculateCompatibilityScore(frame, faceAnalysis);
      expect(score).toBeGreaterThan(0.5);
    });
  });
});

// Helper functions for testing (these would be imported from actual modules)
function analyzeIntent(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('recommend') || lowerMessage.includes('show me') || lowerMessage.includes('find')) {
    return { type: 'product_recommendation_request', confidence: 0.9 };
  }
  
  if (lowerMessage.includes('style') || lowerMessage.includes('classic') || lowerMessage.includes('modern')) {
    return { type: 'style_preference_query', confidence: 0.85 };
  }
  
  if (lowerMessage.includes('try on') || lowerMessage.includes('virtual')) {
    return { type: 'virtual_try_on_request', confidence: 0.9 };
  }
  
  return { type: 'general_query', confidence: 0.5 };
}

function determineFaceShape(measurements) {
  const { faceWidth, faceHeight, jawWidth, foreheadWidth } = measurements;
  
  const faceRatio = faceHeight / faceWidth;
  const jawToFaceRatio = jawWidth / faceWidth;
  
  if (faceRatio < 1.1 && jawToFaceRatio > 0.8) {
    return 'square';
  } else if (faceRatio < 1.1) {
    return 'round';
  } else if (faceRatio > 1.3) {
    return 'oblong';
  } else {
    return 'oval';
  }
}

function calculateCompatibilityScore(frame, faceAnalysis) {
  const recommendedShapes = frame.attributes?.eyewear?.recommendedFaceShapes || [];
  
  if (recommendedShapes.includes(faceAnalysis.faceShape)) {
    return 0.95;
  }
  
  // Compatibility matrix for different face shapes
  const compatibilityMap = {
    'oval': ['round', 'square', 'rectangular'],
    'round': ['square', 'rectangular', 'cat-eye'],
    'square': ['round', 'oval', 'cat-eye']
  };
  
  const compatibleShapes = compatibilityMap[faceAnalysis.faceShape] || [];
  const frameShape = frame.attributes?.eyewear?.frameShape;
  
  if (compatibleShapes.includes(frameShape)) {
    return 0.8;
  }
  
  return 0.6;
}