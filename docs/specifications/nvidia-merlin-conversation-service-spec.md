# NVIDIA Merlin Conversational AI Service Implementation Specification
## Intelligent Conversation Engine for AI Avatar Chat System

## Document Information
- **Document Type**: Technical Implementation Specification
- **Service**: NVIDIA Merlin Conversational AI Integration
- **Version**: 1.0
- **Date**: January 2025
- **Implementation Phase**: Phase 1.1 - NVIDIA Service Integration Setup
- **API Key**: iulzg9oedq-60se7t722e-dpxw5krfwk

## Overview

This specification defines the complete implementation details for the NVIDIA Merlin Conversational AI Service integration, including natural language understanding, context-aware conversation management, eyewear domain expertise, and personalized shopping assistance for the AI Avatar Chat System.

## 1. Service Architecture

### 1.1 File Structure
```
services/nvidia/
├── merlin-conversation-service.js       # Main service implementation
├── config/
│   ├── conversation-config.js           # Conversation management settings
│   ├── model-config.js                  # AI model configuration
│   ├── domain-config.js                 # Eyewear domain specialization
│   └── personality-config.js            # Avatar personality settings
├── models/
│   ├── conversation-model.js            # Conversation data models
│   ├── intent-model.js                  # Intent classification models
│   ├── entity-model.js                  # Entity extraction models
│   ├── context-model.js                 # Context management models
│   └── user-profile-model.js            # User profile models
├── controllers/
│   ├── conversation-controller.js       # Conversation flow control
│   ├── intent-controller.js             # Intent processing
│   ├── entity-controller.js             # Entity extraction
│   ├── context-controller.js            # Context management
│   └── recommendation-controller.js     # Product recommendations
├── processors/
│   ├── nlp-processor.js                 # Natural language processing
│   ├── intent-classifier.js             # Intent classification
│   ├── entity-extractor.js              # Named entity recognition
│   ├── sentiment-analyzer.js            # Sentiment analysis
│   └── response-generator.js            # Response generation
├── knowledge/
│   ├── eyewear-knowledge-base.js        # Eyewear domain knowledge
│   ├── product-knowledge.js             # Product catalog integration
│   ├── style-knowledge.js               # Style and fashion expertise
│   ├── face-shape-knowledge.js          # Face shape analysis
│   └── brand-knowledge.js               # Brand information
├── utils/
│   ├── conversation-utils.js            # Utility functions
│   ├── context-manager.js               # Context state management
│   ├── memory-manager.js                # Long-term memory
│   └── learning-optimizer.js            # Continuous learning
└── tests/
    ├── merlin-conversation-service.test.js # Unit tests
    ├── conversation-flow.test.js         # Conversation tests
    ├── intent-classification.test.js     # Intent tests
    ├── entity-extraction.test.js         # Entity tests
    ├── knowledge-base.test.js            # Knowledge tests
    └── performance.test.js               # Performance tests
```

### 1.2 Core Service Implementation

```javascript
/**
 * NVIDIA Merlin Conversational AI Service
 * 
 * This service provides intelligent conversation capabilities with
 * eyewear domain expertise for personalized shopping assistance.
 */

class MerlinConversationalService {
  constructor(config) {
    this.config = config;
    this.isInitialized = false;
    this.activeConversations = new Map();
    this.userProfiles = new Map();
    this.knowledgeBase = new EyewearKnowledgeBase();
    this.contextManager = new ContextManager();
    this.intentClassifier = new IntentClassifier();
    this.entityExtractor = new EntityExtractor();
    this.responseGenerator = new ResponseGenerator();
    this.performanceMonitor = new PerformanceMonitor();
    this.errorHandler = new ErrorHandler();
    this.apiKey = 'iulzg9oedq-60se7t722e-dpxw5krfwk';
  }

  // Service Lifecycle Management
  async initialize(config) {
    // Implementation details for service initialization
    // - Validate Merlin configuration with provided API key
    // - Establish connection to Merlin services
    // - Initialize conversation models
    // - Load eyewear knowledge base
    // - Set up context management
    // - Initialize intent classification
    // - Configure response generation
    // - Start performance monitoring
  }

  async shutdown() {
    // Implementation details for graceful shutdown
    // - Save active conversation states
    // - Update user profiles
    // - Close model connections
    // - Clean up memory resources
    // - Stop monitoring services
  }

  // Conversation Management
  async createConversation(userId, context) {
    // Implementation details for conversation creation
    // - Validate user and context
    // - Initialize conversation session
    // - Load user profile and history
    // - Set up conversation context
    // - Configure personality settings
    // - Return conversation session
  }

  async processMessage(sessionId, message) {
    // Implementation details for message processing
    // - Validate session and message
    // - Classify user intent
    // - Extract entities and context
    // - Update conversation state
    // - Generate appropriate response
    // - Update user profile
    // - Return AI response
  }

  async updateContext(sessionId, context) {
    // Implementation details for context updates
    // - Validate context data
    // - Merge with existing context
    // - Update conversation state
    // - Adjust response strategy
    // - Notify dependent services
  }

  async endConversation(sessionId) {
    // Implementation details for conversation ending
    // - Generate conversation summary
    // - Update user profile
    // - Save conversation history
    // - Clean up session resources
    // - Return conversation metrics
  }

  // Intent and Entity Processing
  async classifyIntent(message) {
    // Implementation details for intent classification
    // - Preprocess message text
    // - Apply domain-specific models
    // - Calculate confidence scores
    // - Map to action categories
    // - Return intent classification
  }

  async extractEntities(message) {
    // Implementation details for entity extraction
    // - Identify named entities
    // - Extract product references
    // - Recognize user preferences
    // - Map entity relationships
    // - Return structured entity data
  }

  async generateRecommendations(userProfile, context) {
    // Implementation details for recommendation generation
    // - Analyze user preferences
    // - Consider face shape analysis
    // - Apply style expertise
    // - Filter product catalog
    // - Rank recommendations
    // - Return personalized suggestions
  }

  // Response Generation
  async generateResponse(intent, context, recommendations) {
    // Implementation details for response generation
    // - Select appropriate response template
    // - Incorporate context and entities
    // - Apply personality traits
    // - Include product recommendations
    // - Optimize for avatar delivery
    // - Return natural language response
  }

  // Learning and Optimization
  async recordFeedback(sessionId, feedback) {
    // Implementation details for feedback recording
    // - Validate feedback data
    // - Update conversation quality metrics
    // - Adjust model parameters
    // - Improve future responses
    // - Store learning data
  }

  async updateUserModel(userId, interactions) {
    // Implementation details for user model updates
    // - Analyze interaction patterns
    // - Update preference models
    // - Adjust personalization
    // - Improve recommendation accuracy
    // - Store updated profile
  }

  // Health and Monitoring
  async getServiceHealth() {
    // Implementation details for health check
    // - Check service connectivity
    // - Validate model availability
    // - Monitor response quality
    // - Check resource usage
    // - Return health status
  }

  async getPerformanceMetrics() {
    // Implementation details for performance metrics
    // - Collect conversation metrics
    // - Analyze response quality
    // - Monitor user satisfaction
    // - Calculate accuracy scores
    // - Return metrics report
  }
}
```

## 2. Authentication and Model Configuration

### 2.1 Service Authentication

```javascript
// Authentication configuration with provided API key
const authenticationConfig = {
  // API Configuration
  api: {
    endpoint: 'https://api.merlin.nvidia.com/v1',
    apiKey: 'iulzg9oedq-60se7t722e-dpxw5krfwk',
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000 // 1 second
  },
  
  // Model Configuration
  model: {
    modelId: 'merlin-eyewear-specialist-v1',
    deploymentId: 'commerce-studio-deployment',
    version: 'latest',
    region: 'us-east-1'
  },
  
  // Security Settings
  security: {
    enableTLS: true,
    tlsVersion: '1.3',
    validateCertificates: true,
    userAgent: 'Commerce-Studio-Avatar-Chat/1.0'
  }
};
```

### 2.2 Conversation Model Configuration

```javascript
// Conversation model configuration
const conversationModelConfig = {
  // Base Model Settings
  model: {
    architecture: 'transformer',
    modelSize: 'large',
    domain: 'eyewear',
    specialization: 'retail_assistant',
    maxTokens: 2048,
    temperature: 0.7,
    topP: 0.9,
    topK: 50,
    repetitionPenalty: 1.1
  },
  
  // Conversation Management
  conversation: {
    contextWindow: 10, // Remember last 10 exchanges
    contextCompression: true,
    longTermMemory: true,
    personalityType: 'helpful_expert',
    responseStyle: 'conversational',
    multiTurnCapability: true,
    contextPersistence: true,
    maxConversationLength: 50 // Maximum turns
  },
  
  // Domain Specialization
  domainSpecialization: {
    eyewear: {
      enabled: true,
      expertiseLevel: 'advanced',
      knowledgeAreas: [
        'face_shape_analysis',
        'frame_recommendations',
        'style_consultation',
        'brand_knowledge',
        'technical_specifications',
        'fashion_trends'
      ]
    }
  },
  
  // Safety and Content Filtering
  safetySettings: {
    contentFilter: {
      enabled: true,
      filterLevel: 'moderate',
      customFilters: ['inappropriate_content', 'spam', 'off_topic']
    },
    responseValidation: {
      enabled: true,
      factualAccuracy: true,
      brandCompliance: true,
      professionalTone: true
    }
  }
};
```

### 2.3 Personality Configuration

```javascript
// Avatar personality configuration
const personalityConfig = {
  // Core Personality Traits
  personality: {
    warmth: 0.8,           // Friendly and approachable
    professionalism: 0.9,  // Expert and reliable
    enthusiasm: 0.7,       // Positive and engaging
    empathy: 0.8,          // Understanding and caring
    confidence: 0.8,       // Knowledgeable and assured
    patience: 0.9,         // Tolerant and helpful
    creativity: 0.6,       // Innovative suggestions
    humor: 0.3            // Light and appropriate
  },
  
  // Communication Style
  communicationStyle: {
    formality: 'professional_friendly',
    verbosity: 'balanced',
    technicalLevel: 'adaptive',
    explanationStyle: 'clear_and_detailed',
    questioningStyle: 'guided_discovery',
    encouragementLevel: 'supportive'
  },
  
  // Conversation Approach
  conversationApproach: {
    // Greeting Style
    greeting: {
      style: 'warm_professional',
      personalization: true,
      contextAwareness: true,
      brandMention: true
    },
    
    // Consultation Style
    consultation: {
      approach: 'consultative_selling',
      needsAssessment: true,
      educationalFocus: true,
      optionPresentation: 'curated_selection',
      decisionSupport: 'guided_comparison'
    },
    
    // Problem Resolution
    problemResolution: {
      approach: 'solution_oriented',
      empathyLevel: 'high',
      alternativeOptions: true,
      escalationPath: 'human_handoff'
    }
  },
  
  // Emotional Intelligence
  emotionalIntelligence: {
    emotionRecognition: true,
    emotionalResponse: true,
    moodAdaptation: true,
    stressDetection: true,
    satisfactionMonitoring: true
  }
};
```

## 3. Eyewear Domain Knowledge Base

### 3.1 Face Shape Expertise

```javascript
// Face shape analysis and recommendations
const faceShapeKnowledge = {
  // Face Shape Characteristics
  faceShapes: {
    oval: {
      characteristics: [
        'Balanced proportions',
        'Slightly wider at cheekbones',
        'Gently rounded jawline',
        'Forehead slightly wider than jaw'
      ],
      recommendations: {
        frameShapes: ['round', 'square', 'rectangular', 'cat-eye', 'aviator'],
        avoidShapes: ['oversized_round'],
        reasoning: 'Oval faces are versatile and can wear most frame shapes'
      },
      styleAdvice: [
        'Experiment with different styles',
        'Consider bold statement frames',
        'Try both angular and curved designs',
        'Focus on personal style preferences'
      ]
    },
    
    round: {
      characteristics: [
        'Equal width and height',
        'Soft, curved lines',
        'Full cheeks',
        'Rounded chin'
      ],
      recommendations: {
        frameShapes: ['square', 'rectangular', 'cat-eye', 'geometric'],
        avoidShapes: ['round', 'oversized_round'],
        reasoning: 'Angular frames add definition and structure to round faces'
      },
      styleAdvice: [
        'Choose frames wider than face width',
        'Look for angular or geometric shapes',
        'Consider frames with decorative temples',
        'Avoid circular or curved frames'
      ]
    },
    
    square: {
      characteristics: [
        'Strong, angular jawline',
        'Broad forehead',
        'Equal face width and length',
        'Defined facial structure'
      ],
      recommendations: {
        frameShapes: ['round', 'oval', 'cat-eye', 'aviator'],
        avoidShapes: ['square', 'rectangular'],
        reasoning: 'Curved frames soften angular features and add balance'
      },
      styleAdvice: [
        'Choose frames with curved lines',
        'Look for rounded or oval shapes',
        'Consider frames that sit higher on nose',
        'Avoid boxy or angular frames'
      ]
    },
    
    heart: {
      characteristics: [
        'Wide forehead',
        'Narrow chin',
        'High cheekbones',
        'Triangular shape'
      ],
      recommendations: {
        frameShapes: ['cat-eye', 'round', 'aviator', 'oval'],
        avoidShapes: ['top-heavy', 'oversized_top'],
        reasoning: 'Bottom-heavy frames balance the wider forehead'
      },
      styleAdvice: [
        'Choose frames wider at bottom',
        'Look for decorative lower rims',
        'Consider rimless or semi-rimless',
        'Avoid heavy top frames'
      ]
    },
    
    diamond: {
      characteristics: [
        'Narrow forehead and chin',
        'Wide cheekbones',
        'Angular features',
        'Distinctive bone structure'
      ],
      recommendations: {
        frameShapes: ['cat-eye', 'oval', 'round', 'rectangular'],
        avoidShapes: ['narrow', 'geometric'],
        reasoning: 'Frames that highlight eyes and soften cheekbones work best'
      },
      styleAdvice: [
        'Choose frames that emphasize brow line',
        'Look for cat-eye or oval shapes',
        'Consider decorative top details',
        'Avoid narrow or small frames'
      ]
    },
    
    oblong: {
      characteristics: [
        'Longer than wide',
        'Straight cheek lines',
        'Long nose bridge',
        'Rectangular proportions'
      ],
      recommendations: {
        frameShapes: ['round', 'square', 'wayfarer', 'aviator'],
        avoidShapes: ['narrow', 'small'],
        reasoning: 'Wide frames add width and balance the face length'
      },
      styleAdvice: [
        'Choose frames with depth',
        'Look for decorative temples',
        'Consider oversized styles',
        'Avoid narrow or small frames'
      ]
    }
  },
  
  // Measurement Guidelines
  measurementGuidelines: {
    faceWidth: {
      narrow: '< 125mm',
      average: '125-135mm',
      wide: '> 135mm'
    },
    faceLength: {
      short: '< 115mm',
      average: '115-125mm',
      long: '> 125mm'
    },
    proportionRatios: {
      oval: { ratio: 1.5, tolerance: 0.1 },
      round: { ratio: 1.0, tolerance: 0.1 },
      square: { ratio: 1.0, tolerance: 0.1 },
      heart: { ratio: 1.3, tolerance: 0.1 },
      diamond: { ratio: 1.4, tolerance: 0.1 },
      oblong: { ratio: 1.7, tolerance: 0.1 }
    }
  }
};
```

### 3.2 Frame Knowledge Base

```javascript
// Comprehensive frame knowledge
const frameKnowledge = {
  // Frame Types
  frameTypes: {
    fullRim: {
      description: 'Complete frame around entire lens',
      benefits: ['Maximum durability', 'Wide style variety', 'Strong lens support'],
      suitableFor: ['All prescriptions', 'Active lifestyles', 'Fashion statements'],
      considerations: ['Heavier weight', 'More visible on face']
    },
    
    rimless: {
      description: 'No frame around lenses, minimal hardware',
      benefits: ['Lightweight', 'Subtle appearance', 'Unobstructed view'],
      suitableFor: ['Professional settings', 'Minimal style preference', 'Light prescriptions'],
      considerations: ['Less durable', 'Limited lens shapes', 'Higher maintenance']
    },
    
    semiRimless: {
      description: 'Frame on top portion only',
      benefits: ['Balanced style', 'Lighter than full-rim', 'Professional look'],
      suitableFor: ['Business environments', 'Moderate prescriptions', 'Versatile styling'],
      considerations: ['Moderate durability', 'Limited bottom design options']
    }
  },
  
  // Frame Materials
  materials: {
    acetate: {
      properties: ['Lightweight', 'Hypoallergenic', 'Color variety', 'Adjustable'],
      benefits: ['Comfortable wear', 'Vibrant colors', 'Easy to repair', 'Eco-friendly options'],
      considerations: ['Can become brittle', 'May fade over time', 'Requires careful handling'],
      priceRange: 'mid-range',
      durability: 'good',
      maintenance: 'moderate'
    },
    
    titanium: {
      properties: ['Ultra-lightweight', 'Corrosion-resistant', 'Hypoallergenic', 'Flexible'],
      benefits: ['Extremely durable', 'Comfortable for all-day wear', 'Suitable for sensitive skin'],
      considerations: ['Higher cost', 'Limited color options', 'Difficult to repair'],
      priceRange: 'premium',
      durability: 'excellent',
      maintenance: 'low'
    },
    
    stainlessSteel: {
      properties: ['Strong', 'Corrosion-resistant', 'Adjustable', 'Sleek appearance'],
      benefits: ['Long-lasting', 'Professional look', 'Good value', 'Easy to maintain'],
      considerations: ['Heavier than titanium', 'Can cause allergies in some people'],
      priceRange: 'mid-range',
      durability: 'very good',
      maintenance: 'low'
    },
    
    carbonFiber: {
      properties: ['Ultra-lightweight', 'High strength', 'Modern appearance', 'Flexible'],
      benefits: ['Extremely durable', 'Unique texture', 'Comfortable wear', 'Sporty look'],
      considerations: ['Premium pricing', 'Limited availability', 'Specialized repairs'],
      priceRange: 'premium',
      durability: 'excellent',
      maintenance: 'low'
    }
  },
  
  // Style Categories
  styleCategories: {
    classic: {
      characteristics: ['Timeless designs', 'Neutral colors', 'Traditional shapes'],
      examples: ['Aviator', 'Wayfarer', 'Round', 'Rectangular'],
      suitableFor: ['Professional settings', 'Conservative style', 'Long-term wear'],
      brands: ['Ray-Ban', 'Persol', 'Oliver Peoples']
    },
    
    trendy: {
      characteristics: ['Current fashion', 'Bold colors', 'Unique shapes'],
      examples: ['Oversized', 'Cat-eye', 'Geometric', 'Colored frames'],
      suitableFor: ['Fashion-forward individuals', 'Statement pieces', 'Casual wear'],
      brands: ['Gucci', 'Prada', 'Tom Ford']
    },
    
    sporty: {
      characteristics: ['Durable construction', 'Secure fit', 'Performance features'],
      examples: ['Wraparound', 'Lightweight', 'Flexible', 'Impact-resistant'],
      suitableFor: ['Active lifestyles', 'Sports activities', 'Outdoor use'],
      brands: ['Oakley', 'Nike', 'Adidas']
    },
    
    minimalist: {
      characteristics: ['Clean lines', 'Subtle design', 'Understated elegance'],
      examples: ['Rimless', 'Thin frames', 'Neutral colors', 'Simple shapes'],
      suitableFor: ['Professional environments', 'Subtle style', 'Focus on functionality'],
      brands: ['Lindberg', 'Silhouette', 'Maui Jim']
    }
  }
};
```

### 3.3 Brand Knowledge Base

```javascript
// Brand expertise and positioning
const brandKnowledge = {
  // Luxury Brands
  luxury: {
    'Tom Ford': {
      positioning: 'Ultra-luxury fashion eyewear',
      priceRange: '$400-$800',
      signature: ['Bold designs', 'Premium materials', 'Fashion-forward'],
      targetCustomer: 'Fashion-conscious luxury consumers',
      keyCollections: ['Private Collection', 'Blue Block', 'Sunglasses'],
      brandStory: 'Founded by fashion designer Tom Ford, known for sophisticated luxury'
    },
    
    'Gucci': {
      positioning: 'Italian luxury fashion house',
      priceRange: '$300-$600',
      signature: ['Distinctive designs', 'Logo elements', 'Fashion heritage'],
      targetCustomer: 'Luxury fashion enthusiasts',
      keyCollections: ['GG Collection', 'Ace', 'Vintage-inspired'],
      brandStory: 'Historic Italian brand with modern luxury appeal'
    },
    
    'Prada': {
      positioning: 'Sophisticated Italian luxury',
      priceRange: '$250-$500',
      signature: ['Minimalist elegance', 'Quality craftsmanship', 'Subtle branding'],
      targetCustomer: 'Discerning luxury consumers',
      keyCollections: ['Linea Rossa', 'Classic', 'Sport'],
      brandStory: 'Family-owned Italian luxury house with heritage in leather goods'
    }
  },
  
  // Premium Brands
  premium: {
    'Ray-Ban': {
      positioning: 'Iconic American eyewear',
      priceRange: '$150-$300',
      signature: ['Aviator', 'Wayfarer', 'Timeless designs', 'Quality lenses'],
      targetCustomer: 'Style-conscious consumers seeking classic designs',
      keyCollections: ['Original Aviator', 'Original Wayfarer', 'Clubmaster'],
      brandStory: 'Founded in 1937, created the aviator for US Air Force pilots'
    },
    
    'Oakley': {
      positioning: 'Performance sports eyewear',
      priceRange: '$120-$400',
      signature: ['Sport performance', 'Innovation', 'Durability', 'Technology'],
      targetCustomer: 'Athletes and active lifestyle enthusiasts',
      keyCollections: ['Holbrook', 'Frogskins', 'Radar', 'Jawbreaker'],
      brandStory: 'Founded by Jim Jannard, focused on sports performance innovation'
    },
    
    'Persol': {
      positioning: 'Italian craftsmanship and heritage',
      priceRange: '$200-$400',
      signature: ['Handcrafted quality', 'Classic Italian style', 'Meflecto temples'],
      targetCustomer: 'Sophisticated consumers appreciating craftsmanship',
      keyCollections: ['714 Series', '649 Series', '3019S'],
      brandStory: 'Founded in 1917, known for handcrafted Italian eyewear'
    }
  },
  
  // Accessible Premium
  accessible: {
    'Warby Parker': {
      positioning: 'Accessible designer eyewear',
      priceRange: '$95-$195',
      signature: ['Home try-on', 'Social mission', 'Vintage-inspired', 'Direct-to-consumer'],
      targetCustomer: 'Millennials and Gen Z seeking value and convenience',
      keyCollections: ['Classic', 'Narrow', 'Wide', 'Sun'],
      brandStory: 'Founded to provide designer eyewear at accessible prices'
    },
    
    'Calvin Klein': {
      positioning: 'Modern American minimalism',
      priceRange: '$80-$180',
      signature: ['Clean lines', 'Minimalist design', 'Modern aesthetic'],
      targetCustomer: 'Professional and fashion-conscious consumers',
      keyCollections: ['CK Collection', 'Platinum', 'Jeans'],
      brandStory: 'American fashion brand known for minimalist design philosophy'
    }
  }
};
```

## 4. Intent Classification and Entity Extraction

### 4.1 Intent Classification System

```javascript
// Intent classification configuration
const intentClassificationConfig = {
  // Primary Intents
  primaryIntents: {
    // Shopping Intents
    browse_products: {
      description: 'User wants to explore available products',
      confidence_threshold: 0.8,
      examples: [
        'Show me your glasses',
        'What frames do you have?',
        'I want to see sunglasses',
        'Browse your collection'
      ],
      entities: ['product_type', 'brand', 'style', 'price_range'],
      next_actions: ['show_product_catalog', 'apply_filters', 'ask_preferences']
    },
    
    get_recommendations: {
      description: 'User seeks personalized product recommendations',
      confidence_threshold: 0.8,
      examples: [
        'What frames would suit me?',
        'Recommend glasses for my face',
        'What should I choose?',
        'Help me find the right frames'
      ],
      entities: ['face_shape', 'style_preference', 'use_case', 'budget'],
      next_actions: ['analyze_face_shape', 'assess_preferences', 'generate_recommendations']
    },
    
    ask_about_product: {
      description: 'User has questions about specific products',
      confidence_threshold: 0.8,
      examples: [
        'Tell me about these frames',
        'What material is this?',
        'How much does this cost?',
        'Is this available in other colors?'
      ],
      entities: ['product_id', 'product_attribute', 'specification'],
      next_actions: ['provide_product_details', 'show_alternatives', 'explain_features']
    },
    
    // Consultation Intents
    style_consultation: {
      description: 'User wants style advice and guidance',
      confidence_threshold: 0.8,
      examples: [
        'What style suits me?',
        'Help me choose a look',
        'What\'s trendy right now?',
        'I need style advice'
      ],
      entities: ['style_preference', 'occasion', 'personality', 'lifestyle'],
      next_actions: ['assess_style_preferences', 'provide_style_guidance', 'show_examples']
    },
    
    face_shape_analysis: {
      description: 'User wants face shape analysis and advice',
      confidence_threshold: 0.8,
      examples: [
        'What\'s my face shape?',
        'Analyze my face',
        'What frames suit my face?',
        'Help me understand my features'
      ],
      entities: ['face_measurements', 'facial_features'],
      next_actions: ['initiate_face_analysis', 'explain_face_shape', 'recommend_frames']
    },
    
    // Support Intents
    get_help: {
      description: 'User needs assistance or has questions',
      confidence_threshold: 0.7,
      examples: [
        'I need help',
        'How does this work?',
        'Can you assist me?',
        'I have a question'
      ],
      entities: ['help_topic', 'issue_type'],
      next_actions: ['provide_assistance', 'explain_process', 'offer_guidance']
    },
    
    technical_support: {
      description: 'User has technical issues or questions',
      confidence_threshold: 0.8,
      examples: [
        'The camera isn\'t working',
        'I can\'t see the frames',
        'There\'s a technical problem',
        'Something is broken'
      ],
      entities: ['issue_type', 'error_description'],
      next_actions: ['diagnose_issue', 'provide_solution', 'escalate_if_needed']
    }
  },
  
  // Secondary Intents
  secondaryIntents: {
    express_preference: {
      description: 'User expresses likes, dislikes, or preferences',
      confidence_threshold: 0.7,
      examples: [
        'I like this style',
        'This is too expensive',
        'I prefer metal frames',
        'Not my style'
      ],
      entities: ['preference_type', 'preference_value', 'sentiment'],
      next_actions: ['update_preferences', 'adjust_recommendations', 'acknowledge_feedback']
    },
    
    compare_products: {
      description: 'User wants to compare different products',
      confidence_threshold: 0.8,
      examples: [
        'Compare these frames',
        'What\'s the difference?',
        'Which is better?',
        'Show me alternatives'
      ],
      entities: ['product_ids', 'comparison_criteria'],
      next_actions: ['show_comparison', 'highlight_differences', 'provide_guidance']
    },
    
    purchase_intent: {
      description: 'User shows interest in purchasing',
      confidence_threshold: 0.8,
      examples: [
        'I want to buy this',
        'How do I purchase?',
        'Add to cart',
        'I\'ll take these'
      ],
      entities: ['product_id', 'quantity', 'customization'],
      next