# Configuration Guide

This guide provides detailed information about configuring the Vertex AI Shopping Assistant integration. It covers environment variables, tenant configuration, and customization options.

## Environment Variables

The integration uses environment variables for configuration. These can be set in a `.env` file in the root directory of the project or directly in the environment where the application runs.

### Core Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to the Google Cloud service account key file | - | Yes |
| `GOOGLE_CLOUD_PROJECT` | Google Cloud project ID | - | Yes |
| `VERTEX_AI_LOCATION` | Google Cloud region for Vertex AI | `us-central1` | Yes |
| `VERTEX_AI_MODEL_ID` | Vertex AI model ID | `shopping-assistant` | Yes |
| `VERTEX_AI_PUBLISHER` | Vertex AI model publisher | `google` | Yes |
| `PORT` | Port for the HTTP server | `3000` | No |
| `NODE_ENV` | Environment (development, production, test) | `development` | No |
| `LOG_LEVEL` | Logging level (debug, info, warn, error) | `info` | No |

### Advanced Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DEFAULT_TENANT_ID` | Default tenant ID to use when none is specified | `default` | No |
| `ENABLE_METRICS` | Enable performance metrics collection | `true` | No |
| `METRICS_RETENTION_DAYS` | Number of days to retain metrics data | `30` | No |
| `RESPONSE_TIMEOUT_MS` | Timeout for API responses in milliseconds | `10000` | No |
| `MAX_CONCURRENT_REQUESTS` | Maximum number of concurrent requests | `50` | No |
| `CACHE_TTL_SECONDS` | Time-to-live for cached responses in seconds | `300` | No |

### Voice Interaction Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `ENABLE_VOICE_INTERACTION` | Enable voice interaction features | `false` | No |
| `VOICE_SYNTHESIS_PROVIDER` | Provider for text-to-speech (google, nvidia) | `google` | No* |
| `GOOGLE_TTS_VOICE` | Google TTS voice name | `en-US-Neural2-F` | No* |
| `GOOGLE_TTS_LANGUAGE_CODE` | Google TTS language code | `en-US` | No* |
| `NVIDIA_RIVA_ENDPOINT` | NVIDIA Riva API endpoint | - | No* |
| `NVIDIA_RIVA_VOICE` | NVIDIA Riva voice name | - | No* |

*Required if voice interaction is enabled with the respective provider.

### Face Analysis Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `ENABLE_FACE_ANALYSIS` | Enable face analysis features | `false` | No |
| `FACE_ANALYSIS_API_ENDPOINT` | Endpoint for face analysis service | `http://localhost:3001/api/face-analysis` | No* |
| `FACE_ANALYSIS_CONFIDENCE_THRESHOLD` | Minimum confidence threshold for face shape detection | `0.7` | No |
| `STORE_FACE_ANALYSIS_RESULTS` | Whether to store face analysis results | `true` | No |

*Required if face analysis is enabled.

## .env File Example

```
# Google Cloud Credentials
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
GOOGLE_CLOUD_PROJECT=eyewear-ml-project

# Vertex AI Configuration
VERTEX_AI_LOCATION=us-central1
VERTEX_AI_MODEL_ID=shopping-assistant
VERTEX_AI_PUBLISHER=google

# Server Configuration
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

# Feature Flags
ENABLE_VOICE_INTERACTION=true
ENABLE_FACE_ANALYSIS=true

# Voice Configuration
VOICE_SYNTHESIS_PROVIDER=google
GOOGLE_TTS_VOICE=en-US-Neural2-F
GOOGLE_TTS_LANGUAGE_CODE=en-US

# Face Analysis Configuration
FACE_ANALYSIS_API_ENDPOINT=http://localhost:3001/api/face-analysis
FACE_ANALYSIS_CONFIDENCE_THRESHOLD=0.7
```

## Tenant Configuration

The integration supports multi-tenant configuration through JSON files in the `config/tenants` directory. Each tenant has its own configuration file named `{tenant-id}.json`.

### Tenant Configuration Structure

```json
{
  "tenantId": "default",
  "displayName": "Default Tenant",
  "branding": {
    "primaryColor": "#007bff",
    "secondaryColor": "#6c757d",
    "logo": "https://example.com/logo.png",
    "favicon": "https://example.com/favicon.ico"
  },
  "routing": {
    "defaultStrategy": "HYBRID",
    "confidenceThreshold": 0.7,
    "domainHandlerWeighting": 0.6
  },
  "voice": {
    "enabled": true,
    "provider": "google",
    "voice": "en-US-Neural2-F",
    "languageCode": "en-US",
    "speed": 1.0,
    "pitch": 0.0
  },
  "faceAnalysis": {
    "enabled": true,
    "confidenceThreshold": 0.7,
    "storeResults": true
  },
  "productCatalog": {
    "source": "shopify",
    "apiEndpoint": "https://example.myshopify.com/admin/api/2023-01/graphql.json",
    "refreshIntervalMinutes": 60
  },
  "chatInterface": {
    "initialMessage": "Hi! I'm your eyewear shopping assistant. How can I help you today?",
    "suggestedQuestions": [
      "What frames suit a round face?",
      "Do you have titanium frames?",
      "Can I try on glasses virtually?"
    ],
    "position": "bottom-right",
    "avatarEnabled": true,
    "avatarImage": "https://example.com/avatar.png"
  }
}
```

### Tenant Configuration Options

#### Core Settings

| Option | Description | Default |
|--------|-------------|---------|
| `tenantId` | Unique identifier for the tenant | Required |
| `displayName` | Human-readable name for the tenant | Required |

#### Branding

| Option | Description | Default |
|--------|-------------|---------|
| `branding.primaryColor` | Primary brand color (hex) | `#007bff` |
| `branding.secondaryColor` | Secondary brand color (hex) | `#6c757d` |
| `branding.logo` | URL to the tenant's logo | - |
| `branding.favicon` | URL to the tenant's favicon | - |

#### Routing

| Option | Description | Default |
|--------|-------------|---------|
| `routing.defaultStrategy` | Default orchestration strategy (HYBRID, ENHANCE_RESPONSE, MERGE, SEQUENCE, PRIORITIZE, BRIDGE) | `HYBRID` |
| `routing.confidenceThreshold` | Minimum confidence threshold for intent routing | `0.7` |
| `routing.domainHandlerWeighting` | Weighting factor for domain handler responses | `0.6` |

#### Voice

| Option | Description | Default |
|--------|-------------|---------|
| `voice.enabled` | Enable voice interaction for this tenant | `false` |
| `voice.provider` | Voice provider (google, nvidia) | `google` |
| `voice.voice` | Voice name | `en-US-Neural2-F` |
| `voice.languageCode` | Language code | `en-US` |
| `voice.speed` | Speech rate (0.5 to 2.0) | `1.0` |
| `voice.pitch` | Voice pitch (-10.0 to 10.0) | `0.0` |

#### Face Analysis

| Option | Description | Default |
|--------|-------------|---------|
| `faceAnalysis.enabled` | Enable face analysis for this tenant | `false` |
| `faceAnalysis.confidenceThreshold` | Minimum confidence threshold for face shape detection | `0.7` |
| `faceAnalysis.storeResults` | Whether to store face analysis results | `true` |

#### Product Catalog

| Option | Description | Default |
|--------|-------------|---------|
| `productCatalog.source` | Source of product data (shopify, custom) | `shopify` |
| `productCatalog.apiEndpoint` | API endpoint for product data | - |
| `productCatalog.refreshIntervalMinutes` | How often to refresh product data (minutes) | `60` |

#### Chat Interface

| Option | Description | Default |
|--------|-------------|---------|
| `chatInterface.initialMessage` | Initial message shown to the user | `"Hi! I'm your eyewear shopping assistant. How can I help you today?"` |
| `chatInterface.suggestedQuestions` | Array of suggested questions to show the user | `[]` |
| `chatInterface.position` | Position of the chat widget (bottom-right, bottom-left, top-right, top-left) | `"bottom-right"` |
| `chatInterface.avatarEnabled` | Whether to show an avatar | `false` |
| `chatInterface.avatarImage` | URL to the avatar image | - |

## Runtime Configuration

Some configuration options can be set at runtime when initializing the Shopping Assistant component in a web application:

```javascript
window.ShoppingAssistant({
  shopDomain: "example.myshopify.com",
  container: "shopping-assistant-container",
  primaryColor: "#5c6ac4",
  position: "bottom-right",
  initialMessage: "How can I help you find the perfect eyewear?",
  suggestedQuestions: [
    "What frames suit a round face?",
    "Do you have titanium frames?",
    "Can I try on glasses virtually?"
  ],
  enableVoice: true,
  enableFaceAnalysis: true
});
```

### Runtime Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `shopDomain` | Shopify store domain | Required |
| `container` | ID of the HTML element to mount the component | Required |
| `primaryColor` | Primary color for the chat widget | `#007bff` |
| `position` | Position of the chat widget | `bottom-right` |
| `initialMessage` | Initial message shown to the user | From tenant config |
| `suggestedQuestions` | Array of suggested questions | From tenant config |
| `enableVoice` | Enable voice interaction | From tenant config |
| `enableFaceAnalysis` | Enable face analysis | From tenant config |

## Advanced Configuration

### Logging Configuration

The application uses a structured logging system. You can configure it by modifying the `middleware/logging.ts` file:

```typescript
// Example of custom logging configuration
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp(),
    json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
  ]
});
```

### Performance Monitoring

Performance monitoring can be configured in the `middleware/monitoring.ts` file:

```typescript
// Example of custom monitoring configuration
const monitoringConfig = {
  enableMetrics: process.env.ENABLE_METRICS === 'true',
  retentionDays: parseInt(process.env.METRICS_RETENTION_DAYS || '30', 10),
  samplingRate: 0.1, // Sample 10% of requests
  slowThresholdMs: 500 // Threshold for slow operation alerts
};
```

### Caching Configuration

Response caching can be configured in the `middleware/caching.ts` file:

```typescript
// Example of custom caching configuration
const cacheConfig = {
  ttl: parseInt(process.env.CACHE_TTL_SECONDS || '300', 10),
  maxSize: 1000, // Maximum number of cached items
  excludePaths: ['/api/health', '/api/metrics'] // Paths to exclude from caching
};
```

## Environment-Specific Configuration

### Development Environment

For development, create a `.env.development` file with development-specific settings:

```
NODE_ENV=development
LOG_LEVEL=debug
ENABLE_METRICS=true
```

### Production Environment

For production, create a `.env.production` file with production-specific settings:

```
NODE_ENV=production
LOG_LEVEL=info
ENABLE_METRICS=true
RESPONSE_TIMEOUT_MS=5000
MAX_CONCURRENT_REQUESTS=100
```

### Test Environment

For testing, create a `.env.test` file with test-specific settings:

```
NODE_ENV=test
LOG_LEVEL=error
ENABLE_METRICS=false
```

## Troubleshooting Configuration Issues

### Missing Environment Variables

If the application fails to start due to missing environment variables:

1. Check that your `.env` file exists and contains all required variables
2. Verify that the environment variables are correctly loaded
3. For deployment environments, ensure environment variables are set in the deployment configuration

### Tenant Configuration Issues

If tenant-specific features aren't working correctly:

1. Check that the tenant configuration file exists in `config/tenants/{tenant-id}.json`
2. Verify that the tenant ID is correctly passed in API requests
3. Ensure the tenant configuration has the required properties

### Google Cloud Authentication Issues

If the application can't authenticate with Google Cloud:

1. Verify that the `GOOGLE_APPLICATION_CREDENTIALS` path is correct
2. Check that the service account has the necessary permissions
3. Ensure the `GOOGLE_CLOUD_PROJECT` matches the project ID in the credentials file

## Security Considerations

### Credential Management

- Never commit credentials to version control
- Use environment variables for sensitive information
- Rotate service account keys regularly
- Use the principle of least privilege for service accounts

### API Security

- Use HTTPS for all API endpoints
- Implement proper authentication and authorization
- Validate and sanitize all user inputs
- Set appropriate CORS headers for web clients

## Next Steps

After configuring the integration:

1. Review the [Development Guide](./development.md) for information on local development
2. Check the [Installation Guide](./installation.md) for deployment instructions
3. Explore the [User Guides](../user-guides/) for usage information