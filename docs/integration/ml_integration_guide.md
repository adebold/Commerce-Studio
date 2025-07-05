# ML Platform Integration Guide

This guide provides instructions for using the ML Platform integration with the EyewearML Conversational AI system. The integration connects the conversational AI with the ML platform to provide enhanced personalized recommendations based on machine learning models.

## ⚠️ IMPORTANT: LOCAL DEVELOPMENT INSTRUCTIONS ⚠️

### Dependency Conflict Resolution

We've encountered dependency conflicts between the project's React/TypeScript versions and the requirements for running a local ML API server. **DO NOT** attempt to run the local ML API server directly.

Instead, we've implemented the following alternative approaches for local development:

1. **Use httpbin.org for API testing** - For basic HTTP request/response testing without ML functionality
2. **Connect to the staging API** - For testing with real ML functionality
3. **Use Firebase mocking** - For local webhook development without Firebase credentials

### Quick Start Commands

```bash
# Option 1: Start development with httpbin (HTTP testing only)
node scripts/start-local-dev.js httpbin

# Option 2: Start development with staging ML API
node scripts/start-local-dev.js staging
```

For detailed instructions, see the [Local Development Guide](./local_development_guide.md).

---

## Components

The integration consists of the following components:

1. **ML Client** (`src/ml/client/ml_client.js`) - JavaScript client for communicating with the ML platform API
2. **ML Webhook Integration** (`src/ml/client/webhook_integration.js`) - Integration between the ML client and Dialogflow webhook
3. **ML Recommendation Handlers** (`src/webhook/handlers/ml_recommendation_handlers.js`) - Enhanced recommendation handlers using ML platform capabilities
4. **Configuration** (`src/ml/client/config.js`) - Environment-specific configuration for the ML client
5. **Firebase Mock** (`src/webhook/mocks/firebase-admin-mock.js`) - Mock implementation of Firebase Admin for local development

## Features

The ML platform integration provides the following enhanced capabilities:

- **Personalized Recommendations** - Get frame recommendations tailored to individual users based on their history and preferences
- **Face Shape Analysis** - Analyze face shapes and recommend frames that complement specific facial features
- **Style Compatibility** - Match frame styles with user's style preferences
- **Fit Recommendations** - Recommend frames with optimal fit based on facial measurements
- **Similar Frame Discovery** - Find frames similar to ones a user has shown interest in
- **Virtual Try-On Tracking** - Record user engagement with virtual try-on to improve future recommendations

## Setup

### Prerequisites

- Node.js 14+
- Access to the ML Platform API
- API credentials for the ML Platform

### Environment Configuration

1. Create or update your environment file (e.g., `.env.development`) with the following variables:

```
# ML Platform API Configuration
ML_API_BASE_URL=http://localhost:5000/api  # Local development
# ML_API_BASE_URL=https://ml-api.eyewearml.com/api  # Production
ML_API_KEY=your_api_key_here
```

2. For different environments (development, staging, production), configure the appropriate base URLs in `src/ml/client/config.js`.

## Usage

### Using the ML Client Directly

```javascript
const { createClient } = require('../../ml/client');

// Create ML client with configuration
const mlClient = createClient({
  // Use environment variables or override with specific values
  baseUrl: process.env.ML_API_BASE_URL,
  apiKey: process.env.ML_API_KEY,
  enableCache: true
});

// Get personalized recommendations
const recommendations = await mlClient.getRecommendations(userId, sessionId);

// Get style-based recommendations
const styleRecommendations = await mlClient.getStyleRecommendations('modern', {
  occasion: 'casual',
  personality: 'creative'
});

// Get frame compatibility for face shape
const compatibleFrames = await mlClient.getFrameCompatibility(faceShapeId);

// Update user's biometric profile
await mlClient.updateBiometricProfile(userId, {
  face_shape: faceShapeId,
  pupillary_distance: 65
});

// Record try-on event
await mlClient.recordTryOnEvent(userId, frameId, {
  duration: 45,
  rotation_count: 3,
  zoom_actions: 2
});

// Get similar frames
const similarFrames = await mlClient.getSimilarFrames(frameId);
```

### Using the ML Recommendation Handlers

The ML recommendation handlers are already integrated with the webhook service in `src/webhook/index.js`. The handlers are mapped to specific fulfillment tags:

- `recommendation.style` - ML-powered style recommendations
- `recommendation.faceshape` - ML-powered face shape recommendations
- `recommendation.fit` - ML-powered fit recommendations
- `recommendation.tryon` - Record try-on events
- `recommendation.similar` - Get similar frames

Simply configure your Dialogflow fulfillment to use these tags, and the webhook will automatically use the ML-powered recommendation handlers.

## Testing

A test script is provided at `src/ml/client/test.js` to demonstrate the ML client integration:

```
node src/ml/client/test.js
```

This script demonstrates:
- Getting style recommendations
- Getting face shape recommendations
- Getting personalized recommendations
- Recording try-on events
- Getting similar frames

## Fallback Mechanism

If the ML Platform API is unavailable or returns no results, the ML recommendation handlers will automatically fall back to the original recommendation handlers, ensuring a seamless user experience.

## Monitoring and Logging

The ML integration includes comprehensive logging to help diagnose issues:

- Client errors are logged with context
- API errors are captured with detailed information
- Fallbacks to original handlers are logged

Review the logs for any issues with the ML platform integration.

## Extending the Integration

To add new ML capabilities:

1. Add new methods to the `MLClient` class in `src/ml/client/ml_client.js`
2. Create new handler functions in `src/webhook/handlers/ml_recommendation_handlers.js`
3. Map the new handlers to fulfillment tags in `src/webhook/index.js`

## Troubleshooting

### Common Issues

**Error: Failed to connect to ML API**
- Check that the ML API server is running
- Verify the API base URL is correct in your environment variables
- Check network connectivity between the webhook server and ML API

**Error: Authentication failed**
- Verify the API key is correct in your environment variables
- Check that the API key has the necessary permissions

**No recommendations returned**
- Check that the ML models are properly trained
- Verify the user ID and session ID are being correctly passed
- Examine the logs for specific error messages

## Next Steps

1. **Enhanced Face Analysis** - Integrate with the visual AI system for automatic face shape detection
2. **Advanced Personalization** - Incorporate more user data for better personalization
3. **A/B Testing** - Implement comparative testing of ML recommendations versus traditional recommendations
4. **Feedback Loop** - Add explicit user feedback mechanisms to improve model training
