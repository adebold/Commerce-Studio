import { ApiClient } from '../../lib/api-client';
import { FaceShape } from '../../lib/types';

// Mock fetch
global.fetch = jest.fn();

describe('ApiClient', () => {
  let apiClient: ApiClient;
  
  beforeEach(() => {
    apiClient = new ApiClient({
      clientId: 'test-client-id',
      accessToken: 'test-access-token',
      storeHash: 'test-store-hash',
      varaiApiKey: 'process.env.APIKEY_2519'
    });
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock BigCommerce API
    (apiClient as any).bc = {
      get: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      config: {
        storeHash: 'test-store-hash'
      }
    };
  });
  
  describe('getProduct', () => {
    test('should return product data', async () => {
      // Mock BigCommerce API responses
      (apiClient as any).bc.get.mockImplementation((path: string) => {
        if (path === '/catalog/products/123') {
          return Promise.resolve({
            id: 123,
            name: 'Test Product',
            sku: 'TEST-123',
            price: 99.99,
            brand_id: 456,
            images: [
              {
                id: 789,
                url_standard: 'https://example.com/image.jpg',
                url_thumbnail: 'https://example.com/image-thumb.jpg',
                url_zoom: 'https://example.com/image-zoom.jpg',
                is_thumbnail: true,
                sort_order: 1,
                description: 'Test Image'
              }
            ]
          });
        } else if (path === '/catalog/products/123/custom-fields') {
          return Promise.resolve([
            {
              name: 'varai_style_tags',
              value: 'modern,sleek'
            },
            {
              name: 'varai_face_shape_compatibility',
              value: 'oval,round'
            }
          ]);
        } else if (path === '/catalog/brands/456') {
          return Promise.resolve({
            name: 'Test Brand'
          });
        }
        return Promise.reject(new Error('Unexpected path'));
      });
      
      const product = await apiClient.getProduct(123);
      
      expect(product).toEqual({
        id: 123,
        name: 'Test Product',
        sku: 'TEST-123',
        price: 99.99,
        brand: 'Test Brand',
        images: [
          {
            id: 789,
            url_standard: 'https://example.com/image.jpg',
            url_thumbnail: 'https://example.com/image-thumb.jpg',
            url_zoom: 'https://example.com/image-zoom.jpg',
            is_thumbnail: true,
            sort_order: 1,
            description: 'Test Image'
          }
        ],
        customFields: {
          varai_style_tags: 'modern,sleek',
          varai_face_shape_compatibility: 'oval,round'
        }
      });
    });
  });
  
  describe('updateProductCustomFields', () => {
    test('should delete existing fields and create new ones', async () => {
      // Mock BigCommerce API responses
      (apiClient as any).bc.get.mockResolvedValue([
        {
          id: 1,
          name: 'varai_style_tags',
          value: 'old-tag'
        },
        {
          id: 2,
          name: 'other_field',
          value: 'other-value'
        }
      ]);
      
      await apiClient.updateProductCustomFields(123, {
        style_tags: 'modern,sleek',
        face_shape_compatibility: 'oval,round'
      });
      
      // Should delete existing VARAi fields
      expect((apiClient as any).bc.delete).toHaveBeenCalledWith('/catalog/products/123/custom-fields/1');
      
      // Should not delete non-VARAi fields
      expect((apiClient as any).bc.delete).not.toHaveBeenCalledWith('/catalog/products/123/custom-fields/2');
      
      // Should create new fields
      expect((apiClient as any).bc.create).toHaveBeenCalledWith('/catalog/products/123/custom-fields', {
        name: 'varai_style_tags',
        value: 'modern,sleek'
      });
      
      expect((apiClient as any).bc.create).toHaveBeenCalledWith('/catalog/products/123/custom-fields', {
        name: 'varai_face_shape_compatibility',
        value: 'oval,round'
      });
    });
  });
  
  describe('getRecommendations', () => {
    test('should return recommended products', async () => {
      // Mock getProduct
      jest.spyOn(apiClient, 'getProduct').mockImplementation((id: number) => {
        if (id === 123) {
          return Promise.resolve({
            id: 123,
            name: 'Test Product',
            sku: 'TEST-123',
            price: 99.99,
            brand: 'Test Brand',
            images: [],
            customFields: {
              varai_style_tags: 'modern,sleek',
              varai_face_shape_compatibility: 'oval,round'
            }
          });
        } else if (id === 456) {
          return Promise.resolve({
            id: 456,
            name: 'Recommended Product',
            sku: 'REC-456',
            price: 129.99,
            brand: 'Test Brand',
            images: [],
            customFields: {}
          });
        }
        return Promise.reject(new Error('Unexpected product ID'));
      });
      
      // Mock fetch
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          recommendations: [
            {
              product_id: 456,
              score: 0.95,
              reasoning: 'Similar style'
            }
          ]
        })
      });
      
      const recommendations = await apiClient.getRecommendations(123, {
        limit: 1,
        type: 'similar'
      });
      
      expect(recommendations).toEqual([
        {
          id: 456,
          name: 'Recommended Product',
          sku: 'REC-456',
          price: 129.99,
          brand: 'Test Brand',
          images: [],
          customFields: {}
        }
      ]);
      
      // Check that fetch was called with the right arguments
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/recommendations'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer process.env.APIKEY_2519',
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('"product":{"id":123,"name":"Test Product","brand":"Test Brand","style":"modern,sleek","price":99.99,"face_shape_compatibility":"oval,round"}')
        })
      );
    });
  });
  
  describe('getFaceShapeRecommendations', () => {
    test('should return face shape recommendations', async () => {
      // Mock getProduct
      jest.spyOn(apiClient, 'getProduct').mockImplementation((id: number) => {
        if (id === 456) {
          return Promise.resolve({
            id: 456,
            name: 'Recommended Product',
            sku: 'REC-456',
            price: 129.99,
            brand: 'Test Brand',
            images: [],
            customFields: {}
          });
        }
        return Promise.reject(new Error('Unexpected product ID'));
      });
      
      // Mock fetch
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          recommendations: [
            {
              product_id: 456,
              score: 0.95,
              reasoning: 'Compatible with oval face shape'
            }
          ]
        })
      });
      
      const recommendations = await apiClient.getFaceShapeRecommendations('oval', {
        limit: 1
      });
      
      expect(recommendations).toEqual([
        {
          id: 456,
          name: 'Recommended Product',
          sku: 'REC-456',
          price: 129.99,
          brand: 'Test Brand',
          images: [],
          customFields: {}
        }
      ]);
      
      // Check that fetch was called with the right arguments
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/recommendations/face-shape'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer process.env.APIKEY_2519',
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('"face_shape":"oval"')
        })
      );
    });
  });
  
  describe('calculateStyleScore', () => {
    test('should calculate style score and update product', async () => {
      // Mock getProduct
      jest.spyOn(apiClient, 'getProduct').mockResolvedValue({
        id: 123,
        name: 'Test Product',
        sku: 'TEST-123',
        price: 99.99,
        brand: 'Test Brand',
        images: [
          {
            id: 789,
            url_standard: 'https://example.com/image.jpg',
            url_thumbnail: 'https://example.com/image-thumb.jpg',
            url_zoom: 'https://example.com/image-zoom.jpg',
            is_thumbnail: true,
            sort_order: 1,
            description: 'Test Image'
          }
        ],
        customFields: {
          varai_style_tags: 'modern,sleek'
        }
      });
      
      // Mock updateProductCustomFields
      jest.spyOn(apiClient, 'updateProductCustomFields').mockResolvedValue();
      
      // Mock fetch
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          score: 85,
          breakdown: {
            design: 90,
            trend: 85,
            versatility: 80,
            uniqueness: 85,
            craftsmanship: 85
          },
          recommendations: [
            'Great for casual and formal settings',
            'Pairs well with oval and round face shapes'
          ]
        })
      });
      
      const styleScore = await apiClient.calculateStyleScore(123);
      
      expect(styleScore).toEqual({
        score: 85,
        breakdown: {
          design: 90,
          trend: 85,
          versatility: 80,
          uniqueness: 85,
          craftsmanship: 85
        },
        recommendations: [
          'Great for casual and formal settings',
          'Pairs well with oval and round face shapes'
        ]
      });
      
      // Check that updateProductCustomFields was called with the right arguments
      expect(apiClient.updateProductCustomFields).toHaveBeenCalledWith(123, {
        style_score: '85',
        style_score_breakdown: JSON.stringify({
          design: 90,
          trend: 85,
          versatility: 80,
          uniqueness: 85,
          craftsmanship: 85
        })
      });
    });
  });
  
  describe('detectFaceShape', () => {
    test('should detect face shape from image', async () => {
      // Mock fetch
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          face_shape: 'oval' as FaceShape
        })
      });
      
      const faceShape = await apiClient.detectFaceShape('base64-image-data');
      
      expect(faceShape).toBe('oval');
      
      // Check that fetch was called with the right arguments
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/face-shape/detect'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer process.env.APIKEY_2519',
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('"image":"base64-image-data"')
        })
      );
    });
  });
  
  describe('compareProducts', () => {
    test('should compare products', async () => {
      // Mock getProduct
      jest.spyOn(apiClient, 'getProduct').mockImplementation((id: number) => {
        if (id === 123) {
          return Promise.resolve({
            id: 123,
            name: 'Product 1',
            sku: 'PROD-123',
            price: 99.99,
            brand: 'Brand A',
            images: [],
            customFields: {
              varai_style_tags: 'modern,sleek',
              varai_face_shape_compatibility: 'oval,round',
              varai_style_score: '85',
              varai_frame_width: '140',
              varai_frame_bridge: '20',
              varai_frame_temple: '145'
            }
          });
        } else if (id === 456) {
          return Promise.resolve({
            id: 456,
            name: 'Product 2',
            sku: 'PROD-456',
            price: 129.99,
            brand: 'Brand B',
            images: [],
            customFields: {
              varai_style_tags: 'classic,elegant',
              varai_face_shape_compatibility: 'square,heart',
              varai_style_score: '90',
              varai_frame_width: '138',
              varai_frame_bridge: '18',
              varai_frame_temple: '142'
            }
          });
        }
        return Promise.reject(new Error('Unexpected product ID'));
      });
      
      // Mock fetch
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          comparison: {
            style: {
              product_123: {
                tags: ['modern', 'sleek'],
                score: 85
              },
              product_456: {
                tags: ['classic', 'elegant'],
                score: 90
              }
            },
            measurements: {
              product_123: {
                width: 140,
                bridge: 20,
                temple: 145
              },
              product_456: {
                width: 138,
                bridge: 18,
                temple: 142
              }
            },
            face_shape_compatibility: {
              product_123: ['oval', 'round'],
              product_456: ['square', 'heart']
            },
            price: {
              product_123: 99.99,
              product_456: 129.99,
              difference: 30.00,
              difference_percentage: 30.00
            }
          },
          recommendation: 'Product 2 has a higher style score but Product 1 is more affordable.'
        })
      });
      
      const comparison = await apiClient.compareProducts([123, 456], {
        include_measurements: true,
        include_style_score: true,
        include_face_shape_compatibility: true,
        include_price_comparison: true
      });
      
      expect(comparison).toEqual({
        comparison: {
          style: {
            product_123: {
              tags: ['modern', 'sleek'],
              score: 85
            },
            product_456: {
              tags: ['classic', 'elegant'],
              score: 90
            }
          },
          measurements: {
            product_123: {
              width: 140,
              bridge: 20,
              temple: 145
            },
            product_456: {
              width: 138,
              bridge: 18,
              temple: 142
            }
          },
          face_shape_compatibility: {
            product_123: ['oval', 'round'],
            product_456: ['square', 'heart']
          },
          price: {
            product_123: 99.99,
            product_456: 129.99,
            difference: 30.00,
            difference_percentage: 30.00
          }
        },
        recommendation: 'Product 2 has a higher style score but Product 1 is more affordable.'
      });
    });
  });
  
  describe('trackEvent', () => {
    test('should track analytics event', async () => {
      // Mock fetch
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
      
      await apiClient.trackEvent({
        event_type: 'view_item',
        product_id: 123,
        user_id: 'user-123',
        session_id: 'session-456'
      });
      
      // Check that fetch was called with the right arguments
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/events'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer process.env.APIKEY_2519',
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('"event_type":"view_item"')
        })
      );
      
      // Check that the body includes the platform and store hash
      const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(body).toEqual(expect.objectContaining({
        event_type: 'view_item',
        product_id: 123,
        user_id: 'user-123',
        session_id: 'session-456',
        platform: 'bigcommerce',
        store_hash: 'test-store-hash',
        timestamp: expect.any(String)
      }));
    });
  });
  
  describe('getAnalyticsDashboard', () => {
    test('should get analytics dashboard data', async () => {
      // Mock fetch
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          metrics: {
            views: 1000,
            try_ons: 500,
            recommendations_viewed: 800,
            recommendations_clicked: 300,
            face_shape_detections: 400,
            product_comparisons: 200
          },
          top_products: [
            {
              id: 123,
              name: 'Top Product 1',
              views: 200,
              try_ons: 100,
              conversion_rate: 0.15
            },
            {
              id: 456,
              name: 'Top Product 2',
              views: 180,
              try_ons: 90,
              conversion_rate: 0.12
            }
          ],
          face_shape_distribution: {
            oval: 0.4,
            round: 0.2,
            square: 0.15,
            heart: 0.15,
            oblong: 0.05,
            diamond: 0.05
          }
        })
      });
      
      const dashboardData = await apiClient.getAnalyticsDashboard();
      
      expect(dashboardData).toEqual({
        metrics: {
          views: 1000,
          try_ons: 500,
          recommendations_viewed: 800,
          recommendations_clicked: 300,
          face_shape_detections: 400,
          product_comparisons: 200
        },
        top_products: [
          {
            id: 123,
            name: 'Top Product 1',
            views: 200,
            try_ons: 100,
            conversion_rate: 0.15
          },
          {
            id: 456,
            name: 'Top Product 2',
            views: 180,
            try_ons: 90,
            conversion_rate: 0.12
          }
        ],
        face_shape_distribution: {
          oval: 0.4,
          round: 0.2,
          square: 0.15,
          heart: 0.15,
          oblong: 0.05,
          diamond: 0.05
        }
      });
      
      // Check that fetch was called with the right arguments
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/analytics/dashboard'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer process.env.APIKEY_2519',
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('"store_hash":"test-store-hash"')
        })
      );
    });
  });
});