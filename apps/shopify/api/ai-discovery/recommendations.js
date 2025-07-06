import { VertexAIConnector } from '../../connectors/vertex-ai-connector.js';
import { logger } from '../../utils/logger.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      sessionId, 
      shopDomain, 
      faceAnalysis, 
      conversationContext = [], 
      maxRecommendations = 8,
      filters = {}
    } = req.body;

    // Validate required parameters
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    if (!shopDomain) {
      return res.status(400).json({ error: 'Shop domain is required' });
    }

    // Initialize Vertex AI connector
    const vertexAI = new VertexAIConnector(shopDomain);

    // Generate AI-powered recommendations
    const recommendations = await generatePersonalizedRecommendations(
      vertexAI, 
      faceAnalysis, 
      conversationContext, 
      filters, 
      maxRecommendations
    );

    // Track recommendation generation
    await trackRecommendationGeneration(sessionId, shopDomain, {
      faceAnalysis,
      recommendationCount: recommendations.products.length,
      filters,
      timestamp: Date.now()
    });

    return res.status(200).json(recommendations);

  } catch (error) {
    logger.error('Error in AI discovery recommendations API:', error);
    return res.status(500).json({ 
      error: 'Failed to generate recommendations',
      message: error.message
    });
  }
}

/**
 * Generate personalized recommendations based on face analysis and preferences
 */
async function generatePersonalizedRecommendations(vertexAI, faceAnalysis, conversationContext, filters, maxRecommendations) {
  try {
    // Build recommendation query
    const query = buildRecommendationQuery(faceAnalysis, conversationContext, filters);
    
    // Get recommendations from Vertex AI
    const result = await vertexAI.getProductRecommendation(query, {
      maxResults: maxRecommendations,
      faceAnalysis,
      preferenceFilters: filters,
      conversationContext
    });

    // If no products returned, generate fallback recommendations
    if (!result.products || result.products.length === 0) {
      return generateFallbackRecommendations(faceAnalysis, filters);
    }

    // Enhance recommendations with AI insights
    const enhancedProducts = await enhanceRecommendationsWithAI(result.products, faceAnalysis);

    // Generate personalized message
    const message = generatePersonalizedMessage(enhancedProducts, faceAnalysis, filters);

    return {
      message,
      products: enhancedProducts.slice(0, maxRecommendations),
      reasoning: generateRecommendationReasoning(faceAnalysis, filters),
      confidence: calculateRecommendationConfidence(faceAnalysis, enhancedProducts),
      suggestedQueries: generateSuggestedQueries(faceAnalysis, filters)
    };

  } catch (error) {
    logger.error('Error generating personalized recommendations:', error);
    return generateFallbackRecommendations(faceAnalysis, filters);
  }
}

/**
 * Build recommendation query based on inputs
 */
function buildRecommendationQuery(faceAnalysis, conversationContext, filters) {
  let query = 'Find eyewear frames';
  
  // Add face shape preference
  if (faceAnalysis?.faceShape) {
    query += ` suitable for ${faceAnalysis.faceShape} face shape`;
  }

  // Add style preferences from filters
  if (filters.style) {
    query += ` with ${filters.style} style`;
  }

  if (filters.frameShape) {
    query += ` in ${filters.frameShape} shape`;
  }

  if (filters.color) {
    query += ` in ${filters.color} color`;
  }

  if (filters.material) {
    query += ` made of ${filters.material}`;
  }

  if (filters.priceRange) {
    query += ` in ${filters.priceRange} price range`;
  }

  // Add context from conversation
  if (conversationContext.length > 0) {
    const recentContext = conversationContext.slice(-3); // Last 3 interactions
    const contextKeywords = extractContextKeywords(recentContext);
    if (contextKeywords.length > 0) {
      query += ` considering preferences for ${contextKeywords.join(', ')}`;
    }
  }

  return query;
}

/**
 * Extract keywords from conversation context
 */
function extractContextKeywords(conversationContext) {
  const keywords = new Set();
  
  conversationContext.forEach(interaction => {
    if (interaction.userMessage) {
      const message = interaction.userMessage.content || interaction.userMessage;
      const lowerMessage = message.toLowerCase();
      
      // Extract style keywords
      const styleKeywords = ['classic', 'modern', 'trendy', 'professional', 'casual', 'bold'];
      styleKeywords.forEach(keyword => {
        if (lowerMessage.includes(keyword)) {
          keywords.add(keyword);
        }
      });
      
      // Extract color keywords
      const colorKeywords = ['black', 'brown', 'gold', 'silver', 'blue', 'red', 'clear'];
      colorKeywords.forEach(keyword => {
        if (lowerMessage.includes(keyword)) {
          keywords.add(keyword);
        }
      });
    }
  });
  
  return Array.from(keywords);
}

/**
 * Enhance recommendations with AI insights
 */
async function enhanceRecommendationsWithAI(products, faceAnalysis) {
  return products.map(product => {
    // Calculate compatibility score based on face analysis
    let compatibilityScore = 0.8; // Base score
    
    if (faceAnalysis && product.attributes?.eyewear?.recommendedFaceShapes) {
      const recommendedShapes = product.attributes.eyewear.recommendedFaceShapes;
      if (recommendedShapes.includes(faceAnalysis.faceShape)) {
        compatibilityScore = 0.95;
      } else {
        // Check for compatible shapes
        const compatibilityMap = {
          'oval': ['round', 'square', 'rectangular', 'cat-eye'],
          'round': ['square', 'rectangular', 'cat-eye'],
          'square': ['round', 'oval', 'cat-eye'],
          'heart': ['cat-eye', 'round', 'aviator'],
          'diamond': ['cat-eye', 'oval', 'round'],
          'oblong': ['round', 'square', 'wayfarer']
        };
        
        const compatibleShapes = compatibilityMap[faceAnalysis.faceShape] || [];
        const frameShape = product.attributes.eyewear.frameShape?.toLowerCase();
        
        if (compatibleShapes.some(shape => frameShape?.includes(shape))) {
          compatibilityScore = 0.85;
        } else {
          compatibilityScore = 0.6;
        }
      }
    }

    // Add AI enhancement data
    return {
      ...product,
      aiEnhancement: {
        compatibilityScore,
        recommendationReason: generateRecommendationReason(product, faceAnalysis),
        personalizedTags: generatePersonalizedTags(product, faceAnalysis),
        confidenceLevel: compatibilityScore > 0.9 ? 'high' : compatibilityScore > 0.7 ? 'medium' : 'low'
      }
    };
  });
}

/**
 * Generate recommendation reason for a specific product
 */
function generateRecommendationReason(product, faceAnalysis) {
  const reasons = [];
  
  if (faceAnalysis) {
    const frameShape = product.attributes?.eyewear?.frameShape;
    const faceShape = faceAnalysis.faceShape;
    
    // Face shape compatibility reasons
    const shapeReasons = {
      'oval': {
        'round': 'The round shape complements your balanced oval face',
        'square': 'Square frames add definition to your soft oval features',
        'rectangular': 'Rectangular frames enhance your natural proportions'
      },
      'round': {
        'square': 'Square frames add angles to balance your round face',
        'rectangular': 'Rectangular frames create length and definition',
        'cat-eye': 'Cat-eye frames lift and elongate your features'
      },
      'square': {
        'round': 'Round frames soften your strong jawline beautifully',
        'oval': 'Oval frames complement your structured features',
        'cat-eye': 'Cat-eye frames add feminine curves to your angular face'
      }
    };
    
    const shapeReason = shapeReasons[faceShape]?.[frameShape?.toLowerCase()];
    if (shapeReason) {
      reasons.push(shapeReason);
    }
  }
  
  // Style and material reasons
  const material = product.attributes?.eyewear?.frameMaterial;
  if (material) {
    const materialReasons = {
      'acetate': 'Durable acetate offers vibrant colors and comfort',
      'metal': 'Sleek metal construction provides a modern, professional look',
      'titanium': 'Lightweight titanium is perfect for all-day comfort',
      'wood': 'Natural wood adds unique character and eco-friendly appeal'
    };
    
    const materialReason = materialReasons[material.toLowerCase()];
    if (materialReason) {
      reasons.push(materialReason);
    }
  }
  
  // Default reason if no specific reasons found
  if (reasons.length === 0) {
    reasons.push('This frame style is versatile and flattering for most face shapes');
  }
  
  return reasons.join('. ');
}

/**
 * Generate personalized tags for a product
 */
function generatePersonalizedTags(product, faceAnalysis) {
  const tags = [];
  
  if (faceAnalysis) {
    // Add face shape compatibility tag
    const recommendedShapes = product.attributes?.eyewear?.recommendedFaceShapes || [];
    if (recommendedShapes.includes(faceAnalysis.faceShape)) {
      tags.push('Perfect for your face shape');
    } else {
      tags.push('Good compatibility');
    }
  }
  
  // Add style tags based on product attributes
  const frameShape = product.attributes?.eyewear?.frameShape?.toLowerCase();
  const styleTags = {
    'round': 'Intellectual & Vintage',
    'square': 'Bold & Confident',
    'oval': 'Classic & Versatile',
    'cat-eye': 'Glamorous & Feminine',
    'aviator': 'Timeless & Cool',
    'wayfarer': 'Iconic & Retro'
  };
  
  if (frameShape && styleTags[frameShape]) {
    tags.push(styleTags[frameShape]);
  }
  
  // Add material tags
  const material = product.attributes?.eyewear?.frameMaterial?.toLowerCase();
  const materialTags = {
    'acetate': 'Durable & Colorful',
    'metal': 'Sleek & Professional',
    'titanium': 'Lightweight & Premium',
    'wood': 'Eco-Friendly & Unique'
  };
  
  if (material && materialTags[material]) {
    tags.push(materialTags[material]);
  }
  
  return tags;
}

/**
 * Generate personalized message for recommendations
 */
function generatePersonalizedMessage(products, faceAnalysis, filters) {
  if (products.length === 0) {
    return "I couldn't find specific recommendations right now, but I'd love to help you find the perfect frames! Could you tell me more about your style preferences?";
  }
  
  let message = `I found ${products.length} perfect frame${products.length > 1 ? 's' : ''} for you`;
  
  if (faceAnalysis) {
    message += ` that beautifully complement your ${faceAnalysis.faceShape} face shape`;
  }
  
  if (filters.style) {
    message += ` in the ${filters.style} style you're looking for`;
  }
  
  message += '! Each recommendation has been carefully selected using AI analysis';
  
  if (faceAnalysis) {
    message += ' of your facial features and proportions';
  }
  
  message += '. Click on any frame to see why it\'s perfect for you, or try it on virtually to see how it looks!';
  
  return message;
}

/**
 * Generate recommendation reasoning
 */
function generateRecommendationReasoning(faceAnalysis, filters) {
  const reasoning = [];
  
  if (faceAnalysis) {
    reasoning.push(`Face shape analysis: ${faceAnalysis.faceShape} face shape with ${Math.round(faceAnalysis.confidence * 100)}% confidence`);
    reasoning.push(`Facial measurements considered for optimal frame proportions`);
  }
  
  if (filters.style) {
    reasoning.push(`Style preference: ${filters.style} aesthetic`);
  }
  
  if (filters.frameShape) {
    reasoning.push(`Frame shape preference: ${filters.frameShape}`);
  }
  
  if (filters.color) {
    reasoning.push(`Color preference: ${filters.color}`);
  }
  
  reasoning.push('AI-powered compatibility scoring for each recommendation');
  
  return reasoning;
}

/**
 * Calculate overall recommendation confidence
 */
function calculateRecommendationConfidence(faceAnalysis, products) {
  if (!products || products.length === 0) {
    return 0.3;
  }
  
  let totalConfidence = 0;
  let count = 0;
  
  products.forEach(product => {
    if (product.aiEnhancement?.compatibilityScore) {
      totalConfidence += product.aiEnhancement.compatibilityScore;
      count++;
    }
  });
  
  const averageConfidence = count > 0 ? totalConfidence / count : 0.7;
  
  // Boost confidence if face analysis is available
  if (faceAnalysis) {
    return Math.min(averageConfidence + 0.1, 1.0);
  }
  
  return averageConfidence;
}

/**
 * Generate suggested queries based on context
 */
function generateSuggestedQueries(faceAnalysis, filters) {
  const queries = [];
  
  if (faceAnalysis) {
    queries.push('Why are these frames good for my face shape?');
    queries.push('Show me different colors in these styles');
  } else {
    queries.push('Can you analyze my face shape?');
  }
  
  queries.push('Tell me more about the first recommendation');
  queries.push('Can I try these on virtually?');
  
  if (!filters.style) {
    queries.push('Show me more modern styles');
  }
  
  if (!filters.color) {
    queries.push('What colors would look best on me?');
  }
  
  return queries;
}

/**
 * Generate fallback recommendations when AI fails
 */
function generateFallbackRecommendations(faceAnalysis, filters) {
  // Mock popular products for fallback
  const fallbackProducts = [
    {
      id: 'fallback-1',
      title: 'Classic Wayfarer Frames',
      description: 'Timeless wayfarer style that works for most face shapes',
      price: { amount: 129.99, currencyCode: 'USD' },
      url: '/products/classic-wayfarer',
      images: [{ url: '/images/wayfarer-black.jpg', altText: 'Classic Wayfarer' }],
      attributes: {
        eyewear: {
          frameShape: 'wayfarer',
          frameMaterial: 'acetate',
          frameColor: 'black',
          recommendedFaceShapes: ['oval', 'round', 'square']
        }
      },
      aiEnhancement: {
        compatibilityScore: 0.8,
        recommendationReason: 'Classic wayfarer style is universally flattering',
        personalizedTags: ['Versatile', 'Timeless'],
        confidenceLevel: 'high'
      }
    },
    {
      id: 'fallback-2',
      title: 'Modern Round Frames',
      description: 'Contemporary round frames with a sleek metal finish',
      price: { amount: 149.99, currencyCode: 'USD' },
      url: '/products/modern-round',
      images: [{ url: '/images/round-metal.jpg', altText: 'Modern Round Frames' }],
      attributes: {
        eyewear: {
          frameShape: 'round',
          frameMaterial: 'metal',
          frameColor: 'silver',
          recommendedFaceShapes: ['square', 'diamond', 'oblong']
        }
      },
      aiEnhancement: {
        compatibilityScore: 0.75,
        recommendationReason: 'Round frames add softness to angular features',
        personalizedTags: ['Modern', 'Sophisticated'],
        confidenceLevel: 'medium'
      }
    }
  ];

  let message = 'Here are some popular frame styles that work well for most people';
  if (faceAnalysis) {
    message += ` and should complement your ${faceAnalysis.faceShape} face shape`;
  }
  message += '!';

  return {
    message,
    products: fallbackProducts,
    reasoning: ['Popular styles with broad appeal', 'Versatile designs suitable for various face shapes'],
    confidence: 0.7,
    suggestedQueries: [
      'Can you analyze my face for better recommendations?',
      'Tell me more about these styles',
      'Show me different colors',
      'How do I know what fits my face?'
    ]
  };
}

/**
 * Track recommendation generation for analytics
 */
async function trackRecommendationGeneration(sessionId, shopDomain, data) {
  try {
    logger.info('AI Discovery Recommendations Generated:', {
      sessionId,
      shopDomain,
      ...data
    });
  } catch (error) {
    logger.error('Error tracking recommendation generation:', error);
  }
}