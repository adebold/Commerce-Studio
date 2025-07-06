/**
 * Google Cloud Speech AI Service
 * 
 * Fallback service for NVIDIA Riva using Google Cloud Speech-to-Text
 * and Text-to-Speech APIs for real-time speech processing.
 * 
 * @author Commerce Studio AI Team
 * @version 1.0.0
 */

import { EventEmitter } from 'events';
import fetch from 'node-fetch';

class GoogleSpeechService extends EventEmitter {
  constructor(config = {}) {
    super();
    
    // Handle both camelCase and snake_case property names from YAML config
    const normalizedConfig = {
      endpoint: config.endpoint || config.url || 'https://speech.googleapis.com/v1',
      apiKey: config.apiKey || config.api_key || process.env.GOOGLE_CLOUD_API_KEY,
      projectId: config.projectId || config.project_id || process.env.GOOGLE_CLOUD_PROJECT_ID,
      timeout: config.timeout || 30000,
      retryAttempts: config.retryAttempts || 3,
      ...config
    };
    
    this.config = normalizedConfig;
    this.isInitialized = false;
    this.speechRecognitionStreams = new Map();
    this.speechSynthesisQueue = new Map();
    
    // Performance metrics
    this.performanceMetrics = {
      recognitionLatency: 0,
      synthesisLatency: 0,
      accuracyScore: 0,
      processingLoad: 0
    };
    
    // Audio configuration
    this.audioConfig = {
      sampleRate: 16000,
      channels: 1,
      encoding: 'LINEAR16',
      languageCode: 'en-US'
    };
  }

  async initialize() {
    try {
      this.validateConfiguration();
      
      // Test connection to Google Cloud Speech API
      await this.authenticate();
      
      this.isInitialized = true;
      this.emit('initialized');
      console.log('Google Speech Service initialized successfully');
      
      return true;
    } catch (error) {
      console.error('Google Speech Service initialization failed:', error);
      this.emit('error', error);
      throw error;
    }
  }

  async healthCheck() {
    return this.getServiceHealth();
  }

  async getServiceHealth() {
    try {
      if (!this.isInitialized) {
        return {
          status: 'unavailable',
          type: 'mock',
          message: 'Service not initialized'
        };
      }

      // Test API connectivity
      const response = await fetch(`${this.config.endpoint}/speech:recognize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          config: {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: 'en-US'
          },
          audio: {
            content: '' // Empty for health check
          }
        }),
        timeout: 5000
      });

      if (response.status === 200 || response.status === 400) { // 400 is expected for empty audio
        return {
          status: 'healthy',
          type: 'live',
          latency: this.performanceMetrics.recognitionLatency,
          accuracy: this.performanceMetrics.accuracyScore
        };
      } else {
        return {
          status: 'degraded',
          type: 'live',
          message: `API returned status ${response.status}`
        };
      }
    } catch (error) {
      console.error('Google Speech Service health check failed:', error);
      return {
        status: 'unavailable',
        type: 'mock',
        error: error.message
      };
    }
  }

  async recognizeSpeech(audioData, options = {}) {
    try {
      const startTime = Date.now();
      
      const requestBody = {
        config: {
          encoding: options.encoding || this.audioConfig.encoding,
          sampleRateHertz: options.sampleRate || this.audioConfig.sampleRate,
          languageCode: options.languageCode || this.audioConfig.languageCode,
          enableAutomaticPunctuation: true,
          enableWordTimeOffsets: true
        },
        audio: {
          content: audioData.toString('base64')
        }
      };

      const response = await fetch(`${this.config.endpoint}/speech:recognize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        timeout: this.config.timeout
      });

      if (!response.ok) {
        throw new Error(`Google Speech API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      // Update performance metrics
      this.performanceMetrics.recognitionLatency = Date.now() - startTime;
      
      // Extract transcript and confidence
      const transcript = result.results?.[0]?.alternatives?.[0]?.transcript || '';
      const confidence = result.results?.[0]?.alternatives?.[0]?.confidence || 0;
      
      this.performanceMetrics.accuracyScore = confidence;
      
      this.emit('speechRecognized', {
        transcript,
        confidence,
        latency: this.performanceMetrics.recognitionLatency
      });

      return {
        transcript,
        confidence,
        words: result.results?.[0]?.alternatives?.[0]?.words || [],
        latency: this.performanceMetrics.recognitionLatency
      };
    } catch (error) {
      console.error('Speech recognition failed:', error);
      this.emit('error', error);
      throw error;
    }
  }

  async synthesizeSpeech(text, options = {}) {
    try {
      const startTime = Date.now();
      
      const requestBody = {
        input: { text },
        voice: {
          languageCode: options.languageCode || 'en-US',
          name: options.voiceName || 'en-US-Wavenet-D',
          ssmlGender: options.gender || 'NEUTRAL'
        },
        audioConfig: {
          audioEncoding: options.encoding || 'MP3',
          speakingRate: options.speakingRate || 1.0,
          pitch: options.pitch || 0.0,
          volumeGainDb: options.volumeGain || 0.0
        }
      };

      const response = await fetch(`${this.config.endpoint}/text:synthesize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        timeout: this.config.timeout
      });

      if (!response.ok) {
        throw new Error(`Google TTS API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      // Update performance metrics
      this.performanceMetrics.synthesisLatency = Date.now() - startTime;
      
      this.emit('speechSynthesized', {
        text,
        audioContent: result.audioContent,
        latency: this.performanceMetrics.synthesisLatency
      });

      return {
        audioContent: result.audioContent,
        latency: this.performanceMetrics.synthesisLatency
      };
    } catch (error) {
      console.error('Speech synthesis failed:', error);
      this.emit('error', error);
      throw error;
    }
  }

  // Private helper methods
  validateConfiguration() {
    const required = ['apiKey', 'endpoint'];
    for (const field of required) {
      if (!this.config[field]) {
        throw new Error(`Missing required configuration: ${field}`);
      }
    }
  }

  async authenticate() {
    try {
      // For Google Cloud, we'll use the API key directly
      // In production, you might want to use service account authentication
      if (!this.config.apiKey) {
        throw new Error('Google Cloud API key is required');
      }
      
      return true;
    } catch (error) {
      console.error('Google Cloud authentication failed:', error);
      throw error;
    }
  }

  async shutdown() {
    try {
      // Clean up any active streams
      for (const [sessionId, stream] of this.speechRecognitionStreams) {
        stream.destroy();
      }
      this.speechRecognitionStreams.clear();
      this.speechSynthesisQueue.clear();
      
      this.isInitialized = false;
      this.emit('shutdown');
      console.log('Google Speech Service shut down successfully');
    } catch (error) {
      console.error('Error during Google Speech Service shutdown:', error);
      throw error;
    }
  }
}

export default GoogleSpeechService;