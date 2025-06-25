# Vertex AI Shopping Assistant for Shopify

This integration connects your Shopify store to Google's Vertex AI Shopping Assistant API, enabling AI-powered product recommendations and natural language search for eyewear products.

## Overview

The Vertex AI Shopping Assistant integration allows your customers to:

- Search for products using natural language queries
- Get personalized product recommendations based on specific needs
- Receive expert advice about eyewear based on face shape, style preferences, and more
- Find products with specific features or attributes

## Requirements

- A Shopify store with eyewear products
- Google Cloud Platform account with Vertex AI API access
- Node.js 18+ and npm/yarn
- Shopify API credentials

## Installation

1. Clone this repository into your Shopify app project
2. Install dependencies:

```bash
cd apps/shopify
npm install
# Or if using yarn
yarn install
```

3. Configure your environment variables (see Configuration section)
4. Deploy to your hosting environment or run locally for development

## Configuration

Create a `.env` file in the root directory with the following variables:

```
# Shopify Configuration
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
SHOP_DOMAIN=your-store.myshopify.com
HOST_NAME=your-app-hostname.com

# Vertex AI Configuration
VERTEX_AI_CLIENT_ID=your_vertex_ai_client_id
VERTEX_AI_CLIENT_SECRET=your_vertex_ai_client_secret
VERTEX_AI_PROJECT_ID=your_gcp_project_id
VERTEX_AI_LOCATION=us-central1
VERTEX_AI_ENDPOINT_ID=shopping-assistant-endpoint

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379
```

## Components

### Product Catalog Adapter

The `ProductCatalogAdapter` transforms Shopify product data into a standardized format that the Vertex AI Shopping Assistant can use. It handles:

- Fetching products from Shopify API
- Transforming product data
- Extracting eyewear-specific attributes
- Caching for performance optimization

### Vertex AI Connector

The `VertexAIConnector` handles communication with the Vertex AI API:

- Authentication with Google Cloud
- Sending queries to the Shopping Assistant
- Processing response data
- Integrating with product catalog

### Shopping Assistant UI Component

The `ShoppingAssistant` React component provides a user-friendly chat interface:

- Real-time messaging with the AI assistant
- Display of product recommendations
- Product details view
- Suggested follow-up questions

## Usage Examples

### Demo Script

Run the demo script to test the integration from the command line:

```bash
node scripts/vertex-ai-demo.js
```

### Adding to Shopify Theme

Add the Shopping Assistant component to your Shopify theme:

```jsx
import { ShoppingAssistant } from './components/ShoppingAssistant';

function MyShopifyPage() {
  return (
    <div>
      {/* Your page content */}
      
      <ShoppingAssistant 
        shopDomain={process.env.SHOP_DOMAIN}
        welcomeMessage="Hi! How can I help you find the perfect eyewear today?"
        autoOpen={false}
      />
    </div>
  );
}
```

### API Endpoint

The API endpoint can be used to integrate with any frontend:

```javascript
// Example API request
const response = await fetch('/api/shopping-assistant', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: "I'm looking for sunglasses for a round face",
    sessionId: "unique_session_id",
    shopDomain: "your-store.myshopify.com"
  })
});

const data = await response.json();
console.log(data.response); // AI response text
console.log(data.products); // Recommended products
```

## Customization

### Appearance

The Shopping Assistant UI can be customized with the following props:

- `primaryColor`: Main color for the chat button and user messages
- `secondaryColor`: Background color for the chat window
- `buttonLabel`: Text displayed in the chat header
- `avatarUrl`: Image URL for the chat button avatar
- `userAvatarUrl`: Image URL for the user's avatar in the chat
- `assistantAvatarUrl`: Image URL for the assistant's avatar in the chat
- `position`: Position of the chat button ('bottom-right', 'bottom-left', 'top-right', 'top-left')

### Behavior

Customize the behavior with these props:

- `autoOpen`: Whether the chat window should open automatically
- `initialMessage`: First message displayed when the chat opens
- `initialContext`: Additional context to provide to the AI

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify your Vertex AI credentials are correct
   - Ensure your GCP project has the Shopping Assistant API enabled

2. **Product Data Issues**
   - Check that your products have the necessary attributes for eyewear
   - Ensure metafields are properly configured for specialized eyewear data

3. **Performance Problems**
   - Enable caching by setting `VERTEX_AI_CACHE_ENABLED=true`
   - Adjust cache TTL with `VERTEX_AI_CACHE_TTL` (seconds)

### Logs

Check the application logs for detailed error information. The integration uses Winston for logging, and messages are tagged with appropriate categories.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
