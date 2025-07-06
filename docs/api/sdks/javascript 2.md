# VARAi JavaScript SDK

The VARAi JavaScript SDK provides a convenient way to interact with the VARAi API from JavaScript applications, both in the browser and Node.js environments.

## Table of Contents

1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Authentication](#authentication)
4. [API Reference](#api-reference)
   - [Frames](#frames)
   - [Recommendations](#recommendations)
   - [Users](#users)
   - [Analytics](#analytics)
5. [Examples](#examples)
6. [Error Handling](#error-handling)
7. [TypeScript Support](#typescript-support)
8. [Browser Support](#browser-support)

## Installation

### Using npm

```bash
npm install @varai/sdk
```

### Using yarn

```bash
yarn add @varai/sdk
```

### Using CDN

```html
<script src="https://cdn.varai.ai/sdk/v1/varai.min.js"></script>
```

## Configuration

### Basic Configuration

```javascript
// ES Modules
import { VaraiClient } from '@varai/sdk';

// CommonJS
const { VaraiClient } = require('@varai/sdk');

// Create a client instance
const varai = new VaraiClient({
  apiKey: '${APIKEY_2537}',
  environment: 'production' // 'production', 'staging', or 'development'
});
```

### Advanced Configuration

```javascript
const varai = new VaraiClient({
  apiKey: '${APIKEY_2537}',
  environment: 'production',
  timeout: 30000, // Request timeout in milliseconds (default: 30000)
  retries: 3, // Number of retry attempts for failed requests (default: 3)
  baseUrl: 'https://api.custom-domain.com/v1', // Custom API URL (optional)
  headers: { // Additional headers to include with every request (optional)
    'X-Custom-Header': 'custom-value'
  }
});
```

## Authentication

### API Key Authentication

```javascript
// API key authentication (recommended for server-side applications)
const varai = new VaraiClient({
  apiKey: '${APIKEY_2537}'
});
```

### Bearer Token Authentication

```javascript
// Bearer token authentication (recommended for user-specific operations)
const varai = new VaraiClient({
  bearerToken: 'user_jwt_token'
});
```

### OAuth 2.0 Authentication

```javascript
// OAuth 2.0 authentication (for web applications)
const varai = new VaraiClient();

// Redirect the user to the authorization URL
const authUrl = varai.auth.getAuthorizationUrl({
  clientId: 'your_client_id',
  redirectUri: 'https://your-app.com/callback',
  scope: ['frames:read', 'recommendations:read'],
  state: 'random_state_string'
});

window.location.href = authUrl;

// In your callback handler
const { code } = getQueryParams();

// Exchange the authorization code for tokens
const tokens = await varai.auth.exchangeCodeForTokens({
  clientId: 'your_client_id',
  clientSecret: '${JAVASCRIPT_SECRET_1}',
  code,
  redirectUri: 'https://your-app.com/callback'
});

// Configure the client with the access token
varai.setAccessToken(tokens.accessToken);

// Store the refresh token securely
storeRefreshToken(tokens.refreshToken);

// When the access token expires, use the refresh token to get a new one
const newTokens = await varai.auth.refreshTokens({
  clientId: 'your_client_id',
  clientSecret: '${JAVASCRIPT_SECRET_1}',
  refreshToken: storedRefreshToken
});

// Update the client with the new access token
varai.setAccessToken(newTokens.accessToken);
```

## API Reference

### Frames

#### List Frames

```javascript
// List frames with optional filtering
const response = await varai.frames.list({
  brand: 'RayBender', // Filter by brand (optional)
  style: 'round', // Filter by style (optional)
  material: 'acetate', // Filter by material (optional)
  color: 'tortoise', // Filter by color (optional)
  minPrice: 50, // Minimum price (optional)
  maxPrice: 200, // Maximum price (optional)
  faceShape: 'oval', // Filter by suitable face shape (optional)
  page: 1, // Page number (default: 1)
  limit: 20 // Results per page (default: 20, max: 100)
});

const { frames, pagination } = response;

// Access frame data
frames.forEach(frame => {
  console.log(frame.name, frame.brand, frame.price);
});

// Access pagination data
console.log(`Showing ${frames.length} of ${pagination.total} frames`);
console.log(`Page ${pagination.page} of ${pagination.pages}`);
```

#### Get Frame Details

```javascript
// Get details for a specific frame
const frame = await varai.frames.get('f12345');

console.log(frame.name, frame.brand, frame.price);
console.log(frame.dimensions);
console.log(frame.colors);
```

#### Search Frames

```javascript
// Search frames by text query
const results = await varai.frames.search('blue round glasses');

console.log(`Found ${results.length} frames matching the query`);
```

### Recommendations

#### Generate Recommendations

```javascript
// Generate personalized recommendations
const recommendations = await varai.recommendations.generate({
  userId: 'u78901', // User ID for personalized recommendations (optional)
  faceShape: 'oval', // User's face shape (optional)
  preferences: { // User preferences (optional)
    styles: ['round', 'cat-eye'],
    materials: ['acetate'],
    colors: ['black', 'tortoise'],
    priceRange: {
      min: 80,
      max: 200
    }
  },
  limit: 10 // Maximum number of recommendations (default: 10, max: 50)
});

// Access recommendation data
recommendations.forEach(recommendation => {
  console.log(recommendation.frame.name, recommendation.score, recommendation.reasoning);
});
```

#### Analyze Face Image

```javascript
// Analyze a face image
const analysis = await varai.recommendations.analyzeFace({
  image: imageFile, // File object or Blob
  // OR
  imageUrl: 'https://example.com/face.jpg' // URL of the image
});

console.log(analysis.faceShape);
console.log(analysis.features);
console.log(analysis.styleAttributes);
```

#### Style-Based Recommendations

```javascript
// Get style-based recommendations
const recommendations = await varai.recommendations.getStyleBased({
  textQuery: 'Modern, lightweight frames with a blue tint',
  // OR
  referenceImageUrl: 'https://example.com/reference-image.jpg',
  // OR
  styleTags: ['modern', 'lightweight', 'blue']
});

// Access recommendation data
recommendations.forEach(recommendation => {
  console.log(recommendation.frame.name, recommendation.score);
});
```

### Users

#### Get User Profile

```javascript
// Get the current user's profile
const user = await varai.users.getCurrentUser();

console.log(user.email, user.firstName, user.lastName);
console.log(user.preferences);
console.log(user.measurements);
```

#### Update User Preferences

```javascript
// Update user preferences
const updatedUser = await varai.users.updatePreferences('u78901', {
  styles: ['round', 'cat-eye', 'rectangle'],
  materials: ['acetate', 'metal'],
  colors: ['black', 'tortoise', 'gold'],
  priceRange: {
    min: 100,
    max: 300
  }
});

console.log('User preferences updated:', updatedUser.preferences);
```

### Analytics

#### Get User Analytics

```javascript
// Get user analytics data
const analytics = await varai.analytics.getUsers({
  timeRange: '7d' // '24h', '7d', '30d', or '90d'
});

console.log(analytics.dailyActiveUsers);
```

#### Get Recommendation Analytics

```javascript
// Get recommendation analytics data
const analytics = await varai.analytics.getRecommendations({
  timeRange: '30d' // '24h', '7d', '30d', or '90d'
});

console.log(analytics.conversionRate);
console.log(analytics.topRecommendedFrames);
```

## Examples

### Browser Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VARAi SDK Example</title>
  <script src="https://cdn.varai.ai/sdk/v1/varai.min.js"></script>
</head>
<body>
  <h1>VARAi SDK Example</h1>
  <div id="frames-container"></div>

  <script>
    // Initialize the client
    const varai = new VaraiClient({
      apiKey: '${APIKEY_2537}'
    });

    // Fetch and display frames
    async function displayFrames() {
      try {
        const { frames } = await varai.frames.list({
          limit: 10
        });

        const container = document.getElementById('frames-container');
        
        frames.forEach(frame => {
          const frameElement = document.createElement('div');
          frameElement.innerHTML = `
            <h2>${frame.name}</h2>
            <p>Brand: ${frame.brand}</p>
            <p>Price: $${frame.price}</p>
            <img src="${frame.imageUrl}" alt="${frame.name}" width="200">
          `;
          container.appendChild(frameElement);
        });
      } catch (error) {
        console.error('Error fetching frames:', error);
      }
    }

    // Call the function when the page loads
    window.addEventListener('DOMContentLoaded', displayFrames);
  </script>
</body>
</html>
```

### Node.js Example

```javascript
const { VaraiClient } = require('@varai/sdk');
const fs = require('fs');

async function analyzeAndRecommend() {
  try {
    // Initialize the client
    const varai = new VaraiClient({
      apiKey: '${APIKEY_2537}'
    });

    // Read the image file
    const imageFile = fs.readFileSync('face.jpg');

    // Analyze the face
    const analysis = await varai.recommendations.analyzeFace({
      image: imageFile
    });

    console.log('Face Shape:', analysis.faceShape);
    console.log('Features:', analysis.features);

    // Generate recommendations based on the analysis
    const recommendations = await varai.recommendations.generate({
      faceShape: analysis.faceShape,
      preferences: {
        styles: analysis.styleAttributes.styleTags,
        priceRange: {
          min: 50,
          max: 300
        }
      },
      limit: 5
    });

    console.log('Top Recommendations:');
    recommendations.forEach((recommendation, index) => {
      console.log(`${index + 1}. ${recommendation.frame.name} - $${recommendation.frame.price}`);
      console.log(`   Score: ${recommendation.score}`);
      console.log(`   Reasoning: ${recommendation.reasoning}`);
      console.log('');
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

analyzeAndRecommend();
```

## Error Handling

The SDK throws standardized errors that you can catch and handle in your application:

```javascript
try {
  const frame = await varai.frames.get('non_existent_id');
} catch (error) {
  if (error.type === 'not_found') {
    console.error('Frame not found');
  } else if (error.type === 'authentication_error') {
    console.error('Authentication failed:', error.message);
  } else if (error.type === 'rate_limit_error') {
    console.error('Rate limit exceeded. Retry after:', error.retryAfter);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Error Types

| Error Type | Description |
|------------|-------------|
| `authentication_error` | Authentication failed |
| `permission_error` | Insufficient permissions |
| `validation_error` | Invalid request parameters |
| `not_found` | Resource not found |
| `rate_limit_error` | Rate limit exceeded |
| `server_error` | Server error |
| `network_error` | Network error |
| `timeout_error` | Request timed out |

## TypeScript Support

The SDK includes TypeScript definitions for all methods and models:

```typescript
import { VaraiClient, Frame, Recommendation, User } from '@varai/sdk';

const varai = new VaraiClient({
  apiKey: '${APIKEY_2537}'
});

async function getFrameDetails(frameId: string): Promise<Frame> {
  return await varai.frames.get(frameId);
}

async function generateRecommendations(userId: string): Promise<Recommendation[]> {
  const response = await varai.recommendations.generate({
    userId
  });
  return response;
}

async function updateUserPreferences(userId: string, preferences: User['preferences']): Promise<User> {
  return await varai.users.updatePreferences(userId, preferences);
}
```

## Browser Support

The SDK supports all modern browsers:

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 16+

For older browsers, you may need to use a polyfill for features like `fetch` and `Promise`.