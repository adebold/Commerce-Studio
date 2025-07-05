import { checkForRedirect } from '../redirect';

// Mock window.location
const mockLocation = {
  href: '',
  pathname: '',
};

// Save the original window.location
const originalLocation = window.location;

describe('Redirect Service', () => {
  beforeEach(() => {
    // Mock window.location
    delete window.location;
    window.location = { ...mockLocation } as unknown as Location;
  });

  afterEach(() => {
    // Restore original window.location
    window.location = originalLocation;
  });

  test('should detect legacy main domain URLs', () => {
    // Set up the test
    window.location.href = 'https://eyewear-ml.com/solutions';
    
    // Execute the function
    const result = checkForRedirect();
    
    // Assert the result
    expect(result).not.toBeNull();
    expect(result?.url).toBe('https://varai.ai/solutions');
    expect(result?.isPermanent).toBe(true);
  });

  test('should detect legacy API domain URLs', () => {
    // Set up the test
    window.location.href = 'https://api.eyewear-ml.com/v1/recommendations/product/123';
    
    // Execute the function
    const result = checkForRedirect();
    
    // Assert the result
    expect(result).not.toBeNull();
    expect(result?.url).toBe('https://api.varai.ai/v1/recommendations/product/123');
    expect(result?.isPermanent).toBe(true);
  });

  test('should detect legacy docs domain URLs', () => {
    // Set up the test
    window.location.href = 'https://docs.eyewear-ml.com/api/authentication';
    
    // Execute the function
    const result = checkForRedirect();
    
    // Assert the result
    expect(result).not.toBeNull();
    expect(result?.url).toBe('https://docs.varai.ai/api/authentication');
    expect(result?.isPermanent).toBe(true);
  });

  test('should detect legacy app domain URLs', () => {
    // Set up the test
    window.location.href = 'https://app.eyewear-ml.com/dashboard';
    
    // Execute the function
    const result = checkForRedirect();
    
    // Assert the result
    expect(result).not.toBeNull();
    expect(result?.url).toBe('https://app.varai.ai/dashboard');
    expect(result?.isPermanent).toBe(true);
  });

  test('should detect Cloud Run URLs for admin routes', () => {
    // Set up the test
    window.location.href = 'https://eyewear-ml-frontend-abcdef.run.app/admin/products';
    window.location.pathname = '/admin/products';
    
    // Execute the function
    const result = checkForRedirect();
    
    // Assert the result
    expect(result).not.toBeNull();
    expect(result?.url).toBe('https://app.varai.ai/products');
    expect(result?.isPermanent).toBe(true);
  });

  test('should detect Cloud Run URLs for customer routes', () => {
    // Set up the test
    window.location.href = 'https://eyewear-ml-frontend-abcdef.run.app/virtual-try-on';
    window.location.pathname = '/virtual-try-on';
    
    // Execute the function
    const result = checkForRedirect();
    
    // Assert the result
    expect(result).not.toBeNull();
    expect(result?.url).toBe('https://varai.ai/virtual-try-on');
    expect(result?.isPermanent).toBe(true);
  });

  test('should not redirect for new domain URLs', () => {
    // Set up the test
    window.location.href = 'https://varai.ai/solutions';
    
    // Execute the function
    const result = checkForRedirect();
    
    // Assert the result
    expect(result).toBeNull();
  });

  test('should not redirect for other domains', () => {
    // Set up the test
    window.location.href = 'https://example.com';
    
    // Execute the function
    const result = checkForRedirect();
    
    // Assert the result
    expect(result).toBeNull();
  });
});