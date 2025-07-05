# ML Platform Integration for EyewearML Conversational AI

## ⚠️ IMPORTANT DEVELOPER NOTICE ⚠️

Due to dependency conflicts between the project's React/TypeScript versions and the ML API server requirements, we've implemented alternative approaches for local development. **DO NOT** attempt to run the local ML API server directly.

### Quick Reference: Local Development Commands

```bash
# Option 1: Start local development with httpbin.org (no real ML functionality)
node scripts/start-local-dev.js httpbin

# Option 2: Start local development with staging API (real ML functionality)
node scripts/start-local-dev.js staging
```

For detailed instructions, see the [Local Development Guide](./local_development_guide.md).

---

## Overview

This integration connects the EyewearML Conversational AI with the ML Platform to provide enhanced personalized recommendations powered by machine learning.

## Key Features

- Personalized recommendations based on user history and preferences
- Face shape analysis for better frame recommendations
- Style compatibility matching
- Fit-based recommendations
- Similar frame discovery
- Virtual try-on event tracking

## Files Created

### Core Integration
- `src/ml/client/ml_client.js` - Core ML client API
- `src/ml/client/webhook_integration.js` - Dialogflow webhook integration
- `src/ml/client/config.js` - Environment configuration
- `src/ml/client/index.js` - Package entry point
- `src/webhook/handlers/ml_recommendation_handlers.js` - ML-enhanced recommendation handlers

### Local Development System
- `scripts/start-local-dev.js` - Local development environment starter
- `scripts/test-httpbin.js` - HTTP testing with httpbin.org
- `scripts/test-ml-connection.js` - Testing ML API connectivity
- `src/webhook/mocks/firebase-admin-mock.js` - Firebase Admin mock implementation

### Documentation
- `docs/integration/local_development_guide.md` - Local development instructions
- `docs/integration/ml_platform_integration_plan.md` - Integration plan
- `docs/integration/ml_integration_guide.md` - Detailed usage guide
- `docs/integration/dialogflow_fulfillment_config.md` - Dialogflow webhook setup
- `docs/integration/gcp_dialogflow_config.md` - GCP and Dialogflow configuration

## Local Development Options

### Option 1: Use httpbin.org (No ML Functionality)
Best for HTTP request/response testing without needing real ML responses:
```bash
node scripts/start-local-dev.js httpbin
```

### Option 2: Connect to Staging API (Real ML Functionality)
Best for testing with actual ML capabilities:
```bash
node scripts/start-local-dev.js staging
```

### Option 3: Mocked Responses (Advanced)
For completely offline development, implement mock responses in your code.

## Deployment

For deployment to different environments:
```bash
node scripts/deploy-ml-integration.js [environment]
```

## Additional Resources

- [ML Integration Guide](./ml_integration_guide.md) - Detailed usage instructions
- [Local Development Guide](./local_development_guide.md) - Complete local setup guide
- [Dialogflow Configuration](./dialogflow_fulfillment_config.md) - Webhook configuration
