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
import { SpeechClient } from '@google-cloud/speech';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

class GoogleSpeechService extends EventEmitter {
  constructor(config = {}) {
    super();
    
    // Handle both camelCase and snake_case property names from YAML config
    const normalizedConfig = {
      projectId: config.projectId || config.project_id || process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: config.keyFilename || process.env.GOOGLE_APPLICATION_CREDENTIALS,
      timeout: config.timeout || 30000,
      retryAttempts: config.retryAttempts || 3,
      ...config
    };
    
    this.config = normalizedConfig;
    this.isInitialized = false;
    this.speechClient = null;
    this.ttsClient = null;
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
      if (!this.isInitialized || !this.speechClient) {
        return {
          status: 'unavailable',
          type: 'mock',
          message: 'Service not initialized'
        };
      }

      // Test API connectivity by getting project ID
      await this.speechClient.getProjectId();
      
      return {
        status: 'healthy',
        type: 'live',
        latency: this.performanceMetrics.recognitionLatency,
        accuracy: this.performanceMetrics.accuracyScore
      };
    } catch (error) {
      console.error('Google Speech Service health check failed:', error);
      return {
        status: 'unavailable',
        type: 'mock',
        error: error.message
      };
    }
  }

  async processAudio(audioData, options = {}) {
    const result = await this.recognizeSpeech(audioData, options);
    return {
      transcript: result.transcript,
      confidence: result.confidence
    };
  }

  async recognizeSpeech(audioData, options = {}) {
    try {
      const startTime = Date.now();
      
      const request = {
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

      const [response] = await this.speechClient.recognize(request);
      
      // Update performance metrics
      this.performanceMetrics.recognitionLatency = Date.now() - startTime;
      
      // Extract transcript and confidence
      const transcript = response.results?.[0]?.alternatives?.[0]?.transcript || '';
      const confidence = response.results?.[0]?.alternatives?.[0]?.confidence || 0;
      
      this.performanceMetrics.accuracyScore = confidence;
      
      this.emit('speechRecognized', {
        transcript,
        confidence,
        latency: this.performanceMetrics.recognitionLatency
      });

      return {
        transcript,
        confidence,
        words: response.results?.[0]?.alternatives?.[0]?.words || [],
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
      
      const request = {
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

      const [response] = await this.ttsClient.synthesizeSpeech(request);
      
      // Update performance metrics
      this.performanceMetrics.synthesisLatency = Date.now() - startTime;
      
      this.emit('speechSynthesized', {
        text,
        audioContent: response.audioContent,
        latency: this.performanceMetrics.synthesisLatency
      });

      return {
        audioContent: response.audioContent,
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
    const required = ['projectId'];
    for (const field of required) {
      if (!this.config[field]) {
        throw new Error(`Missing required configuration: ${field}`);
      }
    }
  }

  async authenticate() {
    try {
      // Initialize Google Cloud clients with service account authentication
      const clientConfig = {
        projectId: this.config.projectId
      };
      
      if (this.config.keyFilename) {
        clientConfig.keyFilename = this.config.keyFilename;
      }
      
      this.speechClient = new SpeechClient(clientConfig);
      this.ttsClient = new TextToSpeechClient(clientConfig);
      
      // Test authentication by making a simple request
      await this.speechClient.getProjectId();
      
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