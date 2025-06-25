/**
 * Vertex AI Connector for Shopify Integration (JavaScript Implementation)
 * 
 * This module provides a JavaScript implementation of the Vertex AI connector
 * for use with the Shopify demo script.
 */

import axios from 'axios';

/**
 * VertexAIConnector class for interacting with the Vertex AI Shopping Assistant
 */
export class VertexAIConnector {
  /**
   * Constructor
   * @param {string} shopDomain - The Shopify shop domain
   */
  constructor(shopDomain) {
    this.shopDomain = shopDomain;
    this.apiBaseUrl = process.env.VERTEX_AI_API_URL || 'https://api.eyewearml.example/v1';
    this.apiKey = process.env.VERTEX_AI_API_KEY || '';
    
    // Use development mode with simulations when API key is not provided
    this.useSimulation = !this.apiKey || process.env.NODE_ENV === 'development';
    
    console.log(`VertexAIConnector initialized for ${shopDomain}`);
    if (this.useSimulation) {
      console.log('Running in simulation mode (development)');
    }
  }

  /**
   * Get product recommendations based on user query
   * @param {string} query - The user's query text
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Response with recommendations
   */
  async getProductRecommendation(query, options = {}) {
    console.log(`Getting product recommendations for query: "${query}"`);
    
    try {
      // Use simulation mode for development
      if (this.useSimulation) {
        return this.simulateProductRecommendation(query, options);
      }
      
      // In production mode, call the actual Vertex AI API
      const response = await axios.post(
        `${this.apiBaseUrl}/shopping-assistant/recommendations`,
        {
          query,
          shop_domain: this.shopDomain,
          session_id: options.sessionId || `session_${Date.now()}`,
          max_results: options.maxResults || 3,
          context_items: options.contextItems || []
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error getting product recommendations:', error);
      
      // Fallback to simulation in case of API error
      return this.simulateProductRecommendation(query, options);
    }
  }
  
  /**
   * Simulates product recommendations for development and testing
   * @param {string} query - The user's query text
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Simulated response
   */
  simulateProductRecommendation(query, options = {}) {
    console.log('Simulating product recommendation response');
    
    // Extract keywords from the query
    const keywords = extractKeywords(query);
    
    // Generate a response based on the query
    let response = generateResponse(query, keywords);
    
    // Generate product recommendations based on the query
    const products = generateProductRecommendations(query, keywords, options.maxResults || 3);
    
    // Generate suggested follow-up queries
    const suggestedQueries = generateSuggestedQueries(query, keywords);
    
    return {
      response,
      products,
      suggestedQueries,
      metadata: {
        simulation: true,
        timestamp: new Date().toISOString(),
        sessionId: options.sessionId || `session_${Date.now()}`,
      }
    };
  }
}

/**
 * Extracts keywords from a query
 * @param {string} query - The user's query
 * @returns {string[]} Extracted keywords
 */
function extractKeywords(query) {
  // Convert to lowercase
  const lowercaseQuery = query.toLowerCase();
  
  // List of keywords to extract
  const keywordsList = [
    // Frame types
    'sunglasses', 'eyeglasses', 'prescription', 'reading', 'blue light',
    
    // Frame shapes
    'round', 'square', 'rectangle', 'oval', 'cat-eye', 'aviator', 'wayfarer', 'geometric',
    
    // Materials
    'metal', 'titanium', 'plastic', 'acetate', 'wood', 'carbon fiber',
    
    // Colors
    'black', 'brown', 'gold', 'silver', 'red', 'blue', 'green', 'tortoise', 'transparent',
    
    // Face shapes
    'round face', 'square face', 'oval face', 'heart face', 'diamond face', 'oblong face',
    
    // Brands
    'ray-ban', 'oakley', 'gucci', 'prada', 'warby parker', 'calvin klein',
    
    // Features
    'lightweight', 'durable', 'comfortable', 'stylish', 'affordable', 'premium', 'luxury',
    
    // Demographic
    'men', 'women', 'unisex', 'kids', 'children',
    
    // Other attributes
    'best selling', 'popular', 'new', 'trending'
  ];
  
  // Extract matching keywords
  return keywordsList.filter(keyword => lowercaseQuery.includes(keyword));
}

/**
 * Generates a response based on the query
 * @param {string} query - The user's query
 * @param {string[]} keywords - Extracted keywords
 * @returns {string} Generated response
 */
function generateResponse(query, keywords) {
  // Check for specific query types
  if (query.toLowerCase().includes('face shape') || 
      query.toLowerCase().includes('round face') || 
      query.toLowerCase().includes('square face')) {
    return "Based on your face shape, I've selected some frames that would be particularly flattering. In general, it's best to choose frames that provide contrast to your face shape. For example, if you have a round face, angular frames like square or rectangular can add definition.";
  }
  
  if (query.toLowerCase().includes('blue light')) {
    return "Blue light glasses are great for reducing eye strain during long screen sessions. I've found some stylish options with blue light filtering technology. These help reduce potential sleep disruption from screen time before bed.";
  }
  
  if (query.toLowerCase().includes('lightweight')) {
    return "For lightweight comfort, I recommend frames made from titanium or certain types of plastic. These options are perfect for all-day wear and won't leave marks on your nose bridge. Here are some of our lightest frames:";
  }
  
  if (keywords.length > 0) {
    return `I've found some great options based on your search for ${keywords.join(', ')}. Here are some products that match what you're looking for:`;
  }
  
  // Default response
  return "Here are some eyewear options that might interest you based on your query. Feel free to ask about specific styles, brands, or features if you'd like more tailored recommendations.";
}

/**
 * Generates simulated product recommendations
 * @param {string} query - The user's query
 * @param {string[]} keywords - Extracted keywords
 * @param {number} maxResults - Maximum number of products to return
 * @returns {Array} Simulated product recommendations
 */
function generateProductRecommendations(query, keywords, maxResults) {
  // Simplified sample product database
  const sampleProducts = [
    {
      id: 'prod_1',
      title: 'Classic Rectangle Frame',
      price: { amount: 149.99, compareAtPrice: null },
      url: '/products/classic-rectangle',
      attributes: {
        eyewear: {
          frameShape: 'rectangle',
          frameMaterial: 'acetate',
          frameColor: 'black',
          recommendedFaceShapes: ['round', 'oval']
        }
      },
      description: 'Classic rectangular frames with a timeless design'
    },
    {
      id: 'prod_2',
      title: 'Modern Round Frame',
      price: { amount: 95.00, compareAtPrice: 125.00 },
      url: '/products/modern-round',
      attributes: {
        eyewear: {
          frameShape: 'round',
          frameMaterial: 'metal',
          frameColor: 'gold',
          recommendedFaceShapes: ['square', 'diamond']
        }
      },
      description: 'Contemporary round frames with a lightweight feel'
    },
    {
      id: 'prod_3',
      title: 'Premium Cat-Eye Frame',
      price: { amount: 299.99, compareAtPrice: null },
      url: '/products/premium-cat-eye',
      attributes: {
        eyewear: {
          frameShape: 'cat-eye',
          frameMaterial: 'acetate',
          frameColor: 'tortoise',
          recommendedFaceShapes: ['round', 'diamond']
        }
      },
      description: 'Premium cat-eye frames with luxurious details'
    },
    {
      id: 'prod_4',
      title: 'Sport Performance Frame',
      price: { amount: 189.99, compareAtPrice: 219.99 },
      url: '/products/sport-performance',
      attributes: {
        eyewear: {
          frameShape: 'wraparound',
          frameMaterial: 'nylon',
          frameColor: 'black',
          recommendedFaceShapes: ['square', 'oblong']
        }
      },
      description: 'High-performance sport frames designed for active lifestyles'
    },
    {
      id: 'prod_5',
      title: 'Rimless Titanium Frame',
      price: { amount: 219.99, compareAtPrice: null },
      url: '/products/rimless-titanium',
      attributes: {
        eyewear: {
          frameShape: 'rectangle',
          frameMaterial: 'titanium',
          frameColor: 'silver',
          recommendedFaceShapes: ['oval', 'heart']
        }
      },
      description: 'Minimalist rimless frames made from premium titanium'
    },
    {
      id: 'prod_6',
      title: 'Vintage Aviator Frame',
      price: { amount: 159.99, compareAtPrice: null },
      url: '/products/vintage-aviator',
      attributes: {
        eyewear: {
          frameShape: 'aviator',
          frameMaterial: 'metal',
          frameColor: 'gold',
          recommendedFaceShapes: ['square', 'heart']
        }
      },
      description: 'Iconic aviator frames with a vintage-inspired design'
    },
    {
      id: 'prod_7',
      title: 'Blue Light Blocking Glasses',
      price: { amount: 89.99, compareAtPrice: 109.99 },
      url: '/products/blue-light-glasses',
      attributes: {
        eyewear: {
          frameShape: 'rectangle',
          frameMaterial: 'acetate',
          frameColor: 'black',
          recommendedFaceShapes: ['all'],
          blueLight: true
        }
      },
      description: 'Computer glasses designed to reduce eye strain during screen time'
    }
  ];
  
  // Add simulated images to products
  sampleProducts.forEach(product => {
    product.images = [
      { url: `https://example.com/images/${product.id}.jpg` }
    ];
  });
  
  // Filter products based on query and keywords
  let filteredProducts = [...sampleProducts];
  
  // Function to check if product matches keywords
  const productMatchesKeywords = (product, keywords) => {
    if (keywords.length === 0) return true;
    
    return keywords.some(keyword => {
      const lowerKeyword = keyword.toLowerCase();
      
      // Check title
      if (product.title.toLowerCase().includes(lowerKeyword)) return true;
      
      // Check description
      if (product.description.toLowerCase().includes(lowerKeyword)) return true;
      
      // Check attributes
      if (product.attributes.eyewear.frameShape.toLowerCase().includes(lowerKeyword)) return true;
      if (product.attributes.eyewear.frameMaterial.toLowerCase().includes(lowerKeyword)) return true;
      if (product.attributes.eyewear.frameColor.toLowerCase().includes(lowerKeyword)) return true;
      
      // Check face shapes
      if (product.attributes.eyewear.recommendedFaceShapes.some(shape => 
        lowerKeyword.includes(shape))) return true;
      
      // Check blue light
      if (lowerKeyword === 'blue light' && product.attributes.eyewear.blueLight) return true;
      
      return false;
    });
  };
  
  // Apply filters
  filteredProducts = filteredProducts.filter(product => 
    productMatchesKeywords(product, keywords)
  );
  
  // If no products match, return a sample selection
  if (filteredProducts.length === 0) {
    filteredProducts = sampleProducts.slice(0, maxResults);
  }
  
  // Limit to maxResults
  return filteredProducts.slice(0, maxResults);
}

/**
 * Generates suggested follow-up queries
 * @param {string} query - The user's query
 * @param {string[]} keywords - Extracted keywords
 * @returns {string[]} Suggested queries
 */
function generateSuggestedQueries(query, keywords) {
  const suggestions = [
    "What frames work best for a round face?",
    "Do you have blue light blocking glasses?",
    "Can you show me lightweight frames?",
    "What are your most popular sunglasses?",
    "Do you have any Ray-Ban frames?",
    "What's the difference between acetate and metal frames?",
    "How do I choose frames for my face shape?",
    "Do you have any luxury brand eyewear?"
  ];
  
  // If we have a face shape keyword, suggest style questions
  if (keywords.some(k => k.includes('face'))) {
    return [
      "What frame color would look good with my complexion?",
      "Can you show me trendy frames for my face shape?",
      "What brands work best for my face shape?",
      "Should I choose thick or thin frames?"
    ];
  }
  
  // If we have a material keyword, suggest comparison questions
  if (keywords.some(k => ['metal', 'titanium', 'plastic', 'acetate'].includes(k))) {
    return [
      `What are the benefits of ${keywords.find(k => ['metal', 'titanium', 'plastic', 'acetate'].includes(k))} frames?`,
      "Which material is most durable?",
      "Which material is most comfortable?",
      "Do you have lightweight frame options?"
    ];
  }
  
  // If we have a brand keyword, suggest more about that brand
  if (keywords.some(k => ['ray-ban', 'oakley', 'gucci', 'prada'].includes(k))) {
    const brand = keywords.find(k => ['ray-ban', 'oakley', 'gucci', 'prada'].includes(k));
    return [
      `What's new from ${brand}?`,
      `Do you have ${brand} sunglasses?`,
      `What are the most popular ${brand} styles?`,
      "Can you show me other luxury brands?"
    ];
  }
  
  // Default to a random selection of 4 suggestions
  const shuffled = [...suggestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 4);
}
