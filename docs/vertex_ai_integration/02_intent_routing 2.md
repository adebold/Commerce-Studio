# Intent Routing System for Vertex AI Integration

## Overview

The Intent Routing System is a critical component of the Vertex AI integration architecture. It analyzes user queries to determine the most appropriate processing path, ensuring that domain-specific expertise is leveraged when necessary while utilizing Vertex AI's capabilities for general e-commerce functions.

## Intent Router Design

The Intent Router operates as an intelligent decision-making system that:

1. Analyzes incoming user messages
2. Classifies the primary intent
3. Determines the appropriate handler (Vertex AI, domain-specific, or hybrid)
4. Routes the query with necessary context

## Implementation Components

### 1. Intent Classification Service

```javascript
// src/conversational_ai/integrations/vertex_ai/intent_classifier.js
class IntentClassifier {
  constructor(config) {
    this.domainTerminology = config.domainTerminology;
    this.generalShoppingTerms = config.generalShoppingTerms;
    this.intentThresholds = config.intentThresholds;
    this.vertexAiClient = config.vertexAiClient;
  }
  
  async classifyIntent(userMessage, sessionContext = {}) {
    // First, use Vertex AI's built-in intent classification
    const vertexClassification = await this.vertexAiClient.classifyIntent(userMessage);
    
    // Then, enhance with domain-specific classification
    const domainClassification = this.classifyDomainSpecificIntent(userMessage);
    
    // Combine classifications with weighted scoring
    return this.combineClassifications(vertexClassification, domainClassification, sessionContext);
  }
  
  classifyDomainSpecificIntent(userMessage) {
    const normalizedMessage = userMessage.toLowerCase();
    
    // Score domain-specific relevance
    let domainScore = 0;
    let matchedTerms = [];
    
    // Check for domain terminology matches
    for (const [term, weight] of Object.entries(this.domainTerminology)) {
      if (normalizedMessage.includes(term)) {
        domainScore += weight;
        matchedTerms.push(term);
      }
    }
    
    // Check for intent-specific patterns
    const intentMatches = this.matchIntentPatterns(normalizedMessage);
    
    return {
      domainScore,
      matchedTerms,
      intentMatches,
      threshold: this.intentThresholds.domain
    };
  }
  
  combineClassifications(vertexClassification, domainClassification, sessionContext) {
    // Determine if domain score exceeds threshold
    const isDomainSpecific = domainClassification.domainScore >= domainClassification.threshold;
    
    // Check if current conversation context indicates ongoing domain-specific interaction
    const contextIndicatesDomainSpecific = this.contextSuggestsDomainExpertise(sessionContext);
    
    // Determine routing type
    let routingType;
    if (isDomainSpecific || contextIndicatesDomainSpecific) {
      if (vertexClassification.shoppingIntent === 'high') {
        routingType = 'HYBRID';
      } else {
        routingType = 'DOMAIN_SPECIFIC';
      }
    } else {
      routingType = 'VERTEX_AI';
    }
    
    return {
      routingType,
      vertexClassification,
      domainClassification,
      confidence: this.calculateConfidence(routingType, vertexClassification, domainClassification),
      recommendedHandler: this.getRecommendedHandler(routingType, domainClassification.intentMatches)
    };
  }
  
  getRecommendedHandler(routingType, intentMatches) {
    if (routingType === 'DOMAIN_SPECIFIC') {
      // Map to appropriate domain handler
      if (intentMatches.includes('style_recommendation')) {
        return 'styleRecommendationHandler';
      } else if (intentMatches.includes('frame_finder')) {
        return 'frameFindingHandler';  
      } else if (intentMatches.includes('fit_consultation')) {
        return 'fitConsultationHandler';
      }
      // Default domain handler
      return 'generalEyewearHandler';
    }
    
    return 'vertexAiHandler';
  }
}
```

### 2. Intent Router Implementation

```javascript
// src/conversational_ai/integrations/vertex_ai/intent_router.js
class IntentRouter {
  constructor(config) {
    this.classifier = new IntentClassifier(config.classifierConfig);
    this.handlers = {
      vertexAiHandler: config.vertexAiHandler,
      styleRecommendationHandler: config.styleRecommendationHandler,
      frameFindingHandler: config.frameFindingHandler,
      fitConsultationHandler: config.fitConsultationHandler,
      generalEyewearHandler: config.generalEyewearHandler
    };
    this.contextManager = config.contextManager;
    this.hybridResponseGenerator = config.hybridResponseGenerator;
  }
  
  async routeRequest(userMessage, sessionId) {
    // Get current session context
    const sessionContext = await this.contextManager.getSessionContext(sessionId);
    
    // Classify intent
    const classification = await this.classifier.classifyIntent(userMessage, sessionContext);
    
    // Log intent classification for monitoring
    console.log(`Intent classification for session ${sessionId}:`, classification);
    
    // Update context with classification
    await this.contextManager.updateContext(sessionId, {
      lastClassification: classification,
      lastUserMessage: userMessage,
      timestamp: new Date().toISOString()
    });
    
    // Route based on classification
    let response;
    switch (classification.routingType) {
      case 'DOMAIN_SPECIFIC':
        response = await this.handleDomainSpecificRequest(
          userMessage, 
          classification.recommendedHandler,
          sessionContext
        );
        break;
      
      case 'HYBRID':
        response = await this.handleHybridRequest(
          userMessage,
          classification.recommendedHandler,
          sessionContext
        );
        break;
      
      case 'VERTEX_AI':
      default:
        response = await this.handlers.vertexAiHandler.processRequest(
          userMessage, 
          sessionContext
        );
        break;
    }
    
    // Update context with response information
    await this.contextManager.updateContext(sessionId, {
      lastResponse: response,
      lastResponseTimestamp: new Date().toISOString()
    });
    
    return response;
  }
  
  async handleDomainSpecificRequest(userMessage, handlerName, sessionContext) {
    const handler = this.handlers[handlerName];
    if (!handler) {
      console.error(`Handler not found: ${handlerName}`);
      return this.handlers.generalEyewearHandler.processRequest(userMessage, sessionContext);
    }
    
    return handler.processRequest(userMessage, sessionContext);
  }
  
  async handleHybridRequest(userMessage, domainHandlerName, sessionContext) {
    // Get domain-specific response
    const domainHandler = this.handlers[domainHandlerName] || this.handlers.generalEyewearHandler;
    const domainResponse = await domainHandler.processRequest(userMessage, sessionContext);
    
    // Get Vertex AI response
    const vertexResponse = await this.handlers.vertexAiHandler.processRequest(
      userMessage, 
      sessionContext
    );
    
    // Combine responses
    return this.hybridResponseGenerator.combineResponses(
      domainResponse,
      vertexResponse,
      userMessage,
      sessionContext
    );
  }
}
```

## Intent Classification Strategy

The intent classification is based on a multi-faceted approach:

1. **Domain Terminology Analysis**
   - Specialized eyewear terms and concepts
   - Technical product attributes
   - Industry-specific concerns

2. **Intent Pattern Matching**
   - Pre-purchase consultation patterns
   - Product comparison patterns
   - Fit/comfort issue patterns

3. **Context-Based Enhancement**
   - Conversation flow analysis
   - User preference history
   - Previous domain-specific interactions

## Eyewear-Specific Intent Categories

| Intent Category | Examples | Routing |
|-----------------|----------|---------|
| Style Consultation | "What frames suit a round face?", "Modern styles for work" | DOMAIN_SPECIFIC |
| Frame Selection | "Best frames for my face shape", "Lightweight frame options" | DOMAIN_SPECIFIC |
| Fit Consultation | "Glasses sliding down my nose", "Frames pinching" | DOMAIN_SPECIFIC |
| Technical Questions | "Progressive lens options", "Blue light filtering" | HYBRID |
| Product Browsing | "Show me black frames", "Men's sunglasses" | VERTEX_AI |
| Cart Operations | "Add to cart", "Checkout", "Remove item" | VERTEX_AI |
| Order Management | "Order status", "Return policy" | VERTEX_AI |

## Domain Terminology Configuration

Configure domain-specific terminology with weighted importance:

```javascript
// Example configuration for eyewear domain
const eyewearTerminology = {
  // Face shapes (high relevance)
  "round face": 0.9,
  "oval face": 0.9,
  "square face": 0.9,
  "heart shaped face": 0.9,
  "diamond face": 0.9,
  
  // Frame styles (high relevance)
  "cat eye": 0.8,
  "wayfarer": 0.8,
  "aviator": 0.8,
  "rectangular": 0.8,
  "browline": 0.8,
  "round frames": 0.8,
  
  // Fit issues (high relevance)
  "sliding down": 0.9,
  "pinching": 0.9,
  "pressure points": 0.9,
  "nose pads": 0.8,
  "temple length": 0.8,
  
  // Materials (medium relevance)
  "acetate": 0.7,
  "titanium": 0.7,
  "stainless steel": 0.7,
  "monel": 0.7,
  
  // Lens types (medium relevance)
  "progressive": 0.7,
  "bifocal": 0.7,
  "single vision": 0.7,
  "transition lenses": 0.7,
  "photochromic": 0.7,
  
  // Features (medium relevance)
  "anti-reflective": 0.6,
  "blue light filtering": 0.6,
  "polarized": 0.6,
  "scratch resistant": 0.6
};

// Example configuration for general shopping terms
const generalShoppingTerms = {
  "buy": 0.9,
  "purchase": 0.9,
  "add to cart": 0.9,
  "checkout": 0.9,
  "order": 0.8,
  "shipping": 0.8,
  "delivery": 0.8,
  "cost": 0.7,
  "price": 0.7,
  "discount": 0.7,
  "coupon": 0.7,
  "compare": 0.6,
  "review": 0.6,
  "rating": 0.6
};
```

## Intent Router Agent Prompt

The Intent Router system can be enhanced with a prompt-based approach to improve classification:

```markdown
# Intent Router Agent Prompt

## Agent Purpose
You are an Intent Router Agent responsible for analyzing user queries about eyewear and determining whether to route them to Vertex AI's general shopping capabilities or to domain-specific expert handlers.

## Input Context
- User message text
- Conversation history
- User profile information (if available)
- Current stage in shopping journey

## Decision Process
1. ANALYZE the user query for:
   - Primary intent category (informational, transactional, navigational)
   - Eyewear-specific terminology or questions
   - Shopping journey stage indicators

2. CLASSIFY the query into one of the following:
   - DOMAIN_SPECIFIC: Requires specialized eyewear knowledge
   - GENERAL_SHOPPING: Can be handled by standard e-commerce capabilities
   - HYBRID: Requires both eyewear expertise and general shopping capabilities

3. For DOMAIN_SPECIFIC or HYBRID queries, EXTRACT:
   - Eyewear-specific parameters (e.g., style preferences, face shape, fit issues)
   - User constraints or requirements
   - Expertise level indicators

## Output
- Routing decision with confidence score
- Extracted parameters for the receiving system
- Recommended follow-up questions if clarification is needed

## Routing Guidelines

Route to DOMAIN_SPECIFIC when:
- Query contains face shape terminology
- Query asks about frame style suitability
- Query describes fit issues or comfort problems
- Query mentions technical eyewear terms (progressive, bifocal, etc.)
- Query asks for personalized style advice

Route to VERTEX_AI when:
- Query focuses on purchasing, cart, or checkout
- Query asks about pricing, shipping, or store policies
- Query requests general product browsing
- Query is about order status or account management
- Query has no eyewear-specific terminology

Route to HYBRID when:
- Query contains both shopping intent and eyewear expertise needs
- Query asks about specific products with technical requirements
- Query compares products based on eyewear-specific features
- Query shows shopping readiness but needs style or fit guidance
```

## Extending for Other Domains

This intent routing system is designed to be adaptable to other industry domains. To extend it:

1. Create a new domain terminology configuration file
2. Update intent patterns to match the new domain's consultation patterns
3. Add domain-specific handlers for specialized processing
4. Configure the appropriate thresholds for the new domain

For example, to adapt for a jewelry retail domain:

```javascript
// Example configuration for jewelry domain
const jewelryTerminology = {
  // Metals
  "gold": 0.8,
  "silver": 0.8,
  "platinum": 0.8,
  "white gold": 0.8,
  "rose gold": 0.8,
  
  // Gemstones
  "diamond": 0.9,
  "sapphire": 0.9,
  "emerald": 0.9,
  "ruby": 0.9,
  "carat": 0.9,
  "clarity": 0.9,
  "cut": 0.9,
  "color grade": 0.9,
  
  // Jewelry types
  "engagement ring": 0.9,
  "wedding band": 0.9,
  "necklace": 0.7,
  "bracelet": 0.7,
  "earrings": 0.7,
  
  // Style terms
  "vintage": 0.6,
  "modern": 0.6,
  "halo setting": 0.8,
  "solitaire": 0.8,
  "pave": 0.8
};
```

## Next Steps

- [Domain Expertise Injection](03_domain_expertise_injection.md)
- [Product Catalog Adapter](04_product_catalog_adapter.md)
