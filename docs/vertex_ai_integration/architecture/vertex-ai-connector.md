# Vertex AI Connector

The Vertex AI Connector is a core component of the Shopping Assistant integration, handling communication between the application and Google's Vertex AI service. This connector enables natural language understanding, product recommendations, and intelligent responses for eyewear-related queries.

## Overview

The Vertex AI Connector facilitates communication with Google's Vertex AI Shopping Assistant API, enabling:

- Natural language processing of customer queries
- AI-powered product recommendations based on customer needs
- Contextual responses that incorporate eyewear domain knowledge
- Suggested follow-up questions to guide the conversation

## Implementation

The connector is implemented in TypeScript and is located at `apps/shopify/connectors/vertex-ai-connector.ts`. It provides a clean interface for interacting with Vertex AI services while handling authentication, error management, and response processing.

## Key Features

### Authentication

The connector handles authentication with Google Cloud Platform using:

- OAuth 2.0 authentication flow
- Service account credentials
- Token management and refresh
- Secure credential storage

### Query Processing

The connector processes customer queries by:

1. Formatting queries with appropriate context
2. Sending requests to the Vertex AI API
3. Processing and parsing responses
4. Extracting product recommendations and suggested queries
5. Formatting responses for display in the UI

### Context Management

To provide personalized responses, the connector manages conversation context:

- Maintains conversation history for coherent multi-turn interactions
- Tracks user preferences and previous selections
- Stores session-specific information
- Includes relevant product details in context

### Product Recommendations

The connector extracts product recommendations from AI responses:

- Identifies product references in AI output
- Matches references to actual product catalog entries
- Ranks products based on relevance to the query
- Includes product details in the response

## API Reference

### Constructor

```typescript
constructor(shopDomain: string, options?: VertexAIConnectorOptions)
```

Parameters:
- `shopDomain`: The Shopify domain for this connection
- `options`: Optional configuration parameters

### Main Methods

#### Get Product Recommendation

```typescript
async getProductRecommendation(
  query: string, 
  options?: {
    sessionId?: string;
    contextItems?: string[];
    maxResults?: number;
  }
): Promise<{
  response: string;
  products: StandardProduct[];
  suggestedQueries?: string[];
}>
```

Parameters:
- `query`: The user's natural language query
- `options.sessionId`: Unique identifier for the conversation session
- `options.contextItems`: Additional context to include in the query
- `options.maxResults`: Maximum number of product recommendations to return

Returns:
- `response`: The AI-generated text response
- `products`: Array of recommended products
- `suggestedQueries`: Array of suggested follow-up questions

#### Reset Session

```typescript
async resetSession(sessionId: string): Promise<void>
```

Parameters:
- `sessionId`: The session ID to reset

#### Set User Context

```typescript
async setUserContext(
  sessionId: string, 
  contextData: {
    faceShape?: string;
    stylePreferences?: string[];
    previousPurchases?: string[];
    [key: string]: any;
  }
): Promise<void>
```

Parameters:
- `sessionId`: The session ID to update
- `contextData`: User-specific context data

## Configuration

The connector can be configured through environment variables or the constructor options:

| Variable | Description | Default |
|----------|-------------|---------|
| VERTEX_AI_PROJECT_ID | Google Cloud project ID | Derived from credentials |
| VERTEX_AI_LOCATION | Google Cloud region | "us-central1" |
| VERTEX_AI_MODEL_ID | Vertex AI model identifier | "shopping-assistant" |
| VERTEX_AI_MAX_TOKENS | Maximum response tokens | 1024 |
| VERTEX_AI_TEMPERATURE | Response randomness (0-1) | 0.2 |
| VERTEX_AI_ENABLE_LOGGING | Enable request/response logging | false |

## Usage Examples

### Basic Query

```typescript
import { VertexAIConnector } from '../connectors/vertex-ai-connector';

// Initialize the connector
const vertexAI = new VertexAIConnector('your-store.myshopify.com');

// Get recommendations for a user query
const result = await vertexAI.getProductRecommendation(
  "I'm looking for sunglasses for a round face", 
  { sessionId: "user_123" }
);

console.log(result.response); // AI text response
console.log(result.products); // Recommended products
console.log(result.suggestedQueries); // Suggested follow-ups
```

### Multi-turn Conversation

```typescript
import { VertexAIConnector } from '../connectors/vertex-ai-connector';

// Initialize the connector
const vertexAI = new VertexAIConnector('your-store.myshopify.com');
const sessionId = `session_${Date.now()}`;

// First query
const result1 = await vertexAI.getProductRecommendation(
  "I'm looking for blue light glasses", 
  { sessionId }
);

// Follow-up query (maintains conversation context)
const result2 = await vertexAI.getProductRecommendation(
  "Do you have any with thin frames?", 
  { sessionId }
);

// Add user context
await vertexAI.setUserContext(sessionId, {
  faceShape: "oval",
  stylePreferences: ["modern", "lightweight"]
});

// Query with enhanced context
const result3 = await vertexAI.getProductRecommendation(
  "Which of these would look best on me?", 
  { sessionId }
);
```

### Integration with API Endpoint

```typescript
import { VertexAIConnector } from '../connectors/vertex-ai-connector';

// In the API handler
export default async function handler(req, res) {
  const { query, sessionId, contextItems, shopDomain } = req.body;
  
  // Initialize Vertex AI connector
  const vertexAI = new VertexAIConnector(shopDomain);
  
  // Get product recommendations
  const result = await vertexAI.getProductRecommendation(query, {
    sessionId,
    contextItems,
    maxResults: 5
  });
  
  // Return response
  return res.status(200).json({
    response: result.response,
    products: result.products,
    suggestedQueries: result.suggestedQueries || []
  });
}
```

## Error Handling

The connector implements robust error handling:

1. **Authentication Errors**: Handles token expiration and refresh
2. **Network Errors**: Implements retries with exponential backoff
3. **API Errors**: Parses and provides meaningful error messages
4. **Rate Limiting**: Respects Google Cloud API quotas
5. **Malformed Responses**: Gracefully handles unexpected response formats

## Performance Optimization

For optimal performance, the connector implements:

1. **Connection Pooling**: Reuses HTTP connections
2. **Response Caching**: Caches identical queries
3. **Batch Processing**: Combines multiple operations when possible
4. **Streaming Responses**: Processes responses as they arrive
5. **Asynchronous Operations**: Uses non-blocking I/O

## Security Considerations

The connector implements several security best practices:

1. **Credential Management**: Securely manages API credentials
2. **Data Encryption**: Uses HTTPS for all API communication
3. **Token Security**: Securely handles access tokens
4. **Personal Data**: Minimizes transmission of PII
5. **Session Isolation**: Prevents cross-session data exposure

## Related Components

The Vertex AI Connector works closely with:

- [Product Catalog Adapter](./product-catalog-adapter.md): Provides product data for recommendations
- [API Endpoints](./api-endpoints.md): Exposes the connector functionality to the frontend
- [Shopping Assistant UI](./chat-interface.md): Displays responses from the connector
