# AI Discovery API Documentation & Integration Guide

## Document Information
- **Document Type**: API Documentation & Integration Guide
- **Target Audience**: Developers, System Integrators, Third-party Partners
- **Version**: 1.0
- **Date**: January 2025
- **API Version**: v1

## Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Core API Endpoints](#core-api-endpoints)
4. [Platform Integration APIs](#platform-integration-apis)
5. [Webhook Integration](#webhook-integration)
6. [SDK Documentation](#sdk-documentation)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)
9. [Integration Examples](#integration-examples)
10. [Testing & Debugging](#testing--debugging)

## API Overview

### Base URLs
- **Production**: `https://api.varai.ai/v1`
- **Staging**: `https://staging-api.varai.ai/v1`
- **Development**: `https://dev-api.varai.ai/v1`

### API Architecture
The AI Discovery API follows RESTful principles with JSON request/response format. It provides endpoints for:
- AI conversation management
- Face analysis and virtual try-on
- Product recommendations
- Analytics and reporting
- Quality management
- Platform-specific integrations

### Supported Formats
- **Request Format**: JSON
- **Response Format**: JSON
- **Date Format**: ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)
- **Encoding**: UTF-8

## Authentication

### API Key Authentication
Most endpoints require API key authentication via the `X-API-Key` header.

```http
GET /api/v1/recommendations
Host: api.varai.ai
X-API-Key: your-api-key-here
Content-Type: application/json
```

### JWT Token Authentication
Admin panel and user-specific endpoints use JWT tokens.

```http
POST /api/v1/admin/analytics
Host: api.varai.ai
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### Obtaining API Keys

#### For Platform Integrations
1. **Shopify**: API keys generated during app installation
2. **WooCommerce**: Configure in plugin settings
3. **Magento**: Set in admin configuration
4. **HTML/Custom**: Request via developer portal

#### For Third-party Integrations
1. Register at `https://developers.varai.ai`
2. Create new application
3. Generate API keys
4. Configure rate limits and permissions

## Core API Endpoints

### AI Conversation API

#### Start Conversation Session
```http
POST /api/v1/ai/session/start
Content-Type: application/json
X-API-Key: your-api-key

{
  "clientId": "client-123",
  "userId": "user-456",
  "platform": "shopify",
  "context": {
    "productId": "product-789",
    "category": "sunglasses",
    "userAgent": "Mozilla/5.0...",
    "referrer": "https://example.com/products"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "session-abc123",
    "expiresAt": "2025-01-15T10:30:00Z",
    "configuration": {
      "features": {
        "faceAnalysis": true,
        "virtualTryOn": true,
        "recommendations": true
      },
      "branding": {
        "primaryColor": "#007bff",
        "logoUrl": "https://cdn.example.com/logo.png"
      }
    }
  }
}
```

#### Send Chat Message
```http
POST /api/v1/ai/chat
Content-Type: application/json
X-API-Key: your-api-key

{
  "sessionId": "session-abc123",
  "message": "I'm looking for sunglasses for a round face",
  "context": {
    "faceAnalysis": {
      "faceShape": "round",
      "confidence": 0.92
    },
    "previousRecommendations": ["product-1", "product-2"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "Perfect! For round faces, I recommend angular frames that add definition. Based on your face shape, here are some great options:",
    "recommendations": [
      {
        "productId": "product-123",
        "name": "Ray-Ban Wayfarer Classic",
        "score": 0.95,
        "reason": "Angular frame perfect for round faces",
        "price": 150.00,
        "currency": "USD",
        "imageUrl": "https://cdn.example.com/rayban-wayfarer.jpg"
      }
    ],
    "actions": [
      {
        "type": "show_virtual_tryon",
        "productId": "product-123"
      }
    ],
    "conversationId": "conv-xyz789"
  }
}
```

### Face Analysis API

#### Analyze Face Shape
```http
POST /api/v1/ai/face-analysis
Content-Type: application/json
X-API-Key: your-api-key

{
  "sessionId": "session-abc123",
  "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "options": {
    "returnLandmarks": false,
    "confidenceThreshold": 0.7
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "faceShape": "oval",
    "confidence": 0.89,
    "recommendations": [
      "Most frame styles work well with oval faces",
      "Try aviators, wayfarers, or round frames",
      "Avoid oversized frames that overwhelm your features"
    ],
    "compatibleStyles": [
      "aviator",
      "wayfarer",
      "round",
      "cat-eye",
      "rectangular"
    ],
    "processedAt": "2025-01-15T10:15:30Z"
  }
}
```

### Recommendations API

#### Get Product Recommendations
```http
GET /api/v1/recommendations?sessionId=session-abc123&limit=10&category=sunglasses
X-API-Key: your-api-key
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "productId": "product-123",
        "name": "Ray-Ban Aviator Classic",
        "brand": "Ray-Ban",
        "category": "sunglasses",
        "price": 150.00,
        "currency": "USD",
        "score": 0.95,
        "reasons": [
          "Perfect for oval face shape",
          "Classic aviator style",
          "High customer satisfaction"
        ],
        "images": [
          "https://cdn.example.com/rayban-aviator-1.jpg",
          "https://cdn.example.com/rayban-aviator-2.jpg"
        ],
        "attributes": {
          "frameShape": "aviator",
          "material": "metal",
          "color": "gold",
          "size": "medium",
          "gender": "unisex"
        }
      }
    ],
    "algorithm": "collaborative_filtering_v2",
    "totalCount": 25,
    "hasMore": true,
    "nextCursor": "cursor-def456"
  }
}
```

### Analytics API

#### Track Event
```http
POST /api/v1/analytics/track
Content-Type: application/json
X-API-Key: your-api-key

{
  "sessionId": "session-abc123",
  "event": {
    "type": "recommendation_click",
    "productId": "product-123",
    "timestamp": "2025-01-15T10:20:00Z",
    "metadata": {
      "position": 1,
      "source": "ai_chat",
      "faceShape": "oval"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "eventId": "event-ghi789",
    "processed": true
  }
}
```

## Platform Integration APIs

### Shopify Integration

#### Sync Products
```http
POST /api/v1/platforms/shopify/sync/products
Content-Type: application/json
X-API-Key: your-api-key

{
  "shopDomain": "example.myshopify.com",
  "accessToken": "shpat_...",
  "syncOptions": {
    "fullSync": false,
    "categories": ["sunglasses", "eyeglasses"],
    "updatedSince": "2025-01-14T00:00:00Z"
  }
}
```

#### Webhook Handler
```http
POST /api/v1/platforms/shopify/webhooks/orders/create
Content-Type: application/json
X-Shopify-Topic: orders/create
X-Shopify-Hmac-Sha256: base64-encoded-hmac

{
  "id": 820982911946154500,
  "email": "customer@example.com",
  "created_at": "2025-01-15T10:25:00Z",
  "line_items": [
    {
      "id": 866550311766439020,
      "product_id": 632910392,
      "variant_id": 808950810,
      "quantity": 1,
      "price": "150.00"
    }
  ]
}
```

### WooCommerce Integration

#### Product Sync
```http
POST /api/v1/platforms/woocommerce/sync
Content-Type: application/json
X-API-Key: your-api-key

{
  "siteUrl": "https://example.com",
  "consumerKey": "ck_...",
  "consumerSecret": "cs_...",
  "syncOptions": {
    "categories": [15, 16, 17],
    "status": "publish",
    "modifiedAfter": "2025-01-14T00:00:00Z"
  }
}
```

### Magento Integration

#### Customer Data Sync
```http
POST /api/v1/platforms/magento/sync/customers
Content-Type: application/json
X-API-Key: your-api-key

{
  "magentoUrl": "https://example.com",
  "adminToken": "bearer-token",
  "syncOptions": {
    "includeOrders": true,
    "dateRange": {
      "from": "2025-01-01",
      "to": "2025-01-15"
    }
  }
}
```

## Webhook Integration

### Webhook Configuration

#### Register Webhook
```http
POST /api/v1/webhooks
Content-Type: application/json
X-API-Key: your-api-key

{
  "url": "https://your-site.com/webhooks/varai",
  "events": [
    "session.started",
    "face_analysis.completed",
    "recommendation.generated",
    "purchase.completed"
  ],
  "secret": "your-webhook-secret"
}
```

### Webhook Events

#### Session Started
```json
{
  "event": "session.started",
  "timestamp": "2025-01-15T10:30:00Z",
  "data": {
    "sessionId": "session-abc123",
    "clientId": "client-123",
    "userId": "user-456",
    "platform": "shopify"
  }
}
```

#### Face Analysis Completed
```json
{
  "event": "face_analysis.completed",
  "timestamp": "2025-01-15T10:32:00Z",
  "data": {
    "sessionId": "session-abc123",
    "faceShape": "oval",
    "confidence": 0.89,
    "processingTime": 4200
  }
}
```

#### Purchase Completed
```json
{
  "event": "purchase.completed",
  "timestamp": "2025-01-15T10:45:00Z",
  "data": {
    "sessionId": "session-abc123",
    "orderId": "order-789",
    "products": [
      {
        "productId": "product-123",
        "quantity": 1,
        "price": 150.00,
        "aiRecommended": true
      }
    ],
    "totalValue": 150.00,
    "currency": "USD"
  }
}
```

## SDK Documentation

### JavaScript SDK

#### Installation
```bash
npm install @varai/ai-discovery-sdk
```

#### Basic Usage
```javascript
import { VaraiSDK } from '@varai/ai-discovery-sdk';

const varai = new VaraiSDK({
  apiKey: 'your-api-key',
  environment: 'production' // or 'staging', 'development'
});

// Start a session
const session = await varai.startSession({
  clientId: 'client-123',
  userId: 'user-456',
  platform: 'html'
});

// Send a chat message
const response = await varai.sendMessage(session.sessionId, {
  message: 'I need sunglasses for outdoor activities',
  context: {
    activity: 'outdoor',
    budget: { min: 100, max: 300 }
  }
});

console.log(response.response); // AI response
console.log(response.recommendations); // Product recommendations
```

#### Face Analysis
```javascript
// Analyze face from camera or uploaded image
const faceAnalysis = await varai.analyzeFace(session.sessionId, {
  source: 'camera', // or 'upload'
  options: {
    returnLandmarks: false,
    confidenceThreshold: 0.7
  }
});

console.log(`Face shape: ${faceAnalysis.faceShape}`);
console.log(`Confidence: ${faceAnalysis.confidence}`);
```

#### Event Tracking
```javascript
// Track user interactions
await varai.trackEvent(session.sessionId, {
  type: 'recommendation_click',
  productId: 'product-123',
  metadata: {
    position: 1,
    source: 'ai_chat'
  }
});
```

### Python SDK

#### Installation
```bash
pip install varai-ai-discovery
```

#### Basic Usage
```python
from varai import VaraiClient

client = VaraiClient(
    api_key='your-api-key',
    environment='production'
)

# Start session
session = client.start_session(
    client_id='client-123',
    user_id='user-456',
    platform='magento'
)

# Send chat message
response = client.send_message(
    session_id=session['sessionId'],
    message='I need prescription glasses for reading',
    context={
        'prescription': True,
        'usage': 'reading'
    }
)

print(response['response'])
for rec in response['recommendations']:
    print(f"- {rec['name']}: ${rec['price']}")
```

### PHP SDK

#### Installation
```bash
composer require varai/ai-discovery-sdk
```

#### Basic Usage
```php
<?php
use Varai\AIDiscovery\Client;

$client = new Client([
    'api_key' => 'your-api-key',
    'environment' => 'production'
]);

// Start session
$session = $client->startSession([
    'clientId' => 'client-123',
    'userId' => 'user-456',
    'platform' => 'woocommerce'
]);

// Send message
$response = $client->sendMessage($session['sessionId'], [
    'message' => 'I want trendy frames for work',
    'context' => [
        'setting' => 'professional',
        'style_preference' => 'trendy'
    ]
]);

echo $response['response'];
foreach ($response['recommendations'] as $product) {
    echo "- {$product['name']}: \${$product['price']}\n";
}
?>
```

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "sessionId",
      "reason": "Session ID is required"
    },
    "timestamp": "2025-01-15T10:30:00Z",
    "requestId": "req-abc123"
  }
}
```

### Error Codes

#### Authentication Errors
- `UNAUTHORIZED` (401): Invalid or missing API key
- `FORBIDDEN` (403): Insufficient permissions
- `TOKEN_EXPIRED` (401): JWT token has expired

#### Validation Errors
- `VALIDATION_ERROR` (400): Invalid request parameters
- `MISSING_REQUIRED_FIELD` (400): Required field missing
- `INVALID_FORMAT` (400): Invalid data format

#### Resource Errors
- `NOT_FOUND` (404): Resource not found
- `SESSION_EXPIRED` (410): Session has expired
- `QUOTA_EXCEEDED` (429): API quota exceeded

#### Server Errors
- `INTERNAL_ERROR` (500): Internal server error
- `SERVICE_UNAVAILABLE` (503): Service temporarily unavailable
- `TIMEOUT` (504): Request timeout

### Error Handling Best Practices

#### Retry Logic
```javascript
async function makeAPICall(endpoint, data, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      if (response.status >= 500 && attempt < maxRetries) {
        // Retry server errors with exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
        continue;
      }
      
      throw new Error(`API call failed: ${response.status}`);
    } catch (error) {
      if (attempt === maxRetries) throw error;
    }
  }
}
```

## Rate Limiting

### Rate Limit Headers
```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642248000
X-RateLimit-Window: 3600
```

### Rate Limits by Endpoint

| Endpoint Category | Limit | Window |
|------------------|-------|---------|
| Authentication | 10 requests | 1 minute |
| AI Chat | 100 requests | 1 hour |
| Face Analysis | 50 requests | 1 hour |
| Recommendations | 200 requests | 1 hour |
| Analytics | 500 requests | 1 hour |
| Webhooks | 1000 requests | 1 hour |

### Rate Limit Exceeded Response
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 3600 seconds.",
    "details": {
      "limit": 100,
      "window": 3600,
      "resetAt": "2025-01-15T11:00:00Z"
    }
  }
}
```

## Integration Examples

### Complete E-commerce Integration

#### HTML Store Integration
```html
<!DOCTYPE html>
<html>
<head>
    <title>Eyewear Store</title>
    <script src="https://cdn.varai.ai/sdk/v1/varai-sdk.min.js"></script>
</head>
<body>
    <div id="product-page">
        <h1>Ray-Ban Aviator Classic</h1>
        <div id="varai-ai-discovery"></div>
    </div>

    <script>
        const varai = new VaraiSDK({
            apiKey: 'your-api-key',
            containerId: 'varai-ai-discovery'
        });

        // Initialize AI discovery
        varai.init({
            clientId: 'your-client-id',
            product: {
                id: 'rayban-aviator-classic',
                name: 'Ray-Ban Aviator Classic',
                category: 'sunglasses',
                price: 150.00
            },
            features: {
                faceAnalysis: true,
                virtualTryOn: true,
                aiChat: true
            }
        });

        // Handle events
        varai.on('recommendation', (products) => {
            console.log('Recommendations received:', products);
        });

        varai.on('purchase_intent', (product) => {
            // Handle add to cart
            addToCart(product);
        });
    </script>
</body>
</html>
```

#### React Integration
```jsx
import React, { useEffect, useState } from 'react';
import { VaraiSDK } from '@varai/ai-discovery-sdk';

const AIDiscoveryWidget = ({ product, clientId }) => {
  const [varai, setVarai] = useState(null);
  const [session, setSession] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const sdk = new VaraiSDK({
      apiKey: process.env.REACT_APP_VARAI_API_KEY
    });

    // Start session
    sdk.startSession({
      clientId,
      userId: getCurrentUserId(),
      platform: 'html',
      context: { productId: product.id }
    }).then(setSession);

    setVarai(sdk);
  }, [clientId, product.id]);

  const handleFaceAnalysis = async () => {
    if (!varai || !session) return;

    try {
      const result = await varai.analyzeFace(session.sessionId, {
        source: 'camera'
      });
      
      console.log('Face analysis result:', result);
      
      // Get recommendations based on face shape
      const recs = await varai.getRecommendations(session.sessionId, {
        faceShape: result.faceShape,
        limit: 5
      });
      
      setRecommendations(recs.recommendations);
    } catch (error) {
      console.error('Face analysis failed:', error);
    }
  };

  const handleChatMessage = async (message) => {
    if (!varai || !session) return;

    try {
      const response = await varai.sendMessage(session.sessionId, {
        message,
        context: { productId: product.id }
      });
      
      return response;
    } catch (error) {
      console.error('Chat message failed:', error);
    }
  };

  return (
    <div className="ai-discovery-widget">
      <div className="face-analysis">
        <button onClick={handleFaceAnalysis}>
          Analyze My Face Shape
        </button>
      </div>
      
      <div className="recommendations">
        {recommendations.map(product => (
          <div key={product.productId} className="recommendation">
            <img src={product.images[0]} alt={product.name} />
            <h3>{product.name}</h3>
            <p>${product.price}</p>
            <p>{product.reasons.join(', ')}</p>
          </div>
        ))}
      </div>
      
      <ChatInterface onSendMessage={handleChatMessage} />
    </div>
  );
};

export default AIDiscoveryWidget;
```

### Backend Integration Example

#### Node.js Express Server
```javascript
const express = require('express');
const { VaraiClient } = require('@varai/ai-discovery-sdk');

const app = express();
const varai = new VaraiClient({
  apiKey: process.env.VARAI_API_KEY
});

app.use(express.json());

// Proxy endpoint for AI chat
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { sessionId, message, context } = req.body;
    
    const response = await varai.sendMessage(sessionId, {
      message,
      context
    });
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      error: 'AI chat failed',
      details: error.message
    });
  }
});

// Webhook handler
app.post('/webhooks/varai', (req, res) => {
  const { event, data } = req.body;
  
  switch (event) {
    case 'purchase.completed':
      // Update analytics, send confirmation email, etc.
      handlePurchaseCompleted(data);
      break;
      
    case 'face_analysis.completed':
      // Log face analysis results
      logFaceAnalysis(data);
      break;
  }
  
  res.status(200).send('OK');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## Testing & Debugging

### Test Environment Setup
```bash
# Set test environment
export VARAI_API_KEY=test_key_123
export VARAI_ENVIRONMENT=development

# Run tests
npm test
```

### API Testing with cURL

#### Test Authentication
```bash
curl -X GET \
  https://api.varai.ai/v1/health \
  -H "X-API-Key: your-api-key"
```

#### Test AI Chat
```bash
curl -X POST \
  https://api.varai.ai/v1/ai/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "sessionId": "test-session-123",
    "message": "I need sunglasses for driving"
  }'
```

### Debug Mode
```javascript
const varai = new VaraiSDK({
  apiKey: 'your-api-key',
  debug: true, // Enable debug logging
  logLevel: 'verbose'
});

// Debug logs will show:
// - API requests and responses
// - Performance metrics
// - Error details
// - Session information
```

### Common Integration Issues

#### CORS Issues
```javascript
// Add CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, Authorization'
};
```

#### Session Management
```javascript
// Proper session lifecycle management
class SessionManager {
  constructor(varai) {
    this.varai = varai;
    this.sessions = new Map();
  }
  
  async getOrCreateSession(userId, clientId) {
    const existingSession = this.sessions.get(userId);
    
    if (existingSession && !this.isExpired(existingSession)) {
      return existingSession;
    }
    
    const newSession = await this.varai.startSession({
      userId,
      clientId,
      platform: 'html'
    });
    
    this.sessions.set(userId, newSession);
    return newSession;
  }
  
  isExpired(session) {
    return new Date() > new Date(session.expiresAt);
  }
}
```

---

**API Support**: For technical support with API integration, contact our developer support team at `developers@varai.ai`

**Rate Limits**: Contact us to discuss higher rate limits for production applications

**Documentation Updates**: This documentation is updated with each API version release. Subscribe to our developer newsletter for updates.

**Last Updated**: January 2025  
**API Version**: v1.0  
**Next Review**: April 2025