# ML Platform and Dialogflow Integration Guide

This guide provides comprehensive instructions for integrating the ML platform with Dialogflow CX and setting up the necessary environments for development, staging, and production.

## Overview

The integration connects three main components:
1. **Dialogflow CX** - Conversational AI platform handling conversation flows
2. **ML Platform** - Provides enhanced product recommendations and analysis
3. **Webhook Service** - Middleware that connects Dialogflow to the ML Platform

## Prerequisites

- Google Cloud Platform account with appropriate permissions
- Google Cloud CLI (`gcloud`) installed and authenticated
- Node.js and npm installed
- Access to the ML Platform API credentials

## Setup Process

The setup process involves several steps that need to be completed in sequence:

1. Set up ML Platform environment
2. Set up GCP and Dialogflow environment
3. Configure Dialogflow webhooks
4. Test the integration
5. Deploy to staging and production

## Step 1: Set Up ML Platform Environment

### Option A: Local Development Setup

For local development with a mock ML API:

```bash
# Install dependencies
npm install

# Create local environment file
node scripts/setup-ml-env.js local

# Start the local development environment
node scripts/start-ml-integration.js
```

This starts a local mock ML API server and webhook service for development.

### Option B: Development Environment Setup

For development against the actual ML API:

```bash
# Install dependencies
npm install

# Create development environment file
node scripts/setup-ml-env.js development

# When prompted, enter the ML API key for development

# Verify the ML setup
node scripts/verify-ml-setup.js development
```

### Option C: Staging Environment Setup

For staging environment setup:

```bash
# Create staging environment file
node scripts/setup-ml-env.js staging

# When prompted, enter the ML API key for staging

# Verify the ML setup
node scripts/verify-ml-setup.js staging
```

## Step 2: Set Up GCP and Dialogflow Environment

### Development Environment

```bash
# Set up GCP project and Dialogflow agent for development
node scripts/setup-gcp-dialogflow.js development
```

Follow the interactive prompts to complete the setup. The script will:
- Create or use an existing GCP project
- Enable required APIs
- Find or create a Dialogflow CX agent
- Update environment files with the actual agent ID

### Staging Environment

```bash
# Set up GCP project and Dialogflow agent for staging
node scripts/setup-gcp-dialogflow.js staging
```

## Step 3: Configure Dialogflow Webhooks

After setting up the GCP and Dialogflow environments, you need to configure the webhooks in the Dialogflow CX console:

1. Go to the [Dialogflow CX console](https://dialogflow.cloud.google.com/cx/projects)
2. Select your project and agent
3. Go to Manage > Webhooks
4. Create a new webhook for the ML integration
5. Set the webhook URL according to your environment:
   - Development: `https://webhook-dev.eyewearml.com/dialogflow`
   - Staging: `https://webhook-staging.eyewearml.com/dialogflow`
   - Production: `https://webhook.eyewearml.com/dialogflow`

6. Configure webhook handlers with tags as described in `docs/integration/dialogflow_fulfillment_config.md`:
   - `recommendation.style` - Style recommendations
   - `recommendation.faceshape` - Face shape recommendations
   - `recommendation.fit` - Fit-based recommendations
   - `recommendation.tryon` - Try-on event recording
   - `recommendation.similar` - Similar frames discovery

## Step 4: Import Dialogflow Flows

Import the conversation flows into your Dialogflow agent:

1. In the Dialogflow CX console, select your agent
2. Go to Manage > Import
3. Import the following flow definitions:
   - `src/dialogflow/flows/style_recommendation_flow.json`
   - `src/dialogflow/flows/frame_finder_flow.json`
   - `src/dialogflow/flows/fit_consultation_flow.json`

## Step 5: Test the Integration

### Test in Dialogflow Console

1. In the Dialogflow CX console, click "Test Agent"
2. Start a conversation that triggers the ML-powered recommendation flows
3. Verify that responses include product recommendations

### Test with Frontend Application

1. Configure your frontend to use the appropriate environment variables
2. Start the application
3. Initiate conversation flows and verify ML-powered recommendations are displayed

## Step 6: Deploy the Integration

### Deploy to Development

```bash
node scripts/deploy-ml-integration.js development
```

### Deploy to Staging

```bash
node scripts/deploy-ml-integration.js staging
```

### Deploy to Production

```bash
node scripts/deploy-ml-integration.js production
```

## Configuration Reference

### Environment Files

The project uses several environment files for different components:

- **ML Client**: `src/ml/.env.[environment]`
- **Frontend**: `src/frontend/.env.[environment]`

### Configuration Documents

- **GCP and Dialogflow**: `docs/integration/gcp_dialogflow_config.md`
- **Dialogflow Fulfillment**: `docs/integration/dialogflow_fulfillment_config.md`
- **ML Integration Plan**: `docs/integration/ml_platform_integration_plan.md`
- **ML Integration Guide**: `docs/integration/ml_integration_guide.md`

## Troubleshooting

### ML API Connection Issues

If the ML API connection fails:

1. Verify API key in the environment file
2. Check if the ML API is accessible from your network
3. Run `node scripts/verify-ml-setup.js [environment]` to diagnose issues

### Dialogflow Webhook Issues

If webhooks are not working correctly:

1. Check webhook URL configuration in Dialogflow console
2. Verify webhook service is running
3. Check logs for authentication or connectivity issues
4. Ensure webhook tags are correctly configured in Dialogflow

### Testing in Isolation

To test the ML client in isolation:

```bash
node src/ml/client/test.js
```

## Maintenance

### Updating ML Models

When the ML platform is updated with new models:

1. Test against the development environment
2. Update any affected webhooks or handlers
3. Deploy changes to staging for verification
4. Deploy to production after successful testing

### Adding New Conversation Flows

To add new conversation flows that use the ML platform:

1. Design the flow in `design/conversation_flows/`
2. Implement the flow definition in `src/dialogflow/flows/`
3. Add any necessary webhook handlers in `src/webhook/handlers/`
4. Update fulfillment tags documentation
5. Test and deploy the new flow
