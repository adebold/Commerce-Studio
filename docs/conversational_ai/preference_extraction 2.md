# Preference Extraction System

## Overview

The Preference Extraction system is a critical component that identifies, analyzes, and stores customer preferences throughout the conversation. By detecting both explicit statements and implicit cues, this system builds a comprehensive understanding of customer needs, enabling personalized recommendations and a more intuitive shopping experience. This capability is especially important in eyewear retail, where preferences span multiple dimensions including style, fit, functionality, and budget.

## Types of Preferences

Our system extracts and categorizes preferences across several dimensions:

### 1. Style Preferences

Visual and aesthetic preferences including:

- **Frame Shape**: Round, square, cat-eye, aviator, rectangular, etc.
- **Frame Size**: Small, medium, large, oversized, petite, etc.
- **Frame Color**: Black, tortoiseshell, clear, metallic, colorful, patterns, etc.
- **Frame Material**: Acetate, metal, titanium, wood, combination, etc.
- **Frame Thickness**: Bold, thin, medium, chunky, delicate, etc.
- **Design Elements**: Rimless, semi-rimless, full-rim, decorative details, etc.
- **Brand Preferences**: Designer brands, independent makers, specific collections, etc.
- **Style Inspirations**: Vintage, modern, minimalist, bold, professional, casual, etc.

### 2. Fit Preferences

Physical comfort and fit considerations:

- **Face Shape Compatibility**: Frames suited for oval, round, square, heart-shaped faces, etc.
- **Frame Width**: Standard, narrow, wide, adjustable, etc.
- **Nose Bridge Style**: Adjustable nose pads, molded bridge, keyhole bridge, etc.
- **Temple Style**: Straight, curved, sport wrap, thin, thick, etc.
- **Weight Preferences**: Lightweight, substantial, balanced, etc.
- **Fit Issues**: Frames that won't slide, pinch, or press on specific areas

### 3. Functional Preferences

Usage and functionality requirements:

- **Prescription Type**: Single vision, progressive, bifocal, reading, computer, etc.
- **Lens Features**: Anti-glare, blue light filtering, photochromic, polarized, etc.
- **Usage Context**: Everyday, reading, computer work, sports, driving, fashion, etc.
- **Durability Requirements**: Flexible, impact-resistant, scratch-resistant, etc.
- **Special Requirements**: Low bridge fit, Asian fit, wide temple, etc.

### 4. Budget Preferences

Financial considerations:

- **Price Range**: Entry-level, mid-range, premium, luxury, etc.
- **Value Priorities**: Quality-focused, budget-conscious, investment pieces, etc.
- **Insurance Utilization**: In-network options, coverage maximization, etc.
- **Promotional Interest**: Sales, bundles, loyalty discounts, etc.

### 5. Meta Preferences

Shopping and decision-making style:

- **Decision Factors**: Style-driven, comfort-focused, budget-prioritizing, etc.
- **Shopping Style**: Deliberate researcher, quick decider, expert-guided, etc.
- **Information Needs**: Detailed specifications, simple recommendations, visual examples, etc.
- **Choice Volume**: Prefers many options, prefers curated selection, etc.

## Preference Extraction Methods

Our system employs several complementary methods to extract preferences:

### 1. Direct Extraction

Identifying explicit statements of preference:

- **Keyword and Phrase Matching**: Identifying preference statements containing key terms
- **Structured Pattern Recognition**: Matching common preference expression patterns
- **Intent-based Extraction**: Linking recognized intents to preference categories
- **Entity Recognition**: Identifying named entities representing brands, styles, etc.

**Example Patterns:**
- "I like/prefer/want [attribute]" → Direct preference
- "I don't like/hate [attribute]" → Negative preference
- "Do you have [attribute]?" → Implied interest
- "These are too [characteristic]" → Comparative preference

### 2. Inferential Extraction

Deriving implicit preferences from context and behavior:

- **Sentiment Analysis**: Detecting positive/negative sentiment toward product attributes
- **Comparative Analysis**: Extracting preferences from comparison statements
- **Reaction Analysis**: Interpreting responses to recommendations
- **Query Analysis**: Inferring preferences from search and filter behavior
- **Attention Analysis**: Tracking which products or features receive follow-up questions

**Example Inferences:**
- Customer: "Those frames look heavy." → Implied preference for lightweight frames
- Customer asks detailed questions about titanium frames → Potential interest in titanium
- Customer responds positively to round frames but negatively to square → Shape preference
- Customer repeatedly mentions comfort → Fit is a priority over style

### 3. Interactive Extraction

Actively eliciting preferences through conversation:

- **Preference Clarification**: Asking follow-up questions to clarify vague preferences
- **Preference Expansion**: Exploring related preferences when one is identified
- **Preference Verification**: Confirming inferred preferences before acting on them
- **Alternative Presentation**: Offering alternatives to better understand preferences
- **Preference Prioritization**: Determining which preferences are most important

**Example Dialogue:**
```
Customer: "I want something professional-looking."
System: "Professional styles typically include classic shapes like rectangular or subtle round frames. Would you prefer something with a more defined look like a rectangular frame, or something softer like a rounded shape?"
Customer: "I think rectangular would be more suited to my job."
System: "Great choice. For professional rectangular frames, would you prefer a classic black or tortoiseshell, or perhaps a subtle metal finish?"
```

## Preference Representation

Extracted preferences are structured for effective storage and retrieval:

### 1. Preference Schema

```json
{
  "preference_id": "pref_12345",
  "customer_id": "cust_789",
  "conversation_id": "conv_456",
  "timestamp": "2025-03-20T09:30:45.123Z",
  "category": "style",
  "attribute": "frame_shape",
  "value": "round",
  "sentiment": "positive",
  "confidence": 0.92,
  "source": "explicit",
  "extraction_method": "direct_statement",
  "context": {
    "message_id": "msg_234",
    "raw_text": "I prefer round frames over square ones.",
    "related_products": ["prod_111", "prod_222"]
  },
  "strength": 0.85,
  "related_preferences": ["pref_234", "pref_345"],
  "status": "active"
}
```

### 2. Preference Attributes

- **Confidence Score**: Certainty level of the extracted preference (0-1)
- **Source**: Explicit (directly stated) vs. Implicit (inferred)
- **Strength**: Importance or intensity of the preference (0-1)
- **Recency**: When the preference was last expressed or confirmed
- **Consistency**: How consistently the preference has been expressed
- **Context**: Surrounding conversation context when preference was expressed

### 3. Preference Relationships

- **Complementary Preferences**: Preferences that work well together
- **Contradictory Preferences**: Preferences that conflict with each other
- **Hierarchical Preferences**: General preferences that contain sub-preferences
- **Conditional Preferences**: Preferences that apply only in certain contexts

## Preference Analysis

Once preferences are extracted, our system performs several types of analysis:

### 1. Preference Consolidation

- Merging related preferences expressed in different ways
- Updating preference confidence based on repeated expressions
- Resolving contradictions between older and newer preferences
- Building a coherent preference profile across conversation history

### 2. Preference Prioritization

- Ranking preferences by importance to the customer
- Identifying deal-breaker preferences vs. nice-to-have features
- Balancing competing preferences when all cannot be satisfied
- Adjusting priority based on customer emphasis and repetition

### 3. Preference Mapping

- Mapping natural language preferences to product attributes
- Translating subjective preferences to measurable characteristics
- Expanding preferences to include semantically related attributes
- Creating vector representations of preferences for similarity matching

## Preference Application

Extracted preferences drive several aspects of the conversational experience:

### 1. Product Recommendations

- Filtering the product catalog based on extracted preferences
- Ranking products by preference match score
- Explaining recommendations in terms of matched preferences
- Suggesting alternatives that match most but not all preferences

**Example Application:**
```
Based on your preference for lightweight titanium frames in a round shape, I recommend the Wilson model from our Premium Collection. It features a classic round shape, weighs just 15 grams, and has adjustable nose pads for a comfortable fit.
```

### 2. Conversation Steering

- Focusing the conversation on areas where preferences are unknown
- Avoiding redundant questions about already established preferences
- Resolving contradictions or clarifying vague preferences
- Suggesting preference refinements when results are too broad or narrow

**Example Application:**
```
I see you're looking for blue frames with a rectangular shape. Would you prefer a navy blue for a more professional look, or a brighter blue for something more distinctive?
```

### 3. Personalized Education

- Providing information relevant to expressed preferences
- Explaining features related to functional preferences
- Offering style guidance aligned with aesthetic preferences
- Tailoring technical details based on customer knowledge level

**Example Application:**
```
Since you mentioned you spend a lot of time on the computer, I'd recommend considering blue light filtering lenses with your new frames. These can help reduce eye strain during long screen sessions while maintaining the clear aesthetic you prefer.
```

## Preference Conflicts

Our system employs several strategies to handle preference conflicts:

### 1. Conflict Detection

- Identifying mutually exclusive preferences
- Detecting preferences that limit available inventory
- Recognizing contradictions between stated and implied preferences
- Highlighting unrealistic combinations (e.g., premium features at budget prices)

### 2. Conflict Resolution

- **Recency Priority**: Favoring more recently expressed preferences
- **Confidence Priority**: Prioritizing preferences with higher confidence scores
- **Explicit Priority**: Giving more weight to explicitly stated preferences
- **Clarification Dialogue**: Directly asking which preference takes priority
- **Compromise Suggestion**: Recommending products that partially satisfy conflicting preferences

**Example Resolution:**
```
I notice you mentioned wanting a lightweight frame but also prefer the look of thick acetate frames. Thick acetate tends to be heavier than metal frames. Would you prefer we focus on finding the lightest possible acetate frames, or would you be open to thinner frames to prioritize comfort?
```

## Implementation Architecture

The Preference Extraction system operates as follows:

```
┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│                   │     │                   │     │                   │
│  User Message     │────▶│  Intent           │────▶│  Entity           │
│                   │     │  Recognition      │     │  Extraction       │
│                   │     │                   │     │                   │
└───────────────────┘     └───────────────────┘     └───────────────────┘
                                                             │
                                                             ▼
┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│                   │     │                   │     │                   │
│  Preference       │◀────│  Sentiment        │◀────│  Pattern          │
│  Consolidation    │     │  Analysis         │     │  Matching         │
│                   │     │                   │     │                   │
└───────────────────┘     └───────────────────┘     └───────────────────┘
          │
          ▼
┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│                   │     │                   │     │                   │
│  Conflict         │────▶│  Preference       │────▶│  Customer         │
│  Resolution       │     │  Storage          │     │  Profile Update   │
│                   │     │                   │     │                   │
└───────────────────┘     └───────────────────┘     └───────────────────┘
                                    │
                                    ▼
                          ┌───────────────────┐
                          │                   │
                          │  Recommendation   │
                          │  Engine           │
                          │                   │
                          └───────────────────┘
```

## Training and Improvement

The Preference Extraction system improves through:

### 1. Supervised Learning

- Training on labeled conversations with annotated preferences
- Learning from expert optician consultations
- Fine-tuning based on customer feedback and corrections

### 2. Active Learning

- Identifying low-confidence preferences for human review
- Incorporating verified preferences into training data
- Prioritizing ambiguous cases for model improvement

### 3. Reinforcement Learning

- Optimizing based on customer satisfaction metrics
- Learning from successful vs. unsuccessful recommendations
- Adjusting extraction confidence thresholds based on outcomes

## Integration Points

The Preference Extraction system integrates with:

- **Intent Recognition**: To understand the context of customer statements
- **Contextual Memory**: To maintain preference history across the conversation
- **Product Catalog**: To map preferences to available products
- **Response Generator**: To explain how recommendations match preferences
- **Analytics System**: To track preference extraction accuracy and effectiveness

## Success Metrics

We measure preference extraction performance through:

1. **Extraction Accuracy**: % of correctly identified preferences (target: >90%)
2. **Preference Coverage**: % of key preference dimensions captured per conversation (target: >85%)
3. **Recommendation Relevance**: % of recommendations that match extracted preferences (target: >80%)
4. **Conflict Resolution Rate**: % of preference conflicts successfully resolved (target: >75%)
5. **Customer Satisfaction**: Correlation between preference-based recommendations and satisfaction scores
