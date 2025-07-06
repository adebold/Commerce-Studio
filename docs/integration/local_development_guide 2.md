# Local Development Guide for ML Integration

This guide provides instructions for setting up and working with the ML platform integration in a local development environment. Due to dependency challenges with the full ML API server, we've established several alternative approaches.

## Development Options

### Option 1: Connect to Staging API (Recommended)

The simplest approach is to point your local development environment to the staging ML API server:

1. Update your `src/ml/.env.local` file to use the staging API endpoint:
   ```
   ML_API_BASE_URL=https://staging-ml-api.eyewearml.com/api
   ML_API_KEY=your-staging-api-key
   ```

2. Test the connection:
   ```
   node scripts/test-ml-connection.js local
   ```

### Option 2: Use Httpbin.org for API Testing

For pure API integration testing without ML functionality, you can use httpbin.org:

1. Update your `src/ml/.env.local` file:
   ```
   ML_API_BASE_URL=https://httpbin.org
   ML_API_KEY=test-key-local-development
   ```

2. Test the connection:
   ```
   node scripts/test-httpbin.js
   ```

This approach allows testing HTTP requests/responses without actual ML functionality.

### Option 3: Mock Responses (Advanced)

For fully offline development:

1. Create mock response data in your code
2. Modify the ML client to return mock data for local development
3. Configure feature flags to enable/disable the mock mode

## Environment Configuration

### Local Environment

File: `src/ml/.env.local`

```
# For httpbin testing:
ML_API_BASE_URL=https://httpbin.org
ML_API_KEY=test-key-local-development

# OR for staging connection:
# ML_API_BASE_URL=https://staging-ml-api.eyewearml.com/api
# ML_API_KEY=your-staging-api-key

# Client Configuration
ML_CLIENT_TIMEOUT=5000
ML_CLIENT_ENABLE_CACHE=true
ML_CLIENT_LOG_LEVEL=debug
```

## Testing Scripts

The following scripts are available for testing API connectivity:

1. `scripts/test-ml-connection.js [environment]` - Tests the ML client connection to any environment
2. `scripts/test-httpbin.js` - Tests connectivity to httpbin.org for local development
3. `scripts/verify-ml-setup.js [environment]` - Verifies ML platform setup for an environment

## Dependency Issues Resolution

The original approach attempted to run a local ML API server, but we encountered dependency conflicts with the project's React and TypeScript versions. 

Issues encountered:
- Conflicts between React-scripts and TypeScript versions
- Node module resolution problems

Resolution:
- Use remote API endpoints instead of running local server
- Utilize httpbin.org for pure HTTP testing
- Connect to staging for real ML functionality

## Webhook Development

We've implemented a Firebase mock system for local development:

1. A Firebase Admin mock (`src/webhook/mocks/firebase-admin-mock.js`) provides in-memory implementations of Firestore
2. The `context_management.js` file has been updated to use this mock in local development mode
3. The system will automatically use the mock when `NODE_ENV=local`

To use the webhook with mocked Firebase:

```bash
# Set the NODE_ENV environment variable
set NODE_ENV=local   # Windows
# or
export NODE_ENV=local   # Linux/Mac

# Start the webhook service
node src/webhook/index.js
```

The mock Firebase implementation:
- Stores all data in memory (lost when the service restarts)
- Logs operations to the console for debugging
- Simulates Firestore collections and documents
- Provides authentication without real credentials

## Local Development Workflow

1. Choose an approach (staging, httpbin, or mocks)
2. Configure your environment
3. Use the ML client in your code as normal
4. For webhooks, implement mock services for dependencies
5. Test your code with the appropriate script

By following these guidelines, you can effectively develop and test the ML integration components without running the full ML API server locally.
