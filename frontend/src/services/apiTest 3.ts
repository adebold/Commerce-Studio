import { api, framesApi, recommendationsApi, virtualTryOnApi } from './api';

export interface ApiTestResult {
  endpoint: string;
  status: 'success' | 'error';
  responseTime: number;
  data?: any;
  error?: string;
}

export const testApiConnection = async (): Promise<ApiTestResult[]> => {
  const results: ApiTestResult[] = [];

  // Test health endpoint
  try {
    const start = Date.now();
    const response = await api.get('/health');
    results.push({
      endpoint: '/health',
      status: 'success',
      responseTime: Date.now() - start,
      data: response.data
    });
  } catch (error: any) {
    results.push({
      endpoint: '/health',
      status: 'error',
      responseTime: 0,
      error: error.message
    });
  }

  // Test frames endpoint
  try {
    const start = Date.now();
    const response = await framesApi.getFrames({ limit: 5 });
    results.push({
      endpoint: '/api/v1/frames',
      status: 'success',
      responseTime: Date.now() - start,
      data: { total: response.data.total, count: response.data.frames?.length }
    });
  } catch (error: any) {
    results.push({
      endpoint: '/api/v1/frames',
      status: 'error',
      responseTime: 0,
      error: error.message
    });
  }

  // Test recommendations endpoint
  try {
    const start = Date.now();
    const response = await recommendationsApi.getRecommendations({ limit: 5 });
    results.push({
      endpoint: '/api/v1/recommendations',
      status: 'success',
      responseTime: Date.now() - start,
      data: { total: response.data.total, count: response.data.recommendations?.length }
    });
  } catch (error: any) {
    results.push({
      endpoint: '/api/v1/recommendations',
      status: 'error',
      responseTime: 0,
      error: error.message
    });
  }

  // Test virtual try-on endpoint
  try {
    const start = Date.now();
    const response = await virtualTryOnApi.startSession({
      frame_id: 'frame_1',
      user_id: 'test_user'
    });
    results.push({
      endpoint: '/api/v1/virtual-try-on',
      status: 'success',
      responseTime: Date.now() - start,
      data: { session_id: response.data.session_id, confidence: response.data.confidence_score }
    });
  } catch (error: any) {
    results.push({
      endpoint: '/api/v1/virtual-try-on',
      status: 'error',
      responseTime: 0,
      error: error.message
    });
  }

  return results;
};

export const logApiTestResults = async (): Promise<void> => {
  console.log('🧪 Testing API Connection...');
  const results = await testApiConnection();
  
  results.forEach(result => {
    const status = result.status === 'success' ? '✅' : '❌';
    console.log(`${status} ${result.endpoint} (${result.responseTime}ms)`);
    
    if (result.status === 'success' && result.data) {
      console.log('   Data:', result.data);
    } else if (result.error) {
      console.log('   Error:', result.error);
    }
  });

  const successCount = results.filter(r => r.status === 'success').length;
  console.log(`\n📊 API Test Summary: ${successCount}/${results.length} endpoints working`);
};