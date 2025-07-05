# Shopify Adapter Implementation Prompt

## Context
We are implementing a new adapter for Shopify integration with the Eyewear ML system. 
The adapter needs to handle product synchronization, order management, and customer data.

## Current Architecture
Our existing adapters follow this pattern:
```typescript
export interface PlatformAdapter {
  connect(): Promise<ConnectionStatus>;
  syncProducts(products: Product[]): Promise<SyncResult>;
  processOrders(): Promise<OrderResult[]>;
  handleWebhooks(payload: any): Promise<WebhookResult>;
}

export interface ConnectionStatus {
  connected: boolean;
  storeUrl?: string;
  errorMessage?: string;
  lastConnected?: Date;
}

export interface SyncResult {
  success: boolean;
  itemsProcessed: number;
  itemsFailed: number;
  errors: SyncError[];
}

export interface OrderResult {
  orderId: string;
  status: 'processed' | 'failed';
  errorMessage?: string;
}

export interface WebhookResult {
  processed: boolean;
  eventType: string;
  errorMessage?: string;
}
```

## Shopify-Specific Requirements

1. **Authentication Method**
   - Implement OAuth 2.0 flow with Shopify
   - Store and refresh access tokens securely
   - Handle scope permissions for products, orders, and customers

2. **Product Synchronization**
   - Map our `Product` model to Shopify's product structure
   - Handle variants, options, and images
   - Support inventory location management
   - Implement metafield support for eyewear-specific attributes

3. **Order Processing**
   - Retrieve orders with eyewear products
   - Handle prescription data as order attributes
   - Support fulfillment status updates

4. **Webhook Management**
   - Register required webhooks with the Shopify store
   - Handle product, inventory, and order webhooks
   - Implement webhook verification using HMAC signatures

5. **Error Handling**
   - Implement Shopify-specific error mapping
   - Handle API rate limiting with exponential backoff
   - Log detailed error information for troubleshooting

## Implementation Constraints

1. **Performance Requirements**
   - Sync operations should be optimized for large catalogs (5000+ products)
   - Implement batching with configurable batch size
   - Support parallelization where appropriate

2. **Logging Requirements**
   - Log all API interactions at DEBUG level
   - Log errors at ERROR level with detailed context
   - Include request IDs in all logs

3. **GDPR Compliance**
   - Implement data minimization for customer information
   - Support data deletion requests
   - Document all stored customer data

## Shopify API Reference

Here are the key Shopify API endpoints and models that need to be integrated:

### Product API

```typescript
// Shopify Product Model
interface ShopifyProduct {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  created_at: string;
  handle: string;
  variants: ShopifyVariant[];
  options: ShopifyOption[];
  images: ShopifyImage[];
  image: ShopifyImage;
}

interface ShopifyVariant {
  id: number;
  product_id: number;
  title: string;
  price: string;
  sku: string;
  inventory_quantity: number;
  inventory_management: string;
  inventory_item_id: number;
  option1: string;
  option2: string;
  option3: string;
}

// Key Product Endpoints
// GET /admin/api/2023-07/products.json
// GET /admin/api/2023-07/products/{product_id}.json
// POST /admin/api/2023-07/products.json
// PUT /admin/api/2023-07/products/{product_id}.json
// DELETE /admin/api/2023-07/products/{product_id}.json
```

### Order API

```typescript
// Shopify Order Model
interface ShopifyOrder {
  id: number;
  name: string;
  email: string;
  created_at: string;
  line_items: ShopifyLineItem[];
  shipping_address: ShopifyAddress;
  billing_address: ShopifyAddress;
  financial_status: string;
  fulfillment_status: string;
  note_attributes: ShopifyAttribute[];
}

interface ShopifyLineItem {
  id: number;
  product_id: number;
  variant_id: number;
  title: string;
  quantity: number;
  price: string;
  properties: ShopifyProperty[];
}

// Key Order Endpoints
// GET /admin/api/2023-07/orders.json
// GET /admin/api/2023-07/orders/{order_id}.json
// POST /admin/api/2023-07/orders/{order_id}/fulfillments.json
```

### Webhook API

```typescript
// Shopify Webhook Model
interface ShopifyWebhook {
  id: number;
  address: string;
  topic: string;
  format: string;
  created_at: string;
  updated_at: string;
}

// Key Webhook Endpoints
// GET /admin/api/2023-07/webhooks.json
// POST /admin/api/2023-07/webhooks.json
// DELETE /admin/api/2023-07/webhooks/{webhook_id}.json
```

## Our Product Model

```typescript
export interface Product {
  id: string;
  name: string;
  description: string;
  brand: string;
  sku: string;
  frameType: string;
  frameMaterial: string;
  frameShape: string;
  frameColor: string;
  lensWidth: number;
  bridgeWidth: number;
  templeLength: number;
  rimType: 'full' | 'semi' | 'rimless';
  faceShapeCompatibility: string[];
  price: number;
  compareAtPrice?: number;
  images: ProductImage[];
  variants: ProductVariant[];
  tags: string[];
  isActive: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  position: number;
  alt?: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  color: string;
  size?: string;
  price: number;
  compareAtPrice?: number;
  inventoryQuantity: number;
  isActive: boolean;
}
```

## Expected Output

Please provide a complete implementation of the ShopifyAdapter class that implements the PlatformAdapter interface. Include:

1. The complete TypeScript implementation with proper types and error handling
2. JSDoc comments for public methods and complex logic
3. Implementation for all required interface methods
4. Shopify-specific helper methods as needed
5. Proper error handling and logging

## Additional Notes

- We use axios for HTTP requests
- We use Winston for logging
- Authentication tokens are stored in a secure TokenManager service
- The adapter should be designed for server-side Node.js environments
- Include unit tests for critical functionality
