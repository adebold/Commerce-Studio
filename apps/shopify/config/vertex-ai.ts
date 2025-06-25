/**
 * Vertex AI Integration Configuration
 * 
 * This file contains configuration for connecting to Google's Vertex AI
 * services via the EyewearML platform for product data enhancement.
 */

/**
 * Vertex AI configuration interface
 */
interface VertexAIConfig {
  // API connection settings
  apiBaseUrl: string;
  apiKey: string;
  
  // AI enhancement settings
  useSimulation: boolean;
  enhancementLevel: 'basic' | 'standard' | 'comprehensive';
  
  // Vertex AI specific settings
  project: string;
  location: string;
  model: string;
  
  // Rate limiting and caching
  cacheEnabled: boolean;
  cacheTTLMinutes: number;
  requestsPerMinute: number;
}

/**
 * Default Vertex AI configuration
 * 
 * In production, these values would be populated from environment variables
 */
const config: VertexAIConfig = {
  // API connection settings
  apiBaseUrl: process.env.EYEWEARML_API_URL || 'https://api.eyewearml.com/v1',
  apiKey: process.env.EYEWEARML_API_KEY || '',
  
  // AI enhancement settings
  useSimulation: process.env.NODE_ENV !== 'production' || !process.env.EYEWEARML_API_KEY,
  enhancementLevel: 'standard',
  
  // Vertex AI specific settings
  project: process.env.VERTEX_AI_PROJECT || 'eyewear-ml-platform',
  location: process.env.VERTEX_AI_LOCATION || 'us-central1',
  model: process.env.VERTEX_AI_MODEL || 'text-bison@002',
  
  // Rate limiting and caching
  cacheEnabled: true,
  cacheTTLMinutes: 60 * 24, // 1 day
  requestsPerMinute: 60
};

export default config;
