/**
 * Facial Animation Controller
 * 
 * This service orchestrates real-time facial animation and lip-sync using specialized services
 * for natural avatar expressions during conversation in the Commerce Studio AI Avatar Chat System.
 * 
 * @author Commerce Studio AI Team
 * @version 2.0.0
 */

import EventEmitter from 'events';
import crypto from 'crypto';
import { AnimationService } from './animation-service.js';
import { LipSyncService } from './lip-sync-service.js';
import { facialExpressions, gestureLibrary } from './animation-helpers.js';

export class FacialAnimationController extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      defaultFrameRate: 30,
      animationBlendTime: 500,
      lipSyncSensitivity: 0.8,
      expressionIntensity: 0.7,
      maxConcurrentAnimations: 3,
      animationCacheSize: 50,
      realTimeProcessing: true,
      ...config
    };
    
    this.isInitialized = false;
    this.activeAnimations = new Map();
    this.animationQueue = [];
    this.expressionStates = new Map();
    
    // Service dependencies
    this.animationService = null;
    this.lipSyncService = null;
    
    // Performance metrics
    this.performanceMetrics = {
      animationsPlayed: 0,
      averageLatency: 0,
      lipSyncAccuracy: 0,
      frameDrops: 0,
      processingLoad: 0
    };
  }

  /**
   * Initialize the Facial Animation Controller
   */
  async initialize(dependencies = {}) {
    try {
      console.log('Initializing Facial Animation Controller...');
      
      if (!dependencies.omniverseService || !dependencies.googleSpeechService) {
        throw new Error('Missing required dependencies: omniverseService and googleSpeechService.');
      }
      
      this.animationService = new AnimationService(dependencies.omniverseService);
      this.lipSyncService = new LipSyncService(dependencies.googleSpeechService, dependencies.omniverseService);
      
      this.setupEventListeners();
      
      this.isInitialized = true;
      this.emit('initialized');
      
      console.log('Facial Animation Controller initialized successfully');
      return { success: true, message: 'Facial Animation Controller initialized' };
      
    } catch (error) {
      console.error('Failed to initialize Facial Animation Controller:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Start facial animation for an avatar
   */
  async startFacialAnimation(avatarId, animationConfig = {}) {
    if (!this.isInitialized) throw new Error('Facial Animation Controller not initialized');
    
    try {
      const animationId = crypto.randomUUID();
      const animation = {
        id: animationId,
        avatarId,
        type: animationConfig.type || 'idle',
        intensity: animationConfig.intensity || this.config.expressionIntensity,
        duration: animationConfig.duration || 'continuous',
        blendMode: animationConfig.blendMode || 'additive',
        startTime: Date.now(),
        status: 'active',
      };
      
      if (this.activeAnimations.size >= this.config.maxConcurrentAnimations) {
        this.animationQueue.push(animation);
        return { animationId, status: 'queued' };
      }
      
      this.activeAnimations.set(animationId, animation);
      await this.animationService.applyFacialAnimation(animation);
      this.performanceMetrics.animationsPlayed++;
      
      if (animation.duration !== 'continuous') {
        setTimeout(() => this.stopFacialAnimation(animationId), animation.duration);
      }
      
      this.emit('animationStarted', { animationId, avatarId });
      return { animationId, status: 'active' };
      
    } catch (error) {
      console.error('Failed to start facial animation:', error);
      throw error;
    }
  }

  /**
   * Update facial expression in real-time
   */
  async updateFacialExpression(avatarId, emotion, intensity = 0.7) {
    if (!this.isInitialized) throw new Error('Facial Animation Controller not initialized');
    
    try {
      const expressionId = crypto.randomUUID();
      const expressionUpdate = {
        id: expressionId,
        avatarId,
        emotion,
        intensity: Math.max(0, Math.min(1, intensity)),
      };
      
      this.expressionStates.set(avatarId, expressionUpdate);
      await this.animationService.applyExpressionUpdate(expressionUpdate);
      
      this.emit('expressionUpdated', { avatarId, emotion, intensity });
      return { expressionId, status: 'applied' };
      
    } catch (error) {
      console.error('Failed to update facial expression:', error);
      throw error;
    }
  }

  /**
   * Start lip-sync animation with audio
   */
  async startLipSync(avatarId, audioData) {
    if (!this.isInitialized) throw new Error('Facial Animation Controller not initialized');
    
    try {
      const lipSyncId = crypto.randomUUID();
      const phonemeData = await this.lipSyncService.extractPhonemesFromGoogle(audioData);
      const visemeSequence = this.lipSyncService.convertPhonemesToVisemes(phonemeData);
      
      const lipSyncStream = {
        id: lipSyncId,
        avatarId,
        visemeSequence,
        startTime: Date.now(),
        duration: audioData.duration || this.estimateAudioDuration(audioData),
      };
      
      await this.lipSyncService.playLipSyncAnimation(lipSyncStream);
      
      this.emit('lipSyncStarted', { lipSyncId, avatarId });
      return { lipSyncId, status: 'active' };
      
    } catch (error) {
      console.error('Failed to start lip-sync:', error);
      throw error;
    }
  }

  /**
   * Play gesture animation
   */
  async playGesture(avatarId, gestureType, options = {}) {
    if (!this.isInitialized) throw new Error('Facial Animation Controller not initialized');
    
    try {
      const gestureId = crypto.randomUUID();
      const gestureConfig = gestureLibrary[gestureType];
      if (!gestureConfig) throw new Error(`Unknown gesture: ${gestureType}`);
      
      const gesture = {
        id: gestureId,
        avatarId,
        type: gestureType,
        intensity: options.intensity || 1.0,
        duration: options.duration || gestureConfig.defaultDuration,
      };
      
      await this.animationService.applyGestureAnimation(gesture);
      
      this.emit('gestureStarted', { gestureId, avatarId, gestureType });
      return { gestureId, status: 'playing' };
      
    } catch (error) {
      console.error('Failed to play gesture:', error);
      throw error;
    }
  }

  /**
   * Stop facial animation
   */
  async stopFacialAnimation(animationId) {
    const animation = this.activeAnimations.get(animationId);
    if (!animation) return;
    
    try {
      await this.animationService.applyFacialAnimation({ ...animation, type: 'stop' });
      this.activeAnimations.delete(animationId);
      this.processAnimationQueue();
      this.emit('animationStopped', { animationId });
    } catch (error) {
      console.error('Failed to stop facial animation:', error);
    }
  }

  processAnimationQueue() {
    if (this.animationQueue.length > 0 && this.activeAnimations.size < this.config.maxConcurrentAnimations) {
      const nextAnimation = this.animationQueue.shift();
      this.startFacialAnimation(nextAnimation.avatarId, nextAnimation);
    }
  }

  setupEventListeners() {
    this.lipSyncService.on('phonemesExtracted', (data) => {
      this.emit('phonemesExtracted', data);
    });
  }

  estimateAudioDuration(audioData) {
    // Basic estimation, can be replaced with a more accurate library
    const bytesPerSample = 2; // Assuming 16-bit audio
    const sampleRate = 16000;
    return (audioData.length / (bytesPerSample * sampleRate)) * 1000; // duration in ms
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.log('Shutting down Facial Animation Controller...');
    for (const animationId of this.activeAnimations.keys()) {
      await this.stopFacialAnimation(animationId);
    }
    this.animationQueue.length = 0;
    this.isInitialized = false;
    this.emit('shutdown');
    console.log('Facial Animation Controller shut down successfully');
  }
}