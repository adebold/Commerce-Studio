import { UnifiedDialogflowService } from '../../../../services/google/unified-dialogflow-service.js';
import { VertexAIConnector } from '../../connectors/vertex-ai-connector.js';
import { logger } from '../../utils/logger.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      message,
      sessionId,
      shopDomain,
      conversationContext = [],
      faceAnalysisResult
    } = req.body;

    // Validate required parameters
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message parameter is required'
      });
    }

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    // Initialize unified conversation service (Google Cloud primary, Vertex AI fallback)
    let conversationService;
    let provider = 'google';
    
    try {
      conversationService = new UnifiedDialogflowService();
      await conversationService.initialize();
    } catch (error) {
      logger.warn('Google Dialogflow unavailable, falling back to Vertex AI', error);
      conversationService = new VertexAIConnector(shopDomain);
      provider = 'vertex-ai';
    }

    // Process message through unified conversation service
    const result = await conversationService.processMessage
      ? await conversationService.processMessage(message, sessionId, {
          shopDomain,
          conversationContext,
          faceAnalysisResult
        })
      : await conversationService.processConversation(message, sessionId, {
          shopDomain,
          conversationContext,
          faceAnalysisResult
        });

    // Standardized response format matching demo server
    return res.json({
      success: true,
      response: result.response || result.text || result,
      sessionId: sessionId,
      provider: provider,
      timestamp: new Date().toISOString(),
      shopDomain: shopDomain,
      intent: result.intent,
      confidence: result.confidence
    });

  } catch (error) {
    logger.error('Shopify chat processing error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      provider: 'error',
      timestamp: new Date().toISOString()
    });
  }
}

// Legacy intent analysis for backward compatibility
async function analyzeIntent(message, conversationContext, faceAnalysisResult) {
  // Simplified intent analysis - the unified service handles this internally
  return {
    type: 'general_inquiry',
    confidence: 0.8,
    entities: [],
    context: { conversationContext, faceAnalysisResult }
  };
}

// Legacy handlers for backward compatibility
async function handleProductRecommendationRequest(service, intent, faceAnalysisResult) {
  return await service.processMessage('I need product recommendations', 'shopify-session', {
    intent: intent,
    faceAnalysis: faceAnalysisResult
  });
}

async function handleStylePreferenceQuery(service, intent, conversationContext) {
  return await service.processMessage('What styles would work for me?', 'shopify-session', {
    intent: intent,
    context: conversationContext
  });
}

async function handleProductInformationRequest(service, intent) {
  return await service.processMessage('Tell me about this product', 'shopify-session', {
    intent: intent
  });
}

async function handleVirtualTryOnRequest(intent) {
        break;
      case 'face_analysis_question':
        response = await handleFaceAnalysisQuestion(intent, faceAnalysisResult);
        break;
      default:
        response = await handleGeneralQuery(vertexAI, intent, conversationContext);
    }

    // Track interaction
    await trackInteraction(sessionId, shopDomain, {
      userMessage: message,
      intent: intent.type,
      response: response.response,
      timestamp: Date.now()
    });

    return res.status(200).json(response);

  } catch (error) {
    logger.error('Error in AI discovery chat API:', error);
    return res.status(500).json({ 
      error: 'Failed to process request',
      message: error.message
    });
  }
}

/**
 * Analyze user intent from message
 */
async function analyzeIntent(message, conversationContext, faceAnalysisResult) {
  const lowerMessage = message.toLowerCase();
  
  // Product recommendation patterns
  if (lowerMessage.includes('recommend') || 
      lowerMessage.includes('suggest') || 
      lowerMessage.includes('show me') ||
      lowerMessage.includes('find me') ||
      lowerMessage.includes('looking for')) {
    return {
      type: 'product_recommendation_request',
      confidence: 0.9,
      entities: extractProductEntities(message)
    };
  }

  // Style preference patterns
  if (lowerMessage.includes('style') || 
      lowerMessage.includes('classic') || 
      lowerMessage.includes('modern') ||
      lowerMessage.includes('trendy') ||
      lowerMessage.includes('professional') ||
      lowerMessage.includes('casual')) {
    return {
      type: 'style_preference_query',
      confidence: 0.85,
      entities: extractStyleEntities(message)
    };
  }

  // Virtual try-on patterns
  if (lowerMessage.includes('try on') || 
      lowerMessage.includes('virtual') || 
      lowerMessage.includes('see how') ||
      lowerMessage.includes('look like')) {
    return {
      type: 'virtual_try_on_request',
      confidence: 0.9,
      entities: extractProductEntities(message)
    };
  }

  // Face analysis patterns
  if (lowerMessage.includes('face') || 
      lowerMessage.includes('shape') || 
      lowerMessage.includes('analysis') ||
      lowerMessage.includes('features')) {
    return {
      type: 'face_analysis_question',
      confidence: 0.8,
      entities: {}
    };
  }

  // Product information patterns
  if (lowerMessage.includes('tell me about') || 
      lowerMessage.includes('more about') || 
      lowerMessage.includes('details') ||
      lowerMessage.includes('information')) {
    return {
      type: 'product_information_request',
      confidence: 0.8,
      entities: extractProductEntities(message)
    };
  }

  // Default to general query
  return {
    type: 'general_query',
    confidence: 0.5,
    entities: {}
  };
}

/**
 * Extract product-related entities from message
 */
function extractProductEntities(message) {
  const entities = {};
  const lowerMessage = message.toLowerCase();

  // Frame shapes
  const frameShapes = ['round', 'square', 'oval', 'cat-eye', 'aviator', 'wayfarer', 'rectangular'];
  for (const shape of frameShapes) {
    if (lowerMessage.includes(shape)) {
      entities.frameShape = shape;
      break;
    }
  }

  // Colors
  const colors = ['black', 'brown', 'gold', 'silver', 'blue', 'red', 'green', 'pink', 'clear', 'tortoise'];
  for (const color of colors) {
    if (lowerMessage.includes(color)) {
      entities.color = color;
      break;
    }
  }

  // Materials
  const materials = ['metal', 'plastic', 'acetate', 'titanium', 'wood', 'bamboo'];
  for (const material of materials) {
    if (lowerMessage.includes(material)) {
      entities.material = material;
      break;
    }
  }

  // Types
  if (lowerMessage.includes('sunglasses') || lowerMessage.includes('sun glasses')) {
    entities.type = 'sunglasses';
  } else if (lowerMessage.includes('reading') || lowerMessage.includes('prescription')) {
    entities.type = 'prescription';
  }

  return entities;
}

/**
 * Extract style-related entities from message
 */
function extractStyleEntities(message) {
  const entities = {};
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('classic') || lowerMessage.includes('traditional')) {
    entities.style = 'classic';
  } else if (lowerMessage.includes('modern') || lowerMessage.includes('contemporary')) {
    entities.style = 'modern';
  } else if (lowerMessage.includes('trendy') || lowerMessage.includes('fashionable')) {
    entities.style = 'trendy';
  } else if (lowerMessage.includes('professional') || lowerMessage.includes('business')) {
    entities.style = 'professional';
  } else if (lowerMessage.includes('casual') || lowerMessage.includes('everyday')) {
    entities.style = 'casual';
  } else if (lowerMessage.includes('bold') || lowerMessage.includes('statement')) {
    entities.style = 'bold';
  }

  return entities;
}

/**
 * Handle product recommendation requests
 */
async function handleProductRecommendationRequest(vertexAI, intent, faceAnalysisResult) {
  try {
    // Build recommendation query based on intent and face analysis
    let query = 'Find eyewear frames';
    
    if (faceAnalysisResult) {
      query += ` suitable for ${faceAnalysisResult.faceShape} face shape`;
    }

    if (intent.entities.frameShape) {
      query += ` with ${intent.entities.frameShape} shape`;
    }

    if (intent.entities.color) {
      query += ` in ${intent.entities.color} color`;
    }

    if (intent.entities.material) {
      query += ` made of ${intent.entities.material}`;
    }

    if (intent.entities.type) {
      query += ` for ${intent.entities.type}`;
    }

    // Get recommendations from Vertex AI
    const result = await vertexAI.getProductRecommendation(query, {
      maxResults: 8,
      faceAnalysis: faceAnalysisResult,
      preferenceFilters: intent.entities
    });

    return {
      response: result.response || generateRecommendationMessage(result.products, faceAnalysisResult),
      products: result.products || [],
      suggestedQueries: [
        'Tell me more about the first recommendation',
        'Show me different colors',
        'Can I try these on virtually?',
        'What about different styles?'
      ],
      actions: result.products?.length > 0 ? [
        { type: 'virtual_try_on', label: 'Try On First Frame', productId: result.products[0].id }
      ] : []
    };

  } catch (error) {
    logger.error('Error handling product recommendation request:', error);
    return {
      response: "I'm having trouble finding recommendations right now. Could you tell me more about what style you're looking for?",
      suggestedQueries: [
        'I like classic styles',
        'Show me modern frames',
        'I want something bold',
        'Professional looking frames'
      ]
    };
  }
}

/**
 * Handle style preference queries
 */
async function handleStylePreferenceQuery(vertexAI, intent, conversationContext) {
  const styleResponses = {
    classic: "Classic styles are timeless and versatile! I'd recommend looking at oval, rectangular, or wayfarer frames in neutral colors like black, brown, or tortoise. These styles work well in professional settings and never go out of fashion.",
    modern: "Modern styles feature clean lines and contemporary designs! Consider geometric shapes, minimalist frames, or semi-rimless designs. Materials like titanium or sleek acetate work great for a modern look.",
    trendy: "For trendy styles, let's look at what's popular right now! Oversized frames, cat-eye shapes, and bold colors are very fashionable. Clear acetate frames and unique geometric shapes are also trending.",
    professional: "Professional styles should be sophisticated yet understated. I'd suggest rectangular or oval frames in classic colors like black, brown, or silver. Avoid overly bold or decorative elements.",
    casual: "For casual everyday wear, comfort and versatility are key! Wayfarer, round, or oval frames in neutral colors work great. Look for lightweight materials and comfortable fits.",
    bold: "Bold styles make a statement! Consider oversized frames, unique shapes like hexagonal or cat-eye, bright colors, or frames with interesting textures and patterns."
  };

  const style = intent.entities.style;
  const response = styleResponses[style] || "I'd love to help you find the perfect style! Could you tell me more about what kind of look you're going for?";

  return {
    response: response + " Would you like me to show you some specific recommendations?",
    suggestedQueries: [
      'Show me some examples',
      'What colors work best?',
      'Tell me about materials',
      'How do I know what fits my face?'
    ],
    actions: [
      { type: 'browse_products', label: 'See Recommendations' }
    ]
  };
}

/**
 * Handle product information requests
 */
async function handleProductInformationRequest(vertexAI, intent) {
  return {
    response: "I'd be happy to provide more information about any frames you're interested in! You can click on any product recommendation to see detailed specifications, materials, measurements, and customer reviews.",
    suggestedQueries: [
      'Show me frame measurements',
      'What materials are available?',
      'Tell me about the warranty',
      'How do I choose the right size?'
    ]
  };
}

/**
 * Handle virtual try-on requests
 */
async function handleVirtualTryOnRequest(intent) {
  return {
    response: "Virtual try-on is a great way to see how frames look on you! Click the 'Try On' button on any frame recommendation to start the virtual try-on experience. Make sure you have good lighting and look directly at the camera for the best results.",
    suggestedQueries: [
      'How does virtual try-on work?',
      'What do I need for try-on?',
      'Can I save try-on photos?',
      'Show me frames to try on'
    ],
    actions: [
      { type: 'browse_products', label: 'Find Frames to Try On' }
    ]
  };
}

/**
 * Handle face analysis questions
 */
async function handleFaceAnalysisQuestion(intent, faceAnalysisResult) {
  if (faceAnalysisResult) {
    return {
      response: `Based on your face analysis, you have an ${faceAnalysisResult.faceShape} face shape. This means frames that complement your natural features will look best on you. Your face measurements help me recommend frames with the right proportions and style.`,
      suggestedQueries: [
        'What frames work for my face shape?',
        'Why is face shape important?',
        'Can I analyze my face again?',
        'Show me personalized recommendations'
      ],
      actions: [
        { type: 'browse_products', label: 'See Personalized Recommendations' }
      ]
    };
  } else {
    return {
      response: "Face analysis helps me understand your unique features and recommend frames that will look best on you. The analysis determines your face shape, measurements, and proportions to find the most flattering styles. Would you like to try the face analysis feature?",
      suggestedQueries: [
        'How does face analysis work?',
        'Is my data private?',
        'What face shapes are there?',
        'Start face analysis'
      ],
      actions: [
        { type: 'start_face_analysis', label: 'Try Face Analysis' }
      ]
    };
  }
}

/**
 * Handle general queries
 */
async function handleGeneralQuery(vertexAI, intent, conversationContext) {
  try {
    // Use Vertex AI for general conversation
    const result = await vertexAI.getProductRecommendation(intent.message || 'Help with eyewear', {
      maxResults: 3,
      conversationContext
    });

    return {
      response: result.response || "I'm here to help you find the perfect eyewear! I can analyze your face shape, recommend frames based on your style preferences, and help you virtually try on different options. What would you like to explore?",
      suggestedQueries: result.suggestedQueries || [
        'Analyze my face shape',
        'Show me popular frames',
        'Help me find my style',
        'How does virtual try-on work?'
      ]
    };

  } catch (error) {
    logger.error('Error handling general query:', error);
    return {
      response: "I'm here to help you find the perfect eyewear! I can analyze your face shape, recommend frames based on your style preferences, and help you virtually try on different options. What would you like to explore?",
      suggestedQueries: [
        'Analyze my face shape',
        'Show me popular frames',
        'Help me find my style',
        'How does virtual try-on work?'
      ]
    };
  }
}

/**
 * Generate recommendation message
 */
function generateRecommendationMessage(products, faceAnalysisResult) {
  if (!products || products.length === 0) {
    return "I couldn't find specific recommendations right now, but I'd love to help you find the perfect frames! Could you tell me more about your style preferences?";
  }

  let message = `I found ${products.length} great frame${products.length > 1 ? 's' : ''} for you`;
  
  if (faceAnalysisResult) {
    message += ` that complement your ${faceAnalysisResult.faceShape} face shape`;
  }
  
  message += '! Each of these has been carefully selected based on your preferences and features. Click on any frame to see more details or try it on virtually.';
  
  return message;
}

/**
 * Track user interaction for analytics
 */
async function trackInteraction(sessionId, shopDomain, interaction) {
  try {
    // This would integrate with your analytics system
    logger.info('AI Discovery Interaction:', {
      sessionId,
      shopDomain,
      ...interaction
    });
  } catch (error) {
    logger.error('Error tracking interaction:', error);
  }
}