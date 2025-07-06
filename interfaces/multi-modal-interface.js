/**
 * Multi-Modal Interface
 * 
 * This interface provides a unified API for handling multiple input modalities
 * including voice, text, camera, and gesture inputs for the AI Avatar Chat System.
 * 
 * @author Commerce Studio AI Team
 * @version 1.0.0
 */

const EventEmitter = require('events');
const crypto = require('crypto');

class MultiModalInterface extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      enabledModalities: config.enabledModalities || ['voice', 'text', 'camera', 'gesture'],
      inputTimeout: config.inputTimeout || 30000, // 30 seconds
      gestureThreshold: config.gestureThreshold || 0.7,
      voiceActivationThreshold: config.voiceActivationThreshold || 0.6,
      cameraFrameRate: config.cameraFrameRate || 30,
      maxConcurrentInputs: config.maxConcurrentInputs || 5,
      ...config
    };
    
    this.isInitialized = false;
    this.activeInputStreams = new Map();
    this.inputProcessors = new Map();
    this.modalityStates = new Map();
    
    // Input processing queues
    this.voiceQueue = [];
    this.textQueue = [];
    this.cameraQueue = [];
    this.gestureQueue = [];
    
    // Performance metrics
    this.performanceMetrics = {
      inputLatency: new Map(),
      processingTime: new Map(),
      accuracyScores: new Map(),
      modalityUsage: new Map()
    };
    
    // Service dependencies
    this.avatarManager = null;
    this.faceAnalysisService = null;
    this.cameraInterface = null;
    
    // Processing intervals
    this.processingInterval = null;
    this.metricsInterval = null;
  }

  /**
   * Initialize the Multi-Modal Interface
   */
  async initialize(dependencies = {}) {
    try {
      console.log('Initializing Multi-Modal Interface...');
      
      // Validate dependencies
      this.validateDependencies(dependencies);
      this.avatarManager = dependencies.avatarManager;
      this.faceAnalysisService = dependencies.faceAnalysisService;
      this.cameraInterface = dependencies.cameraInterface;
      
      // Initialize modality processors
      await this.initializeModalityProcessors();
      
      // Set up input stream handlers
      this.setupInputStreamHandlers();
      
      // Start processing loops
      this.startProcessingLoops();
      
      // Initialize performance monitoring
      this.startPerformanceMonitoring();
      
      this.isInitialized = true;
      this.emit('initialized');
      
      console.log('Multi-Modal Interface initialized successfully');
      return { success: true, message: 'Multi-Modal Interface initialized' };
      
    } catch (error) {
      console.error('Failed to initialize Multi-Modal Interface:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Start input capture for specified modalities
   */
  async startInputCapture(sessionId, modalities = this.config.enabledModalities) {
    if (!this.isInitialized) {
      throw new Error('Multi-Modal Interface not initialized');
    }
    
    try {
      const inputStreamId = crypto.randomUUID();
      
      const inputStream = {
        id: inputStreamId,
        sessionId,
        modalities: modalities.filter(m => this.config.enabledModalities.includes(m)),
        status: 'active',
        startedAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        inputCount: 0,
        activeCaptures: new Set()
      };
      
      this.activeInputStreams.set(inputStreamId, inputStream);
      
      // Start capture for each modality
      for (const modality of inputStream.modalities) {
        await this.startModalityCapture(inputStreamId, modality);
      }
      
      this.emit('inputCaptureStarted', { inputStreamId, sessionId, modalities });
      
      return {
        inputStreamId,
        sessionId,
        activeModalities: inputStream.modalities,
        status: 'active'
      };
      
    } catch (error) {
      console.error('Failed to start input capture:', error);
      throw error;
    }
  }

  /**
   * Process voice input
   */
  async processVoiceInput(inputStreamId, audioData, options = {}) {
    if (!this.activeInputStreams.has(inputStreamId)) {
      throw new Error(`Input stream not found: ${inputStreamId}`);
    }
    
    try {
      const startTime = Date.now();
      const inputId = crypto.randomUUID();
      
      const voiceInput = {
        id: inputId,
        streamId: inputStreamId,
        type: 'voice',
        audioData,
        timestamp: new Date().toISOString(),
        options: {
          language: options.language || 'en-US',
          enableNoiseReduction: options.enableNoiseReduction !== false,
          confidenceThreshold: options.confidenceThreshold || this.config.voiceActivationThreshold,
          ...options
        },
        status: 'processing'
      };
      
      // Add to voice processing queue
      this.voiceQueue.push(voiceInput);
      
      // Update stream activity
      const stream = this.activeInputStreams.get(inputStreamId);
      stream.lastActivity = new Date().toISOString();
      stream.inputCount++;
      
      // Process voice input
      const processedInput = await this.processVoiceData(voiceInput);
      
      // Update performance metrics
      const processingTime = Date.now() - startTime;
      this.updatePerformanceMetrics('voice', processingTime, processedInput.confidence);
      
      this.emit('voiceInputProcessed', {
        inputId,
        streamId: inputStreamId,
        processedInput,
        processingTime
      });
      
      return {
        inputId,
        type: 'voice',
        processedInput,
        processingTime,
        confidence: processedInput.confidence
      };
      
    } catch (error) {
      console.error('Failed to process voice input:', error);
      throw error;
    }
  }

  /**
   * Process text input
   */
  async processTextInput(inputStreamId, text, options = {}) {
    if (!this.activeInputStreams.has(inputStreamId)) {
      throw new Error(`Input stream not found: ${inputStreamId}`);
    }
    
    try {
      const startTime = Date.now();
      const inputId = crypto.randomUUID();
      
      const textInput = {
        id: inputId,
        streamId: inputStreamId,
        type: 'text',
        text: text.trim(),
        timestamp: new Date().toISOString(),
        options: {
          language: options.language || 'en',
          enableSpellCheck: options.enableSpellCheck !== false,
          enableAutoCorrect: options.enableAutoCorrect !== false,
          ...options
        },
        status: 'processing'
      };
      
      // Add to text processing queue
      this.textQueue.push(textInput);
      
      // Update stream activity
      const stream = this.activeInputStreams.get(inputStreamId);
      stream.lastActivity = new Date().toISOString();
      stream.inputCount++;
      
      // Process text input
      const processedInput = await this.processTextData(textInput);
      
      // Update performance metrics
      const processingTime = Date.now() - startTime;
      this.updatePerformanceMetrics('text', processingTime, processedInput.confidence);
      
      this.emit('textInputProcessed', {
        inputId,
        streamId: inputStreamId,
        processedInput,
        processingTime
      });
      
      return {
        inputId,
        type: 'text',
        processedInput,
        processingTime,
        confidence: processedInput.confidence
      };
      
    } catch (error) {
      console.error('Failed to process text input:', error);
      throw error;
    }
  }

  /**
   * Process camera input
   */
  async processCameraInput(inputStreamId, imageData, options = {}) {
    if (!this.activeInputStreams.has(inputStreamId)) {
      throw new Error(`Input stream not found: ${inputStreamId}`);
    }
    
    try {
      const startTime = Date.now();
      const inputId = crypto.randomUUID();
      
      const cameraInput = {
        id: inputId,
        streamId: inputStreamId,
        type: 'camera',
        imageData,
        timestamp: new Date().toISOString(),
        options: {
          enableFaceDetection: options.enableFaceDetection !== false,
          enableFaceAnalysis: options.enableFaceAnalysis !== false,
          enableGestureDetection: options.enableGestureDetection !== false,
          analysisType: options.analysisType || 'face_shape',
          ...options
        },
        status: 'processing'
      };
      
      // Add to camera processing queue
      this.cameraQueue.push(cameraInput);
      
      // Update stream activity
      const stream = this.activeInputStreams.get(inputStreamId);
      stream.lastActivity = new Date().toISOString();
      stream.inputCount++;
      
      // Process camera input
      const processedInput = await this.processCameraData(cameraInput);
      
      // Update performance metrics
      const processingTime = Date.now() - startTime;
      this.updatePerformanceMetrics('camera', processingTime, processedInput.confidence);
      
      this.emit('cameraInputProcessed', {
        inputId,
        streamId: inputStreamId,
        processedInput,
        processingTime
      });
      
      return {
        inputId,
        type: 'camera',
        processedInput,
        processingTime,
        confidence: processedInput.confidence
      };
      
    } catch (error) {
      console.error('Failed to process camera input:', error);
      throw error;
    }
  }

  /**
   * Process gesture input
   */
  async processGestureInput(inputStreamId, gestureData, options = {}) {
    if (!this.activeInputStreams.has(inputStreamId)) {
      throw new Error(`Input stream not found: ${inputStreamId}`);
    }
    
    try {
      const startTime = Date.now();
      const inputId = crypto.randomUUID();
      
      const gestureInput = {
        id: inputId,
        streamId: inputStreamId,
        type: 'gesture',
        gestureData,
        timestamp: new Date().toISOString(),
        options: {
          gestureType: options.gestureType || 'hand',
          confidenceThreshold: options.confidenceThreshold || this.config.gestureThreshold,
          enableContinuousTracking: options.enableContinuousTracking !== false,
          ...options
        },
        status: 'processing'
      };
      
      // Add to gesture processing queue
      this.gestureQueue.push(gestureInput);
      
      // Update stream activity
      const stream = this.activeInputStreams.get(inputStreamId);
      stream.lastActivity = new Date().toISOString();
      stream.inputCount++;
      
      // Process gesture input
      const processedInput = await this.processGestureData(gestureInput);
      
      // Update performance metrics
      const processingTime = Date.now() - startTime;
      this.updatePerformanceMetrics('gesture', processingTime, processedInput.confidence);
      
      this.emit('gestureInputProcessed', {
        inputId,
        streamId: inputStreamId,
        processedInput,
        processingTime
      });
      
      return {
        inputId,
        type: 'gesture',
        processedInput,
        processingTime,
        confidence: processedInput.confidence
      };
      
    } catch (error) {
      console.error('Failed to process gesture input:', error);
      throw error;
    }
  }

  /**
   * Process multi-modal input (combination of modalities)
   */
  async processMultiModalInput(inputStreamId, inputs) {
    if (!this.activeInputStreams.has(inputStreamId)) {
      throw new Error(`Input stream not found: ${inputStreamId}`);
    }
    
    try {
      const startTime = Date.now();
      const multiModalId = crypto.randomUUID();
      
      const processedInputs = [];
      
      // Process each input type
      for (const input of inputs) {
        let processedInput = null;
        
        switch (input.type) {
          case 'voice':
            processedInput = await this.processVoiceInput(inputStreamId, input.data, input.options);
            break;
          case 'text':
            processedInput = await this.processTextInput(inputStreamId, input.data, input.options);
            break;
          case 'camera':
            processedInput = await this.processCameraInput(inputStreamId, input.data, input.options);
            break;
          case 'gesture':
            processedInput = await this.processGestureInput(inputStreamId, input.data, input.options);
            break;
          default:
            console.warn(`Unsupported input type: ${input.type}`);
            continue;
        }
        
        if (processedInput) {
          processedInputs.push(processedInput);
        }
      }
      
      // Combine and correlate inputs
      const combinedInput = await this.combineMultiModalInputs(processedInputs);
      
      // Update performance metrics
      const processingTime = Date.now() - startTime;
      this.updatePerformanceMetrics('multimodal', processingTime, combinedInput.confidence);
      
      this.emit('multiModalInputProcessed', {
        multiModalId,
        streamId: inputStreamId,
        combinedInput,
        individualInputs: processedInputs,
        processingTime
      });
      
      return {
        multiModalId,
        type: 'multimodal',
        combinedInput,
        individualInputs: processedInputs,
        processingTime
      };
      
    } catch (error) {
      console.error('Failed to process multi-modal input:', error);
      throw error;
    }
  }

  /**
   * Stop input capture
   */
  async stopInputCapture(inputStreamId) {
    if (!this.activeInputStreams.has(inputStreamId)) {
      throw new Error(`Input stream not found: ${inputStreamId}`);
    }
    
    try {
      const stream = this.activeInputStreams.get(inputStreamId);
      
      // Stop capture for each active modality
      for (const modality of stream.activeCaptures) {
        await this.stopModalityCapture(inputStreamId, modality);
      }
      
      // Generate stream summary
      const streamSummary = this.generateStreamSummary(stream);
      
      // Clean up stream
      this.activeInputStreams.delete(inputStreamId);
      
      this.emit('inputCaptureStopped', { inputStreamId, streamSummary });
      
      return streamSummary;
      
    } catch (error) {
      console.error('Failed to stop input capture:', error);
      throw error;
    }
  }

  /**
   * Get input stream status
   */
  getInputStreamStatus(inputStreamId) {
    if (!this.activeInputStreams.has(inputStreamId)) {
      throw new Error(`Input stream not found: ${inputStreamId}`);
    }
    
    const stream = this.activeInputStreams.get(inputStreamId);
    
    return {
      inputStreamId,
      sessionId: stream.sessionId,
      status: stream.status,
      modalities: stream.modalities,
      activeCaptures: Array.from(stream.activeCaptures),
      inputCount: stream.inputCount,
      uptime: Date.now() - new Date(stream.startedAt).getTime(),
      lastActivity: stream.lastActivity
    };
  }

  /**
   * Get service health status
   */
  async getServiceHealth() {
    try {
      const healthData = {
        status: this.isInitialized ? 'healthy' : 'initializing',
        activeInputStreams: this.activeInputStreams.size,
        enabledModalities: this.config.enabledModalities,
        queueSizes: {
          voice: this.voiceQueue.length,
          text: this.textQueue.length,
          camera: this.cameraQueue.length,
          gesture: this.gestureQueue.length
        },
        performanceMetrics: this.getAggregatedMetrics(),
        lastHealthCheck: new Date().toISOString()
      };
      
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
      console.log('Shutting down Multi-Modal Interface...');
      
      // Stop all active input streams
      const streamIds = Array.from(this.activeInputStreams.keys());
      for (const streamId of streamIds) {
        await this.stopInputCapture(streamId);
      }
      
      // Clear processing intervals
      if (this.processingInterval) {
        clearInterval(this.processingInterval);
      }
      
      if (this.metricsInterval) {
        clearInterval(this.metricsInterval);
      }
      
      // Clear processing queues
      this.voiceQueue.length = 0;
      this.textQueue.length = 0;
      this.cameraQueue.length = 0;
      this.gestureQueue.length = 0;
      
      this.isInitialized = false;
      this.emit('shutdown');
      
      console.log('Multi-Modal Interface shut down successfully');
      
    } catch (error) {
      console.error('Error during Multi-Modal Interface shutdown:', error);
      throw error;
    }
  }

  // Private helper methods

  validateDependencies(dependencies) {
    const required = ['avatarManager'];
    for (const dep of required) {
      if (!dependencies[dep]) {
        throw new Error(`Missing required dependency: ${dep}`);
      }
    }
  }

  async initializeModalityProcessors() {
    // Initialize processors for each enabled modality
    for (const modality of this.config.enabledModalities) {
      this.modalityStates.set(modality, {
        status: 'ready',
        lastActivity: new Date().toISOString(),
        processedCount: 0,
        errorCount: 0
      });
    }
  }

  setupInputStreamHandlers() {
    // Set up event handlers for input streams
    this.on('voiceInputProcessed', this.handleProcessedInput.bind(this));
    this.on('textInputProcessed', this.handleProcessedInput.bind(this));
    this.on('cameraInputProcessed', this.handleProcessedInput.bind(this));
    this.on('gestureInputProcessed', this.handleProcessedInput.bind(this));
  }

  startProcessingLoops() {
    this.processingInterval = setInterval(() => {
      this.processInputQueues();
    }, 100); // Process every 100ms
  }

  startPerformanceMonitoring() {
    this.metricsInterval = setInterval(() => {
      this.updateAggregatedMetrics();
    }, 5000); // Update every 5 seconds
  }

  async startModalityCapture(inputStreamId, modality) {
    const stream = this.activeInputStreams.get(inputStreamId);
    
    switch (modality) {
      case 'voice':
        // Initialize voice capture
        stream.activeCaptures.add('voice');
        break;
      case 'text':
        // Text input is always ready
        stream.activeCaptures.add('text');
        break;
      case 'camera':
        // Initialize camera capture
        if (this.cameraInterface) {
          await this.cameraInterface.startCapture();
        }
        stream.activeCaptures.add('camera');
        break;
      case 'gesture':
        // Initialize gesture capture
        stream.activeCaptures.add('gesture');
        break;
    }
  }

  async stopModalityCapture(inputStreamId, modality) {
    const stream = this.activeInputStreams.get(inputStreamId);
    
    switch (modality) {
      case 'camera':
        if (this.cameraInterface) {
          await this.cameraInterface.stopCapture();
        }
        break;
    }
    
    stream.activeCaptures.delete(modality);
  }

  async processVoiceData(voiceInput) {
    // Process voice input using avatar manager's speech service
    try {
      const result = {
        transcript: 'Sample transcript', // Placeholder
        confidence: 0.9,
        language: voiceInput.options.language,
        duration: voiceInput.audioData.duration || 1000,
        processedAt: new Date().toISOString()
      };
      
      voiceInput.status = 'completed';
      return result;
      
    } catch (error) {
      voiceInput.status = 'error';
      throw error;
    }
  }

  async processTextData(textInput) {
    // Process text input
    try {
      const result = {
        text: textInput.text,
        confidence: 1.0,
        language: textInput.options.language,
        wordCount: textInput.text.split(' ').length,
        processedAt: new Date().toISOString()
      };
      
      textInput.status = 'completed';
      return result;
      
    } catch (error) {
      textInput.status = 'error';
      throw error;
    }
  }

  async processCameraData(cameraInput) {
    // Process camera input using face analysis service
    try {
      let result = {
        confidence: 0.8,
        processedAt: new Date().toISOString()
      };
      
      if (cameraInput.options.enableFaceAnalysis && this.faceAnalysisService) {
        const faceAnalysis = await this.faceAnalysisService.analyzeFace(cameraInput.imageData);
        result.faceAnalysis = faceAnalysis;
        result.confidence = faceAnalysis.confidence || 0.8;
      }
      
      if (cameraInput.options.enableGestureDetection) {
        result.gestures = await this.detectGestures(cameraInput.imageData);
      }
      
      cameraInput.status = 'completed';
      return result;
      
    } catch (error) {
      cameraInput.status = 'error';
      throw error;
    }
  }

  async processGestureData(gestureInput) {
    // Process gesture input
    try {
      const result = {
        gesture: gestureInput.gestureData.type || 'unknown',
        confidence: gestureInput.gestureData.confidence || 0.7,
        coordinates: gestureInput.gestureData.coordinates,
        processedAt: new Date().toISOString()
      };
      
      gestureInput.status = 'completed';
      return result;
      
    } catch (error) {
      gestureInput.status = 'error';
      throw error;
    }
  }

  async combineMultiModalInputs(processedInputs) {
    // Combine multiple input modalities into a unified input
    const combined = {
      modalities: processedInputs.map(input => input.type),
      confidence: this.calculateCombinedConfidence(processedInputs),
      primaryInput: this.determinePrimaryInput(processedInputs),
      contextualData: this.extractContextualData(processedInputs),
      combinedAt: new Date().toISOString()
    };
    
    return combined;
  }

  calculateCombinedConfidence(inputs) {
    if (inputs.length === 0) return 0;
    
    // Weighted average based on input type reliability
    const weights = { voice: 0.8, text: 1.0, camera: 0.9, gesture: 0.7 };
    let totalWeight = 0;
    let weightedSum = 0;
    
    inputs.forEach(input => {
      const weight = weights[input.type] || 0.5;
      weightedSum += input.confidence * weight;
      totalWeight += weight;
    });
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  determinePrimaryInput(inputs) {
    // Determine which input should be considered primary
    const priorities = { text: 4, voice: 3, camera: 2, gesture: 1 };
    
    return inputs.reduce((primary, input) => {
      const currentPriority = priorities[input.type] || 0;
      const primaryPriority = priorities[primary?.type] || 0;
      
      return currentPriority > primaryPriority ? input : primary;
    }, null);
  }

  extractContextualData(inputs) {
    // Extract contextual information from all inputs
    const context = {};
    
    inputs.forEach(input => {
      if (input.type === 'camera' && input.processedInput.faceAnalysis) {
        context.faceAnalysis = input.processedInput.faceAnalysis;
      }
      
      if (input.type === 'gesture') {
        context.gestureData = input.processedInput;
      }
      
      if (input.type === 'voice') {
        context.speechData = input.processedInput;
      }
    });
    
    return context;
  }

  async detectGestures(imageData) {
    // Placeholder for gesture detection
    return [];
  }

  processInputQueues() {
    // Process queued inputs (placeholder for batch processing)
    // This would handle any queued inputs that need batch processing
  }

  updatePerformanceMetrics(modality, processingTime, confidence) {
    if (!this.performanceMetrics.inputLatency.has(modality)) {
      this.performanceMetrics.inputLatency.set(modality, []);
      this.performanceMetrics.processingTime.set(modality, []);
      this.performanceMetrics.accuracyScores.set(modality, []);
      this.performanceMetrics.modalityUsage.set(modality, 0);
    }
    
    this.performanceMetrics.processingTime.get(modality).push(processingTime);
    this.performanceMetrics.accuracyScores.get(modality).push(confidence);
    this.performanceMetrics.modalityUsage.set(modality, 
      this.performanceMetrics.modalityUsage.get(modality) + 1
    );
    
    // Keep only last 100 measurements
    if (this.performanceMetrics.processingTime.get(modality).length > 100) {
      this.performanceMetrics.processingTime.get(modality).shift();
      this.performanceMetrics.accuracyScores.get(modality).shift();
    }
  }

  updateAggregatedMetrics() {
    // Update aggregated performance metrics
    for (const modality of this.config.enabledModalities) {
      const state = this.modalityStates.get(modality);
      if (state) {
        state.lastActivity = new Date().toISOString();
      }
    }
  }

  getAggregatedMetrics() {
    const metrics = {};
    
    for (const [modality, times] of this.performanceMetrics.processingTime.entries()) {
      if (times.length > 0) {
        metrics[modality] = {
          averageProcessingTime: times.reduce((sum, time) => sum + time, 0) / times.length,
          averageAccuracy: this.performanceMetrics.accuracyScores.get(modality)
            .reduce((sum, score) => sum + score, 0) / times.length,
          usageCount: this.performanceMetrics.modalityUsage.get(modality)
        };
      }
    }
    
    return metrics;
  }

  generateStreamSummary(stream) {
    return {
      inputStreamId: stream.id,
      sessionId: stream.sessionId,
      duration: Date.now() - new Date(stream.startedAt).getTime(),
      inputCount: stream.inputCount,
      modalities: stream.modalities,
      endedAt: new Date().toISOString()
    };
  }

  handleProcessedInput(data) {
    // Forward processed input to avatar manager
    if (this.avatarManager) {
      this.avatarManager.processUserInput(data.streamId, {
        type: data.type,
        data: data.processedInput,
        confidence: data.confidence,
        processingTime: data.processingTime
      }).catch(error => {
        console.error('Failed to forward input to avatar manager:', error);
      });
    }
  }
}

module.exports = MultiModalInterface;