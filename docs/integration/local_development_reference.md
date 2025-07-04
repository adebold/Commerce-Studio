# Local Development Quick Reference

This quick reference provides an at-a-glance summary of the local development options for the ML Platform integration.

## 🚨 Important Warning 🚨

**DO NOT** attempt to run the local ML API server directly due to dependency conflicts with the project's React/TypeScript versions.

## Quick Start Commands

### Start Local Development Environment

```bash
# Option 1: Using httpbin.org (HTTP testing only, no ML functionality)
node scripts/start-local-dev.js httpbin

# Option 2: Using staging API (real ML functionality)
node scripts/start-local-dev.js staging
```

### Testing API Connectivity

```bash
# Test connectivity to httpbin.org
node scripts/test-httpbin.js

# Test connectivity to any environment
node scripts/test-ml-connection.js local
node scripts/test-ml-connection.js development
node scripts/test-ml-connection.js staging
```

### Verifying Environment Setup

```bash
# Verify any environment configuration
node scripts/verify-ml-setup.js local
node scripts/verify-ml-setup.js development
node scripts/verify-ml-setup.js staging
```

### Deploying to Various Environments

```bash
# Set up environment-specific configuration
node scripts/setup-ml-env.js [environment]

# Deploy to an environment
node scripts/deploy-ml-integration.js [environment]
```

## Environment Variables

### Set NODE_ENV for Local Development

```bash
# Windows
set NODE_ENV=local

# Linux/Mac
export NODE_ENV=local
```

## Firebase Mock System

The webhook uses a Firebase mock in local development mode (`NODE_ENV=local`):

- In-memory Firestore implementation
- No real Firebase credentials needed
- Automatic environment detection

## File Paths Reference

### Environment Files
- Local: `src/ml/.env.local`
- Development: `src/ml/.env.development`
- Staging: `src/ml/.env.staging`

### Key Scripts
- Local Dev Starter: `scripts/start-local-dev.js`
- Httpbin Tester: `scripts/test-httpbin.js`
- ML Connection Tester: `scripts/test-ml-connection.js`
- Environment Setup: `scripts/setup-ml-env.js`
- Deployment Script: `scripts/deploy-ml-integration.js`

### Documentation
- Local Development Guide: `docs/integration/local_development_guide.md`
- ML Integration Guide: `docs/integration/ml_integration_guide.md`
- Dialogflow Config: `docs/integration/dialogflow_fulfillment_config.md`

## Troubleshooting Tips

- If Firebase-related errors occur, ensure `NODE_ENV=local` is set
- If API connection fails, check network connectivity and API keys
- For httpbin mode, internet connectivity is required
- For staging mode, valid API credentials are required
