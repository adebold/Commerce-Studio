# Vertex AI Shopping Assistant Integration Architecture

## Overview

This document outlines the architecture for integrating Google's Vertex AI prebuilt shopping assistant with EyewearML's conversational AI system. The integration combines Vertex AI's powerful e-commerce capabilities with our specialized domain expertise in eyewear recommendations.

## Architecture Diagram

```
┌─────────────────────┐     ┌─────────────────────┐
│  User Interface     │     │  E-commerce         │
│  (Web/Mobile Apps)  │     │  (Shopify/WooCommerce) │
└──────────┬──────────┘     └──────────┬──────────┘
           │                           │
           ▼                           ▼
┌─────────────────────────────────────────────────┐
│             Integration Layer                   │
│  ┌─────────────────┐      ┌─────────────────┐   │
│  │ Intent Router   │◄────►│ Context Manager │   │
│  └────────┬────────┘      └────────┬────────┘   │
│           │                        │            │
└───────────┼────────────────────────┼────────────┘
            │                        │
┌───────────▼────────┐    ┌──────────▼────────────┐
│  Vertex AI         │    │  EyewearML Domain     │
│  Shopping Assistant│    │  Specific Handlers    │
│  • Product Search  │    │  • Style Recommender  │
│  • General Shopping│    │  • Frame Finder       │
│  • Cart Management │    │  • Fit Consultation   │
└───────────┬────────┘    └──────────┬────────────┘
            │                        │
            ▼                        ▼
┌─────────────────────────────────────────────────┐
│              Product Catalog                    │
│  (Standardized format for both platforms)       │
└─────────────────────────────────────────────────┘
```

## Core Design Principles

1. **Domain Expertise Preservation**: Maintain EyewearML's specialized domain knowledge for critical eyewear-specific user queries.

2. **Platform Standardization**: Create a consistent interface across e-commerce platforms (Shopify, WooCommerce) to simplify maintenance and deployment.

3. **Intelligent Request Routing**: Direct queries to either Vertex AI or domain-specific handlers based on intent classification and required expertise.

4. **Hybrid Response Generation**: Combine Vertex AI's e-commerce capabilities with domain-specific enhancement for certain query types.

5. **Future Industry Adaptability**: Design for modularity to allow adaptation to other industries beyond eyewear.

## Key Components

### 1. Intent Router

Analyzes incoming user messages to determine whether they require:
- General e-commerce handling (Vertex AI)
- Domain-specific expertise (EyewearML handlers)
- A hybrid response combining both

### 2. Context Manager

Maintains conversation state and user preferences across the session, ensuring:
- Consistent user experience
- Appropriate context sharing between systems
- Personalization persistence

### 3. Domain Expertise Integration

Injects specialized eyewear knowledge into responses:
- Pre-purchase consultation (style, fit, frame selection)
- Technical product details enhancement
- Prescription and fitting guidance

### 4. Product Catalog Adapter

Standardizes product data from different platforms:
- Normalizes attributes across Shopify and WooCommerce
- Enriches product data with domain-specific attributes
- Formats data for Vertex AI consumption

## Integration Approaches

The integration supports three primary operational modes:

### 1. Vertex AI Primary Mode

For general shopping queries, product browsing, and cart interactions:
- Vertex AI generates the core response
- Domain-specific details may be added to enhance the response
- Useful for catalog browsing, pricing queries, and order management

### 2. Domain-Specific Primary Mode

For specialized eyewear consultation queries:
- EyewearML handlers generate the primary response
- Vertex AI may supplement with e-commerce capabilities
- Ideal for style recommendations, frame fit advice, and prescription guidance

### 3. Hybrid Mode

For queries requiring both domain expertise and shopping assistant capabilities:
- Coordinated response generation
- Domain knowledge influences product recommendations
- Shopping functionality incorporates eyewear-specific constraints

## Integration Flow

1. User submits query through interface
2. Intent Router determines primary handling system
3. Context Manager provides relevant session information
4. Primary system (Vertex AI or Domain Handler) generates response
5. Secondary system enhances response if needed
6. Combined response is returned to user

## Extensibility for Future Industries

The architecture is designed for adaptation to industries beyond eyewear by:

1. Abstracting domain-specific logic into replaceable modules
2. Using standardized interfaces between components
3. Implementing a configurable intent classification system
4. Providing clear extension points for new domain handlers

## Next Steps

The following documents provide detailed implementation guidance for each component:

- [Intent Routing](02_intent_routing.md)
- [Domain Expertise Injection](03_domain_expertise_injection.md)
- [Product Catalog Adapter](04_product_catalog_adapter.md)
- [Platform Integration](05_platform_integration/)
- [Prompt Engineering](06_prompt_engineering/)
- [Testing Framework](07_testing_framework.md)
