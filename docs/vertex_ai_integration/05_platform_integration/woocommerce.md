# WooCommerce Integration for Vertex AI Shopping Assistant

## Overview

This guide provides specific instructions for integrating the Vertex AI Shopping Assistant with WooCommerce. The integration connects your WooCommerce product catalog with the enhanced conversational AI capabilities, allowing Vertex AI to recommend products with domain-specific expertise.

## Prerequisites

* WordPress site with WooCommerce installed and configured
* WooCommerce REST API access
* Consumer key and secret for API authentication
* Vertex AI project setup

## Integration Architecture

```
┌────────────────┐     ┌───────────────────┐      ┌────────────────┐
│                │     │                   │      │                │
│  WooCommerce   ├────►│ Product Catalog   ├─────►│  Vertex AI    │
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

### 1. Create API Keys in WooCommerce

1. Log in to your WordPress admin panel
2. Navigate to **WooCommerce > Settings > Advanced > REST API**
3. Click **Add key**
4. Fill in the key details:
   * Description: "Vertex AI Integration"
   * User: Select an admin user
   * Permissions: Read (if you only need to fetch products) or Read/Write (if you need to update products)
5. Click **Generate API key**
6. Note the **Consumer Key** and **Consumer Secret** for configuration

### 2. Configure WooCommerce Connector

Create a configuration file for the WooCommerce connection:

```javascript
// config/woocommerce_connection.js
module.exports = {
  url: process.env.WOOCOMMERCE_URL || 'https://your-store.com',
  consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
  consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
  version: process.env.WOOCOMMERCE_API_VERSION || 'wc/v3',
  
  // Caching settings
  cacheEnabled: true,
  cacheTTL: 3600 * 1000, // 1 hour in milliseconds
  
  // Polling settings for product updates
  pollingEnabled: true,
  pollingInterval: 15 * 60 * 1000, // 15 minutes in milliseconds
  
  // Domain-specific settings
  domainSpecificAttributes: {
    attributePrefixes: ['pa_frame', 'pa_lens', 'pa_face_shape'],
    customFieldPrefixes: ['eyewear_', 'frame_', 'lens_'],
    customFieldKeys: ['frame_shape', 'frame_material', 'lens_type', 'face_shape_fit']
  }
};
```

### 3. Set Up Environment Variables

Store sensitive credentials in environment variables:

```bash
# .env file
WOOCOMMERCE_URL=https://your-store.com
WOOCOMMERCE_CONSUMER_KEY=your-consumer-key
WOOCOMMERCE_CONSUMER_SECRET=your-consumer-secret
WOOCOMMERCE_API_VERSION=wc/v3
```

### 4. WooCommerce Product Data Structure

The integration maps WooCommerce's product data structure to our standardized schema:

| WooCommerce Field | Standard Schema Field | Notes |
|-------------------|----------------------|-------|
| `id` | `id` | Converted to string |
| `name` | `title` | - |
| `description` | `description` | HTML stripped for clean text |
| `price` | `price.amount` | - |
| `regular_price` | `price.compareAtPrice` | For sale pricing |
| `images` | `images` | Mapped to standard image schema |
| `permalink` | `url` | Full product URL |
| `variations` | `variants` | Mapped to standard variant schema |
| `categories` | `attributes.general.collections` | Category information |
| `tags` | `attributes.general.tags` | Array of tags |
| `attributes` | Domain-specific attributes | Filtered by attribute prefix |
| `meta_data` | Domain-specific attributes | Filtered by custom field prefixes |

## WooCommerce-Specific Attribute Mapping

WooCommerce stores domain-specific attributes in three main ways:

### 1. Product Attributes

WooCommerce uses product attributes, which can be global or product-specific:

```json
"attributes": [
  {
    "id": 1,
    "name": "Frame Shape",
    "position": 0,
    "visible": true,
    "variation": false,
    "options": ["Rectangular", "Square", "Round"]
  },
  {
    "id": 2,
    "name": "Frame Material",
    "position": 1,
    "visible": true,
    "variation": true,
    "options": ["Acetate", "Metal", "Titanium"]
  }
]
```

For taxonomy-based attributes (product attributes that have been added to the shop), they use the `pa_` prefix in the slug:

```json
"attributes": [
  {
    "id": 1,
    "name": "Frame Shape",
    "slug": "pa_frame-shape",
    "position": 0,
    "visible": true,
    "variation": false,
    "options": ["rectangular", "square", "round"]
  }
]
```

### 2. Custom Fields (Meta Data)

WooCommerce also supports custom fields through the `meta_data` array:

```json
"meta_data": [
  {
    "id": 5021,
    "key": "eyewear_frame_shape",
    "value": "rectangular"
  },
  {
    "id": 5022,
    "key": "eyewear_recommended_face_shapes",
    "value": "round,oval,heart"
  }
]
```

### 3. Product Categories and Tags

Standard WooCommerce categories and tags can also contain domain information:

```json
"categories": [
  {
    "id": 34,
    "name": "Rectangular Frames",
    "slug": "rectangular-frames"
  },
  {
    "id": 36,
    "name": "Full-Rim",
    "slug": "full-rim"
  }
],
"tags": [
  {
    "id": 45,
    "name": "Metal",
    "slug": "metal"
  },
  {
    "id": 46,
    "name": "For Round Faces",
    "slug": "for-round-faces"
  }
]
```

## Implementation Example

Here's how to use the WooCommerce connector to fetch products:

```javascript
const WooCommerceRestApi = require('@woocommerce/woocommerce-rest-api').default;
const WooCommerceConnector = require('./connectors/woocommerce_connector');
const config = require('./config/woocommerce_connection');

// Initialize the connector
const wooCommerceConnector = new WooCommerceConnector(config);

// Fetch products
async function fetchProducts() {
  try {
    // Get all products
    const products = await wooCommerceConnector.fetchProducts();
    console.log(`Fetched ${products.length} products from WooCommerce`);
    
    // Get a specific product
    const productId = '1234';
    const singleProduct = await wooCommerceConnector.fetchProductById(productId);
    console.log(`Fetched product: ${singleProduct.name}`);
    
    // Search products by specific criteria
    const searchResults = await wooCommerceConnector.searchProducts({
      attribute: 'pa_frame-shape',
      attribute_term: 'rectangular'
    });
    console.log(`Found ${searchResults.length} rectangular frames`);
    
    return products;
  } catch (error) {
    console.error('Error fetching WooCommerce products:', error);
    throw error;
  }
}
```

## Adding Domain-Specific Attributes to WooCommerce

For optimal integration, you should add domain-specific attributes to your WooCommerce products. Here are the methods:

### Option 1: Adding Product Attributes

1. Create Global Attributes:
   * Go to **Products > Attributes**
   * Add new attributes like "Frame Shape" or "Face Shape Fit"
   * Add terms to each attribute (e.g., "rectangular", "round" for Frame Shape)

2. Assign Attributes to Products:
   * Edit a product
   * Scroll to the "Product data" section
   * Click the "Attributes" tab
   * Add the attributes and select values

### Option 2: Adding Custom Fields

1. Using ACF (Advanced Custom Fields) Plugin:
   * Install and activate the ACF plugin
   * Create a field group for eyewear products
   * Add fields like "Frame Shape", "Frame Material", etc.
   * Set the field group to display on product edit screens

2. Manual Custom Fields:
   * Edit a product
   * Scroll to the bottom of the editor
   * Expand the "Custom fields" section
   * Add new custom fields with keys like "eyewear_frame_shape"

### Option 3: Using Categories and Tags

1. Create Categories for Domain Attributes:
   * Go to **Products > Categories**
   * Create categories that represent domain-specific groupings

2. Add Relevant Tags:
   * Go to **Products > Tags**
   * Create tags that represent domain-specific attributes
   * Apply these tags to products

## Implementation Details

### WooCommerce Connector Class

```javascript
// src/conversational_ai/integrations/vertex_ai/connectors/woocommerce_connector.js
class WooCommerceConnector {
  constructor(config) {
    this.url = config.url;
    this.version = config.version || 'wc/v3';
    this.domainSpecificAttributes = config.domainSpecificAttributes || {};
    
    // Initialize WooCommerce REST API client
    this.wooCommerce = new WooCommerceRestApi({
      url: this.url,
      consumerKey: config.consumerKey,
      consumerSecret: config.consumerSecret,
      version: this.version,
      queryStringAuth: true // Force Basic Authentication as query string
    });
  }
  
  async fetchProducts(options = {}) {
    const params = {
      per_page: options.limit || 50,
      page: options.page || 1,
      status: 'publish'
    };
    
    if (options.category) {
      params.category = options.category;
    }
    
    if (options.tag) {
      params.tag = options.tag;
    }
    
    try {
      const response = await this.wooCommerce.get('products', params);
      return response.data;
    } catch (error) {
      console.error('Error fetching products from WooCommerce:', error);
      throw error;
    }
  }
  
  async fetchProductById(productId) {
    try {
      const response = await this.wooCommerce.get(`products/${productId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${productId} from WooCommerce:`, error);
      throw error;
    }
  }
  
  async searchProducts(filters) {
    const params = {
      per_page: 100,
      status: 'publish'
    };
    
    if (filters.attribute && filters.attribute_term) {
      params.attribute = filters.attribute;
      params.attribute_term = filters.attribute_term;
    }
    
    if (filters.category) {
      params.category = filters.category;
    }
    
    if (filters.tag) {
      params.tag = filters.tag;
    }
    
    if (filters.search) {
      params.search = filters.search;
    }
    
    try {
      const response = await this.wooCommerce.get('products', params);
      return response.data;
    } catch (error) {
      console.error('Error searching products in WooCommerce:', error);
      throw error;
    }
  }
  
  transformToStandardFormat(rawProducts) {
    // Transform WooCommerce-specific product data to standard format
    return rawProducts.map(rawProduct => {
      // Extract common properties
      const standardProduct = {
        id: rawProduct.id.toString(),
        title: rawProduct.name,
        description: this.stripHtmlTags(rawProduct.description),
        price: this.extractPrice(rawProduct),
        images: this.extractImages(rawProduct),
        url: rawProduct.permalink,
        variants: this.extractVariants(rawProduct),
        attributes: this.extractAttributes(rawProduct)
      };
      
      return standardProduct;
    });
  }
  
  stripHtmlTags(html) {
    return html.replace(/<[^>]*>?/gm, '');
  }
  
  extractPrice(rawProduct) {
    let price = {
      amount: 0,
      currency: 'USD', // WooCommerce doesn't include currency in product data by default
      compareAtPrice: null
    };
    
    price.amount = parseFloat(rawProduct.price);
    
    // Use regular_price as compareAtPrice if product is on sale
    if (rawProduct.on_sale && rawProduct.regular_price) {
      price.compareAtPrice = parseFloat(rawProduct.regular_price);
    }
    
    return price;
  }
  
  extractImages(rawProduct) {
    const images = [];
    
    if (rawProduct.images && rawProduct.images.length > 0) {
      rawProduct.images.forEach((image, index) => {
        images.push({
          id: image.id.toString(),
          url: image.src,
          alt: image.alt || '',
          position: index
        });
      });
    }
    
    return images;
  }
  
  extractVariants(rawProduct) {
    const variants = [];
    
    // If it's a variable product and has variations
    if (rawProduct.type === 'variable' && rawProduct.variations && rawProduct.variations.length > 0) {
      // Note: variations in the main product response are just IDs
      // We'd need to fetch each variation separately for complete data
      // This would need to be implemented with separate API calls
      
      // For simplicity, we just use the IDs here
      // In a real implementation, you'd fetch the variation details
      rawProduct.variations.forEach(variationId => {
        variants.push({
          id: variationId.toString(),
          // These fields would normally come from fetching the variation
          title: `Variation ${variationId}`,
          price: {
            amount: parseFloat(rawProduct.price),
            currency: 'USD',
            compareAtPrice: null
          },
          available: true
        });
      });
    }
    
    return variants;
  }
  
  extractAttributes(rawProduct) {
    const attributes = {
      general: {},
      eyewear: {}
    };
    
    // Extract categories
    if (rawProduct.categories && rawProduct.categories.length > 0) {
      attributes.general.categories = rawProduct.categories.map(cat => cat.name);
    }
    
    // Extract tags
    if (rawProduct.tags && rawProduct.tags.length > 0) {
      attributes.general.tags = rawProduct.tags.map(tag => tag.name);
    }
    
    // Extract product type
    if (rawProduct.type) {
      attributes.general.productType = rawProduct.type;
    }
    
    // Extract product attributes
    if (rawProduct.attributes && rawProduct.attributes.length > 0) {
      rawProduct.attributes.forEach(attr => {
        // Check if this is a domain-specific attribute
        const isEyewearAttribute = 
          (attr.slug && this.domainSpecificAttributes.attributePrefixes.some(prefix => 
            attr.slug.startsWith(prefix)
          )) ||
          (attr.name && attr.name.toLowerCase().includes('frame') || 
           attr.name.toLowerCase().includes('lens') || 
           attr.name.toLowerCase().includes('face'));
        
        if (isEyewearAttribute) {
          // Convert to camelCase and standardize
          const key = this.camelCase(attr.name);
          const value = attr.options && attr.options.length > 0 ? 
                       attr.options.join(', ') : '';
          
          attributes.eyewear[key] = value;
        } else {
          // Add as general attribute
          const key = this.camelCase(attr.name);
          const value = attr.options && attr.options.length > 0 ? 
                       attr.options.join(', ') : '';
          
          attributes.general[key] = value;
        }
      });
    }
    
    // Extract custom fields (meta_data)
    if (rawProduct.meta_data && rawProduct.meta_data.length > 0) {
      rawProduct.meta_data.forEach(meta => {
        // Check if this is a domain-specific custom field
        const isEyewearField = 
          this.domainSpecificAttributes.customFieldPrefixes.some(prefix => 
            meta.key.startsWith(prefix)
          ) ||
          this.domainSpecificAttributes.customFieldKeys.includes(meta.key);
        
        if (isEyewearField) {
          // Convert to camelCase and standardize
          const key = this.camelCase(meta.key.replace(/^eyewear_/, ''));
          attributes.eyewear[key] = meta.value;
        } else {
          // Add as general attribute
          attributes.general[meta.key] = meta.value;
        }
      });
    }
    
    return attributes;
  }
  
  camelCase(str) {
    return str
      .toLowerCase()
      .replace(/[_-]([a-z])/g, (_, letter) => letter.toUpperCase())
      .replace(/\s+([a-z])/g, (_, letter) => letter.toUpperCase())
      .replace(/\s+/g, '')
      .replace(/^[A-Z]/, letter => letter.toLowerCase());
  }
}
```

## Webhook Setup for Real-Time Updates

To keep your product data in sync with Vertex AI, set up WooCommerce webhooks:

1. In your WordPress admin, go to **WooCommerce > Settings > Advanced > Webhooks**
2. Click **Add webhook**
3. Fill in the webhook details:
   * Name: "Vertex AI Product Update"
   * Status: Active
   * Topic: Choose appropriate topics:
     * `product.created`
     * `product.updated`
     * `product.deleted`
   * Delivery URL: Your integration endpoint
   * Secret: Generate a secure secret key
4. Click **Save webhook**

## Handling Webhook Events

```javascript
app.post('/webhooks/woocommerce/products', express.json(), async (req, res) => {
  const wooTopic = req.header('X-WC-Webhook-Topic');
  const wooSignature = req.header('X-WC-Webhook-Signature');
  
  // Verify webhook signature
  if (!verifyWooCommerceWebhook(req.rawBody, wooSignature, WOO_WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid webhook signature');
  }
  
  try {
    const productData = req.body;
    
    switch (wooTopic) {
      case 'product.created':
      case 'product.updated':
        await updateProductInCache(productData);
        break;
      case 'product.deleted':
        await removeProductFromCache(productData.id);
        break;
      default:
        console.log(`Unhandled webhook topic: ${wooTopic}`);
    }
    
    res.status(200).send('Webhook processed');
  } catch (error) {
    console.error(`Error processing webhook: ${error.message}`);
    res.status(500).send('Error processing webhook');
  }
});

// Verify WooCommerce webhook signature
function verifyWooCommerceWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('base64');
  return signature === digest;
}
```

## Integrating WooCommerce with Advanced Custom Fields (ACF)

For more structured domain-specific attributes, consider using ACF:

### 1. Set Up ACF for Eyewear Products

1. Install and activate ACF plugin
2. Create a field group named "Eyewear Attributes"
3. Add fields:
   * Frame Shape (Select)
   * Frame Material (Select)
   * Recommended Face Shapes (Checkbox)
   * Lens Type (Select)
   * Technical Features (Checkbox)
4. Set location rules to show field group when "Post Type is equal to Product"

### 2. Access ACF Fields in the WooCommerce Connector

Add code to extract ACF fields from the meta data:

```javascript
// Add this method to the WooCommerceConnector class
extractACFFields(rawProduct) {
  // ACF fields are stored in meta_data but with acf_ prefix
  const acfFields = {};
  
  if (rawProduct.meta_data && rawProduct.meta_data.length > 0) {
    // Look for meta fields that store ACF data
    const acfMeta = rawProduct.meta_data.find(meta => meta.key === '_eyewear_attributes');
    
    if (acfMeta && acfMeta.value) {
      try {
        // ACF sometimes stores data as a serialized string
        const acfData = typeof acfMeta.value === 'string' ? 
                       JSON.parse(acfMeta.value) : acfMeta.value;
        
        // Map ACF fields to our standard attributes
        if (acfData.frame_shape) {
          acfFields.frameShape = acfData.frame_shape;
        }
        
        if (acfData.frame_material) {
          acfFields.frameMaterial = acfData.frame_material;
        }
        
        if (acfData.recommended_face_shapes) {
          acfFields.recommendedFaceShapes = acfData.recommended_face_shapes;
        }
        
        // Add other ACF fields as needed
      } catch (error) {
        console.error('Error parsing ACF data', error);
      }
    }
  }
  
  return acfFields;
}
```

## Best Practices for WooCommerce Integration

1. **Optimize API Requests**
   * WooCommerce API has relatively lower rate limits than some platforms
   * Implement caching for product data
   * Use batched requests when possible

2. **Data Validation**
   * Validate product data before processing
   * Handle missing fields gracefully
   * Use sensible defaults for missing values

3. **Security Considerations**
   * Store API credentials securely in environment variables
   * Verify webhook signatures to prevent spoofing
   * Use HTTPS for all communications

4. **Product Variations Handling**
   * WooCommerce variations require separate API calls
   * Consider eagerly loading variations for key products
   * Cache variation data to improve performance

## Troubleshooting Common Issues

### Authentication Errors

```
{
  "code": "woocommerce_rest_authentication_error",
  "message": "Invalid authentication credentials"
}
```

**Solution**: Double-check your consumer key and secret. Make sure they are correctly set in environment variables and that the API key permissions are set correctly.

### API Throttling

WooCommerce uses WordPress REST API rate limiting, which may throttle requests if too many are made in a short period.

**Solution**: Implement a request queue with exponential backoff:

```javascript
class RequestQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.retryDelay = 1000; // Start with 1 second delay
  }
  
  async add(requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ requestFn, resolve, reject });
      this.process();
    });
  }
  
  async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    const { requestFn, resolve, reject } = this.queue.shift();
    
    try {
      const result = await requestFn();
      this.retryDelay = 1000; // Reset retry delay after success
      resolve(result);
    } catch (error) {
      if (error.response && error.response.status === 429) {
        // Rate limited - add back to queue with exponential backoff
        console.log(`Rate limited. Retrying in ${this.retryDelay}ms...`);
        setTimeout(() => {
          this.queue.unshift({ requestFn, resolve, reject });
          this.retryDelay *= 2; // Exponential backoff
        }, this.retryDelay);
      } else {
        // Other error - reject the promise
        reject(error);
      }
    } finally {
      this.processing = false;
      // Wait a bit before processing next request
      setTimeout(() => this.process(), 100);
    }
  }
}
```

### Missing Custom Fields or Attributes

If custom fields or attributes aren't appearing in your standardized products:

1. Check ACF field names match what you're looking for
2. Verify product attributes are set to "visible" in WooCommerce
3. Ensure your domain-specific attribute mapping configuration is correct

## Next Steps

After setting up the WooCommerce integration:

1. Connect the [Product Catalog Adapter](../04_product_catalog_adapter.md) to transform WooCommerce data
2. Implement [Domain Expertise Injection](../03_domain_expertise_injection.md) to enhance responses
3. Set up the [Intent Router](../02_intent_routing.md) to handle user queries appropriately
4. Use the [Prompt Engineering](../06_prompt_engineering/pre_purchase_prompts.md) templates to create customized prompts

For Shopify integration, see the [Shopify guide](./shopify.md).
