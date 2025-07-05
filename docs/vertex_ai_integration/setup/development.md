# Development Guide

This guide provides detailed instructions for developers working on the Vertex AI Shopping Assistant integration. It covers the local development workflow, testing procedures, and deployment processes.

## Development Environment Setup

### Prerequisites

Before starting development, ensure you have the following installed:

- **Node.js v18+** - Required for running the application
- **npm or yarn** - Package manager for installing dependencies
- **Git** - Version control system
- **Visual Studio Code** (recommended) - Code editor with TypeScript support
- **Google Cloud SDK** - For GCP deployment and authentication
- **Docker** - For containerized development and deployment

### Initial Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-organization/eyewear-ml.git
   cd eyewear-ml
   ```

2. Navigate to the Vertex AI integration directory:
   ```bash
   cd src/varai/vertex_ai_integration
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create environment configuration:
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit the .env file with your configuration
   # See the Configuration Guide for details
   ```

5. Build the TypeScript code:
   ```bash
   npm run build
   ```

## Local Development Workflow

### Running the Application Locally

The project supports several modes for local development:

#### Development Mode with Hot Reloading

```bash
npm run dev
```

This starts the application with nodemon, which automatically restarts the server when files change.

#### Production Mode

```bash
npm run build
npm start
```

This builds the TypeScript code and starts the server in production mode.

### TypeScript Compilation Issues

If you encounter TypeScript compilation issues with the `.ts` file extension, you may need to modify your `tsconfig.json` to ensure proper module resolution. For ESM modules, make sure your configuration includes:

```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true
  }
}
```

### Running Demo Applications

The project includes several demo applications to test functionality:

```bash
# CLI demo client
npm run demo:cli

# Interactive CLI demo with color output
npm run demo:interactive

# Web-based demo
npm run demo:serve

# Face analysis demo
npm run demo:face-analysis

# Voice interaction demos
npm run demo:voice
npm run demo:voice-web
npm run demo:voice-neural
npm run demo:voice-google
```

## Testing

The project uses Jest for testing. Several test scripts are available:

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage reporting
npm test -- --coverage

# Run specific test files
npm test -- hybrid-orchestrator.test.ts

# Run tests in watch mode (for development)
npm test -- --watch
```

### Test Structure

Tests are organized in the `tests` directory, mirroring the structure of the source code:

```
tests/
├── unit/                 # Unit tests for individual components
├── integration/          # Integration tests for component interactions
├── e2e/                  # End-to-end tests for complete flows
└── utils/                # Test utilities and helpers
```

### Writing Tests

When writing tests:

1. Create test files with the `.test.ts` extension
2. Use descriptive test names that explain the expected behavior
3. Mock external dependencies using Jest's mocking capabilities
4. Use the test helpers in `tests/utils/` for common testing patterns

Example test structure:

```typescript
import { describe, expect, test, jest, beforeEach, afterEach } from '@jest/globals';
import { ComponentToTest } from '../path/to/component';
import { createMockResponse, mocks } from './utils/test-helpers';

describe('ComponentToTest', () => {
  let component: ComponentToTest;
  
  beforeEach(() => {
    // Setup for each test
    component = new ComponentToTest();
  });
  
  afterEach(() => {
    // Cleanup after each test
    jest.resetAllMocks();
  });
  
  test('should perform expected behavior', async () => {
    // Arrange
    const input = 'test input';
    
    // Act
    const result = await component.process(input);
    
    // Assert
    expect(result).toEqual(expect.objectContaining({
      success: true
    }));
  });
});
```

### Performance Testing

The project includes performance testing tools:

```bash
# Establish performance baseline
npm run perf:baseline

# Run performance tests with reporting
npm run perf:report

# Compare current performance against baseline
npm run perf:compare
```

Performance tests measure:
- Execution time for key operations
- Memory usage
- API call counts
- Response latency

## Deployment

### Local Docker Deployment

To test the application in a containerized environment:

```bash
# Build the Docker image
npm run docker:build

# Run the Docker container
npm run docker:run
```

This uses the Dockerfile in the project root to build and run the application.

### Google Cloud Platform Deployment

#### Prerequisites for GCP Deployment

1. Ensure you have the Google Cloud SDK installed and configured
2. Authenticate with Google Cloud:
   ```bash
   gcloud auth login
   ```
3. Set the active project:
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```
4. Enable required APIs:
   ```bash
   gcloud services enable run.googleapis.com containerregistry.googleapis.com
   ```

#### Deploying to Staging

```bash
# Set the GOOGLE_CLOUD_PROJECT environment variable
export GOOGLE_CLOUD_PROJECT=your-gcp-project-id

# Deploy to staging
npm run deploy:staging
```

This script:
1. Builds the application
2. Creates a Docker container
3. Pushes the container to Google Container Registry
4. Deploys the container to Google Cloud Run

#### Deployment Troubleshooting

If you encounter issues during deployment:

1. Check that the `GOOGLE_CLOUD_PROJECT` environment variable is set correctly
2. Verify that you have the necessary permissions in your GCP project
3. Ensure that billing is enabled for your GCP project
4. Check the deployment logs for specific error messages

## Extending the Integration

### Adding New Domain Handlers

Domain handlers provide specialized eyewear expertise. To add a new handler:

1. Create a new handler class in `models/domain-handlers.ts`:
   ```typescript
   export class NewDomainHandler implements DomainHandler {
     async processMessage(message: UserMessage): Promise<SubsystemResponse> {
       // Implementation
     }
   }
   ```

2. Register the handler in the `DomainHandlerFactory` class:
   ```typescript
   registerHandlers() {
     this.handlers.set('newDomainHandler', new NewDomainHandler());
   }
   ```

3. Update the intent router to route appropriate queries to the new handler:
   ```typescript
   if (message.text.includes('specific keyword')) {
     return {
       routingDecision: SubsystemType.DOMAIN_HANDLER,
       confidence: 0.9,
       domainHandler: 'newDomainHandler'
     };
   }
   ```

### Customizing Orchestration Strategies

To add a new orchestration strategy:

1. Add the strategy to the `HybridStrategy` enum in `core/types.ts`:
   ```typescript
   export enum HybridStrategy {
     // Existing strategies
     NEW_STRATEGY = 'NEW_STRATEGY'
   }
   ```

2. Implement the strategy in `agents/hybrid-orchestrator.ts`:
   ```typescript
   private newStrategyOrchestration(
     primaryResponse: SubsystemResponse,
     secondaryResponses: SubsystemResponse[],
     sessionId: string
   ): OrchestrationResult {
     // Implementation
   }
   ```

3. Add the strategy to the orchestration method:
   ```typescript
   switch (strategy) {
     // Existing cases
     case HybridStrategy.NEW_STRATEGY:
       return this.newStrategyOrchestration(primaryResponse, secondaryResponses, sessionId);
   }
   ```

## Common Development Issues

### TypeScript Module Resolution

If you encounter errors like `Unknown file extension ".ts"`, ensure:
- Your `tsconfig.json` is correctly configured for ESM modules
- You're using the correct import syntax (`.js` extension in import statements)
- The `type` field in `package.json` is set to `"module"`

### Environment Configuration

If the application fails to start due to missing environment variables:
- Check that your `.env` file contains all required variables
- Verify that the environment variables are correctly loaded
- For deployment, ensure environment variables are set in the deployment environment

### API Connection Issues

If you're having trouble connecting to the Vertex AI API:
- Verify your credentials file is correctly referenced
- Check that the Vertex AI API is enabled in your GCP project
- Ensure your GCP project has billing enabled
- Check the GCP console for any API quota issues

## Best Practices

### Code Style

- Follow the TypeScript coding guidelines
- Use ESLint to ensure code quality:
  ```bash
  npm run lint
  ```
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### Git Workflow

1. Create a feature branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make small, focused commits with descriptive messages:
   ```bash
   git commit -m "Add new domain handler for frame material recommendations"
   ```

3. Push your branch and create a pull request:
   ```bash
   git push -u origin feature/your-feature-name
   ```

4. Ensure all tests pass before merging

### Documentation

- Update documentation when making significant changes
- Document new features, APIs, and configuration options
- Keep the README.md up to date with the latest information

## Additional Resources

- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)