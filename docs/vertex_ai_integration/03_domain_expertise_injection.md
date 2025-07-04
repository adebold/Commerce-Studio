# Domain Expertise Injection for Vertex AI Integration

## Overview

Domain Expertise Injection is a critical component that preserves EyewearML's specialized knowledge within the Vertex AI integration. This system ensures that domain-specific expertise about eyewear, fit, style, and technical specifications enhances the general e-commerce capabilities of Vertex AI.

## Expertise Injection Approaches

There are three primary approaches to injecting domain expertise:

1. **Pre-processing Enhancement**: Augmenting user queries with domain context before sending to Vertex AI
2. **Response Augmentation**: Enhancing Vertex AI responses with domain-specific details and recommendations
3. **Hybrid Processing**: Combining domain-specific responses with Vertex AI responses for comprehensive answers

## Implementation Components

### 1. Domain Expertise Enhancer

```javascript
// src/conversational_ai/integrations/vertex_ai/domain_expertise_enhancer.js
class DomainExpertiseEnhancer {
  constructor(config) {
    this.domainKnowledgeBase = config.domainKnowledgeBase;
    this.productCatalog = config.productCatalog;
    this.enhancementStrategies = config.enhancementStrategies;
    this.contextManager = config.contextManager;
  }
  
  async enhanceUserQuery(userMessage, sessionContext) {
    // Identify domain-specific parameters from user query
    const extractedParams = this.extractDomainParameters(userMessage);
    
    // Augment query with domain context if needed
    if (Object.keys(extractedParams).length > 0) {
      return {
        originalQuery: userMessage,
        enhancedQuery: this.createEnhancedQuery(userMessage, extractedParams, sessionContext),
        extractedParameters: extractedParams
      };
    }
    
    return {
      originalQuery: userMessage,
      enhancedQuery: userMessage,
      extractedParameters: {}
    };
  }
  
  extractDomainParameters(userMessage) {
    const normalizedMessage = userMessage.toLowerCase();
    const params = {};
    
    // Extract face shape information
    const faceShapePatterns = {
      round: /round\s+(face|shaped)/i,
      oval: /oval\s+(face|shaped)/i,
      square: /square\s+(face|shaped)/i,
      heart: /heart\s+(shaped|face)/i,
      diamond: /diamond\s+(shaped|face)/i
    };
    
    for (const [shape, pattern] of Object.entries(faceShapePatterns)) {
      if (pattern.test(normalizedMessage)) {
        params.faceShape = shape;
        break;
      }
    }
    
    // Extract style preferences
    const stylePatterns = {
      modern: /modern|contemporary|sleek/i,
      classic: /classic|timeless|traditional/i,
      vintage: /vintage|retro|old-?fashioned/i,
      trendy: /trendy|fashionable|stylish/i,
      minimalist: /minimalist|simple|clean/i
    };
    
    for (const [style, pattern] of Object.entries(stylePatterns)) {
      if (pattern.test(normalizedMessage)) {
        params.stylePreference = params.stylePreference || [];
        params.stylePreference.push(style);
      }
    }
    
    // Extract fit issues
    const fitIssuePatterns = {
      slipping: /slip(ping|s)?|slide(s|ing)?|falling/i,
      pinching: /pinch(ing|es)?|tight|uncomfortable/i,
      pressure: /pressure|mark(s|ing)?|indent(s|ation)?/i,
      uneven: /uneven|crooked|tilted|slanted/i
    };
    
    for (const [issue, pattern] of Object.entries(fitIssuePatterns)) {
      if (pattern.test(normalizedMessage)) {
        params.fitIssues = params.fitIssues || [];
        params.fitIssues.push(issue);
      }
    }
    
    // Extract additional parameters like material, color, gender, etc.
    
    return params;
  }
  
  createEnhancedQuery(originalQuery, extractedParams, sessionContext) {
    // Add domain context to the query to improve Vertex AI understanding
    let enhancedQuery = originalQuery;
    
    // Add face shape context if detected
    if (extractedParams.faceShape) {
      enhancedQuery += ` [Context: Customer has a ${extractedParams.faceShape} face shape]`;
    }
    
    // Add style preference context if detected
    if (extractedParams.stylePreference && extractedParams.stylePreference.length > 0) {
      enhancedQuery += ` [Context: Customer prefers ${extractedParams.stylePreference.join(', ')} styles]`;
    }
    
    // Add fit issues context if detected
    if (extractedParams.fitIssues && extractedParams.fitIssues.length > 0) {
      enhancedQuery += ` [Context: Customer is experiencing ${extractedParams.fitIssues.join(', ')} issues with their glasses]`;
    }
    
    // Add any relevant context from session history
    if (sessionContext.userPreferences) {
      enhancedQuery += ` [Context: Customer preferences: ${JSON.stringify(sessionContext.userPreferences)}]`;
    }
    
    return enhancedQuery;
  }
  
  async enhanceVertexResponse(vertexResponse, originalQuery, extractedParams, sessionContext) {
    // Determine enhancement strategy based on query and response
    const strategy = this.selectEnhancementStrategy(vertexResponse, originalQuery, extractedParams);
    
    // Apply the selected enhancement strategy
    switch (strategy) {
      case 'PRODUCT_RECOMMENDATIONS':
        return this.enhanceProductRecommendations(vertexResponse, extractedParams, sessionContext);
      
      case 'TECHNICAL_DETAILS':
        return this.enhanceTechnicalDetails(vertexResponse, extractedParams);
      
      case 'FIT_GUIDANCE':
        return this.enhanceFitGuidance(vertexResponse, extractedParams);
      
      case 'STYLE_ADVICE':
        return this.enhanceStyleAdvice(vertexResponse, extractedParams, sessionContext);
      
      case 'NO_ENHANCEMENT':
      default:
        return vertexResponse;
    }
  }
  
  selectEnhancementStrategy(vertexResponse, query, extractedParams) {
    // Logic to select the most appropriate enhancement strategy
    // based on the query, extracted parameters, and Vertex AI response
    
    // Check if response contains product recommendations
    if (vertexResponse.includes('recommend') || 
        vertexResponse.includes('suggest') || 
        vertexResponse.includes('you might like')) {
      return 'PRODUCT_RECOMMENDATIONS';
    }
    
    // Check if response is about technical details
    if (vertexResponse.includes('specification') || 
        vertexResponse.includes('feature') || 
        query.includes('progressive') || 
        query.includes('bifocal')) {
      return 'TECHNICAL_DETAILS';
    }
    
    // Check if query is about fit
    if (extractedParams.fitIssues || 
        query.includes('comfortable') || 
        query.includes('fit')) {
      return 'FIT_GUIDANCE';
    }
    
    // Check if query is about style
    if (extractedParams.stylePreference || 
        extractedParams.faceShape || 
        query.includes('look good') || 
        query.includes('style')) {
      return 'STYLE_ADVICE';
    }
    
    return 'NO_ENHANCEMENT';
  }
  
  async enhanceProductRecommendations(vertexResponse, extractedParams, sessionContext) {
    // Get domain-filtered product recommendations
    const domainFilteredProducts = await this.getDomainFilteredProducts(extractedParams, sessionContext);
    
    if (domainFilteredProducts.length === 0) {
      return vertexResponse;
    }
    
    // Enhance the response with domain-specific product advice
    let enhancedResponse = vertexResponse;
    
    // Add a section explaining why these products are recommended based on domain expertise
    enhancedResponse += this.createDomainExplanation(extractedParams, domainFilteredProducts);
    
    return enhancedResponse;
  }
  
  createDomainExplanation(params, products) {
    let explanation = "\n\nBased on eyewear expertise: ";
    
    // Add face shape rationale
    if (params.faceShape) {
      explanation += `For your ${params.faceShape} face shape, `;
      
      switch (params.faceShape) {
        case 'round':
          explanation += "angular frames like rectangular or square styles will add definition and contrast to your softer features. ";
          break;
        case 'square':
          explanation += "frames with softer edges like round or oval styles will balance your strong jawline. ";
          break;
        case 'heart':
          explanation += "frames that are wider at the bottom or have rimless bottoms will balance your face proportions. ";
          break;
        case 'oval':
          explanation += "you're fortunate as most frame shapes work well with your balanced proportions. ";
          break;
        case 'diamond':
          explanation += "frames with detailing or distinctive brow lines will highlight your eyes and soften angular features. ";
          break;
      }
    }
    
    // Add style preference rationale
    if (params.stylePreference && params.stylePreference.length > 0) {
      explanation += `The recommended frames match your ${params.stylePreference.join(', ')} style preference`;
      explanation += params.faceShape ? " while complementing your face shape. " : ". ";
    }
    
    // Add fit considerations if applicable
    if (params.fitIssues && params.fitIssues.length > 0) {
      explanation += "These selections also address your fit concerns by ";
      
      if (params.fitIssues.includes('slipping')) {
        explanation += "featuring adjustable nose pads for a secure fit. ";
      } else if (params.fitIssues.includes('pinching')) {
        explanation += "offering wider temple width and flexible materials. ";
      } else if (params.fitIssues.includes('pressure')) {
        explanation += "using lightweight materials and balanced temple design. ";
      }
    }
    
    return explanation;
  }
  
  // Other enhancement methods follow the same pattern
}
```

### 2. Domain-Specific Prompting Enhancer

Vertex AI's capabilities can be enhanced by constructing prompts that incorporate domain expertise:

```javascript
// src/conversational_ai/integrations/vertex_ai/prompt_enhancer.js
class DomainPromptEnhancer {
  constructor(config) {
    this.domainKnowledge = config.domainKnowledge;
    this.promptTemplates = config.promptTemplates;
  }
  
  createEnhancedPrompt(userQuery, extractedParams, sessionContext) {
    // Select appropriate prompt template
    const templateKey = this.selectPromptTemplate(userQuery, extractedParams);
    let promptTemplate = this.promptTemplates[templateKey];
    
    if (!promptTemplate) {
      promptTemplate = this.promptTemplates.default;
    }
    
    // Fill in domain knowledge
    let enhancedPrompt = this.fillDomainKnowledge(promptTemplate, extractedParams);
    
    // Add user query
    enhancedPrompt = enhancedPrompt.replace('{{USER_QUERY}}', userQuery);
    
    // Add context information
    enhancedPrompt = this.addContextInformation(enhancedPrompt, sessionContext);
    
    return enhancedPrompt;
  }
  
  selectPromptTemplate(query, params) {
    // Logic to select appropriate template based on query content and extracted params
    if (params.faceShape && (query.includes('recommend') || query.includes('suggest'))) {
      return 'frame_recommendation';
    } else if (params.fitIssues) {
      return 'fit_consultation';
    } else if (query.includes('style') || query.includes('fashion') || query.includes('look')) {
      return 'style_consultation';
    } else if (query.includes('lens') || query.includes('progressive') || query.includes('bifocal')) {
      return 'technical_consultation';
    }
    
    return 'default';
  }
  
  fillDomainKnowledge(template, params) {
    let filledTemplate = template;
    
    // Fill in face shape guidance
    if (params.faceShape && this.domainKnowledge.faceShapeGuidance[params.faceShape]) {
      filledTemplate = filledTemplate.replace(
        '{{FACE_SHAPE_GUIDANCE}}', 
        this.domainKnowledge.faceShapeGuidance[params.faceShape]
      );
    } else {
      filledTemplate = filledTemplate.replace(
        '{{FACE_SHAPE_GUIDANCE}}', 
        this.domainKnowledge.faceShapeGuidance.default
      );
    }
    
    // Fill in style guidance
    if (params.stylePreference && params.stylePreference.length > 0) {
      const styleGuidance = params.stylePreference
        .map(style => this.domainKnowledge.styleGuidance[style] || '')
        .filter(guidance => guidance.length > 0)
        .join(' ');
      
      filledTemplate = filledTemplate.replace('{{STYLE_GUIDANCE}}', styleGuidance);
    } else {
      filledTemplate = filledTemplate.replace(
        '{{STYLE_GUIDANCE}}', 
        this.domainKnowledge.styleGuidance.default
      );
    }
    
    // Fill in fit guidance
    if (params.fitIssues && params.fitIssues.length > 0) {
      const fitGuidance = params.fitIssues
        .map(issue => this.domainKnowledge.fitGuidance[issue] || '')
        .filter(guidance => guidance.length > 0)
        .join(' ');
      
      filledTemplate = filledTemplate.replace('{{FIT_GUIDANCE}}', fitGuidance);
    } else {
      filledTemplate = filledTemplate.replace(
        '{{FIT_GUIDANCE}}', 
        this.domainKnowledge.fitGuidance.default
      );
    }
    
    return filledTemplate;
  }
  
  addContextInformation(prompt, context) {
    let contextEnhancedPrompt = prompt;
    
    if (context.previousPurchases && context.previousPurchases.length > 0) {
      const purchaseHistory = context.previousPurchases
        .map(purchase => `- ${purchase.product.name} (${purchase.date})`)
        .join('\n');
      
      contextEnhancedPrompt = contextEnhancedPrompt.replace(
        '{{PURCHASE_HISTORY}}', 
        `Previous purchases:\n${purchaseHistory}`
      );
    } else {
      contextEnhancedPrompt = contextEnhancedPrompt.replace(
        '{{PURCHASE_HISTORY}}', 
        ''
      );
    }
    
    // Add other context information as needed
    
    return contextEnhancedPrompt;
  }
}
```

## Domain Expertise Templates

### Domain Knowledge Base Structure

```javascript
// Example domain knowledge base for eyewear
const eyewearDomainKnowledge = {
  faceShapeGuidance: {
    round: "Round faces are characterized by similar length and width with soft curves and fuller cheeks. The best frames for round faces have angular and geometric shapes that add definition. Rectangular, square, and geometric frames create contrast with the face's natural curves. Avoid round frames, small frames, and rimless frames which can emphasize the roundness.",
    oval: "Oval faces are well-balanced with a slightly wider forehead than chin and high cheekbones. This versatile face shape works well with most frame styles. Frames that are as wide as or wider than the broadest part of the face help maintain the face's natural balance. Oversized frames can throw off this proportion.",
    square: "Square faces have strong jaw lines, broad foreheads, and wide cheekbones with roughly equal facial width and length. The best frames for square faces have rounded or oval shapes to soften the face's angles and sit high on the nose bridge. Avoid boxy or angular frames that mimic the face's sharp angles.",
    heart: "Heart-shaped faces have wide foreheads and cheekbones with a narrow chin. The best frames balance the width at the top of the face by adding width below. Frames that are wider at the bottom, aviator styles, or frames with low-set temples work well. Avoid frames with decorated tops or top-heavy designs.",
    diamond: "Diamond faces have narrow foreheads and jawlines with wide cheekbones and may have dramatic features. The best frames highlight the eyes and soften cheekbones. Frames with detailing or distinctive brow lines, rimless frames, and cat-eye shapes complement this face shape. Avoid narrow frames that emphasize the width of the cheekbones.",
    default: "Different face shapes work best with different frame styles. Typically, frames that provide contrast to your face shape work well: angular frames for rounder faces, and rounded frames for more angular faces. Frame proportions should generally align with your face proportions."
  },
  
  styleGuidance: {
    modern: "Modern eyewear styles feature clean lines, minimalist designs, and often incorporate innovative materials like titanium, carbon fiber, or high-tech composites. Look for sleek profiles, unique color treatments, and subtle details that make a contemporary statement without overwhelming.",
    classic: "Classic eyewear styles are timeless designs that never go out of fashion. Think iconic shapes like wayfarers, aviators, and browline frames. These styles often feature traditional materials like acetate and metal in neutral colors with traditional finishes. They offer versatility and longevity in your eyewear collection.",
    vintage: "Vintage-inspired eyewear draws from popular styles of past decades. This includes bold cat-eyes from the 50s, oversized frames from the 70s, or round wire frames reminiscent of the early 20th century. These frames often feature distinctive details and colors that make a nostalgic statement.",
    trendy: "Trendy eyewear incorporates current fashion movements, with bold colors, unexpected materials, and distinctive shapes. These frames make a statement and show fashion-forward thinking, though they may not have the longevity of more classic styles.",
    minimalist: "Minimalist eyewear focuses on essential elements with clean lines and understated designs. These frames often feature thin profiles, neutral colors, and subtle branding. The emphasis is on refined simplicity rather than bold statements.",
    default: "Eyewear styles range from classic and timeless to modern and trendy. The best style choice depends on your personal aesthetic, lifestyle needs, and how bold a statement you want to make with your frames."
  },
  
  fitGuidance: {
    slipping: "Frames that slip down the nose may be too wide, have improperly adjusted nose pads, or be too heavy for your face. Look for frames with adjustable nose pads, styles with nose grips, or lighter weight materials. Frames should sit securely without constant adjustment.",
    pinching: "Pinching usually occurs when frames are too narrow for your face or have nose pads set too closely together. Frames should distribute pressure evenly across contact points. Adjustable nose pads and temples can help create a more comfortable fit.",
    pressure: "Pressure points from eyewear often develop behind the ears or on the nose bridge. Quality frames should be adjustable to eliminate these issues. Consider frames with spring hinges for flexibility, rounded temple tips, and properly sized bridges.",
    uneven: "Frames sitting unevenly on the face may indicate asymmetry in facial features or frame misalignment. Adjustable nose pads and customizable temple arms can help achieve a level fit. Professional adjustments may be necessary for optimal alignment.",
    default: "Proper eyewear fit is essential for comfort and function. Frames should sit securely without pressure points, remain level on the face, and position the eyes in the optical center of the lenses. Most quality frames can be adjusted for a custom fit."
  },
  
  technicalGuidance: {
    lensTypes: {
      single: "Single vision lenses correct for one viewing distance - either close-up, intermediate, or distance vision. They're the most common lens type and ideal for people who need correction for just one vision issue.",
      bifocal: "Bifocal lenses have two distinct viewing areas - typically distance vision on top and near vision on the bottom, separated by a visible line. These are designed for people who need help with both distance and reading vision.",
      progressive: "Progressive lenses provide correction for distance, intermediate, and near vision without visible lines between the different prescriptive areas. They offer a more natural vision experience than bifocals but may require an adaptation period.",
      readers: "Reading glasses provide magnification for near vision tasks and are available in various strengths. These are typically used by people experiencing age-related presbyopia who don't need distance correction."
    },
    
    lensMaterials: {
      plastic: "Standard plastic (CR-39) lenses offer good optical quality at a lower cost, but are thicker and heavier than high-index options. Best for mild prescriptions.",
      polycarbonate: "Polycarbonate lenses are impact-resistant and good for active lifestyles and children's eyewear. They're thinner than standard plastic but may have slightly less optical clarity.",
      highIndex: "High-index lenses are thinner and lighter than standard materials, making them ideal for stronger prescriptions. They reduce the 'thick lens' appearance but may cost more.",
      trivex: "Trivex lenses combine the impact resistance of polycarbonate with better optical clarity. They're lightweight and excellent for rimless or drill-mount frames."
    },
    
    coatings: {
      antiReflective: "Anti-reflective coatings reduce glare and reflections, improving vision especially in low light and when using digital devices. They also make your lenses nearly invisible, enhancing eye contact during conversations.",
      blueLight: "Blue light filtering coatings help reduce exposure to high-energy visible light from digital screens. They may help reduce digital eye strain and potentially protect against long-term blue light exposure.",
      photochromic: "Photochromic lenses darken when exposed to UV light and return to clear indoors. They provide convenient sun protection without changing glasses but may not darken fully in cars due to UV-blocking windshields.",
      scratch: "Scratch-resistant coatings help protect lenses from everyday wear, extending their usable life. While no lens is completely scratch-proof, these coatings significantly improve durability."
    }
  }
};
```

### Prompt Templates

```javascript
// Example prompt templates for Vertex AI
const promptTemplates = {
  frame_recommendation: `
You are an expert eyewear consultant helping a customer find the perfect frames. Use the following eyewear expertise to provide personalized recommendations:

{{FACE_SHAPE_GUIDANCE}}

{{STYLE_GUIDANCE}}

{{PURCHASE_HISTORY}}

The customer is asking: "{{USER_QUERY}}"

Provide specific frame style recommendations that will work well for this customer based on the eyewear expertise above. Include explanations for why each recommendation is suitable.
  `,
  
  fit_consultation: `
You are an expert eyewear fit specialist helping a customer with frame comfort and fit. Use the following eyewear expertise to address their concerns:

{{FIT_GUIDANCE}}

{{PURCHASE_HISTORY}}

The customer is asking: "{{USER_QUERY}}"

Provide specific advice to address their fit concerns, including potential adjustments to their current frames and features to look for in new frames.
  `,
  
  style_consultation: `
You are a personal eyewear stylist helping a customer find frames that complement their appearance and express their style. Use the following eyewear expertise to guide your recommendations:

{{FACE_SHAPE_GUIDANCE}}

{{STYLE_GUIDANCE}}

{{PURCHASE_HISTORY}}

The customer is asking: "{{USER_QUERY}}"

Provide personalized style advice that considers both facial features and personal style preferences. Explain the reasoning behind your recommendations.
  `,
  
  technical_consultation: `
You are an eyewear technical specialist with expertise in lens technologies, materials, and specialized eyewear features. Use your knowledge to provide informed guidance:

Material considerations:
- Lens materials vary in thickness, weight, impact resistance, and optical clarity
- Frame materials affect durability, flexibility, weight, and allergenic properties
- Different coatings provide benefits like glare reduction, blue light filtering, and scratch resistance

The customer is asking: "{{USER_QUERY}}"

Provide technically accurate information about eyewear options, explaining benefits and trade-offs in a way that helps the customer make an informed decision.
  `,
  
  default: `
You are an eyewear consultant with expertise in frame selection, fit, style, and technical aspects of eyewear. Your goal is to provide helpful, accurate information about eyewear products and help customers find the perfect frames.

The customer is asking: "{{USER_QUERY}}"

Provide a helpful response drawing on eyewear expertise as needed. If you need more information to give personalized advice, ask appropriate follow-up questions.
  `
};
```

## Domain Expertise Enhancer Agent Prompt

```markdown
# Domain Expertise Enhancer Agent Prompt

## Agent Purpose
You are a Domain Expertise Enhancer responsible for augmenting general shopping assistant responses with eyewear-specific expertise to create more valuable and accurate responses.

## Input Context
- Original response from Vertex AI Shopping Assistant
- User query that generated the response
- Eyewear domain knowledge base references
- Product catalog with eyewear-specific attributes

## Enhancement Process
1. ANALYZE the Vertex AI response for:
   - General shopping advice or recommendations
   - Product references and attributes
   - Missing eyewear-specific considerations

2. IDENTIFY opportunities to enhance with eyewear expertise:
   - Face shape compatibility considerations
   - Style and aesthetic guidance
   - Fit and comfort information
   - Technical specifications relevant to user needs

3. INJECT eyewear expertise by:
   - Augmenting product recommendations with frame shape guidance
   - Adding explanatory content about fit considerations
   - Refining general style advice with eyewear-specific best practices
   - Preserving the helpful tone and structure of the original response

## Output Format
- Enhanced response text with seamlessly integrated eyewear expertise
- Additional frame recommendations if applicable
- Eyewear-specific follow-up questions if needed

## Enhancement Examples

### Example 1: Face Shape Enhancement

**Original Response:**
"Based on your search, here are some black frame options in your price range. These are popular choices in our collection."

**Enhanced Response:**
"Based on your search, here are some black frame options in your price range. For your round face shape, I've selected rectangular and geometric frames that will add definition and contrast to your softer features. The angular lines of these frames will help make your face appear longer and more defined. These are popular choices in our collection."

### Example 2: Fit Issue Enhancement

**Original Response:**
"If you're experiencing discomfort with your glasses, you might want to visit our store for adjustments."

**Enhanced Response:**
"If your glasses are sliding down your nose, this typically indicates that the frame may be too wide for your face or the nose pads need adjustment. You can try having the nose pads adjusted inward for a more secure fit, or consider frames with nosepads that can be customized. Spring hinges can also help provide a more secure fit by allowing the temples to adjust to your face width. While you might want to visit our store for professional adjustments, these are features you can look for in your next pair of frames to prevent this issue."

### Example 3: Technical Enhancement

**Original Response:**
"These sunglasses are available with polarized lenses for an additional $50."

**Enhanced Response:**
"These sunglasses are available with polarized lenses for an additional $50. Polarized lenses offer significant benefits over standard tinted lenses by specifically filtering horizontal light waves that cause glare from reflective surfaces like water, snow, and roads. This makes them ideal for driving, fishing, and other outdoor activities where glare reduction is important. They also provide 100% UV protection and can help reduce eye strain in bright conditions."
```

## Extensibility for Other Domains

The Domain Expertise Injection system is designed to be adaptable to other industries by:

1. Creating a new domain knowledge base with industry-specific expertise
2. Developing domain-specific prompt templates
3. Implementing parameter extraction for industry terminology
4. Configuring enhancement strategies appropriate to the domain

For example, to extend this system to the jewelry industry:

```javascript
// Example domain knowledge base for jewelry
const jewelryDomainKnowledge = {
  gemstoneGuidance: {
    diamond: "Diamonds are valued based on the 4 Cs: Cut, Color, Clarity, and Carat weight. Cut affects brilliance and sparkle, color ranges from colorless to light yellow, clarity measures inclusions, and carat refers to weight. Ideal proportions in cut maximize light reflection for optimal brilliance.",
    sapphire: "Sapphires are known for their rich blue color, though they come in nearly every color except red (which would be classified as ruby). They rank 9 on the Mohs hardness scale, making them excellent for everyday wear. Quality factors include color saturation, tone, and clarity.",
    emerald: "Emeralds are valued for their lush green color derived from chromium and/or vanadium. Most emeralds have inclusions (called jardin or 'garden'), so clarity enhancement with oils or resins is common. They rank 7.5-8 on the Mohs hardness scale, requiring more careful wear than diamonds.",
    ruby: "Rubies are red sapphires, with color ranging from pinkish-red to deep pigeon blood red (most valuable). They rank 9 on the Mohs hardness scale, making them durable for everyday wear. Quality factors include color intensity, transparency, and size, as large rubies are extremely rare.",
    default: "Gemstones vary in color, durability, rarity, and symbolic meaning. While diamonds remain the traditional choice for engagement rings due to their durability and brilliance, colored gemstones offer unique aesthetics and often more value for size compared to diamonds."
  },
  
  metalGuidance: {
    gold: "Gold purity is measured in karats, with 24K being pure gold. 14K (58.3% gold) and 18K (75% gold) are most popular for jewelry, balancing purity with durability. Pure gold is too soft for everyday wear, so it's alloyed with other metals for strength and to create variations like yellow, white, and rose gold.",
    platinum: "Platinum is a naturally white metal that's hypoallergenic and doesn't tarnish. It's denser and more durable than gold, making it ideal for securing diamonds and gemstones. While more expensive initially, its durability means less metal is lost during wear and polishing over time.",
    silver: "Sterling silver is 92.5% silver alloyed with copper for strength. It's affordable and versatile but requires more maintenance as it tarnishes with exposure to air. Silver is softer than gold or platinum, making it less suitable for securing valuable gemstones in everyday wear pieces.",
    default: "Precious metals for jewelry differ in appearance, durability, hypoallergenic properties, and price. Consider lifestyle, skin sensitivity, maintenance preferences, and budget when selecting the right metal for your jewelry."
  },
  
  styleGuidance: {
    vintage: "Vintage-inspired jewelry reflects design elements from specific time periods like Victorian, Art Deco, or Retro eras. These pieces often feature intricate details, milgrain edging, filigree work, and distinctive gemstone arrangements that evoke nostalgia while incorporating modern craftsmanship standards.",
    modern: "Modern jewelry designs emphasize clean lines, minimalist aesthetics, and unique structural elements. These pieces often feature asymmetry, geometric shapes, innovative materials, and unexpected stone settings that create a contemporary statement.",
    classic: "Classic jewelry styles feature timeless designs that transcend trends, like solitaire engagement rings, tennis bracelets, and stud earrings. These pieces focus on showcasing the beauty of high-quality materials with balanced proportions and enduring appeal.",
    default: "Jewelry styles range from ornate and traditional to sleek and contemporary. The best choice depends on your personal aesthetic, whether you prefer timeless pieces that won't date or distinctive designs that make a bolder statement."
  }
};
```

## Next Steps

- [Product Catalog Adapter](04_product_catalog_adapter.md)
- [Platform Integration](05_platform_integration/)
- [Prompt Engineering](06_prompt_engineering/)
