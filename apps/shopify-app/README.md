# EyewearML Shopify App

This is a Shopify app that integrates with SKU-Genie to synchronize product data between Shopify and the EyewearML platform.

## Features

- OAuth authentication with Shopify
- Automatic product synchronization between Shopify and SKU-Genie
- Webhook handling for real-time updates
- Customizable product field mapping
- Detailed sync logs and error reporting
- Support for bidirectional synchronization

## Prerequisites

- Node.js 16+
- MongoDB 4.4+
- Shopify Partner account
- SKU-Genie API access

## Installation

1. Clone the repository
2. Navigate to the app directory: `cd apps/shopify-app`
3. Install dependencies: `npm install`
4. Copy the example environment file: `cp .env.example .env`
5. Update the environment variables in the `.env` file
6. Start the server: `npm start`

## Environment Variables

- `SHOPIFY_API_KEY`: Your Shopify API key
- `SHOPIFY_API_SECRET`: Your Shopify API secret
- `SHOPIFY_API_SCOPES`: Comma-separated list of scopes required by the app
- `SHOPIFY_APP_URL`: The URL where your app is hosted
- `PORT`: The port to run the server on
- `NODE_ENV`: The environment (development, production)
- `SESSION_SECRET`: Secret for session encryption
- `MONGODB_URI`: MongoDB connection URI
- `SKU_GENIE_API_URL`: URL of the SKU-Genie API
- `SKU_GENIE_API_KEY`: API key for SKU-Genie
- `LOG_LEVEL`: Logging level (debug, info, warn, error)

## Development

For local development, you can use ngrok to expose your local server to the internet:

```bash
ngrok http 3000
```

Then update the `SHOPIFY_APP_URL` in your `.env` file with the ngrok URL.

## Project Structure

- `server.js`: Main entry point
- `routes/`: API routes
  - `auth.js`: Authentication routes
  - `webhooks.js`: Webhook handlers
  - `products.js`: Product management routes
  - `settings.js`: App settings routes
- `models/`: MongoDB models
  - `Shop.js`: Shop model
  - `Product.js`: Product model
  - `SyncJob.js`: Synchronization job model
- `services/`: Business logic
  - `productService.js`: Product synchronization service
  - `skuGenieApi.js`: SKU-Genie API client
- `middleware/`: Express middleware
  - `auth.js`: Authentication middleware
- `utils/`: Utility functions
  - `logger.js`: Logging utility
- `config/`: Configuration files

## Webhooks

The app registers the following webhooks:

- `PRODUCTS_CREATE`: Triggered when a product is created in Shopify
- `PRODUCTS_UPDATE`: Triggered when a product is updated in Shopify
- `PRODUCTS_DELETE`: Triggered when a product is deleted in Shopify
- `APP_UNINSTALLED`: Triggered when the app is uninstalled from a shop

## Synchronization

The app supports three types of synchronization:

1. **Webhook Sync**: Real-time sync triggered by Shopify webhooks
2. **Manual Sync**: User-initiated sync for specific products
3. **Full Sync**: User-initiated sync for all products

## Product Mapping

The app allows customizing how Shopify product fields map to SKU-Genie fields. The default mapping is:

- `title` → `title`
- `description` → `description`
- `vendor` → `brand`
- `productType` → `frameShape`
- `tags` → `tags`

## License

MIT