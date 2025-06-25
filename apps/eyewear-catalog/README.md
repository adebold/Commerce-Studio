# Eyewear Catalog Shopify App

A Shopify application for integrating and synchronizing an eyewear database with Shopify stores. This app enables eyewear retailers to seamlessly import and maintain their product catalog from a central eyewear database.

## Features

- Authentication with Shopify OAuth
- Automatic synchronization of eyewear products
- Product import with customizable options
- Scheduled sync jobs with cron expressions
- Webhook handling for Shopify events
- Detailed sync history and statistics
- Cache management for API performance
- MongoDB integration for data persistence

## Installation

### Prerequisites

- Node.js 14+
- MongoDB 4.4+
- Shopify Partner account
- Shopify API credentials

### Setup

1. Clone the repository
2. Install dependencies:

```bash
cd apps/eyewear-catalog
npm install
```

3. Create a `.env` file based on `.env.example`:

```
# Shopify API
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SHOPIFY_API_VERSION=2023-07
SHOPIFY_APP_HOST=https://your-app-domain.com

# Eyewear Database API
EYEWEAR_DB_API_URL=https://api.eyewear-database.com
EYEWEAR_DB_API_KEY=your_api_key
EYEWEAR_DB_API_VERSION=v1
EYEWEAR_DB_TIMEOUT=30000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/eyewear-catalog

# App Settings
PORT=3000
SESSION_SECRET=your_session_secret
NODE_ENV=development
ALLOWED_ORIGINS=https://admin.shopify.com
```

4. Initialize the database:

```bash
npm run db:setup
```

5. Start the application:

```bash
npm start
```

## Architecture

The application follows a modular architecture with clear separation of concerns:

- **Server** (`server.js`): Express application entry point
- **Services**: Business logic and external API communication
  - `eyewear-service.js`: Interface to the eyewear database API
  - `shopify-service.js`: Interface to the Shopify API
  - `sync-service.js`: Manages data synchronization processes
- **Routes**: API endpoints for the application
  - `auth.js`: Authentication endpoints
  - `webhooks.js`: Shopify webhook handlers
  - `sync.js`: Synchronization control endpoints
- **Utils**: Shared utilities
  - `db.js`: Database access layer
  - `logger.js`: Logging utility

## API Endpoints

### Authentication

- `GET /auth/status` - Check authentication status
- `POST /auth/logout` - Logout user
- `GET /auth/session` - Get current session data
- `GET /auth/check` - Verify authentication status with redirect
- `POST /auth/validate-session` - Validate session and refresh if needed

### Shopify Integration

- `GET /shopify/install` - Start Shopify OAuth installation
- `GET /shopify/callback` - Handle Shopify OAuth callback
- `GET /shopify/products` - Get products from Shopify
- `GET /shopify/collections` - Get collections from Shopify

### Synchronization

- `GET /api/sync/status` - Get sync status for the current shop
- `POST /api/sync/start` - Start a sync process
- `POST /api/sync/cancel` - Cancel a running sync process
- `GET /api/sync/settings` - Get sync settings for the shop
- `POST /api/sync/settings` - Update sync settings for the shop
- `POST /api/sync/product` - Sync a single product
- `GET /api/sync/history` - Get sync history for the shop
- `GET /api/sync/stats` - Get sync statistics for the shop

### Catalog Management

- `GET /api/catalog/brands` - Get all brands
- `GET /api/catalog/brands/:brandId/products` - Get products for a brand
- `GET /api/catalog/products/:productId` - Get product details
- `GET /api/catalog/products/sku/:sku` - Get product by SKU
- `GET /api/catalog/search` - Search products
- `GET /api/catalog/filters` - Get available filters

### Webhooks

- `POST /webhooks/app/uninstalled` - Handle app uninstalled webhook
- `POST /webhooks/products/create` - Handle products/create webhook
- `POST /webhooks/products/update` - Handle products/update webhook
- `POST /webhooks/products/delete` - Handle products/delete webhook

## Synchronization Process

The app supports both manual and scheduled synchronization processes:

### Manual Sync

1. Initiated through the `POST /api/sync/start` endpoint
2. Fetches brands from the eyewear database
3. For each brand, fetches products in paginated requests
4. For each product, checks if it exists in Shopify
   - If it doesn't exist, imports it
   - If it exists, updates it (unless configured to skip existing)
5. Tracks progress and statistics throughout the process
6. Provides real-time status updates

### Scheduled Sync

1. Configure through the `POST /api/sync/settings` endpoint with a cron expression
2. The system automatically runs the sync process at the scheduled time
3. Follows the same steps as manual sync
4. Records results in the sync history

## Error Handling

The application implements robust error handling:

- API errors are captured and logged
- Sync errors are recorded but don't stop the overall process
- Import errors are tracked at the product level
- Webhooks always respond with 200 OK to acknowledge receipt

## Development

### Testing

Run tests:

```bash
npm test
```

### Linting

Run ESLint:

```bash
npm run lint
```

### Development Server

Start the development server with auto-reload:

```bash
npm run dev
```

## License

This project is proprietary and confidential. Unauthorized copying or distribution is prohibited.

Copyright © 2025 VARAi Commerce Team