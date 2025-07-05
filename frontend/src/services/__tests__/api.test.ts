import axios, { AxiosError, AxiosInstance } from 'axios';
import type {
  LoginRequest,
  LoginResponse,
  User,
  Product,
  VirtualTryOnRequest,
  VirtualTryOnResponse,
  RecommendationRequest,
  RecommendationResponse,
  AnalyticsEvent,
  AnalyticsResponse,
  ContactLensUploadRequest,
  ContactLensUploadResponse,
  ContactLensApplyRequest,
  ContactLensApplyResponse,
  EcommerceIntegration,
  ProductSyncRequest,
  ProductSyncResponse,
  WebhookEvent,
  WebhookResponse,
  HealthCheckResponse,
  PaginatedResponse
} from '../../types/api';

// Mock axios BEFORE importing the API module
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Create a mock axios instance
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: {
      use: jest.fn(),
    },
    response: {
      use: jest.fn(),
    },
  },
} as unknown as jest.Mocked<AxiosInstance>;

// Mock axios.create to return our mock instance
mockedAxios.create.mockReturnValue(mockAxiosInstance);

// Now import the API module after mocking is set up
import {
  api,
  ApiError,
  authApi,
  productApi,
  virtualTryOnApi,
  recommendationApi,
  analyticsApi,
  contactLensApi,
  ecommerceApi,
  webhookApi,
  healthApi,
  apiUtils
} from '../api';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: '',
  },
  writable: true,
});

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    
    // Reset mock axios instance
    mockAxiosInstance.get.mockClear();
    mockAxiosInstance.post.mockClear();
    mockAxiosInstance.put.mockClear();
    mockAxiosInstance.patch.mockClear();
    mockAxiosInstance.delete.mockClear();
  });

  describe('ApiError', () => {
    it('should create ApiError from axios error', () => {
      const axiosError = {
        message: 'Network Error',
        response: {
          status: 500,
          data: {
            error: {
              code: 'INTERNAL_ERROR',
              message: 'Internal server error',
              details: { field: 'email' }
            }
          }
        }
      } as AxiosError;

      const apiError = new ApiError(axiosError);

      expect(apiError.message).toBe('Internal server error');
      expect(apiError.status).toBe(500);
      expect(apiError.code).toBe('INTERNAL_ERROR');
      expect(apiError.field).toBe('email');
      expect(apiError.isRetryable).toBe(true);
      expect(apiError instanceof Error).toBe(true);
      expect(apiError instanceof ApiError).toBe(true);
    });

    it('should handle axios error without response data', () => {
      const axiosError = {
        message: 'Network Error',
      } as AxiosError;

      const apiError = new ApiError(axiosError);

      expect(apiError.message).toBe('Network Error');
      expect(apiError.status).toBe(500);
      expect(apiError.code).toBe('UNKNOWN_ERROR');
      expect(apiError.isRetryable).toBe(true);
    });

    it('should determine retryability correctly', () => {
      const retryableError = new ApiError({
        response: { status: 500 }
      } as AxiosError);
      expect(retryableError.isRetryable).toBe(true);

      const nonRetryableError = new ApiError({
        response: { status: 400 }
      } as AxiosError);
      expect(nonRetryableError.isRetryable).toBe(false);

      const timeoutError = new ApiError({
        response: { status: 408 }
      } as AxiosError);
      expect(timeoutError.isRetryable).toBe(true);

      const rateLimitError = new ApiError({
        response: { status: 429 }
      } as AxiosError);
      expect(rateLimitError.isRetryable).toBe(true);
    });

    it('should provide user-friendly error messages', () => {
      const badRequestError = new ApiError({
        response: { status: 400 }
      } as AxiosError);
      expect(badRequestError.getUserMessage()).toBe('Invalid request. Please check your input and try again.');

      const unauthorizedError = new ApiError({
        response: { status: 401 }
      } as AxiosError);
      expect(unauthorizedError.getUserMessage()).toBe('Authentication required. Please log in and try again.');

      const forbiddenError = new ApiError({
        response: { status: 403 }
      } as AxiosError);
      expect(forbiddenError.getUserMessage()).toBe('Access denied. You do not have permission to perform this action.');

      const notFoundError = new ApiError({
        response: { status: 404 }
      } as AxiosError);
      expect(notFoundError.getUserMessage()).toBe('The requested resource was not found.');

      const rateLimitError = new ApiError({
        response: { status: 429 }
      } as AxiosError);
      expect(rateLimitError.getUserMessage()).toBe('Too many requests. Please wait a moment and try again.');

      const serverError = new ApiError({
        response: { status: 500 }
      } as AxiosError);
      expect(serverError.getUserMessage()).toBe('Server error. Please try again later.');
    });
  });

  describe('Authentication API', () => {
    describe('login', () => {
      it('should login successfully', async () => {
        const loginRequest: LoginRequest = {
          email: 'test@example.com',
          password: 'password123'
        };

        const mockUser: User = {
          id: '1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'user',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z'
        };

        const mockResponse: LoginResponse = {
          user: mockUser,
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresIn: 3600
        };

        mockAxiosInstance.post.mockResolvedValue({
          data: {
            data: mockResponse,
            success: true,
            timestamp: new Date().toISOString()
          }
        });

        const result = await authApi.login(loginRequest);

        expect(result).toEqual(mockResponse);
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/auth/login', loginRequest, {
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        });
      });

      it('should handle login error', async () => {
        const loginRequest: LoginRequest = {
          email: 'test@example.com',
          password: 'wrongpassword'
        };

        const axiosError = {
          response: {
            status: 401,
            data: {
              error: {
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password'
              }
            }
          }
        } as AxiosError;

        mockAxiosInstance.post.mockRejectedValue(axiosError);

        await expect(authApi.login(loginRequest)).rejects.toThrow(ApiError);
      });
    });

    describe('refreshToken', () => {
      it('should refresh token successfully', async () => {
        const mockResponse: LoginResponse = {
          user: {} as User,
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          expiresIn: 3600
        };

        mockAxiosInstance.post.mockResolvedValue({
          data: {
            data: mockResponse,
            success: true,
            timestamp: new Date().toISOString()
          }
        });

        const result = await authApi.refreshToken('old-refresh-token');

        expect(result).toEqual(mockResponse);
      });
    });

    describe('logout', () => {
      it('should logout successfully', async () => {
        mockedAxios.post.mockResolvedValue({ data: {} });

        await authApi.logout();

        expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token');
      });
    });

    describe('getCurrentUser', () => {
      it('should get current user successfully', async () => {
        const mockUser: User = {
          id: '1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'user',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z'
        };

        mockAxiosInstance.get.mockResolvedValue({
          data: {
            data: mockUser,
            success: true,
            timestamp: new Date().toISOString()
          }
        });

        const result = await authApi.getCurrentUser();

        expect(result).toEqual(mockUser);
      });
    });
  });

  describe('Product API', () => {
    describe('getProducts', () => {
      it('should get products with pagination', async () => {
        const mockProducts: Product[] = [
          {
            id: '1',
            name: 'Test Product',
            description: 'Test Description',
            brand: 'Test Brand',
            category: 'Test Category',
            price: 99.99,
            currency: 'USD',
            images: [],
            variants: [],
            specifications: [],
            tags: [],
            isActive: true,
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z'
          }
        ];

        const mockResponse: PaginatedResponse<Product> = {
          items: mockProducts,
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1,
            hasNext: false,
            hasPrev: false
          }
        };

        mockAxiosInstance.get.mockResolvedValue({
          data: {
            data: mockResponse,
            success: true,
            timestamp: new Date().toISOString()
          }
        });

        const result = await productApi.getProducts(1, 20, { category: 'test' });

        expect(result).toEqual(mockResponse);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          expect.stringContaining('/api/products'),
          expect.any(Object)
        );
      });
    });

    describe('getProduct', () => {
      it('should get single product', async () => {
        const mockProduct: Product = {
          id: '1',
          name: 'Test Product',
          description: 'Test Description',
          brand: 'Test Brand',
          category: 'Test Category',
          price: 99.99,
          currency: 'USD',
          images: [],
          variants: [],
          specifications: [],
          tags: [],
          isActive: true,
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z'
        };

        mockAxiosInstance.get.mockResolvedValue({
          data: {
            data: mockProduct,
            success: true,
            timestamp: new Date().toISOString()
          }
        });

        const result = await productApi.getProduct('1');

        expect(result).toEqual(mockProduct);
      });
    });
  });

  describe('Virtual Try-On API', () => {
    describe('processVirtualTryOn', () => {
      it('should process virtual try-on request', async () => {
        const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        const request: VirtualTryOnRequest = {
          productId: '1',
          userImage: mockFile,
          faceShapeData: {
            shape: 'oval',
            confidence: 0.95,
            landmarks: []
          }
        };

        const mockResponse: VirtualTryOnResponse = {
          id: '1',
          resultImage: 'data:image/jpeg;base64,test',
          confidence: 0.9,
          faceShape: 'oval',
          recommendations: ['product1', 'product2'],
          processingTime: 1500,
          createdAt: '2023-01-01T00:00:00Z'
        };

        mockAxiosInstance.post.mockResolvedValue({
          data: {
            data: mockResponse,
            success: true,
            timestamp: new Date().toISOString()
          }
        });

        const result = await virtualTryOnApi.processVirtualTryOn(request);

        expect(result).toEqual(mockResponse);
        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/api/virtual-try-on/process',
          expect.any(FormData),
          expect.objectContaining({
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'multipart/form-data',
            },
          })
        );
      });
    });
  });

  describe('Recommendation API', () => {
    describe('getRecommendations', () => {
      it('should get recommendations', async () => {
        const request: RecommendationRequest = {
          userId: '1',
          faceShape: 'oval',
          preferences: {
            priceRange: { min: 50, max: 200 },
            brands: ['Brand1', 'Brand2']
          }
        };

        const mockResponse: RecommendationResponse = {
          id: '1',
          products: [],
          algorithm: 'collaborative-filtering',
          confidence: 0.85,
          explanation: 'Based on your face shape and preferences',
          createdAt: '2023-01-01T00:00:00Z'
        };

        mockAxiosInstance.post.mockResolvedValue({
          data: {
            data: mockResponse,
            success: true,
            timestamp: new Date().toISOString()
          }
        });

        const result = await recommendationApi.getRecommendations(request);

        expect(result).toEqual(mockResponse);
      });
    });

    describe('trackRecommendationClick', () => {
      it('should track recommendation click', async () => {
        mockAxiosInstance.post.mockResolvedValue({ data: {} });

        await recommendationApi.trackRecommendationClick('rec1', 'product1');

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/recommendations/track', {
          recommendationId: 'rec1',
          productId: 'product1',
          action: 'click'
        }, {
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        });
      });
    });
  });

  describe('Analytics API', () => {
    describe('trackEvent', () => {
      it('should track analytics event', async () => {
        const event: AnalyticsEvent = {
          type: 'page_view',
          sessionId: 'session123',
          properties: {
            page: '/products',
            referrer: 'google.com'
          }
        };

        mockAxiosInstance.post.mockResolvedValue({ data: {} });

        await analyticsApi.trackEvent(event);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/analytics/events', event, {
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        });
      });
    });

    describe('getAnalytics', () => {
      it('should get analytics data', async () => {
        const mockResponse: AnalyticsResponse = {
          metrics: [
            {
              name: 'page_views',
              value: 1000,
              unit: 'count',
              change: 50,
              changePercent: 5.0
            }
          ],
          timeRange: {
            start: '2023-01-01T00:00:00Z',
            end: '2023-01-31T23:59:59Z'
          },
          aggregation: 'daily'
        };

        mockAxiosInstance.get.mockResolvedValue({
          data: {
            data: mockResponse,
            success: true,
            timestamp: new Date().toISOString()
          }
        });

        const result = await analyticsApi.getAnalytics({
          startDate: '2023-01-01',
          endDate: '2023-01-31'
        });

        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('Contact Lens API', () => {
    describe('uploadContactLens', () => {
      it('should upload contact lens', async () => {
        const mockFile = new File(['test'], 'lens.jpg', { type: 'image/jpeg' });
        const request: ContactLensUploadRequest = {
          image: mockFile,
          name: 'Blue Lens',
          description: 'Beautiful blue contact lens'
        };

        const mockResponse: ContactLensUploadResponse = {
          id: '1',
          name: 'Blue Lens',
          imageUrl: 'https://example.com/lens.jpg',
          thumbnailUrl: 'https://example.com/lens-thumb.jpg',
          createdAt: '2023-01-01T00:00:00Z'
        };

        mockAxiosInstance.post.mockResolvedValue({
          data: {
            data: mockResponse,
            success: true,
            timestamp: new Date().toISOString()
          }
        });

        const result = await contactLensApi.uploadContactLens(request);

        expect(result).toEqual(mockResponse);
        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/api/contact-lenses/upload',
          expect.any(FormData),
          expect.objectContaining({
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'multipart/form-data',
            },
          })
        );
      });
    });

    describe('applyContactLens', () => {
      it('should apply contact lens', async () => {
        const mockFile = new File(['test'], 'user.jpg', { type: 'image/jpeg' });
        const request: ContactLensApplyRequest = {
          userImage: mockFile,
          contactLensId: '1'
        };

        const mockResponse: ContactLensApplyResponse = {
          id: '1',
          resultImage: 'data:image/jpeg;base64,result',
          originalImage: 'data:image/jpeg;base64,original',
          contactLensId: '1',
          processingTime: 2000,
          createdAt: '2023-01-01T00:00:00Z'
        };

        mockAxiosInstance.post.mockResolvedValue({
          data: {
            data: mockResponse,
            success: true,
            timestamp: new Date().toISOString()
          }
        });

        const result = await contactLensApi.applyContactLens(request);

        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('E-commerce API', () => {
    describe('getIntegrations', () => {
      it('should get integrations', async () => {
        const mockIntegrations: EcommerceIntegration[] = [
          {
            id: '1',
            platform: 'shopify',
            name: 'My Shopify Store',
            storeUrl: 'https://mystore.myshopify.com',
            apiKey: 'api-key',
            isActive: true,
            syncStatus: 'success',
            settings: {
              syncProducts: true,
              syncOrders: true,
              syncCustomers: false,
              autoSync: true,
              syncInterval: 3600
            },
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-01T00:00:00Z'
          }
        ];

        mockAxiosInstance.get.mockResolvedValue({
          data: {
            data: mockIntegrations,
            success: true,
            timestamp: new Date().toISOString()
          }
        });

        const result = await ecommerceApi.getIntegrations();

        expect(result).toEqual(mockIntegrations);
      });
    });

    describe('syncProducts', () => {
      it('should sync products', async () => {
        const request: ProductSyncRequest = {
          integrationId: '1',
          fullSync: true
        };

        const mockResponse: ProductSyncResponse = {
          jobId: 'job123',
          status: 'started',
          totalProducts: 100,
          syncedProducts: 0,
          errors: [],
          startedAt: '2023-01-01T00:00:00Z'
        };

        mockAxiosInstance.post.mockResolvedValue({
          data: {
            data: mockResponse,
            success: true,
            timestamp: new Date().toISOString()
          }
        });

        const result = await ecommerceApi.syncProducts(request);

        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('Webhook API', () => {
    describe('processWebhook', () => {
      it('should process webhook', async () => {
        const event: WebhookEvent = {
          id: '1',
          type: 'product.created',
          source: 'shopify',
          payload: { productId: '123' },
          timestamp: '2023-01-01T00:00:00Z',
          processed: false
        };

        const mockResponse: WebhookResponse = {
          id: '1',
          status: 'processed',
          message: 'Webhook processed successfully',
          processingTime: 500
        };

        mockAxiosInstance.post.mockResolvedValue({
          data: {
            data: mockResponse,
            success: true,
            timestamp: new Date().toISOString()
          }
        });

        const result = await webhookApi.processWebhook(event);

        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('Health API', () => {
    describe('getHealth', () => {
      it('should get health status', async () => {
        const mockResponse: HealthCheckResponse = {
          status: 'healthy',
          timestamp: '2023-01-01T00:00:00Z',
          uptime: 86400,
          version: '1.0.0',
          services: [
            {
              name: 'database',
              status: 'healthy',
              responseTime: 50,
              lastCheck: '2023-01-01T00:00:00Z'
            }
          ]
        };

        mockAxiosInstance.get.mockResolvedValue({
          data: {
            data: mockResponse,
            success: true,
            timestamp: new Date().toISOString()
          }
        });

        const result = await healthApi.getHealth();

        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('API Utils', () => {
    describe('getRequestMetrics', () => {
      it('should return request metrics', () => {
        const metrics = apiUtils.getRequestMetrics();
        expect(Array.isArray(metrics)).toBe(true);
      });
    });

    describe('clearRequestMetrics', () => {
      it('should clear request metrics', () => {
        apiUtils.clearRequestMetrics();
        const metrics = apiUtils.getRequestMetrics();
        expect(metrics).toHaveLength(0);
      });
    });

    describe('getConfig', () => {
      it('should return API configuration', () => {
        const config = apiUtils.getConfig();
        expect(config).toHaveProperty('baseURL');
        expect(config).toHaveProperty('timeout');
        expect(config).toHaveProperty('retries');
      });
    });

    describe('updateConfig', () => {
      it('should update API configuration', () => {
        const newConfig = { timeout: 60000 };
        apiUtils.updateConfig(newConfig);
        const config = apiUtils.getConfig();
        expect(config.timeout).toBe(60000);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      const networkError = new Error('Network Error') as AxiosError;
      mockAxiosInstance.get.mockRejectedValue(networkError);

      await expect(api.get('/api/test')).rejects.toThrow();
    });

    it('should handle 500 errors', async () => {
      const serverError = {
        response: {
          status: 500,
          data: {
            error: {
              code: 'INTERNAL_ERROR',
              message: 'Internal server error'
            }
          }
        }
      } as AxiosError;

      mockAxiosInstance.get.mockRejectedValue(serverError);

      await expect(api.get('/api/test')).rejects.toThrow(ApiError);
    });
  });
});