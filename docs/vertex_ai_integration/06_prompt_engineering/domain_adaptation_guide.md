# Domain Adaptation Guide for Vertex AI Integration

## Overview

This guide outlines the methodology for adapting the EyewearML Vertex AI integration to other industry domains. The architecture is designed with modularity in mind, allowing domain-specific components to be swapped out while maintaining the core integration framework.

## Adaptation Methodology

Adapting the system to a new domain involves five key steps:

1. **Domain Knowledge Formalization**: Structuring industry expertise into usable knowledge blocks
2. **Parameter Mapping**: Identifying domain-specific parameters to extract from user queries
3. **Intent Classification Adaptation**: Modifying intent routing for domain-specific user needs
4. **Product Catalog Extension**: Adjusting the standardized product schema for new attributes
5. **Prompt Engineering**: Creating domain-specific prompts for pre-purchase interactions

## Step 1: Domain Knowledge Formalization

### Process

1. **Identify Key Domain Concepts**
   - Work with domain experts to identify critical domain knowledge areas
   - Determine which aspects of expertise most impact purchasing decisions
   - Define parameters that affect product suitability for users

2. **Structure Knowledge Hierarchically**
   - Organize domain knowledge into categories and subcategories
   - Create relationships between knowledge areas
   - Establish importance weightings for different knowledge components

3. **Formalize Decision Rules**
   - Document expert decision-making processes
   - Translate intuitive expertise into explicit rules where possible
   - Define recommendation criteria based on parameter combinations

### Example: Jewelry Domain

```javascript
// Example knowledge base structure for jewelry domain
const jewelryDomainKnowledge = {
  gemstoneGuidance: {
    diamond: {
      description: "Diamonds are valued based on the 4 Cs: Cut, Color, Clarity, and Carat weight.",
      qualityFactors: ["cut", "color", "clarity", "carat"],
      careInstructions: "Clean with mild soap and water, avoid harsh chemicals.",
      durabilityRating: 10, // Mohs hardness scale
      suitableOccasions: ["engagement", "wedding", "anniversary", "everyday"],
      pricingConsiderations: "Price increases exponentially with carat weight and quality."
    },
    sapphire: {
      description: "Sapphires are known for their rich blue color, though they come in nearly every color except red.",
      qualityFactors: ["color saturation", "color tone", "clarity", "carat"],
      careInstructions: "Clean with mild soap and water, can be ultrasonically cleaned.",
      durabilityRating: 9, // Mohs hardness scale
      suitableOccasions: ["engagement", "anniversary", "everyday", "special occasions"],
      pricingConsiderations: "Blue sapphires command premium prices, with Kashmir and Burmese origins most valued."
    },
    // Other gemstones...
  },
  
  metalTypes: {
    gold: {
      karats: {
        "24K": { purity: 0.999, durability: "Low", description: "Pure gold, very soft and malleable." },
        "18K": { purity: 0.750, durability: "Medium", description: "75% gold, good balance of purity and durability." },
        "14K": { purity: 0.585, durability: "High", description: "58.5% gold, very durable for everyday wear." },
        "10K": { purity: 0.417, durability: "Highest", description: "41.7% gold, most durable but less rich color." }
      },
      colors: {
        "yellow": { description: "Traditional gold color", alloyed_with: ["silver", "copper"] },
        "white": { description: "Silver appearance", alloyed_with: ["nickel", "palladium", "silver"] },
        "rose": { description: "Pinkish hue", alloyed_with: ["copper"] }
      },
      hypoallergenic: false,
      tarnishResistant: true,
      priceFactors: ["market price", "karat", "weight", "craftsmanship"]
    },
    platinum: {
      purity: { "950": { purity: 0.950, description: "95% platinum, 5% other metals" } },
      hypoallergenic: true,
      tarnishResistant: true,
      durability: "High",
      description: "Dense, durable white metal that develops a patina over time.",
      priceFactors: ["market price", "weight", "craftsmanship"]
    },
    // Other metals...
  },
  
  settingStyles: {
    prong: {
      description: "Metal claws that secure the gemstone",
      security: "Medium to High (depending on number of prongs)",
      gemstoneVisibility: "High",
      maintenance: "Periodic check for loose prongs",
      suitableFor: ["diamonds", "sapphires", "most gemstones"],
      variations: ["4-prong", "6-prong", "cathedral", "basket"]
    },
    bezel: {
      description: "Metal rim that surrounds the gemstone",
      security: "High",
      gemstoneVisibility: "Medium",
      maintenance: "Low",
      suitableFor: ["softer gemstones", "active lifestyles", "everyday wear"],
      variations: ["full bezel", "half bezel", "bezel with milgrain"]
    },
    // Other settings...
  },
  
  styleGuidance: {
    vintage: {
      description: "Designs inspired by historical periods",
      characteristics: ["intricate details", "milgrain", "filigree", "old-world craftsmanship"],
      popularEras: {
        "Victorian": { years: "1837-1901", features: ["yellow gold", "complex designs", "nature motifs"] },
        "Art Deco": { years: "1920s-1930s", features: ["geometric patterns", "symmetry", "contrasting colors"] },
        "Retro": { years: "1940s-1950s", features: ["bold", "three-dimensional", "rose gold"] }
      },
      matchingOccasions: ["formal events", "weddings", "special occasions"],
      matchingPersonalities: ["romantic", "nostalgic", "detail-oriented"]
    },
    // Other styles...
  }
};
```

## Step 2: Parameter Mapping

### Process

1. **Identify Critical Parameters**
   - Determine which domain parameters affect product recommendations
   - Map how these parameters impact user satisfaction
   - Define acceptable values for each parameter

2. **Create Parameter Extraction Rules**
   - Define patterns for identifying parameters in user queries
   - Create mappings between user language and formal parameter terms
   - Establish default values for parameters when not explicitly stated

3. **Develop Parameter Relationships**
   - Define how parameters interact with each other
   - Identify parameter combinations that have special significance
   - Create rules for parameter conflict resolution

### Example: Jewelry Parameter Mapping

```javascript
// Parameter mapping for the jewelry domain
const jewelryParameterMapping = {
  occasion: {
    patterns: [
      /\b(?:wedding|marriage|getting married)\b/i, 
      /\b(?:engagement|propose|proposal)\b/i,
      /\b(?:anniversary|birthday|graduation|christmas|holiday|gift)\b/i,
      /\b(?:everyday|daily|casual|work)\b/i
    ],
    valueMap: {
      "wedding": "wedding",
      "marriage": "wedding",
      "getting married": "wedding",
      "engagement": "engagement",
      "propose": "engagement",
      "proposal": "engagement",
      "anniversary": "anniversary",
      "birthday": "special_occasion",
      "graduation": "special_occasion",
      "christmas": "gift",
      "holiday": "gift",
      "gift": "gift",
      "everyday": "everyday",
      "daily": "everyday",
      "casual": "everyday",
      "work": "everyday"
    },
    impact: {
      "wedding": { formality: "high", durability: "high", price: "high" },
      "engagement": { formality: "high", durability: "high", price: "highest" },
      "anniversary": { formality: "high", durability: "high", price: "high" },
      "special_occasion": { formality: "medium", durability: "medium", price: "medium" },
      "gift": { formality: "medium", durability: "medium", price: "medium" },
      "everyday": { formality: "low", durability: "high", price: "low to medium" }
    }
  },
  
  gemstone: {
    patterns: [
      /\b(?:diamond|diamonds)\b/i,
      /\b(?:sapphire|sapphires)\b/i,
      /\b(?:emerald|emeralds)\b/i,
      /\b(?:ruby|rubies)\b/i,
      /\b(?:pearl|pearls)\b/i,
      /\b(?:gemstone|stone|gem)\b/i
    ],
    valueMap: {
      "diamond": "diamond",
      "diamonds": "diamond",
      "sapphire": "sapphire",
      "sapphires": "sapphire",
      "emerald": "emerald",
      "emeralds": "emerald",
      "ruby": "ruby",
      "rubies": "ruby",
      "pearl": "pearl",
      "pearls": "pearl",
      // Handle general terms with follow-up questions
      "gemstone": null,
      "stone": null,
      "gem": null
    },
    defaultValue: null, // Requires explicit selection or recommendation
    relationships: {
      "occasion": {
        "engagement": ["diamond", "sapphire"],
        "wedding": ["diamond"],
        "anniversary": ["diamond", "ruby", "sapphire", "emerald"] // can be based on anniversary year
      },
      "durability_need": {
        "high": ["diamond", "sapphire", "ruby"],
        "medium": ["emerald", "alexandrite", "spinel"],
        "low": ["pearl", "opal", "tanzanite"]
      }
    }
  },
  
  metal: {
    patterns: [
      /\b(?:gold|yellow gold|white gold|rose gold)\b/i,
      /\b(?:platinum|plat)\b/i,
      /\b(?:silver|sterling|sterling silver)\b/i,
      /\b(?:metal)\b/i
    ],
    valueMap: {
      "gold": "gold",
      "yellow gold": "yellow_gold",
      "white gold": "white_gold",
      "rose gold": "rose_gold",
      "platinum": "platinum",
      "plat": "platinum",
      "silver": "silver",
      "sterling": "silver",
      "sterling silver": "silver",
      "metal": null
    },
    defaultValue: "yellow_gold", // Most common default
    relationships: {
      "skin_tone": {
        "warm": ["yellow_gold", "rose_gold"],
        "neutral": ["yellow_gold", "white_gold", "platinum", "rose_gold"],
        "cool": ["white_gold", "platinum", "silver"]
      },
      "gemstone": {
        "diamond": ["platinum", "white_gold", "yellow_gold", "rose_gold"],
        "sapphire": ["white_gold", "platinum", "yellow_gold"],
        "emerald": ["yellow_gold", "white_gold"],
        "ruby": ["white_gold", "yellow_gold", "rose_gold"]
      }
    }
  },
  
  budget: {
    patterns: [
      /\b(?:under|less than|max|maximum|up to)\s+\$?(\d+[k]?)\b/i,
      /\b(?:budget|price|cost|spend|spending)\s+(?:of|is|at)?\s+\$?(\d+[k]?)\b/i,
      /\b\$?(\d+[k]?)\s+(?:budget|price range|price|cost)\b/i,
      /\b(?:between|from)\s+\$?(\d+[k]?)\s+(?:and|to|-)\s+\$?(\d+[k]?)\b/i
    ],
    // Processing requires special handling for currencies and number formats
    valueProcessor: (matches) => {
      // Process the matched value into a standardized price range
      // Handle "k" notation, currency symbols, etc.
    }
  }
};
```

## Step 3: Intent Classification Adaptation

### Process

1. **Define Domain-Specific Intents**
   - Identify common user goals within the domain
   - Map these goals to discrete intent categories
   - Define intent detection patterns and triggers

2. **Create Intent Routing Rules**
   - Determine which intents require domain expertise vs. general shopping assistance
   - Define routing logic based on intent classification
   - Set up intent confidence thresholds

3. **Establish Intent Hierarchies**
   - Organize intents into primary and secondary categories
   - Define intent relationships and transitions
   - Create fallback paths for ambiguous intents

### Example: Jewelry Intent Classification

```javascript
// Intent classification for jewelry domain
const jewelryIntentClassification = {
  domainSpecificIntents: [
    {
      name: "gemstone_consultation",
      description: "User seeking advice about gemstone selection",
      patterns: [
        /which (?:gemstone|stone|gem|diamond)/i,
        /(?:gemstone|stone|gem|diamond) (?:recommendation|advice|suggestion)/i,
        /(?:difference|compare) between (?:gemstones|diamonds|sapphires)/i,
        /(?:quality|grade) of (?:gemstone|diamond|sapphire|ruby)/i
      ],
      requiredExpertise: "high",
      examples: [
        "What's the difference between natural and lab diamonds?",
        "How do I choose a good quality sapphire?",
        "Which gemstone is best for an engagement ring?"
      ]
    },
    {
      name: "metal_consultation",
      description: "User seeking advice about metal selection",
      patterns: [
        /which (?:metal|gold|platinum)/i,
        /(?:difference|compare) between (?:metals|gold|platinum)/i,
        /(?:white gold|yellow gold|rose gold|platinum) (?:recommendation|advice)/i,
        /(?:durability|scratch|tarnish|allergy) (?:of|and) (?:metal|gold|platinum)/i
      ],
      requiredExpertise: "medium",
      examples: [
        "Is platinum better than white gold?",
        "Will 14K gold tarnish over time?",
        "Which metal is best for someone with sensitive skin?"
      ]
    },
    {
      name: "style_consultation",
      description: "User seeking style or design advice",
      patterns: [
        /(?:style|design) (?:recommendation|advice|suggestion)/i,
        /(?:vintage|modern|classic|minimalist) (?:style|design|look)/i,
        /(?:setting|prong|bezel|halo) (?:style|type|recommendation)/i,
        /look good (?:on|with|for)/i
      ],
      requiredExpertise: "high",
      examples: [
        "What ring style looks good on short fingers?",
        "Would a halo setting make a small diamond look bigger?",
        "What's the difference between vintage and antique designs?"
      ]
    },
    {
      name: "occasion_guidance",
      description: "User seeking advice for specific occasion",
      patterns: [
        /(?:engagement|wedding|anniversary|gift) (?:recommendation|advice|suggestion)/i,
        /(?:propose|proposing|proposal) (?:with|using)/i,
        /(?:appropriate|suitable|good) for (?:engagement|wedding|work|everyday)/i
      ],
      requiredExpertise: "medium",
      examples: [
        "What's appropriate jewelry for a 10th anniversary?",
        "Is a pearl ring suitable for an engagement?",
        "What type of necklace would work for everyday office wear?"
      ]
    },
    {
      name: "size_fitting",
      description: "User seeking advice about jewelry sizing",
      patterns: [
        /(?:ring size|sizing|size) (?:recommendation|advice|help)/i,
        /(?:measure|find|determine) (?:ring|bracelet|necklace) size/i,
        /(?:resize|adjustment|adjust) (?:ring|bracelet|necklace)/i
      ],
      requiredExpertise: "medium",
      examples: [
        "How do I figure out my ring size?",
        "Can platinum rings be resized?",
        "What length necklace should I choose?"
      ]
    }
  ],
  
  generalShoppingIntents: [
    {
      name: "product_browsing",
      description: "User browsing products without specific expertise needs",
      patterns: [
        /show me (?:rings|necklaces|earrings|bracelets)/i,
        /looking for (?:gold|silver|diamond)/i,
        /(?:rings|necklaces|earrings|bracelets) (?:under|less than) \$\d+/i
      ],
      requiredExpertise: "low",
      examples: [
        "Show me gold hoop earrings",
        "I'm looking for diamond stud earrings under $500",
        "Do you have any silver bracelets?"
      ]
    },
    // Other general shopping intents
  ],
  
  hybridIntents: [
    {
      name: "purchase_consultation",
      description: "User ready to purchase but needs final expertise",
      patterns: [
        /(?:should I|would you) recommend (?:this|the|that)/i,
        /(?:is this|would this be) a good (?:choice|option|selection)/i,
        /(?:differences|compare) between these/i
      ],
      requiredExpertise: "medium",
      examples: [
        "Should I choose the 1ct VS1 diamond or the 1.2ct SI1?",
        "Is this a good quality sapphire for the price?",
        "Would you recommend this setting for an active person?"
      ]
    },
    // Other hybrid intents
  ]
};
```

## Step 4: Product Catalog Extension

### Process

1. **Identify Domain-Specific Attributes**
   - Determine which product attributes are essential for domain recommendations
   - Define attribute data types and value ranges
   - Establish attribute relationships and dependencies

2. **Create Standardized Attribute Schema**
   - Define a consistent schema for domain-specific attributes
   - Create mappings between e-commerce platform attributes and standard schema
   - Develop normalization rules for attribute values

3. **Implement Attribute Extraction Logic**
   - Create methods to extract attributes from different platforms
   - Develop transformation logic for platform-specific formats
   - Implement validation and fallback processes

### Example: Jewelry Product Schema

```javascript
// Example of standardized jewelry product schema
const jewelryProductSchema = {
  // Core product attributes (common across domains)
  id: "string",
  title: "string",
  description: "string",
  price: {
    amount: "number",
    currency: "string",
    compareAtPrice: "number|null"
  },
  images: [{
    id: "string",
    url: "string",
    alt: "string",
    position: "number"
  }],
  url: "string",
  
  // Domain-specific attributes for jewelry
  attributes: {
    general: {
      productType: "string", // ring, necklace, earrings, etc.
      collections: ["string"],
      tags: ["string"],
      vendor: "string",
      isCustomizable: "boolean"
    },
    jewelry: {
      // Gemstone attributes
      gemstone: {
        type: "string", // diamond, sapphire, etc.
        carat: "number",
        cut: "string",
        color: "string",
        clarity: "string",
        shape: "string",
        isLabCreated: "boolean",
        treatment: "string|null",
        certification: "string|null"
      },
      
      // Metal attributes
      metal: {
        type: "string", // gold, platinum, silver
        purity: "string", // 14K, 18K, 925, etc.
        color: "string", // yellow, white, rose
        plating: "string|null",
        hypoallergenic: "boolean"
      },
      
      // Setting attributes
      setting: {
        style: "string", // prong, bezel, etc.
        stoneCount: "number",
        accentStoneType: "string|null",
        accentStoneTotalCarat: "number|null"
      },
      
      // Design attributes
      design: {
        style: "string", // vintage, modern, classic
        era: "string|null", // Art Deco, Victorian, etc.
        collection: "string|null",
        occasion: ["string"], // engagement, wedding, everyday
        isLimited: "boolean"
      },
      
      // Physical attributes
      dimensions: {
        ringSize: "string|null",
        bandWidth: "number|null", // mm
        chainLength: "number|null", // inches/cm
        earringDrop: "number|null", // inches/cm
        totalWeight: "number|null" // grams
      }
    }
  }
};
```

## Step 5: Prompt Engineering

### Process

1. **Create Domain-Specific Prompt Templates**
   - Develop templates for common domain interactions
   - Include appropriate domain knowledge in each template
   - Structure prompts to elicit useful information from users

2. **Develop Response Guidelines**
   - Create response frameworks that incorporate domain expertise
   - Define best practices for providing domain-specific advice
   - Include guidelines for product recommendations within the domain

3. **Create Example Response Pairs**
   - Develop exemplar responses for common queries
   - Demonstrate appropriate depth of expertise
   - Show proper incorporation of technical information and practical advice

### Example: Jewelry Consultation Prompt

```markdown
# Gemstone Selection Consultation Agent for Jewelry Domain

## Agent Purpose
You are an expert gemologist helping customers select the ideal gemstone for their jewelry purchase. Your goal is to understand their preferences, needs, and constraints, then provide expert guidance on gemstone selection.

## Domain Knowledge
Gemstones vary widely in characteristics and suitability:

- Diamonds are valued based on the 4 Cs (Cut, Color, Clarity, Carat). They are extremely durable (10 on Mohs scale) and suitable for everyday wear. Key considerations include:
  * Cut: Affects brilliance and sparkle, with options from Excellent to Poor
  * Color: Graded from D (colorless) to Z (light yellow/brown)
  * Clarity: Ranges from FL (Flawless) to I (Included), indicating internal imperfections
  * Carat: Weight measurement, with pricing increasing exponentially with size

- Sapphires come in various colors (blue being most traditional), with "cornflower blue" highly prized. They have excellent durability (9 on Mohs scale), making them suitable for everyday wear. Quality factors include color saturation, tone, and clarity. Origin can significantly affect value, with Kashmir, Burma, and Ceylon sources commanding premiums.

- Emeralds are valued for their rich green color. They have good durability (7.5-8 on Mohs scale) but typically contain inclusions (called "jardin" or garden). They require more careful handling than diamonds or sapphires and often receive clarity enhancement treatments. Colombian emeralds are particularly valued.

- Rubies are red sapphires valued for their vibrant color, with "pigeon blood red" most prized. They have excellent durability (9 on Mohs scale). Quality factors include color intensity, transparency, and origin, with Burmese (Myanmar) rubies commanding the highest prices.

## User Query
"I'm looking for a gemstone for an engagement ring that isn't a diamond. What would you recommend?"

## Response Guidelines
1. ACKNOWLEDGE the user's interest in alternative engagement gemstones
2. EXPLAIN the key considerations for engagement ring gemstones (durability, beauty, value)
3. RECOMMEND 2-3 specific alternatives to diamonds with reasoning
4. EDUCATE on the pros and cons of each recommendation
5. INQUIRE about additional factors that might influence the recommendation

## Example Response
"When considering non-diamond gemstones for engagement rings, durability is particularly important since this is a ring that will likely be worn daily for many years.

Based on this, my top recommendations would be:

1. **Sapphire** - With a 9 on the Mohs hardness scale, sapphires are extremely durable and resist scratching. They come in nearly every color (not just blue), allowing for personalization while maintaining excellent durability. Blue sapphires have a rich tradition in engagement rings, notably Kate Middleton's ring (originally Princess Diana's). They typically offer more size for the same budget compared to diamonds.

2. **Ruby** - Also a 9 on the Mohs scale, rubies offer outstanding durability with their vibrant red color symbolizing love and passion. Quality rubies in larger sizes are rare, potentially making them more unique and special than diamonds of similar size.

3. **Moissanite** - If you appreciate the brilliance of diamonds but prefer an alternative, moissanite offers exceptional sparkle (actually more fiery than diamond), nearly equivalent hardness (9.25), and typically costs 80-90% less than a comparable diamond.

While these are my top recommendations, emeralds and aquamarines are also popular choices, though they require a bit more care with hardness ratings of 7.5-8 and 7.5-8 respectively.

May I ask if you have a color preference or if there's a specific meaning or symbolism you'd like the gemstone to represent? This could help further refine recommendations."
```

## Adaptation Checklist

When extending to a new domain, work through this checklist:

1. **Domain Expertise**
   - [ ] Identify domain experts for consultation
   - [ ] Document key domain concepts and terminology
   - [ ] Formalize expert knowledge into structured format
   - [ ] Define domain-specific decision rules

2. **Parameter Framework**
   - [ ] Identify critical parameters for user needs
   - [ ] Define parameter extraction patterns
   - [ ] Create mappings between user language and formal parameters
   - [ ] Document parameter relationships and dependencies

3. **Intent Classification**
   - [ ] Define domain-specific intents
   - [ ] Create intent detection patterns
   - [ ] Establish routing rules for each intent
   - [ ] Set up fallback paths for ambiguous inputs

4. **Product Schema**
   - [ ] Identify domain-specific product attributes
   - [ ] Create standardized attribute schema
   - [ ] Develop attribute normalization rules
   - [ ] Implement platform-specific extraction logic

5. **Prompt Engineering**
   - [ ] Create domain-specific prompt templates
   - [ ] Develop response guidelines
   - [ ] Create example response pairs
   - [ ] Test and refine prompts with domain experts

## Conclusion

By following this structured approach, the Vertex AI integration can be effectively adapted to new industry domains while maintaining the core architecture and integration points. This allows for reuse of the integration framework while tailoring the domain-specific components to provide expert guidance for any product category.

For implementation guidance, refer to the technical implementation files for each component:

- [Intent Router Implementation](../../src/conversational_ai/integrations/vertex_ai/intent_router.js)
- [Domain Expertise Enhancer](../../src/conversational_ai/integrations/vertex_ai/domain_expertise_enhancer.js)
- [Product Catalog Adapter](../../src/conversational_ai/integrations/vertex_ai/product_catalog_adapter.js)
