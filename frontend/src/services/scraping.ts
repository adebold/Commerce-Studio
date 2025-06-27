import { ApiError } from './api';

export interface ScrapingStats {
  total_scrapes: number;
  avg_content_success_rate: number;
  avg_image_success_rate: number;
  total_items_processed: number;
}

export interface ScrapeLog {
  timestamp: string;
  total_items: number;
  successful_content: number;
  successful_images: number;
  content_success_rate: number;
  image_success_rate: number;
}

const API_BASE_URL = 'http://localhost:8001/scraping';

// Utility function to check if the API is available
async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('API health check failed:', response.statusText);
      return false;
    }
    
    const data = await response.json();
    console.log('API health check response:', data);
    return data.status === 'ok';
  } catch (error) {
    console.error('API health check error:', error);
    return false;
  }
}

export async function testApiConnection(): Promise<boolean> {
  // First check if the API is healthy
  const isHealthy = await checkApiHealth();
  if (!isHealthy) {
    console.error('API health check failed');
    return false;
  }
  try {
    console.log('Testing API connection to:', API_BASE_URL);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('API response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error text available');
        console.error('API test failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          url: API_BASE_URL
        });
        return false;
      }
      
      const data = await response.json();
      console.log('API test response:', data);
      return true;
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('API connection timeout after 5 seconds:', {
          url: API_BASE_URL
        });
      } else if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.error('Network error - Failed to connect to API:', {
          url: API_BASE_URL,
          error: error.message,
          stack: error.stack
        });
      } else {
        console.error('Unexpected error during API connection test:', {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined
        });
      }
      return false;
    }
  } catch (error) {
    console.error('Critical error during API connection test:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });
    return false;
  }
}

export async function getScrapingStats(): Promise<ScrapingStats> {
  try {
    console.log('Fetching scraping stats from:', `${API_BASE_URL}/stats`);
    const response = await fetch(`${API_BASE_URL}/stats`);
    console.log('Stats response status:', response.status);
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new ApiError(
        response.status,
        errorData?.detail || `Failed to fetch scraping stats: ${response.statusText}`
      );
    }
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error instanceof Error ? error.message : 'Failed to fetch scraping stats');
  }
}

export async function getScrapeLogs(): Promise<ScrapeLog[]> {
  try {
    console.log('Fetching scrape logs from:', `${API_BASE_URL}/logs`);
    const response = await fetch(`${API_BASE_URL}/logs`);
    console.log('Logs response status:', response.status);
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new ApiError(
        response.status,
        errorData?.detail || `Failed to fetch scrape logs: ${response.statusText}`
      );
    }
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error instanceof Error ? error.message : 'Failed to fetch scrape logs');
  }
}

export async function triggerScrape(): Promise<void> {
  try {
    console.log('Triggering scrape at:', `${API_BASE_URL}/trigger`);
    const response = await fetch(`${API_BASE_URL}/trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new ApiError(
        response.status,
        errorData?.detail || `Failed to trigger scrape: ${response.statusText}`
      );
    }
    const data = await response.json();
    console.log('Trigger response:', data);
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error instanceof Error ? error.message : 'Failed to trigger scrape');
  }
}
