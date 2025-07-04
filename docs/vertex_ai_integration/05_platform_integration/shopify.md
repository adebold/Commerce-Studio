# Shopify Integration for Vertex AI Shopping Assistant

## Overview

This guide provides specific instructions for integrating the Vertex AI Shopping Assistant with Shopify. The integration connects your Shopify product catalog with the enhanced conversational AI capabilities, allowing Vertex AI to recommend products with domain-specific expertise.

## Prerequisites

* Shopify Admin API access
* Shopify store with product catalog
* API credentials (API Key and Password or Custom App with access tokens)
* Vertex AI project setup

## Integration Architecture

```
┌────────────────┐     ┌───────────────────┐      ┌────────────────┐
│                │     │                   │      │                │
│  Shopify Store ├────►│ Product Catalog   ├─────►│  Vertex AI    │
│  (Products)    │     │ Adapter           │      │  Shopping     │
│                │     │                   │      │  Assistant    │
└────────────────┘     └───────────────────┘      └────────────────┘
                               ▲
                               │
                        ┌──────┴──────┐
                        │  Domain     │
                        │  Expertise  │
                        │  Injection  │
                        └─────────────┘
```

## Setup Steps

### 1. Create a Private App in Shopify (Preferred Method)

1. Log in to your Shopify admin panel
2. Navigate to **Apps > Manage private apps**
3. Click **Create new private app**
4. Fill in the app details:
   * Name: "Vertex AI Integration"
   * Emergency developer email: [your email]
5. Set the required permissions:
   * Products: Read access
   * Product listings: Read access
   * Inventory: Read access
   * Collections: Read access
   * Orders: Read access (if order history is needed)
   * Customers: Read access (if customer data is needed)
6. Save and create the app
7. Note the **API Key** and **Password** for configuration

### 2. Configure Shopify Connector

Create a configuration file for the Shopify connection:

```javascript
// config/shopify_connection.js
module.exports = {
  shopName: process.env.SHOPIFY_SHOP_NAME || 'your-store-name',
  apiKey: process.env.SHOPIFY_API_KEY,
  password: process.env.SHOPIFY_PASSWORD,
  apiVersion: process.env.SHOPIFY_API_VERSION || '2023-10',
  
  // Caching settings
  cacheEnabled: true,
  cacheTTL: 3600 * 1000, // 1 hour in milliseconds
  
  // Polling settings for product updates
  pollingEnabled: true,
  pollingInterval: 15 * 60 * 1000, // 15 minutes in milliseconds
  
  // Domain-specific settings
  domainSpecificAttributes: {
    metafieldNamespaces: ['eyewear', 'product_info'],
    tagPrefixes: ['face_shape:', '${SHOPIFY_SECRET}:', 'frame_material:']
  }
};
```

### 3. Set Up Environment Variables

Store sensitive credentials in environment variables:

```bash
# .env file
SHOPIFY_SHOP_NAME=your-store-name
SHOPIFY_API_KEY=your-api-key
SHOPIFY_PASSWORD=your-api-password
SHOPIFY_API_VERSION=2023-10
```

### 4. Shopify Product Data Structure

The integration maps Shopify's product data structure to our standardized schema:

| Shopify Field | Standard Schema Field | Notes |
|---------------|----------------------|-------|
| `id` | `id` | Converted to string |
| `title` | `title` | - |
| `body_html` | `description` | HTML stripped for clean text |
| `variants[0].price` | `price.amount` | First variant price as default |
| `variants[0].compare_at_price` | `price.compareAtPrice` | For sale pricing |
| `images` | `images` | Mapped to standard image schema |
| `handle` | Used to construct `url` | Combined with store URL |
| `variants` | `variants` | Mapped to standard variant schema |
| `tags` | `attributes.general.tags` | Array of tags |
| `metafields` | Domain-specific attributes | Filtered by namespace |

## Shopify-Specific Attribute Mapping

Shopify stores domain-specific attributes in two main ways:

### 1. Metafields

The most structured way to store domain-specific attributes in Shopify is through metafields. Our integration looks for these namespaces:

* `eyewear` - Primary namespace for eyewear-specific attributes
* `product_info` - General product information that may contain domain attributes

Example metafields for eyewear:

```json
{
  "namespace": "eyewear",
  "key": "${SHOPIFY_SECRET}",
  "value": "rectangular",
  "type": "single_line_text_field"
}

{
  "namespace": "eyewear",
  "key": "frame_material",
  "value": "acetate",
  "type": "single_line_text_field"
}

{
  "namespace": "eyewear",
  "key": "recommended_face_shapes",
  "value": "round,oval,heart",
  "type": "list.single_line_text_field"
}
```

### 2. Tags with Prefixes

Shopify tags can be used to store domain-specific attributes using a prefix pattern:

* `face_shape:round`
* `${SHOPIFY_SECRET}:rectangular`
* `frame_material:acetate`
* `lens_type:progressive`

The Product Catalog Adapter parses these tags and adds them to the appropriate domain-specific attributes.

## Implementation Example

Here's how to use the Shopify connector to fetch products:

```javascript
const ShopifyConnector = require('./connectors/shopify_connector');
const config = require('./config/shopify_connection');

// Initialize the connector
const shopifyConnector = new ShopifyConnector(config);

// Fetch products
async function fetchProducts() {
  try {
    // Get all products
    const products = await shopifyConnector.fetchProducts();
    console.log(`Fetched ${products.length} products from Shopify`);
    
    // Get a specific product
    const productId = '1234567890';
    const singleProduct = await shopifyConnector.fetchProductById(productId);
    console.log(`Fetched product: ${singleProduct.title}`);
    
    // Search products by specific criteria
    const searchResults = await shopifyConnector.searchProducts({
      tag: '${SHOPIFY_SECRET}:rectangular'
    });
    console.log(`Found ${searchResults.length} rectangular frames`);
    
    return products;
  } catch (error) {
    console.error('Error fetching Shopify products:', error);
    throw error;
  }
}
```

## Adding Domain-Specific Attributes to Shopify

For optimal integration, you should add domain-specific attributes to your Shopify products. Here's how:

### Option 1: Using the Shopify Admin UI

1. Go to the product you want to update
2. Scroll down to the "Metafields" section
3. Add a new metafield with:
   * Namespace: `eyewear`
   * Key: the attribute name (e.g., `${SHOPIFY_SECRET}`)
   * Value: the attribute value (e.g., `rectangular`)
   * Type: Single line text or appropriate type

### Option 2: Using the Shopify API

You can programmatically add metafields:

```javascript
const addMetafields = async (productId, metafields) => {
  try {
    const response = await axios({
      method: 'POST',
      url: `https://${config.shopName}.myshopify.com/admin/api/${config.apiVersion}/products/${productId}/metafields.json`,
      headers: {
        'Content-Type': 'application/json'
      },
      auth: {
        username: config.apiKey,
        password: config.password
      },
      data: {
        metafield: metafields
      }
    });
    
    return response.data.metafield;
  } catch (error) {
    console.error('Error adding metafield:', error);
    throw error;
  }
};

// Example usage
addMetafields('1234567890', {
  namespace: 'eyewear',
  key: '${SHOPIFY_SECRET}',
  value: 'rectangular',
  type: 'single_line_text_field'
});
```

### Option 3: Using Tags

You can also add domain-specific attributes as tags in the Shopify admin:

1. Go to the product you want to update
2. In the "Tags" field, add tags with the format: `prefix:value`
3. Example tags: `${SHOPIFY_SECRET}:rectangular`, `face_shape:round`, `frame_material:acetate`

## Shopify GraphQL API (Alternative Approach)

For more advanced queries, especially involving metafields, you can use Shopify's GraphQL API:

```javascript
const shopifyGraphQLQuery = async (query, variables = {}) => {
  try {
    const response = await axios({
      method: 'POST',
      url: `https://${config.shopName}.myshopify.com/admin/api/${config.apiVersion}/graphql.json`,
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': config.password
      },
      data: {
        query,
        variables
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('GraphQL Error:', error);
    throw error;
  }
};

// Example GraphQL query that includes metafields
const query = `
query GetProductWithMetafields($id: ID!) {
  product(id: $id) {
    id
    title
    description
    tags
    metafields(first: 20, namespace: "eyewear") {
      edges {
        node {
          namespace
          key
          value
        }
      }
    }
  }
}
`;

// Example usage
const fetchProductWithMetafields = async (productId) => {
  const gid = `gid://shopify/Product/${productId}`;
  const result = await shopifyGraphQLQuery(query, { id: gid });
  return result.data.product;
};
```

## Webhook Setup for Real-Time Updates

To keep your product data in sync with Vertex AI, set up Shopify webhooks:

1. In your Shopify admin, go to **Settings > Notifications > Webhooks**
2. Create webhooks for:
   * Product creation: `products/create`
   * Product update: `products/update`
   * Product deletion: `products/delete`
3. Set the webhook URL to your integration endpoint
4. Choose the format as JSON

## Handling Webhook Events

```javascript
app.post('/webhooks/shopify/products', express.json(), async (req, res) => {
  const topic = req.header('X-Shopify-Topic');
  const shopifyHmac = req.header('X-Shopify-Hmac-Sha256');
  
  // Verify webhook signature (important for security)
  if (!verifyShopifyWebhook(req.body, shopifyHmac, SHOPIFY_WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid webhook signature');
  }
  
  try {
    switch (topic) {
      case 'products/create':
      case 'products/update':
        await updateProductInCache(req.body);
        break;
      case 'products/delete':
        await removeProductFromCache(req.body.id);
        break;
      default:
        console.log(`Unhandled webhook topic: ${topic}`);
    }
    
    res.status(200).send('Webhook processed');
  } catch (error) {
    console.error(`Error processing webhook: ${error.message}`);
    res.status(500).send('Error processing webhook');
  }
});
```

## Shopify Product Caching Strategy

To optimize performance and reduce API calls:

1. **Initial Cache Population**
   * Fetch all products and metafields during startup
   * Transform to the standardized format
   * Store in memory or Redis cache

2. **Cache Invalidation**
   * Use webhooks to update specific products in real-time
   * Implement a full refresh based on a configurable interval

3. **Cache Implementation Example**

```javascript
class ShopifyProductCache {
  constructor(connector, options = {}) {
    this.connector = connector;
    this.cache = new Map();
    this.lastUpdated = null;
    this.ttl = options.ttl || 3600000; // 1 hour default
    this.isPopulating = false;
  }
  
  async getProduct(productId) {
    // Check if cache is valid
    if (this.shouldRefreshCache()) {
      await this.populateCache();
    }
    
    // Try to get from cache
    if (this.cache.has(productId)) {
      return this.cache.get(productId);
    }
    
    // Fetch individual product if not in cache
    const product = await this.connector.fetchProductById(productId);
    const standardizedProduct = this.connector.transformToStandardFormat([product])[0];
    this.cache.set(productId, standardizedProduct);
    
    return standardizedProduct;
  }
  
  async populateCache() {
    if (this.isPopulating) return;
    
    this.isPopulating = true;
    try {
      const products = await this.connector.fetchProducts({ limit: 250 });
      const standardizedProducts = this.connector.transformToStandardFormat(products);
      
      // Clear and repopulate cache
      this.cache.clear();
      standardizedProducts.forEach(product => {
        this.cache.set(product.id, product);
      });
      
      this.lastUpdated = Date.now();
    } catch (error) {
      console.error('Error populating cache:', error);
    } finally {
      this.isPopulating = false;
    }
  }
  
  shouldRefreshCache() {
    return !this.lastUpdated || (Date.now() - this.lastUpdated > this.ttl);
  }
  
  updateProduct(productData) {
    const standardizedProduct = this.connector.transformToStandardFormat([productData])[0];
    this.cache.set(standardizedProduct.id, standardizedProduct);
  }
  
  removeProduct(productId) {
    this.cache.delete(productId);
  }
}
```

## Best Practices for Shopify Integration

1. **Respect API Rate Limits**
   * Shopify has rate limits of 2 requests per second for most API endpoints
   * Implement backoff strategies for retries
   * Use bulk operations for large datasets

2. **Efficient Data Fetching**
   * Only request fields you need
   * Use GraphQL for complex queries with many related resources
   * Leverage cursor-based pagination for large catalogs

3. **Security Considerations**
   * Store API credentials securely in environment variables
   * Verify webhook signatures to prevent spoofing
   * Use HTTPS for all communications

4. **Shopify Metafields Best Practices**
   * Use semantic namespace and key names
   * Choose appropriate value types (string, integer, json_string)
   * Consider using metafield definitions for structured data

## Troubleshooting Common Issues

### Authentication Errors

```
{ errors: "Invalid API key or access token" }
```

**Solution**: Check your API key and password in environment variables. Ensure private app permissions are correctly set.

### Rate Limit Exceeded

```
{ errors: "Exceeded 2 calls per second for api client. Reduce request rates to resume uninterrupted service." }
```

**Solution**: Implement exponential backoff and retry logic:

```javascript
const fetchWithRetry = async (fn, maxRetries = 3) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.response && error.response.status === 429) {
        // Rate limit exceeded
        const retryAfter = error.response.headers['retry-after'] || (2 ** i);
        console.log(`Rate limited. Retrying after ${retryAfter} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        lastError = error;
      } else {
        throw error;
      }
    }
  }
  
  throw lastError;
};
```

### Missing Domain-Specific Attributes

If you're not seeing domain-specific attributes in your standardized products:

1. Check metafield namespaces match your configuration
2. Verify tag prefixes are correctly formatted
3. Check API permissions include access to metafields
4. For GraphQL, ensure metafields are explicitly requested

## Next Steps

After setting up the Shopify integration:

1. Connect the [Product Catalog Adapter](../04_product_catalog_adapter.md) to transform Shopify data
2. Implement [Domain Expertise Injection](../03_domain_expertise_injection.md) to enhance responses
3. Set up the [Intent Router](../02_intent_routing.md) to handle user queries appropriately
4. Use the [Prompt Engineering](../06_prompt_engineering/pre_purchase_prompts.md) templates to create customized prompts

For WooCommerce integration, see the [WooCommerce guide](./woocommerce.md).
