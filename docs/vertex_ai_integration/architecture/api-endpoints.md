# API Endpoints

The API Endpoints component provides the backend interface that connects the Shopping Assistant UI to the Vertex AI service. It handles requests from the frontend, communicates with the Vertex AI Connector, and returns formatted responses.

## Overview

The API Endpoints component consists of RESTful API handlers that:

- Process requests from the Shopping Assistant UI
- Authenticate and validate incoming requests
- Communicate with the Vertex AI Connector
- Format and return responses to the frontend
- Handle error conditions gracefully

## Implementation

The main API endpoint is implemented in JavaScript and is located at `apps/shopify/api/shopping-assistant.js`. It provides a clean, well-structured interface for frontend components to access the AI capabilities.

## Endpoint Structure

### Shopping Assistant Endpoint

**URL**: `/api/shopping-assistant`  
**Method**: `POST`  
**Content-Type**: `application/json`

#### Request Parameters

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| query | string | The user's natural language query | Yes |
| sessionId | string | Unique identifier for the conversation session | Yes |
| contextItems | string[] | Additional context to include in the request | No |
| shopDomain | string | The Shopify store domain | Yes |

#### Request Example

```json
{
  "query": "I'm looking for sunglasses for a round face",
  "sessionId": "user_session_12345",
  "contextItems": ["Previous purchase: Ray-Ban Aviator"],
  "shopDomain": "your-store.myshopify.com"
}
```

#### Response Structure

| Field | Type | Description |
|-------|------|-------------|
| response | string | The AI-generated text response |
| products | array | Array of recommended products |
| suggestedQueries | array | Array of suggested follow-up questions |

#### Response Example

```json
{
  "response": "For round faces, I recommend frames that add angles and definition. Square or rectangular sunglasses tend to work well. Here are some options that would look great on a round face:",
  "products": [
    {
      "id": "shopify-12345",
      "title": "Wayfarer Square Sunglasses",
      "description": "Classic square frame sunglasses...",
      "price": {
        "amount": 129.99,
        "currencyCode": "USD"
      },
      "images": [
        {
          "id": "img-1",
          "url": "https://cdn.shopify.com/s/files/1/0000/0000/products/wayfarer-1.jpg"
        }
      ],
      "attributes": {
        "eyewear": {
          "frameShape": "Square",
          "recommendedFaceShapes": ["Round", "Oval"]
        }
      }
    }
  ],
  "suggestedQueries": [
    "Do you have polarized sunglasses?",
    "Which of these would be best for driving?",
    "Do you have any in tortoise shell color?"
  ]
}
```

#### Error Response

In case of an error, the API returns:

```json
{
  "error": "Error type or description",
  "message": "Detailed error message"
}
```

With appropriate HTTP status codes:
- `400`: Bad Request (missing or invalid parameters)
- `404`: Not Found (resource not found)
- `500`: Internal Server Error (server-side error)

## Implementation Details

### Request Handling

The API endpoint receives requests and processes them:

```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, sessionId, contextItems = [], shopDomain } = req.body;

    // Validate required parameters
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    if (!shopDomain) {
      return res.status(400).json({ error: 'Shop domain is required' });
    }

    // Initialize Vertex AI connector
    const vertexAI = new VertexAIConnector(shopDomain);

    // Get product recommendations
    const result = await vertexAI.getProductRecommendation(query, {
      sessionId,
      contextItems,
      maxResults: 5 // Limit to 5 products for UI
    });

    // Return response
    return res.status(200).json({
      response: result.response,
      products: result.products,
      suggestedQueries: result.suggestedQueries || []
    });
  } catch (error) {
    logger.error('Error in shopping assistant API:', error);
    return res.status(500).json({ 
      error: 'Failed to process request',
      message: error.message
    });
  }
}
```

### Error Handling

The endpoint implements comprehensive error handling:

1. **Method Validation**: Ensures only POST requests are accepted
2. **Parameter Validation**: Verifies required parameters are present
3. **Try/Catch Block**: Catches and processes any runtime errors
4. **Logging**: Records errors for troubleshooting
5. **Structured Error Responses**: Returns formatted error information

### Performance Considerations

For optimal API performance:

1. **Asynchronous Processing**: Uses async/await for non-blocking operation
2. **Resource Management**: Initializes the Vertex AI connector only when needed
3. **Timeout Handling**: Implements proper timeout handling for external service calls
4. **Response Size Control**: Limits the number of products returned to maintain performance

## Security Considerations

The API implements several security measures:

1. **Input Validation**: Validates all incoming parameters
2. **Authentication**: Verifies the request is from an authorized source
3. **CORS Policies**: Implements appropriate cross-origin resource sharing policies
4. **Rate Limiting**: Protects against abuse through rate limiting
5. **Error Information**: Provides minimal error details to prevent information leakage

## Integration Examples

### Frontend Integration

```typescript
// In the Shopping Assistant component
const handleSendMessage = async () => {
  try {
    // Send message to API
    const response = await fetch('/api/shopping-assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: currentMessage,
        sessionId,
        contextItems: initialContext,
        shopDomain
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to get response from shopping assistant');
    }
    
    const data = await response.json();
    
    // Process the response
    // ...
  } catch (error) {
    // Handle errors
    console.error('Error sending message:', error);
  }
};
```

### Demo Script Integration

```javascript
// In the demo script
async function sendQuery(query) {
  try {
    // Show typing indicator
    process.stdout.write(chalk.green('Assistant: ') + chalk.gray('Thinking...'));
    
    // Get response from Vertex AI
    const result = await vertexAI.getProductRecommendation(query, {
      sessionId,
      maxResults: 5
    });
    
    // Clear the "thinking" message
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    
    // Display assistant response
    console.log(chalk.green('Assistant: ') + result.response + '\n');
    
    // Display product recommendations if available
    if (result.products && result.products.length > 0) {
      console.log(chalk.magenta('Product Recommendations:'));
      result.products.forEach((product, index) => {
        console.log(chalk.bold(`${index + 1}. ${product.title}`));
        console.log(chalk.gray(`   Price: $${product.price.amount.toFixed(2)}`));
      });
    }
  } catch (error) {
    console.error(chalk.red('Error: ') + error.message);
  }
}
```

## Deployment Considerations

When deploying the API endpoints:

1. **Environment Configuration**: Set up proper environment variables
2. **API Gateway**: Consider using an API gateway for additional security
3. **Monitoring**: Implement API monitoring and logging
4. **Load Balancing**: Use load balancing for high-traffic scenarios
5. **Caching**: Implement response caching where appropriate

## Future Enhancements

Potential future enhancements for the API endpoints:

1. **GraphQL Interface**: Add a GraphQL endpoint for more flexible queries
2. **Webhooks**: Implement webhooks for asynchronous processing
3. **Enhanced Authentication**: Add OAuth or API key-based authentication
4. **Analytics Integration**: Track API usage and performance metrics
5. **Multi-tenant Support**: Enhanced support for multiple stores

## Related Components

The API Endpoints work closely with:

- [Vertex AI Connector](./vertex-ai-connector.md): Uses this to communicate with Google Cloud
- [Product Catalog Adapter](./product-catalog-adapter.md): Uses this for product data
- [Chat Interface](./chat-interface.md): Provides the backend for this component
