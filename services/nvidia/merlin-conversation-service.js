/**
 * NVIDIA Merlin Conversational AI Service
 * 
 * This service provides intelligent conversation capabilities with
 * eyewear domain expertise for personalized shopping assistance.
 * 
 * @author Commerce Studio AI Team
 * @version 1.0.0
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';
import fetch from 'node-fetch';

class MerlinConversationalService extends EventEmitter {
  constructor(config = {}) {
    super();
    
    // Handle both camelCase and snake_case property names from YAML config
    const normalizedConfig = {
      endpoint: config.endpoint || config.url || 'https://api.merlin.nvidia.com/v1',
      apiKey: config.apiKey || config.api_key || 'iulzg9oedq-60se7t722e-dpxw5krfwk',
      modelId: config.modelId || config.model || 'merlin-eyewear-specialist-v1',
      deploymentId: config.deploymentId || config.deployment_id || 'commerce-studio-deployment',
      timeout: config.timeout || 30000,
      retryAttempts: config.retryAttempts || 3,
      ...config
    };
    
    this.config = normalizedConfig;
    
    this.isInitialized = false;
    this.activeConversations = new Map();
    this.userProfiles = new Map();
    this.conversationHistory = new Map();
    
    // Performance metrics
    this.performanceMetrics = {
      responseLatency: 0,
      conversationQuality: 0,
      userSatisfaction: 0,
      accuracyScore: 0
    };
    
    // Authentication
    this.authToken = null;
    this.tokenExpiry = null;
    
    // Eyewear domain knowledge base
    this.knowledgeBase = this.initializeKnowledgeBase();
    
    // Intent classification mappings
    this.intentMappings = {
      'greeting': ['hello', 'hi', 'hey', 'good morning', 'good afternoon'],
      'product_inquiry': ['show me', 'looking for', 'need', 'want', 'find'],
      'style_advice': ['what looks good', 'recommend', 'suggest', 'style', 'fashion'],
      'face_analysis': ['face shape', 'what suits me', 'analyze my face'],
      'try_on': ['try on', 'virtual try', 'see how it looks'],
      'price_inquiry': ['cost', 'price', 'how much', 'expensive', 'budget'],
      'brand_inquiry': ['brand', 'designer', 'make', 'manufacturer'],
      'technical_specs': ['prescription', 'lens', 'material', 'size'],
      'purchase': ['buy', 'purchase', 'order', 'checkout', 'cart'],
      'support': ['help', 'problem', 'issue', 'support', 'assistance']
    };
    
    // Personality configuration
    this.personality = {
      warmth: 0.8,
      professionalism: 0.9,
      enthusiasm: 0.7,
      empathy: 0.8,
      confidence: 0.8,
      patience: 0.9,
      creativity: 0.6,
      humor: 0.3
    };
  }

  /**
   * Initialize the Merlin Conversational Service
   */
  async initialize() {
    try {
      console.log('Initializing NVIDIA Merlin Conversational Service...');
      
      // Validate configuration
      this.validateConfiguration();
      
      // Authenticate with NVIDIA services
      await this.authenticate();
      
      // Load conversation models
      await this.loadConversationModels();
      
      // Initialize knowledge base
      await this.initializeEyewearKnowledge();
      
      // Start performance monitoring
      this.startPerformanceMonitoring();
      
      this.isInitialized = true;
      this.emit('initialized');
      
      console.log('NVIDIA Merlin Conversational Service initialized successfully');
      return { success: true, message: 'Service initialized' };
      
    } catch (error) {
      console.error('Failed to initialize Merlin Conversational Service:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Create a new conversation session
   */
  async createConversation(userId, context = {}) {
    if (!this.isInitialized) {
      throw new Error('Service not initialized');
    }
    
    try {
      const sessionId = crypto.randomUUID();
      
      // Load or create user profile
      const userProfile = await this.getUserProfile(userId);
      
      const conversation = {
        sessionId,
        userId,
        userProfile,
        context: {
          platform: context.platform || 'web',
          deviceType: context.deviceType || 'desktop',
          location: context.location,
          previousPurchases: userProfile.purchaseHistory || [],
          preferences: userProfile.preferences || {},
          faceAnalysis: context.faceAnalysis,
          currentProducts: context.currentProducts || [],
          ...context
        },
        messages: [],
        state: {
          currentIntent: null,
          entities: {},
          recommendations: [],
          conversationStage: 'greeting',
          userSatisfaction: 'unknown',
          needsAssessment: {}
        },
        metadata: {
          startedAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          messageCount: 0,
          averageResponseTime: 0
        }
      };
      
      this.activeConversations.set(sessionId, conversation);
      
      // Generate welcome message
      const welcomeMessage = await this.generateWelcomeMessage(conversation);
      
      this.emit('conversationCreated', { sessionId, userId, welcomeMessage });
      
      return {
        sessionId,
        welcomeMessage,
        context: conversation.context,
        userProfile: this.sanitizeUserProfile(userProfile)
      };
      
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  }

  /**
   * Process user message and generate AI response
   */
  async processMessage(sessionId, message) {
    if (!this.activeConversations.has(sessionId)) {
      throw new Error(`Conversation not found: ${sessionId}`);
    }
    
    try {
      const conversation = this.activeConversations.get(sessionId);
      const startTime = Date.now();
      
      // Add user message to conversation
      const userMessage = {
        id: crypto.randomUUID(),
        type: 'user',
        content: message.text || message.content,
        timestamp: new Date().toISOString(),
        metadata: {
          inputMethod: message.inputMethod || 'text',
          confidence: message.confidence || 1.0
        }
      };
      
      conversation.messages.push(userMessage);
      
      // Classify intent
      const intentAnalysis = await this.classifyIntent(userMessage.content, conversation.context);
      
      // Extract entities
      const entityExtraction = await this.extractEntities(userMessage.content, conversation.context);
      
      // Analyze sentiment
      const sentimentAnalysis = await this.analyzeSentiment(userMessage.content);
      
      // Update conversation state
      conversation.state.currentIntent = intentAnalysis.intent;
      conversation.state.entities = { ...conversation.state.entities, ...entityExtraction.entities };
      conversation.state.userSatisfaction = sentimentAnalysis.satisfactionLevel;
      
      // Generate contextual response
      const aiResponse = await this.generateResponse(conversation, {
        intent: intentAnalysis,
        entities: entityExtraction,
        sentiment: sentimentAnalysis
      });
      
      // Add AI response to conversation
      const responseMessage = {
        id: crypto.randomUUID(),
        type: 'assistant',
        content: aiResponse.text,
        timestamp: new Date().toISOString(),
        metadata: {
          intent: intentAnalysis.intent,
          confidence: aiResponse.confidence,
          responseTime: Date.now() - startTime,
          recommendations: aiResponse.recommendations || [],
          actions: aiResponse.actions || []
        }
      };
      
      conversation.messages.push(responseMessage);
      
      // Update conversation metadata
      conversation.metadata.lastActivity = new Date().toISOString();
      conversation.metadata.messageCount += 2;
      conversation.metadata.averageResponseTime = this.calculateAverageResponseTime(conversation);
      
      // Update user profile based on interaction
      await this.updateUserProfile(conversation.userId, {
        intent: intentAnalysis,
        entities: entityExtraction,
        preferences: this.extractPreferences(userMessage.content, entityExtraction)
      });
      
      this.emit('messageProcessed', {
        sessionId,
        userMessage,
        aiResponse: responseMessage,
        analysis: { intent: intentAnalysis, entities: entityExtraction, sentiment: sentimentAnalysis }
      });
      
      return {
        response: responseMessage,
        analysis: {
          intent: intentAnalysis,
          entities: entityExtraction,
          sentiment: sentimentAnalysis
        },
        recommendations: aiResponse.recommendations || [],
        actions: aiResponse.actions || []
      };
      
    } catch (error) {
      console.error('Failed to process message:', error);
      throw error;
    }
  }

  /**
   * Update conversation context
   */
  async updateContext(sessionId, contextUpdate) {
    if (!this.activeConversations.has(sessionId)) {
      throw new Error(`Conversation not found: ${sessionId}`);
    }
    
    try {
      const conversation = this.activeConversations.get(sessionId);
      
      // Merge context updates
      conversation.context = {
        ...conversation.context,
        ...contextUpdate,
        updatedAt: new Date().toISOString()
      };
      
      // Update conversation state based on new context
      if (contextUpdate.faceAnalysis) {
        conversation.state.needsAssessment.faceShape = contextUpdate.faceAnalysis.faceShape;
        conversation.state.recommendations = await this.generateRecommendations(
          conversation.userProfile,
          conversation.context
        );
      }
      
      this.emit('contextUpdated', { sessionId, contextUpdate });
      
      return { success: true, updatedContext: conversation.context };
      
    } catch (error) {
      console.error('Failed to update context:', error);
      throw error;
    }
  }

  /**
   * End conversation and generate summary
   */
  async endConversation(sessionId) {
    if (!this.activeConversations.has(sessionId)) {
      throw new Error(`Conversation not found: ${sessionId}`);
    }
    
    try {
      const conversation = this.activeConversations.get(sessionId);
      
      // Generate conversation summary
      const summary = {
        sessionId,
        userId: conversation.userId,
        duration: Date.now() - new Date(conversation.metadata.startedAt).getTime(),
        messageCount: conversation.metadata.messageCount,
        averageResponseTime: conversation.metadata.averageResponseTime,
        primaryIntents: this.extractPrimaryIntents(conversation.messages),
        identifiedNeeds: conversation.state.needsAssessment,
        recommendations: conversation.state.recommendations,
        userSatisfaction: conversation.state.userSatisfaction,
        outcomes: this.analyzeConversationOutcomes(conversation),
        endedAt: new Date().toISOString()
      };
      
      // Store conversation history
      this.conversationHistory.set(sessionId, {
        ...conversation,
        summary,
        endedAt: new Date().toISOString()
      });
      
      // Update user profile with conversation insights
      await this.updateUserProfileFromConversation(conversation.userId, conversation);
      
      // Clean up active conversation
      this.activeConversations.delete(sessionId);
      
      this.emit('conversationEnded', { sessionId, summary });
      
      return summary;
      
    } catch (error) {
      console.error('Failed to end conversation:', error);
      throw error;
    }
  }

  /**
   * Classify user intent
   */
  async classifyIntent(message, context = {}) {
    try {
      const messageLower = message.toLowerCase();
      
      // Rule-based intent classification with context awareness
      let intent = 'general_inquiry';
      let confidence = 0.5;
      
      for (const [intentType, keywords] of Object.entries(this.intentMappings)) {
        const matchCount = keywords.filter(keyword => messageLower.includes(keyword)).length;
        if (matchCount > 0) {
          const newConfidence = Math.min(0.9, 0.6 + (matchCount * 0.1));
          if (newConfidence > confidence) {
            intent = intentType;
            confidence = newConfidence;
          }
        }
      }
      
      // Context-based intent refinement
      if (context.faceAnalysis && messageLower.includes('recommend')) {
        intent = 'style_advice';
        confidence = Math.max(confidence, 0.8);
      }
      
      if (context.currentProducts && context.currentProducts.length > 0) {
        if (messageLower.includes('this') || messageLower.includes('these')) {
          intent = 'product_inquiry';
          confidence = Math.max(confidence, 0.8);
        }
      }
      
      return {
        intent,
        confidence,
        alternatives: this.getAlternativeIntents(messageLower),
        contextFactors: this.analyzeContextFactors(message, context)
      };
      
    } catch (error) {
      console.error('Failed to classify intent:', error);
      return { intent: 'general_inquiry', confidence: 0.3, alternatives: [] };
    }
  }

  /**
   * Extract entities from user message
   */
  async extractEntities(message, context = {}) {
    try {
      const entities = {};
      const messageLower = message.toLowerCase();
      
      // Extract eyewear-specific entities
      entities.frameTypes = this.extractFrameTypes(messageLower);
      entities.brands = this.extractBrands(messageLower);
      entities.colors = this.extractColors(messageLower);
      entities.materials = this.extractMaterials(messageLower);
      entities.faceShapes = this.extractFaceShapes(messageLower);
      entities.priceRange = this.extractPriceRange(messageLower);
      entities.features = this.extractFeatures(messageLower);
      
      // Extract general entities
      entities.numbers = this.extractNumbers(messageLower);
      entities.preferences = this.extractPreferences(messageLower);
      
      return {
        entities,
        confidence: this.calculateEntityConfidence(entities),
        extractedAt: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Failed to extract entities:', error);
      return { entities: {}, confidence: 0.0 };
    }
  }

  /**
   * Generate personalized product recommendations
   */
  async generateRecommendations(userProfile, context) {
    try {
      const recommendations = [];
      
      // Face shape based recommendations
      if (context.faceAnalysis && context.faceAnalysis.faceShape) {
        const faceShapeRecs = this.knowledgeBase.faceShapeRecommendations[context.faceAnalysis.faceShape];
        if (faceShapeRecs) {
          recommendations.push(...faceShapeRecs.frameShapes.map(shape => ({
            type: 'face_shape_match',
            frameShape: shape,
            reason: faceShapeRecs.reasoning,
            confidence: 0.8
          })));
        }
      }
      
      // Style preference based recommendations
      if (userProfile.preferences && userProfile.preferences.style) {
        const styleRecs = this.getStyleRecommendations(userProfile.preferences.style);
        recommendations.push(...styleRecs);
      }
      
      // Brand preference based recommendations
      if (userProfile.preferences && userProfile.preferences.brands) {
        const brandRecs = this.getBrandRecommendations(userProfile.preferences.brands);
        recommendations.push(...brandRecs);
      }
      
      // Budget based filtering
      if (userProfile.preferences && userProfile.preferences.priceRange) {
        return this.filterByPriceRange(recommendations, userProfile.preferences.priceRange);
      }
      
      return recommendations.slice(0, 5); // Return top 5 recommendations
      
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      return [];
    }
  }

  /**
   * Generate contextual AI response
   */
  async generateResponse(conversation, analysis) {
    try {
      const { intent, entities, sentiment } = analysis;
      
      let responseText = '';
      let confidence = 0.8;
      let recommendations = [];
      let actions = [];
      
      switch (intent.intent) {
        case 'greeting':
          responseText = this.generateGreetingResponse(conversation);
          break;
          
        case 'product_inquiry':
          const productResponse = await this.generateProductInquiryResponse(conversation, entities);
          responseText = productResponse.text;
          recommendations = productResponse.recommendations;
          actions = productResponse.actions;
          break;
          
        case 'style_advice':
          const styleResponse = await this.generateStyleAdviceResponse(conversation, entities);
          responseText = styleResponse.text;
          recommendations = styleResponse.recommendations;
          break;
          
        case 'face_analysis':
          responseText = this.generateFaceAnalysisResponse(conversation);
          actions = [{ type: 'trigger_face_analysis', priority: 'high' }];
          break;
          
        case 'try_on':
          responseText = this.generateTryOnResponse(conversation);
          actions = [{ type: 'trigger_virtual_try_on', priority: 'high' }];
          break;
          
        case 'price_inquiry':
          responseText = this.generatePriceInquiryResponse(conversation, entities);
          break;
          
        case 'purchase':
          responseText = this.generatePurchaseResponse(conversation);
          actions = [{ type: 'initiate_checkout', priority: 'high' }];
          break;
          
        case 'support':
          responseText = this.generateSupportResponse(conversation, sentiment);
          break;
          
        default:
          responseText = this.generateGeneralResponse(conversation, analysis);
      }
      
      // Apply personality traits to response
      responseText = this.applyPersonality(responseText, sentiment);
      
      return {
        text: responseText,
        confidence,
        recommendations,
        actions,
        generatedAt: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Failed to generate response:', error);
      return {
        text: "I apologize, but I'm having trouble processing your request right now. Could you please try rephrasing your question?",
        confidence: 0.3,
        recommendations: [],
        actions: []
      };
    }
  }

  /**
   * Analyze sentiment from user message
   */
  async analyzeSentiment(message) {
    try {
      const messageLower = message.toLowerCase();
      
      // Simple sentiment analysis
      const positiveWords = ['love', 'like', 'great', 'awesome', 'perfect', 'beautiful', 'amazing'];
      const negativeWords = ['hate', 'dislike', 'terrible', 'awful', 'ugly', 'bad', 'horrible'];
      const neutralWords = ['okay', 'fine', 'alright', 'maybe', 'perhaps'];
      
      const positiveCount = positiveWords.filter(word => messageLower.includes(word)).length;
      const negativeCount = negativeWords.filter(word => messageLower.includes(word)).length;
      const neutralCount = neutralWords.filter(word => messageLower.includes(word)).length;
      
      let sentiment = 'neutral';
      let confidence = 0.5;
      
      if (positiveCount > negativeCount && positiveCount > 0) {
        sentiment = 'positive';
        confidence = Math.min(0.9, 0.6 + (positiveCount * 0.1));
      } else if (negativeCount > positiveCount && negativeCount > 0) {
        sentiment = 'negative';
        confidence = Math.min(0.9, 0.6 + (negativeCount * 0.1));
      }
      
      return {
        sentiment,
        confidence,
        emotionalTone: this.determineEmotionalTone(sentiment, confidence),
        satisfactionLevel: this.calculateSatisfactionLevel(sentiment, confidence),
        analyzedAt: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Failed to analyze sentiment:', error);
      return { sentiment: 'neutral', confidence: 0.3, satisfactionLevel: 'unknown' };
    }
  }

  /**
   * Health check method for service monitoring
   */
  async healthCheck() {
    return await this.getServiceHealth();
  }

  /**
   * Get service health status
   */
  async getServiceHealth() {
    try {
      const healthData = {
        status: this.isInitialized ? 'healthy' : 'initializing',
        activeConversations: this.activeConversations.size,
        totalConversations: this.conversationHistory.size,
        authenticationStatus: this.authToken ? 'authenticated' : 'unauthenticated',
        performanceMetrics: this.performanceMetrics,
        knowledgeBaseStatus: 'loaded',
        lastHealthCheck: new Date().toISOString()
      };
      
      // Test connection to NVIDIA Merlin service
      if (this.isInitialized) {
        try {
          await this.makeRequest('/health', { method: 'GET' });
          healthData.merlinServiceStatus = 'connected';
        } catch (error) {
          healthData.merlinServiceStatus = 'disconnected';
          healthData.connectionError = error.message;
        }
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
   * Get performance metrics
   */
  async getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      activeConversations: this.activeConversations.size,
      totalConversations: this.conversationHistory.size,
      averageConversationLength: this.calculateAverageConversationLength(),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    try {
      console.log('Shutting down NVIDIA Merlin Conversational Service...');
      
      // End all active conversations
      for (const sessionId of this.activeConversations.keys()) {
        await this.endConversation(sessionId);
      }
      
      // Clear intervals
      if (this.performanceInterval) {
        clearInterval(this.performanceInterval);
      }
      
      this.isInitialized = false;
      this.emit('shutdown');
      
      console.log('NVIDIA Merlin Conversational Service shut down successfully');
      
    } catch (error) {
      console.error('Error during shutdown:', error);
      throw error;
    }
  }

  // Private helper methods

  validateConfiguration() {
    const required = ['apiKey', 'endpoint', 'modelId'];
    for (const field of required) {
      if (!this.config[field]) {
        throw new Error(`Missing required configuration: ${field}`);
      }
    }
  }

  async authenticate() {
    try {
      const response = await this.makeRequest('/auth/token', {
        method: 'POST',
        body: JSON.stringify({
          apiKey: this.config.apiKey,
          modelId: this.config.modelId,
          deploymentId: this.config.deploymentId
        })
      });
      
      this.authToken = response.accessToken;
      this.tokenExpiry = new Date(Date.now() + (response.expiresIn * 1000));
      
      return response;
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  async loadConversationModels() {
    console.log('Loading conversation models...');
    return Promise.resolve();
  }

  async initializeEyewearKnowledge() {
    console.log('Initializing eyewear knowledge base...');
    return Promise.resolve();
  }

  initializeKnowledgeBase() {
    return {
      faceShapeRecommendations: {
        oval: {
          frameShapes: ['round', 'square', 'rectangular', 'cat-eye', 'aviator'],
          reasoning: 'Oval faces are versatile and can wear most frame shapes'
        },
        round: {
          frameShapes: ['square', 'rectangular', 'cat-eye', 'geometric'],
          reasoning: 'Angular frames add definition and structure to round faces'
        },
        square: {
          frameShapes: ['round', 'oval', 'cat-eye', 'aviator'],
          reasoning: 'Curved frames soften angular features and add balance'
        },
        heart: {
          frameShapes: ['cat-eye', 'round', 'aviator', 'oval'],
          reasoning: 'Bottom-heavy frames balance the wider forehead'
        },
        diamond: {
          frameShapes: ['cat-eye', 'oval', 'round', 'rectangular'],
          reasoning: 'Frames that highlight eyes and soften cheekbones work best'
        }
      },
      brandKnowledge: {
        'Ray-Ban': { style: 'classic', priceRange: 'mid-high', specialty: 'aviators' },
        'Oakley': { style: 'sporty', priceRange: 'high', specialty: 'performance' },
        'Warby Parker': { style: 'trendy', priceRange: 'mid', specialty: 'online-first' }
      }
    };
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.config.endpoint}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authToken}`,
      'User-Agent': 'Commerce-Studio-Avatar-Chat/1.0',
      ...options.headers
    };
    
    const response = await fetch(url, {
      ...options,
      headers,
      timeout: this.config.timeout
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getUserProfile(userId) {
    if (this.userProfiles.has(userId)) {
      return this.userProfiles.get(userId);
    }
    
    // Create new user profile
    const profile = {
      userId,
      preferences: {},
      purchaseHistory: [],
      conversationHistory: [],
      faceAnalysis: null,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    this.userProfiles.set(userId, profile);
    return profile;
  }

  sanitizeUserProfile(profile) {
    return {
      preferences: profile.preferences,
      faceAnalysis: profile.faceAnalysis,
      conversationCount: profile.conversationHistory?.length || 0
    };
  }

  async generateWelcomeMessage(conversation) {
    const timeOfDay = this.getTimeOfDay();
    const personalizedGreeting = conversation.userProfile.preferences?.name 
      ? `Good ${timeOfDay}, ${conversation.userProfile.preferences.name}!` 
      : `Good ${timeOfDay}!`;
    
    return `${personalizedGreeting} I'm here to help you find the perfect eyewear. Whether you're looking for sunglasses, prescription glasses, or just want some style advice, I'm ready to assist you. What can I help you with today?`;
  }

  getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }

  // Additional helper methods for entity extraction, response generation, etc.
  extractFrameTypes(message) {
    const frameTypes = ['aviator', 'wayfarer', 'cat-eye', 'round', 'square', 'rectangular', 'oversized', 'rimless'];
    return frameTypes.filter(type => message.includes(type));
  }

  extractBrands(message) {
    const brands = ['ray-ban', 'oakley', 'gucci', 'prada', 'persol', 'tom ford', 'warby parker'];
    return brands.filter(brand => message.includes(brand));
  }

  extractColors(message) {
    const colors = ['black', 'brown', 'gold', 'silver', 'tortoise', 'transparent', 'blue', 'red'];
    return colors.filter(color => message.includes(color));
  }

  extractMaterials(message) {
    const materials = ['acetate', 'titanium', 'metal', 'plastic', 'wood', 'carbon fiber'];
    return materials.filter(material => message.includes(material));
  }

  extractFaceShapes(message) {
    const faceShapes = ['oval', 'round', 'square', 'heart', 'diamond', 'oblong'];
    return faceShapes.filter(shape => message.includes(shape));
  }

  extractPriceRange(message) {
    if (message.includes('budget') || message.includes('cheap') || message.includes('affordable')) {
      return 'low';
    }
    if (message.includes('expensive') || message.includes('luxury') || message.includes('premium')) {
      return 'high';
    }
    return null;
  }

  extractFeatures(message) {
    const features = ['prescription', 'progressive', 'bifocal', 'blue light', 'anti-reflective', 'photochromic'];
    return features.filter(feature => message.includes(feature));
  }

  extractNumbers(message) {
    return message.match(/\d+/g) || [];
  }

  extractPreferences(message, entities = {}) {
    const preferences = {};
    
    if (entities.frameTypes && entities.frameTypes.length > 0) {
      preferences.frameType = entities.frameTypes[0];
    }
    
    if (entities.colors && entities.colors.length > 0) {
      preferences.color = entities.colors[0];
    }
    
    return preferences;
  }

  calculateEntityConfidence(entities) {
    const totalEntities = Object.values(entities).flat().length;
    return Math.min(0.9, totalEntities * 0.1 + 0.3);
  }

  startPerformanceMonitoring() {
    this.performanceInterval = setInterval(() => {
      this.updatePerformanceMetrics();
    }, 10000); // Update every 10 seconds
  }

  updatePerformanceMetrics() {
    this.performanceMetrics = {
      responseLatency: this.calculateAverageResponseLatency(),
      conversationQuality: this.calculateConversationQuality(),
      userSatisfaction: this.calculateUserSatisfaction(),
      accuracyScore: this.calculateAccuracyScore(),
      timestamp: new Date().toISOString()
    };
  }

  calculateAverageResponseLatency() {
    // Placeholder for actual latency calculation
    return 1500; // 1.5 seconds
  }

  calculateConversationQuality() {
    // Placeholder for quality calculation
    return 0.85;
  }

  calculateUserSatisfaction() {
    // Placeholder for user satisfaction calculation
    return 0.8;
  }

  calculateAccuracyScore() {
    // Placeholder for accuracy score calculation
    return 0.9;
  }

  calculateAverageResponseTime(conversation) {
    const responseTimes = conversation.messages
      .filter(msg => msg.type === 'assistant')
      .map(msg => msg.metadata?.responseTime || 0);
    
    if (responseTimes.length === 0) return 0;
    return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  }

  calculateAverageConversationLength() {
    if (this.conversationHistory.size === 0) return 0;
    
    let totalMessages = 0;
    for (const conversation of this.conversationHistory.values()) {
      totalMessages += conversation.messages.length;
    }
    
    return totalMessages / this.conversationHistory.size;
  }

  async updateUserProfile(userId, data) {
    const profile = await this.getUserProfile(userId);
    
    // Update preferences based on extracted data
    if (data.entities && data.entities.entities) {
      Object.assign(profile.preferences, data.preferences || {});
    }
    
    profile.lastUpdated = new Date().toISOString();
    this.userProfiles.set(userId, profile);
  }

  async updateUserProfileFromConversation(userId, conversation) {
    const profile = await this.getUserProfile(userId);
    
    // Add conversation to history
    profile.conversationHistory.push({
      sessionId: conversation.sessionId,
      date: conversation.metadata.startedAt,
      messageCount: conversation.metadata.messageCount,
      primaryIntents: this.extractPrimaryIntents(conversation.messages),
      satisfaction: conversation.state.userSatisfaction
    });
    
    // Update preferences based on conversation
    const conversationPreferences = this.extractConversationPreferences(conversation);
    Object.assign(profile.preferences, conversationPreferences);
    
    profile.lastUpdated = new Date().toISOString();
    this.userProfiles.set(userId, profile);
  }

  extractPrimaryIntents(messages) {
    const intents = messages
      .filter(msg => msg.type === 'assistant' && msg.metadata?.intent)
      .map(msg => msg.metadata.intent);
    
    // Count intent frequency
    const intentCounts = {};
    intents.forEach(intent => {
      intentCounts[intent] = (intentCounts[intent] || 0) + 1;
    });
    
    // Return top 3 intents
    return Object.entries(intentCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([intent]) => intent);
  }

  extractConversationPreferences(conversation) {
    const preferences = {};
    
    // Extract preferences from entities mentioned in conversation
    conversation.messages.forEach(msg => {
      if (msg.metadata?.entities) {
        const entities = msg.metadata.entities;
        if (entities.frameTypes?.length > 0) {
          preferences.frameType = entities.frameTypes[0];
        }
        if (entities.brands?.length > 0) {
          preferences.preferredBrands = entities.brands;
        }
        if (entities.colors?.length > 0) {
          preferences.preferredColors = entities.colors;
        }
      }
    });
    
    return preferences;
  }

  analyzeConversationOutcomes(conversation) {
    const outcomes = {
      recommendationsProvided: conversation.state.recommendations.length,
      userEngagement: conversation.metadata.messageCount > 5 ? 'high' : 'low',
      issuesResolved: this.countResolvedIssues(conversation),
      nextSteps: this.identifyNextSteps(conversation)
    };
    
    return outcomes;
  }

  countResolvedIssues(conversation) {
    // Count how many user intents were successfully addressed
    const userIntents = conversation.messages
      .filter(msg => msg.type === 'user')
      .length;
    
    const assistantResponses = conversation.messages
      .filter(msg => msg.type === 'assistant')
      .length;
    
    return Math.min(userIntents, assistantResponses);
  }

  identifyNextSteps(conversation) {
    const lastIntent = conversation.state.currentIntent;
    
    switch (lastIntent) {
      case 'product_inquiry':
        return ['provide_detailed_specs', 'schedule_try_on'];
      case 'style_advice':
        return ['show_recommendations', 'book_consultation'];
      case 'try_on':
        return ['complete_virtual_try_on', 'compare_options'];
      case 'purchase':
        return ['complete_checkout', 'arrange_delivery'];
      default:
        return ['continue_conversation', 'provide_assistance'];
    }
  }

  getAlternativeIntents(message) {
    // Return alternative intent possibilities
    return [];
  }

  analyzeContextFactors(message, context) {
    return {
      hasProductContext: context.currentProducts?.length > 0,
      hasFaceAnalysis: !!context.faceAnalysis,
      hasUserHistory: context.previousPurchases?.length > 0
    };
  }

  getStyleRecommendations(style) {
    // Return style-based recommendations
    return [];
  }

  getBrandRecommendations(brands) {
    // Return brand-based recommendations
    return [];
  }

  filterByPriceRange(recommendations, priceRange) {
    // Filter recommendations by price range
    return recommendations;
  }

  generateGreetingResponse(conversation) {
    const timeOfDay = this.getTimeOfDay();
    return `Good ${timeOfDay}! I'm your personal eyewear consultant. I'm here to help you find the perfect frames that suit your style and face shape. What can I help you with today?`;
  }

  async generateProductInquiryResponse(conversation, entities) {
    let text = "I'd be happy to help you find the perfect eyewear! ";
    
    if (entities.entities.frameTypes?.length > 0) {
      text += `I see you're interested in ${entities.entities.frameTypes.join(' and ')} frames. `;
    }
    
    text += "Let me show you some great options that would work well for you.";
    
    return {
      text,
      recommendations: await this.generateRecommendations(conversation.userProfile, conversation.context),
      actions: [{ type: 'show_product_catalog', priority: 'medium' }]
    };
  }

  async generateStyleAdviceResponse(conversation, entities) {
    let text = "I'd love to help you with style advice! ";
    
    if (conversation.context.faceAnalysis) {
      const faceShape = conversation.context.faceAnalysis.faceShape;
      text += `Based on your ${faceShape} face shape, I recommend frames that will complement your features beautifully. `;
    } else {
      text += "To give you the best recommendations, I'd suggest we analyze your face shape first. ";
    }
    
    return {
      text,
      recommendations: await this.generateRecommendations(conversation.userProfile, conversation.context)
    };
  }

  generateFaceAnalysisResponse(conversation) {
    return "I'd be happy to help analyze your face shape to find the most flattering frames for you! Please position yourself in front of your camera, and I'll guide you through a quick face analysis.";
  }

  generateTryOnResponse(conversation) {
    return "Great idea! Virtual try-on is a fantastic way to see how frames will look on you. Let me set that up for you right now.";
  }

  generatePriceInquiryResponse(conversation, entities) {
    let text = "I understand you'd like to know about pricing. ";
    
    if (entities.entities.priceRange) {
      text += `I can show you some excellent options in the ${entities.entities.priceRange} price range. `;
    }
    
    text += "Our frames range from affordable everyday options to premium designer pieces. What's your budget range?";
    
    return text;
  }

  generatePurchaseResponse(conversation) {
    return "Wonderful! I'm excited to help you complete your purchase. Let me guide you through our secure checkout process.";
  }

  generateSupportResponse(conversation, sentiment) {
    if (sentiment.sentiment === 'negative') {
      return "I understand you may be experiencing some difficulties. I'm here to help resolve any issues you're having. Could you tell me more about what's troubling you?";
    }
    
    return "I'm here to help with any questions or concerns you might have. What can I assist you with?";
  }

  generateGeneralResponse(conversation, analysis) {
    return "I'm here to help you find the perfect eyewear. Whether you need style advice, want to browse our collection, or have questions about our products, I'm ready to assist you!";
  }

  applyPersonality(responseText, sentiment) {
    // Apply personality traits to make response more natural
    if (this.personality.enthusiasm > 0.7 && sentiment.sentiment === 'positive') {
      responseText = responseText.replace(/\!$/, '! 😊');
    }
    
    if (this.personality.warmth > 0.8) {
      responseText = responseText.replace(/^/, '');
    }
    
    return responseText;
  }

  determineEmotionalTone(sentiment, confidence) {
    if (sentiment === 'positive' && confidence > 0.7) return 'enthusiastic';
    if (sentiment === 'positive') return 'pleased';
    if (sentiment === 'negative' && confidence > 0.7) return 'concerned';
    if (sentiment === 'negative') return 'understanding';
    return 'neutral';
  }

  calculateSatisfactionLevel(sentiment, confidence) {
    if (sentiment === 'positive' && confidence > 0.8) return 'high';
    if (sentiment === 'positive' && confidence > 0.6) return 'medium';
    if (sentiment === 'neutral') return 'neutral';
    if (sentiment === 'negative' && confidence > 0.6) return 'low';
    return 'very_low';
  }
}

export default MerlinConversationalService;