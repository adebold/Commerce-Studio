# Google Cloud Platform (GCP) and Dialogflow Configuration

This document outlines the GCP project configuration for the EyewearML Conversational AI across different environments (development, staging, and production).

## GCP Projects

### Development
- **Project Name**: `eyewearml-conversational-ai-dev`
- **Project ID**: `eyewearml-conversational-ai-dev`
- **Default Location**: `us-central1`
- **API Endpoint**: `https://api-dev.eyewearml.com/dialogflow`

### Staging
- **Project Name**: `eyewearml-conversational-ai-staging`
- **Project ID**: `eyewearml-conversational-ai-staging` (use existing Commerce-Studio staging project)
- **Default Location**: `us-central1`
- **API Endpoint**: `https://api-staging.eyewearml.com/dialogflow`

### Production
- **Project Name**: `eyewearml-conversational-ai-prod`
- **Project ID**: `eyewearml-conversational-ai-prod` (use existing Commerce-Studio production project)
- **Default Location**: `us-central1`
- **API Endpoint**: `https://api.eyewearml.com/dialogflow`

## Dialogflow CX Agents

### Development
- **Agent Name**: `EyewearML Assistant - Dev`
- **Agent ID**: `[agent-id-placeholder-dev]` (replace with actual ID after creation)
- **Description**: Development version of the conversational AI assistant

### Staging
- **Agent Name**: `EyewearML Assistant - Staging`
- **Agent ID**: `[agent-id-placeholder-staging]` (replace with actual ID after creation)
- **Description**: Staging version of the conversational AI assistant for pre-production testing

### Production
- **Agent Name**: `EyewearML Assistant`
- **Agent ID**: `[agent-id-placeholder-prod]` (replace with actual ID after creation)
- **Description**: Production version of the conversational AI assistant

## Environment Variables

These variables need to be set in the respective environment configuration files or deployment systems:

### Development
```
REACT_APP_DIALOGFLOW_URL=https://api-dev.eyewearml.com/dialogflow
REACT_APP_DIALOGFLOW_PROJECT_ID=eyewearml-conversational-ai-dev
REACT_APP_DIALOGFLOW_AGENT_ID=[agent-id-placeholder-dev]
REACT_APP_DIALOGFLOW_LOCATION=us-central1
```

### Staging
```
REACT_APP_DIALOGFLOW_URL=https://api-staging.eyewearml.com/dialogflow
REACT_APP_DIALOGFLOW_PROJECT_ID=eyewearml-conversational-ai-staging
REACT_APP_DIALOGFLOW_AGENT_ID=[agent-id-placeholder-staging]
REACT_APP_DIALOGFLOW_LOCATION=us-central1
```

### Production
```
REACT_APP_DIALOGFLOW_URL=https://api.eyewearml.com/dialogflow
REACT_APP_DIALOGFLOW_PROJECT_ID=eyewearml-conversational-ai-prod
REACT_APP_DIALOGFLOW_AGENT_ID=[agent-id-placeholder-prod]
REACT_APP_DIALOGFLOW_LOCATION=us-central1
```

## Setting Up a New Environment

### 1. Create or Identify GCP Project
- Use existing Commerce-Studio project or create new project in GCP console
- Enable required APIs:
  - Dialogflow API
  - Cloud Functions API (for webhook)
  - Cloud Storage API (for logs and assets)

### 2. Create Dialogflow CX Agent
- Go to Dialogflow CX console
- Create new agent with specified name
- Note the Agent ID for environment variables

### 3. Import Conversation Flows
- Import flow definitions from JSON files:
  - `src/dialogflow/flows/style_recommendation_flow.json`
  - `src/dialogflow/flows/frame_finder_flow.json`
  - `src/dialogflow/flows/fit_consultation_flow.json`

### 4. Configure Webhook
- Create new webhook in Dialogflow CX console
- Set webhook URL to your deployed webhook service endpoint
- Configure authentication if needed
- Set up webhook handlers according to `docs/integration/dialogflow_fulfillment_config.md`

### 5. Update Environment Variables
- Update the environment variables in your deployment system
- Include proper Agent ID and Project ID

### 6. Test the Agent
- Use Test Agent feature in Dialogflow console
- Or use the frontend application with updated environment variables

## Webhook Deployment

### Development
- Webhook URL: `https://webhook-dev.eyewearml.com/dialogflow`
- Authentication: API Key based

### Staging
- Webhook URL: `https://webhook-staging.eyewearml.com/dialogflow`
- Authentication: API Key based

### Production
- Webhook URL: `https://webhook.eyewearml.com/dialogflow`
- Authentication: API Key based
