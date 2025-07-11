const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class ConsultationService {
  constructor(options = {}) {
    this.i18nServiceUrl = options.i18nServiceUrl;
    this.faceAnalysisServiceUrl = options.faceAnalysisServiceUrl;
    this.logger = options.logger;
    this.activeConsultations = new Map();
    this.consultationHistory = new Map();
    
    // Default supported languages
    this.supportedLanguages = [
      'en-US', 'nl-NL', 'de-DE', 'es-ES', 'pt-PT', 'fr-FR', 'en-IE'
    ];
    
    // Initialize axios instances with proper configurations
    this.i18nClient = axios.create({
      baseURL: this.i18nServiceUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    this.faceAnalysisClient = axios.create({
      baseURL: this.faceAnalysisServiceUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    this.logger?.info('ConsultationService initialized', {
      i18nServiceUrl: this.i18nServiceUrl,
      faceAnalysisServiceUrl: this.faceAnalysisServiceUrl,
      supportedLanguages: this.supportedLanguages
    });
  }

  /**
   * Start a new consultation session
   */
  async startConsultation(tenantId, userId, language = 'en-US', options = {}) {
    try {
      const consultationId = uuidv4();
      
      // Validate language support
      if (!this.supportedLanguages.includes(language)) {
        language = 'en-US'; // Fallback to default
      }
      
      // Get localized content for the consultation
      const welcomeMessage = await this.getLocalizedContent(
        'consultation.welcome',
        language,
        tenantId
      );
      
      const consultation = {
        id: consultationId,
        tenantId,
        userId,
        language,
        status: 'active',
        startTime: new Date(),
        messages: [],
        context: {
          userPreferences: {},
          faceAnalysis: null,
          recommendations: [],
          ...options
        },
        welcomeMessage
      };
      
      this.activeConsultations.set(consultationId, consultation);
      
      this.logger?.info('Consultation started', {
        consultationId,
        tenantId,
        userId,
        language
      });
      
      return {
        success: true,
        consultationId,
        welcomeMessage,
        language,
        supportedLanguages: this.supportedLanguages
      };
      
    } catch (error) {
      this.logger?.error('Failed to start consultation', {
        error: error.message,
        tenantId,
        userId,
        language
      });
      
      throw new Error(`Failed to start consultation: ${error.message}`);
    }
  }

  /**
   * Process a consultation message
   */
  async processMessage(consultationId, message, options = {}) {
    try {
      const consultation = this.activeConsultations.get(consultationId);
      
      if (!consultation) {
        throw new Error('Consultation not found');
      }
      
      // Add user message to history
      consultation.messages.push({
        id: uuidv4(),
        type: 'user',
        content: message,
        timestamp: new Date(),
        metadata: options.metadata || {}
      });
      
      // Process the message based on consultation context
      let response;
      
      if (message.type === 'image' && message.imageData) {
        response = await this.processFaceAnalysis(consultation, message.imageData);
      } else if (message.type === 'text') {
        response = await this.processTextMessage(consultation, message.text);
      } else {
        response = await this.getLocalizedContent(
          'consultation.invalidInput',
          consultation.language,
          consultation.tenantId
        );
      }
      
      // Add assistant response to history
      consultation.messages.push({
        id: uuidv4(),
        type: 'assistant',
        content: response,
        timestamp: new Date(),
        metadata: { language: consultation.language }
      });
      
      this.activeConsultations.set(consultationId, consultation);
      
      return {
        success: true,
        response,
        consultationId,
        language: consultation.language
      };
      
    } catch (error) {
      this.logger?.error('Failed to process message', {
        error: error.message,
        consultationId
      });
      
      throw new Error(`Failed to process message: ${error.message}`);
    }
  }

  /**
   * Process face analysis for virtual try-on
   */
  async processFaceAnalysis(consultation, imageData) {
    try {
      // Call face analysis service
      const analysisResponse = await this.faceAnalysisClient.post('/api/analyze', {
        imageData,
        tenantId: consultation.tenantId,
        options: {
          includeFitting: true,
          includeRecommendations: true,
          language: consultation.language
        }
      });
      
      if (!analysisResponse.data.success) {
        throw new Error('Face analysis failed');
      }
      
      const analysis = analysisResponse.data.analysis;
      consultation.context.faceAnalysis = analysis;
      
      // Get localized response based on analysis
      const responseKey = analysis.confidence > 0.8 
        ? 'consultation.faceAnalysis.success' 
        : 'consultation.faceAnalysis.lowConfidence';
      
      const response = await this.getLocalizedContent(
        responseKey,
        consultation.language,
        consultation.tenantId,
        {
          confidence: Math.round(analysis.confidence * 100),
          faceShape: analysis.faceShape,
          recommendations: analysis.recommendations?.length || 0
        }
      );
      
      return response;
      
    } catch (error) {
      this.logger?.error('Face analysis failed', {
        error: error.message,
        consultationId: consultation.id
      });
      
      return await this.getLocalizedContent(
        'consultation.faceAnalysis.error',
        consultation.language,
        consultation.tenantId
      );
    }
  }

  /**
   * Process text message
   */
  async processTextMessage(consultation, text) {
    try {
      const lowerText = text.toLowerCase();
      
      // Simple intent recognition (can be enhanced with NLP)
      if (lowerText.includes('recommend') || lowerText.includes('suggest')) {
        return await this.getFrameRecommendations(consultation);
      } else if (lowerText.includes('try on') || lowerText.includes('virtual')) {
        return await this.getLocalizedContent(
          'consultation.virtualTryOn.prompt',
          consultation.language,
          consultation.tenantId
        );
      } else if (lowerText.includes('price') || lowerText.includes('cost')) {
        return await this.getPriceInformation(consultation);
      } else {
        return await this.getGeneralResponse(consultation, text);
      }
      
    } catch (error) {
      this.logger?.error('Text processing failed', {
        error: error.message,
        consultationId: consultation.id
      });
      
      return await this.getLocalizedContent(
        'consultation.error.general',
        consultation.language,
        consultation.tenantId
      );
    }
  }

  /**
   * Get frame recommendations
   */
  async getFrameRecommendations(consultation) {
    try {
      const faceAnalysis = consultation.context.faceAnalysis;
      
      if (!faceAnalysis) {
        return await this.getLocalizedContent(
          'consultation.recommendations.needAnalysis',
          consultation.language,
          consultation.tenantId
        );
      }
      
      // Get recommendations from face analysis service
      const recommendationsResponse = await this.faceAnalysisClient.post('/api/recommendations', {
        faceAnalysis,
        tenantId: consultation.tenantId,
        language: consultation.language,
        preferences: consultation.context.userPreferences
      });
      
      if (recommendationsResponse.data.success) {
        consultation.context.recommendations = recommendationsResponse.data.recommendations;
        
        return await this.getLocalizedContent(
          'consultation.recommendations.success',
          consultation.language,
          consultation.tenantId,
          {
            count: recommendationsResponse.data.recommendations.length,
            topRecommendation: recommendationsResponse.data.recommendations[0]?.name
          }
        );
      }
      
      return await this.getLocalizedContent(
        'consultation.recommendations.error',
        consultation.language,
        consultation.tenantId
      );
      
    } catch (error) {
      this.logger?.error('Recommendations failed', {
        error: error.message,
        consultationId: consultation.id
      });
      
      return await this.getLocalizedContent(
        'consultation.recommendations.error',
        consultation.language,
        consultation.tenantId
      );
    }
  }

  /**
   * Get price information
   */
  async getPriceInformation(consultation) {
    const recommendations = consultation.context.recommendations;
    
    if (!recommendations || recommendations.length === 0) {
      return await this.getLocalizedContent(
        'consultation.pricing.noRecommendations',
        consultation.language,
        consultation.tenantId
      );
    }
    
    return await this.getLocalizedContent(
      'consultation.pricing.available',
      consultation.language,
      consultation.tenantId,
      {
        priceRange: `€${recommendations[0]?.priceRange?.min || 0} - €${recommendations[0]?.priceRange?.max || 0}`
      }
    );
  }

  /**
   * Get general response
   */
  async getGeneralResponse(consultation, text) {
    return await this.getLocalizedContent(
      'consultation.general.response',
      consultation.language,
      consultation.tenantId,
      { userMessage: text }
    );
  }

  /**
   * Get localized content from internationalization service
   */
  async getLocalizedContent(key, language, tenantId, variables = {}) {
    try {
      const response = await this.i18nClient.get('/api/translations', {
        params: {
          key,
          language,
          tenantId
        }
      });
      
      if (response.data.success) {
        let content = response.data.translation;
        
        // Simple variable substitution
        Object.entries(variables).forEach(([varKey, value]) => {
          content = content.replace(new RegExp(`{{${varKey}}}`, 'g'), value);
        });
        
        return content;
      }
      
      // Fallback to English if translation not found
      if (language !== 'en-US') {
        return await this.getLocalizedContent(key, 'en-US', tenantId, variables);
      }
      
      return `Translation not found for key: ${key}`;
      
    } catch (error) {
      this.logger?.error('Localization failed', {
        error: error.message,
        key,
        language,
        tenantId
      });
      
      return `Error loading content: ${key}`;
    }
  }

  /**
   * End consultation session
   */
  async endConsultation(consultationId) {
    try {
      const consultation = this.activeConsultations.get(consultationId);
      
      if (!consultation) {
        throw new Error('Consultation not found');
      }
      
      consultation.status = 'completed';
      consultation.endTime = new Date();
      
      // Move to history
      this.consultationHistory.set(consultationId, consultation);
      this.activeConsultations.delete(consultationId);
      
      this.logger?.info('Consultation ended', {
        consultationId,
        duration: consultation.endTime - consultation.startTime,
        messageCount: consultation.messages.length
      });
      
      return {
        success: true,
        consultationId,
        summary: {
          duration: consultation.endTime - consultation.startTime,
          messageCount: consultation.messages.length,
          language: consultation.language,
          hadFaceAnalysis: !!consultation.context.faceAnalysis,
          recommendationCount: consultation.context.recommendations?.length || 0
        }
      };
      
    } catch (error) {
      this.logger?.error('Failed to end consultation', {
        error: error.message,
        consultationId
      });
      
      throw new Error(`Failed to end consultation: ${error.message}`);
    }
  }

  /**
   * Get consultation status
   */
  getConsultationStatus(consultationId) {
    const consultation = this.activeConsultations.get(consultationId) || 
                        this.consultationHistory.get(consultationId);
    
    if (!consultation) {
      return { found: false };
    }
    
    return {
      found: true,
      status: consultation.status,
      language: consultation.language,
      messageCount: consultation.messages.length,
      hasRecommendations: consultation.context.recommendations?.length > 0,
      hasFaceAnalysis: !!consultation.context.faceAnalysis
    };
  }

  /**
   * Switch consultation language
   */
  async switchLanguage(consultationId, newLanguage) {
    try {
      const consultation = this.activeConsultations.get(consultationId);
      
      if (!consultation) {
        throw new Error('Consultation not found');
      }
      
      if (!this.supportedLanguages.includes(newLanguage)) {
        throw new Error(`Language ${newLanguage} is not supported`);
      }
      
      consultation.language = newLanguage;
      
      const switchMessage = await this.getLocalizedContent(
        'consultation.languageSwitch.success',
        newLanguage,
        consultation.tenantId
      );
      
      this.activeConsultations.set(consultationId, consultation);
      
      return {
        success: true,
        consultationId,
        newLanguage,
        message: switchMessage
      };
      
    } catch (error) {
      this.logger?.error('Language switch failed', {
        error: error.message,
        consultationId,
        newLanguage
      });
      
      throw new Error(`Failed to switch language: ${error.message}`);
    }
  }
}

module.exports = ConsultationService;