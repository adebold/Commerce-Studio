/**
 * Avatar Manager
 * 
 * This service manages avatar lifecycle, coordinates between NVIDIA services,
 * and handles avatar state management for the AI Avatar Chat System.
 * 
 * @author Commerce Studio AI Team
 * @version 1.0.0
 */

const EventEmitter = require('events');
const crypto = require('crypto');

class AvatarManager extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      maxConcurrentAvatars: config.maxConcurrentAvatars || 10,
      avatarTimeout: config.avatarTimeout || 300000, // 5 minutes
      defaultAvatarConfig: config.defaultAvatarConfig || {},
      performanceThresholds: config.performanceThresholds || {
        maxLatency: 2000,
        minFPS: 24,
        maxMemoryUsage: 512 // MB
      },
      ...config
    };
    
    this.isInitialized = false;
    this.avatarSessions = new Map();
    this.avatarStates = new Map();
    this.performanceMetrics = new Map();
    
    // Service dependencies
    this.omniverseService = null;
    this.rivaService = null;
    this.merlinService = null;
    
    // Avatar lifecycle tracking
    this.lifecycleEvents = new Map();
    this.sessionTimeouts = new Map();
    
    // Performance monitoring
    this.performanceInterval = null;
    this.healthCheckInterval = null;
  }

  /**
   * Initialize the Avatar Manager
   */
  async initialize(services = {}) {
    try {
      console.log('Initializing Avatar Manager...');
      
      // Validate and store service dependencies
      this.validateServices(services);
      this.omniverseService = services.omniverseService;
      this.rivaService = services.rivaService;
      this.merlinService = services.merlinService;
      
      // Set up service event listeners
      this.setupServiceEventListeners();
      
      // Start monitoring
      this.startPerformanceMonitoring();
      this.startHealthChecking();
      
      this.isInitialized = true;
      this.emit('initialized');
      
      console.log('Avatar Manager initialized successfully');
      return { success: true, message: 'Avatar Manager initialized' };
      
    } catch (error) {
      console.error('Failed to initialize Avatar Manager:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Create a new avatar session
   */
  async createAvatarSession(userId, sessionConfig = {}) {
    if (!this.isInitialized) {
      throw new Error('Avatar Manager not initialized');
    }
    
    try {
      // Check concurrent avatar limit
      if (this.avatarSessions.size >= this.config.maxConcurrentAvatars) {
        throw new Error('Maximum concurrent avatars reached');
      }
      
      const sessionId = crypto.randomUUID();
      
      // Prepare avatar configuration
      const avatarConfig = {
        ...this.config.defaultAvatarConfig,
        ...sessionConfig.avatarConfig,
        userId,
        sessionId
      };
      
      // Create avatar session
      const session = {
        sessionId,
        userId,
        status: 'creating',
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        config: avatarConfig,
        services: {
          avatar: null,
          speech: null,
          conversation: null
        },
        state: {
          isRendering: false,
          isSpeaking: false,
          isListening: false,
          currentAnimation: null,
          currentEmotion: 'neutral',
          conversationActive: false
        },
        metrics: {
          renderingFPS: 0,
          speechLatency: 0,
          responseTime: 0,
          userEngagement: 0
        }
      };
      
      this.avatarSessions.set(sessionId, session);
      
      // Initialize avatar services
      await this.initializeAvatarServices(session);
      
      // Set up session timeout
      this.setupSessionTimeout(sessionId);
      
      // Track lifecycle event
      this.trackLifecycleEvent(sessionId, 'created', { userId, config: avatarConfig });
      
      this.emit('avatarSessionCreated', { sessionId, userId, session });
      
      return {
        sessionId,
        status: session.status,
        avatarId: session.services.avatar?.avatarId,
        config: this.sanitizeConfig(avatarConfig)
      };
      
    } catch (error) {
      console.error('Failed to create avatar session:', error);
      throw error;
    }
  }

  /**
   * Start avatar interaction (rendering, speech, conversation)
   */
  async startAvatarInteraction(sessionId, interactionConfig = {}) {
    if (!this.avatarSessions.has(sessionId)) {
      throw new Error(`Avatar session not found: ${sessionId}`);
    }
    
    try {
      const session = this.avatarSessions.get(sessionId);
      
      // Start avatar rendering
      if (interactionConfig.enableRendering !== false) {
        await this.startAvatarRendering(session, interactionConfig.renderConfig);
      }
      
      // Start speech recognition
      if (interactionConfig.enableSpeech !== false) {
        await this.startSpeechRecognition(session, interactionConfig.speechConfig);
      }
      
      // Start conversation
      if (interactionConfig.enableConversation !== false) {
        await this.startConversation(session, interactionConfig.conversationConfig);
      }
      
      // Update session state
      session.state.conversationActive = true;
      session.lastActivity = new Date().toISOString();
      session.status = 'active';
      
      this.trackLifecycleEvent(sessionId, 'interaction_started', interactionConfig);
      this.emit('avatarInteractionStarted', { sessionId, session });
      
      return {
        sessionId,
        status: 'active',
        services: {
          rendering: session.state.isRendering,
          speech: session.state.isListening,
          conversation: session.state.conversationActive
        }
      };
      
    } catch (error) {
      console.error('Failed to start avatar interaction:', error);
      throw error;
    }
  }

  /**
   * Process user input (voice, text, or gesture)
   */
  async processUserInput(sessionId, input) {
    if (!this.avatarSessions.has(sessionId)) {
      throw new Error(`Avatar session not found: ${sessionId}`);
    }
    
    try {
      const session = this.avatarSessions.get(sessionId);
      const startTime = Date.now();
      
      // Update last activity
      session.lastActivity = new Date().toISOString();
      
      let processedInput = null;
      let avatarResponse = null;
      
      // Process input based on type
      switch (input.type) {
        case 'voice':
          processedInput = await this.processVoiceInput(session, input);
          break;
        case 'text':
          processedInput = await this.processTextInput(session, input);
          break;
        case 'gesture':
          processedInput = await this.processGestureInput(session, input);
          break;
        case 'camera':
          processedInput = await this.processCameraInput(session, input);
          break;
        default:
          throw new Error(`Unsupported input type: ${input.type}`);
      }
      
      // Generate avatar response
      if (processedInput) {
        avatarResponse = await this.generateAvatarResponse(session, processedInput);
      }
      
      // Update performance metrics
      const responseTime = Date.now() - startTime;
      session.metrics.responseTime = responseTime;
      this.updatePerformanceMetrics(sessionId, { responseTime });
      
      this.emit('userInputProcessed', {
        sessionId,
        input,
        processedInput,
        avatarResponse,
        responseTime
      });
      
      return {
        sessionId,
        processedInput,
        avatarResponse,
        responseTime
      };
      
    } catch (error) {
      console.error('Failed to process user input:', error);
      throw error;
    }
  }

  /**
   * Update avatar state (animation, emotion, etc.)
   */
  async updateAvatarState(sessionId, stateUpdate) {
    if (!this.avatarSessions.has(sessionId)) {
      throw new Error(`Avatar session not found: ${sessionId}`);
    }
    
    try {
      const session = this.avatarSessions.get(sessionId);
      
      // Update animation
      if (stateUpdate.animation) {
        await this.updateAvatarAnimation(session, stateUpdate.animation);
      }
      
      // Update emotion/expression
      if (stateUpdate.emotion) {
        await this.updateAvatarEmotion(session, stateUpdate.emotion);
      }
      
      // Update voice state
      if (stateUpdate.voiceState) {
        await this.updateVoiceState(session, stateUpdate.voiceState);
      }
      
      // Update session state
      Object.assign(session.state, stateUpdate);
      session.lastActivity = new Date().toISOString();
      
      this.emit('avatarStateUpdated', { sessionId, stateUpdate, session });
      
      return { success: true, updatedState: session.state };
      
    } catch (error) {
      console.error('Failed to update avatar state:', error);
      throw error;
    }
  }

  /**
   * End avatar session
   */
  async endAvatarSession(sessionId) {
    if (!this.avatarSessions.has(sessionId)) {
      throw new Error(`Avatar session not found: ${sessionId}`);
    }
    
    try {
      const session = this.avatarSessions.get(sessionId);
      
      // Stop all services
      await this.stopAvatarServices(session);
      
      // Clear session timeout
      if (this.sessionTimeouts.has(sessionId)) {
        clearTimeout(this.sessionTimeouts.get(sessionId));
        this.sessionTimeouts.delete(sessionId);
      }
      
      // Generate session summary
      const sessionSummary = this.generateSessionSummary(session);
      
      // Clean up session
      this.avatarSessions.delete(sessionId);
      this.performanceMetrics.delete(sessionId);
      
      // Track lifecycle event
      this.trackLifecycleEvent(sessionId, 'ended', sessionSummary);
      
      this.emit('avatarSessionEnded', { sessionId, sessionSummary });
      
      return sessionSummary;
      
    } catch (error) {
      console.error('Failed to end avatar session:', error);
      throw error;
    }
  }

  /**
   * Get avatar session status
   */
  getAvatarSessionStatus(sessionId) {
    if (!this.avatarSessions.has(sessionId)) {
      throw new Error(`Avatar session not found: ${sessionId}`);
    }
    
    const session = this.avatarSessions.get(sessionId);
    const metrics = this.performanceMetrics.get(sessionId) || {};
    
    return {
      sessionId,
      userId: session.userId,
      status: session.status,
      state: session.state,
      metrics: { ...session.metrics, ...metrics },
      uptime: Date.now() - new Date(session.createdAt).getTime(),
      lastActivity: session.lastActivity
    };
  }

  /**
   * Get all active sessions
   */
  getActiveSessions() {
    const activeSessions = [];
    
    for (const [sessionId, session] of this.avatarSessions.entries()) {
      activeSessions.push({
        sessionId,
        userId: session.userId,
        status: session.status,
        uptime: Date.now() - new Date(session.createdAt).getTime(),
        lastActivity: session.lastActivity
      });
    }
    
    return activeSessions;
  }

  /**
   * Get service health status
   */
  async getServiceHealth() {
    try {
      const healthData = {
        status: this.isInitialized ? 'healthy' : 'initializing',
        activeSessions: this.avatarSessions.size,
        maxConcurrentAvatars: this.config.maxConcurrentAvatars,
        serviceStatuses: {},
        performanceMetrics: this.getAggregatedMetrics(),
        lastHealthCheck: new Date().toISOString()
      };
      
      // Check service health
      if (this.omniverseService) {
        healthData.serviceStatuses.omniverse = await this.omniverseService.getServiceHealth();
      }
      
      if (this.rivaService) {
        healthData.serviceStatuses.riva = await this.rivaService.getServiceHealth();
      }
      
      if (this.merlinService) {
        healthData.serviceStatuses.merlin = await this.merlinService.getServiceHealth();
      }
      
      return healthData;
      
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    try {
      console.log('Shutting down Avatar Manager...');
      
      // End all active sessions
      const sessionIds = Array.from(this.avatarSessions.keys());
      for (const sessionId of sessionIds) {
        await this.endAvatarSession(sessionId);
      }
      
      // Clear intervals
      if (this.performanceInterval) {
        clearInterval(this.performanceInterval);
      }
      
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }
      
      // Clear all timeouts
      for (const timeout of this.sessionTimeouts.values()) {
        clearTimeout(timeout);
      }
      this.sessionTimeouts.clear();
      
      this.isInitialized = false;
      this.emit('shutdown');
      
      console.log('Avatar Manager shut down successfully');
      
    } catch (error) {
      console.error('Error during Avatar Manager shutdown:', error);
      throw error;
    }
  }

  // Private helper methods

  validateServices(services) {
    const required = ['omniverseService', 'rivaService', 'merlinService'];
    for (const service of required) {
      if (!services[service]) {
        throw new Error(`Missing required service: ${service}`);
      }
    }
  }

  setupServiceEventListeners() {
    // Omniverse service events
    if (this.omniverseService) {
      this.omniverseService.on('avatarCreated', (data) => {
        this.handleAvatarCreated(data);
      });
      
      this.omniverseService.on('renderingStarted', (data) => {
        this.handleRenderingStarted(data);
      });
      
      this.omniverseService.on('error', (error) => {
        this.handleServiceError('omniverse', error);
      });
    }
    
    // Riva service events
    if (this.rivaService) {
      this.rivaService.on('transcriptionResult', (data) => {
        this.handleTranscriptionResult(data);
      });
      
      this.rivaService.on('speechSynthesized', (data) => {
        this.handleSpeechSynthesized(data);
      });
      
      this.rivaService.on('error', (error) => {
        this.handleServiceError('riva', error);
      });
    }
    
    // Merlin service events
    if (this.merlinService) {
      this.merlinService.on('messageProcessed', (data) => {
        this.handleMessageProcessed(data);
      });
      
      this.merlinService.on('error', (error) => {
        this.handleServiceError('merlin', error);
      });
    }
  }

  async initializeAvatarServices(session) {
    try {
      // Create avatar
      const avatarResult = await this.omniverseService.createAvatar(session.config);
      session.services.avatar = avatarResult;
      
      // Initialize speech recognition
      const speechResult = await this.rivaService.startSpeechRecognition(
        session.sessionId,
        session.config.speechConfig
      );
      session.services.speech = speechResult;
      
      // Create conversation
      const conversationResult = await this.merlinService.createConversation(
        session.userId,
        session.config.conversationContext
      );
      session.services.conversation = conversationResult;
      
      session.status = 'ready';
      
    } catch (error) {
      session.status = 'error';
      throw error;
    }
  }

  async startAvatarRendering(session, renderConfig = {}) {
    if (!session.services.avatar) {
      throw new Error('Avatar not created');
    }
    
    const renderResult = await this.omniverseService.startRendering(
      session.services.avatar.avatarId,
      renderConfig
    );
    
    session.state.isRendering = true;
    return renderResult;
  }

  async startSpeechRecognition(session, speechConfig = {}) {
    if (!session.services.speech) {
      throw new Error('Speech service not initialized');
    }
    
    session.state.isListening = true;
    return session.services.speech;
  }

  async startConversation(session, conversationConfig = {}) {
    if (!session.services.conversation) {
      throw new Error('Conversation service not initialized');
    }
    
    session.state.conversationActive = true;
    return session.services.conversation;
  }

  async processVoiceInput(session, input) {
    const result = await this.rivaService.processSpeechStream(
      session.services.speech.streamId,
      input.audioData
    );
    
    return {
      type: 'voice',
      transcript: result.transcript,
      confidence: result.confidence,
      originalInput: input
    };
  }

  async processTextInput(session, input) {
    return {
      type: 'text',
      text: input.text,
      confidence: 1.0,
      originalInput: input
    };
  }

  async processGestureInput(session, input) {
    // Process gesture input (placeholder)
    return {
      type: 'gesture',
      gesture: input.gesture,
      confidence: input.confidence || 0.8,
      originalInput: input
    };
  }

  async processCameraInput(session, input) {
    // Process camera input for face analysis
    return {
      type: 'camera',
      faceAnalysis: input.faceAnalysis,
      confidence: input.confidence || 0.9,
      originalInput: input
    };
  }

  async generateAvatarResponse(session, processedInput) {
    try {
      // Generate conversation response
      const conversationResponse = await this.merlinService.processMessage(
        session.services.conversation.sessionId,
        { content: processedInput.text || processedInput.transcript }
      );
      
      // Generate speech synthesis
      const speechResponse = await this.rivaService.synthesizeSpeech(
        conversationResponse.response.content,
        session.config.voiceConfig
      );
      
      // Update avatar animation based on response
      await this.updateAvatarAnimation(session, {
        type: this.selectAnimationForResponse(conversationResponse),
        duration: speechResponse.duration
      });
      
      // Synchronize lip sync
      await this.omniverseService.synchronizeLipSync(
        session.services.avatar.avatarId,
        speechResponse.audioData
      );
      
      return {
        text: conversationResponse.response.content,
        audio: speechResponse.audioData,
        animation: session.state.currentAnimation,
        recommendations: conversationResponse.recommendations,
        actions: conversationResponse.actions
      };
      
    } catch (error) {
      console.error('Failed to generate avatar response:', error);
      throw error;
    }
  }

  async updateAvatarAnimation(session, animation) {
    if (!session.services.avatar) return;
    
    await this.omniverseService.playAnimation(
      session.services.avatar.avatarId,
      animation.type,
      { duration: animation.duration }
    );
    
    session.state.currentAnimation = animation.type;
  }

  async updateAvatarEmotion(session, emotion) {
    if (!session.services.avatar) return;
    
    await this.omniverseService.updateExpression(
      session.services.avatar.avatarId,
      emotion.type,
      emotion.intensity || 0.8
    );
    
    session.state.currentEmotion = emotion.type;
  }

  async updateVoiceState(session, voiceState) {
    session.state.isSpeaking = voiceState.isSpeaking || false;
    session.state.isListening = voiceState.isListening || false;
  }

  async stopAvatarServices(session) {
    try {
      // Stop rendering
      if (session.state.isRendering && session.services.avatar) {
        await this.omniverseService.stopRendering(session.services.avatar.avatarId);
      }
      
      // Stop speech recognition
      if (session.state.isListening && session.services.speech) {
        await this.rivaService.stopSpeechRecognition(session.services.speech.streamId);
      }
      
      // End conversation
      if (session.state.conversationActive && session.services.conversation) {
        await this.merlinService.endConversation(session.services.conversation.sessionId);
      }
      
      // Destroy avatar
      if (session.services.avatar) {
        await this.omniverseService.destroyAvatar(session.services.avatar.avatarId);
      }
      
    } catch (error) {
      console.error('Error stopping avatar services:', error);
    }
  }

  setupSessionTimeout(sessionId) {
    const timeout = setTimeout(() => {
      console.log(`Session timeout for ${sessionId}`);
      this.endAvatarSession(sessionId).catch(console.error);
    }, this.config.avatarTimeout);
    
    this.sessionTimeouts.set(sessionId, timeout);
  }

  trackLifecycleEvent(sessionId, event, data = {}) {
    if (!this.lifecycleEvents.has(sessionId)) {
      this.lifecycleEvents.set(sessionId, []);
    }
    
    this.lifecycleEvents.get(sessionId).push({
      event,
      timestamp: new Date().toISOString(),
      data
    });
  }

  generateSessionSummary(session) {
    const events = this.lifecycleEvents.get(session.sessionId) || [];
    const metrics = this.performanceMetrics.get(session.sessionId) || {};
    
    return {
      sessionId: session.sessionId,
      userId: session.userId,
      duration: Date.now() - new Date(session.createdAt).getTime(),
      status: session.status,
      finalState: session.state,
      metrics: { ...session.metrics, ...metrics },
      lifecycleEvents: events,
      endedAt: new Date().toISOString()
    };
  }

  sanitizeConfig(config) {
    // Remove sensitive information from config
    const sanitized = { ...config };
    delete sanitized.apiKeys;
    delete sanitized.secrets;
    return sanitized;
  }

  selectAnimationForResponse(conversationResponse) {
    const intent = conversationResponse.analysis?.intent?.intent;
    
    const animationMap = {
      'greeting': 'wave',
      'product_inquiry': 'explaining',
      'style_advice': 'pointing',
      'try_on': 'encouraging',
      'purchase': 'approving',
      'support': 'understanding'
    };
    
    return animationMap[intent] || 'explaining';
  }

  startPerformanceMonitoring() {
    this.performanceInterval = setInterval(() => {
      this.updateAllPerformanceMetrics();
    }, 5000);
  }

  startHealthChecking() {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 30000);
  }

  updatePerformanceMetrics(sessionId, metrics) {
    if (!this.performanceMetrics.has(sessionId)) {
      this.performanceMetrics.set(sessionId, {});
    }
    
    Object.assign(this.performanceMetrics.get(sessionId), metrics);
  }

  updateAllPerformanceMetrics() {
    for (const [sessionId, session] of this.avatarSessions.entries()) {
      // Update session-specific metrics
      this.updatePerformanceMetrics(sessionId, {
        uptime: Date.now() - new Date(session.createdAt).getTime(),
        lastActivity: session.lastActivity
      });
    }
  }

  async performHealthCheck() {
    try {
      const health = await this.getServiceHealth();
      
      if (health.status !== 'healthy') {
        this.emit('healthCheckFailed', health);
      }
      
    } catch (error) {
      console.error('Health check failed:', error);
      this.emit('healthCheckError', error);
    }
  }

  getAggregatedMetrics() {
    const allMetrics = Array.from(this.performanceMetrics.values());
    
    if (allMetrics.length === 0) {
      return { averageResponseTime: 0, totalSessions: 0 };
    }
    
    const avgResponseTime = allMetrics.reduce((sum, m) => sum + (m.responseTime || 0), 0) / allMetrics.length;
    
    return {
      averageResponseTime: avgResponseTime,
      totalSessions: this.avatarSessions.size,
      totalLifetimeSessions: this.lifecycleEvents.size
    };
  }

  // Event handlers
  handleAvatarCreated(data) {
    this.emit('avatarCreated', data);
  }

  handleRenderingStarted(data) {
    this.emit('renderingStarted', data);
  }

  handleTranscriptionResult(data) {
    this.emit('transcriptionResult', data);
  }

  handleSpeechSynthesized(data) {
    this.emit('speechSynthesized', data);
  }

  handleMessageProcessed(data) {
    this.emit('messageProcessed', data);
  }

  handleServiceError(serviceName, error) {
    console.error(`Service error from ${serviceName}:`, error);
    this.emit('serviceError', { serviceName, error });
  }
}

module.exports = AvatarManager;