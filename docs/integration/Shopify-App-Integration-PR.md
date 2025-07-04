# Shopify App Integration for SKU-Genie

## Overview

This PR adds a Shopify app integration for SKU-Genie, allowing seamless synchronization of product data between Shopify stores and the EyewearML platform. The integration enables eyewear retailers to manage their product catalog in one place while keeping their Shopify store up-to-date.

## Features

- **OAuth Authentication**: Secure authentication with Shopify using OAuth 2.0
- **Bidirectional Sync**: Support for syncing products from Shopify to SKU-Genie, SKU-Genie to Shopify, or both
- **Real-time Updates**: Webhook integration for immediate updates when products change
- **Customizable Field Mapping**: Flexible mapping between Shopify and SKU-Genie product fields
- **Detailed Sync Logs**: Comprehensive logging and error reporting for troubleshooting
- **Batch Operations**: Efficient handling of large product catalogs

## Implementation Details

### Architecture

The Shopify app is built as a Node.js application using Express, with MongoDB for data storage. It communicates with both the Shopify API and the SKU-Genie API to synchronize product data.

### Components

- **Authentication System**: Handles OAuth flow with Shopify and maintains shop sessions
- **Webhook Handlers**: Process real-time events from Shopify
- **Product Synchronization Service**: Maps and transfers product data between systems
- **Admin Interface**: Allows retailers to configure sync settings and monitor sync status

### Data Models

- **Shop**: Stores Shopify shop information and app settings
- **Product**: Maintains a local cache of products with mapping to SKU-Genie IDs
- **SyncJob**: Tracks synchronization jobs with detailed progress and error reporting

## Testing

The integration has been tested with:
- Various Shopify store configurations
- Different product types and attributes
- Error scenarios (network issues, validation failures)
- Large product catalogs (1000+ products)

## Deployment

The Shopify app can be deployed as a standalone service or integrated with the existing SKU-Genie infrastructure. It requires:
- Node.js 16+
- MongoDB 4.4+
- Network access to both Shopify and SKU-Genie APIs

## Future Improvements

- Add support for syncing collections and inventory
- Implement a more sophisticated conflict resolution system
- Add analytics for sync performance and error trends
- Create a dedicated admin dashboard UI

## Documentation

Comprehensive documentation is included in the app's README file, covering:
- Installation and configuration
- API endpoints
- Webhook handling
- Synchronization process
- Troubleshooting